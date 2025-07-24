'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthGuard from '../../../components/AuthGuard';
import Spinner from '../../../components/Spinner';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

interface ApiFlavor {
  id: number;
  name: string;
  description: string;
  profile: string;
  brand: { id: number; name: string };
}

interface ApiBrand {
  id: number;
  name: string;
}

const profileLabels: Record<string, string> = {
  Sweet: 'Сладкий',
  Fruity: 'Фруктовый',
  Minty: 'Мятный',
  Creamy: 'Сливочный',
  Rich: 'Насыщенный',
  Tobacco: 'Табачный',
};

export default function FlavorsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [flavors, setFlavors] = useState<ApiFlavor[]>([]);
  const [brands, setBrands] = useState<ApiBrand[]>([]);
  const [profiles, setProfiles] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [brandId, setBrandId] = useState<string>('');
  const [profile, setProfile] = useState('');
  const [sort, setSort] = useState('name_asc');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);

  const permissions = user?.permissions?.map((p: any) => p.code) || [];
  const canView = permissions.includes('flavors:view');
  const canCreate = permissions.includes('flavors:create');
  const canUpdate = permissions.includes('flavors:update');
  const canDelete = permissions.includes('flavors:delete');

  useEffect(() => {
    if (!canView) return;
    api.get<ApiBrand[]>('/brands').then(res => setBrands(res.data));
    api.get<ApiFlavor[]>('/flavors').then(res => {
      const unique = Array.from(
        new Set(res.data.map(f => f.profile).filter(Boolean)),
      );
      setProfiles(unique);
    });
  }, [canView]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearch(params.get('search') || '');
    setBrandId(params.get('brandId') || '');
    setProfile(params.get('profile') || '');
    setSort(params.get('sort') || 'name_asc');
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (brandId) params.set('brandId', brandId);
    if (profile) params.set('profile', profile);
    if (sort) params.set('sort', sort);
    router.replace(`/flavors?${params.toString()}`);
  }, [search, brandId, profile, sort, router]);

  useEffect(() => {
    if (!canView) return;
    setLoading(true);
    api
      .get<ApiFlavor[]>('/flavors', {
        params: {
          search: search || undefined,
          brandId: brandId || undefined,
          profile: profile || undefined,
          sort: sort || undefined,
        },
      })
      .then(res => setFlavors(res.data))
      .finally(() => setLoading(false));
  }, [search, brandId, profile, sort, canView]);

  const toggleSelect = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    );
  };

  const allSelected =
    flavors.length > 0 && selected.length === flavors.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected([]);
    } else {
      setSelected(flavors.map(f => f.id));
    }
  };

  const deleteSelected = async () => {
    if (
      !canDelete ||
      selected.length === 0 ||
      !window.confirm('Вы уверены, что хотите удалить выбранные вкусы?')
    ) {
      return;
    }
    for (const id of selected) {
      try {
        await api.delete(`/flavors/${id}`);
      } catch (err) {
        console.error(err);
      }
    }
    setFlavors(prev => prev.filter(f => !selected.includes(f.id)));
    setSelected([]);
  };

  if (!canView) {
    return (
      <AuthGuard>
        <p>У вас нет прав для просмотра вкусов.</p>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="space-y-4 p-4 max-w-screen-xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
          <input
            type="text"
            placeholder="Поиск"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-[#1E1E1E] p-2 rounded w-full sm:w-64"
          />
          <select
            value={brandId}
            onChange={e => setBrandId(e.target.value)}
            className="bg-[#1E1E1E] p-2 rounded w-full sm:w-auto"
          >
            <option value="">Все бренды</option>
            {brands.map(b => (
              <option key={b.id} value={b.id.toString()}>
                {b.name}
              </option>
            ))}
          </select>
          <select
            value={profile}
            onChange={e => setProfile(e.target.value)}
            className="bg-[#1E1E1E] p-2 rounded w-full sm:w-auto"
          >
            <option value="">Все профили</option>
            {profiles.map(p => (
              <option key={p} value={p}>
                {profileLabels[p] || p}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-[#1E1E1E] p-2 rounded w-full sm:w-auto"
          >
            <option value="name_asc">Название A→Я</option>
            <option value="name_desc">Название Я→A</option>
          </select>
          {canCreate && (
            <Link href="/flavors/new" className="w-full sm:w-auto sm:ml-auto px-3 py-2 bg-accent text-black rounded text-center">
              + Добавить вкус
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
                  {canDelete && (
                    <th className="p-2">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                      />
                    </th>
                  )}
                  <th className="p-2">Название</th>
                  <th className="p-2">Профиль</th>
                  <th className="p-2">Бренд</th>
                  <th className="p-2">Действия</th>
                </tr>
              </thead>
              <tbody>
              {flavors.map(f => (
                <tr key={f.id} className="border-t border-gray-700 flex flex-col sm:table-row">
                  {canDelete && (
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selected.includes(f.id)}
                        onChange={() => toggleSelect(f.id)}
                      />
                    </td>
                  )}
                  <td className="p-2">{f.name}</td>
                  <td className="p-2">{f.profile ? profileLabels[f.profile] || f.profile : '-'}</td>
                  <td className="p-2">{f.brand.name}</td>
                  <td className="p-2 space-x-2">
                    <Link href={`/flavors/${f.id}`} className="px-2 py-1 bg-accent text-black rounded">
                      Просмотр
                    </Link>
                    {canUpdate && (
                      <Link href={`/flavors/${f.id}/edit`} className="px-2 py-1 bg-accent text-black rounded">
                        Редактировать
                      </Link>
                    )}
                    {canDelete && (
                      <button
                        onClick={async () => {
                          if (
                            window.confirm('Вы уверены, что хотите удалить выбранные вкусы?')
                          ) {
                            try {
                              await api.delete(`/flavors/${f.id}`);
                              setFlavors(prev => prev.filter(fl => fl.id !== f.id));
                            } catch (err) {
                              alert('Не удалось удалить вкус');
                            }
                          }
                        }}
                        className="px-2 py-1 bg-red-600 text-white rounded"
                      >
                        Удалить
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}
        {canDelete && selected.length > 0 && (
          <div className="fixed bottom-4 inset-x-0 flex justify-center z-10">
            <button
              onClick={deleteSelected}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Удалить выбранные
            </button>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
