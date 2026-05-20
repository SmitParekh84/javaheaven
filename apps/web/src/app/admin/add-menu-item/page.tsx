'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { PencilSquareIcon, TrashIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const IMG_REGEX = /\.(jpg|jpeg|png|gif|bmp|webp)(\?.*)?$/i;
const PER_PAGE_OPTIONS = [5, 10, 15, 20, 30];

function parseJwt(token: string) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

interface MenuItem {
  _id: string; name: string; description: string; price: number;
  category: string; imageUrl?: string; isBestseller?: boolean; stock?: number;
}

interface Form {
  name: string; description: string; price: string; category: string;
  imageUrl: string; isBestseller: boolean;
}

const EMPTY_FORM: Form = { name: '', description: '', price: '', category: '', imageUrl: '', isBestseller: false };

export default function AddMenuItemPage() {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imgError, setImgError] = useState('');
  const [formError, setFormError] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_URL}/api/items`);
      if (res.ok) {
        const data: MenuItem[] = await res.json();
        setItems(data);
        setCategories(Array.from(new Set(data.map(i => i.category).filter(Boolean))));
      }
    } catch { toast.error('Failed to fetch items.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = token ? parseJwt(token) : null;
    if (!user || user.role !== 'admin') { router.push('/admin/login'); return; }
    fetchItems();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked! : value }));
    if (name === 'imageUrl') setImgError('');
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(''); setImgError('');

    if (Number(form.price) <= 0) { setFormError('Price must be a positive number.'); return; }
    if (form.imageUrl && !IMG_REGEX.test(form.imageUrl)) {
      setImgError('Invalid image URL. Must end in .jpg, .jpeg, .png, .gif, .bmp, or .webp.');
      return;
    }

    setSaving(true);
    try {
      const body = { name: form.name, description: form.description, price: Number(form.price), category: form.category, isBestseller: form.isBestseller, imageUrl: form.imageUrl };
      const url = editId ? `${API_URL}/api/items/${editId}` : `${API_URL}/api/items`;
      const res = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(editId ? 'Item updated.' : 'Item added.');
        setForm(EMPTY_FORM); setEditId(null);
        await fetchItems();
      } else {
        const d = await res.json();
        setFormError(d.errors?.[0]?.msg || 'Failed to save item.');
      }
    } catch { setFormError('Failed to save item.'); }
    finally { setSaving(false); }
  };

  const handleEdit = (item: MenuItem) => {
    setForm({ name: item.name, description: item.description, price: String(item.price), category: item.category, imageUrl: item.imageUrl ?? '', isBestseller: item.isBestseller ?? false });
    setEditId(item._id);
    setImgError(''); setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      await fetch(`${API_URL}/api/items/${id}`, { method: 'DELETE' });
      toast.success('Item deleted.');
      await fetchItems();
    } catch { toast.error('Failed to delete item.'); }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategory.trim();
    if (!trimmed) { toast.error('Category name cannot be empty.'); return; }
    if (categories.includes(trimmed)) { toast.error('Category already exists.'); return; }
    setCategories(c => [...c, trimmed]);
    setNewCategory('');
    toast.success('Category added.');
  };

  const totalPages = Math.ceil(items.length / perPage);
  const paged = items.slice((page - 1) * perPage, page * perPage);

  const inputClass = 'w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 text-gray-800';

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-brand-text mb-8">Menu Items</h1>

      {/* Form */}
      <div className="bg-brand-card rounded-2xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-brand-text mb-5">{editId ? 'Edit Item' : 'Add New Item'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="name" required placeholder="Item Name" value={form.name} onChange={handleChange} className={inputClass} />
            <input type="text" name="description" required placeholder="Description" value={form.description} onChange={handleChange} className={inputClass} />
            <input type="number" name="price" required min="1" placeholder="Price (₹)" value={form.price} onChange={handleChange} className={inputClass} />
            <select name="category" required value={form.category} onChange={handleChange} className={inputClass}>
              <option value="" disabled>Select Category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="md:col-span-2">
              <input type="text" name="imageUrl" placeholder="Image URL (optional)" value={form.imageUrl} onChange={handleChange} className={inputClass} />
              {imgError && <p className="text-danger text-xs mt-1">{imgError}</p>}
            </div>
            {form.imageUrl && IMG_REGEX.test(form.imageUrl) && (
              <div className="md:col-span-2">
                <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-brand-accent">
                  <Image src={form.imageUrl} alt="Preview" fill className="object-cover" />
                </div>
              </div>
            )}
            <label className="md:col-span-2 flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="isBestseller" checked={form.isBestseller} onChange={handleChange} className="w-4 h-4 accent-brand-secondary" />
              <span className="text-sm font-semibold text-brand-muted">Mark as Bestseller</span>
            </label>
          </div>

          {formError && <p className="text-danger text-sm">{formError}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-brand-secondary text-brand-btn-text px-6 py-2.5 rounded-full font-semibold hover:opacity-90 disabled:opacity-50">
              <PlusIcon className="w-4 h-4" />
              {saving ? 'Saving…' : (editId ? 'Update Item' : 'Add Item')}
            </button>
            {editId && (
              <button type="button" onClick={() => { setForm(EMPTY_FORM); setEditId(null); setImgError(''); setFormError(''); }}
                className="bg-brand-accent text-brand-muted px-6 py-2.5 rounded-full font-semibold hover:bg-brand-muted/20">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Add category */}
      <div className="bg-brand-card rounded-2xl shadow-sm p-6 mb-8">
        <h2 className="text-base font-semibold text-brand-text mb-4">Add Category</h2>
        <form onSubmit={handleAddCategory} className="flex gap-3">
          <input
            type="text" required placeholder="New category name" value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 text-gray-800"
          />
          <button type="submit" className="bg-brand-secondary text-brand-btn-text px-5 py-2.5 rounded-full font-semibold hover:opacity-90 flex items-center gap-1 shrink-0">
            <PlusIcon className="w-4 h-4" /> Add
          </button>
        </form>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {categories.map(c => (
              <span key={c} className="bg-brand-accent text-brand-secondary text-xs font-semibold px-3 py-1 rounded-full">{c}</span>
            ))}
          </div>
        )}
      </div>

      {/* Items table */}
      <div className="bg-brand-card rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-muted/10">
          <h2 className="text-base font-semibold text-brand-text">
            Menu Items <span className="text-brand-muted font-normal text-sm">({items.length} total)</span>
          </h2>
          <select
            value={perPage}
            onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
            className="border border-brand-muted/30 rounded-lg px-3 py-1.5 bg-brand-bg text-brand-text text-sm focus:outline-none"
          >
            {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n} / page</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-brand-muted/10">
                <th className="px-6 py-3 text-brand-muted font-semibold">Image</th>
                <th className="px-6 py-3 text-brand-muted font-semibold">Name</th>
                <th className="px-6 py-3 text-brand-muted font-semibold hidden md:table-cell">Description</th>
                <th className="px-6 py-3 text-brand-muted font-semibold">Price</th>
                <th className="px-6 py-3 text-brand-muted font-semibold hidden sm:table-cell">Category</th>
                <th className="px-6 py-3 text-brand-muted font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-muted/10">
              {paged.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-brand-muted">No items yet.</td></tr>
              ) : paged.map(item => (
                <tr key={item._id} className="hover:bg-brand-accent/30 transition-colors">
                  <td className="px-6 py-4">
                    {item.imageUrl ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-brand-accent">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      </div>
                    ) : <div className="w-12 h-12 rounded-lg bg-brand-accent" />}
                  </td>
                  <td className="px-6 py-4 font-medium text-brand-text">
                    {item.name}
                    {item.isBestseller && <span className="ml-1.5 text-xs bg-warning/20 text-warning font-semibold px-1.5 py-0.5 rounded-full">★ Best</span>}
                  </td>
                  <td className="px-6 py-4 text-brand-muted max-w-xs truncate hidden md:table-cell">{item.description}</td>
                  <td className="px-6 py-4 font-semibold text-brand-text">₹{item.price}</td>
                  <td className="px-6 py-4 text-brand-muted hidden sm:table-cell">{item.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(item)} className="text-info hover:underline flex items-center gap-1 text-xs font-semibold">
                        <PencilSquareIcon className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="text-danger hover:underline flex items-center gap-1 text-xs font-semibold">
                        <TrashIcon className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-brand-muted/10">
          <p className="text-sm text-brand-muted">Page {page} of {totalPages || 1}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold bg-brand-accent text-brand-muted hover:bg-brand-muted/20 disabled:opacity-40"
            >
              <ChevronLeftIcon className="w-4 h-4" /> Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold bg-brand-accent text-brand-muted hover:bg-brand-muted/20 disabled:opacity-40"
            >
              Next <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
