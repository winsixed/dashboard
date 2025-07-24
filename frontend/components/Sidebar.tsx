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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden',
          isOpen ? 'block' : 'hidden'
        )}
        onClick={onClose}
      />
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 w-64 bg-[#1E1E1E] p-4 space-y-2 transform transition-transform z-50 md:static md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'md:block'
        )}
      >
        {items.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'block px-3 py-2 rounded hover:bg-[#2A2A2A]',
              pathname === item.href && 'bg-[#2A2A2A]'
            )}
            onClick={onClose}
          >
            {item.label}
          </Link>
        ))}
      </aside>
    </>
  );
}
