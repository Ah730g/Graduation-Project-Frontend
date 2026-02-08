import { useEffect, useState } from 'react';
import AxiosClient from '../AxiosClient';
import { useUserContext } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePopup } from '../contexts/PopupContext';
import RatingModal from '../components/RatingModal';
import { useNavigate } from 'react-router-dom';

function Ratings() {
  const { user } = useUserContext();
  const { t, language } = useLanguage();
  const { showToast } = usePopup();
  const navigate = useNavigate();
  const [eligibleContracts, setEligibleContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEligibleContracts();
    }
  }, [user]);

  const fetchEligibleContracts = () => {
    setLoading(true);
    AxiosClient.get('/reviews/eligible-contracts')
      .then((response) => {
        setEligibleContracts(response.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching eligible contracts:', error);
        showToast(t('rating.errorLoading') || 'Error loading contracts', 'error');
        setLoading(false);
      });
  };

  const handleRate = (contract) => {
    // Ensure contract object has the id property
    const contractWithId = {
      ...contract,
      id: contract.id || contract.contract_id,
    };
    setSelectedContract(contractWithId);
    setShowRatingModal(true);
  };

  const handleRatingSuccess = () => {
    fetchEligibleContracts();
  };

  if (!user) {
    return (
      <div className="px-5 mx-auto max-w-[1366px] py-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          {t('rating.loginRequired') || 'Please login to view ratings'}
        </p>
      </div>
    );
  }

  return (
    <div className={`px-5 mx-auto max-w-[1366px] py-8 dark:bg-gray-900 ${
      language === 'ar' ? 'lg:pl-10' : 'lg:pr-10'
    }`}>
      <h1 className="text-3xl font-bold text-[#444] dark:text-white mb-8">
        {t('rating.rateCompletedStays') || 'Rate Completed Stays'}
      </h1>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-300 mx-auto"></div>
        </div>
      ) : eligibleContracts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            {t('rating.noEligibleContracts') || 'No completed stays available for rating'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {eligibleContracts.map((contract) => (
            <div
              key={contract.contract_id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#444] dark:text-white mb-2">
                    {contract.post?.title || contract.post?.Title || 'Apartment'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {contract.post?.address || contract.post?.Address || 'Address not specified'}
                  </p>
                  <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <span>
                      {t('rating.startDate') || 'Start'}: {new Date(contract.start_date).toLocaleDateString()}
                    </span>
                    <span>
                      {t('rating.endDate') || 'End'}: {new Date(contract.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {contract.has_rated && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md text-sm font-semibold">
                    {t('rating.rated') || 'Rated'}
                  </span>
                )}
              </div>

              {contract.other_party && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {t('rating.rateUser') || 'Rate'}: {contract.other_party.name}
                  </p>
                  <div className="flex items-center gap-3">
                    {contract.other_party.avatar && (
                      <img
                        src={contract.other_party.avatar}
                        alt={contract.other_party.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-[#444] dark:text-white">
                        {contract.other_party.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {contract.user_review && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                    {t('rating.yourRating') || 'Your Rating'}
                    {contract.user_review.status === 'hidden' && (
                      <span className="ml-2 text-xs">
                        ({t('rating.hidden') || 'Hidden'})
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">⭐</span>
                    <span className="font-semibold text-[#444] dark:text-white">
                      {contract.user_review.rating}/5
                    </span>
                  </div>
                  {contract.user_review.comment && (
                    <p className="text-sm text-[#444] dark:text-gray-300">
                      {contract.user_review.comment}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                {!contract.has_rated ? (
                  <button
                    onClick={() => handleRate(contract)}
                    className="bg-yellow-300 dark:bg-yellow-500 hover:bg-yellow-400 dark:hover:bg-yellow-600 text-[#444] dark:text-gray-900 font-semibold px-6 py-2 rounded-md transition"
                  >
                    {t('rating.rateNow') || 'Rate Now'}
                  </button>
                ) : contract.user_review && contract.user_review.status === 'hidden' ? (
                  <button
                    onClick={() => navigate(`/contracts/${contract.contract_id}`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-md transition"
                  >
                    {t('rating.viewContract') || 'View Contract'}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/contracts/${contract.contract_id}`)}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-md transition"
                  >
                    {t('rating.viewReviews') || 'View Reviews'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showRatingModal && selectedContract && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedContract(null);
          }}
          contract={selectedContract}
          otherParty={selectedContract.other_party}
          onSuccess={handleRatingSuccess}
        />
      )}
    </div>
  );
}

export default Ratings;

