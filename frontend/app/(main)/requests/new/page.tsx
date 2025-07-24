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
      .catch(() => setError('Failed to load flavors'))
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
      toast.success('Request created');
      router.push(`/requests/${res.data.id}`);
    } catch (err) {
      toast.error('Failed to create request');
    } finally {
      setSaving(false);
    }
  };

  if (!canCreate) {
    return (
      <AuthGuard>
        <p>You do not have permission to create requests.</p>
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
              <label className="block mb-1">Flavor</label>
              <select
                value={flavorId}
                onChange={e => setFlavorId(Number(e.target.value))}
                className="w-full p-2 bg-[#1E1E1E] text-white rounded"
              >
                <option value="" disabled>
                  Select Flavor
                </option>
                {flavors.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full p-2 bg-[#1E1E1E] text-white rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Note</label>
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
                {saving ? 'Saving...' : 'Create Request'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AuthGuard>
  );
}
