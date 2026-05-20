import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import TenantModel from '@/models/Tenant';

function authorized(request: NextRequest) {
  const session = request.cookies.get('super-admin-session');
  return session?.value === process.env.SUPER_ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const tenants = await TenantModel.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json(tenants);
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  await connectDB();
  const tenant = await TenantModel.create(body);
  return NextResponse.json(tenant, { status: 201 });
}
