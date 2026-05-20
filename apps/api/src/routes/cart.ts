import { Router, Response } from 'express';
import { connectDB } from '../lib/db';
import CartModel from '../models/Cart';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const cart = await CartModel.findOne({ userId: req.user!.id }).lean();
    res.json(cart ?? { userId: req.user!.id, items: [] });
  } catch {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const { tenantId, items } = req.body;
    const cart = await CartModel.findOneAndUpdate(
      { userId: req.user!.id },
      { userId: req.user!.id, tenantId, items },
      { upsert: true, new: true }
    );
    res.json(cart);
  } catch {
    res.status(400).json({ error: 'Failed to update cart' });
  }
});

router.delete('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    await CartModel.findOneAndDelete({ userId: req.user!.id });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

export default router;
