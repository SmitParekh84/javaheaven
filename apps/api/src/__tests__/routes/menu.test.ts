import request from 'supertest';
import app from '../../app';
import { connectDB } from '../../lib/db';
import MenuItemModel from '../../models/MenuItem';

jest.mock('../../lib/db', () => ({ connectDB: jest.fn() }));
jest.mock('../../models/MenuItem');

const mockItems = [
  { _id: 'id1', tenantId: 't1', name: 'Espresso', price: 3.5, category: 'Coffee', isAvailable: true },
];

describe('GET /api/menu', () => {
  it('returns array of menu items', async () => {
    (MenuItemModel.find as jest.Mock).mockReturnValue({ lean: () => Promise.resolve(mockItems) });
    const res = await request(app).get('/api/menu?tenantId=t1');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toBe('Espresso');
  });
});

describe('GET /api/menu/:id', () => {
  it('returns 404 for unknown id', async () => {
    (MenuItemModel.findById as jest.Mock).mockReturnValue({ lean: () => Promise.resolve(null) });
    const res = await request(app).get('/api/menu/nonexistent');
    expect(res.status).toBe(404);
  });
});
