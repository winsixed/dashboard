'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
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
      .catch(() => setError('Не удалось загрузить бренд'))
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
        <div className="space-y-4 p-4 max-w-screen-sm mx-auto">
          <div className="bg-[#1E1E1E] p-4 rounded space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl font-bold">{brand.name}</h1>
              {(canEdit || canDelete) && (
                <div className="mt-4 sm:mt-0 space-y-2 sm:space-y-0 sm:space-x-2 text-center sm:text-right">
                  {canEdit && (
                    <Link
                      href={`/brands/${brand.id}/edit`}
                      className="block w-full sm:w-auto px-4 py-2 bg-accent text-black rounded"
                    >
                      Редактировать
                    </Link>
                  )}
                  {canDelete && (
                    <button
                      onClick={async () => {
                        if (window.confirm('Вы уверены, что хотите удалить этот бренд?')) {
                          try {
                            await api.delete(`/brands/${brand.id}`);
                            toast.success('Бренд удалён');
                            router.push('/brands');
                          } catch (err) {
                            toast.error('Не удалось удалить бренд');
                          }
                        }
                      }}
                      className="block w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              )}
            </div>
            <h2 className="text-lg font-semibold mb-2">Вкусы</h2>
            {flavors.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="p-2 text-left">Название</th>
                      <th className="p-2 text-left">Описание</th>
                      <th className="p-2 text-left">Профиль</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flavors.map(f => (
                      <tr key={f.id} className="border-t border-gray-700 flex flex-col sm:table-row">
                        <td className="p-2">{f.name}</td>
                        <td className="p-2">{f.description || '-'}</td>
                        <td className="p-2">{f.profile || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Вкусы не найдены</p>
            )}
          </div>
        </div>
      ) : null}
    </AuthGuard>
  );
}
