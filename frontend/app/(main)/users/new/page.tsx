'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '../../../../components/AuthGuard';
import Spinner from '../../../../components/Spinner';
import api from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';

interface ApiRole {
  id: number;
  name: string;
}

export default function UserCreatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const permissions = user?.permissions?.map((p: any) => p.code) || [];
  const canCreate = permissions.includes('users:create');

  useEffect(() => {
    api
      .get<ApiRole[]>('/roles')
      .then(res => setRoles(res.data))
      .catch(() => setError('Не удалось загрузить роли'))
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/users', {
        firstName,
        lastName,
        username: email,
        password,
        roleId: Number(roleId),
      });
      router.push('/users');
    } catch (err) {
      setError('Не удалось создать пользователя');
    } finally {
      setSaving(false);
    }
  };

  if (!canCreate) {
    return (
      <AuthGuard>
        <p>У вас нет прав для создания пользователей.</p>
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
            <label className="block mb-1">Имя</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full p-2 bg-[#1E1E1E] rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Фамилия</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="w-full p-2 bg-[#1E1E1E] rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Электронная почта</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-2 bg-[#1E1E1E] rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-2 bg-[#1E1E1E] rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Роль</label>
            <select
              value={roleId}
              onChange={e => setRoleId(Number(e.target.value))}
              className="w-full p-2 bg-[#1E1E1E] rounded"
            >
              <option value="" disabled>
                Выберите роль
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
            className="w-full sm:w-auto px-4 py-2 bg-accent text-black rounded disabled:opacity-50 block mx-auto"
          >
            {saving ? 'Сохранение...' : 'Создать пользователя'}
          </button>
          </form>
        </div>
      )}
    </AuthGuard>
  );
}

