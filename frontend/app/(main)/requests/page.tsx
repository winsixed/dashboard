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

interface ApiBrand {
  id: number;
  name: string;
}

export default function RequestsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [brands, setBrands] = useState<ApiBrand[]>([]);
  const [status, setStatus] = useState<string>('');
  const [brandId, setBrandId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [sort, setSort] = useState<string>('createdAt_desc');
  const [loading, setLoading] = useState(true);

  const permissions = user?.permissions?.map((p: any) => p.code) || [];
  const canView = permissions.includes('requests:view');
  const canCreate = permissions.includes('requests:create');

  useEffect(() => {
    api.get<ApiBrand[]>('/brands').then(res => setBrands(res.data));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setStatus(params.get('status') || '');
    setBrandId(params.get('brandId') || '');
    setDate(params.get('date') || '');
    setSort(params.get('sort') || 'createdAt_desc');
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (brandId) params.set('brandId', brandId);
    if (date) params.set('date', date);
    if (sort) params.set('sort', sort);
    router.replace(`/requests?${params.toString()}`);
  }, [status, brandId, date, sort, router]);

  useEffect(() => {
    if (!canView) return;
    setLoading(true);
    api
      .get<ApiRequest[]>('/requests', {
        params: {
          status: status || undefined,
          brandId: brandId || undefined,
          date: date || undefined,
          sort: sort || undefined,
        },
      })
      .then(res => {
        let data = res.data;
        if (sort === 'flavor_asc') {
          data = [...data].sort((a, b) => {
            const an = a.flavors[0]?.name || '';
            const bn = b.flavors[0]?.name || '';
            return an.localeCompare(bn, 'ru');
          });
        } else if (sort === 'flavor_desc') {
          data = [...data].sort((a, b) => {
            const an = a.flavors[0]?.name || '';
            const bn = b.flavors[0]?.name || '';
            return bn.localeCompare(an, 'ru');
          });
        }
        setRequests(data);
      })
      .finally(() => setLoading(false));
  }, [status, brandId, date, sort, canView]);

  if (!canView) {
    return (
      <AuthGuard>
        <p>У вас нет прав для просмотра заявок.</p>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="space-y-4 p-4 max-w-screen-xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="bg-[#1E1E1E] p-2 rounded w-full sm:w-auto"
          >
            <option value="">Все статусы</option>
            <option value="pending">Новые</option>
            <option value="approved">Одобренные</option>
            <option value="rejected">Отклонённые</option>
          </select>
          <select
            value={brandId}
            onChange={e => setBrandId(e.target.value)}
            className="bg-[#1E1E1E] p-2 rounded w-full sm:w-auto"
          >
            <option value="">Все бренды</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="bg-[#1E1E1E] p-2 rounded w-full sm:w-auto"
          />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-[#1E1E1E] p-2 rounded w-full sm:w-auto"
          >
            <option value="createdAt_desc">Дата ↓</option>
            <option value="createdAt_asc">Дата ↑</option>
            <option value="flavor_asc">Вкус A→Я</option>
            <option value="flavor_desc">Вкус Я→A</option>
          </select>
          {canCreate && (
            <Link
              href="/requests/new"
              className="w-full sm:w-auto sm:ml-auto px-3 py-2 bg-accent text-black rounded text-center"
            >
              Создать заявку
            </Link>
          )}
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left bg-[#1E1E1E] rounded">
              <thead>
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">Создано</th>
                  <th className="p-2">Статус</th>
                  <th className="p-2">Пользователь</th>
                  <th className="p-2">Вкусы</th>
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

