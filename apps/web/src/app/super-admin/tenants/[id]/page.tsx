'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ImageUploadField } from '@/components/super-admin/ImageUploadField';

interface TenantForm {
  brandName: string;
  domain: string;
  tenantId: string;
  active: boolean;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    textColor: string;
    mutedColor: string;
    bgColor: string;
    cardColor: string;
    btnTextColor: string;
    fontFamily: string;
  };
  assets: {
    logoUrl: string;
    faviconUrl: string;
    heroImage: string;
    footerLogoUrl: string;
  };
  contact: { email: string; phone: string; address: string };
  social: { instagram: string; facebook: string; twitter: string; linkedin: string };
}

const BLANK: TenantForm = {
  brandName: '', domain: '', tenantId: '', active: true,
  theme: {
    primaryColor: '#F5F5DC', secondaryColor: '#503225', accentColor: '#FDF8F0',
    textColor: '#1A1A1A', mutedColor: '#D3D3D3', bgColor: '#F5F5DC',
    cardColor: '#FFFFFF', btnTextColor: '#503225', fontFamily: 'League Spartan',
  },
  assets: { logoUrl: '', faviconUrl: '', heroImage: '', footerLogoUrl: '' },
  contact: { email: '', phone: '', address: '' },
  social: { instagram: '', facebook: '', twitter: '', linkedin: '' },
};

const GOOGLE_FONTS = ['League Spartan', 'Inter', 'Roboto', 'Poppins', 'Playfair Display', 'Lato', 'Montserrat', 'Raleway', 'Nunito', 'Open Sans'];

const ColorPicker = ({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (v: string) => void }) => (
  <label className="flex flex-col gap-1">
    <span className="text-xs text-gray-400">{label}</span>
    <div className="flex items-center gap-2">
      <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-gray-700 bg-transparent" />
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  </label>
);

export default function TenantEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === 'new';
  const [form, setForm] = useState<TenantForm>(BLANK);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'brand' | 'theme' | 'assets' | 'contact'>('brand');

  useEffect(() => {
    if (isNew) return;
    fetch(`/api/super-admin/tenants/${id}`)
      .then(r => r.json())
      .then(data => {
        setForm({
          ...BLANK, ...data,
          theme:   { ...BLANK.theme,   ...data.theme },
          assets:  { ...BLANK.assets,  ...data.assets },
          contact: { ...BLANK.contact, ...data.contact },
          social:  { ...BLANK.social,  ...data.social },
        });
        setLoading(false);
      });
  }, [id, isNew]);

  const setTheme  = (k: string, v: string) => setForm(f => ({ ...f, theme:   { ...f.theme,   [k]: v } }));
  const setAssets = (k: string, v: string) => setForm(f => ({ ...f, assets:  { ...f.assets,  [k]: v } }));
  const setContact= (k: string, v: string) => setForm(f => ({ ...f, contact: { ...f.contact, [k]: v } }));
  const setSocial = (k: string, v: string) => setForm(f => ({ ...f, social:  { ...f.social,  [k]: v } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const url    = isNew ? '/api/super-admin/tenants' : `/api/super-admin/tenants/${id}`;
      const method = isNew ? 'POST' : 'PATCH';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) router.push('/super-admin');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete tenant "${form.brandName}"? This cannot be undone.`)) return;
    await fetch(`/api/super-admin/tenants/${id}`, { method: 'DELETE' });
    router.push('/super-admin');
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Loading…</div>;

  const t = form.theme;

  return (
    <div className="min-h-screen bg-gray-950 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/super-admin" className="text-indigo-400 hover:text-indigo-300 text-sm mb-2 block">← Back to dashboard</Link>
            <h1 className="text-2xl font-bold text-white">{isNew ? 'New Tenant' : `Edit: ${form.brandName}`}</h1>
          </div>
          <div className="flex gap-3">
            {!isNew && (
              <button onClick={handleDelete} className="px-4 py-2 bg-red-900/50 hover:bg-red-900 text-red-400 rounded-lg text-sm font-semibold transition-colors">
                Delete
              </button>
            )}
            <button onClick={handleSave} disabled={saving}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Tenant'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-3 space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-900 rounded-xl p-1 w-fit">
              {(['brand','theme','assets','contact'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5">
              {activeTab === 'brand' && (
                <>
                  <Field label="Brand Name" value={form.brandName} onChange={v => setForm(f => ({ ...f, brandName: v }))} placeholder="My Coffee Shop" />
                  <Field label="Tenant ID (slug)" value={form.tenantId} onChange={v => setForm(f => ({ ...f, tenantId: v }))} placeholder="my-coffee-shop" />
                  <Field label="Domain" value={form.domain} onChange={v => setForm(f => ({ ...f, domain: v }))} placeholder="mycoffeeshop.com" />
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                      className="w-5 h-5 rounded accent-indigo-600" />
                    <span className="text-sm text-gray-300 font-semibold">Active (visible to users)</span>
                  </label>
                </>
              )}

              {activeTab === 'theme' && (
                <>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Font Family</label>
                    <select value={t.fontFamily} onChange={e => setTheme('fontFamily', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
                      {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <ColorPicker label="Primary (Background)"  name="primaryColor"   value={t.primaryColor}   onChange={v => setTheme('primaryColor', v)} />
                    <ColorPicker label="Secondary (Brand)"     name="secondaryColor" value={t.secondaryColor} onChange={v => setTheme('secondaryColor', v)} />
                    <ColorPicker label="Accent (Hover/tint)"   name="accentColor"    value={t.accentColor}    onChange={v => setTheme('accentColor', v)} />
                    <ColorPicker label="Text Color"            name="textColor"      value={t.textColor}      onChange={v => setTheme('textColor', v)} />
                    <ColorPicker label="Muted Text"            name="mutedColor"     value={t.mutedColor}     onChange={v => setTheme('mutedColor', v)} />
                    <ColorPicker label="Page Background"       name="bgColor"        value={t.bgColor}        onChange={v => setTheme('bgColor', v)} />
                    <ColorPicker label="Card Background"       name="cardColor"      value={t.cardColor}      onChange={v => setTheme('cardColor', v)} />
                    <ColorPicker label="Button Text"           name="btnTextColor"   value={t.btnTextColor}   onChange={v => setTheme('btnTextColor', v)} />
                  </div>
                </>
              )}

              {activeTab === 'assets' && (
                <>
                  <p className="text-xs text-gray-500">Paste a URL or click <span className="text-indigo-400 font-semibold">↑ Upload</span> to upload directly to Cloudinary.</p>
                  <ImageUploadField label="Logo"         value={form.assets.logoUrl}       onChange={v => setAssets('logoUrl', v)}       placeholder="https://cdn.example.com/logo.png" />
                  <ImageUploadField label="Favicon"      value={form.assets.faviconUrl}    onChange={v => setAssets('faviconUrl', v)}    placeholder="https://cdn.example.com/favicon.ico" />
                  <ImageUploadField label="Hero Image"   value={form.assets.heroImage}     onChange={v => setAssets('heroImage', v)}     placeholder="https://cdn.example.com/hero.jpg" />
                  <ImageUploadField label="Footer Logo"  value={form.assets.footerLogoUrl} onChange={v => setAssets('footerLogoUrl', v)} placeholder="https://cdn.example.com/footer-logo.png" />
                </>
              )}

              {activeTab === 'contact' && (
                <>
                  <Field label="Email"     value={form.contact.email}   onChange={v => setContact('email', v)}   placeholder="hello@mybrand.com" />
                  <Field label="Phone"     value={form.contact.phone}   onChange={v => setContact('phone', v)}   placeholder="+91 00000 00000" />
                  <Field label="Address"   value={form.contact.address} onChange={v => setContact('address', v)} placeholder="123 Main St, City" />
                  <hr className="border-gray-800" />
                  <Field label="Instagram" value={form.social.instagram} onChange={v => setSocial('instagram', v)} placeholder="https://instagram.com/brand" />
                  <Field label="Facebook"  value={form.social.facebook}  onChange={v => setSocial('facebook', v)}  placeholder="https://facebook.com/brand" />
                  <Field label="Twitter"   value={form.social.twitter}   onChange={v => setSocial('twitter', v)}   placeholder="https://twitter.com/brand" />
                  <Field label="LinkedIn"  value={form.social.linkedin}  onChange={v => setSocial('linkedin', v)}  placeholder="https://linkedin.com/company/brand" />
                </>
              )}
            </div>
          </div>

          {/* Right: Live preview */}
          <div className="lg:col-span-2">
            <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">Live Preview</p>
            <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-2xl"
              style={{
                '--color-primary':   t.primaryColor,
                '--color-secondary': t.secondaryColor,
                '--color-accent':    t.accentColor,
                '--color-text':      t.textColor,
                '--color-muted':     t.mutedColor,
                '--color-bg':        t.bgColor,
                '--color-card':      t.cardColor,
                '--color-btn-text':  t.btnTextColor,
              } as React.CSSProperties}
            >
              {/* Mini navbar */}
              <div style={{ background: t.bgColor, borderBottom: `1px solid ${t.mutedColor}33` }} className="px-4 py-3 flex items-center justify-between">
                <span style={{ color: t.secondaryColor, fontWeight: 700, fontSize: 14 }}>{form.brandName || 'Brand Name'}</span>
                <div className="flex gap-3" style={{ fontSize: 11, color: t.textColor }}>
                  <span>Menu</span><span>About</span>
                  <span style={{ background: t.secondaryColor, color: t.btnTextColor, padding: '2px 10px', borderRadius: 999, fontWeight: 600 }}>Login</span>
                </div>
              </div>
              {/* Hero */}
              <div style={{ background: t.accentColor, padding: '24px 16px', textAlign: 'center' }}>
                <p style={{ color: t.mutedColor, fontSize: 11 }}>New Updates</p>
                <p style={{ color: t.textColor, fontWeight: 700, fontSize: 18, margin: '4px 0' }}>{form.brandName || 'Your Brand'}</p>
                <p style={{ color: t.mutedColor, fontSize: 12, marginBottom: 12 }}>Premium coffee, crafted for you.</p>
                <button style={{ background: t.secondaryColor, color: t.btnTextColor, border: 'none', borderRadius: 999, padding: '6px 20px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Order Now
                </button>
              </div>
              {/* Cards */}
              <div style={{ background: t.bgColor, padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {['Espresso', 'Cappuccino'].map(name => (
                  <div key={name} style={{ background: t.cardColor, borderRadius: 10, padding: '10px 12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                    <div style={{ width: '100%', height: 48, background: t.accentColor, borderRadius: 6, marginBottom: 6 }} />
                    <p style={{ color: t.textColor, fontWeight: 600, fontSize: 12 }}>{name}</p>
                    <p style={{ color: t.mutedColor, fontSize: 11 }}>₹ 120</p>
                    <button style={{ marginTop: 6, background: t.secondaryColor, color: t.btnTextColor, border: 'none', borderRadius: 999, padding: '3px 10px', fontSize: 10, fontWeight: 600 }}>
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
              {/* Footer */}
              <div style={{ background: t.secondaryColor, padding: '10px 16px', textAlign: 'center' }}>
                <p style={{ color: t.primaryColor, fontSize: 11 }}>© {form.brandName || 'Your Brand'}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3 text-center">Colors update in real-time</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-gray-400 font-semibold">{label}</span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-gray-600"
      />
    </label>
  );
}
