'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '../../../../components/AuthGuard';
import Spinner from '../../../../components/Spinner';
import api from '../../../../lib/api';

interface ApiFlavor {
  id: number;
  name: string;
}

export default function RequestCreatePage() {
  const router = useRouter();
  const [flavors, setFlavors] = useState<ApiFlavor[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [comment, setComment] = useState('');
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

  const toggleFlavor = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/requests', { flavorIds: selected, comment });
      router.push('/requests');
    } catch (err) {
      setError('Failed to create request');
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
            <label className="block mb-1">Flavors</label>
            <div className="space-y-1">
              {flavors.map(f => (
                <label key={f.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(f.id)}
                    onChange={() => toggleFlavor(f.id)}
                  />
                  <span>{f.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block mb-1">Comment</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full p-2 bg-[#1E1E1E] rounded"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-accent text-black rounded disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Submit Request'}
          </button>
        </form>
      )}
    </AuthGuard>
  );
}
