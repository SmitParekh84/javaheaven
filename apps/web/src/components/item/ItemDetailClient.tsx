'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useCart } from '@/components/providers/CartContext';
import { ShoppingCartIcon } from '@heroicons/react/24/solid';

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  images?: string[];
}

interface SimilarItem extends MenuItem {}

const SIZES = ['Small', 'Medium', 'Large'] as const;
type Size = typeof SIZES[number];

const PRICE_MULTIPLIER: Record<Size, number> = {
  Small: 0.5,
  Medium: 1,
  Large: 1.5,
};

export default function ItemDetailClient({
  item,
  similar,
}: {
  item: MenuItem;
  similar: SimilarItem[];
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<Size | ''>('');
  const [adding, setAdding] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const images = item.images?.length ? item.images : item.imageUrl ? [item.imageUrl] : [];

  const calcPrice = (size: Size | '') => {
    if (!size) return item.price;
    return Math.round(item.price * PRICE_MULTIPLIER[size]);
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error('Please select a cup size.');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to add items to your cart.');
      router.push('/login');
      return;
    }
    setAdding(true);
    try {
      addToCart({
        id: item._id,
        _id: item._id,
        name: item.name,
        price: calcPrice(selectedSize),
        quantity: 1,
        size: selectedSize,
        imageUrl: item.imageUrl,
      });
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-brand-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Item detail */}
        <div className="bg-brand-card rounded-2xl shadow-sm p-6 md:p-10 flex flex-col md:flex-row gap-10 mb-14">
          {/* Images */}
          <div className="md:w-1/2 shrink-0">
            {images.length > 0 && (
              <>
                <div className="relative w-full h-72 rounded-xl overflow-hidden bg-brand-accent mb-3">
                  <Image
                    src={images[activeImage]}
                    alt={item.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                          i === activeImage ? 'border-brand-secondary' : 'border-transparent'
                        }`}
                      >
                        <Image src={img} alt={`${item.name} ${i + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between flex-grow">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-brand-text mb-3">{item.name}</h1>
              {item.description && (
                <p className="text-brand-muted text-lg leading-relaxed mb-4">{item.description}</p>
              )}
              {item.category && (
                <span className="inline-block bg-brand-accent text-brand-secondary text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  {item.category}
                </span>
              )}
              <p className="text-2xl font-bold text-brand-secondary mb-6">
                ₹ {calcPrice(selectedSize)}
              </p>
            </div>

            {/* Size selector */}
            <div>
              <h3 className="text-sm font-semibold text-brand-muted mb-3">Select Size</h3>
              <div className="flex gap-3 flex-wrap mb-6">
                {SIZES.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-colors ${
                      selectedSize === size
                        ? 'bg-brand-secondary text-brand-btn-text'
                        : 'bg-brand-accent text-brand-text hover:bg-brand-muted/20'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!selectedSize || adding}
                className="flex items-center gap-2 bg-brand-secondary text-brand-btn-text px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                {adding ? 'Adding…' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>

        {/* Similar items */}
        {similar.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-brand-text mb-6">Similar Items</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {similar.slice(0, 8).map(s => (
                <a
                  key={s._id}
                  href={`/item/${s._id}`}
                  className="bg-brand-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="relative h-40 w-full bg-brand-accent">
                    {s.imageUrl && (
                      <Image
                        src={s.imageUrl}
                        alt={s.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-brand-text text-sm truncate">{s.name}</p>
                    <p className="text-brand-secondary text-sm font-bold mt-0.5">₹ {s.price}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
