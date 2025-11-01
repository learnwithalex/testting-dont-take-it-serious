'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AccountSummary from '@/components/dashboard/AccountSummary';
import { apiService } from '@/lib/api-service';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        console.log('🔍 Dashboard: Starting authentication check via cookies');

        const result = await apiService.getMe();
        
        if (result.success && result.data?.user) {
          console.log('✅ Dashboard: Authenticated as:', result.data.user.email);
          setUser({
            id: result.data.user.id,
            email: result.data.user.email,
            name: result.data.user.username || result.data.user.firstName || 'User',
            role: result.data.user.role || 'USER',
            isActive: result.data.user.isActive,
            createdAt: result.data.user.createdAt?.toString() || new Date().toISOString(),
            updatedAt: result.data.user.updatedAt?.toString() || new Date().toISOString(),
          });
          setIsAuthenticated(true);
          setError(null);
          // Optional: cache user for UX only (no tokens)
          localStorage.setItem('user_data', JSON.stringify(result.data.user));
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('_auth_timestamp', Date.now().toString());
        } else if (result.error === 'Unauthorized') {
          console.log('🔄 Dashboard: Access token missing/expired, attempting refresh...');
          
          try {
            const refreshResult = await apiService.refreshToken();

            if (refreshResult.success) {
              console.log('✅ Dashboard: Refresh succeeded, retrying getMe');
              const retryResult = await apiService.getMe();
              
              if (retryResult.success && retryResult.data?.user) {
                console.log('✅ Dashboard: Authenticated after refresh as:', retryResult.data.user.email);
                setUser({
                  id: retryResult.data.user.id,
                  email: retryResult.data.user.email,
                  name: retryResult.data.user.username || retryResult.data.user.firstName || 'User',
                  role: retryResult.data.user.role || 'USER',
                  isActive: retryResult.data.user.isActive,
                  createdAt: retryResult.data.user.createdAt?.toString() || new Date().toISOString(),
                  updatedAt: retryResult.data.user.updatedAt?.toString() || new Date().toISOString(),
                });
                setIsAuthenticated(true);
                setError(null);
                localStorage.setItem('user_data', JSON.stringify(retryResult.data.user));
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('_auth_timestamp', Date.now().toString());
              } else {
                throw new Error('Invalid response format after refresh');
              }
            } else {
              throw new Error('Authentication required');
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            throw new Error('Authentication required');
          }
        } else {
          throw new Error(result.error || result.message || 'Authentication failed');
        }
      } catch (error) {
        console.error('❌ Dashboard: Authentication check failed:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
        setIsAuthenticated(true);
        setUser(null);
        // Redirect to login promptly
        //srouter.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Error state
  // if (error && !isAuthenticated) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <div className="text-center max-w-md mx-auto p-6">
  //         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
  //           <strong className="font-bold">Authentication Error:</strong>
  //           <span className="block sm:inline"> {error}</span>
  //         </div>
  //         <p className="text-gray-600 mb-4">Redirecting to login page...</p>
  //         <button 
  //           onClick={() => router.push('/auth/login')}
  //           className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
  //         >
  //           Go to Login Now
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  // Not authenticated state
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Authentication required</p>
          <button 
            onClick={() => router.push('/auth/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Authenticated state - render dashboard
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name || user.email}!
        </h1>
        <p className="text-gray-600">
          Role: {user.role} | Status: {user.isActive ? 'Active' : 'Inactive'}
        </p>
      </div>
      <AccountSummary />
    </DashboardLayout>
  );
}