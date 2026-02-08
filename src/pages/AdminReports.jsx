import React, { useEffect, useState } from 'react';
import AxiosClient from '../AxiosClient';
import { useLanguage } from '../contexts/LanguageContext';
import StatCard from '../components/StatCard';

function AdminReports() {
  const { t, language } = useLanguage();
  const [reportType, setReportType] = useState('daily');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split('T')[0];
  });
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchReport();
  }, [reportType, date, weekStart, month, year]);

  const fetchReport = () => {
    setLoading(true);
    let url = '';
    const params = {};

    switch (reportType) {
      case 'daily':
        url = '/admin/reports/daily';
        params.date = date;
        break;
      case 'weekly':
        url = '/admin/reports/weekly';
        params.start_date = weekStart;
        break;
      case 'monthly':
        url = '/admin/reports/monthly';
        params.month = month;
        params.year = year;
        break;
      case 'yearly':
        url = '/admin/reports/yearly';
        params.year = year;
        break;
      default:
        url = '/admin/reports/daily';
    }

    AxiosClient.get(url, { params })
      .then((response) => {
        setReport(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching report:', error);
        setLoading(false);
      });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleExportPdf = () => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    let url = '/admin/reports/export/pdf?type=' + reportType;
    
    // Add parameters based on report type
    switch (reportType) {
      case 'daily':
        url += '&date=' + date;
        break;
      case 'weekly':
        url += '&start_date=' + weekStart;
        break;
      case 'monthly':
        url += '&month=' + month + '&year=' + year;
        break;
      case 'yearly':
        url += '&year=' + year;
        break;
    }

    fetch(`${AxiosClient.defaults.baseURL}${url}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf',
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(error => {
        console.error('Error exporting PDF:', error);
        alert('Error exporting PDF');
      });
  };

  const handleExportCsv = () => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    let url = '/admin/reports/export/csv?type=' + reportType;
    
    // Add parameters based on report type
    switch (reportType) {
      case 'daily':
        url += '&date=' + date;
        break;
      case 'weekly':
        url += '&start_date=' + weekStart;
        break;
      case 'monthly':
        url += '&month=' + month + '&year=' + year;
        break;
      case 'yearly':
        url += '&year=' + year;
        break;
    }

    fetch(`${AxiosClient.defaults.baseURL}${url}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/csv',
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(error => {
        console.error('Error exporting CSV:', error);
        alert('Error exporting CSV');
      });
  };

  if (loading && !report) {
    return (
      <div className="px-5 mx-auto max-w-[1366px] py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-300 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className={`px-5 mx-auto max-w-[1366px] py-8 dark:bg-gray-900 ${
      language === 'ar' ? 'lg:pl-10' : 'lg:pr-10'
    }`}>
      <h1 className="text-3xl font-bold text-[#444] dark:text-white mb-8">
        {t('admin.reportsLabel') || 'Reports'}
      </h1>

      {/* Report Type Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <button
            onClick={() => setReportType('daily')}
            className={`px-4 py-2 rounded-md font-semibold transition ${
              reportType === 'daily'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {t('admin.reports.daily') || 'Daily'}
          </button>
          <button
            onClick={() => setReportType('weekly')}
            className={`px-4 py-2 rounded-md font-semibold transition ${
              reportType === 'weekly'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {t('admin.reports.weekly') || 'Weekly'}
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`px-4 py-2 rounded-md font-semibold transition ${
              reportType === 'monthly'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {t('admin.reports.monthly') || 'Monthly'}
          </button>
          <button
            onClick={() => setReportType('yearly')}
            className={`px-4 py-2 rounded-md font-semibold transition ${
              reportType === 'yearly'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {t('admin.reports.yearly') || 'Yearly'}
          </button>
        </div>

        {/* Date/Period Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportType === 'daily' && (
            <div>
              <label className="block text-sm font-semibold text-[#444] dark:text-white mb-2">
                {t('admin.reports.date') || 'Date'}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          {reportType === 'weekly' && (
            <div>
              <label className="block text-sm font-semibold text-[#444] dark:text-white mb-2">
                {t('admin.reports.weekStart') || 'Week Start (Monday)'}
              </label>
              <input
                type="date"
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          {reportType === 'monthly' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-[#444] dark:text-white mb-2">
                  {t('admin.reports.month') || 'Month'}
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#444] dark:text-white mb-2">
                  {t('admin.reports.year') || 'Year'}
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  min="2020"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </>
          )}

          {reportType === 'yearly' && (
            <div>
              <label className="block text-sm font-semibold text-[#444] dark:text-white mb-2">
                {t('admin.reports.year') || 'Year'}
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                min="2020"
                max={new Date().getFullYear()}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}
        </div>
      </div>

      {report && (
        <>
          {/* Period Info and Export Buttons */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md mb-6 flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('admin.reports.period') || 'Period'}: {formatDate(report.period.start)} - {formatDate(report.period.end)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleExportPdf}
                className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md transition flex items-center gap-2"
              >
                <span>📄</span>
                {t('admin.reports.exportPdf') || 'Export PDF'}
              </button>
              <button
                onClick={handleExportCsv}
                className="bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md transition flex items-center gap-2"
              >
                <span>📊</span>
                {t('admin.reports.exportCsv') || 'Export CSV'}
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <StatCard
              title={t('admin.reports.newUsers') || 'New Users'}
              value={report.summary.new_users || 0}
              icon="👥"
            />
            <StatCard
              title={t('admin.reports.newApartments') || 'New Apartments'}
              value={report.summary.new_apartments || 0}
              icon="🏠"
            />
            <StatCard
              title={t('admin.reports.newBookingRequests') || 'New Booking Requests'}
              value={report.summary.new_booking_requests || 0}
              icon="📝"
            />
            <StatCard
              title={t('admin.reports.signedContracts') || 'Signed Contracts'}
              value={report.summary.signed_contracts || 0}
              icon="📄"
            />
            <StatCard
              title={t('admin.reports.paymentsReceived') || 'Payments Received'}
              value={report.summary.payments_received || 0}
              icon="💰"
            />
            <StatCard
              title={t('admin.reports.totalRevenue') || 'Total Revenue'}
              value={formatCurrency(report.summary.total_revenue)}
              icon="💵"
            />
            <StatCard
              title={t('admin.reports.newSupportTickets') || 'New Support Tickets'}
              value={report.summary.new_support_tickets || 0}
              icon="💬"
            />
          </div>

          {/* Growth Stats (for monthly and yearly) */}
          {report.growth && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md mb-6">
              <h2 className="text-xl font-bold text-[#444] dark:text-white mb-4">
                {t('admin.reports.growth') || 'Growth Rate'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-1">
                    {t('admin.reports.usersGrowth') || 'Users Growth'}
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {report.growth.users_growth > 0 ? '+' : ''}{report.growth.users_growth}%
                  </p>
                </div>
                <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200 mb-1">
                    {t('admin.reports.revenueGrowth') || 'Revenue Growth'}
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {report.growth.revenue_growth > 0 ? '+' : ''}{report.growth.revenue_growth}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Charts (for weekly, monthly, yearly) */}
          {report.charts && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md mb-6">
              <h2 className="text-xl font-bold text-[#444] dark:text-white mb-4">
                {t('admin.reports.charts') || 'Charts'}
              </h2>
              
              {/* Users Growth Chart */}
              {report.charts.users_growth && report.charts.users_growth.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#444] dark:text-white mb-2">
                    {t('admin.reports.usersGrowthChart') || 'Users Growth'}
                  </h3>
                  <div className="h-64 flex items-end gap-2">
                    {report.charts.users_growth.map((item, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-green-500 rounded-t transition hover:bg-green-600"
                          style={{ height: `${(item.value / Math.max(...report.charts.users_growth.map(i => i.value))) * 100}%` }}
                          title={`${item.label}: ${item.value}`}
                        />
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Revenue Trend Chart */}
              {report.charts.revenue_trend && report.charts.revenue_trend.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#444] dark:text-white mb-2">
                    {t('admin.reports.revenueTrend') || 'Revenue Trend'}
                  </h3>
                  <div className="h-64 flex items-end gap-2">
                    {report.charts.revenue_trend.map((item, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-blue-500 rounded-t transition hover:bg-blue-600"
                          style={{ height: `${(item.value / Math.max(...report.charts.revenue_trend.map(i => i.value || 1))) * 100}%` }}
                          title={`${item.label}: ${formatCurrency(item.value)}`}
                        />
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tables (for weekly, monthly, yearly) */}
          {report.tables && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Top Cities */}
              {report.tables.top_cities && report.tables.top_cities.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <h3 className="text-lg font-semibold text-[#444] dark:text-white mb-4">
                    {t('admin.reports.topCities') || 'Top Cities'}
                  </h3>
                  <div className="space-y-2">
                    {report.tables.top_cities.map((city, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
                        <span className="text-[#444] dark:text-white">{city.city}</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">{city.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Users */}
              {report.tables.top_users && report.tables.top_users.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <h3 className="text-lg font-semibold text-[#444] dark:text-white mb-4">
                    {t('admin.reports.topUsers') || 'Top Users'}
                  </h3>
                  <div className="space-y-2">
                    {report.tables.top_users.map((user, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
                        <div>
                          <p className="text-[#444] dark:text-white font-semibold">{user.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{user.email}</p>
                        </div>
                        <span className="font-semibold text-green-600 dark:text-green-400">{user.apartments_count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking Success Rate */}
              {report.tables.booking_success_rate !== undefined && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <h3 className="text-lg font-semibold text-[#444] dark:text-white mb-4">
                    {t('admin.reports.bookingSuccessRate') || 'Booking Success Rate'}
                  </h3>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                      {report.tables.booking_success_rate}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ratings Stats (for monthly and yearly) */}
          {report.ratings && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-bold text-[#444] dark:text-white mb-4">
                {t('admin.reports.ratings') || 'Ratings Statistics'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('admin.reports.totalReviews') || 'Total Reviews'}
                  </p>
                  <p className="text-2xl font-bold text-[#444] dark:text-white">
                    {report.ratings.total_reviews}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('admin.reports.averageRating') || 'Average Rating'}
                  </p>
                  <p className="text-2xl font-bold text-[#444] dark:text-white">
                    {report.ratings.average_rating} ⭐
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {t('admin.reports.ratingDistribution') || 'Rating Distribution'}
                  </p>
                  <div className="space-y-1">
                    {Object.entries(report.ratings.rating_distribution).reverse().map(([rating, count]) => (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{rating}⭐</span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                          <div
                            className="bg-yellow-400 h-4 rounded-full"
                            style={{ width: `${(count / report.ratings.total_reviews) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminReports;

