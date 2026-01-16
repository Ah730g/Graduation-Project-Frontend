import { useEffect, useState } from 'react';
import AxiosClient from '../AxiosClient';
import { useLanguage } from '../contexts/LanguageContext';

function AdminNotifications() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AxiosClient.get('/admin/notifications')
      .then((response) => {
        setNotifications(response.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-[#888]">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="px-5 mx-auto max-w-[1366px]">
      <h1 className="text-3xl font-bold text-[#444] mb-8">{t('admin.notifications')}</h1>
      <div className="flex flex-col gap-4">
        {notifications.length === 0 ? (
          <p className="text-[#888]">{t('admin.noNotifications')}</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-gray-200 p-4 rounded-md flex items-center justify-between hover:bg-gray-300 transition duration-300 ease"
            >
              <div>
                <p className="font-semibold text-[#444]">
                  {notification.type === 'new_listing' && t('admin.notification.newListing')}
                  {notification.type === 'rental_request' && t('admin.notification.rentalRequest')}
                  {notification.type === 'report' && t('admin.notification.report')}
                  {notification.type === 'dispute' && t('admin.notification.dispute')}
                  {!['new_listing', 'rental_request', 'report', 'dispute'].includes(notification.type) && notification.message}
                </p>
                <p className="text-sm text-[#888]">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
              <span className="text-2xl">
                {notification.type === 'new_listing' && '🏠'}
                {notification.type === 'rental_request' && '📝'}
                {notification.type === 'report' && '⚠️'}
                {notification.type === 'dispute' && '⚖️'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminNotifications;

