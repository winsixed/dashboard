'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '../../../../components/AuthGuard';
import Spinner from '../../../../components/Spinner';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../lib/api';

interface Permission {
  id: number;
  code: string;
  description: string;
}

interface Role {
  id: number;
  name: string;
  permissions: { code: string }[];
}

export default function UserPermissionsPage() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const codes = user?.permissions?.map((p: any) => p.code) || [];
  const canView = codes.includes('permissions:view');

  useEffect(() => {
    if (!canView) return;
    setLoading(true);
    Promise.all([api.get<Permission[]>('/permissions'), api.get<Role[]>('/roles')])
      .then(([permRes, roleRes]) => {
        setPermissions(permRes.data);
        setRoles(roleRes.data);
      })
      .finally(() => setLoading(false));
  }, [canView]);

  if (!canView) {
    return (
      <AuthGuard>
        <p>You do not have permission to view permissions.</p>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="space-y-4">
        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full text-sm text-left bg-[#1E1E1E] rounded">
            <thead>
              <tr>
                <th className="p-2">Code</th>
                <th className="p-2">Description</th>
                <th className="p-2">Roles</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map(p => (
                <tr key={p.id} className="border-t border-gray-700">
                  <td className="p-2">{p.code}</td>
                  <td className="p-2">{p.description}</td>
                  <td className="p-2">
                    {roles
                      .filter(r => r.permissions.some(per => per.code === p.code))
                      .map(r => r.name)
                      .join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AuthGuard>
  );
}
