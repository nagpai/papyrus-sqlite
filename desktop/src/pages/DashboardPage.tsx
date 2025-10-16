import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { BookOpenIcon, UserGroupIcon, ArrowsRightLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['library-stats'],
    queryFn: () => api.getLibraryStats(),
  });

  const { data: overdueTransactions } = useQuery({
    queryKey: ['overdue-transactions'],
    queryFn: () => api.getOverdueTransactions(),
  });

  const { data: transactionStats } = useQuery({
    queryKey: ['transaction-stats'],
    queryFn: () => api.getTransactionStats(),
  });

  const libraryStats = stats?.data || {};
  const overdue = overdueTransactions?.data || [];
  const txStats = transactionStats?.data || {};

  const statsCards = [
    {
      title: 'Total Books',
      value: libraryStats.totalBooks || 0,
      icon: BookOpenIcon,
      color: 'bg-blue-500',
      subtext: `${libraryStats.availableBooks || 0} available`,
    },
    {
      title: 'Total Borrowers',
      value: libraryStats.totalBorrowers || 0,
      icon: UserGroupIcon,
      color: 'bg-green-500',
      subtext: `${libraryStats.activeBorrowers || 0} active`,
    },
    {
      title: 'Active Loans',
      value: txStats.activeBorrows || 0,
      icon: ArrowsRightLeftIcon,
      color: 'bg-purple-500',
      subtext: `${txStats.totalReturned || 0} returned`,
    },
    {
      title: 'Overdue Books',
      value: libraryStats.overdueBooks || 0,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      subtext: 'Need attention',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Welcome to Papyrus Library Management System
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overdue Books Alert */}
      {overdue.length > 0 && (
        <div className="card bg-red-50 border border-red-200">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-0.5" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                {overdue.length} Overdue {overdue.length === 1 ? 'Book' : 'Books'}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  {overdue.slice(0, 5).map((item: any) => (
                    <li key={item.id}>
                      <strong>{item.borrower_name}</strong> - {item.title} (Due: {new Date(item.due_date).toLocaleDateString()})
                    </li>
                  ))}
                </ul>
                {overdue.length > 5 && (
                  <Link to="/transactions?status=overdue" className="mt-2 inline-block font-medium text-red-800 hover:text-red-900">
                    View all {overdue.length} overdue books →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            to="/transactions?action=borrow"
            className="flex items-center justify-center px-4 py-3 border border-primary-300 rounded-md shadow-sm text-sm font-medium text-primary-700 bg-white hover:bg-primary-50"
          >
            Borrow Book
          </Link>
          <Link
            to="/transactions?action=return"
            className="flex items-center justify-center px-4 py-3 border border-primary-300 rounded-md shadow-sm text-sm font-medium text-primary-700 bg-white hover:bg-primary-50"
          >
            Return Book
          </Link>
          <Link
            to="/books?action=add"
            className="flex items-center justify-center px-4 py-3 border border-primary-300 rounded-md shadow-sm text-sm font-medium text-primary-700 bg-white hover:bg-primary-50"
          >
            Add New Book
          </Link>
        </div>
      </div>
    </div>
  );
}
