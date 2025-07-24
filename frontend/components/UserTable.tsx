import React from 'react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: { id: number; name: string };
  createdAt?: string;
}

export default function UserTable({ users }: { users: User[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left bg-[#1E1E1E] rounded">
        <thead>
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Full Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
            <th className="p-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-t border-gray-700 flex flex-col sm:table-row">
              <td className="p-2">{u.id}</td>
              <td className="p-2">{u.firstName} {u.lastName}</td>
              <td className="p-2">{u.username}</td>
              <td className="p-2">{u.role?.name}</td>
              <td className="p-2">{u.createdAt ? new Date(u.createdAt).toLocaleString() : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
