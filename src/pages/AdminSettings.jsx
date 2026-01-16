import { useEffect, useState } from 'react';
import AxiosClient from '../AxiosClient';
import { useUserContext } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';

function AdminSettings() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState({
    terms_and_conditions: '',
    privacy_policy: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { setMessage } = useUserContext();

  useEffect(() => {
    AxiosClient.get('/admin/settings')
      .then((response) => {
        setSettings(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching settings:', error);
        setLoading(false);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    AxiosClient.put('/admin/settings', settings)
      .then(() => {
        setMessage(t('admin.settings') + ' ' + t('common.success'));
        setSaving(false);
      })
      .catch((error) => {
        console.error('Error updating settings:', error);
        setMessage(t('admin.errorUpdatingSettings'), 'error');
        setSaving(false);
      });
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-[#888]">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="px-5 mx-auto max-w-[1366px]">
      <h1 className="text-3xl font-bold text-[#444] mb-8">{t('admin.settings')}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-semibold text-[#444] mb-2">
            {t('admin.termsAndConditions')}
          </label>
          <textarea
            value={settings.terms_and_conditions}
            onChange={(e) => handleChange('terms_and_conditions', e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
            rows={10}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#444] mb-2">
            {t('admin.privacyPolicy')}
          </label>
          <textarea
            value={settings.privacy_policy}
            onChange={(e) => handleChange('privacy_policy', e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
            rows={10}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-yellow-300 px-6 py-3 rounded-md font-bold hover:scale-105 transition duration-300 ease disabled:opacity-50"
        >
          {saving ? t('common.loading') : t('admin.saveSettings')}
        </button>
      </form>
    </div>
  );
}

export default AdminSettings;

