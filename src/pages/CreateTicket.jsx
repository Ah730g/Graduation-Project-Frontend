import React, { useState } from 'react';
import { useUserContext } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePopup } from '../contexts/PopupContext';
import AxiosClient from '../AxiosClient';
import { useNavigate } from 'react-router-dom';

function CreateTicket() {
  const { user } = useUserContext();
  const { t, language } = useLanguage();
  const { showToast } = usePopup();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'other',
    priority: 'medium',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim()) {
      showToast(t('support.errors.subjectRequired') || 'Subject is required', 'error');
      return;
    }
    
    if (!formData.description.trim()) {
      showToast(t('support.errors.descriptionRequired') || 'Description is required', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await AxiosClient.post('/support/tickets', formData);
      showToast(t('support.ticketCreated') || 'Ticket created successfully', 'success');
      navigate(`/support/tickets/${response.data.id}`);
    } catch (error) {
      console.error('Error creating ticket:', error);
      showToast(
        error.response?.data?.message || t('support.errors.createError') || 'Error creating ticket',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };


  if (!user) {
    return (
      <div className="px-5 mx-auto max-w-[1366px] py-8 text-center">
        <p className="text-gray-600">{t('support.loginRequired') || 'Please login to create a support ticket'}</p>
      </div>
    );
  }

  return (
    <div className={`px-5 mx-auto max-w-[1366px] py-8 dark:bg-gray-900 ${
      language === 'ar' ? 'lg:pl-10' : 'lg:pr-10'
    }`}>
      <h1 className="text-3xl font-bold text-[#444] dark:text-white mb-8">
        {t('support.createTicket') || 'Create Support Ticket'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#444] dark:text-white mb-2">
            {t('support.subject') || 'Subject'} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            placeholder={t('support.subjectPlaceholder') || 'Enter ticket subject'}
            maxLength={255}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#444] dark:text-white mb-2">
            {t('support.category.label') || 'Category'} <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="technical">{t('support.category.technical') || 'Technical'}</option>
            <option value="payment">{t('support.category.payment') || 'Payment'}</option>
            <option value="booking">{t('support.category.booking') || 'Booking'}</option>
            <option value="other">{t('support.category.other') || 'Other'}</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#444] dark:text-white mb-2">
            {t('support.priorityLabel') || 'Priority'}
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="low">{t('support.priority.low') || 'Low'}</option>
            <option value="medium">{t('support.priority.medium') || 'Medium'}</option>
            <option value="high">{t('support.priority.high') || 'High'}</option>
            <option value="urgent">{t('support.priority.urgent') || 'Urgent'}</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#444] dark:text-white mb-2">
            {t('support.description') || 'Description'} <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            placeholder={t('support.descriptionPlaceholder') || 'Describe your issue in detail...'}
            rows={6}
            maxLength={5000}
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formData.description.length}/5000 {t('support.characters') || 'characters'}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-6 py-2 rounded-md transition"
          >
            {loading ? (t('common.loading') || 'Loading...') : (t('support.createTicket') || 'Create Ticket')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/support/tickets')}
            className="bg-gray-500 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700 text-white font-semibold px-6 py-2 rounded-md transition"
          >
            {t('admin.cancel') || 'Cancel'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTicket;

