import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { usePopup } from '../contexts/PopupContext';
import AxiosClient from '../AxiosClient';
import { useParams, useNavigate, Link } from 'react-router-dom';

function AdminTicketDetails() {
  const { t, language } = useLanguage();
  const { showToast } = usePopup();
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  useEffect(() => {
    fetchTicket();
    // Poll for new messages every 10 seconds
    const interval = setInterval(() => {
      fetchTicket();
    }, 10000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status);
      setPriority(ticket.priority);
    }
  }, [ticket]);

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTicket = () => {
    AxiosClient.get(`/admin/support/tickets/${id}`)
      .then((response) => {
        setTicket(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching ticket:', error);
        setLoading(false);
        if (error.response?.status === 404) {
          navigate('/admin/support/tickets');
        }
      });
  };

  const handleReply = async (e) => {
    e.preventDefault();
    
    if (!replyMessage.trim()) {
      showToast(t('support.errors.messageRequired') || 'Message is required', 'error');
      return;
    }

    setSending(true);

    try {
      await AxiosClient.post(`/admin/support/tickets/${id}/reply`, {
        message: replyMessage,
      });
      setReplyMessage('');
      showToast(t('support.messageSent') || 'Message sent successfully', 'success');
      fetchTicket();
    } catch (error) {
      console.error('Error sending reply:', error);
      showToast(
        error.response?.data?.message || t('support.errors.sendError') || 'Error sending message',
        'error'
      );
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await AxiosClient.patch(`/admin/support/tickets/${id}/status`, { status: newStatus });
      showToast(t('support.statusUpdated') || 'Status updated successfully', 'success');
      fetchTicket();
    } catch (error) {
      console.error('Error updating status:', error);
      showToast(t('support.errors.statusError') || 'Error updating status', 'error');
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      await AxiosClient.patch(`/admin/support/tickets/${id}/priority`, { priority: newPriority });
      showToast(t('support.priorityUpdated') || 'Priority updated successfully', 'success');
      fetchTicket();
    } catch (error) {
      console.error('Error updating priority:', error);
      showToast(t('support.errors.priorityError') || 'Error updating priority', 'error');
    }
  };

  const handleAssign = async () => {
    try {
      await AxiosClient.post(`/admin/support/tickets/${id}/assign`);
      showToast(t('support.assigned') || 'Ticket assigned successfully', 'success');
      fetchTicket();
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

  const getStatusText = (status) => {
    const statusMap = {
      open: t('support.status.open') || 'Open',
      in_progress: t('support.status.inProgress') || 'In Progress',
      resolved: t('support.status.resolved') || 'Resolved',
      closed: t('support.status.closed') || 'Closed',
    };
    return statusMap[status] || status;
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

  if (loading) {
    return (
      <div className="px-5 mx-auto max-w-[1366px] py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-300 mx-auto"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className={`px-5 mx-auto max-w-[1366px] py-8 text-center ${
        language === 'ar' ? 'lg:pl-10' : 'lg:pr-10'
      }`}>
        <p className="text-gray-600">{t('support.ticketNotFound') || 'Ticket not found'}</p>
        <Link to="/admin/support/tickets" className="text-green-500 hover:underline mt-4 inline-block">
          {t('support.backToTickets') || 'Back to Tickets'}
        </Link>
      </div>
    );
  }

  return (
    <div className={`px-5 mx-auto max-w-[1366px] py-8 dark:bg-gray-900 ${
      language === 'ar' ? 'lg:pl-10' : 'lg:pr-10'
    }`}>
      <div className="flex justify-between items-center mb-6">
        <Link
          to="/admin/support/tickets"
          className="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300 font-semibold"
        >
          ← {t('support.backToTickets') || 'Back to Tickets'}
        </Link>
      </div>

      {/* Ticket Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#444] dark:text-white mb-2">
              {ticket.subject}
            </h1>
            <div className="flex gap-4 text-sm text-[#888] dark:text-gray-400 mb-4">
              <span>{t('support.category.label') || 'Category'}: {getCategoryText(ticket.category)}</span>
              <span>{t('support.user') || 'User'}: {ticket.user?.name || 'N/A'} ({ticket.user?.email || 'N/A'})</span>
              {ticket.user?.phone && (
                <span>{t('support.phone') || 'Phone'}: {ticket.user.phone}</span>
              )}
            </div>
            <p className="text-[#444] dark:text-gray-300 whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(ticket.status)}`}>
              {getStatusText(ticket.status)}
            </span>
          </div>
        </div>

        {/* Admin Controls */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#444] dark:text-white mb-2">
                {t('support.status.label') || 'Status'}
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  handleStatusChange(e.target.value);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="open">{t('support.status.open') || 'Open'}</option>
                <option value="in_progress">{t('support.status.inProgress') || 'In Progress'}</option>
                <option value="resolved">{t('support.status.resolved') || 'Resolved'}</option>
                <option value="closed">{t('support.status.closed') || 'Closed'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#444] dark:text-white mb-2">
                {t('support.priorityLabel') || 'Priority'}
              </label>
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  handlePriorityChange(e.target.value);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="low">{t('support.priority.low') || 'Low'}</option>
                <option value="medium">{t('support.priority.medium') || 'Medium'}</option>
                <option value="high">{t('support.priority.high') || 'High'}</option>
                <option value="urgent">{t('support.priority.urgent') || 'Urgent'}</option>
              </select>
            </div>
          </div>
          {!ticket.admin_id && (
            <button
              onClick={handleAssign}
              className="mt-4 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md transition"
            >
              {t('support.assignToMe') || 'Assign to Me'}
            </button>
          )}
          {ticket.admin_id && (
            <p className="mt-4 text-sm text-[#888] dark:text-gray-400">
              {t('support.assignedTo') || 'Assigned to'}: {ticket.admin?.name || 'N/A'}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md mb-6">
        <h2 className="text-xl font-bold text-[#444] dark:text-white mb-4">
          {t('support.messages') || 'Messages'}
        </h2>
        <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4">
          {ticket.messages && ticket.messages.length > 0 ? (
            ticket.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    message.sender_type === 'admin'
                      ? 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100'
                      : 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{message.sender?.name || 'User'}</span>
                    <span className="text-xs opacity-75">
                      {new Date(message.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{message.message}</p>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.attachments.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={url}
                            alt={`Attachment ${index + 1}`}
                            className="w-24 h-24 object-cover rounded border"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              {t('support.noMessages') || 'No messages yet'}
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Reply Form */}
      {ticket.status !== 'closed' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-[#444] dark:text-white mb-4">
            {t('support.reply') || 'Reply'}
          </h3>
          <form onSubmit={handleReply}>
            <div className="mb-4">
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                placeholder={t('support.replyPlaceholder') || 'Type your message...'}
                rows={4}
                maxLength={5000}
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {replyMessage.length}/5000 {t('support.characters') || 'characters'}
              </p>
            </div>
            <button
              type="submit"
              disabled={sending}
              className="bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-6 py-2 rounded-md transition"
            >
              {sending ? (t('common.loading') || 'Sending...') : (t('support.send') || 'Send')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminTicketDetails;

