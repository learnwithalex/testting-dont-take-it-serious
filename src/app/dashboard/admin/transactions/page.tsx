'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

interface Transaction {
  id: string;
  userId: string;
  user: {
    username: string;
    email: string;
  };
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'PURCHASE' | 'SALE' | 'AUCTION_BID' | 'AUCTION_WIN';
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  description: string;
  transactionHash?: string;
  nftId?: string;
  nft?: {
    title: string;
    imageUrl: string;
  };
  createdAt: string;
  completedAt?: string;
  metadata?: any;
}

interface TransactionStats {
  totalTransactions: number;
  totalVolume: number;
  pendingTransactions: number;
  failedTransactions: number;
  todayTransactions: number;
  todayVolume: number;
  averageTransactionValue: number;
  topTransactionType: string;
}

interface TransactionFilters {
  search: string;
  type: string;
  status: string;
  currency: string;
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    type: 'all',
    status: 'all',
    currency: 'all',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const router = useRouter();

  // Mock transactions data
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      userId: '1',
      user: { username: 'johndoe', email: 'john.doe@example.com' },
      type: 'PURCHASE',
      amount: 2.5,
      currency: 'ETH',
      status: 'COMPLETED',
      description: 'NFT Purchase - Digital Art #001',
      transactionHash: '0xabc123def456...',
      nftId: '1',
      nft: { title: 'Digital Art #001', imageUrl: '/placeholder-nft.jpg' },
      createdAt: '2024-01-21T10:30:00Z',
      completedAt: '2024-01-21T10:32:00Z'
    },
    {
      id: '2',
      userId: '2',
      user: { username: 'janesmith', email: 'jane.smith@example.com' },
      type: 'DEPOSIT',
      amount: 1000.0,
      currency: 'USDC',
      status: 'COMPLETED',
      description: 'Wallet Deposit',
      transactionHash: '0xdef456ghi789...',
      createdAt: '2024-01-21T09:15:00Z',
      completedAt: '2024-01-21T09:17:00Z'
    },
    {
      id: '3',
      userId: '3',
      user: { username: 'bobwilson', email: 'bob.wilson@example.com' },
      type: 'WITHDRAWAL',
      amount: 500.0,
      currency: 'USDC',
      status: 'PENDING',
      description: 'Wallet Withdrawal',
      createdAt: '2024-01-21T14:20:00Z'
    },
    {
      id: '4',
      userId: '1',
      user: { username: 'johndoe', email: 'john.doe@example.com' },
      type: 'SALE',
      amount: 3.2,
      currency: 'ETH',
      status: 'COMPLETED',
      description: 'NFT Sale - Abstract Art #123',
      transactionHash: '0xghi789jkl012...',
      nftId: '4',
      nft: { title: 'Abstract Art #123', imageUrl: '/placeholder-nft.jpg' },
      createdAt: '2024-01-20T16:45:00Z',
      completedAt: '2024-01-20T16:47:00Z'
    },
    {
      id: '5',
      userId: '4',
      user: { username: 'alicebrown', email: 'alice.brown@example.com' },
      type: 'AUCTION_BID',
      amount: 1.8,
      currency: 'ETH',
      status: 'FAILED',
      description: 'Auction Bid - Crypto Punk #456',
      createdAt: '2024-01-19T12:30:00Z'
    }
  ];

  const mockStats: TransactionStats = {
    totalTransactions: 1247,
    totalVolume: 45678.90,
    pendingTransactions: 23,
    failedTransactions: 15,
    todayTransactions: 87,
    todayVolume: 12345.67,
    averageTransactionValue: 36.65,
    topTransactionType: 'PURCHASE'
  };

  const initializeMockData = () => {
    setIsLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setTransactions(mockTransactions);
      setStats(mockStats);
      setTotalPages(1); // Since we have a small mock dataset
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    initializeMockData();
  }, [currentPage, filters, router]);

  const handleFilterChange = (key: keyof TransactionFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleTransactionAction = async (transactionId: string, action: 'approve' | 'reject' | 'cancel') => {
    // Simulate transaction action with mock functionality
    setTimeout(() => {
      setTransactions(prevTransactions => 
        prevTransactions.map(transaction => {
          if (transaction.id === transactionId) {
            switch (action) {
              case 'approve':
                return { ...transaction, status: 'COMPLETED' as const };
              case 'reject':
              case 'cancel':
                return { ...transaction, status: 'CANCELLED' as const };
              default:
                return transaction;
            }
          }
          return transaction;
        })
      );
    }, 500);
  };

  const exportTransactions = async () => {
    // Simulate export functionality with mock data
    const csvData = transactions.map(transaction => ({
      ID: transaction.id,
      Type: transaction.type,
      Amount: transaction.amount,
      Currency: transaction.currency,
      Status: transaction.status,
      User: transaction.user.username,
      Date: transaction.createdAt,
      Hash: transaction.transactionHash || 'N/A'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return 'bg-blue-100 text-blue-800';
      case 'WITHDRAWAL': return 'bg-orange-100 text-orange-800';
      case 'PURCHASE': return 'bg-purple-100 text-purple-800';
      case 'SALE': return 'bg-green-100 text-green-800';
      case 'AUCTION_BID': return 'bg-indigo-100 text-indigo-800';
      case 'AUCTION_WIN': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-100 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-light-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 h-32"></div>
              ))}
            </div>
            <div className="bg-white rounded-xl p-6 h-96"></div>
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
            <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2">Transaction Monitoring</h1>
            <p className="text-mid-300">Monitor and manage platform transactions</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportTransactions}>
              Export CSV
            </Button>
            <Button variant="primary" onClick={() => router.push('/dashboard/admin')}>
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-mid-300">Total Transactions</p>
                  <p className="text-2xl font-bold text-charcoal">{stats.totalTransactions.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-xl">📊</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-mid-300">Total Volume</p>
                  <p className="text-2xl font-bold text-charcoal">{formatCurrency(stats.totalVolume)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-xl">💰</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-mid-300">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingTransactions}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-xl">⏳</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-mid-300">Today's Volume</p>
                  <p className="text-2xl font-bold text-charcoal">{formatCurrency(stats.todayVolume)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-xl">📈</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by user, hash, or description..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full p-3 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full p-3 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="DEPOSIT">Deposit</option>
                <option value="WITHDRAWAL">Withdrawal</option>
                <option value="PURCHASE">Purchase</option>
                <option value="SALE">Sale</option>
                <option value="AUCTION_BID">Auction Bid</option>
                <option value="AUCTION_WIN">Auction Win</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full p-3 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Currency</label>
              <select
                value={filters.currency}
                onChange={(e) => handleFilterChange('currency', e.target.value)}
                className="w-full p-3 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">All Currencies</option>
                <option value="USD">USD</option>
                <option value="ETH">ETH</option>
                <option value="BTC">BTC</option>
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
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full p-3 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full p-3 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Min Amount</label>
              <input
                type="number"
                placeholder="0.00"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                className="w-full p-3 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Max Amount</label>
              <input
                type="number"
                placeholder="999999.00"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                className="w-full p-3 border border-light-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-light-50 border-b border-light-200">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-charcoal">Transaction</th>
                  <th className="text-left p-4 text-sm font-medium text-charcoal">User</th>
                  <th className="text-left p-4 text-sm font-medium text-charcoal">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-charcoal">Amount</th>
                  <th className="text-left p-4 text-sm font-medium text-charcoal">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-charcoal">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-charcoal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-light-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-charcoal">{transaction.description}</div>
                        {transaction.transactionHash && (
                          <div className="text-xs text-mid-300 font-mono">
                            {transaction.transactionHash.slice(0, 10)}...{transaction.transactionHash.slice(-8)}
                          </div>
                        )}
                        {transaction.nft && (
                          <div className="flex items-center gap-2 mt-1">
                            <img
                              src={transaction.nft.imageUrl}
                              alt={transaction.nft.title}
                              className="w-6 h-6 rounded object-cover"
                            />
                            <span className="text-xs text-mid-300">{transaction.nft.title}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-charcoal">{transaction.user.username}</div>
                        <div className="text-sm text-mid-300">{transaction.user.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                        {transaction.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-charcoal">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-mid-300">
                        <div>{formatDate(transaction.createdAt)}</div>
                        {transaction.completedAt && (
                          <div className="text-xs">Completed: {formatDate(transaction.completedAt)}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {transaction.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTransactionAction(transaction.id, 'approve')}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleTransactionAction(transaction.id, 'reject')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
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