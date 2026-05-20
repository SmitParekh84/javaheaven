import { Router, Response } from 'express';
import { connectDB } from '../lib/db';
import UserProfileModel from '../models/UserProfile';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const profile = await UserProfileModel.findOne({ userId: req.user!.id }).lean();
    res.json(profile ?? { userId: req.user!.id, name: '', phone: '', address: '' });
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const { tenantId, name, phone, address } = req.body;
    const profile = await UserProfileModel.findOneAndUpdate(
      { userId: req.user!.id },
      { userId: req.user!.id, tenantId, name, phone, address },
      { upsert: true, new: true }
    );
    res.json(profile);
  } catch {
    res.status(400).json({ error: 'Failed to update profile' });
  }
});

export default router;
