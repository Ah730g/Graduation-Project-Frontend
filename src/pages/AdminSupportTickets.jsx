import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { usePopup } from '../contexts/PopupContext';
import AxiosClient from '../AxiosClient';
import { Link } from 'react-router-dom';

function AdminSupportTickets() {
  const { t, language } = useLanguage();
  const { showToast } = usePopup();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: '',
  });

  useEffect(() => {
    fetchStats();
    fetchTickets();
    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      fetchTickets();
      fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [filters]);

  const fetchStats = () => {
    AxiosClient.get('/admin/support/stats')
      .then((response) => {
        setStats(response.data);
      })
      .catch((error) => {
        console.error('Error fetching stats:', error);
      });
  };

  const fetchTickets = () => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.category) params.category = filters.category;
    if (filters.priority) params.priority = filters.priority;
    if (filters.search) params.search = filters.search;

    AxiosClient.get('/admin/support/tickets', { params })
      .then((response) => {
        setTickets(response.data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching tickets:', error);
        setLoading(false);
      });
  };

  const handleAssign = async (ticketId) => {
    try {
      await AxiosClient.post(`/admin/support/tickets/${ticketId}/assign`);
      showToast(t('support.assigned') || 'Ticket assigned successfully', 'success');
      fetchTickets();
    } catch (error) {
      console.error('Error assigning ticket:', error);
      showToast(t('support.errors.assignError') || 'Error assigning ticket', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      open: t('support.status.open') || 'Open',
      in_progress: t('support.status.inProgress') || 'In Progress',
      resolved: t('support.status.resolved') || 'Resolved',
      closed: t('support.status.closed') || 'Closed',
    };
    return statusMap[status] || status;
  };

  const getPriorityText = (priority) => {
    const priorityMap = {
      urgent: t('support.priority.urgent') || 'Urgent',
      high: t('support.priority.high') || 'High',
      medium: t('support.priority.medium') || 'Medium',
      low: t('support.priority.low') || 'Low',
    };
    return priorityMap[priority] || priority;
  };

  const getCategoryText = (category) => {
    const categoryMap = {
      technical: t('support.category.technical') || 'Technical',
      payment: t('support.category.payment') || 'Payment',
      booking: t('support.category.booking') || 'Booking',
      other: t('support.category.other') || 'Other',
    };
    return categoryMap[category] || category;
  };

  return (
    <div className={`px-5 mx-auto max-w-[1366px] py-8 dark:bg-gray-900 ${
      language === 'ar' ? 'lg:pl-10' : 'lg:pr-10'
    }`}>
      <h1 className="text-3xl font-bold text-[#444] dark:text-white mb-8">
        {t('admin.supportTickets') || 'Support Tickets'}
      </h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('support.total') || 'Total'}</div>
            <div className="text-2xl font-bold text-[#444] dark:text-white">{stats.total}</div>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-4 shadow-md">
            <div className="text-sm text-blue-800 dark:text-blue-200">{t('support.status.open') || 'Open'}</div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.open}</div>
          </div>
          <div className="bg-yellow-100 dark:bg-yellow-900 rounded-lg p-4 shadow-md">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">{t('support.status.inProgress') || 'In Progress'}</div>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.in_progress}</div>
          </div>
          <div className="bg-red-100 dark:bg-red-900 rounded-lg p-4 shadow-md">
            <div className="text-sm text-red-800 dark:text-red-200">{t('support.urgent') || 'Urgent'}</div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.urgent}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#444] dark:text-white mb-2">
              {t('support.status.label') || 'Status'}
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('support.all') || 'All'}</option>
              <option value="open">{t('support.status.open') || 'Open'}</option>
              <option value="in_progress">{t('support.status.inProgress') || 'In Progress'}</option>
              <option value="resolved">{t('support.status.resolved') || 'Resolved'}</option>
              <option value="closed">{t('support.status.closed') || 'Closed'}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#444] dark:text-white mb-2">
              {t('support.category.label') || 'Category'}
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('support.all') || 'All'}</option>
              <option value="technical">{t('support.category.technical') || 'Technical'}</option>
              <option value="payment">{t('support.category.payment') || 'Payment'}</option>
              <option value="booking">{t('support.category.booking') || 'Booking'}</option>
              <option value="other">{t('support.category.other') || 'Other'}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#444] dark:text-white mb-2">
              {t('support.priorityLabel') || 'Priority'}
            </label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('support.all') || 'All'}</option>
              <option value="urgent">{t('support.priority.urgent') || 'Urgent'}</option>
              <option value="high">{t('support.priority.high') || 'High'}</option>
              <option value="medium">{t('support.priority.medium') || 'Medium'}</option>
              <option value="low">{t('support.priority.low') || 'Low'}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#444] dark:text-white mb-2">
              {t('admin.search') || 'Search'}
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              placeholder={t('admin.searchPlaceholder') || 'Search...'}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-300 mx-auto"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            {t('support.noTickets') || 'No support tickets found'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-6 shadow-md hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      to={`/admin/support/tickets/${ticket.id}`}
                      className="text-xl font-semibold text-[#444] dark:text-white hover:text-green-500 dark:hover:text-green-400"
                    >
                      {ticket.subject}
                    </Link>
                  </div>
                  <p className="text-sm text-[#888] dark:text-gray-300 line-clamp-2 mb-2">
                    {ticket.description}
                  </p>
                  <div className="flex gap-4 text-sm text-[#888] dark:text-gray-400">
                    <span>{t('support.category.label') || 'Category'}: {getCategoryText(ticket.category)}</span>
                    <span>{t('support.user') || 'User'}: {ticket.user?.name || 'N/A'}</span>
                    {ticket.admin && (
                      <span>{t('support.assignedTo') || 'Assigned to'}: {ticket.admin.name}</span>
                    )}
                    {!ticket.admin && (
                      <span className="text-red-600 dark:text-red-400 font-semibold">
                        {t('support.unassigned') || 'Unassigned'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                    {getStatusText(ticket.status)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                    {getPriorityText(ticket.priority)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#888] dark:text-gray-400">
                  {new Date(ticket.created_at).toLocaleString()}
                </span>
                <div className="flex gap-2">
                  {!ticket.admin_id && (
                    <button
                      onClick={() => handleAssign(ticket.id)}
                      className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md transition text-sm"
                    >
                      {t('support.assign') || 'Assign to Me'}
                    </button>
                  )}
                  <Link
                    to={`/admin/support/tickets/${ticket.id}`}
                    className="bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md transition text-sm"
                  >
                    {t('support.view') || 'View'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminSupportTickets;

