'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import AuthGuard from '../../../components/AuthGuard';
import Spinner from '../../../components/Spinner';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

interface ApiBrand {
  id: number;
  name: string;
}

export default function BrandsPage() {
  const { user } = useAuth();
  const [brands, setBrands] = useState<ApiBrand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ApiBrand[]>('/brands')
      .then(res => setBrands(res.data))
      .finally(() => setLoading(false));
  }, []);

  const permissions = user?.permissions?.map((p: any) => p.code) || [];
  const canCreate = permissions.includes('brands:create');

  return (
    <AuthGuard>
      <div className="space-y-4">
        <div className="flex justify-end">
          {canCreate && (
            <Link href="/brands/new" className="px-3 py-2 bg-accent text-black rounded">
              + Add Brand
            </Link>
          )}
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full text-sm text-left bg-[#1E1E1E] rounded">
            <thead>
              <tr>
                <th className="p-2">ID</th>
                <th className="p-2">Name</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map(b => (
                <tr key={b.id} className="border-t border-gray-700">
                  <td className="p-2">{b.id}</td>
                  <td className="p-2">{b.name}</td>
                  <td className="p-2">
                    <Link href={`/brands/${b.id}`} className="px-2 py-1 bg-accent text-black rounded">
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
