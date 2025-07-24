'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AuthGuard from '../../../../components/AuthGuard';
import Spinner from '../../../../components/Spinner';
import api from '../../../../lib/api';

interface ApiPermission {
  id: number;
  code: string;
  description: string;
}

interface ApiRole {
  id: number;
  name: string;
  permissions: ApiPermission[];
}

export default function RoleEditPage() {
  const params = useParams<{ id: string }>();
  const [role, setRole] = useState<ApiRole | null>(null);
  const [permissions, setPermissions] = useState<ApiPermission[]>([]);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get<ApiRole>(`/roles/${params.id}`),
      api.get<ApiPermission[]>('/permissions'),
    ])
      .then(([roleRes, permsRes]) => {
        setRole(roleRes.data);
        setName(roleRes.data.name);
        setSelected(roleRes.data.permissions.map(p => p.id));
        setPermissions(permsRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, [params.id]);

  const togglePermission = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setSaving(true);
    try {
      await api.put(`/roles/${params.id}`, {
        name,
        permissionIds: selected,
      });
      fetchData();
    } catch (err) {
      alert('Не удалось сохранить роль');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard>
      {loading || !role ? (
        <Spinner />
      ) : (
        <div className="p-4 max-w-screen-sm mx-auto">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Название</label>
              <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-2 bg-[#1E1E1E] rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Права</label>
            <div className="space-y-1">
              {permissions.map(p => (
                <label key={p.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(p.id)}
                    onChange={() => togglePermission(p.id)}
                  />
                  <span>{p.code}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-4 py-2 bg-accent text-black rounded disabled:opacity-50 block mx-auto"
          >
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
          </form>
        </div>
      )}
    </AuthGuard>
  );
}
