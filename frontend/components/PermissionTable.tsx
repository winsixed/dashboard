import React from 'react';

interface Permission {
  id: number;
  code: string;
  description: string;
}

export default function PermissionTable({ permissions }: { permissions: Permission[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left bg-[#1E1E1E] rounded">
        <thead>
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Code</th>
            <th className="p-2">Description</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map(p => (
            <tr key={p.id} className="border-t border-gray-700 flex flex-col sm:table-row">
              <td className="p-2">{p.id}</td>
              <td className="p-2">{p.code}</td>
              <td className="p-2">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
