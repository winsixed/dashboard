'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '../../../../components/AuthGuard';
import Spinner from '../../../../components/Spinner';
import api from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';

interface ApiBrand {
  id: number;
  name: string;
}

export default function FlavorCreatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [brands, setBrands] = useState<ApiBrand[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [profile, setProfile] = useState('');
  const [brandId, setBrandId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<ApiBrand[]>('/brands')
      .then(res => setBrands(res.data))
      .catch(() => setError('Failed to load brands'))
      .finally(() => setLoading(false));
  }, []);

  const permissions = user?.permissions?.map((p: any) => p.code) || [];
  const canCreate = permissions.includes('flavors:create');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/flavors', {
        name,
        description,
        profile,
        brandId: Number(brandId),
      });
      router.push(`/flavors/${res.data.id}`);
    } catch (err) {
      setError('Failed to create flavor');
    } finally {
      setSaving(false);
    }
  };

  if (!canCreate) {
    return (
      <AuthGuard>
        <p>You do not have permission to create flavors.</p>
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
            <label className="block mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-2 bg-[#1E1E1E] rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2 bg-[#1E1E1E] rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Profile</label>
            <input
              type="text"
              value={profile}
              onChange={e => setProfile(e.target.value)}
              className="w-full p-2 bg-[#1E1E1E] rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Brand</label>
            <select
              value={brandId}
              onChange={e => setBrandId(Number(e.target.value))}
              className="w-full p-2 bg-[#1E1E1E] rounded"
            >
              <option value="" disabled>
                Select Brand
              </option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-4 py-2 bg-accent text-black rounded disabled:opacity-50 block mx-auto"
          >
            {saving ? 'Saving...' : 'Create Flavor'}
          </button>
          </form>
        </div>
      )}
    </AuthGuard>
  );
}

