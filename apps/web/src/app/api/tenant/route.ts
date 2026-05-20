import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import TenantModel from '@/models/Tenant';
import { DEFAULT_TENANT } from '@/types/tenant';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain   = searchParams.get('domain');
  const tenantId = searchParams.get('id');

  if (!domain && !tenantId) {
    return NextResponse.json(DEFAULT_TENANT);
  }

  try {
    await connectDB();
    const query = tenantId ? { tenantId } : { domain };
    const tenant = await TenantModel.findOne(query).lean();
    if (!tenant) return NextResponse.json(DEFAULT_TENANT);
    return NextResponse.json(tenant);
  } catch {
    return NextResponse.json(DEFAULT_TENANT);
  }
}
