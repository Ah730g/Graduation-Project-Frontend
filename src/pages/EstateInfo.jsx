import Slider from '../components/Slider';
import Map from '../components/Map';
import AxiosClient from '../AxiosClient';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { useEffect, useState } from 'react';
import Notification from '../components/Notification';
import { useLanguage } from '../contexts/LanguageContext';
import { usePopup } from '../contexts/PopupContext';

function EstateInfo() {
  const postDetails = useLoaderData();
  const { token, user, setMessage, message, setMessageStatus, messageStatus } =
    useUserContext();
  const [isSaved, setIsSaved] = useState(false);
  const [bookingRequested, setBookingRequested] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [durationType, setDurationType] = useState('month');
  const [durationMultiplier, setDurationMultiplier] = useState(1);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { language, t } = useLanguage();
  const { showToast, showConfirm } = usePopup();
  
  // Get available duration types from post
  const availableDurations = postDetails.post?.duration_prices || [];
  const availableDurationTypes = availableDurations.map(dp => dp.duration_type);
  
  // Set default duration type to first available or month
  useEffect(() => {
    if (availableDurationTypes.length > 0 && !availableDurationTypes.includes(durationType)) {
      setDurationType(availableDurationTypes[0]);
    }
  }, [availableDurations]);

  useEffect(() => {
    if (token) {
      setLoading(true);
      AxiosClient.get('/is-post-saved', {
        params: {
          user_id: user.id,
          post_id: postDetails.post.id,
        },
      }).then((response) => {
        setIsSaved(response.data.saved);
        setLoading(false);
      });
    }
  }, []);

  const handleSave = () => {
    if (!token) navigate('/login');

    const payload = {
      user_id: user.id,
      post_id: postDetails.post.id,
    };

    if (isSaved) {
      AxiosClient.delete('/saved-posts', {
        params: {
          user_id: user.id,
          post_id: postDetails.post.id,
        },
      }).then(() => {
        setIsSaved(false);
      });
    } else {
      AxiosClient.post('/saved-posts', payload)
        .then(() => {
          setIsSaved(true);
        })
        .catch((error) => {
          if (error.response.status == 403) {
            setMessageStatus(false);
            setMessage(error.response.data.message);
          }
        });
    }
  };

  const handleRequestBooking = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Check if user owns the apartment
    if (user.id === postDetails.post.user_id) {
      showToast(t('booking.cannotBookOwn') || "You can't book your own apartment", 'error');
      return;
    }

    // Open booking modal with duration selection
    setShowBookingModal(true);
  };

  const handleSubmitBooking = async () => {
    if (!durationType || !durationMultiplier || durationMultiplier < 1) {
      showToast(t('booking.selectDuration') || 'Please select a valid duration', 'error');
      return;
    }
    
    // For non-test durations, check if the duration type is available
    if (!['test_10s', 'test_30s'].includes(durationType) && !availableDurationTypes.includes(durationType)) {
      showToast(t('booking.durationNotAvailable') || 'Selected duration type is not available for this apartment', 'error');
      return;
    }

    const confirmed = await showConfirm({
      title: t('booking.requestBooking') || 'Request Booking',
      message: t('booking.confirmRequest') || `Are you sure you want to request booking for ${postDetails.post.Title}?`,
      confirmText: t('booking.request') || 'Request',
      cancelText: t('admin.cancel') || 'Cancel',
    });

    if (confirmed) {
      setLoading(true);
      setShowBookingModal(false);
      AxiosClient.post('/booking-requests', {
        post_id: postDetails.post.id,
        message: '',
        duration_type: durationType,
        duration_multiplier: durationMultiplier,
      })
        .then(() => {
          showToast(t('booking.requestSubmitted') || 'Booking request submitted successfully', 'success');
          setBookingRequested(true);
          setLoading(false);
          // Reset form
          setDurationType(availableDurationTypes.length > 0 ? availableDurationTypes[0] : 'month');
          setDurationMultiplier(1);
        })
        .catch((error) => {
          console.error('Error submitting booking request:', error);
          showToast(error.response?.data?.message || t('booking.errorSubmitting') || 'Error submitting request', 'error');
          setLoading(false);
        });
    }
  };
  return (
    <div
      className="relative px-5 mx-auto max-w-[1366px] max-md:max-w-[640px] max-lg:max-w-[768px] max-xl:max-w-[1280px] overflow-hidden
     lg:flex lg:justify-between h-[calc(100vh-100px)] max-lg:overflow-y-scroll"
    >
      {loading ? (
        <div className={`text-3xl text-green-600 font-bold absolute top-1/2 ${
          language === 'ar' 
            ? 'left-1/2 -translate-x-1/2' 
            : 'right-1/2 translate-x-1/2'
        }`}>
          Loading...
        </div>
      ) : (
        <>
          <div className={`lg:w-3/5 max-lg:mb-5 ${
            language === 'ar' ? 'lg:pl-14' : 'lg:pr-14'
          }`}>
            <Slider images={postDetails.post.images} />
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-4">
                <h2 className="font-bold text-3xl">{postDetails.post.Title}</h2>
                <span className="flex text-sm items-center gap-1 text-[#444]">
                  <img src="/public/pin.png" alt="" className="w-4" />
                  {postDetails.post.Address}
                </span>
                <span className="bg-yellow-100 p-1 text-xl w-fit rounded-md font-light">
                  $ {postDetails.post.Price}
                </span>
              </div>
              <div
                className="user-info py-3 px-8 bg-yellow-100 flex flex-col gap-3
          justify-center items-center rounded-md"
              >
                <img
                  src={postDetails.user.avatar}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="font-semibold">{postDetails.user.name}</span>
                {postDetails.user.reputation && postDetails.user.reputation.total_reviews > 0 && (
                  <div className="flex flex-col items-center gap-1 mt-2 pt-2 border-t border-gray-300 w-full">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-semibold text-sm">
                        {postDetails.user.reputation.average_rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600">
                      ({postDetails.user.reputation.total_reviews} {t('rating.reviews') || 'reviews'})
                    </span>
                  </div>
                )}
              </div>
            </div>
            <p className="mt-5 leading-5 text-sm">
              {postDetails.post.Description}
            </p>
          </div>
          <div className="flex-1 bg-[#fcf5f3] px-5 max-md:mb-5 max-md:py-5">
            <div className="flex flex-col gap-4">
              <h2 className="font-bold">General</h2>
              <div className="bg-white rounded-md px-3 py-2 flex flex-col gap-3">
                <div className="flex gap-2 items-center">
                  <img src="/public/utility.png" alt="" className="w-6" />
                  <div>
                    <p className="font-bold -mb-1">Utilities</p>
                    <span className="text-sm">
                      {postDetails.post.utilities_policy} is responsible
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <img src="/public/pet.png" alt="" className="w-6" />
                  <div>
                    <p className="font-bold -mb-1">Pet Policy</p>
                    <span className="text-sm">
                      {postDetails.post.pet_policy ? 'Allowed' : 'Not Allowed'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <img src="/public/fee.png" alt="" className="w-6" />
                  <div>
                    <p className="font-bold -mb-1">Property Fees</p>
                    <span className="text-sm">
                      Must have jx the rent in totoal house hold income
                    </span>
                  </div>
                </div>
              </div>

              <h2 className="font-bold">Room Sizes</h2>
              <div className="flex justify-between">
                <div className="bg-white p-2 rounded-sm flex gap-2">
                  <img src="/public/size.png" alt="" className="w-6" />
                  <span>{postDetails.post.total_size}</span>
                </div>
                <div className="bg-white p-2 rounded-sm flex gap-2">
                  <img src="/public/bed.png" alt="" className="w-6" />
                  <span>{postDetails.post.Bedrooms} bed</span>
                </div>
                <div className="bg-white p-2 rounded-sm flex gap-2">
                  <img src="/public/bath.png" alt="" className="w-6" />
                  <span>{postDetails.post.Bathrooms} bathroom</span>
                </div>
              </div>

              <h2 className="font-bold">Nearby Places</h2>
              <div className="bg-white rounded-md px-3 py-2 flex justify-between">
                <div className="flex gap-2 items-center">
                  <img src="/public/school.png" alt="" className="w-6" />
                  <div>
                    <p className="font-bold -mb-1">School</p>
                    <span className="text-sm">{postDetails.post.school}</span>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <img src="/public/bus.png" alt="" className="w-6" />
                  <div>
                    <p className="font-bold -mb-1">But Stop</p>
                    <span className="text-sm">{postDetails.post.bus}</span>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <img src="/public/restaurant.png" alt="" className="w-6" />
                  <div>
                    <p className="font-bold -mb-1">Resturant</p>
                    <span className="text-sm">
                      {postDetails.post.resturant}
                    </span>
                  </div>
                </div>
              </div>

              {/* Available Rental Durations */}
              {availableDurationTypes.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h2 className="font-bold mb-3">{t('booking.availableDurations') || 'Available Rental Durations'}</h2>
                  <div className="flex flex-wrap gap-3">
                    {availableDurations.map((dp) => {
                      const labels = {
                        day: t('booking.daily') || 'Daily',
                        week: t('booking.weekly') || 'Weekly',
                        month: t('booking.monthly') || 'Monthly',
                        year: t('booking.yearly') || 'Yearly',
                      };
                      return (
                        <div key={dp.duration_type} className="bg-yellow-100 px-4 py-2 rounded-md">
                          <span className="font-semibold capitalize">{labels[dp.duration_type] || dp.duration_type}: </span>
                          <span className="text-green-600 font-bold">${dp.price}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <h2 className="font-bold">Location</h2>
              <div className="w-full h-44">
                <Map data={[postDetails.post]} />
              </div>

              <div className="buttons flex flex-col gap-3">
                {user && user.id !== postDetails.post.user_id && postDetails.post.status !== 'rented' && (
                  <button
                    onClick={handleRequestBooking}
                    disabled={loading || bookingRequested}
                    className={`w-full p-4 flex gap-2 items-center justify-center cursor-pointer rounded-md transition ${
                      bookingRequested 
                        ? 'bg-green-500 text-white' 
                        : 'bg-yellow-300 hover:bg-yellow-400 text-[#444]'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="font-semibold text-sm">
                      {bookingRequested 
                        ? (t('booking.requested') || 'Request Submitted') 
                        : (t('booking.requestBooking') || 'Request Booking')}
                    </span>
                  </button>
                )}
                
                {/* Booking Modal */}
                {showBookingModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                      <h2 className="text-2xl font-bold text-[#444] mb-4">
                        {t('booking.selectDuration') || 'Select Rental Duration'}
                      </h2>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#444] mb-2">
                            {t('booking.durationType') || 'Duration Type'}
                          </label>
                          {availableDurationTypes.length === 0 ? (
                            <p className="text-sm text-gray-500 mb-2">
                              {t('booking.noDurationsAvailable') || 'No duration types available for this apartment.'}
                            </p>
                          ) : (
                            <select
                              value={durationType}
                              onChange={(e) => setDurationType(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
                            >
                              {availableDurationTypes.map(dt => {
                                const durationPrice = availableDurations.find(dp => dp.duration_type === dt);
                                const labels = {
                                  day: t('booking.daily') || 'Daily',
                                  week: t('booking.weekly') || 'Weekly',
                                  month: t('booking.monthly') || 'Monthly',
                                  year: t('booking.yearly') || 'Yearly',
                                };
                                return (
                                  <option key={dt} value={dt}>
                                    {labels[dt] || dt} - ${durationPrice?.price || 0}
                                  </option>
                                );
                              })}
                              {/* Always include test option for testing */}
                              <option value="test_10s">{t('booking.test10s') || 'Test: 10 seconds (for testing only)'}</option>
                            </select>
                          )}
                        </div>
                        
                        {/* Show price for selected duration */}
                        {durationType !== 'test_10s' && durationType !== 'test_30s' && (
                          <div className="p-3 bg-yellow-50 rounded-md">
                            <p className="text-sm">
                              <span className="font-semibold">{t('booking.price') || 'Price'}: </span>
                              ${availableDurations.find(dp => dp.duration_type === durationType)?.price || 0}
                              {' '}{t('booking.per') || 'per'} {durationMultiplier} {durationType}
                              {durationMultiplier > 1 && 's'}
                            </p>
                          </div>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium text-[#444] mb-2">
                            {t('booking.durationMultiplier') || 'Duration Multiplier'}
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={durationMultiplier}
                            onChange={(e) => setDurationMultiplier(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
                            placeholder={t('booking.enterMultiplier') || 'e.g., 1, 2, 3...'}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {durationType === 'day' && `${durationMultiplier} day(s)`}
                            {durationType === 'week' && `${durationMultiplier} week(s)`}
                            {durationType === 'month' && `${durationMultiplier} month(s)`}
                            {(durationType === 'test_10s' || durationType === 'test_30s') && 
                              `${durationMultiplier * (durationType === 'test_10s' ? 10 : 30)} second(s) (TEST ONLY)`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => {
                            setShowBookingModal(false);
                            setDurationType(availableDurationTypes.length > 0 ? availableDurationTypes[0] : 'month');
                            setDurationMultiplier(1);
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-[#444] hover:bg-gray-100 transition"
                        >
                          {t('admin.cancel') || 'Cancel'}
                        </button>
                        <button
                          onClick={handleSubmitBooking}
                          className="flex-1 px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-[#444] rounded-md font-semibold transition"
                        >
                          {t('booking.submitRequest') || 'Submit Request'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center gap-3">
                  <div className="border p-4 flex gap-2 bg-white items-center cursor-pointer border-[#fece51] rounded-md">
                    <img src="/public/chat.png" alt="" className="w-4" />
                    <span className="font-semibold text-sm">Send a Message</span>
                  </div>
                  <div
                    className={`border p-4 flex gap-2 ${
                      isSaved ? 'bg-green-500 text-white' : 'bg-white'
                    }  items-center cursor-pointer border-[#fece51] rounded-md`}
                    onClick={handleSave}
                  >
                    <img src="/public/save.png" alt="" className="w-4" />
                    <span className="font-semibold text-sm">
                      {isSaved ? 'Saved' : 'Save the Place'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {message && <Notification message={message} status={messageStatus} />}
    </div>
  );
}

export default EstateInfo;
