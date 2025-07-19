'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const items = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/requests', label: 'Requests' },
  { href: '/users', label: 'Users' },
  { href: '/roles', label: 'Roles' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/audit-logs', label: 'Audit Logs' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-[#1E1E1E] p-4 space-y-2 hidden md:block">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={clsx(
            'block px-3 py-2 rounded hover:bg-[#2A2A2A]',
            pathname === item.href && 'bg-[#2A2A2A]'
          )}
        >
          {item.label}
        </Link>
      ))}
    </aside>
  );
}
