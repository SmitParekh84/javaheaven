'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useUser } from '@/components/providers/UserContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

function parseJwt(token: string) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

interface UserInfo {
  userId?: string;
  username?: string;
  email?: string;
  mobno?: string;
  address?: string;
  [key: string]: unknown;
}

export default function ProfilePage() {
  const router = useRouter();
  const { setUser } = useUser();
  const [info, setInfo] = useState<UserInfo | null>(null);
  const [original, setOriginal] = useState<UserInfo | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    const parsed = parseJwt(token);
    if (!parsed) { router.push('/login'); return; }
    setInfo(parsed);
    setOriginal(parsed);
  }, [router]);

  const handleSave = async () => {
    if (!info?.userId) { toast.error('User ID not found.'); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/${info.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mobno: info.mobno, address: info.address }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        const updated = parseJwt(data.token);
        setInfo(updated);
        setOriginal(updated);
        setUser(updated);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', data.token);
        localStorage.setItem('userInfo', data.token);
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

  const handleCancel = () => {
    setInfo(original);
    setEditMode(false);
  };

  if (!info) return null;

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 py-10">
      <div className="bg-brand-card rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-brand-text mb-8">Profile</h1>

        <div className="space-y-5">
          <Field label="Username" value={info.username ?? 'N/A'} />
          <Field label="Email" value={info.email ?? 'N/A'} />

          <div>
            <label className="block text-sm font-semibold text-brand-muted mb-1">Mobile No</label>
            {editMode ? (
              <input
                type="text"
                value={info.mobno ?? ''}
                onChange={e => setInfo(i => ({ ...i!, mobno: e.target.value }))}
                className="w-full border border-brand-muted/30 rounded-lg px-4 py-3 bg-brand-bg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-secondary/40"
              />
            ) : (
              <p className="text-brand-text py-2">{info.mobno || 'N/A'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-muted mb-1">Address</label>
            {editMode ? (
              <input
                type="text"
                value={info.address ?? ''}
                onChange={e => setInfo(i => ({ ...i!, address: e.target.value }))}
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
              onClick={handleCancel}
              className="py-3 rounded-full font-semibold bg-brand-accent text-brand-muted hover:bg-brand-muted/20 transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            onClick={() => setShowPwModal(true)}
            className="py-3 rounded-full font-semibold bg-brand-secondary text-brand-btn-text hover:opacity-90 transition-opacity"
          >
            Change Password
          </button>
        </div>
      </div>

      {showPwModal && (
        <ChangePasswordModal userId={info.userId} onClose={() => setShowPwModal(false)} />
      )}
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

function ChangePasswordModal({ userId, onClose }: { userId?: string; onClose: () => void }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (next !== confirm) { toast.error('New passwords do not match.'); return; }
    if (!userId) { toast.error('User ID not found.'); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      if (res.ok) {
        toast.success('Password updated.');
        onClose();
      } else {
        const d = await res.json();
        toast.error(d.message || 'Failed to update password.');
      }
    } catch {
      toast.error('Failed to update password.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-secondary/40';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Change Password</h2>

        <div className="space-y-4">
          <input
            type="password"
            placeholder="Current password"
            value={current}
            onChange={e => setCurrent(e.target.value)}
            className={inputClass}
          />
          <input
            type="password"
            placeholder="New password"
            value={next}
            onChange={e => setNext(e.target.value)}
            className={inputClass}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-3 rounded-full font-semibold bg-brand-secondary text-brand-btn-text hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Updating…' : 'Update Password'}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
