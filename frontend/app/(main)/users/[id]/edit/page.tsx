'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '../../../../../components/AuthGuard';
import Spinner from '../../../../../components/Spinner';
import api from '../../../../../lib/api';
import { useAuth } from '../../../../../context/AuthContext';

interface ApiRole {
  id: number;
  name: string;
}

interface ApiUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: ApiRole[];
}

export default function UserEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const permissions = user?.permissions?.map((p: any) => p.code) || [];
  const canEdit = permissions.includes('users:edit');

  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [roleIds, setRoleIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!canEdit) return;
    setLoading(true);
    Promise.all([
      api.get<ApiUser>(`/users/${params.id}`),
      api.get<ApiRole[]>('/roles'),
    ])
      .then(([userRes, rolesRes]) => {
        const u = userRes.data;
        setFirstName(u.firstName);
        setLastName(u.lastName);
        setEmail(u.email);
        setRoleIds(u.roles.map(r => r.id));
        setRoles(rolesRes.data);
        setError('');
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, [params.id, canEdit]);

  const onRolesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions).map(o => Number(o.value));
    setRoleIds(values);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      setError('All fields are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.patch(`/users/${params.id}`, {
        firstName,
        lastName,
        email,
        roleIds,
      });
      router.push(`/users/${params.id}`);
    } catch {
      setError('Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  if (!canEdit) {
    return (
      <AuthGuard>
        <p>You do not have permission to edit users.</p>
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
            <label className="block mb-1">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
              className="w-full p-2 bg-[#1E1E1E] text-white rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
              className="w-full p-2 bg-[#1E1E1E] text-white rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full p-2 bg-[#1E1E1E] text-white rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Roles</label>
            <select
              multiple
              value={roleIds.map(String)}
              onChange={onRolesChange}
              className="w-full p-2 bg-[#1E1E1E] text-white rounded"
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name}
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
