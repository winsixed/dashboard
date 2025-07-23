"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AuthGuard from "../../../components/AuthGuard";
import Spinner from "../../../components/Spinner";
import api from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";

interface ApiUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: { name: string };
  createdAt: string;
}

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ApiUser[]>("/users")
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  }, []);

  const permissions = user?.permissions?.map((p: any) => p.code) || [];
  const canCreate = permissions.includes("users:create");

  return (
    <AuthGuard>
      <div className="space-y-4">
        <div className="flex justify-end">
          {canCreate && (
            <Link
              href="/users/new"
              className="px-3 py-2 bg-accent text-black rounded"
            >
              + Add User
            </Link>
          )}
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full text-sm text-left bg-[#1E1E1E] rounded">
            <thead>
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Created At</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-gray-700">
                  <td className="p-2">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.role.name}</td>
                  <td className="p-2">
                    {u.createdAt ? new Date(u.createdAt).toLocaleString() : ""}
                  </td>
                  <td className="p-2">
                    <Link
                      href={`/users/${u.id}`}
                      className="px-2 py-1 bg-accent text-black rounded"
                    >
                      View
                    </Link>
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
