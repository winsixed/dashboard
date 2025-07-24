'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import AuthGuard from '../../../components/AuthGuard';
import Spinner from '../../../components/Spinner';
import api from '../../../lib/api';

interface ApiFlavor {
  id: number;
  brandId: number;
  profile: string | null;
}

interface ApiBrand {
  id: number;
  name: string;
}

interface ApiRequest {
  id: number;
  status: string;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<ApiBrand[]>([]);
  const [flavors, setFlavors] = useState<ApiFlavor[]>([]);
  const [requests, setRequests] = useState<ApiRequest[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get<ApiBrand[]>('/brands'),
      api.get<ApiFlavor[]>('/flavors'),
      api.get<ApiRequest[]>('/requests'),
    ])
      .then(([brandRes, flavorRes, requestRes]) => {
        setBrands(brandRes.data);
        setFlavors(flavorRes.data);
        setRequests(requestRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const approved = requests.filter(r => r.status === 'approved').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;

  const flavorsByBrand = brands
    .map(b => ({
      name: b.name,
      value: flavors.filter(f => f.brandId === b.id).length,
    }))
    .filter(d => d.value > 0);

  const profileMap: Record<string, number> = {};
  flavors.forEach(f => {
    const key = f.profile || 'Без профиля';
    profileMap[key] = (profileMap[key] || 0) + 1;
  });
  const flavorsByProfile = Object.entries(profileMap).map(([name, value]) => ({
    name,
    value,
  }));

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00C2FF', '#FFBB28', '#FF8042'];

  return (
    <AuthGuard>
      <div className="space-y-6 max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold">Дашборд</h1>
        {loading ? (
          <Spinner />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4">
              <div className="bg-[#1E1E1E] p-4 rounded text-center shadow">
                <div className="text-sm text-gray-400">Вкусы</div>
                <div className="text-2xl font-semibold">{flavors.length}</div>
              </div>
              <div className="bg-[#1E1E1E] p-4 rounded text-center shadow">
                <div className="text-sm text-gray-400">Заявки</div>
                <div className="text-2xl font-semibold">{requests.length}</div>
              </div>
              <div className="bg-[#1E1E1E] p-4 rounded text-center shadow">
                <div className="text-sm text-gray-400">Одобрено</div>
                <div className="text-2xl font-semibold">{approved}</div>
              </div>
              <div className="bg-[#1E1E1E] p-4 rounded text-center shadow">
                <div className="text-sm text-gray-400">Отклонено</div>
                <div className="text-2xl font-semibold">{rejected}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
              <div className="bg-[#1E1E1E] p-4 rounded w-full overflow-auto">
                <h2 className="text-lg font-semibold mb-2">Вкусы по брендам</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={flavorsByBrand}>
                    <XAxis dataKey="name" stroke="#fff" />
                    <YAxis stroke="#fff" allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#00C2FF" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-[#1E1E1E] p-4 rounded w-full overflow-auto">
                <h2 className="text-lg font-semibold mb-2">Профили вкусов</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={flavorsByProfile} dataKey="value" nameKey="name" label>
                      {flavorsByProfile.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
