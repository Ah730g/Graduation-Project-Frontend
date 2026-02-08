import { useState, useEffect } from 'react';
import AxiosClient from '../AxiosClient';
import { useUserContext } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import FloorPlanDisplay from './FloorPlanDisplay';

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
    floor_number: '',
    has_elevator: false,
    floor_condition: '',
    has_internet: false,
    has_electricity: false,
    has_air_conditioning: false,
    building_condition: '',
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
          floor_number: postData.floor_number || '',
          has_elevator: postData.has_elevator || false,
          floor_condition: postData.floor_condition || '',
          has_internet: postData.has_internet || false,
          has_electricity: postData.has_electricity || false,
          has_air_conditioning: postData.has_air_conditioning || false,
          building_condition: postData.building_condition || '',
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
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-md max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Sticky Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-md">
          <h2 className="text-2xl font-bold text-[#444]">
            {isEditMode ? t('admin.edit') + ' ' + t('admin.post') : t('admin.postDetails')}
          </h2>
          <button
            onClick={onClose}
            className="text-3xl text-[#888] hover:text-[#444] transition duration-300 ease leading-none w-8 h-8 flex items-center justify-center"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6 min-h-0">

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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

            {/* Apartment Details Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-bold text-[#444] mb-4">{t('apartments.apartmentDetails') || 'Apartment Details'}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-[#444] mb-2">
                    {t('apartments.floorNumber') || 'Floor Number'}
                  </label>
                  <input
                    type="number"
                    name="floor_number"
                    value={formData.floor_number}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#444] mb-2">
                    {t('apartments.floorCondition') || 'Floor Condition'}
                  </label>
                  <select
                    name="floor_condition"
                    value={formData.floor_condition}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  >
                    <option value="">{t('apartments.selectOption') || 'Select...'}</option>
                    <option value="excellent">{t('apartments.excellent') || 'Excellent'}</option>
                    <option value="good">{t('apartments.good') || 'Good'}</option>
                    <option value="fair">{t('apartments.fair') || 'Fair'}</option>
                    <option value="poor">{t('apartments.poor') || 'Poor'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#444] mb-2">
                    {t('apartments.buildingCondition') || 'Building Condition'}
                  </label>
                  <select
                    name="building_condition"
                    value={formData.building_condition}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  >
                    <option value="">{t('apartments.selectOption') || 'Select...'}</option>
                    <option value="excellent">{t('apartments.excellent') || 'Excellent'}</option>
                    <option value="good">{t('apartments.good') || 'Good'}</option>
                    <option value="fair">{t('apartments.fair') || 'Fair'}</option>
                    <option value="poor">{t('apartments.poor') || 'Poor'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-md transition">
                  <input
                    type="checkbox"
                    name="has_elevator"
                    checked={formData.has_elevator}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-semibold text-[#444]">
                    {t('apartments.hasElevator') || 'Has Elevator'}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-md transition">
                  <input
                    type="checkbox"
                    name="has_internet"
                    checked={formData.has_internet}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-semibold text-[#444]">
                    {t('apartments.hasInternet') || 'Has Internet'}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-md transition">
                  <input
                    type="checkbox"
                    name="has_electricity"
                    checked={formData.has_electricity}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-semibold text-[#444]">
                    {t('apartments.hasElectricity') || 'Has Electricity'}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-md transition">
                  <input
                    type="checkbox"
                    name="has_air_conditioning"
                    checked={formData.has_air_conditioning}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-semibold text-[#444]">
                    {t('apartments.hasAirConditioning') || 'Has Air Conditioning'}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-semibold text-[#444]">{t('admin.price')}: </span>
                <span className="text-[#888]">{post?.Price}</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-[#444]">{t('admin.status')}: </span>
                <span className={`px-2 py-1 rounded-md text-sm inline-block ${
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

            {/* Apartment Details Section */}
            {(post?.floor_number || 
              post?.has_elevator !== null && post?.has_elevator !== undefined || 
              post?.floor_condition || 
              post?.has_internet !== null && post?.has_internet !== undefined || 
              post?.has_electricity !== null && post?.has_electricity !== undefined || 
              post?.has_air_conditioning !== null && post?.has_air_conditioning !== undefined || 
              post?.building_condition) && (
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-bold text-[#444] mb-3">{t('apartments.apartmentDetails') || 'Apartment Details'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {post?.floor_number && (
                    <div>
                      <span className="text-sm font-semibold text-[#444]">{t('apartments.floorNumber') || 'Floor Number'}: </span>
                      <span className="text-[#888]">{post.floor_number}</span>
                    </div>
                  )}
                  
                  {post?.has_elevator !== null && post?.has_elevator !== undefined && (
                    <div>
                      <span className="text-sm font-semibold text-[#444]">{t('apartments.elevator') || 'Elevator'}: </span>
                      <span className="text-[#888]">{post.has_elevator ? (t('apartments.yes') || 'Yes') : (t('apartments.no') || 'No')}</span>
                    </div>
                  )}
                  
                  {post?.floor_condition && (
                    <div>
                      <span className="text-sm font-semibold text-[#444]">{t('apartments.floorCondition') || 'Floor Condition'}: </span>
                      <span className="text-[#888] capitalize">{post.floor_condition}</span>
                    </div>
                  )}
                  
                  {post?.building_condition && (
                    <div>
                      <span className="text-sm font-semibold text-[#444]">{t('apartments.buildingCondition') || 'Building Condition'}: </span>
                      <span className="text-[#888] capitalize">{post.building_condition}</span>
                    </div>
                  )}
                  
                  {post?.has_internet !== null && post?.has_internet !== undefined && (
                    <div>
                      <span className="text-sm font-semibold text-[#444]">{t('apartments.internet') || 'Internet'}: </span>
                      <span className="text-[#888]">{post.has_internet ? (t('apartments.yes') || 'Yes') : (t('apartments.no') || 'No')}</span>
                    </div>
                  )}
                  
                  {post?.has_electricity !== null && post?.has_electricity !== undefined && (
                    <div>
                      <span className="text-sm font-semibold text-[#444]">{t('apartments.electricity') || 'Electricity'}: </span>
                      <span className="text-[#888]">{post.has_electricity ? (t('apartments.yes') || 'Yes') : (t('apartments.no') || 'No')}</span>
                    </div>
                  )}
                  
                  {post?.has_air_conditioning !== null && post?.has_air_conditioning !== undefined && (
                    <div>
                      <span className="text-sm font-semibold text-[#444]">{t('apartments.airConditioning') || 'Air Conditioning'}: </span>
                      <span className="text-[#888]">{post.has_air_conditioning ? (t('apartments.yes') || 'Yes') : (t('apartments.no') || 'No')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {post?.Description && (
              <div className="mt-4">
                <span className="text-sm font-semibold text-[#444] block mb-2">{t('admin.description')}: </span>
                <p className="text-[#888] mt-1 whitespace-pre-wrap break-words">{post.Description}</p>
              </div>
            )}

            {post?.postimage && post.postimage.length > 0 && (
              <div className="mt-4">
                <span className="text-sm font-semibold text-[#444] block mb-2">{t('admin.images')}: </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {post.postimage.map((img, idx) => (
                    <img key={idx} src={img.Image_URL} alt={`${post.Title} ${idx + 1}`} className="w-full h-24 object-cover rounded-md" />
                  ))}
                </div>
              </div>
            )}

            {post?.floor_plan_data && (
              <div className="mt-4">
                <span className="text-sm font-semibold text-[#444] block mb-2">{t('apartments.floorPlan') || 'Floor Plan'}: </span>
                <FloorPlanDisplay 
                  floorPlanData={post.floor_plan_data}
                  compact={false}
                  show3D={true}
                />
              </div>
            )}

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
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
    </div>
  );
}

export default PostDetailsModal;




