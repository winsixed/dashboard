'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AuthGuard from '../../../../../components/AuthGuard';
import Spinner from '../../../../../components/Spinner';
import api from '../../../../../lib/api';
import { useAuth } from '../../../../../context/AuthContext';

interface ApiBrand {
  id: number;
  name: string;
}

export default function BrandEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const permissions = user?.permissions?.map((p: any) => p.code) || [];
  const canEdit = permissions.includes('brands:edit');

  useEffect(() => {
    setLoading(true);
    api
      .get<ApiBrand>(`/brands/${params.id}`)
      .then(res => {
        setName(res.data.name);
        setError('');
      })
      .catch(() => setError('Failed to load brand'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.patch(`/brands/${params.id}`, { name });
      toast.success('Brand saved');
      router.push(`/brands/${params.id}`);
    } catch (err) {
      toast.error('Failed to save brand');
    } finally {
      setSaving(false);
    }
  };

  if (!canEdit) {
    return (
      <AuthGuard>
        <p>You do not have permission to edit brands.</p>
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
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-4 py-2 bg-accent text-black rounded disabled:opacity-50 block mx-auto"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}
    </AuthGuard>
  );
}
