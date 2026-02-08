import { useState } from 'react';
import AxiosClient from '../AxiosClient';
import { useLanguage } from '../contexts/LanguageContext';
import { usePopup } from '../contexts/PopupContext';

function RatingModal({ isOpen, onClose, contract, otherParty, onSuccess }) {
  const { t, language } = useLanguage();
  const { showToast } = usePopup();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      showToast(t('rating.commentRequired') || 'Please provide a comment', 'error');
      return;
    }

    // Get contract ID (handle both 'id' and 'contract_id' fields)
    const contractId = contract?.id || contract?.contract_id;
    
    if (!contract || !contractId) {
      console.error('Contract data:', contract);
      showToast(t('rating.contractRequired') || 'Contract information is missing', 'error');
      return;
    }

    setSubmitting(true);
    
    try {
      const payload = {
        contract_id: contractId,
        rating: rating,
        comment: comment.trim(),
      };
      
      console.log('Submitting rating with payload:', payload);
      
      await AxiosClient.post('/reviews', payload);
      
      showToast(t('rating.submittedSuccessfully') || 'Rating submitted successfully', 'success');
      onSuccess?.();
      onClose();
      setComment('');
      setRating(5);
    } catch (error) {
      console.error('Error submitting rating:', error);
      showToast(
        error.response?.data?.message || 
        t('rating.errorSubmitting') || 
        'Error submitting rating', 
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#444] dark:text-white">
            {t('rating.rateUser') || 'Rate User'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {otherParty && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              {t('rating.ratingFor') || 'Rating for'}
            </p>
            <div className="flex items-center gap-3">
              {otherParty.avatar && (
                <img
                  src={otherParty.avatar}
                  alt={otherParty.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <p className="font-semibold text-[#444] dark:text-white">{otherParty.name}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#444] dark:text-gray-300 mb-2">
              {t('rating.rating') || 'Rating'} *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                >
                  <svg
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 dark:text-gray-600 fill-none'
                    }`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {rating}/5 {t('rating.stars') || 'stars'}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#444] dark:text-gray-300 mb-2">
              {t('rating.comment') || 'Comment'} *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 dark:bg-gray-700 dark:text-white"
              placeholder={t('rating.commentPlaceholder') || 'Share your experience...'}
              required
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {comment.length}/1000 {t('rating.characters') || 'characters'}
            </p>
          </div>

          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              {t('rating.hiddenInfo') || 'Your rating will be hidden until both parties submit their ratings or after 14 days.'}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-[#444] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {t('admin.cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="flex-1 px-4 py-2 bg-yellow-300 dark:bg-yellow-500 hover:bg-yellow-400 dark:hover:bg-yellow-600 text-[#444] dark:text-gray-900 rounded-md font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting 
                ? (t('rating.submitting') || 'Submitting...') 
                : (t('rating.submit') || 'Submit Rating')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RatingModal;

