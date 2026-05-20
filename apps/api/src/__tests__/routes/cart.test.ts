import request from 'supertest';
import app from '../../app';
import { connectDB } from '../../lib/db';
import CartModel from '../../models/Cart';
import { supabaseAdmin } from '../../lib/supabase';

jest.mock('../../lib/db', () => ({ connectDB: jest.fn() }));
jest.mock('../../models/Cart');
jest.mock('../../lib/supabase', () => ({
  supabaseAdmin: { auth: { getUser: jest.fn() } },
}));

function authHeaders(token = 'valid') {
  return { Authorization: `Bearer ${token}` };
}

describe('GET /api/cart', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });

  it('returns cart for authenticated user', async () => {
    (supabaseAdmin.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'uid-1', email: 'a@b.com', app_metadata: {} } },
      error: null,
    });
    (CartModel.findOne as jest.Mock).mockReturnValue({
      lean: () => Promise.resolve({ userId: 'uid-1', items: [] }),
    });
    const res = await request(app).get('/api/cart').set(authHeaders());
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
  });
});
