import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Панель John Galt',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-background text-white min-h-screen">
        <AuthProvider>
          <div className="max-w-screen-xl mx-auto px-4">{children}</div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
