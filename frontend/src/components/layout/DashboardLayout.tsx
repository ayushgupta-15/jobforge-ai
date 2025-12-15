'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import Sidebar from './Sidebar';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, fetchUser } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Check if user has tokens in localStorage
      const hasTokens = typeof window !== 'undefined' && 
                       localStorage.getItem('access_token');

      if (hasTokens && !isAuthenticated && !isLoading) {
        // Try to fetch user data
        await fetchUser();
      }
      
      setIsInitializing(false);
    };

    initAuth();
  }, []);

  // Only redirect after initialization is complete
  useEffect(() => {
    if (!isInitializing && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isInitializing, isLoading, isAuthenticated, router]);

  // Show loading while initializing or loading
  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <div className="w-64 hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}