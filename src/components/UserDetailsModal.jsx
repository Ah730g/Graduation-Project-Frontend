import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosClient from '../AxiosClient';
import { useUserContext } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePopup } from '../contexts/PopupContext';

function UserDetailsModal({ userId, isOpen, onClose, onUpdate }) {
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState(null);
  const [stats, setStats] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active',
    avatar: '',
    password: '',
    password_confirmation: '',
  });
  const { setMessage } = useUserContext();
  const { t, translateRole, translateStatus } = useLanguage();
  const { showToast } = usePopup();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
      setActiveTab('details');
    }
  }, [isOpen, userId]);

  const fetchUserDetails = () => {
    setLoading(true);
    AxiosClient.get(`/admin/users/${userId}`)
      .then((response) => {
        const userData = response.data.user;
        const activitiesData = response.data.activities;
        const statsData = response.data.stats;
        const identityData = response.data.identity;
        
        setUser(userData);
        setActivities(activitiesData);
        setStats(statsData);
        setIdentity(identityData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          role: userData.role || 'user',
          status: userData.status || 'active',
          avatar: userData.avatar || '',
          password: '',
          password_confirmation: '',
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching user details:', error);
        setMessage(t('admin.errorLoadingUserDetails'), 'error');
        setLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const updateData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: formData.status,
      avatar: formData.avatar,
    };

    if (formData.password) {
      if (formData.password !== formData.password_confirmation) {
        setMessage(t('admin.passwordsDoNotMatch'), 'error');
        setLoading(false);
        return;
      }
      updateData.password = formData.password;
    }

    AxiosClient.put(`/admin/users/${userId}`, updateData)
      .then((response) => {
        const successMessage = t('admin.update') + ' ' + t('common.success');
        setMessage(successMessage);
        
        // Show toast notification if status was changed to disabled
        if (updateData.status === 'disabled' && response.data?.notification) {
          const notification = response.data.notification;
          let toastMessage = t('admin.accountDisabled') || 'Account disabled';
          if (notification.reason) {
            toastMessage += ': ' + notification.reason;
          }
          showToast(toastMessage, 'error');
        } else if (updateData.status === 'active' && formData.status === 'disabled' && response.data?.notification) {
          // Account was re-enabled
          showToast(t('admin.accountEnabled') || 'Account enabled successfully', 'success');
        } else {
          showToast(successMessage, 'success');
        }
        
        onUpdate();
        fetchUserDetails();
      })
      .catch((error) => {
        console.error('Error updating user:', error);
        const errorMessage = t('admin.errorUpdatingUser') || 'Error updating user';
        setMessage(errorMessage, 'error');
        showToast(errorMessage, 'error');
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-md p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#444] dark:text-white">{t('admin.userDetails')}</h2>
          <div className="flex gap-2 items-center">
            <button
              onClick={onClose}
              className="text-2xl text-[#888] dark:text-gray-400 hover:text-[#444] dark:hover:text-white transition duration-300 ease"
            >
              ×
            </button>
          </div>
        </div>

        {loading && !user ? (
          <div className="text-center py-8">
            <p className="text-[#888] dark:text-gray-400">{t('common.loading')}</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 font-semibold transition duration-300 ease ${
                  activeTab === 'details'
                    ? 'bg-yellow-300 dark:bg-yellow-400 text-[#444] dark:text-gray-900 border-b-2 border-yellow-300 dark:border-yellow-400'
                    : 'text-[#888] dark:text-gray-400 hover:text-[#444] dark:hover:text-white'
                }`}
              >
                {t('admin.details')}
              </button>
              <button
                onClick={() => setActiveTab('identity')}
                className={`px-4 py-2 font-semibold transition duration-300 ease ${
                  activeTab === 'identity'
                    ? 'bg-yellow-300 dark:bg-yellow-400 text-[#444] dark:text-gray-900 border-b-2 border-yellow-300 dark:border-yellow-400'
                    : 'text-[#888] dark:text-gray-400 hover:text-[#444] dark:hover:text-white'
                }`}
              >
                {t('admin.identity')}
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`px-4 py-2 font-semibold transition duration-300 ease ${
                  activeTab === 'activities'
                    ? 'bg-yellow-300 dark:bg-yellow-400 text-[#444] dark:text-gray-900 border-b-2 border-yellow-300 dark:border-yellow-400'
                    : 'text-[#888] dark:text-gray-400 hover:text-[#444] dark:hover:text-white'
                }`}
              >
                {t('admin.activities')} {stats && `(${stats.total_posts + stats.total_contracts + stats.total_rental_requests + stats.total_saved_posts + stats.total_reviews})`}
              </button>
            </div>

            {/* Details Tab */}
            {activeTab === 'details' && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#444] dark:text-white mb-2">
                    {t('admin.name')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 dark:focus:ring-yellow-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#444] dark:text-white mb-2">
                    {t('admin.email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 dark:focus:ring-yellow-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#444] dark:text-white mb-2">
                    {t('admin.role')}
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 dark:focus:ring-yellow-500"
                  >
                    <option value="user">{translateRole('user')}</option>
                    <option value="admin">{translateRole('admin')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#444] dark:text-white mb-2">
                    {t('admin.status')}
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 dark:focus:ring-yellow-500"
                  >
                    <option value="active">{translateStatus('active')}</option>
                    <option value="disabled">{translateStatus('disabled')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#444] dark:text-white mb-2">
                    {t('admin.avatar')}
                  </label>
                  <input
                    type="text"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="Avatar URL"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 dark:focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#444] dark:text-white mb-2">
                    {t('admin.password')} ({t('admin.leaveBlank')})
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 dark:focus:ring-yellow-500"
                  />
                </div>

                {formData.password && (
                  <div>
                    <label className="block text-sm font-semibold text-[#444] dark:text-white mb-2">
                      {t('admin.confirmPassword')}
                    </label>
                    <input
                      type="password"
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 dark:focus:ring-yellow-500"
                    />
                  </div>
                )}

                <div className="flex gap-3 justify-end mt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-200 dark:bg-gray-700 dark:text-white px-6 py-3 rounded-md font-bold hover:scale-105 transition duration-300 ease"
                  >
                    {t('admin.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-yellow-300 px-6 py-3 rounded-md font-bold hover:scale-105 transition duration-300 ease disabled:opacity-50"
                  >
                    {loading ? t('common.loading') : t('admin.update')}
                  </button>
                </div>
              </form>
            )}

            {/* Identity Tab */}
            {activeTab === 'identity' && (
              <div className="space-y-6">
                {identity ? (
                  <>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-[#444] dark:text-white">{t('admin.identityInformation')}</h3>
                        <button
                          onClick={() => {
                            onClose();
                            if (identity?.id) {
                              navigate(`/admin/identity-verifications?verificationId=${identity.id}`);
                            } else {
                              navigate('/admin/identity-verifications');
                            }
                          }}
                          className="bg-yellow-300 dark:bg-yellow-400 hover:bg-yellow-400 dark:hover:bg-yellow-500 text-[#444] dark:text-gray-900 font-semibold px-4 py-2 rounded-md transition text-sm"
                        >
                          {t('admin.viewIdentity') || 'View Identity Page'}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-[#888] dark:text-gray-400 mb-1">{t('admin.fullName')}</label>
                          <p className="text-[#444] dark:text-white">{identity.full_name || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#888] dark:text-gray-400 mb-1">{t('admin.documentNumber')}</label>
                          <p className="text-[#444] dark:text-white">{identity.document_number || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#888] dark:text-gray-400 mb-1">{t('admin.documentType')}</label>
                          <p className="text-[#444] dark:text-white">{identity.document_type === 'id_card' ? t('admin.idCard') : t('admin.passport')}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#888] dark:text-gray-400 mb-1">{t('admin.dateOfBirth')}</label>
                          <p className="text-[#444]">{formatDate(identity.date_of_birth) || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#888] dark:text-gray-400 mb-1">{t('admin.placeOfBirth')}</label>
                          <p className="text-[#444] dark:text-white">{identity.place_of_birth || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#888] dark:text-gray-400 mb-1">{t('admin.nationality')}</label>
                          <p className="text-[#444] dark:text-white">{identity.nationality || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#888] dark:text-gray-400 mb-1">{t('admin.issueDate')}</label>
                          <p className="text-[#444]">{formatDate(identity.issue_date) || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#888] dark:text-gray-400 mb-1">{t('admin.expiryDate')}</label>
                          <p className="text-[#444]">{formatDate(identity.expiry_date) || '-'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-[#888] dark:text-gray-400 mb-1">{t('admin.address')}</label>
                          <p className="text-[#444] dark:text-white">{identity.address || '-'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-[#888] dark:text-gray-400 mb-1">{t('admin.status')}</label>
                          <span className={`px-2 py-1 rounded-md text-sm ${
                            identity.status === 'approved' ? 'bg-green-200' :
                            identity.status === 'rejected' ? 'bg-red-200' :
                            'bg-yellow-200'
                          }`}>
                            {translateStatus(identity.status)}
                          </span>
                        </div>
                        {identity.admin_notes && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-[#888] dark:text-gray-400 mb-1">{t('admin.adminNotes')}</label>
                            <p className="text-[#444] dark:text-white bg-gray-50 dark:bg-gray-600 p-3 rounded-md">{identity.admin_notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-4">
                      <h3 className="text-lg font-bold text-[#444] dark:text-white mb-4">{t('admin.identityDocuments')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {identity.document_front_url && (
                          <div>
                            <label className="block text-sm font-semibold text-[#888] mb-2">{t('admin.frontDocument')}</label>
                            <img
                              src={identity.document_front_url}
                              alt={t('admin.frontDocument')}
                              className="w-full h-48 object-contain border border-gray-300 rounded-md bg-white"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <a
                              href={identity.document_front_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm mt-2 block"
                              style={{ display: 'none' }}
                            >
                              {t('admin.viewDocument')}
                            </a>
                          </div>
                        )}
                        {identity.document_back_url && (
                          <div>
                            <label className="block text-sm font-semibold text-[#888] mb-2">{t('admin.backDocument')}</label>
                            <img
                              src={identity.document_back_url}
                              alt={t('admin.backDocument')}
                              className="w-full h-48 object-contain border border-gray-300 rounded-md bg-white"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <a
                              href={identity.document_back_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm mt-2 block"
                              style={{ display: 'none' }}
                            >
                              {t('admin.viewDocument')}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[#888]">{t('admin.noIdentityData')}</p>
                  </div>
                )}
              </div>
            )}

            {/* Activities Tab */}
            {activeTab === 'activities' && activities && (
              <div className="space-y-6">
                {/* Stats Summary */}
                {stats && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-gray-200 p-4 rounded-md text-center">
                      <div className="text-2xl font-bold text-[#444]">{stats.total_posts}</div>
                      <div className="text-sm text-[#888]">{t('admin.posts')}</div>
                    </div>
                    <div className="bg-gray-200 p-4 rounded-md text-center">
                      <div className="text-2xl font-bold text-[#444]">{stats.total_contracts}</div>
                      <div className="text-sm text-[#888]">{t('admin.contracts')}</div>
                    </div>
                    <div className="bg-gray-200 p-4 rounded-md text-center">
                      <div className="text-2xl font-bold text-[#444]">{stats.total_rental_requests}</div>
                      <div className="text-sm text-[#888]">{t('admin.rentalRequests')}</div>
                    </div>
                    <div className="bg-gray-200 p-4 rounded-md text-center">
                      <div className="text-2xl font-bold text-[#444]">{stats.total_saved_posts}</div>
                      <div className="text-sm text-[#888]">{t('admin.savedPosts')}</div>
                    </div>
                    <div className="bg-gray-200 p-4 rounded-md text-center">
                      <div className="text-2xl font-bold text-[#444]">{stats.total_reviews}</div>
                      <div className="text-sm text-[#888]">{t('admin.reviews')}</div>
                    </div>
                  </div>
                )}

                {/* Posts */}
                <div>
                  <h3 className="text-lg font-bold text-[#444] mb-3">{t('admin.posts')} ({activities.posts?.length || 0})</h3>
                  <div className="bg-gray-100 rounded-md p-4 max-h-40 overflow-y-auto">
                    {activities.posts && activities.posts.length > 0 ? (
                      <div className="space-y-2">
                        {activities.posts.map((post) => (
                          <div 
                            key={post.id} 
                            className="bg-white p-3 rounded-md cursor-pointer hover:bg-gray-50 transition duration-200"
                            onClick={() => {
                              onClose();
                              navigate(`/admin/apartments?postId=${post.id}`);
                            }}
                            title={t('admin.clickToView') || 'Click to view in apartments page'}
                          >
                            <div className="font-semibold text-[#444]">{post.Title}</div>
                            <div className="text-sm text-[#888]">{post.Address}</div>
                            <div className="text-xs text-[#888] mt-1">
                              {t('admin.status')}: {translateStatus(post.status)} | {formatDate(post.created_at)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#888]">{t('admin.noData')}</p>
                    )}
                  </div>
                </div>

                {/* Contracts */}
                <div>
                  <h3 className="text-lg font-bold text-[#444] mb-3">{t('admin.contracts')} ({activities.contracts?.length || 0})</h3>
                  <div className="bg-gray-100 rounded-md p-4 max-h-40 overflow-y-auto">
                    {activities.contracts && activities.contracts.length > 0 ? (
                      <div className="space-y-2">
                        {activities.contracts.map((contract) => (
                          <div 
                            key={contract.id} 
                            className="bg-white p-3 rounded-md cursor-pointer hover:bg-gray-50 transition duration-200"
                            onClick={() => {
                              onClose();
                              navigate(`/admin/contracts?contractId=${contract.id}`);
                            }}
                            title={t('admin.clickToView') || 'Click to view in contracts page'}
                          >
                            <div className="font-semibold text-[#444]">{contract.post?.Title || '-'}</div>
                            <div className="text-sm text-[#888]">
                              {formatDate(contract.start_date)} - {formatDate(contract.end_date)}
                            </div>
                            <div className="text-xs text-[#888] mt-1">
                              {t('admin.status')}: {translateStatus(contract.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#888]">{t('admin.noData')}</p>
                    )}
                  </div>
                </div>

                {/* Rental Requests */}
                <div>
                  <h3 className="text-lg font-bold text-[#444] mb-3">{t('admin.rentalRequests')} ({activities.rental_requests?.length || 0})</h3>
                  <div className="bg-gray-100 rounded-md p-4 max-h-40 overflow-y-auto">
                    {activities.rental_requests && activities.rental_requests.length > 0 ? (
                      <div className="space-y-2">
                        {activities.rental_requests.map((request) => (
                          <div 
                            key={request.id} 
                            className="bg-white p-3 rounded-md cursor-pointer hover:bg-gray-50 transition duration-200"
                            onClick={() => {
                              onClose();
                              navigate(`/admin/rental-requests?requestId=${request.id}`);
                            }}
                            title={t('admin.clickToView') || 'Click to view rental request'}
                          >
                            <div className="font-semibold text-[#444]">{request.post?.Title || '-'}</div>
                            <div className="text-sm text-[#888]">{request.post?.Address || '-'}</div>
                            <div className="text-xs text-[#888] mt-1">
                              {t('admin.status')}: {translateStatus(request.status)} | {formatDate(request.requested_at)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#888]">{t('admin.noData')}</p>
                    )}
                  </div>
                </div>

                {/* Saved Posts */}
                <div>
                  <h3 className="text-lg font-bold text-[#444] mb-3">{t('admin.savedPosts')} ({activities.saved_posts?.length || 0})</h3>
                  <div className="bg-gray-100 rounded-md p-4 max-h-40 overflow-y-auto">
                    {activities.saved_posts && activities.saved_posts.length > 0 ? (
                      <div className="space-y-2">
                        {activities.saved_posts.map((saved) => (
                          <div 
                            key={saved.id} 
                            className="bg-white p-3 rounded-md cursor-pointer hover:bg-gray-50 transition duration-200"
                            onClick={() => {
                              onClose();
                              if (saved.post?.id) {
                                navigate(`/admin/apartments?postId=${saved.post.id}`);
                              } else {
                                navigate('/admin/apartments');
                              }
                            }}
                            title={t('admin.clickToView') || 'Click to view in apartments page'}
                          >
                            <div className="font-semibold text-[#444]">{saved.post?.Title || '-'}</div>
                            <div className="text-sm text-[#888]">{saved.post?.Address || '-'}</div>
                            <div className="text-xs text-[#888] mt-1">{formatDate(saved.created_at)}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#888]">{t('admin.noData')}</p>
                    )}
                  </div>
                </div>

                {/* Reviews */}
                <div>
                  <h3 className="text-lg font-bold text-[#444] mb-3">{t('admin.reviews')} ({activities.reviews?.length || 0})</h3>
                  <div className="bg-gray-100 rounded-md p-4 max-h-40 overflow-y-auto">
                    {activities.reviews && activities.reviews.length > 0 ? (
                      <div className="space-y-2">
                        {activities.reviews.map((review) => (
                          <div 
                            key={review.id} 
                            className="bg-white p-3 rounded-md cursor-pointer hover:bg-gray-50 transition duration-200"
                            onClick={() => {
                              onClose();
                              navigate(`/admin/reviews?reviewId=${review.id}`);
                            }}
                            title={t('admin.clickToView') || 'Click to view review'}
                          >
                            <div className="font-semibold text-[#444]">{review.post?.Title || '-'}</div>
                            <div className="text-sm text-[#888]">
                              {t('admin.rating')}: {'⭐'.repeat(review.rating)}
                            </div>
                            {review.comment && (
                              <div className="text-sm text-[#444] mt-1">{review.comment}</div>
                            )}
                            <div className="text-xs text-[#888] mt-1">
                              {t('admin.status')}: {translateStatus(review.status)} | {formatDate(review.created_at)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#888]">{t('admin.noData')}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default UserDetailsModal;
