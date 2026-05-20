import { requireAuth, AuthRequest } from '../../middleware/auth';
import { supabaseAdmin } from '../../lib/supabase';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../lib/supabase', () => ({
  supabaseAdmin: { auth: { getUser: jest.fn() } },
}));

function makeReq(auth?: string) {
  return { headers: { authorization: auth } } as unknown as Request;
}
function makeRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
}
const nextFn = jest.fn() as NextFunction;

describe('requireAuth middleware', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when Authorization header is missing', async () => {
    const res = makeRes();
    await requireAuth(makeReq() as AuthRequest, res, nextFn);
    expect((res.status as jest.Mock)).toHaveBeenCalledWith(401);
    expect(nextFn).not.toHaveBeenCalled();
  });

  it('returns 401 when token is invalid', async () => {
    (supabaseAdmin.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: new Error('invalid'),
    });
    const res = makeRes();
    await requireAuth(makeReq('Bearer bad') as AuthRequest, res, nextFn);
    expect((res.status as jest.Mock)).toHaveBeenCalledWith(401);
    expect(nextFn).not.toHaveBeenCalled();
  });

  it('attaches req.user and calls next on valid token', async () => {
    (supabaseAdmin.auth.getUser as jest.Mock).mockResolvedValue({
      data: {
        user: { id: 'uid-1', email: 'a@b.com', app_metadata: { role: 'user' } },
      },
      error: null,
    });
    const req = makeReq('Bearer good') as AuthRequest;
    const res = makeRes();
    await requireAuth(req, res, nextFn);
    expect(req.user).toEqual({ id: 'uid-1', email: 'a@b.com', role: 'user' });
    expect(nextFn).toHaveBeenCalled();
  });
});
