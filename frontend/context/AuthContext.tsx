'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '../lib/api';

interface User {
  name: string;
  [key: string]: any;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setAuthToken(token);
    api.get('/auth/me').then(res => setUser(res.data)).finally(() => setLoading(false));
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.access_token);
    setAuthToken(data.access_token);
    const me = await api.get('/auth/me');
    setUser(me.data);
    setLoading(false);
    router.push('/dashboard');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken('');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
