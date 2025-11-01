'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AccountSummary from '@/components/dashboard/AccountSummary';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user: authUser, isAuthenticated, loading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !authUser) {
        router.push('/auth/login');
        return;
      }

      // Convert auth user to dashboard user format
      setUser({
        id: authUser.id,
        email: authUser.email,
        name: authUser.username || 'User',
        role: 'USER', // Default role for frontend-only
        isActive: true,
        createdAt: authUser.createdAt?.toString() || new Date().toISOString(),
        updatedAt: authUser.updatedAt?.toString() || new Date().toISOString(),
      });
    }
  }, [authUser, isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || user?.email}!
        </h1>
        <p className="text-gray-600">
          Role: {user?.role} | Status: {user?.isActive ? 'Active' : 'Inactive'}
        </p>
      </div>
      <AccountSummary />
    </DashboardLayout>
  );
}