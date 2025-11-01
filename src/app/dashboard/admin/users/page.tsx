'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  nftCount: number;
  transactionCount: number;
  totalSpent: number;
}

interface UserFilters {
  search: string;
  role: string;
  verified: string;
  active: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    verified: 'all',
    active: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const router = useRouter();

  // Mock users data
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'john.doe@example.com',
      username: 'johndoe',
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
      isVerified: true,
      isActive: true,
      createdAt: '2024-01-15T10:30:00Z',
      lastLogin: '2024-01-20T14:22:00Z',
      nftCount: 5,
      transactionCount: 12,
      totalSpent: 2450.75
    },
    {
      id: '2',
      email: 'jane.smith@example.com',
      username: 'janesmith',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'ADMIN',
      isVerified: true,
      isActive: true,
      createdAt: '2024-01-10T08:15:00Z',
      lastLogin: '2024-01-21T09:45:00Z',
      nftCount: 15,
      transactionCount: 28,
      totalSpent: 8920.50
    },
    {
      id: '3',
      email: 'bob.wilson@example.com',
      username: 'bobwilson',
      firstName: 'Bob',
      lastName: 'Wilson',
      role: 'USER',
      isVerified: false,
      isActive: true,
      createdAt: '2024-01-18T16:45:00Z',
      lastLogin: '2024-01-19T11:30:00Z',
      nftCount: 2,
      transactionCount: 3,
      totalSpent: 450.25
    },
    {
      id: '4',
      email: 'alice.brown@example.com',
      username: 'alicebrown',
      firstName: 'Alice',
      lastName: 'Brown',
      role: 'USER',
      isVerified: true,
      isActive: false,
      createdAt: '2024-01-12T12:20:00Z',
      lastLogin: '2024-01-17T15:10:00Z',
      nftCount: 8,
      transactionCount: 18,
      totalSpent: 3250.80
    },
    {
      id: '5',
      email: 'charlie.davis@example.com',
      username: 'charliedavis',
      firstName: 'Charlie',
      lastName: 'Davis',
      role: 'USER',
      isVerified: true,
      isActive: true,
      createdAt: '2024-01-20T09:00:00Z',
      lastLogin: '2024-01-21T13:25:00Z',
      nftCount: 3,
      transactionCount: 7,
      totalSpent: 1125.40
    }
  ];

  const initializeMockUsers = () => {
    setIsLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setTotalPages(1); // Since we have a small mock dataset
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    initializeMockUsers();
  }, [currentPage, filters, router]);

  const handleFilterChange = (key: keyof UserFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'verify' | 'unverify' | 'promote' | 'demote') => {
    // Simulate user action with mock functionality
    setTimeout(() => {
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.id === userId) {
            switch (action) {
              case 'activate':
                return { ...user, isActive: true };
              case 'deactivate':
                return { ...user, isActive: false };
              case 'verify':
                return { ...user, isVerified: true };
              case 'unverify':
                return { ...user, isVerified: false };
              case 'promote':
                return { ...user, role: 'ADMIN' as const };
              case 'demote':
                return { ...user, role: 'USER' as const };
              default:
                return user;
            }
          }
          return user;
        })
      );
      
      // Update filtered users as well
      setFilteredUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.id === userId) {
            switch (action) {
              case 'activate':
                return { ...user, isActive: true };
              case 'deactivate':
                return { ...user, isActive: false };
              case 'verify':
                return { ...user, isVerified: true };
              case 'unverify':
                return { ...user, isVerified: false };
              case 'promote':
                return { ...user, role: 'ADMIN' as const };
              case 'demote':
                return { ...user, role: 'USER' as const };
              default:
                return user;
            }
          }
          return user;
        })
      );
    }, 500);
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'verify' | 'delete') => {
    if (selectedUsers.size === 0) return;

    const confirmed = confirm(`Are you sure you want to ${action} ${selectedUsers.size} user(s)?`);
    if (!confirmed) return;

    // Simulate bulk action with mock functionality
    setTimeout(() => {
      const userIds = Array.from(selectedUsers);
      
      if (action === 'delete') {
        // Remove users from both arrays
        setUsers(prevUsers => prevUsers.filter(user => !userIds.includes(user.id)));
        setFilteredUsers(prevUsers => prevUsers.filter(user => !userIds.includes(user.id)));
      } else {
        // Update users based on action
        const updateUser = (user: User) => {
          if (!userIds.includes(user.id)) return user;
          
          switch (action) {
            case 'activate':
              return { ...user, isActive: true };
            case 'deactivate':
              return { ...user, isActive: false };
            case 'verify':
              return { ...user, isVerified: true };
            default:
              return user;
          }
        };
        
        setUsers(prevUsers => prevUsers.map(updateUser));
        setFilteredUsers(prevUsers => prevUsers.map(updateUser));
      }
      
      setSelectedUsers(new Set());
      setShowBulkActions(false);
    }, 1000);
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  const selectAllUsers = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedUsers(new Set(filteredUsers.map(user => user.id)));
      setShowBulkActions(true);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-100 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-light-200 rounded w-64"></div>
            <div className="bg-white rounded-xl p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-light-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light-100 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-charcoal mb-2">Access Error</h2>
            <p className="text-mid-300 mb-6">{error}</p>
            <Button variant="primary" onClick={() => router.push('/dashboard/admin')}>
              Back to Admin Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2">User Management</h1>
            <p className="text-mid-300">Manage platform users and permissions</p>
          </div>
          <Button variant="primary" onClick={() => router.push('/dashboard/admin')}>
            Back to Dashboard
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-charcoal mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by email, username, or name..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full p-3 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Role</label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full p-3 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Verified</label>
              <select
                value={filters.verified}
                onChange={(e) => handleFilterChange('verified', e.target.value)}
                className="w-full p-3 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Status</label>
              <select
                value={filters.active}
                onChange={(e) => handleFilterChange('active', e.target.value)}
                className="w-full p-3 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Sort By</label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleFilterChange('sortBy', sortBy);
                  handleFilterChange('sortOrder', sortOrder as 'asc' | 'desc');
                }}
                className="w-full p-3 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="username-asc">Username A-Z</option>
                <option value="username-desc">Username Z-A</option>
                <option value="totalSpent-desc">Highest Spender</option>
                <option value="nftCount-desc">Most NFTs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedUsers.size} user(s) selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('verify')}
                >
                  Verify
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                >
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('deactivate')}
                >
                  Deactivate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => handleBulkAction('delete')}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-light-50 border-b border-light-200">
                <tr>
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                      onChange={selectAllUsers}
                      className="rounded border-light-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-charcoal">User</th>
                  <th className="text-left p-4 text-sm font-medium text-charcoal">Role</th>
                  <th className="text-left p-4 text-sm font-medium text-charcoal">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-charcoal">Activity</th>
                  <th className="text-left p-4 text-sm font-medium text-charcoal">Joined</th>
                  <th className="text-left p-4 text-sm font-medium text-charcoal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-light-50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="rounded border-light-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-charcoal">{user.username}</div>
                          <div className="text-sm text-mid-300">{user.email}</div>
                          {user.firstName && user.lastName && (
                            <div className="text-xs text-mid-300">{user.firstName} {user.lastName}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isVerified 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-charcoal">
                        <div>{user.nftCount} NFTs</div>
                        <div>{user.transactionCount} transactions</div>
                        <div className="text-green-600">{formatCurrency(user.totalSpent)}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-mid-300">
                        <div>{formatDate(user.createdAt)}</div>
                        {user.lastLogin && (
                          <div className="text-xs">Last: {formatDate(user.lastLogin)}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction(user.id, user.isActive ? 'deactivate' : 'activate')}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        {user.role === 'USER' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'promote')}
                          >
                            Promote
                          </Button>
                        )}
                        {user.role === 'ADMIN' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'demote')}
                          >
                            Demote
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-light-200">
              <div className="text-sm text-mid-300">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}