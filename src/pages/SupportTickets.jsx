import React, { useEffect, useState } from 'react';
import { useUserContext } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePopup } from '../contexts/PopupContext';
import AxiosClient from '../AxiosClient';
import { Link, useNavigate } from 'react-router-dom';

function SupportTickets() {
  const { user } = useUserContext();
  const { t, language } = useLanguage();
  const { showToast } = usePopup();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchTickets();
      // Poll for updates every 30 seconds
      const interval = setInterval(() => {
        fetchTickets();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user, statusFilter]);

  const fetchTickets = () => {
    const params = statusFilter !== 'all' ? { status: statusFilter } : {};
    AxiosClient.get('/support/tickets', { params })
      .then((response) => {
        setTickets(response.data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching tickets:', error);
        setLoading(false);
      });
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

  if (!user) {
    return (
      <div className="px-5 mx-auto max-w-[1366px] py-8 text-center">
        <p className="text-gray-600">{t('support.loginRequired') || 'Please login to view support tickets'}</p>
      </div>
    );
  }

  return (
    <div className={`px-5 mx-auto max-w-[1366px] py-8 dark:bg-gray-900 ${
      language === 'ar' ? 'lg:pl-10' : 'lg:pr-10'
    }`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#444] dark:text-white">
          {t('support.tickets') || 'Support Tickets'}
        </h1>
        <Link
          to="/support/create"
          className="bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-md transition"
        >
          {t('support.createTicket') || 'Create New Ticket'}
        </Link>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-md font-semibold transition ${
            statusFilter === 'all'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('support.all') || 'All'}
        </button>
        <button
          onClick={() => setStatusFilter('open')}
          className={`px-4 py-2 rounded-md font-semibold transition ${
            statusFilter === 'open'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('support.status.open') || 'Open'}
        </button>
        <button
          onClick={() => setStatusFilter('in_progress')}
          className={`px-4 py-2 rounded-md font-semibold transition ${
            statusFilter === 'in_progress'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('support.status.inProgress') || 'In Progress'}
        </button>
        <button
          onClick={() => setStatusFilter('resolved')}
          className={`px-4 py-2 rounded-md font-semibold transition ${
            statusFilter === 'resolved'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('support.status.resolved') || 'Resolved'}
        </button>
        <button
          onClick={() => setStatusFilter('closed')}
          className={`px-4 py-2 rounded-md font-semibold transition ${
            statusFilter === 'closed'
              ? 'bg-gray-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {t('support.status.closed') || 'Closed'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-300 mx-auto"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('support.noTickets') || 'No support tickets found'}
          </p>
          <Link
            to="/support/create"
            className="inline-block bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-md transition"
          >
            {t('support.createTicket') || 'Create New Ticket'}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/support/tickets/${ticket.id}`}
              className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-6 transition hover:shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[#444] dark:text-white mb-2">
                    {ticket.subject}
                  </h3>
                  <p className="text-sm text-[#888] dark:text-gray-300 line-clamp-2">
                    {ticket.description}
                  </p>
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
              <div className="flex justify-between items-center text-sm text-[#888] dark:text-gray-400">
                <div className="flex gap-4">
                  <span>{t('support.category.label') || 'Category'}: {getCategoryText(ticket.category)}</span>
                  {ticket.admin && (
                    <span>{t('support.assignedTo') || 'Assigned to'}: {ticket.admin.name}</span>
                  )}
                </div>
                <span>{new Date(ticket.created_at).toLocaleString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default SupportTickets;

