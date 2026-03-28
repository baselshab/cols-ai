'use client';

import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="absolute left-4 top-4">
        <Link href="/" className="text-xl font-bold text-primary">
          COLS
        </Link>
      </div>
      {children}
    </div>
  );
}
