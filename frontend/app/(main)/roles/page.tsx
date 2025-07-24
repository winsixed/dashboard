'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import AuthGuard from '../../../components/AuthGuard';
import Spinner from '../../../components/Spinner';
import RoleTable from '../../../components/RoleTable';

interface ApiRole {
  id: number;
  name: string;
  permissions: { id: number; code: string; description: string }[];
}

export default function RolesPage() {
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ApiRole[]>('/roles')
      .then(res => setRoles(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthGuard>
      <div className="space-y-4 p-4 max-w-screen-md mx-auto">
        {loading ? <Spinner /> : <RoleTable roles={roles} />}
      </div>
    </AuthGuard>
  );
}
