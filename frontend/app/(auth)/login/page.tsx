'use client';
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (e: any) {
      setError('Неверные данные');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-white">
      <form onSubmit={onSubmit} className="space-y-6 bg-[#1E1E1E] p-8 rounded-lg shadow-xl w-96">
        <h1 className="text-2xl font-bold text-center">Вход</h1>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Электронная почта"
          className="w-full p-2 bg-[#2A2A2A] text-white rounded"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Пароль"
          className="w-full p-2 bg-[#2A2A2A] text-white rounded"
        />
        <button type="submit" className="w-full p-2 bg-accent text-black font-semibold rounded">Войти</button>
      </form>
    </div>
  );
}
