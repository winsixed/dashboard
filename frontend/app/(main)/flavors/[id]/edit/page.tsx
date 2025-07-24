'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '../../../../../components/AuthGuard';
import Spinner from '../../../../../components/Spinner';
import api from '../../../../../lib/api';
import { useAuth } from '../../../../../context/AuthContext';

interface ApiBrand {
  id: number;
  name: string;
}

interface ApiFlavor {
  id: number;
  name: string;
  description: string;
  profile: string;
  brand: { id: number; name: string };
}

export default function FlavorEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [brands, setBrands] = useState<ApiBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [profile, setProfile] = useState('');
  const [brandId, setBrandId] = useState<number | ''>('');

  const permissions = user?.permissions?.map((p: any) => p.code) || [];
  const canEdit = permissions.includes('flavors:edit');

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get<ApiFlavor>(`/flavors/${params.id}`),
      api.get<ApiBrand[]>('/brands'),
    ])
      .then(([flavorRes, brandsRes]) => {
        const f = flavorRes.data;
        setName(f.name);
        setDescription(f.description);
        setProfile(f.profile);
        setBrandId(f.brand.id);
        setBrands(brandsRes.data);
        setError('');
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, [params.id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.put(`/flavors/${params.id}`, {
        name,
        description,
        profile,
        brandId: Number(brandId),
      });
      router.push(`/flavors/${params.id}`);
    } catch (err) {
      setError('Failed to save flavor');
    } finally {
      setSaving(false);
    }
  };

  if (!canEdit) {
    return (
      <AuthGuard>
        <p>You do not have permission to edit flavors.</p>
      </AuthGuard>
    );
  }

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
            <label className="block mb-1">Description</label>
            <input
              type="text"
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
            className="px-4 py-2 bg-accent text-black rounded disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}
    </AuthGuard>
  );
}
