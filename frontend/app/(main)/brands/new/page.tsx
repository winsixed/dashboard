'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AuthGuard from '../../../../components/AuthGuard';
import api from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';

export default function BrandCreatePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const permissions = user?.permissions?.map((p: any) => p.code) || [];
  const canCreate = permissions.includes('brands:create');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/brands', { name });
      toast.success('Бренд создан');
      router.push(`/brands/${res.data.id}`);
    } catch (err) {
      toast.error('Не удалось создать бренд');
    } finally {
      setSaving(false);
    }
  };

  if (!canCreate) {
    return (
      <AuthGuard>
        <p>У вас нет прав для создания брендов.</p>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="p-4 max-w-screen-sm mx-auto">
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <p className="text-red-500">{error}</p>}
          <div>
            <label className="block mb-1">Название</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-2 bg-[#1E1E1E] rounded"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-4 py-2 bg-accent text-black rounded disabled:opacity-50 block mx-auto"
          >
            {saving ? 'Сохранение...' : 'Создать бренд'}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}
