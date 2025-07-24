'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AuthGuard from '../../../../components/AuthGuard';
import Spinner from '../../../../components/Spinner';
import api from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';

interface ApiFlavor {
  id: number;
  name: string;
}

export default function RequestCreatePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [flavors, setFlavors] = useState<ApiFlavor[]>([]);
  const [flavorId, setFlavorId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [note, setNote] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<ApiFlavor[]>('/flavors')
      .then(res => setFlavors(res.data))
      .catch(() => setError('Не удалось загрузить вкусы'))
      .finally(() => setLoading(false));
  }, []);

  const permissions = user?.permissions?.map((p: any) => p.code) || [];
  const canCreate = permissions.includes('requests:create');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/requests', {
        flavorId: Number(flavorId),
        quantity: Number(quantity),
        note,
      });
      toast.success('Заявка создана');
      router.push(`/requests/${res.data.id}`);
    } catch (err) {
      toast.error('Не удалось создать заявку');
    } finally {
      setSaving(false);
    }
  };

  if (!canCreate) {
    return (
      <AuthGuard>
        <p>У вас нет прав для создания заявок.</p>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      {loading ? (
        <Spinner />
      ) : (
        <div className="p-4 max-w-screen-sm mx-auto">
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <p className="text-red-500">{error}</p>}
            <div>
              <label className="block mb-1">Вкус</label>
              <select
                value={flavorId}
                onChange={e => setFlavorId(Number(e.target.value))}
                className="w-full p-2 bg-[#1E1E1E] text-white rounded"
              >
                <option value="" disabled>
                  Выберите вкус
                </option>
                {flavors.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Количество</label>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full p-2 bg-[#1E1E1E] text-white rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Комментарий</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full p-2 bg-[#1E1E1E] text-white rounded"
              />
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-4 py-2 bg-accent text-black rounded disabled:opacity-50"
              >
                {saving ? 'Сохранение...' : 'Создать заявку'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AuthGuard>
  );
}
