'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Tenant } from '@/types/tenant';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const DEFAULT_IMAGE = '/images/coffee-machine-making-perfect-cup-coffee.jpg';
const ITEMS_PER_PAGE = 9;

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
}

function ItemCard({ item }: { item: MenuItem }) {
  return (
    <Link href={`/item/${item._id}`} className="group bg-brand-card rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      <div className="relative h-48 bg-brand-accent overflow-hidden">
        <Image
          src={item.imageUrl || DEFAULT_IMAGE}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-brand-text text-lg leading-tight">{item.name}</h3>
        <p className="text-brand-muted text-sm mt-1.5 flex-1 line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-brand-text font-semibold text-lg">₹{item.price.toFixed(0)}</span>
          <span className="bg-brand-secondary text-brand-btn-text text-xs font-semibold px-4 py-2 rounded-full group-hover:scale-105 transition-transform">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-brand-card rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-brand-accent/60" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-brand-accent/80 rounded w-2/3" />
        <div className="h-4 bg-brand-accent/60 rounded w-full" />
        <div className="h-4 bg-brand-accent/60 rounded w-4/5" />
        <div className="h-8 bg-brand-accent/80 rounded-full w-24 mt-2" />
      </div>
    </div>
  );
}

export default function MenuClient({ tenant }: { tenant: Tenant }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') ?? '';

  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch(`${API_URL}/api/items`)
      .then(r => r.json())
      .then((data: MenuItem[]) => {
        setItems(data);
        const cats = Array.from(new Set(data.map(i => i.category)));
        setCategories(cats);
      })
      .catch(() => toast.error('Failed to load menu'))
      .finally(() => setLoading(false));
  }, []);

  const handleCategoryChange = useCallback((cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    if (cat) params.set('category', cat); else params.delete('category');
    router.replace(`/menu?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const filtered = selectedCategory ? items.filter(i => i.category === selectedCategory) : items;
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold text-brand-text mb-2">Our Menu</h1>
        <p className="text-brand-muted mb-8">Freshly made, just for you.</p>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              !selectedCategory ? 'bg-brand-secondary text-brand-btn-text' : 'bg-brand-card text-brand-text hover:bg-brand-accent'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedCategory === cat ? 'bg-brand-secondary text-brand-btn-text' : 'bg-brand-card text-brand-text hover:bg-brand-accent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
            : paginated.length === 0
            ? <div className="col-span-3 text-center py-24 text-brand-muted">No items found in this category.</div>
            : paginated.map(item => <ItemCard key={item._id} item={item} />)
          }
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-10 h-10 rounded-full text-sm font-semibold transition-colors ${
                  p === currentPage ? 'bg-brand-secondary text-brand-btn-text' : 'bg-brand-card text-brand-text hover:bg-brand-accent'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
