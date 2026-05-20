'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useUser } from '@/components/providers/UserContext';
import { createClient } from '@/lib/supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

interface ProfileInfo {
  name:    string;
  phone:   string;
  address: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [info, setInfo]       = useState<ProfileInfo>({ name: '', phone: '', address: '' });
  const [original, setOriginal] = useState<ProfileInfo>({ name: '', phone: '', address: '' });
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }

    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then(r => r.json())
        .then((data: ProfileInfo) => {
          const resolved = {
            name:    data.name    || (user.user_metadata?.name as string) || '',
            phone:   data.phone   || (user.user_metadata?.phone as string) || '',
            address: data.address || '',
          };
          setInfo(resolved);
          setOriginal(resolved);
        })
        .catch(() => {});
    });
  }, [user, authLoading, router]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error('Not authenticated.'); setSaving(false); return; }
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name: info.name, phone: info.phone, address: info.address }),
      });
      if (res.ok) {
        setOriginal(info);
        toast.success('Profile updated.');
        setEditMode(false);
      } else {
        toast.error('Failed to update profile.');
      }
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 py-10">
      <div className="bg-brand-card rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-brand-text mb-8">Profile</h1>

        <div className="space-y-5">
          <Field label="Email" value={user.email ?? 'N/A'} />

          <div>
            <label className="block text-sm font-semibold text-brand-muted mb-1">Name</label>
            {editMode ? (
              <input
                type="text"
                value={info.name}
                onChange={e => setInfo(i => ({ ...i, name: e.target.value }))}
                className="w-full border border-brand-muted/30 rounded-lg px-4 py-3 bg-brand-bg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-secondary/40"
              />
            ) : (
              <p className="text-brand-text py-2">{info.name || 'N/A'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-muted mb-1">Phone</label>
            {editMode ? (
              <input
                type="text"
                value={info.phone}
                onChange={e => setInfo(i => ({ ...i, phone: e.target.value }))}
                className="w-full border border-brand-muted/30 rounded-lg px-4 py-3 bg-brand-bg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-secondary/40"
              />
            ) : (
              <p className="text-brand-text py-2">{info.phone || 'N/A'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-muted mb-1">Address</label>
            {editMode ? (
              <input
                type="text"
                value={info.address}
                onChange={e => setInfo(i => ({ ...i, address: e.target.value }))}
                className="w-full border border-brand-muted/30 rounded-lg px-4 py-3 bg-brand-bg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-secondary/40"
              />
            ) : (
              <p className="text-brand-text py-2">{info.address || 'N/A'}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-8">
          <button
            onClick={editMode ? handleSave : () => setEditMode(true)}
            disabled={saving}
            className={`py-3 rounded-full font-semibold transition-colors disabled:opacity-50 ${
              editMode
                ? 'bg-success text-white hover:opacity-90'
                : 'bg-brand-secondary text-brand-btn-text hover:opacity-90'
            }`}
          >
            {editMode ? (saving ? 'Saving…' : 'Save Changes') : 'Edit Profile'}
          </button>

          {editMode && (
            <button
              onClick={() => { setInfo(original); setEditMode(false); }}
              className="py-3 rounded-full font-semibold bg-brand-accent text-brand-muted hover:bg-brand-muted/20 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-brand-muted mb-1">{label}</label>
      <p className="text-brand-text py-2">{value}</p>
    </div>
  );
}
