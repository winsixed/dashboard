'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import AuthGuard from '../../../components/AuthGuard';
import Spinner from '../../../components/Spinner';
import PermissionTable from '../../../components/PermissionTable';

interface ApiPermission {
  id: number;
  code: string;
  description: string;
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<ApiPermission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ApiPermission[]>('/permissions')
      .then(res => setPermissions(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthGuard>
      <div className="space-y-4">
        {loading ? <Spinner /> : <PermissionTable permissions={permissions} />}
      </div>
    </AuthGuard>
  );
}
