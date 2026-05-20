import Link from 'next/link';
import { connectDB } from '@/lib/db';
import TenantModel from '@/models/Tenant';

async function getTenants() {
  try {
    await connectDB();
    return await TenantModel.find({}).sort({ createdAt: -1 }).lean();
  } catch {
    return [];
  }
}

export default async function SuperAdminDashboard() {
  const tenants = await getTenants();

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white">Tenant Dashboard</h1>
            <p className="text-gray-400 mt-1">{tenants.length} client{tenants.length !== 1 ? 's' : ''} total</p>
          </div>
          <Link
            href="/super-admin/tenants/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
          >
            + New Tenant
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total Tenants',  value: tenants.length },
            { label: 'Active',         value: tenants.filter((t: any) => t.active).length },
            { label: 'Inactive',       value: tenants.filter((t: any) => !t.active).length },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-gray-400 text-sm">{s.label}</p>
              <p className="text-3xl font-bold text-white mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tenant table */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-800">
                <th className="px-6 py-4 font-semibold">Brand</th>
                <th className="px-6 py-4 font-semibold">Domain</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Colors</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No tenants yet.{' '}
                    <Link href="/super-admin/tenants/new" className="text-indigo-400 hover:underline">Create one →</Link>
                  </td>
                </tr>
              )}
              {tenants.map((t: any) => (
                <tr key={t._id.toString()} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-white">{t.brandName}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{t.tenantId}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-300 font-mono text-xs">{t.domain}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      t.active ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                    }`}>
                      {t.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5">
                      {[t.theme?.primaryColor, t.theme?.secondaryColor, t.theme?.accentColor].map((c, i) => (
                        <div key={i} className="w-5 h-5 rounded-full border border-gray-700" style={{ backgroundColor: c }} title={c} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/super-admin/tenants/${t._id}`}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
