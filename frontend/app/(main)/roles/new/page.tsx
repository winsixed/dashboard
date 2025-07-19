'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '../../../../components/AuthGuard';
import Spinner from '../../../../components/Spinner';
import api from '../../../../lib/api';

interface ApiPermission {
  id: number;
  code: string;
  description: string;
}

export default function RoleCreatePage() {
  const [permissions, setPermissions] = useState<ApiPermission[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    api
      .get<ApiPermission[]>('/permissions')
      .then(res => setPermissions(res.data))
      .catch(() => setError('Failed to load permissions'))
      .finally(() => setLoading(false));
  }, []);

  const togglePermission = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/roles', { name, permissionIds: selected });
      router.push('/roles');
    } catch (err) {
      setError('Failed to create role');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard>
      {loading ? (
        <Spinner />
      ) : (
        <form onSubmit={onSubmit} className="space-y-4 max-w-md">
          {error && <p className="text-red-500">{error}</p>}
          <div>
            <label className="block mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-2 bg-[#1E1E1E] rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Permissions</label>
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
            className="px-4 py-2 bg-accent text-black rounded disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Create Role'}
          </button>
        </form>
      )}
    </AuthGuard>
  );
}
