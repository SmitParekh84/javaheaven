import { NextRequest, NextResponse } from 'next/server';

const PASSWORD = process.env.SUPER_ADMIN_PASSWORD ?? 'changeme';

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  if (password !== PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  const response = NextResponse.json({ success: true });
  response.cookies.set('super-admin-session', PASSWORD, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('super-admin-session');
  return response;
}
