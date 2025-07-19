'use client';
import { useAuth } from '../context/AuthContext';

export default function TopBar() {
  const { user, logout } = useAuth();
  return (
    <header className="bg-[#1E1E1E] h-12 flex items-center justify-between px-4">
      <span>John Galt Panel</span>
      <div className="flex items-center space-x-4">
        {user && <span>{user.name}</span>}
        <button onClick={logout} className="text-red-400 hover:underline">
          Logout
        </button>
      </div>
    </header>
  );
}
