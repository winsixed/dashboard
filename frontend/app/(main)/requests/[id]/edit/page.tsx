'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AuthGuard from '../../../../../components/AuthGuard';
import Spinner from '../../../../../components/Spinner';
import api from '../../../../../lib/api';
import { useAuth } from '../../../../../context/AuthContext';

interface ApiFlavor {
  id: number;
  name: string;
}

interface ApiRequest {
  id: number;
  flavorId: number;
  quantity: number;
  note?: string;
}

export default function RequestEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [flavors, setFlavors] = useState<ApiFlavor[]>([]);
  const [flavorId, setFlavorId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [note, setNote] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const permissions = user?.permissions?.map((p: any) => p.code) || [];
  const canEdit = permissions.includes('requests:edit');

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get<ApiRequest>(`/requests/${params.id}`),
      api.get<ApiFlavor[]>(`/flavors`),
    ])
      .then(([reqRes, flavorsRes]) => {
        const req = reqRes.data;
        setFlavorId(req.flavorId);
        setQuantity(req.quantity);
        setNote(req.note || '');
        setFlavors(flavorsRes.data);
        setError('');
      })
      .catch(() => setError('Не удалось загрузить данные'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, [params.id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.patch(`/requests/${params.id}`, {
        flavorId: Number(flavorId),
        quantity: Number(quantity),
        note,
      });
      toast.success('Заявка сохранена');
      router.push(`/requests/${params.id}`);
    } catch (err) {
      toast.error('Не удалось сохранить заявку');
    } finally {
      setSaving(false);
    }
  };

  if (!canEdit) {
    return (
      <AuthGuard>
        <p>У вас нет прав для редактирования заявок.</p>
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
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AuthGuard>
  );
}
