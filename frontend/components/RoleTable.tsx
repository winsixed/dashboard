import React from 'react';
import Link from 'next/link';

interface Role {
  id: number;
  name: string;
  permissions: { id: number; code: string; description: string }[];
}

export default function RoleTable({ roles }: { roles: Role[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left bg-[#1E1E1E] rounded">
        <thead>
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Название</th>
            <th className="p-2">Права</th>
            <th className="p-2">Действия</th>
          </tr>
        </thead>
        <tbody>
          {roles.map(role => (
            <tr key={role.id} className="border-t border-gray-700 flex flex-col sm:table-row">
              <td className="p-2">{role.id}</td>
              <td className="p-2">{role.name}</td>
              <td className="p-2">{role.permissions.map(p => p.code).join(', ')}</td>
              <td className="p-2">
                <Link href={`/roles/${role.id}`} className="px-2 py-1 bg-accent text-black rounded">
                  Редактировать
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
