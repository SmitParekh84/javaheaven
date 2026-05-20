import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe } from '../lib/stripe';
import { connectDB } from '../lib/db';
import CartModel from '../models/Cart';
import OrderModel from '../models/Order';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/create-checkout', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const { tenantId, successUrl, cancelUrl } = req.body;
    const cart = await CartModel.findOne({ userId: req.user!.id }).lean();

    if (!cart || cart.items.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    const lineItems = cart.items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: `${item.name} (${item.size})` },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url:
        successUrl ??
        `${process.env.FRONTEND_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl ?? `${process.env.FRONTEND_URL}/cart`,
      metadata: { userId: req.user!.id, tenantId: tenantId ?? '' },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) { res.json({ received: true }); return; }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, secret);
  } catch {
    res.status(400).send('Webhook signature verification failed');
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, tenantId } = session.metadata ?? {};

    if (userId) {
      await connectDB();
      const cart = await CartModel.findOne({ userId }).lean();
      if (cart) {
        await OrderModel.create({
          userId,
          tenantId: tenantId ?? '',
          items: cart.items.map((i) => ({
            menuItemId: i.menuItemId,
            name: i.name,
            price: i.price,
            qty: i.qty,
            size: i.size,
          })),
          subtotal: (session.amount_subtotal ?? 0) / 100,
          total: (session.amount_total ?? 0) / 100,
          status: 'paid',
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
        });
        await CartModel.findOneAndDelete({ userId });
      }
    }
  }

  res.json({ received: true });
});

router.get('/session/:sessionId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    await connectDB();
    const order = await OrderModel.findOne({
      stripeCheckoutSessionId: session.id,
    }).lean();
    res.json({ session, order });
  } catch {
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
});

export default router;
