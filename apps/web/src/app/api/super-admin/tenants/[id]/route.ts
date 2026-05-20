import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import TenantModel from '@/models/Tenant';

function authorized(request: NextRequest) {
  const session = request.cookies.get('super-admin-session');
  return session?.value === process.env.SUPER_ADMIN_PASSWORD;
}

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await connectDB();
  const tenant = await TenantModel.findById(id).lean();
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(tenant);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  await connectDB();
  const tenant = await TenantModel.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true }).lean();
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(tenant);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await connectDB();
  await TenantModel.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
