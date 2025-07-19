'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import AuthGuard from '../../../components/AuthGuard';
import Spinner from '../../../components/Spinner';
import UserTable from '../../../components/UserTable';

interface ApiUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: { id: number; name: string };
  createdAt?: string;
}

const LIMIT = 10;

export default function UsersPage() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ApiUser[]>('/users').then(res => setUsers(res.data)).finally(() => setLoading(false));
  }, []);

  const roles = Array.from(new Set(users.map(u => u.role.name)));

  const filtered = users.filter(u => {
    const matchesSearch = (
      `${u.firstName} ${u.lastName} ${u.username}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    const matchesRole = role ? u.role.name === role : true;
    return matchesSearch && matchesRole;
  });

  const paginated = filtered.slice(offset, offset + LIMIT);

  const nextPage = () => setOffset(Math.min(offset + LIMIT, Math.max(filtered.length - LIMIT, 0)));
  const prevPage = () => setOffset(Math.max(0, offset - LIMIT));

  return (
    <AuthGuard>
      <div className="space-y-4">
        <div className="flex space-x-2 items-center">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={e => { setOffset(0); setSearch(e.target.value); }}
            className="bg-[#1E1E1E] p-2 rounded w-64"
          />
          <select
            value={role}
            onChange={e => { setOffset(0); setRole(e.target.value); }}
            className="bg-[#1E1E1E] p-2 rounded"
          >
            <option value="">All Roles</option>
            {roles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        {loading ? <Spinner /> : <UserTable users={paginated} />}
        <div className="flex justify-end space-x-2">
          <button
            onClick={prevPage}
            disabled={offset === 0}
            className="px-4 py-2 bg-accent text-black rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={nextPage}
            disabled={offset + LIMIT >= filtered.length}
            className="px-4 py-2 bg-accent text-black rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </AuthGuard>
  );
}
