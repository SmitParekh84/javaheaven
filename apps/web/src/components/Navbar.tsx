'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight, faEnvelope, faSignOutAlt, faUser,
  faBars, faXmark, faShoppingCart, faShoppingBasket,
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { useCart } from './providers/CartContext';
import { useUser } from './providers/UserContext';
import { Tenant } from '@/types/tenant';

const ADMIN_NAV = [
  { name: 'Dashboard',       href: '/admin/dashboard' },
  { name: 'Orders',          href: '/admin/orders' },
  { name: 'Edit Menu',       href: '/admin/edit' },
  { name: 'Revenue',         href: '/admin/revenue' },
  { name: 'Add Item',        href: '/admin/add-menu-item' },
  { name: 'Stock',           href: '/admin/stock' },
  { name: 'Best Selling',    href: '/admin/best-selling' },
];

interface ProfileMenuProps {
  username: string;
  email:    string;
  loading:  boolean;
  onLogout: () => void;
  onClose:  () => void;
}

function ProfileMenu({ username, email, loading, onLogout, onClose }: ProfileMenuProps) {
  return (
    <div className="absolute right-0 mt-2 w-56 bg-brand-card border border-brand-muted rounded-lg shadow-xl z-[100]">
      <div className="px-4 py-3 flex items-center text-brand-text">
        <FontAwesomeIcon icon={faUser} className="mr-2 text-brand-muted" />
        <Link href="/profile" className="hover:text-brand-secondary font-semibold truncate" onClick={onClose}>
          {username}
        </Link>
      </div>
      <div className="px-4 py-2 flex items-center text-sm text-brand-muted">
        <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
        <span className="truncate">{email}</span>
      </div>
      <div className="border-t border-brand-muted/30" />
      <button
        onClick={onLogout}
        disabled={loading}
        className={`flex items-center justify-center w-full px-4 py-2 text-sm text-danger hover:bg-brand-accent rounded-b-lg transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
        {loading ? 'Logging out…' : 'Logout'}
      </button>
    </div>
  );
}

export default function Navbar({ tenant }: { tenant: Tenant }) {
  const router = useRouter();
  const { totalItems } = useCart();
  const { user, signOut } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.app_metadata?.role === 'admin';
  const username = (user?.user_metadata?.name as string) ?? user?.email ?? 'Guest';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      setMobileOpen(false);
      setShowProfileMenu(false);
      router.push('/');
      router.refresh();
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to logout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navLinkClass = 'text-sm font-semibold leading-6 text-brand-text hover:text-brand-secondary transition-colors';
  const mobileLinkClass = '-mx-3 block rounded-lg py-2 px-3 text-base font-semibold text-brand-text hover:bg-brand-accent transition-colors';

  return (
    <header className="bg-brand-bg border-b border-brand-muted/20 sticky top-0 z-50">
      <nav className="flex items-center justify-between px-6 py-4 lg:px-10 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="-m-1.5 p-1.5 flex-shrink-0">
          <span className="sr-only">{tenant.brandName}</span>
          <Image src={tenant.assets.logoUrl} alt={`${tenant.brandName} logo`} width={64} height={64} className="h-14 w-auto object-contain" />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex lg:gap-x-10">
          {(!user || !isAdmin) && (
            <>
              <Link href="/" className={navLinkClass}>Home</Link>
              <Link href="/about" className={navLinkClass}>About</Link>
              <Link href="/leadership-team" className={navLinkClass}>Leadership</Link>
              <Link href="/menu" className={navLinkClass}>Menu</Link>
            </>
          )}
          {user && !isAdmin && (
            <>
              <Link href="/my-orders" className={navLinkClass}>My Orders</Link>
              <Link href="/cart" className={`${navLinkClass} flex items-center gap-1`}>
                <FontAwesomeIcon icon={faShoppingCart} />
                <span>Cart {totalItems > 0 && `(${totalItems})`}</span>
              </Link>
            </>
          )}
          {user && isAdmin && ADMIN_NAV.map(item => (
            <Link key={item.href} href={item.href} className={navLinkClass}>{item.name}</Link>
          ))}
        </div>

        {/* Desktop right */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowProfileMenu(v => !v)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-text hover:text-brand-secondary transition-colors"
                aria-haspopup="true"
                aria-expanded={showProfileMenu}
              >
                <FontAwesomeIcon icon={faUser} />
                <span className="truncate max-w-[120px]">{username}</span>
              </button>
              {showProfileMenu && (
                <ProfileMenu
                  username={username}
                  email={user.email ?? ''}
                  loading={loading}
                  onLogout={handleLogout}
                  onClose={() => setShowProfileMenu(false)}
                />
              )}
            </div>
          ) : (
            <Link href="/login" className="text-sm bg-brand-secondary rounded-full py-2 px-8 font-semibold text-brand-btn-text shadow-md hover:scale-105 transition-transform">
              <span className="mr-2">Log in</span>
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          )}
        </div>

        {/* Mobile bar */}
        <div className="flex items-center gap-3 lg:hidden">
          {user && !isAdmin && (
            <Link href="/cart" className="relative text-brand-text hover:text-brand-secondary">
              <FontAwesomeIcon icon={faShoppingBasket} className="text-2xl" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-secondary text-brand-btn-text rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
          )}
          {!user && (
            <Link href="/login" className="text-sm bg-brand-secondary rounded-full py-1.5 px-5 font-semibold text-brand-btn-text">
              Log in
            </Link>
          )}
          <button onClick={() => setMobileOpen(true)} className="p-2 text-brand-text">
            <span className="sr-only">Open menu</span>
            <FontAwesomeIcon icon={faBars} className="text-2xl" />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-brand-bg px-6 py-6 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <Link href="/" onClick={() => setMobileOpen(false)}>
                <Image src={tenant.assets.logoUrl} alt={tenant.brandName} width={56} height={56} className="h-14 w-auto object-contain" />
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-2 text-brand-text">
                <FontAwesomeIcon icon={faXmark} className="text-2xl" />
              </button>
            </div>

            <div className="space-y-1">
              {(!user || !isAdmin) && (
                <>
                  <Link href="/" onClick={() => setMobileOpen(false)} className={mobileLinkClass}>Home</Link>
                  <Link href="/menu" onClick={() => setMobileOpen(false)} className={mobileLinkClass}>Menu</Link>
                  <Link href="/leadership-team" onClick={() => setMobileOpen(false)} className={mobileLinkClass}>Leadership</Link>
                  <Link href="/about" onClick={() => setMobileOpen(false)} className={mobileLinkClass}>About</Link>
                </>
              )}
              {user && isAdmin && ADMIN_NAV.map(item => (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={mobileLinkClass}>
                  {item.name}
                </Link>
              ))}
              {user && !isAdmin && (
                <>
                  <Link href="/my-orders" onClick={() => setMobileOpen(false)} className={mobileLinkClass}>My Orders</Link>
                  <Link href="/cart" onClick={() => setMobileOpen(false)} className={mobileLinkClass}>
                    Cart {totalItems > 0 && `(${totalItems})`}
                  </Link>
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className={mobileLinkClass}>Profile</Link>
                </>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-brand-muted/30">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="block w-full text-center py-2 px-4 rounded-lg text-danger font-semibold hover:bg-brand-accent transition-colors"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center bg-brand-secondary text-brand-btn-text rounded-full py-2 px-8 font-semibold hover:scale-105 transition-transform"
                >
                  Log in <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
