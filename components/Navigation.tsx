'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-4">
      <Link
        href="/"
        className={`px-6 py-2 rounded-lg transition-all duration-200 font-semibold backdrop-blur-sm border ${
          pathname === '/'
            ? 'bg-white/30 border-white/50 shadow-md'
            : 'bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30'
        }`}
      >
        📖 Nos livres
      </Link>
      <Link
        href="/wishlist"
        className={`px-6 py-2 rounded-lg transition-all duration-200 font-semibold backdrop-blur-sm border ${
          pathname === '/wishlist'
            ? 'bg-white/30 border-white/50 shadow-md'
            : 'bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30'
        }`}
      >
        ⭐ Livres à acheter
      </Link>
    </nav>
  );
}
