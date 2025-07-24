'use client';
import { useAuth } from '../context/AuthContext';

interface TopBarProps {
  onMenuClick?: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth();
  return (
    <header className="bg-[#1E1E1E] h-12 flex items-center justify-between px-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={onMenuClick}
          className="md:hidden focus:outline-none"
          aria-label="Открыть меню"
        >
          &#9776;
        </button>
        <span>Панель John Galt</span>
      </div>
      <div className="flex items-center space-x-4">
        {user && <span>{user.name}</span>}
        <button onClick={logout} className="text-red-400 hover:underline">
          Выйти
        </button>
      </div>
    </header>
  );
}
