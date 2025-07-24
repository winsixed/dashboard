'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '../../../../../components/AuthGuard';
import Spinner from '../../../../../components/Spinner';
import api from '../../../../../lib/api';

interface ApiRole {
  id: number;
  name: string;
}

interface ApiUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: { id: number; name: string };
}

export default function UserEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<number | ''>('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get<ApiUser>(`/users/${params.id}`),
      api.get<ApiRole[]>(`/roles`),
    ])
      .then(([userRes, rolesRes]) => {
        const user = userRes.data;
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setEmail(user.username);
        setRoleId(user.role.id);
        setRoles(rolesRes.data);
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
      const body: any = {
        firstName,
        lastName,
        username: email,
        roleId: Number(roleId),
      };
      if (password) body.password = password;
      await api.put(`/users/${params.id}`, body);
      router.push('/users');
    } catch (err) {
      setError('Failed to save user');
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
            <label className="block mb-1">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full p-2 bg-[#1E1E1E] rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="w-full p-2 bg-[#1E1E1E] rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-2 bg-[#1E1E1E] rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              className="w-full p-2 bg-[#1E1E1E] rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Role</label>
            <select
              value={roleId}
              onChange={e => setRoleId(Number(e.target.value))}
              className="w-full p-2 bg-[#1E1E1E] rounded"
            >
              <option value="" disabled>
                Select Role
              </option>
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
