"use client";

import { useEffect, useState } from "react";
import AuthGuard from "../../../components/AuthGuard";
import Spinner from "../../../components/Spinner";
import api from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";

interface ApiUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: { name: string }[];
}

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);

  const permissions = user?.permissions?.map((p: any) => p.code) || [];
  const canView = permissions.includes("users:view");

  useEffect(() => {
    if (!canView) return;
    setLoading(true);
    api
      .get<ApiUser[]>("/users")
      .then(res => setUsers(res.data))
      .finally(() => setLoading(false));
  }, [canView]);

  return (
    <AuthGuard>
      {!canView ? (
        <p>You do not have permission to view users.</p>
      ) : loading ? (
        <Spinner />
      ) : (
        <table className="w-full text-sm text-left bg-[#1E1E1E] text-white rounded">
          <thead>
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">First Name</th>
              <th className="p-2">Last Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Roles</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-gray-700">
                <td className="p-2">{u.id}</td>
                <td className="p-2">{u.firstName}</td>
                <td className="p-2">{u.lastName}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.roles.map(r => r.name).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AuthGuard>
  );
}
