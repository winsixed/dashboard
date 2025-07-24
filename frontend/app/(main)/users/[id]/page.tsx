'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '../../../../components/AuthGuard';
import Spinner from '../../../../components/Spinner';
import api from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';

interface ApiUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: { name: string };
  createdAt: string;
}

export default function UserDetailsPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [data, setData] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get<ApiUser>(`/users/${params.id}`)
      .then(res => {
        setData(res.data);
        setError('');
      })
      .catch(() => setError('Failed to load user'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const permissions = user?.permissions?.map((p: any) => p.code) || [];
  const canEdit = permissions.includes('users:edit');

  return (
    <AuthGuard>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : data ? (
        <div className="space-y-4">
          <div className="bg-[#1E1E1E] p-4 rounded">
            <h1 className="text-xl font-bold mb-4">
              {data.firstName} {data.lastName}
            </h1>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="p-2 font-semibold">Email</td>
                  <td className="p-2">{data.email}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">Role</td>
                  <td className="p-2">{data.role.name}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">Created At</td>
                  <td className="p-2">
                    {data.createdAt ? new Date(data.createdAt).toLocaleString() : ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {canEdit && (
            <Link href={`/users/${data.id}/edit`} className="px-4 py-2 bg-accent text-black rounded">
              Edit
            </Link>
          )}
        </div>
      ) : null}
    </AuthGuard>
  );
}
