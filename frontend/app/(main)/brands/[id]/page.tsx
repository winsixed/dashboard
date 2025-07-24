'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '../../../../components/AuthGuard';
import Spinner from '../../../../components/Spinner';
import api from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';

interface ApiFlavor {
  id: number;
  name: string;
  description: string;
  profile?: string;
}

interface ApiBrand {
  id: number;
  name: string;
}

export default function BrandDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [brand, setBrand] = useState<ApiBrand | null>(null);
  const [flavors, setFlavors] = useState<ApiFlavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get<ApiBrand>(`/brands/${params.id}`),
      api.get<ApiFlavor[]>('/flavors', { params: { brandId: params.id } }),
    ])
      .then(([brandRes, flavorRes]) => {
        setBrand(brandRes.data);
        setFlavors(flavorRes.data);
        setError('');
      })
      .catch(() => setError('Failed to load brand'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const permissions = user?.permissions?.map((p: any) => p.code) || [];
  const canEdit = permissions.includes('brands:edit');
  const canDelete = permissions.includes('brands:delete');

  return (
    <AuthGuard>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : brand ? (
        <div className="space-y-4">
          <div className="bg-[#1E1E1E] p-4 rounded">
            <h1 className="text-xl font-bold mb-4">{brand.name}</h1>
            <h2 className="text-lg font-semibold mb-2">Flavors</h2>
            {flavors.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-left">Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {flavors.map(f => (
                    <tr key={f.id} className="border-t border-gray-700">
                      <td className="p-2">{f.name}</td>
                      <td className="p-2">{f.description || '-'}</td>
                      <td className="p-2">{f.profile || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No flavors found</p>
            )}
          </div>
          {(canEdit || canDelete) && (
            <div className="space-x-2">
              {canEdit && (
                <Link
                  href={`/brands/${brand.id}/edit`}
                  className="px-4 py-2 bg-accent text-black rounded"
                >
                  Edit
                </Link>
              )}
              {canDelete && (
                <button
                  onClick={async () => {
                    if (
                      window.confirm('Are you sure you want to delete this brand?')
                    ) {
                      try {
                        await api.delete(`/brands/${brand.id}`);
                        router.push('/brands');
                      } catch (err) {
                        alert('Failed to delete brand');
                      }
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      ) : null}
    </AuthGuard>
  );
}
