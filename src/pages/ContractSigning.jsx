import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AxiosClient from '../AxiosClient';
import { useLanguage } from '../contexts/LanguageContext';
import { usePopup } from '../contexts/PopupContext';
import { useUserContext } from '../contexts/UserContext';
import RatingModal from '../components/RatingModal';

const ContractSigning = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { showToast, showConfirm } = usePopup();
  const { user } = useUserContext();
  
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signatureType, setSignatureType] = useState('typed');
  const [typedSignature, setTypedSignature] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [contractReviews, setContractReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);

  useEffect(() => {
    fetchContract();
  }, [id]);

  useEffect(() => {
    if (contract && contract.status === 'expired') {
      fetchContractReviews();
    }
  }, [contract, id]);

  const fetchContract = () => {
    setLoading(true);
    AxiosClient.get(`/contracts/${id}`)
      .then((response) => {
        setContract(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching contract:', error);
        showToast(t('contract.errorLoading') || 'Error loading contract', 'error');
        setLoading(false);
        navigate('/booking-requests');
      });
  };

  const fetchContractReviews = () => {
    AxiosClient.get(`/reviews/contract/${id}`)
      .then((response) => {
        setContractReviews(response.data || []);
        // Find user's review
        const review = response.data?.find(r => r.rater?.id === user?.id);
        setUserReview(review || null);
      })
      .catch((error) => {
        console.error('Error fetching reviews:', error);
      });
  };

  const handleSign = async () => {
    if (!contract) return;

    let signature = '';
    
    if (signatureType === 'typed') {
      signature = typedSignature.trim();
      if (!signature) {
        showToast(t('contract.typedSignatureRequired') || 'Please enter your name', 'error');
        return;
      }
    } else if (signatureType === 'otp') {
      signature = otpCode.trim();
      if (!signature || signature.length !== 6) {
        showToast(t('contract.otpRequired') || 'Please enter a valid 6-digit OTP code', 'error');
        return;
      }
    }

    const confirmed = await showConfirm({
      title: t('contract.confirmSign') || 'Confirm Signature',
      message: t('contract.confirmSignMessage') || 'Are you sure you want to sign this contract? This action cannot be undone.',
      confirmText: t('contract.sign') || 'Sign',
      cancelText: t('admin.cancel') || 'Cancel',
    });

    if (!confirmed) return;

    setSigning(true);
    AxiosClient.post(`/contracts/${id}/sign`, {
      signature,
      signature_type: signatureType,
    })
      .then((response) => {
        showToast(t('contract.signedSuccessfully') || 'Contract signed successfully', 'success');
        fetchContract();
        setSigning(false);
        setTypedSignature('');
        setOtpCode('');
      })
      .catch((error) => {
        console.error('Error signing contract:', error);
        showToast(error.response?.data?.message || t('contract.errorSigning') || 'Error signing contract', 'error');
        setSigning(false);
      });
  };

  const handleConfirmPayment = async () => {
    if (!contract) return;

    const confirmed = await showConfirm({
      title: t('contract.confirmPayment') || 'Confirm Payment Receipt',
      message: t('contract.confirmPaymentMessage') || 'Are you sure you have received the payment? This will mark the apartment as rented and remove it from public listings.',
      confirmText: t('contract.confirm') || 'Confirm',
      cancelText: t('admin.cancel') || 'Cancel',
    });

    if (!confirmed) return;

    setConfirmingPayment(true);
    AxiosClient.post(`/contracts/${id}/confirm-payment`)
      .then((response) => {
        showToast(t('contract.paymentConfirmed') || 'Payment confirmed successfully', 'success');
        fetchContract();
        setConfirmingPayment(false);
      })
      .catch((error) => {
        console.error('Error confirming payment:', error);
        showToast(error.response?.data?.message || t('contract.errorConfirmingPayment') || 'Error confirming payment', 'error');
        setConfirmingPayment(false);
      });
  };

  const handleDelete = async () => {
    if (!contract) return;

    const confirmed = await showConfirm({
      title: t('contract.deleteContract') || 'Delete Contract',
      message: t('contract.confirmDelete') || 'Are you sure you want to delete this contract? This action cannot be undone.',
      confirmText: t('admin.delete') || 'Delete',
      cancelText: t('admin.cancel') || 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    setDeleting(true);
    AxiosClient.delete(`/contracts/${id}`)
      .then(() => {
        showToast(t('contract.deletedSuccessfully') || 'Contract deleted successfully', 'success');
        navigate('/booking-requests');
      })
      .catch((error) => {
        console.error('Error deleting contract:', error);
        showToast(error.response?.data?.message || t('contract.errorDeleting') || 'Error deleting contract', 'error');
        setDeleting(false);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf5f3] flex items-center justify-center">
        <div className={`absolute ${language === 'ar' ? 'left-1/2' : 'right-1/2'} top-1/2 transform -translate-x-1/2 -translate-y-1/2`}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-300"></div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-[#fcf5f3] flex items-center justify-center">
        <p className="text-[#444]">{t('contract.notFound') || 'Contract not found'}</p>
      </div>
    );
  }

  const isOwner = contract.post?.user_id === user?.id;
  const isRenter = contract.user_id === user?.id || 
                   (contract.rentalRequest?.user_id === user?.id);
  // Can sign only if status is pending_signing (after owner confirms payment) and hasn't signed yet
  const canSign = contract.status === 'pending_signing' && contract.payment_confirmed_by_owner && ((isOwner && !contract.owner_signature) || (isRenter && !contract.renter_signature));
  const bothSigned = contract.owner_signature && contract.renter_signature;
  // Owner can confirm payment receipt if status is pending (after payment) and payment is paid
  const canConfirmPayment = isOwner && contract.status === 'pending' && !contract.payment_confirmed_by_owner && contract.payment?.status === 'paid';

  const ownerIdentity = contract.post?.user?.identityVerifications?.[0];
  // Try to get renter identity from rentalRequest first, then from contract.user
  const renterIdentity = contract.rentalRequest?.user?.identityVerifications?.[0] || contract.user?.identityVerifications?.[0];

  return (
    <div className="min-h-screen bg-[#fcf5f3] py-8 px-5">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#444]">
              {t('contract.contractDetails') || 'Contract Details'}
            </h1>
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem('ACCESS_TOKEN');
                  if (!token) {
                    showToast(t('contract.loginRequired') || 'Please login to download PDF', 'error');
                    return;
                  }

                  const response = await fetch(`${AxiosClient.defaults.baseURL}/contracts/${id}/pdf`, {
                    method: 'GET',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Accept': 'application/pdf',
                    },
                  });

                  if (!response.ok) {
                    // Try to get error message from response
                    let errorMessage = 'Network response was not ok';
                    try {
                      const errorData = await response.json();
                      errorMessage = errorData.message || errorMessage;
                    } catch (e) {
                      // If response is not JSON, use status text
                      errorMessage = response.statusText || errorMessage;
                    }
                    throw new Error(errorMessage);
                  }

                  // Check if response is actually PDF
                  const contentType = response.headers.get('content-type');
                  if (!contentType || !contentType.includes('application/pdf')) {
                    // If not PDF, try to read as text to see error message
                    const text = await response.text();
                    try {
                      const errorData = JSON.parse(text);
                      throw new Error(errorData.message || 'Invalid response format');
                    } catch (e) {
                      throw new Error('Server returned non-PDF response');
                    }
                  }

                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `contract_${id}_${new Date().toISOString().split('T')[0]}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                  showToast(t('contract.downloadPdf') || 'PDF downloaded successfully', 'success');
                } catch (error) {
                  console.error('Error downloading PDF:', error);
                  const errorMessage = error.message || t('contract.errorDownloadingPdf') || 'Error downloading PDF';
                  showToast(errorMessage, 'error');
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t('contract.downloadPdf') || 'Download PDF'}
            </button>
          </div>

          {/* Contract Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-[#888] mb-1">{t('contract.apartment') || 'Apartment'}</p>
              <p className="font-semibold text-[#444]">{contract.post?.Title || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-[#888] mb-1">{t('contract.monthlyRent') || 'Monthly Rent'}</p>
              <p className="font-semibold text-[#444]">${contract.monthly_rent || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-[#888] mb-1">{t('contract.startDate') || 'Start Date'}</p>
              <p className="font-semibold text-[#444]">
                {contract.start_date ? new Date(contract.start_date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#888] mb-1">{t('contract.endDate') || 'End Date'}</p>
              <p className="font-semibold text-[#444]">
                {contract.end_date ? new Date(contract.end_date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          {/* Owner Information */}
          <div className="mb-6 border-t pt-6">
            <h2 className="text-xl font-bold text-[#444] mb-4">
              {t('contract.ownerInformation') || 'Owner Information'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-[#888] mb-1">{t('contract.name') || 'Name'}</p>
                <p className="font-semibold text-[#444]">{contract.post?.user?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-[#888] mb-1">{t('contract.email') || 'Email'}</p>
                <p className="font-semibold text-[#444]">{contract.post?.user?.email || 'N/A'}</p>
              </div>
              {contract.post?.user?.phone && (
                <div>
                  <p className="text-sm text-[#888] mb-1">{t('contract.phone') || 'Phone'}</p>
                  <p className="font-semibold text-[#444]">{contract.post?.user?.phone}</p>
                </div>
              )}
            </div>

            {/* Owner Identity Information */}
            {ownerIdentity && (
              <div className="bg-gray-50 p-4 rounded-md mt-4">
                <h3 className="font-semibold text-[#444] mb-3">
                  {t('contract.identityInformation') || 'Identity Information'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#888] mb-1">{t('contract.fullName') || 'Full Name'}</p>
                    <p className="font-semibold text-[#444]">{ownerIdentity.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#888] mb-1">{t('contract.documentNumber') || 'Document Number'}</p>
                    <p className="font-semibold text-[#444]">
                      {ownerIdentity.document_number ? ownerIdentity.document_number : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#888] mb-1">{t('contract.documentType') || 'Document Type'}</p>
                    <p className="font-semibold text-[#444]">
                      {ownerIdentity.document_type === 'id_card' 
                        ? (t('contract.idCard') || 'ID Card')
                        : (t('contract.passport') || 'Passport')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#888] mb-1">{t('contract.dateOfBirth') || 'Date of Birth'}</p>
                    <p className="font-semibold text-[#444]">
                      {ownerIdentity.date_of_birth 
                        ? new Date(ownerIdentity.date_of_birth).toLocaleDateString() 
                        : 'N/A'}
                    </p>
                  </div>
                  {ownerIdentity.place_of_birth && (
                    <div>
                      <p className="text-sm text-[#888] mb-1">{t('contract.placeOfBirth') || 'Place of Birth'}</p>
                      <p className="font-semibold text-[#444]">{ownerIdentity.place_of_birth}</p>
                    </div>
                  )}
                  {ownerIdentity.nationality && (
                    <div>
                      <p className="text-sm text-[#888] mb-1">{t('contract.nationality') || 'Nationality'}</p>
                      <p className="font-semibold text-[#444]">{ownerIdentity.nationality}</p>
                    </div>
                  )}
                  {ownerIdentity.issue_date && (
                    <div>
                      <p className="text-sm text-[#888] mb-1">{t('contract.issueDate') || 'Issue Date'}</p>
                      <p className="font-semibold text-[#444]">
                        {new Date(ownerIdentity.issue_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {ownerIdentity.expiry_date && (
                    <div>
                      <p className="text-sm text-[#888] mb-1">{t('contract.expiryDate') || 'Expiry Date'}</p>
                      <p className="font-semibold text-[#444]">
                        {new Date(ownerIdentity.expiry_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {ownerIdentity.address && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-[#888] mb-1">{t('contract.address') || 'Address'}</p>
                      <p className="font-semibold text-[#444]">{ownerIdentity.address}</p>
                    </div>
                  )}
                </div>
                {/* Identity Documents */}
                {(ownerIdentity.document_front_url || ownerIdentity.document_back_url) && (
                  <div className="mt-4">
                    <p className="text-sm text-[#888] mb-2">{t('contract.identityDocuments') || 'Identity Documents'}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ownerIdentity.document_front_url && (
                        <div>
                          <p className="text-sm text-[#888] mb-1">{t('contract.frontDocument') || 'Front Document'}</p>
                          <img
                            src={ownerIdentity.document_front_url}
                            alt={t('contract.frontDocument') || 'Front Document'}
                            className="w-full max-h-64 object-contain border border-gray-300 rounded-md"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <a
                            href={ownerIdentity.document_front_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                            style={{ display: 'none' }}
                          >
                            {t('contract.viewDocument') || 'View Document'}
                          </a>
                        </div>
                      )}
                      {ownerIdentity.document_back_url && (
                        <div>
                          <p className="text-sm text-[#888] mb-1">{t('contract.backDocument') || 'Back Document'}</p>
                          <img
                            src={ownerIdentity.document_back_url}
                            alt={t('contract.backDocument') || 'Back Document'}
                            className="w-full max-h-64 object-contain border border-gray-300 rounded-md"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <a
                            href={ownerIdentity.document_back_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                            style={{ display: 'none' }}
                          >
                            {t('contract.viewDocument') || 'View Document'}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Renter Information */}
          <div className="mb-6 border-t pt-6">
            <h2 className="text-xl font-bold text-[#444] mb-4">
              {t('contract.renterInformation') || 'Renter Information'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-[#888] mb-1">{t('contract.name') || 'Name'}</p>
                <p className="font-semibold text-[#444]">{contract.rentalRequest?.user?.name || contract.user?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-[#888] mb-1">{t('contract.email') || 'Email'}</p>
                <p className="font-semibold text-[#444]">{contract.rentalRequest?.user?.email || contract.user?.email || 'N/A'}</p>
              </div>
              {(contract.rentalRequest?.user?.phone || contract.user?.phone) && (
                <div>
                  <p className="text-sm text-[#888] mb-1">{t('contract.phone') || 'Phone'}</p>
                  <p className="font-semibold text-[#444]">{contract.rentalRequest?.user?.phone || contract.user?.phone}</p>
                </div>
              )}
            </div>

            {/* Renter Identity Information */}
            {renterIdentity && (
              <div className="bg-gray-50 p-4 rounded-md mt-4">
                <h3 className="font-semibold text-[#444] mb-3">
                  {t('contract.identityInformation') || 'Identity Information'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#888] mb-1">{t('contract.fullName') || 'Full Name'}</p>
                    <p className="font-semibold text-[#444]">{renterIdentity.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#888] mb-1">{t('contract.documentNumber') || 'Document Number'}</p>
                    <p className="font-semibold text-[#444]">
                      {renterIdentity.document_number ? renterIdentity.document_number : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#888] mb-1">{t('contract.documentType') || 'Document Type'}</p>
                    <p className="font-semibold text-[#444]">
                      {renterIdentity.document_type === 'id_card' 
                        ? (t('contract.idCard') || 'ID Card')
                        : (t('contract.passport') || 'Passport')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#888] mb-1">{t('contract.dateOfBirth') || 'Date of Birth'}</p>
                    <p className="font-semibold text-[#444]">
                      {renterIdentity.date_of_birth 
                        ? new Date(renterIdentity.date_of_birth).toLocaleDateString() 
                        : 'N/A'}
                    </p>
                  </div>
                  {renterIdentity.place_of_birth && (
                    <div>
                      <p className="text-sm text-[#888] mb-1">{t('contract.placeOfBirth') || 'Place of Birth'}</p>
                      <p className="font-semibold text-[#444]">{renterIdentity.place_of_birth}</p>
                    </div>
                  )}
                  {renterIdentity.nationality && (
                    <div>
                      <p className="text-sm text-[#888] mb-1">{t('contract.nationality') || 'Nationality'}</p>
                      <p className="font-semibold text-[#444]">{renterIdentity.nationality}</p>
                    </div>
                  )}
                  {renterIdentity.issue_date && (
                    <div>
                      <p className="text-sm text-[#888] mb-1">{t('contract.issueDate') || 'Issue Date'}</p>
                      <p className="font-semibold text-[#444]">
                        {new Date(renterIdentity.issue_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {renterIdentity.expiry_date && (
                    <div>
                      <p className="text-sm text-[#888] mb-1">{t('contract.expiryDate') || 'Expiry Date'}</p>
                      <p className="font-semibold text-[#444]">
                        {new Date(renterIdentity.expiry_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {renterIdentity.address && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-[#888] mb-1">{t('contract.address') || 'Address'}</p>
                      <p className="font-semibold text-[#444]">{renterIdentity.address}</p>
                    </div>
                  )}
                </div>
                {/* Identity Documents */}
                {(renterIdentity.document_front_url || renterIdentity.document_back_url) && (
                  <div className="mt-4">
                    <p className="text-sm text-[#888] mb-2">{t('contract.identityDocuments') || 'Identity Documents'}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renterIdentity.document_front_url && (
                        <div>
                          <p className="text-sm text-[#888] mb-1">{t('contract.frontDocument') || 'Front Document'}</p>
                          <img
                            src={renterIdentity.document_front_url}
                            alt={t('contract.frontDocument') || 'Front Document'}
                            className="w-full max-h-64 object-contain border border-gray-300 rounded-md"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <a
                            href={renterIdentity.document_front_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                            style={{ display: 'none' }}
                          >
                            {t('contract.viewDocument') || 'View Document'}
                          </a>
                        </div>
                      )}
                      {renterIdentity.document_back_url && (
                        <div>
                          <p className="text-sm text-[#888] mb-1">{t('contract.backDocument') || 'Back Document'}</p>
                          <img
                            src={renterIdentity.document_back_url}
                            alt={t('contract.backDocument') || 'Back Document'}
                            className="w-full max-h-64 object-contain border border-gray-300 rounded-md"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <a
                            href={renterIdentity.document_back_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                            style={{ display: 'none' }}
                          >
                            {t('contract.viewDocument') || 'View Document'}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Terms and Conditions */}
          {contract.terms && (
            <div className="mb-6 border-t pt-6">
              <p className="text-sm text-[#888] mb-2">{t('contract.terms') || 'Terms and Conditions'}</p>
              <div className="bg-gray-100 p-4 rounded-md">
                <p className="text-[#444] whitespace-pre-wrap">{contract.terms}</p>
              </div>
            </div>
          )}

          {/* Signing Status */}
          <div className="mb-6 border-t pt-6">
            <p className="text-sm text-[#888] mb-2">{t('contract.signingStatus') || 'Signing Status'}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-md ${contract.owner_signature ? 'bg-green-100' : 'bg-gray-100'}`}>
                <p className="font-semibold text-[#444] mb-1">{t('contract.ownerSignature') || 'Owner Signature'}</p>
                <p className="text-sm text-[#888]">
                  {contract.owner_signature 
                    ? `${t('contract.signed') || 'Signed'} - ${contract.owner_signed_at ? new Date(contract.owner_signed_at).toLocaleString() : ''}`
                    : t('contract.notSigned') || 'Not Signed'}
                </p>
              </div>
              <div className={`p-4 rounded-md ${contract.renter_signature ? 'bg-green-100' : 'bg-gray-100'}`}>
                <p className="font-semibold text-[#444] mb-1">{t('contract.renterSignature') || 'Renter Signature'}</p>
                <p className="text-sm text-[#888]">
                  {contract.renter_signature 
                    ? `${t('contract.signed') || 'Signed'} - ${contract.renter_signed_at ? new Date(contract.renter_signed_at).toLocaleString() : ''}`
                    : t('contract.notSigned') || 'Not Signed'}
                </p>
              </div>
            </div>
          </div>

          {/* Contract Status */}
          <div className="mb-6 border-t pt-6">
            <p className="text-sm text-[#888] mb-2">{t('contract.status') || 'Status'}</p>
            <div className="space-y-2">
              <span className={`inline-block px-4 py-2 rounded-md font-semibold ${
                contract.status === 'active' ? 'bg-blue-200 text-blue-800' :
                contract.status === 'signed' ? 'bg-green-200 text-green-800' :
                contract.status === 'pending_signing' ? 'bg-yellow-200 text-yellow-800' :
                contract.status === 'draft' ? 'bg-gray-200 text-gray-800' :
                contract.status === 'pending' ? 'bg-orange-200 text-orange-800' :
                contract.status === 'cancelled' ? 'bg-red-200 text-red-800' :
                'bg-gray-200 text-gray-800'
              }`}>
                {t(`contract.statuses.${contract.status}`) || contract.status}
              </span>
              {contract.cancelled_by_admin && (
                <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 font-semibold">
                    {t('contract.cancelledByAdmin') || 'This contract has been cancelled by the administration.'}
                  </p>
                  <p className="text-red-700 text-sm mt-1">
                    {t('contract.cancelledByAdminMessage') || 'The apartment listing has been restored and is now available for booking again.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Signing Section */}
          {canSign && (
            <div className="border-t pt-6 mt-6">
              <h2 className="text-xl font-bold text-[#444] mb-4">
                {t('contract.signContract') || 'Sign Contract'}
              </h2>

              {/* Signature Type Selection */}
              <div className="mb-4">
                <p className="text-sm text-[#888] mb-2">{t('contract.signatureType') || 'Signature Type'}</p>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="typed"
                      checked={signatureType === 'typed'}
                      onChange={(e) => setSignatureType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-[#444]">{t('contract.typedSignature') || 'Typed Signature'}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="otp"
                      checked={signatureType === 'otp'}
                      onChange={(e) => setSignatureType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-[#444]">{t('contract.otpSignature') || 'OTP Verification'}</span>
                  </label>
                </div>
              </div>

              {/* Typed Signature */}
              {signatureType === 'typed' && (
                <div className="mb-4">
                  <p className="text-sm text-[#888] mb-2">{t('contract.enterYourName') || 'Enter your name'}</p>
                  <input
                    type="text"
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    placeholder={t('contract.yourName') || 'Your name'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  />
                </div>
              )}

              {/* OTP Signature */}
              {signatureType === 'otp' && (
                <div className="mb-4">
                  <p className="text-sm text-[#888] mb-2">{t('contract.enterOTP') || 'Enter 6-digit OTP code'}</p>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 text-center text-2xl tracking-widest"
                  />
                </div>
              )}

              <button
                onClick={handleSign}
                disabled={signing}
                className="w-full bg-yellow-300 text-[#444] font-semibold py-3 rounded-md hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signing ? (t('contract.signing') || 'Signing...') : (t('contract.sign') || 'Sign Contract')}
              </button>
            </div>
          )}

          {/* Confirm Payment Section (Owner Only) */}
          {canConfirmPayment && (
            <div className="border-t pt-6 mt-6">
              <h2 className="text-xl font-bold text-[#444] mb-4">
                {t('contract.confirmPayment') || 'Confirm Payment Receipt'}
              </h2>
              <p className="text-sm text-[#888] mb-4">
                {t('contract.confirmPaymentDescription') || 'Please confirm that you have received the payment. This will hide the apartment from public listings and allow both parties to sign the contract.'}
              </p>
              <button
                onClick={handleConfirmPayment}
                disabled={confirmingPayment}
                className="w-full bg-green-500 text-white font-semibold py-3 rounded-md hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {confirmingPayment 
                  ? (t('contract.confirming') || 'Confirming...') 
                  : (t('contract.confirmPayment') || 'Confirm Payment Receipt')}
              </button>
            </div>
          )}

          {/* Delete Contract Button (for cancelled contracts) */}
          {contract.status === 'cancelled' && (isOwner || isRenter) && (
            <div className="border-t pt-6 mt-6">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full bg-red-500 text-white font-semibold py-3 rounded-md hover:bg-red-600 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting 
                  ? (t('contract.deleting') || 'Deleting...') 
                  : (t('contract.deleteContract') || 'Delete Contract')}
              </button>
            </div>
          )}

          {/* Rating Section - Show for expired contracts */}
          {contract.status === 'expired' && (isOwner || isRenter) && (
            <div className="border-t pt-6 mt-6">
              <h2 className="text-xl font-bold text-[#444] mb-4">
                {t('rating.rateYourExperience') || 'Rate Your Experience'}
              </h2>
              
              {/* Get the other party */}
              {(() => {
                const otherParty = isOwner 
                  ? (contract.rentalRequest?.user || contract.user)
                  : contract.post?.user;
                
                return (
                  <div className="space-y-4">
                    {otherParty && (
                      <div className="p-4 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600 mb-2">
                          {t('rating.rateUser') || 'Rate'}: {otherParty.name}
                        </p>
                        <div className="flex items-center gap-3">
                          {otherParty.avatar && (
                            <img
                              src={otherParty.avatar}
                              alt={otherParty.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-[#444]">{otherParty.name}</p>
                            {otherParty.email && (
                              <p className="text-sm text-gray-600">{otherParty.email}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* User's Review */}
                    {userReview ? (
                      <div className="p-4 bg-blue-50 rounded-md">
                        <p className="font-semibold text-[#444] mb-2">
                          {t('rating.yourRating') || 'Your Rating'}
                          {userReview.status === 'hidden' && (
                            <span className="ml-2 text-sm font-normal text-gray-600">
                              ({t('rating.hidden') || 'Hidden - will be revealed when both parties rate or after 14 days'})
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">⭐</span>
                          <span className="font-semibold text-lg">
                            {userReview.rating}/5
                          </span>
                        </div>
                        {userReview.comment && (
                          <p className="text-[#444] mt-2">{userReview.comment}</p>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowRatingModal(true)}
                        className="w-full bg-yellow-300 hover:bg-yellow-400 text-[#444] font-semibold py-3 rounded-md transition"
                      >
                        {t('rating.rateNow') || 'Rate This Stay'}
                      </button>
                    )}

                    {/* Other Party's Review (if revealed) */}
                    {contractReviews.filter(r => r.rater?.id !== user?.id && r.status === 'revealed').map((review) => (
                      <div key={review.id} className="p-4 bg-green-50 rounded-md">
                        <p className="font-semibold text-[#444] mb-2">
                          {review.rater?.name}'s {t('rating.rating') || 'Rating'}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">⭐</span>
                          <span className="font-semibold text-lg">
                            {review.rating}/5
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-[#444] mt-2">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Status Messages */}
          {!canSign && !canConfirmPayment && contract.status !== 'cancelled' && contract.status !== 'expired' && (
            <div className="border-t pt-6 mt-6">
              <p className="text-center text-[#888]">
                {contract.status === 'active' 
                  ? (t('contract.contractCompleted') || 'Contract is completed and active.')
                  : contract.status === 'signed'
                    ? (bothSigned && !contract.cancelled_by_admin
                      ? (t('contract.bothPartiesSigned') || 'Both parties have signed this contract.')
                      : (t('contract.contractCompleted') || 'Contract is completed and active.'))
                    : bothSigned && !contract.cancelled_by_admin
                      ? (t('contract.bothPartiesSigned') || 'Both parties have signed this contract.')
                      : contract.status === 'pending' && !contract.payment_confirmed_by_owner
                        ? (t('contract.waitingForOwnerConfirmation') || 'Waiting for owner to confirm payment receipt.')
                        : contract.status === 'pending_signing' && !bothSigned
                          ? (t('contract.waitingForOtherParty') || 'Waiting for the other party to sign.')
                          : (t('contract.waitingForOtherParty') || 'Waiting for the other party to sign.')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && contract && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          contract={contract}
          otherParty={
            isOwner 
              ? (contract.rentalRequest?.user || contract.user)
              : contract.post?.user
          }
          onSuccess={() => {
            fetchContractReviews();
            fetchContract();
          }}
        />
      )}
    </div>
  );
};

export default ContractSigning;
