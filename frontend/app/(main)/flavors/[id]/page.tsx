'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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

  return (
    <AuthGuard>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : flavor ? (
        <div className="space-y-4">
          <div className="bg-[#1E1E1E] p-4 rounded">
            <h1 className="text-xl font-bold mb-4">{flavor.name}</h1>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="p-2 font-semibold">Description</td>
                  <td className="p-2">{flavor.description || '-'}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">Profile</td>
                  <td className="p-2">{flavor.profile || '-'}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">Brand</td>
                  <td className="p-2">{flavor.brand.name}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {canEdit && (
            <Link href={`/flavors/${flavor.id}/edit`} className="px-4 py-2 bg-accent text-black rounded">
              Edit
            </Link>
          )}
        </div>
      ) : null}
    </AuthGuard>
  );
}
