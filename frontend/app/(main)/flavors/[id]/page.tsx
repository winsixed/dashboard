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
  profile: string;
  brand: { id: number; name: string };
}

export default function FlavorDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [flavor, setFlavor] = useState<ApiFlavor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get<ApiFlavor>(`/flavors/${params.id}`)
      .then(res => {
        setFlavor(res.data);
        setError('');
      })
      .catch(() => setError('Failed to load flavor'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const permissions = user?.permissions?.map((p: any) => p.code) || [];
  const canEdit = permissions.includes('flavors:edit');
  const canDelete = permissions.includes('flavors:delete');

  return (
    <AuthGuard>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : flavor ? (
        <div className="space-y-4 p-4 max-w-screen-sm mx-auto">
          <div className="bg-[#1E1E1E] p-4 rounded">
            <h1 className="text-xl font-bold mb-4">{flavor.name}</h1>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <tbody>
                  <tr className="flex flex-col sm:table-row">
                    <td className="p-2 font-semibold">Description</td>
                    <td className="p-2">{flavor.description || '-'}</td>
                  </tr>
                  <tr className="flex flex-col sm:table-row">
                    <td className="p-2 font-semibold">Profile</td>
                    <td className="p-2">{flavor.profile || '-'}</td>
                  </tr>
                  <tr className="flex flex-col sm:table-row">
                    <td className="p-2 font-semibold">Brand</td>
                    <td className="p-2">{flavor.brand.name}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {(canEdit || canDelete) && (
            <div className="space-y-2 sm:space-x-2 sm:space-y-0 flex flex-col sm:flex-row">
              {canEdit && (
                <Link
                  href={`/flavors/${flavor.id}/edit`}
                  className="w-full sm:w-auto px-4 py-2 bg-accent text-black rounded text-center"
                >
                  Edit
                </Link>
              )}
              {canDelete && (
                <button
                  onClick={async () => {
                    if (
                      window.confirm('Are you sure you want to delete this flavor?')
                    ) {
                      try {
                        await api.delete(`/flavors/${flavor.id}`);
                        router.push('/flavors');
                      } catch (err) {
                        alert('Failed to delete flavor');
                      }
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded"
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
