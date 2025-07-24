'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '../../../components/AuthGuard';
import Spinner from '../../../components/Spinner';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

interface ApiFlavor {
  id: number;
  name: string;
  description: string;
  profile: string;
  brand: { id: number; name: string };
}

interface ApiBrand {
  id: number;
  name: string;
}

export default function FlavorsPage() {
  const { user } = useAuth();
  const [flavors, setFlavors] = useState<ApiFlavor[]>([]);
  const [brands, setBrands] = useState<ApiBrand[]>([]);
  const [search, setSearch] = useState('');
  const [brandId, setBrandId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);

  const permissions = user?.permissions?.map((p: any) => p.code) || [];
  const canView = permissions.includes('flavors:view');
  const canCreate = permissions.includes('flavors:create');

  useEffect(() => {
    if (!canView) return;
    api.get<ApiBrand[]>('/brands').then(res => setBrands(res.data));
  }, [canView]);

  useEffect(() => {
    if (!canView) return;
    setLoading(true);
    api
      .get<ApiFlavor[]>('/flavors', {
        params: {
          search: search || undefined,
          brandId: brandId || undefined,
        },
      })
      .then(res => setFlavors(res.data))
      .finally(() => setLoading(false));
  }, [search, brandId, canView]);

  if (!canView) {
    return (
      <AuthGuard>
        <p>You do not have permission to view flavors.</p>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="space-y-4">
        <div className="flex space-x-2 items-center">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-[#1E1E1E] p-2 rounded w-64"
          />
          <select
            value={brandId}
            onChange={e => setBrandId(e.target.value ? Number(e.target.value) : '')}
            className="bg-[#1E1E1E] p-2 rounded"
          >
            <option value="">All Brands</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          {canCreate && (
            <Link href="/flavors/new" className="ml-auto px-3 py-2 bg-accent text-black rounded">
              + Add Flavor
            </Link>
          )}
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full text-sm text-left bg-[#1E1E1E] rounded">
            <thead>
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Profile</th>
                <th className="p-2">Brand</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flavors.map(f => (
                <tr key={f.id} className="border-t border-gray-700">
                  <td className="p-2">{f.name}</td>
                  <td className="p-2">{f.profile || '-'}</td>
                  <td className="p-2">{f.brand.name}</td>
                  <td className="p-2">
                    <Link href={`/flavors/${f.id}`} className="px-2 py-1 bg-accent text-black rounded">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AuthGuard>
  );
}
