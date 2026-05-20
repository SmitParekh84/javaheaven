'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

interface Props {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

const IMG_RE = /\.(jpg|jpeg|png|gif|bmp|webp|svg)(\?.*)?$/i;

export function ImageUploadField({ label, value, onChange, placeholder }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/super-admin/upload', { method: 'POST', body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Upload failed');
      onChange(json.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-400 font-semibold">{label}</span>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-gray-600"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-3 py-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold shrink-0 disabled:opacity-50 transition-colors"
        >
          {uploading ? '↑ …' : '↑ Upload'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
      {error && <p className="text-red-400 text-xs mt-0.5">{error}</p>}
      {value && IMG_RE.test(value) && (
        <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-gray-800 mt-1 border border-gray-700">
          <Image src={value} alt={label} fill className="object-contain" />
        </div>
      )}
    </div>
  );
}
