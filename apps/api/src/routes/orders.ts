import { Router, Response } from 'express';
import { connectDB } from '../lib/db';
import OrderModel from '../models/Order';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const orders = await OrderModel.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const order = await OrderModel.findOne({ _id: req.params.id, userId: req.user!.id }).lean();
    if (!order) { res.status(404).json({ error: 'Order not found' }); return; }
    res.json(order);
  } catch {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;
