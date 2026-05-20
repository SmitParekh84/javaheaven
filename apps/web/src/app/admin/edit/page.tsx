'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

function parseJwt(token: string) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

interface Admin { _id: string; username: string; email: string; mobno: string; }
interface Form { username: string; email: string; mobno: string; password: string; }
interface FormErrors { username?: string; email?: string; mobno?: string; password?: string; }

const EMPTY: Form = { username: '', email: '', mobno: '', password: '' };

export default function AdminEditPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [currentAdminId, setCurrentAdminId] = useState('');

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/list`);
      const data = await res.json();
      setAdmins(data.admins ?? []);
    } catch { toast.error('Failed to fetch admins.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = token ? parseJwt(token) : null;
    if (!user || user.role !== 'admin') { router.push('/admin/login'); return; }
    setCurrentAdminId(user.userId ?? '');
    fetchAdmins();
  }, [router]);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.username) errs.username = 'Username is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!/^\d{10}$/.test(form.mobno)) errs.mobno = 'Enter a valid 10-digit mobile number.';
    if (!editId && form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const body = { username: form.username, email: form.email, mobno: form.mobno, ...(form.password ? { password: form.password } : {}) };
      const url = editId ? `${API_URL}/api/admin/edit/${editId}` : `${API_URL}/api/admin/add`;
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok) {
        toast.success(editId ? 'Admin updated.' : 'Admin added.');
        setForm(EMPTY); setEditId(null); setErrors({});
        await fetchAdmins();
      } else {
        toast.error(data.msg || 'Failed to save admin.');
      }
    } catch { toast.error('Failed to save admin.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/delete/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) { toast.success('Admin deleted.'); setConfirmDeleteId(null); await fetchAdmins(); }
      else toast.error(data.msg || 'Failed to delete admin.');
    } catch { toast.error('Failed to delete admin.'); }
  };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 text-gray-800';

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-brand-text mb-8">Admin Management</h1>

      {/* Form */}
      <div className="bg-brand-card rounded-2xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-brand-text mb-5">{editId ? 'Edit Admin' : 'Add New Admin'}</h2>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text" placeholder="Username" value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className={inputClass}
            />
            {errors.username && <p className="text-danger text-xs mt-1">{errors.username}</p>}
          </div>
          <div>
            <input
              type="email" placeholder="Email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className={inputClass}
            />
            {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <input
              type="text" placeholder="Mobile (10 digits)" value={form.mobno}
              onChange={e => setForm(f => ({ ...f, mobno: e.target.value }))}
              className={inputClass}
            />
            {errors.mobno && <p className="text-danger text-xs mt-1">{errors.mobno}</p>}
          </div>
          <div>
            <input
              type="password" placeholder={editId ? 'New password (optional)' : 'Password'} value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className={inputClass}
            />
            {errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
          </div>
          <div className="md:col-span-2 flex gap-3">
            <button type="submit" disabled={saving}
              className="bg-brand-secondary text-brand-btn-text px-6 py-2.5 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? 'Saving…' : (editId ? 'Save Changes' : 'Add Admin')}
            </button>
            {editId && (
              <button type="button" onClick={() => { setForm(EMPTY); setEditId(null); setErrors({}); }}
                className="bg-brand-accent text-brand-muted px-6 py-2.5 rounded-full font-semibold hover:bg-brand-muted/20">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Admin list */}
      <div className="bg-brand-card rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-brand-text mb-5">Admin List</h2>
        {admins.length === 0 ? (
          <p className="text-brand-muted text-sm">No admins found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {admins.map(admin => (
              <div key={admin._id} className="border border-brand-muted/20 rounded-xl p-4">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-brand-text">{admin.username}</p>
                  {currentAdminId === admin._id && (
                    <span className="text-xs bg-success/10 text-success font-semibold px-2 py-0.5 rounded-full">You</span>
                  )}
                </div>
                <p className="text-sm text-brand-muted">{admin.email}</p>
                <p className="text-sm text-brand-muted">{admin.mobno}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => { setEditId(admin._id); setForm({ username: admin.username, email: admin.email, mobno: admin.mobno, password: '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="bg-brand-secondary text-brand-btn-text px-3 py-1 rounded-full text-xs font-semibold hover:opacity-90"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(admin._id)}
                    className="bg-danger text-white px-3 py-1 rounded-full text-xs font-semibold hover:opacity-90"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
            <p className="text-gray-800 font-semibold mb-6">Delete this admin? This cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => handleDelete(confirmDeleteId)} className="bg-danger text-white px-6 py-2.5 rounded-full font-semibold hover:opacity-90">Delete</button>
              <button onClick={() => setConfirmDeleteId(null)} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-full font-semibold hover:bg-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
