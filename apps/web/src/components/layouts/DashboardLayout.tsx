'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '@/stores/auth.store';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, token } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Small delay to allow zustand persist to hydrate
    const timer = setTimeout(() => {
      // Check both zustand state and localStorage as fallback
      const authToken = localStorage.getItem('auth-token');

      if (!isAuthenticated && !authToken) {
        router.push('/login');
      }
      setChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [router, isAuthenticated]);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  // Show loading state while checking auth
  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated && !token) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={openSidebar} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="container mx-auto p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
