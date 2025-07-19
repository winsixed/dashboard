import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'John Galt Panel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
