"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import AuthGuard from '../../../components/AuthGuard';
import Spinner from '../../../components/Spinner';
import StatusBadge from '../../../components/StatusBadge';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

interface ApiRequest {
  id: number;
  status: string;
  createdAt: string;
  createdBy: { firstName: string; lastName: string };
  flavors: { id: number; name: string }[];
}

export default function RequestsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const permissions = user?.permissions?.map((p: any) => p.code) || [];
  const canView = permissions.includes('requests:view');
  const canCreate = permissions.includes('requests:create');

  useEffect(() => {
    if (!canView) return;
    setLoading(true);
    api
      .get<ApiRequest[]>('/requests')
      .then(res => setRequests(res.data))
      .finally(() => setLoading(false));
  }, [canView]);

  if (!canView) {
    return (
      <AuthGuard>
        <p>You do not have permission to view requests.</p>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="space-y-4">
        {canCreate && (
          <div className="flex justify-end">
            <Link
              href="/requests/new"
              className="w-full sm:w-auto px-3 py-2 bg-accent text-black rounded text-center"
            >
              Create Request
            </Link>
          </div>
        )}
        {loading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left bg-[#1E1E1E] rounded">
              <thead>
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">Created At</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">User</th>
                  <th className="p-2">Flavors</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr
                    key={r.id}
                    onClick={() => router.push(`/requests/${r.id}`)}
                    className="border-t border-gray-700 cursor-pointer hover:bg-[#2A2A2A] flex flex-col sm:table-row"
                  >
                    <td className="p-2">{r.id}</td>
                    <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="p-2">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="p-2">
                      {r.createdBy.firstName} {r.createdBy.lastName}
                    </td>
                    <td className="p-2">{r.flavors.map(f => f.name).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

