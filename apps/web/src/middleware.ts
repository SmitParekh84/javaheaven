import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/cart', '/my-orders', '/profile'];
const SUPER_ADMIN_PATH = '/super-admin';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname     = request.headers.get('host') ?? 'localhost';
  const domain       = hostname.replace(/:\d+$/, '');

  let response = NextResponse.next({ request: { headers: request.headers } });
  response.headers.set('x-tenant-domain', domain);

  if (
    pathname.startsWith(SUPER_ADMIN_PATH) &&
    pathname !== `${SUPER_ADMIN_PATH}/login`
  ) {
    const session = request.cookies.get('super-admin-session');
    if (!session || session.value !== process.env.SUPER_ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL(`${SUPER_ADMIN_PATH}/login`, request.url));
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p)) && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|fonts|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
};
