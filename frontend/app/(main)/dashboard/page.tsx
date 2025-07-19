'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import AuthGuard from '../../../components/AuthGuard';
import Spinner from '../../../components/Spinner';
import Card from '../../../components/Card';
import Table from '../../../components/Table';

interface Summary {
  usersCount: number;
  brandsCount: number;
  flavorsCount: number;
  requestsByStatus: Record<string, number>;
  latestRequests: {
    id: number;
    status: string;
    user: { name: string };
    comment: string;
    flavors: string[];
  }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/summary').then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  if (!data) return <p>No data</p>;

  return (
    <AuthGuard>
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card title="Users" value={data.usersCount} />
          <Card title="Brands" value={data.brandsCount} />
          <Card title="Flavors" value={data.flavorsCount} />
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">Requests by status</h2>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(data.requestsByStatus).map(([status, count]) => (
              <Card key={status} title={status} value={count} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">Latest Requests</h2>
          <Table requests={data.latestRequests} />
        </div>
      </div>
    </AuthGuard>
  );
}
