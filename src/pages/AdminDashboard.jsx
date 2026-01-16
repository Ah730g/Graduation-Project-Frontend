import { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import AxiosClient from '../AxiosClient';
import { useLanguage } from '../contexts/LanguageContext';

function AdminDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AxiosClient.get('/admin/dashboard')
      .then((response) => {
        setStats(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching dashboard stats:', error);
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
      <h1 className="text-3xl font-bold text-[#444] mb-8">{t('admin.dashboard')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={t('admin.totalUsers')}
          value={stats?.total_users || 0}
          icon="👥"
        />
        <StatCard
          title={t('admin.totalApartments')}
          value={stats?.total_apartments || 0}
          icon="🏠"
        />
        <StatCard
          title={t('admin.totalRentalRequests')}
          value={stats?.total_rental_requests || 0}
          icon="📝"
        />
        <StatCard
          title={t('admin.activeContracts')}
          value={stats?.active_contracts || 0}
          icon="📄"
        />
      </div>
    </div>
  );
}

export default AdminDashboard;

