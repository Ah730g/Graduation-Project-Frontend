import React, { useEffect, useState } from 'react';
import { useUserContext } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePopup } from '../contexts/PopupContext';
import AxiosClient from '../AxiosClient';
import EstateCard from '../components/EstateCard';

function BookingRequests() {
  const { user } = useUserContext();
  const { t, language } = useLanguage();
  const { showToast, showConfirm } = usePopup();
  const [activeTab, setActiveTab] = useState('received'); // 'my-requests' or 'received'
  const [myRequests, setMyRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, activeTab]);

  const fetchData = () => {
    setLoading(true);
    if (activeTab === 'my-requests') {
      AxiosClient.get('/booking-requests/my-requests')
        .then((response) => {
          setMyRequests(response.data || []);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching my requests:', error);
          setLoading(false);
        });
    } else {
      AxiosClient.get('/booking-requests/received')
        .then((response) => {
          setReceivedRequests(response.data || []);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching received requests:', error);
          setLoading(false);
        });
    }
  };

  const handleApprove = async (requestId) => {
    const confirmed = await showConfirm({
      title: t('booking.approveRequest') || 'Approve Request',
      message: t('booking.confirmApprove') || 'Are you sure you want to approve this booking request?',
      confirmText: t('admin.approve') || 'Approve',
      cancelText: t('admin.cancel') || 'Cancel',
    });

    if (confirmed) {
      AxiosClient.post(`/booking-requests/${requestId}/approve`)
        .then(() => {
          showToast(t('booking.requestApproved') || 'Request approved successfully', 'success');
          fetchData();
        })
        .catch((error) => {
          console.error('Error approving request:', error);
          showToast(error.response?.data?.message || t('booking.errorApproving') || 'Error approving request', 'error');
        });
    }
  };

  const handleReject = async (requestId) => {
    const confirmed = await showConfirm({
      title: t('booking.rejectRequest') || 'Reject Request',
      message: t('booking.confirmReject') || 'Are you sure you want to reject this booking request?',
      confirmText: t('admin.reject') || 'Reject',
      cancelText: t('admin.cancel') || 'Cancel',
      variant: 'danger',
    });

    if (confirmed) {
      AxiosClient.post(`/booking-requests/${requestId}/reject`)
        .then(() => {
          showToast(t('booking.requestRejected') || 'Request rejected successfully', 'success');
          fetchData();
        })
        .catch((error) => {
          console.error('Error rejecting request:', error);
          showToast(error.response?.data?.message || t('booking.errorRejecting') || 'Error rejecting request', 'error');
        });
    }
  };

  const handleCancel = async (requestId) => {
    const confirmed = await showConfirm({
      title: t('booking.cancelRequest') || 'Cancel Request',
      message: t('booking.confirmCancel') || 'Are you sure you want to cancel this booking request?',
      confirmText: t('booking.cancel') || 'Cancel',
      cancelText: t('admin.cancel') || 'Cancel',
      variant: 'warning',
    });

    if (confirmed) {
      AxiosClient.post(`/booking-requests/${requestId}/cancel`)
        .then(() => {
          showToast(t('booking.requestCancelled') || 'Request cancelled successfully', 'success');
          fetchData();
        })
        .catch((error) => {
          console.error('Error cancelling request:', error);
          showToast(error.response?.data?.message || t('booking.errorCancelling') || 'Error cancelling request', 'error');
        });
    }
  };

  const handleDelete = async (requestId) => {
    const confirmed = await showConfirm({
      title: t('booking.deleteRequest') || 'Delete Request',
      message: t('booking.confirmDelete') || 'Are you sure you want to delete this booking request? This action cannot be undone.',
      confirmText: t('admin.delete') || 'Delete',
      cancelText: t('admin.cancel') || 'Cancel',
      variant: 'danger',
    });

    if (confirmed) {
      AxiosClient.delete(`/booking-requests/${requestId}`)
        .then(() => {
          showToast(t('booking.requestDeleted') || 'Request deleted successfully', 'success');
          fetchData();
        })
        .catch((error) => {
          console.error('Error deleting request:', error);
          showToast(error.response?.data?.message || t('booking.errorDeleting') || 'Error deleting request', 'error');
        });
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-200 text-yellow-800',
      approved: 'bg-green-200 text-green-800',
      awaiting_payment: 'bg-orange-200 text-orange-800',
      payment_received: 'bg-blue-200 text-blue-800',
      payment_confirmed: 'bg-purple-200 text-purple-800',
      contract_signing: 'bg-indigo-200 text-indigo-800',
      contract_signed: 'bg-teal-200 text-teal-800',
      rejected: 'bg-red-200 text-red-800',
      cancelled: 'bg-gray-200 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${statusClasses[status] || 'bg-gray-200'}`}>
        {t(`booking.status.${status}`) || status}
      </span>
    );
  };

  if (!user) {
    return (
      <div className="px-5 mx-auto max-w-[1366px] py-8 text-center">
        <p className="text-gray-600">{t('booking.loginRequired') || 'Please login to view booking requests'}</p>
      </div>
    );
  }

  return (
    <div className={`px-5 mx-auto max-w-[1366px] py-8 dark:bg-gray-900 ${
      language === 'ar' ? 'lg:pl-10' : 'lg:pr-10'
    }`}>
      <h1 className="text-3xl font-bold text-[#444] dark:text-white mb-8">
        {t('booking.bookingRequests') || 'Booking Requests'}
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 font-semibold transition duration-300 ease ${
            activeTab === 'received'
              ? 'bg-yellow-300 dark:bg-yellow-400 text-[#444] dark:text-gray-900 border-b-2 border-yellow-300 dark:border-yellow-400'
              : 'text-[#888] dark:text-gray-400 hover:text-[#444] dark:hover:text-white'
          }`}
        >
          {t('booking.receivedRequests') || 'Received Requests'}
        </button>
        <button
          onClick={() => setActiveTab('my-requests')}
          className={`px-4 py-2 font-semibold transition duration-300 ease ${
            activeTab === 'my-requests'
              ? 'bg-yellow-300 dark:bg-yellow-400 text-[#444] dark:text-gray-900 border-b-2 border-yellow-300 dark:border-yellow-400'
              : 'text-[#888] dark:text-gray-400 hover:text-[#444] dark:hover:text-white'
          }`}
        >
          {t('booking.myRequests') || 'My Requests'}
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
      ) : (
        <div className="space-y-6">
          {activeTab === 'received' ? (
            receivedRequests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">{t('booking.noReceivedRequests') || 'No received requests'}</p>
              </div>
            ) : (
              receivedRequests.map((request) => (
                <div key={request.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#444] dark:text-white mb-2">
                        {t('booking.requestFrom') || 'Request from'}: {request.user?.name}
                      </h3>
                      <p className="text-sm text-[#888] dark:text-gray-400">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  <EstateCard estate={request.post} showSaveButton={false} />
                  
                  {request.message && (
                    <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                      <p className="text-sm text-[#444] dark:text-gray-200">{request.message}</p>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white px-6 py-2 rounded-md transition"
                      >
                        {t('admin.approve') || 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white px-6 py-2 rounded-md transition"
                      >
                        {t('admin.reject') || 'Reject'}
                      </button>
                    </div>
                  )}

                  {request.status === 'approved' && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                      <p className="text-sm text-green-800 dark:text-green-300">
                        {t('booking.approvedMessage') || 'This request has been approved. Waiting for payment.'}
                      </p>
                    </div>
                  )}

                  {request.status === 'awaiting_payment' && (
                    <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md">
                      <p className="text-sm text-orange-800 dark:text-orange-300">
                        {t('booking.awaitingPayment') || 'Waiting for payment.'}
                      </p>
                    </div>
                  )}

                  {request.status === 'payment_received' && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800">
                        {t('booking.paymentReceived') || 'Payment received. Waiting for owner confirmation.'}
                      </p>
                      {!request.contract?.payment_confirmed_by_owner && (
                        <div className="mt-3">
                          <button
                            onClick={() => handleCancel(request.id)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md transition"
                          >
                            {t('booking.cancel') || 'Cancel'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {request.status === 'payment_confirmed' && (
                    <div className="mt-4 p-3 bg-purple-50 rounded-md">
                      <p className="text-sm text-purple-800">
                        {t('booking.paymentConfirmed') || 'Payment confirmed. Please sign the contract.'}
                      </p>
                    </div>
                  )}

                  {request.status === 'contract_signed' && !request.contract?.cancelled_by_admin && (
                    <div className="mt-4 p-3 bg-teal-50 rounded-md">
                      <p className="text-sm text-teal-800">
                        {t('booking.contractSigned') || 'Contract has been signed by both parties.'}
                      </p>
                    </div>
                  )}

                  {/* Show message if contract was cancelled by admin */}
                  {request.contract?.cancelled_by_admin && request.contract?.status === 'cancelled' && (
                    <div className="mt-4 p-3 bg-red-50 rounded-md">
                      <p className="text-sm text-red-800 font-semibold">
                        {t('booking.contractCancelledByAdmin') || 'Contract has been cancelled by the administration.'}
                      </p>
                      <div className="mt-3">
                        <button
                          onClick={() => handleDelete(request.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md transition"
                        >
                          {t('admin.delete') || 'Delete'}
                        </button>
                      </div>
                    </div>
                  )}

                  {request.status === 'contract_signing' && request.contract && request.contract.status !== 'draft' && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800 mb-3">
                        {t('booking.contractSigningMessage') || 'Payment confirmed. Please sign the contract.'}
                      </p>
                      <a
                        href={`/contracts/${request.contract.id}`}
                        className="inline-block bg-yellow-300 hover:bg-yellow-400 text-[#444] font-semibold px-6 py-2 rounded-md transition"
                      >
                        {t('booking.viewContract') || 'View Contract'}
                      </a>
                    </div>
                  )}

                  {/* Contract Link - Show if contract exists and is not draft */}
                  {request.contract && request.contract.status !== 'draft' && (
                    <div className="mt-4">
                      <a
                        href={`/contracts/${request.contract.id}`}
                        className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-md transition"
                      >
                        {t('booking.viewContract') || 'View Contract'}
                      </a>
                    </div>
                  )}
                </div>
              ))
            )
          ) : (
            myRequests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">{t('booking.noMyRequests') || 'You have no booking requests'}</p>
              </div>
            ) : (
              myRequests.map((request) => (
                <div key={request.id} className="bg-white border border-gray-200 rounded-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#444] mb-2">
                        {request.post?.Title || 'Apartment'}
                      </h3>
                      <p className="text-sm text-[#888]">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  <EstateCard estate={request.post} showSaveButton={false} />
                  
                  {request.status === 'approved' && (
                    <div className="mt-4 p-3 bg-green-50 rounded-md">
                      <p className="text-sm text-green-800 mb-3">
                        {t('booking.approvedProceedPayment') || 'Your request has been approved! Please proceed to payment.'}
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => window.location.href = `/payment?request_id=${request.id}`}
                          className="bg-yellow-300 hover:bg-yellow-400 text-[#444] font-semibold px-6 py-2 rounded-md transition"
                        >
                          {t('booking.proceedToPayment') || 'Proceed to Payment'}
                        </button>
                        <button
                          onClick={() => handleCancel(request.id)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md transition"
                        >
                          {t('booking.cancel') || 'Cancel'}
                        </button>
                      </div>
                    </div>
                  )}

                  {request.status === 'awaiting_payment' && (
                    <div className="mt-4 p-3 bg-orange-50 rounded-md">
                      <p className="text-sm text-orange-800 mb-3">
                        {t('booking.awaitingPayment') || 'Waiting for payment.'}
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => window.location.href = `/payment?request_id=${request.id}`}
                          className="bg-yellow-300 hover:bg-yellow-400 text-[#444] font-semibold px-6 py-2 rounded-md transition"
                        >
                          {t('booking.proceedToPayment') || 'Proceed to Payment'}
                        </button>
                        <button
                          onClick={() => handleCancel(request.id)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md transition"
                        >
                          {t('booking.cancel') || 'Cancel'}
                        </button>
                      </div>
                    </div>
                  )}

                  {request.status === 'payment_received' && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800">
                        {t('booking.paymentReceived') || 'Payment received. Waiting for owner confirmation.'}
                      </p>
                    </div>
                  )}

                  {request.status === 'payment_confirmed' && (
                    <div className="mt-4 p-3 bg-purple-50 rounded-md">
                      <p className="text-sm text-purple-800 mb-3">
                        {t('booking.paymentConfirmed') || 'Payment confirmed. Please sign the contract.'}
                      </p>
                    </div>
                  )}

                  {request.status === 'contract_signed' && !request.contract?.cancelled_by_admin && (
                    <div className="mt-4 p-3 bg-teal-50 rounded-md">
                      <p className="text-sm text-teal-800">
                        {t('booking.contractSigned') || 'Contract has been signed by both parties.'}
                      </p>
                    </div>
                  )}

                  {/* Show message if contract was cancelled by admin */}
                  {request.contract?.cancelled_by_admin && request.contract?.status === 'cancelled' && (
                    <div className="mt-4 p-3 bg-red-50 rounded-md">
                      <p className="text-sm text-red-800 font-semibold">
                        {t('booking.contractCancelledByAdmin') || 'Contract has been cancelled by the administration.'}
                      </p>
                      <div className="mt-3">
                        <button
                          onClick={() => handleDelete(request.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md transition"
                        >
                          {t('admin.delete') || 'Delete'}
                        </button>
                      </div>
                    </div>
                  )}

                  {request.status === 'contract_signing' && request.contract && request.contract.status !== 'draft' && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800 mb-3">
                        {t('booking.contractSigningMessage') || 'Payment confirmed. Please sign the contract.'}
                      </p>
                      <a
                        href={`/contracts/${request.contract.id}`}
                        className="inline-block bg-yellow-300 hover:bg-yellow-400 text-[#444] font-semibold px-6 py-2 rounded-md transition"
                      >
                        {t('booking.viewContract') || 'View Contract'}
                      </a>
                    </div>
                  )}

                  {/* Contract Link - Show if contract exists and is not draft */}
                  {request.contract && request.contract.status !== 'draft' && (
                    <div className="mt-4">
                      <a
                        href={`/contracts/${request.contract.id}`}
                        className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-md transition"
                      >
                        {t('booking.viewContract') || 'View Contract'}
                      </a>
                    </div>
                  )}

                  {/* Show cancel button for owner in received requests - allow cancel in all stages except after payment confirmation */}
                  {activeTab === 'received' && 
                   (request.status === 'pending' || 
                    request.status === 'approved' || 
                    request.status === 'awaiting_payment' ||
                    request.status === 'payment_received' ||
                    (request.status === 'payment_confirmed' && !request.contract?.payment_confirmed_by_owner)) && 
                   !request.contract?.payment_confirmed_by_owner && (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => handleCancel(request.id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md transition"
                      >
                        {t('booking.cancel') || 'Cancel'}
                      </button>
                    </div>
                  )}

                  {/* Show delete button for cancelled or rejected requests in received requests */}
                  {activeTab === 'received' && (request.status === 'cancelled' || request.status === 'rejected') && (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => handleDelete(request.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md transition"
                      >
                        {t('admin.delete') || 'Delete'}
                      </button>
                    </div>
                  )}

                  {/* Show cancel button for renter in my requests - allow cancel in all stages except after payment confirmation */}
                  {activeTab === 'my-requests' && 
                   (request.status === 'pending' || 
                    request.status === 'approved' || 
                    request.status === 'awaiting_payment' ||
                    request.status === 'payment_received' ||
                    (request.status === 'payment_confirmed' && !request.contract?.payment_confirmed_by_owner)) && 
                   !request.contract?.payment_confirmed_by_owner && (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => handleCancel(request.id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md transition"
                      >
                        {t('booking.cancel') || 'Cancel'}
                      </button>
                    </div>
                  )}

                  {/* Show delete button for cancelled or rejected requests in my requests */}
                  {activeTab === 'my-requests' && (request.status === 'cancelled' || request.status === 'rejected') && (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => handleDelete(request.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md transition"
                      >
                        {t('admin.delete') || 'Delete'}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )
          )}
        </div>
      )}
    </div>
  );
}

export default BookingRequests;

