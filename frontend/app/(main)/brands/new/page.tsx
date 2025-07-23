'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
      router.push(`/brands/${res.data.id}`);
    } catch (err) {
      setError('Failed to create brand');
    } finally {
      setSaving(false);
    }
  };

  if (!canCreate) {
    return (
      <AuthGuard>
        <p>You do not have permission to create brands.</p>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
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
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-accent text-black rounded disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Create Brand'}
        </button>
      </form>
    </AuthGuard>
  );
}
