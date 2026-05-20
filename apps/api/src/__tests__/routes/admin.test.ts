import request from 'supertest';
import app from '../../app';
import { connectDB } from '../../lib/db';
import OrderModel from '../../models/Order';
import MenuItemModel from '../../models/MenuItem';
import { supabaseAdmin } from '../../lib/supabase';

jest.mock('../../lib/db', () => ({ connectDB: jest.fn() }));
jest.mock('../../models/Order');
jest.mock('../../models/MenuItem');
jest.mock('../../lib/supabase', () => ({
  supabaseAdmin: { auth: { getUser: jest.fn() } },
}));

function mockUser(role: string) {
  (supabaseAdmin.auth.getUser as jest.Mock).mockResolvedValue({
    data: { user: { id: 'uid-1', email: 'a@b.com', app_metadata: { role } } },
    error: null,
  });
}

describe('GET /api/admin/orders', () => {
  it('returns 403 for non-admin user', async () => {
    mockUser('user');
    const res = await request(app)
      .get('/api/admin/orders')
      .set({ Authorization: 'Bearer valid' });
    expect(res.status).toBe(403);
  });

  it('returns orders for admin user', async () => {
    mockUser('admin');
    (OrderModel.find as jest.Mock).mockReturnValue({
      sort: () => ({ lean: () => Promise.resolve([]) }),
    });
    const res = await request(app)
      .get('/api/admin/orders')
      .set({ Authorization: 'Bearer valid' });
    expect(res.status).toBe(200);
  });
});
