import React, { useEffect, useState } from 'react';
import { useUserContext } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePopup } from '../contexts/PopupContext';
import AxiosClient from '../AxiosClient';
import { Link } from 'react-router-dom';

function Notifications() {
  const { user } = useUserContext();
  const { t, language } = useLanguage();
  const { showToast, showConfirm } = usePopup();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
        fetchNotifications();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = () => {
    AxiosClient.get('/notifications')
      .then((response) => {
        setNotifications(response.data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      });
  };

  const fetchUnreadCount = () => {
    AxiosClient.get('/notifications/unread-count')
      .then((response) => {
        setUnreadCount(response.data.count || 0);
      })
      .catch((error) => {
        console.error('Error fetching unread count:', error);
      });
  };

  const handleMarkAsRead = (id) => {
    AxiosClient.post(`/notifications/${id}/read`)
      .then(() => {
        fetchNotifications();
        fetchUnreadCount();
      })
      .catch((error) => {
        console.error('Error marking notification as read:', error);
      });
  };

  const handleMarkAllAsRead = () => {
    AxiosClient.post('/notifications/read-all')
      .then(() => {
        showToast(t('notifications.allMarkedAsRead') || 'All notifications marked as read', 'success');
        fetchNotifications();
        fetchUnreadCount();
      })
      .catch((error) => {
        console.error('Error marking all as read:', error);
        showToast(t('notifications.error') || 'Error marking notifications', 'error');
      });
  };

  const handleDeleteNotification = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const confirmed = await showConfirm({
      title: t('notifications.delete') || 'Delete Notification',
      message: t('notifications.confirmDelete') || 'Are you sure you want to delete this notification?',
      confirmText: t('admin.delete') || 'Delete',
      cancelText: t('admin.cancel') || 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    AxiosClient.delete(`/notifications/${id}`)
      .then(() => {
        showToast(t('notifications.deleted') || 'Notification deleted successfully', 'success');
        fetchNotifications();
        fetchUnreadCount();
      })
      .catch((error) => {
        console.error('Error deleting notification:', error);
        showToast(t('notifications.deleteError') || 'Error deleting notification', 'error');
      });
  };

  const handleDeleteAllNotifications = async () => {
    if (notifications.length === 0) return;

    const confirmed = await showConfirm({
      title: t('notifications.deleteAll') || 'Delete All Notifications',
      message: t('notifications.confirmDeleteAll') || `Are you sure you want to delete all ${notifications.length} notifications? This action cannot be undone.`,
      confirmText: t('admin.delete') || 'Delete All',
      cancelText: t('admin.cancel') || 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    AxiosClient.delete('/notifications')
      .then(() => {
        showToast(t('notifications.allDeleted') || 'All notifications deleted successfully', 'success');
        fetchNotifications();
        fetchUnreadCount();
      })
      .catch((error) => {
        console.error('Error deleting all notifications:', error);
        showToast(t('notifications.deleteAllError') || 'Error deleting all notifications', 'error');
      });
  };

  const getNotificationLink = (notification) => {
    const data = notification.data || {};
    
    switch (notification.type) {
      case 'booking_request':
        return '/booking-requests';
      case 'booking_approved':
      case 'booking_rejected':
        return '/booking-requests';
      case 'payment_received':
      case 'payment_confirmed':
        return data.contract_id ? `/contracts/${data.contract_id}` : '/contracts';
      case 'contract_signed':
      case 'contract_partially_signed':
        return data.contract_id ? `/contracts/${data.contract_id}` : '/contracts';
      case 'payment_confirmed_by_owner':
        return data.contract_id ? `/contracts/${data.contract_id}` : '/contracts';
      default:
        return '#';
    }
  };

  if (!user) {
    return (
      <div className="px-5 mx-auto max-w-[1366px] py-8 text-center">
        <p className="text-gray-600">{t('notifications.loginRequired') || 'Please login to view notifications'}</p>
      </div>
    );
  }

  return (
    <div className={`px-5 mx-auto max-w-[1366px] py-8 dark:bg-gray-900 ${
      language === 'ar' ? 'lg:pl-10' : 'lg:pr-10'
    }`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#444] dark:text-white">
          {t('notifications.notifications') || 'Notifications'}
        </h1>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="bg-yellow-300 dark:bg-yellow-400 hover:bg-yellow-400 dark:hover:bg-yellow-500 text-[#444] dark:text-gray-900 font-semibold px-4 py-2 rounded-md transition"
            >
              {t('notifications.markAllAsRead') || 'Mark All as Read'}
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAllNotifications}
              className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md transition"
            >
              {t('notifications.deleteAll') || 'Delete All'}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className={`text-3xl text-green-600 font-bold text-center py-12 ${
          language === 'ar' 
            ? 'left-1/2 -translate-x-1/2' 
            : 'right-1/2 translate-x-1/2'
        }`}>
          {t('common.loading')}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">{t('notifications.noNotifications') || 'No notifications'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`block bg-white dark:bg-gray-800 border rounded-md p-4 transition hover:shadow-md ${
                notification.read 
                  ? 'border-gray-200 dark:border-gray-700' 
                  : 'border-yellow-300 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
              }`}
            >
              <Link
                to={getNotificationLink(notification)}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                className="block"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#444] dark:text-white mb-1">
                      {(() => {
                        const translationKey = `notifications.types.${notification.type}.title`;
                        const translated = t(translationKey);
                        // Check if translation exists and is not the same as the key
                        if (translated && translated !== translationKey) {
                          return translated;
                        }
                        // Fallback to notification title from backend
                        return notification.title;
                      })()}
                    </h3>
                    <p className="text-sm text-[#888] dark:text-gray-300">
                      {(() => {
                        const translationKey = `notifications.types.${notification.type}.message`;
                        const translated = t(translationKey);
                        
                        // Check if translation exists and is not the same as the key
                        if (translated && translated !== translationKey && notification.data) {
                          // Replace placeholders with actual values
                          let message = translated;
                          
                          // Replace common placeholders
                          if (notification.data.title) {
                            message = message.replace(/{{title}}/g, notification.data.title);
                          }
                          if (notification.data.name) {
                            message = message.replace(/{{name}}/g, notification.data.name);
                          }
                          if (notification.data.amount) {
                            message = message.replace(/{{amount}}/g, notification.data.amount);
                          }
                          
                          // Replace any other placeholders from data
                          Object.keys(notification.data).forEach(key => {
                            const value = notification.data[key];
                            if (value && typeof value === 'string') {
                              message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
                            }
                          });
                          
                          return message;
                        }
                        
                        // Fallback to notification message from backend
                        return notification.message;
                      })()}
                    </p>
                    <p className="text-xs text-[#888] dark:text-gray-400 mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <span className="w-3 h-3 bg-yellow-300 dark:bg-yellow-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              </Link>
              <div className="flex justify-end mt-2">
                <button
                  onClick={(e) => handleDeleteNotification(notification.id, e)}
                  className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 rounded transition text-sm font-semibold"
                  title={t('notifications.delete') || 'Delete notification'}
                >
                  {t('notifications.delete') || 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;

