import { Router, Request, Response } from 'express';
import { connectDB } from '../lib/db';
import MenuItemModel from '../models/MenuItem';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminRole';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { tenantId } = req.query;
    const filter = tenantId ? { tenantId, isAvailable: true } : { isAvailable: true };
    const items = await MenuItemModel.find(filter).lean();
    res.json(items);
  } catch {
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const item = await MenuItemModel.findById(req.params.id).lean();
    if (!item) { res.status(404).json({ error: 'Item not found' }); return; }
    res.json(item);
  } catch {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

router.post('/', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const item = await MenuItemModel.create(req.body);
    res.status(201).json(item);
  } catch {
    res.status(400).json({ error: 'Failed to create item' });
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const item = await MenuItemModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) { res.status(404).json({ error: 'Item not found' }); return; }
    res.json(item);
  } catch {
    res.status(400).json({ error: 'Failed to update item' });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    await MenuItemModel.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

export default router;
