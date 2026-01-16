import { useState, useEffect } from 'react';
import AxiosClient from '../AxiosClient';
import { useUserContext } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';

function PostDetailsModal({ postId, isOpen, onClose, onUpdate, isEditMode = false }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    Title: '',
    Price: '',
    Address: '',
    Description: '',
    City: '',
    Bedrooms: '',
    Bathrooms: '',
    status: '',
  });
  const { setMessage } = useUserContext();
  const { t, translateStatus } = useLanguage();

  useEffect(() => {
    if (isOpen && postId) {
      fetchPostDetails();
    }
  }, [isOpen, postId]);

  const fetchPostDetails = () => {
    setLoading(true);
    AxiosClient.get(`/admin/posts/${postId}`)
      .then((response) => {
        const postData = response.data;
        setPost(postData);
        setFormData({
          Title: postData.Title || '',
          Price: postData.Price || '',
          Address: postData.Address || '',
          Description: postData.Description || '',
          City: postData.City || '',
          Bedrooms: postData.Bedrooms || '',
          Bathrooms: postData.Bathrooms || '',
          status: postData.status || 'pending',
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching post details:', error);
        setMessage(t('admin.errorLoadingPostDetails'), 'error');
        setLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    AxiosClient.put(`/admin/posts/${postId}`, formData)
      .then(() => {
        setMessage(t('admin.post') + ' ' + t('admin.update') + ' ' + t('common.success'));
        onUpdate();
        onClose();
      })
      .catch((error) => {
        console.error('Error updating post:', error);
        setMessage(t('admin.errorUpdatingPost'), 'error');
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#444]">
            {isEditMode ? t('admin.edit') + ' ' + t('admin.post') : t('admin.postDetails')}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-[#888] hover:text-[#444] transition duration-300 ease"
          >
            ×
          </button>
        </div>

        {loading && !post ? (
          <div className="text-center py-8">
            <p className="text-[#888]">{t('common.loading')}</p>
          </div>
        ) : isEditMode ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#444] mb-2">
                {t('admin.title')}
              </label>
              <input
                type="text"
                name="Title"
                value={formData.Title}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#444] mb-2">
                  {t('admin.price')}
                </label>
                <input
                  type="number"
                  name="Price"
                  value={formData.Price}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#444] mb-2">
                  {t('admin.status')}
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
                >
                  <option value="active">{translateStatus('active')}</option>
                  <option value="pending">{translateStatus('pending')}</option>
                  <option value="rented">{translateStatus('rented')}</option>
                  <option value="blocked">{translateStatus('blocked')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#444] mb-2">
                {t('admin.address')}
              </label>
              <input
                type="text"
                name="Address"
                value={formData.Address}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#444] mb-2">
                {t('admin.description')}
              </label>
              <textarea
                name="Description"
                value={formData.Description}
                onChange={handleChange}
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#444] mb-2">
                  {t('admin.city')}
                </label>
                <input
                  type="text"
                  name="City"
                  value={formData.City}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#444] mb-2">
                  {t('admin.bedrooms')}
                </label>
                <input
                  type="number"
                  name="Bedrooms"
                  value={formData.Bedrooms}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#444] mb-2">
                  {t('admin.bathrooms')}
                </label>
                <input
                  type="number"
                  name="Bathrooms"
                  value={formData.Bathrooms}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-200 px-6 py-3 rounded-md font-bold hover:scale-105 transition duration-300 ease"
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
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-[#444] mb-2">{post?.Title}</h3>
              <p className="text-[#888]">{post?.Address}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-semibold text-[#444]">{t('admin.price')}: </span>
                <span className="text-[#888]">{post?.Price}</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-[#444]">{t('admin.status')}: </span>
                <span className={`px-2 py-1 rounded-md text-sm ${
                  post?.status === 'active' ? 'bg-green-200' :
                  post?.status === 'pending' ? 'bg-yellow-200' :
                  post?.status === 'rented' ? 'bg-blue-200' : 'bg-red-200'
                }`}>
                  {translateStatus(post?.status)}
                </span>
              </div>
              <div>
                <span className="text-sm font-semibold text-[#444]">{t('admin.city')}: </span>
                <span className="text-[#888]">{post?.City}</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-[#444]">{t('admin.bedrooms')}: </span>
                <span className="text-[#888]">{post?.Bedrooms}</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-[#444]">{t('admin.bathrooms')}: </span>
                <span className="text-[#888]">{post?.Bathrooms}</span>
              </div>
              {post?.user && (
                <div>
                  <span className="text-sm font-semibold text-[#444]">{t('admin.owner')}: </span>
                  <span className="text-[#888]">{post.user.name}</span>
                </div>
              )}
            </div>

            {post?.Description && (
              <div>
                <span className="text-sm font-semibold text-[#444]">{t('admin.description')}: </span>
                <p className="text-[#888] mt-1">{post.Description}</p>
              </div>
            )}

            {post?.postimage && post.postimage.length > 0 && (
              <div>
                <span className="text-sm font-semibold text-[#444]">{t('admin.images')}: </span>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {post.postimage.map((img, idx) => (
                    <img key={idx} src={img.Image_URL} alt={`${post.Title} ${idx + 1}`} className="w-full h-24 object-cover rounded-md" />
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={onClose}
                className="bg-gray-200 px-6 py-3 rounded-md font-bold hover:scale-105 transition duration-300 ease"
              >
                {t('admin.close')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostDetailsModal;




