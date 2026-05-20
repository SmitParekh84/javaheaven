import request from 'supertest';
import app from '../../app';
import { connectDB } from '../../lib/db';
import CartModel from '../../models/Cart';
import { supabaseAdmin } from '../../lib/supabase';
import { stripe } from '../../lib/stripe';

jest.mock('../../lib/db', () => ({ connectDB: jest.fn() }));
jest.mock('../../models/Cart');
jest.mock('../../models/Order');
jest.mock('../../lib/supabase', () => ({
  supabaseAdmin: { auth: { getUser: jest.fn() } },
}));
jest.mock('../../lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: { create: jest.fn() },
    },
  },
}));

describe('POST /api/payments/create-checkout', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/payments/create-checkout');
    expect(res.status).toBe(401);
  });

  it('returns 400 when cart is empty', async () => {
    (supabaseAdmin.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'uid-1', email: 'a@b.com', app_metadata: {} } },
      error: null,
    });
    (CartModel.findOne as jest.Mock).mockReturnValue({
      lean: () => Promise.resolve({ userId: 'uid-1', items: [] }),
    });
    const res = await request(app)
      .post('/api/payments/create-checkout')
      .set({ Authorization: 'Bearer valid' })
      .send({ tenantId: 't1' });
    expect(res.status).toBe(400);
  });

  it('returns checkout url when cart has items', async () => {
    (supabaseAdmin.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'uid-1', email: 'a@b.com', app_metadata: {} } },
      error: null,
    });
    (CartModel.findOne as jest.Mock).mockReturnValue({
      lean: () => Promise.resolve({
        userId: 'uid-1',
        items: [{ menuItemId: 'mi1', name: 'Latte', price: 4.5, qty: 2, size: 'Large' }],
      }),
    });
    (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
      url: 'https://checkout.stripe.com/test',
    });
    const res = await request(app)
      .post('/api/payments/create-checkout')
      .set({ Authorization: 'Bearer valid' })
      .send({ tenantId: 't1' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('url');
  });
});
