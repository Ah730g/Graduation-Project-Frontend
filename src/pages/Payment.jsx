import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePopup } from '../contexts/PopupContext';
import AxiosClient from '../AxiosClient';
import EstateCard from '../components/EstateCard';

function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { t, language } = useLanguage();
  const { showToast, showConfirm } = usePopup();
  const [requestId, setRequestId] = useState(null);
  const [bookingRequest, setBookingRequest] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({
    accountNumber: '',
    phoneNumber: '',
    otp: '',
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const requestIdParam = searchParams.get('request_id');
    if (!requestIdParam) {
      showToast(t('payment.noRequestId') || 'No booking request specified', 'error');
      navigate('/booking-requests');
      return;
    }

    setRequestId(requestIdParam);
    fetchBookingRequest(requestIdParam);
  }, [searchParams]);

  const fetchBookingRequest = (id) => {
    setLoading(true);
    AxiosClient.get(`/booking-requests/my-requests`)
      .then((response) => {
        const request = response.data.find(r => r.id === parseInt(id));
        if (request && request.status === 'approved') {
          setBookingRequest(request);
          
          // Check if payment already exists
          checkExistingPayment(parseInt(id));
        } else {
          showToast(t('payment.requestNotApproved') || 'This booking request is not approved', 'error');
          navigate('/booking-requests');
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching booking request:', error);
        showToast(t('payment.errorLoading') || 'Error loading booking request', 'error');
        setLoading(false);
      });
  };

  const checkExistingPayment = (requestId) => {
    // This will be checked when user tries to pay, but we can also check here
    // to show a message if payment already exists
  };

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
    setPaymentDetails({
      accountNumber: '',
      phoneNumber: '',
      otp: '',
    });
  };

  const handleInputChange = (e) => {
    setPaymentDetails({
      ...paymentDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPaymentMethod) {
      showToast(t('payment.selectMethod') || 'Please select a payment method', 'error');
      return;
    }

    // Validate based on payment method
    if (selectedPaymentMethod === 'kareemi_bank' || selectedPaymentMethod === 'kak_bank' || selectedPaymentMethod === 'yemen_kuwait_bank') {
      if (!paymentDetails.accountNumber) {
        showToast(t('payment.enterAccountNumber') || 'Please enter account number', 'error');
        return;
      }
    }

    if (selectedPaymentMethod === 'jeeb_wallet' || selectedPaymentMethod === 'one_cash') {
      if (!paymentDetails.phoneNumber) {
        showToast(t('payment.enterPhoneNumber') || 'Please enter phone number', 'error');
        return;
      }
    }

    const confirmed = await showConfirm({
      title: t('payment.confirmPayment') || 'Confirm Payment',
      message: t('payment.confirmMessage') || `Are you sure you want to pay ${bookingRequest?.post?.Price} using ${t(`payment.methods.${selectedPaymentMethod}`)}?`,
      confirmText: t('payment.pay') || 'Pay',
      cancelText: t('admin.cancel') || 'Cancel',
    });

    if (!confirmed) return;

    setProcessing(true);

    // Create payment
    AxiosClient.post('/payments', {
      rental_request_id: parseInt(requestId),
      payment_method: selectedPaymentMethod,
    })
      .then((response) => {
        // Check if payment is already completed
        if (response.data.already_paid) {
          showToast(t('payment.alreadyPaid') || 'Payment already completed for this request', 'info');
          if (response.data.contract?.id) {
            navigate(`/contracts/${response.data.contract.id}`);
          } else {
            navigate('/booking-requests');
          }
          return;
        }

        // Check if payment is already pending
        if (response.data.already_pending) {
          showToast(t('payment.alreadyPending') || 'A payment is already pending for this request', 'info');
          setProcessing(false);
          return;
        }

        const paymentId = response.data.payment.id;
        
        // Simulate payment processing (in real app, this would be handled by payment gateway)
        setTimeout(() => {
          // Confirm payment
          AxiosClient.post(`/payments/${paymentId}/confirm`, {
            transaction_id: `TXN-${Date.now()}`,
            payment_details: {
              method: selectedPaymentMethod,
              account_number: paymentDetails.accountNumber || null,
              phone_number: paymentDetails.phoneNumber || null,
            },
          })
            .then((confirmResponse) => {
              showToast(t('payment.success') || 'Payment successful! Contract has been created.', 'success');
              if (confirmResponse.data.contract?.id) {
                navigate(`/contracts/${confirmResponse.data.contract.id}`);
              } else {
                navigate('/booking-requests');
              }
            })
            .catch((error) => {
              console.error('Error confirming payment:', error);
              showToast(error.response?.data?.message || t('payment.errorConfirming') || 'Error confirming payment', 'error');
              setProcessing(false);
            });
        }, 2000); // Simulate 2 second processing time
      })
      .catch((error) => {
        console.error('Error processing payment:', error);
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.errors?.rental_request_id?.[0] ||
                           t('payment.error') || 'Error processing payment';
        showToast(errorMessage, 'error');
        setProcessing(false);
      });
  };

  if (!user) {
    return (
      <div className="px-5 mx-auto max-w-[1366px] py-8 text-center">
        <p className="text-gray-600">{t('payment.loginRequired') || 'Please login to make payment'}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`px-5 mx-auto max-w-[1366px] py-8 text-center ${
        language === 'ar' 
          ? 'left-1/2 -translate-x-1/2' 
          : 'right-1/2 translate-x-1/2'
      }`}>
        <p className="text-3xl text-green-600 font-bold">{t('common.loading')}</p>
      </div>
    );
  }

  if (!bookingRequest) {
    return null;
  }

  const paymentMethods = [
    { id: 'jeeb_wallet', name: t('payment.methods.jeeb_wallet') || 'Jeeb Wallet', icon: '💳' },
    { id: 'kareemi_bank', name: t('payment.methods.kareemi_bank') || 'Kareemi Bank', icon: '🏦' },
    { id: 'kak_bank', name: t('payment.methods.kak_bank') || 'KAK Bank', icon: '🏦' },
    { id: 'one_cash', name: t('payment.methods.one_cash') || 'One Cash', icon: '💳' },
    { id: 'yemen_kuwait_bank', name: t('payment.methods.yemen_kuwait_bank') || 'Yemen Kuwait Bank', icon: '🏦' },
  ];

  return (
    <div className={`px-5 mx-auto max-w-[1366px] py-8 ${
      language === 'ar' ? 'lg:pl-10' : 'lg:pr-10'
    }`}>
      <h1 className="text-3xl font-bold text-[#444] mb-8">
        {t('payment.payment') || 'Payment'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Apartment Details */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-[#444] mb-4">
            {t('payment.apartmentDetails') || 'Apartment Details'}
          </h2>
          <div className="bg-white border border-gray-200 rounded-md p-6 mb-6">
            <EstateCard estate={bookingRequest.post} showSaveButton={false} />
          </div>

          <div className="bg-yellow-100 border border-yellow-300 rounded-md p-4">
            <p className="text-lg font-semibold text-[#444]">
              {t('payment.totalAmount') || 'Total Amount'}: <span className="text-2xl">${bookingRequest.post.Price}</span>
            </p>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white border border-gray-200 rounded-md p-6">
          <h2 className="text-xl font-semibold text-[#444] mb-6">
            {t('payment.selectPaymentMethod') || 'Select Payment Method'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Methods */}
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-3 p-4 border-2 rounded-md cursor-pointer transition ${
                    selectedPaymentMethod === method.id
                      ? 'border-yellow-300 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedPaymentMethod === method.id}
                    onChange={() => handlePaymentMethodChange(method.id)}
                    className="w-4 h-4 text-yellow-300"
                  />
                  <span className="text-2xl">{method.icon}</span>
                  <span className="font-semibold text-[#444]">{method.name}</span>
                </label>
              ))}
            </div>

            {/* Payment Details */}
            {selectedPaymentMethod && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                {(selectedPaymentMethod === 'kareemi_bank' || 
                  selectedPaymentMethod === 'kak_bank' || 
                  selectedPaymentMethod === 'yemen_kuwait_bank') && (
                  <div>
                    <label className="block text-sm font-semibold text-[#444] mb-2">
                      {t('payment.accountNumber') || 'Account Number'}
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={paymentDetails.accountNumber}
                      onChange={handleInputChange}
                      placeholder={t('payment.enterAccountNumber') || 'Enter account number'}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
                      required
                    />
                  </div>
                )}

                {(selectedPaymentMethod === 'jeeb_wallet' || selectedPaymentMethod === 'one_cash') && (
                  <div>
                    <label className="block text-sm font-semibold text-[#444] mb-2">
                      {t('payment.phoneNumber') || 'Phone Number'}
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={paymentDetails.phoneNumber}
                      onChange={handleInputChange}
                      placeholder={t('payment.enterPhoneNumber') || 'Enter phone number'}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
                      required
                    />
                  </div>
                )}

                {/* OTP Field (optional for some methods) */}
                {selectedPaymentMethod && (
                  <div>
                    <label className="block text-sm font-semibold text-[#444] mb-2">
                      {t('payment.otp') || 'OTP (Optional)'}
                    </label>
                    <input
                      type="text"
                      name="otp"
                      value={paymentDetails.otp}
                      onChange={handleInputChange}
                      placeholder={t('payment.enterOtp') || 'Enter OTP if required'}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    />
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={processing || !selectedPaymentMethod}
              className="w-full bg-yellow-300 hover:bg-yellow-400 text-[#444] font-semibold py-3 px-6 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing 
                ? (t('payment.processing') || 'Processing...') 
                : (t('payment.payNow') || `Pay $${bookingRequest.post.Price}`)}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Payment;

