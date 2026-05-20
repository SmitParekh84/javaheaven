import { Router, Response } from 'express';
import { connectDB } from '../lib/db';
import OrderModel from '../models/Order';
import MenuItemModel from '../models/MenuItem';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminRole';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/orders', async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const { tenantId } = req.query;
    const filter = tenantId ? { tenantId } : {};
    const orders = await OrderModel.find(filter).sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.patch('/orders/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const order = await OrderModel.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) { res.status(404).json({ error: 'Order not found' }); return; }
    res.json(order);
  } catch {
    res.status(400).json({ error: 'Failed to update order status' });
  }
});

router.get('/stock', async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const { tenantId } = req.query;
    const filter = tenantId ? { tenantId } : {};
    const items = await MenuItemModel.find(filter)
      .select('name category stock isAvailable')
      .lean();
    res.json(items);
  } catch {
    res.status(500).json({ error: 'Failed to fetch stock' });
  }
});

router.patch('/stock/:id', async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const item = await MenuItemModel.findByIdAndUpdate(
      req.params.id,
      { stock: req.body.stock, isAvailable: req.body.isAvailable },
      { new: true }
    );
    if (!item) { res.status(404).json({ error: 'Item not found' }); return; }
    res.json(item);
  } catch {
    res.status(400).json({ error: 'Failed to update stock' });
  }
});

router.get('/revenue', async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const { tenantId } = req.query;
    const match: Record<string, unknown> = { status: 'paid' };
    if (tenantId) match.tenantId = tenantId;
    const result = await OrderModel.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]);
    res.json(result[0] ?? { total: 0, count: 0 });
  } catch {
    res.status(500).json({ error: 'Failed to fetch revenue' });
  }
});

export default router;
