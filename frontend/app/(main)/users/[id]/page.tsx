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
  roles: { name: string }[];
  createdAt?: string;
}

export default function UserDetailsPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [data, setData] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const permissions = user?.permissions?.map((p: any) => p.code) || [];
  const canView = permissions.includes('users:view');
  const canEdit = permissions.includes('users:edit');

  useEffect(() => {
    if (!canView) return;
    setLoading(true);
    api
      .get<ApiUser>(`/users/${params.id}`)
      .then(res => {
        setData(res.data);
        setError('');
      })
      .catch(() => setError('Failed to load user'))
      .finally(() => setLoading(false));
  }, [params.id, canView]);

  if (!canView) {
    return (
      <AuthGuard>
        <p>You do not have permission to view this user.</p>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : data ? (
        <div className="space-y-4 p-4 max-w-screen-sm mx-auto">
          <div className="bg-[#1E1E1E] p-4 rounded">
            <h1 className="text-xl font-bold mb-4">
              {data.firstName} {data.lastName}
            </h1>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <tbody>
                  <tr className="flex flex-col sm:table-row">
                    <td className="p-2 font-semibold">ID</td>
                    <td className="p-2">{data.id}</td>
                  </tr>
                  <tr className="flex flex-col sm:table-row">
                    <td className="p-2 font-semibold">First Name</td>
                    <td className="p-2">{data.firstName}</td>
                  </tr>
                  <tr className="flex flex-col sm:table-row">
                    <td className="p-2 font-semibold">Last Name</td>
                    <td className="p-2">{data.lastName}</td>
                  </tr>
                  <tr className="flex flex-col sm:table-row">
                    <td className="p-2 font-semibold">Email</td>
                    <td className="p-2">{data.email}</td>
                  </tr>
                  <tr className="flex flex-col sm:table-row">
                    <td className="p-2 font-semibold">Roles</td>
                    <td className="p-2">{data.roles.map(r => r.name).join(', ')}</td>
                  </tr>
                  <tr className="flex flex-col sm:table-row">
                    <td className="p-2 font-semibold">Created At</td>
                    <td className="p-2">{data.createdAt ? new Date(data.createdAt).toLocaleString() : ''}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {canEdit && (
            <Link href={`/users/${data.id}/edit`} className="w-full sm:w-auto px-4 py-2 bg-accent text-black rounded block text-center">
              Edit
            </Link>
          )}
        </div>
      ) : null}
    </AuthGuard>
  );
}
