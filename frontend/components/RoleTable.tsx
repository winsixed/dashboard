import React from 'react';

interface Role {
  id: number;
  name: string;
  permissions: { id: number; code: string; description: string }[];
}

export default function RoleTable({ roles }: { roles: Role[] }) {
  return (
    <table className="w-full text-sm text-left bg-[#1E1E1E] rounded">
      <thead>
        <tr>
          <th className="p-2">ID</th>
          <th className="p-2">Name</th>
          <th className="p-2">Permissions</th>
          <th className="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {roles.map(role => (
          <tr key={role.id} className="border-t border-gray-700">
            <td className="p-2">{role.id}</td>
            <td className="p-2">{role.name}</td>
            <td className="p-2">{role.permissions.map(p => p.code).join(', ')}</td>
            <td className="p-2">
              <button className="px-2 py-1 bg-accent text-black rounded">Edit</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
