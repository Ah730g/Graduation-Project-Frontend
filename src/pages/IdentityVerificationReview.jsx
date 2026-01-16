import React, { useState, useEffect } from 'react';
import AxiosClient from '../AxiosClient';
import { useLanguage } from '../contexts/LanguageContext';
import { usePopup } from '../contexts/PopupContext';

function IdentityVerificationReview() {
  const { t } = useLanguage();
  const { showToast, showConfirm } = usePopup();
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [selectedRejectionReason, setSelectedRejectionReason] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  // Predefined rejection reasons
  const rejectionReasons = [
    {
      id: 'unclear_document',
      en: 'Document image is unclear or not readable',
      ar: 'صورة المستند غير واضحة أو غير قابلة للقراءة'
    },
    {
      id: 'expired_document',
      en: 'Document has expired',
      ar: 'المستند منتهي الصلاحية'
    },
    {
      id: 'invalid_document',
      en: 'Document type does not match the selected type',
      ar: 'نوع المستند لا يطابق النوع المحدد'
    },
    {
      id: 'incomplete_information',
      en: 'Required information is missing or incomplete',
      ar: 'المعلومات المطلوبة مفقودة أو غير مكتملة'
    },
    {
      id: 'mismatched_data',
      en: 'Document data does not match the entered information',
      ar: 'بيانات المستند لا تطابق المعلومات المدخلة'
    },
    {
      id: 'fake_document',
      en: 'Document appears to be fake or tampered with',
      ar: 'المستند يبدو مزوراً أو تم التلاعب به'
    },
    {
      id: 'other',
      en: 'Other reason (please specify)',
      ar: 'سبب آخر (يرجى التحديد)'
    }
  ];

  useEffect(() => {
    fetchVerifications();
  }, [filter]);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const endpoint = filter === 'pending' 
        ? '/admin/identity-verifications/pending'
        : '/admin/identity-verifications';
      const response = await AxiosClient.get(endpoint);
      // Handle paginated response or direct array
      const data = response.data.data || response.data;
      setVerifications(Array.isArray(data) ? data : []);
      console.log('Fetched verifications:', data); // Debug log
    } catch (error) {
      console.error('Error fetching verifications:', error);
      setVerifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await AxiosClient.post(`/admin/identity-verifications/${id}/approve`);
      showToast('Verification approved successfully!', 'success');
      fetchVerifications();
      setSelectedVerification(null);
    } catch (error) {
      showToast('Error approving verification: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleReject = async (id) => {
    let finalNotes = '';
    
    if (selectedRejectionReason && selectedRejectionReason !== 'other') {
      const reason = rejectionReasons.find(r => r.id === selectedRejectionReason);
      finalNotes = reason ? `${reason.en} / ${reason.ar}` : '';
    }
    
    if (rejectNotes.trim()) {
      finalNotes = finalNotes ? `${finalNotes}\n\nAdditional notes: ${rejectNotes}` : rejectNotes;
    }

    if (!finalNotes.trim() || finalNotes.trim().length < 10) {
      showToast('Please select a rejection reason or provide a custom reason (minimum 10 characters)', 'warning');
      return;
    }

    try {
      await AxiosClient.post(`/admin/identity-verifications/${id}/reject`, {
        notes: finalNotes,
      });
      showToast('Verification rejected.', 'success');
      fetchVerifications();
      setSelectedVerification(null);
      setRejectNotes('');
      setSelectedRejectionReason('');
    } catch (error) {
      showToast('Error rejecting verification: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleRejectAfterApproval = async (id) => {
    let finalNotes = '';
    
    if (selectedRejectionReason && selectedRejectionReason !== 'other') {
      const reason = rejectionReasons.find(r => r.id === selectedRejectionReason);
      finalNotes = reason ? `${reason.en} / ${reason.ar}` : '';
    }
    
    if (rejectNotes.trim()) {
      finalNotes = finalNotes ? `${finalNotes}\n\nAdditional notes: ${rejectNotes}` : rejectNotes;
    }

    if (!finalNotes.trim() || finalNotes.trim().length < 10) {
      showToast('Please select a rejection reason or provide a custom reason (minimum 10 characters)', 'warning');
      return;
    }

    try {
      await AxiosClient.post(`/admin/identity-verifications/${id}/reject-after-approval`, {
        notes: finalNotes,
      });
      showToast('Verification approval revoked and rejected.', 'success');
      fetchVerifications();
      setSelectedVerification(null);
      setRejectNotes('');
      setSelectedRejectionReason('');
    } catch (error) {
      showToast('Error rejecting verification: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm(
      'Delete Verification Record',
      'Are you sure you want to delete this verification record? This action cannot be undone.',
      'Delete',
      'Cancel'
    );

    if (!confirmed) return;

    try {
      await AxiosClient.delete(`/admin/identity-verifications/${id}`);
      showToast('Verification record deleted successfully.', 'success');
      fetchVerifications();
    } catch (error) {
      showToast('Error deleting verification: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredVerifications = filter === 'all' 
    ? verifications 
    : verifications.filter(v => v.status === filter);

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold text-[#444] mb-6">Identity Verification Review</h2>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md transition ${
            filter === 'all' ? 'bg-yellow-300 font-bold' : 'bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-md transition ${
            filter === 'pending' ? 'bg-yellow-300 font-bold' : 'bg-gray-200'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-md transition ${
            filter === 'approved' ? 'bg-yellow-300 font-bold' : 'bg-gray-200'
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-md transition ${
            filter === 'rejected' ? 'bg-yellow-300 font-bold' : 'bg-gray-200'
          }`}
        >
          Rejected
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : filteredVerifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No verifications found.</div>
      ) : (
        <div className="space-y-4">
          {filteredVerifications.map((verification) => (
            <div
              key={verification.id}
              className="bg-white border border-gray-200 rounded-md p-6 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">
                    {verification.user?.name || 'Unknown User'}
                  </h3>
                  <p className="text-sm text-gray-600">{verification.user?.email}</p>
                  <p className="text-sm text-gray-500">
                    Document Type: {verification.document_type === 'id_card' ? 'ID Card' : 'Passport'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Submitted: {new Date(verification.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(
                    verification.status
                  )}`}
                >
                  {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="font-semibold mb-2">Front Document / المستند الأمامي:</p>
                  {verification.document_front_url ? (
                    <div className="border border-gray-300 rounded-md overflow-hidden">
                      <div
                        onClick={() => window.open(verification.document_front_url, '_blank', 'noopener,noreferrer')}
                        className="block cursor-pointer"
                      >
                        <img
                          src={verification.document_front_url}
                          alt="Front Document"
                          className="w-full h-auto max-h-64 object-contain bg-gray-50 hover:opacity-90 transition-opacity"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div style={{ display: 'none' }} className="p-4 text-center text-gray-500">
                          <p>Unable to load image</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(verification.document_front_url, '_blank', 'noopener,noreferrer');
                            }}
                            className="text-blue-600 hover:underline mt-2 inline-block bg-transparent border-none cursor-pointer"
                          >
                            View Document
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No document uploaded</p>
                  )}
                </div>
                <div>
                  <p className="font-semibold mb-2">Back Document / المستند الخلفي:</p>
                  {verification.document_back_url ? (
                    <div className="border border-gray-300 rounded-md overflow-hidden">
                      <div
                        onClick={() => window.open(verification.document_back_url, '_blank', 'noopener,noreferrer')}
                        className="block cursor-pointer"
                      >
                        <img
                          src={verification.document_back_url}
                          alt="Back Document"
                          className="w-full h-auto max-h-64 object-contain bg-gray-50 hover:opacity-90 transition-opacity"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div style={{ display: 'none' }} className="p-4 text-center text-gray-500">
                          <p>Unable to load image</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(verification.document_back_url, '_blank', 'noopener,noreferrer');
                            }}
                            className="text-blue-600 hover:underline mt-2 inline-block bg-transparent border-none cursor-pointer"
                          >
                            View Document
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No document uploaded</p>
                  )}
                </div>
              </div>

              {/* Manual Input Data */}
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h4 className="font-bold mb-3">Identity Information / معلومات الهوية</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Full Name / الاسم الكامل:</span>
                    <p className="text-gray-700">{verification.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Document Number / رقم المستند:</span>
                    <p className="text-gray-700">{verification.document_number || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Date of Birth / تاريخ الميلاد:</span>
                    <p className="text-gray-700">
                      {verification.date_of_birth 
                        ? new Date(verification.date_of_birth).toLocaleDateString() 
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold">Place of Birth / مكان الميلاد:</span>
                    <p className="text-gray-700">{verification.place_of_birth || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Nationality / الجنسية:</span>
                    <p className="text-gray-700">{verification.nationality || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Issue Date / تاريخ الإصدار:</span>
                    <p className="text-gray-700">
                      {verification.issue_date 
                        ? new Date(verification.issue_date).toLocaleDateString() 
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold">Expiry Date / تاريخ الانتهاء:</span>
                    <p className="text-gray-700">
                      {verification.expiry_date 
                        ? new Date(verification.expiry_date).toLocaleDateString() 
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-semibold">Address / العنوان:</span>
                    <p className="text-gray-700">{verification.address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {verification.admin_notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="font-semibold mb-1">Admin Notes:</p>
                  <p className="text-sm text-gray-700">{verification.admin_notes}</p>
                </div>
              )}

              {verification.reviewed_by && (
                <p className="text-sm text-gray-500 mb-4">
                  Reviewed by: {verification.reviewer?.name} on{' '}
                  {new Date(verification.reviewed_at).toLocaleDateString()}
                </p>
              )}

              <div className="flex gap-4 mt-4 flex-wrap">
                {verification.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(verification.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setSelectedVerification({ ...verification, action: 'reject' })}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
                    >
                      Reject
                    </button>
                  </>
                )}
                
                {verification.status === 'approved' && (
                  <button
                    onClick={() => setSelectedVerification({ ...verification, action: 'rejectAfterApproval' })}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition"
                  >
                    Revoke Approval
                  </button>
                )}

                <button
                  onClick={() => handleDelete(verification.id)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition"
                >
                  Delete Record
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {selectedVerification && selectedVerification.action && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">
              {selectedVerification.action === 'rejectAfterApproval' 
                ? 'Revoke Approval / إلغاء الموافقة' 
                : 'Reject Verification / رفض التحقق'}
            </h3>
            
            <div className="mb-4">
              <label className="block font-semibold text-sm mb-2">
                Select Rejection Reason / اختر سبب الرفض:
              </label>
              <select
                value={selectedRejectionReason}
                onChange={(e) => {
                  setSelectedRejectionReason(e.target.value);
                  if (e.target.value !== 'other') {
                    setRejectNotes('');
                  }
                }}
                className="w-full border border-gray-300 rounded-md py-2 px-3 mb-2"
              >
                <option value="">-- Select a reason / اختر سبب --</option>
                {rejectionReasons.map((reason) => (
                  <option key={reason.id} value={reason.id}>
                    {reason.en} / {reason.ar}
                  </option>
                ))}
              </select>
            </div>

            {selectedRejectionReason === 'other' && (
              <div className="mb-4">
                <label className="block font-semibold text-sm mb-2">
                  Custom Reason / سبب مخصص:
                </label>
                <textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-3 h-32"
                  placeholder="Enter rejection reason... / أدخل سبب الرفض..."
                  required
                />
              </div>
            )}

            {selectedRejectionReason && selectedRejectionReason !== 'other' && (
              <div className="mb-4">
                <label className="block font-semibold text-sm mb-2">
                  Additional Notes (Optional) / ملاحظات إضافية (اختياري):
                </label>
                <textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-3 h-24"
                  placeholder="Add any additional notes... / أضف أي ملاحظات إضافية..."
                />
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSelectedVerification(null);
                  setRejectNotes('');
                  setSelectedRejectionReason('');
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition"
              >
                Cancel / إلغاء
              </button>
              <button
                onClick={() => {
                  if (selectedVerification.action === 'rejectAfterApproval') {
                    handleRejectAfterApproval(selectedVerification.id);
                  } else {
                    handleReject(selectedVerification.id);
                  }
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
              >
                {selectedVerification.action === 'rejectAfterApproval' 
                  ? 'Confirm Revoke / تأكيد الإلغاء' 
                  : 'Confirm Reject / تأكيد الرفض'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IdentityVerificationReview;

