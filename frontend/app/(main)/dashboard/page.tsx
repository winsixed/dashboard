'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '../../../components/AuthGuard';
import Spinner from '../../../components/Spinner';
import Card from '../../../components/Card';
import StatusBadge from '../../../components/StatusBadge';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

interface RequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface CountStat {
  total: number;
}

interface ApiRequest {
  id: number;
  status: string;
  createdAt: string;
  createdBy: { firstName: string; lastName: string };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const permissions = user?.permissions?.map((p: any) => p.code) || [];
  const canView = permissions.includes('dashboard:view');

  const [loading, setLoading] = useState(true);
  const [requestStats, setRequestStats] = useState<RequestStats | null>(null);
  const [flavorsTotal, setFlavorsTotal] = useState<number>(0);
  const [usersTotal, setUsersTotal] = useState<number>(0);
  const [latestRequests, setLatestRequests] = useState<ApiRequest[]>([]);

  useEffect(() => {
    if (!canView) return;
    setLoading(true);
    Promise.all([
      api.get<RequestStats>('/stats/requests'),
      api.get<CountStat>('/stats/flavors'),
      api.get<CountStat>('/stats/users'),
      api.get<ApiRequest[]>('/requests?limit=5&sort=desc'),
    ])
      .then(([reqRes, flvRes, usrRes, latestRes]) => {
        setRequestStats(reqRes.data);
        setFlavorsTotal(flvRes.data.total);
        setUsersTotal(usrRes.data.total);
        setLatestRequests(latestRes.data);
      })
      .finally(() => setLoading(false));
  }, [canView]);

  if (!canView) {
    return (
      <AuthGuard>
        <p>You do not have permission to view the dashboard.</p>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-6 p-4 max-w-screen-xl mx-auto">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card title="Requests" value={requestStats?.total ?? 0} />
            <Card title="Flavors" value={flavorsTotal} />
            <Card title="Users" value={usersTotal} />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Latest Requests</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left bg-[#1E1E1E] rounded">
                <thead>
                  <tr>
                    <th className="p-2">ID</th>
                    <th className="p-2">User</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {latestRequests.map(r => (
                    <tr
                      key={r.id}
                      onClick={() => router.push(`/requests/${r.id}`)}
                      className="border-t border-gray-700 cursor-pointer hover:bg-[#2A2A2A] flex flex-col sm:table-row"
                    >
                      <td className="p-2">{r.id}</td>
                      <td className="p-2">
                        {r.createdBy.firstName} {r.createdBy.lastName}
                      </td>
                      <td className="p-2">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="p-2">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
