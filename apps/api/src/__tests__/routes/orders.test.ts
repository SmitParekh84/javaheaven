import request from 'supertest';
import app from '../../app';
import { connectDB } from '../../lib/db';
import OrderModel from '../../models/Order';
import { supabaseAdmin } from '../../lib/supabase';

jest.mock('../../lib/db', () => ({ connectDB: jest.fn() }));
jest.mock('../../models/Order');
jest.mock('../../lib/supabase', () => ({
  supabaseAdmin: { auth: { getUser: jest.fn() } },
}));

describe('GET /api/orders', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });

  it('returns orders for authenticated user', async () => {
    (supabaseAdmin.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'uid-1', email: 'a@b.com', app_metadata: {} } },
      error: null,
    });
    (OrderModel.find as jest.Mock).mockReturnValue({
      sort: () => ({ lean: () => Promise.resolve([]) }),
    });
    const res = await request(app)
      .get('/api/orders')
      .set({ Authorization: 'Bearer valid' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
