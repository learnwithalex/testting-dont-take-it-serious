'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'MINT' | 'WITHDRAWAL' | 'COMMISSION' | 'SALE' | 'PURCHASE';
  amount: string;
  date: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  description: string;
  transactionHash?: string;
  nftId?: string;
  nft?: {
    title: string;
    image: string;
  };
}

export default function TransactionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock transactions data
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'DEPOSIT',
      amount: '2.5 ETH',
      date: new Date(Date.now() - 86400000).toLocaleString(),
      status: 'COMPLETED',
      description: 'Wallet deposit',
      transactionHash: '0x1234567890abcdef1234567890abcdef12345678'
    },
    {
      id: '2',
      type: 'MINT',
      amount: '0.1 ETH',
      date: new Date(Date.now() - 172800000).toLocaleString(),
      status: 'COMPLETED',
      description: 'Minted "Digital Art #001"',
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef12',
      nft: {
        title: 'Digital Art #001',
        image: '/placeholder-nft.jpg'
      }
    },
    {
      id: '3',
      type: 'SALE',
      amount: '1.8 ETH',
      date: new Date(Date.now() - 259200000).toLocaleString(),
      status: 'COMPLETED',
      description: 'Sold "Crypto Punk #123"',
      transactionHash: '0x567890abcdef1234567890abcdef1234567890ab',
      nft: {
        title: 'Crypto Punk #123',
        image: '/placeholder-nft.jpg'
      }
    },
    {
      id: '4',
      type: 'PURCHASE',
      amount: '0.5 ETH',
      date: new Date(Date.now() - 345600000).toLocaleString(),
      status: 'COMPLETED',
      description: 'Purchased "Abstract NFT #456"',
      transactionHash: '0x890abcdef1234567890abcdef1234567890abcdef',
      nft: {
        title: 'Abstract NFT #456',
        image: '/placeholder-nft.jpg'
      }
    },
    {
      id: '5',
      type: 'WITHDRAWAL',
      amount: '1.0 ETH',
      date: new Date(Date.now() - 432000000).toLocaleString(),
      status: 'PENDING',
      description: 'Withdrawal to wallet',
      transactionHash: '0xdef1234567890abcdef1234567890abcdef123456'
    },
    {
      id: '6',
      type: 'COMMISSION',
      amount: '0.05 ETH',
      date: new Date(Date.now() - 518400000).toLocaleString(),
      status: 'COMPLETED',
      description: 'Platform commission',
      transactionHash: '0x234567890abcdef1234567890abcdef1234567890'
    }
  ];

  // Initialize with mock data
  const initializeTransactions = () => {
    setLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setTransactions(mockTransactions);
      setLoading(false);
    }, 500);
  };

  // Generate description based on transaction type and data
  const getTransactionDescription = (tx: any) => {
    switch (tx.type) {
      case 'DEPOSIT':
        return 'Wallet deposit';
      case 'WITHDRAWAL':
        return 'Withdrawal to wallet';
      case 'MINT':
        return tx.nFT ? `Minted "${tx.nFT.title}"` : 'NFT minting fee';
      case 'SALE':
        return tx.nFT ? `Sold "${tx.nFT.title}"` : 'NFT sale';
      case 'PURCHASE':
        return tx.nFT ? `Purchased "${tx.nFT.title}"` : 'NFT purchase';
      case 'COMMISSION':
        return 'Platform commission';
      default:
        return 'Transaction';
    }
  };

  useEffect(() => {
    initializeTransactions();
  }, []);

  const filteredTransactions = activeTab === 'all' 
    ? transactions 
    : transactions.filter(tx => tx.type.toLowerCase() === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600';
      case 'PENDING':
        return 'text-yellow-600';
      case 'FAILED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'COMPLETED':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'PENDING':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'FAILED':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-between">
        <main className="pt-8 pb-12 md:pb-14 lg:pb-16">
          <div className="max-w-[84rem] mx-auto px-3 md:px-5 flex flex-col gap-6 md:gap-8 lg:px-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <span className="ml-3 text-gray-600">Loading transactions...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between">
      <main className="pt-8 pb-12 md:pb-14 lg:pb-16">
        <div className="max-w-[84rem] mx-auto px-3 md:px-5 flex flex-col gap-6 md:gap-8 lg:px-6">
          {/* Header */}
          <div className="flex items-center gap-3 text-2xl md:text-3xl">
            <div>
              <svg 
                stroke="currentColor" 
                fill="none" 
                strokeWidth="2" 
                viewBox="0 0 24 24" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="cursor-pointer" 
                height="1em" 
                width="1em" 
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => router.back()}
              >
                <path d="m15 18-6-6 6-6"></path>
              </svg>
            </div>
            <h1 className="text-charcoal font-bold">Transactions History</h1>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Tabs */}
          <div>
            <div className="flex flex-col overflow-hidden">
              <div 
                role="tablist" 
                className="inline-flex h-12 items-center rounded-lg bg-neutral-100 p-2 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 md:w-fit w-full overflow-auto justify-start max-w-[75vw] max-md:remove-system-scrollbar"
              >
                {[
                  { id: 'all', label: 'All' },
                  { id: 'deposit', label: 'Deposit' },
                  { id: 'mint', label: 'Mint' },
                  { id: 'withdrawal', label: 'Withdrawal' },
                  { id: 'commission', label: 'Commission' },
                  { id: 'sale', label: 'Sale' },
                  { id: 'purchase', label: 'Purchase' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded w-full px-4 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                      activeTab === tab.id
                        ? 'bg-white text-neutral-950 shadow-sm dark:bg-neutral-950 dark:text-neutral-50'
                        : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300">
                {/* Desktop View */}
                <div className="hidden lg:block">
                  <section className="flex flex-col justify-between gap-8 mt-6 px-6 pt-6 pb-3 bg-light-100 rounded-xl md:mt-8 md:px-8 md:pt-8 md:pb-4">
                    {/* Table Header */}
                    <div className="grid grid-cols-[3fr_3fr_3fr_2fr] gap-2">
                      <p className="text-sm text-mid-300">Transaction</p>
                      <p className="text-sm text-mid-300">Amount</p>
                      <p className="text-sm text-mid-300">Date/Time</p>
                      <p className="text-sm text-mid-300">Status</p>
                    </div>

                    {/* Transaction List */}
                    {filteredTransactions.length > 0 ? (
                      <div className="flex flex-col gap-4">
                        {filteredTransactions.map((transaction) => (
                          <div key={transaction.id} className="grid grid-cols-[3fr_3fr_3fr_2fr] gap-2 items-center py-3 border-b border-gray-100 last:border-b-0">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900 capitalize">{transaction.type.toLowerCase()}</p>
                                {transaction.transactionHash && (
                                  <a
                                    href={`https://etherscan.io/tx/${transaction.transactionHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 text-xs"
                                  >
                                    View
                                  </a>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{transaction.description}</p>
                            </div>
                            <p className="font-medium text-gray-900">{transaction.amount}</p>
                            <p className="text-gray-600">{transaction.date}</p>
                            <span className={getStatusBadge(transaction.status)}>
                              {transaction.status.toLowerCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 items-center justify-center my-4 md:my-6">
                        <p className="italic">No transactions yet.</p>
                        <a className="mt-3" href="/dashboard/deposit">
                          <button className="inline-flex items-center justify-center font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-neutral-900 text-neutral-50 hover:bg-neutral-900/90 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50/90 h-10 px-4 py-2 rounded-md">
                            Make your first deposit
                          </button>
                        </a>
                      </div>
                    )}
                  </section>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden">
                  <div className="mt-6 space-y-4">
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => (
                        <div key={transaction.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900 capitalize">{transaction.type.toLowerCase()}</p>
                                {transaction.transactionHash && (
                                  <a
                                    href={`https://etherscan.io/tx/${transaction.transactionHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 text-xs"
                                  >
                                    View
                                  </a>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{transaction.description}</p>
                            </div>
                            <span className={getStatusBadge(transaction.status)}>
                              {transaction.status.toLowerCase()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="font-medium text-gray-900">{transaction.amount}</p>
                            <p className="text-sm text-gray-600">{transaction.date}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col gap-3 items-center justify-center my-8 p-6 bg-gray-50 rounded-lg">
                        <p className="italic text-gray-600">No transactions yet.</p>
                        <a className="mt-3" href="/dashboard/deposit">
                          <button className="inline-flex items-center justify-center font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-neutral-900 text-neutral-50 hover:bg-neutral-900/90 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50/90 h-10 px-4 py-2 rounded-md">
                            Make your first deposit
                          </button>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}