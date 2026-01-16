import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EstateCard from '../components/EstateCard';
import { useUserContext } from '../contexts/UserContext';
import AxiosClient from '../AxiosClient';
import { useLanguage } from '../contexts/LanguageContext';
import { usePopup } from '../contexts/PopupContext';
import Notification from '../components/Notification';

function About() {
  const { user, message } = useUserContext();
  const { t, language } = useLanguage();
  const { showConfirm, showToast } = usePopup();
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('my-apartments');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      if (activeTab === 'my-apartments') {
        fetchUserPosts();
      } else {
        fetchSavedPosts();
      }
    } else {
      setLoading(false);
    }
  }, [user, activeTab]);

  const fetchUserPosts = () => {
    setLoading(true);
    AxiosClient.get(`/user-posts/${user.id}`)
      .then((response) => {
        setUserPosts(response.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching user posts:', error);
        setLoading(false);
      });
  };

  const fetchSavedPosts = () => {
    setLoading(true);
    AxiosClient.get(`/saved-posts/${user.id}`)
      .then((response) => {
        setSavedPosts(response.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching saved posts:', error);
        setLoading(false);
      });
  };

  const handleDelete = async (post) => {
    const confirmed = await showConfirm({
      title: t('apartments.deleteApartment'),
      message: `${t('apartments.confirmDelete')} "${post.Title}"?`,
      confirmText: t('admin.delete'),
      cancelText: t('admin.cancel'),
      variant: 'danger',
    });

    if (confirmed) {
      try {
        await AxiosClient.delete(`/post/${post.id}`);
        showToast(t('apartments.apartmentDeleted'), 'success');
        fetchUserPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
        showToast(t('apartments.errorDeleting'), 'error');
      }
    }
  };

  return (
    <div className={`px-5 mx-auto max-w-[1366px] max-md:max-w-[640px] max-lg:max-w-[768px] max-xl:max-w-[1280px] ${
      language === 'ar' ? 'lg:pl-10' : 'lg:pr-10'
    }`}>
      <div className="py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#444]">
            {t('apartments.management')}
          </h1>
          {user && (
            <Link
              to="/post/add"
              className="bg-yellow-300 hover:bg-yellow-400 text-[#444] font-semibold py-3 px-6 rounded-md transition duration-300 ease"
            >
              {t('apartments.addApartment')}
            </Link>
          )}
        </div>

        {!user ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">{t('apartments.loginRequired')}</p>
            <Link
              to="/login"
              className="bg-yellow-300 hover:bg-yellow-400 text-[#444] font-semibold py-3 px-6 rounded-md transition duration-300 ease inline-block"
            >
              {t('navbar.login')}
            </Link>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('my-apartments')}
                className={`px-4 py-2 font-semibold transition duration-300 ease ${
                  activeTab === 'my-apartments'
                    ? 'bg-yellow-300 text-[#444] border-b-2 border-yellow-300'
                    : 'text-[#888] hover:text-[#444]'
                }`}
              >
                {t('apartments.myApartments')}
              </button>
              <button
                onClick={() => setActiveTab('saved-apartments')}
                className={`px-4 py-2 font-semibold transition duration-300 ease ${
                  activeTab === 'saved-apartments'
                    ? 'bg-yellow-300 text-[#444] border-b-2 border-yellow-300'
                    : 'text-[#888] hover:text-[#444]'
                }`}
              >
                {t('apartments.savedApartments')}
              </button>
            </div>

            {loading ? (
              <div className={`text-3xl text-green-600 font-bold text-center py-12 ${
                language === 'ar' 
                  ? 'left-1/2 -translate-x-1/2' 
                  : 'right-1/2 translate-x-1/2'
              }`}>
                {t('common.loading')}
              </div>
            ) : activeTab === 'my-apartments' ? (
              userPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">{t('apartments.noApartments')}</p>
                  <Link
                    to="/post/add"
                    className="bg-yellow-300 hover:bg-yellow-400 text-[#444] font-semibold py-3 px-6 rounded-md transition duration-300 ease inline-block"
                  >
                    {t('apartments.addFirstApartment')}
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userPosts.map((post) => (
                    <div key={post.id} className="relative">
                      <EstateCard estate={post} showSaveButton={false} />
                      <div className="mt-2 flex gap-2">
                        <Link
                          to={`/post/add?edit=${post.id}`}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-center py-2 px-4 rounded-md transition text-sm"
                        >
                          {t('apartments.edit')}
                        </Link>
                        <button
                          onClick={() => handleDelete(post)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition text-sm"
                        >
                          {t('admin.delete')}
                        </button>
                      </div>
                      {post.status === 'draft' && (
                        <span className="absolute top-2 right-2 bg-yellow-200 text-yellow-800 px-2 py-1 rounded-md text-xs font-semibold">
                          {t('apartments.draft')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : (
              savedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">{t('apartments.noSavedApartments')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedPosts.map((post) => (
                    <div key={post.id} className="relative">
                      <EstateCard estate={post} showSaveButton={true} />
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
      {message && <Notification message={message} />}
    </div>
  );
}

export default About;
