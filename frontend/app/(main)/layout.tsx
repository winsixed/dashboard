'use client';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <TopBar />
        <main className="p-4 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
