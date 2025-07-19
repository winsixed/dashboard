'use client';

interface StatusBadgeProps {
  status: string;
}

const colors: Record<string, string> = {
  pending: 'bg-yellow-500 text-black',
  approved: 'bg-green-600 text-black',
  rejected: 'bg-red-600 text-black',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const color = colors[status] || 'bg-gray-500';
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>{status}</span>
  );
}
