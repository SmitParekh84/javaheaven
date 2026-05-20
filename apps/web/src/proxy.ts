import { NextRequest, NextResponse } from 'next/server';

const SUPER_ADMIN_PATH = '/super-admin';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD ?? 'changeme';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') ?? 'localhost';

  // Strip port for local dev
  const domain = hostname.replace(/:\d+$/, '');

  // Protect super-admin with a simple session cookie check
  if (pathname.startsWith(SUPER_ADMIN_PATH) && pathname !== `${SUPER_ADMIN_PATH}/login`) {
    const session = request.cookies.get('super-admin-session');
    if (!session || session.value !== SUPER_ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL(`${SUPER_ADMIN_PATH}/login`, request.url));
    }
  }

  // Pass the resolved domain to every request via header so server components can use it
  const response = NextResponse.next();
  response.headers.set('x-tenant-domain', domain);
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|fonts|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
};
