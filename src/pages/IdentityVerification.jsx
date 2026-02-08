import React, { useState, useEffect } from 'react';
import AxiosClient from '../AxiosClient';
import { useUserContext } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import SingleFileUpload from '../components/SingleFileUpload';

function IdentityVerification() {
  const { user, refreshUser } = useUserContext();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState(null);
  const [identityStatus, setIdentityStatus] = useState(null);
  const [frontUploading, setFrontUploading] = useState(false);
  const [backUploading, setBackUploading] = useState(false);
  const [formData, setFormData] = useState({
    document_type: 'id_card',
    document_front_url: null,
    document_back_url: null,
    full_name: '',
    document_number: '',
    date_of_birth: '',
    place_of_birth: '',
    nationality: '',
    issue_date: '',
    expiry_date: '',
    address: '',
  });
  const [errors, setErrors] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Fetch current verification status
    AxiosClient.get('/identity-verification')
      .then(async (response) => {
        const status = response.data.identity_status || user?.identity_status || 'none';
        setVerification(response.data.verification);
        setIdentityStatus(status);
        if (status === 'approved') {
          await refreshUser();
        }
      })
      .catch((error) => {
        console.error('Error fetching verification:', error);
        // If API fails, use user's identity_status or default to 'none'
        setIdentityStatus(user?.identity_status || 'none');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate, user]);

  const handleFileURLChange = (field, url) => {
    setFormData((prev) => ({
      ...prev,
      [field]: url,
    }));
    setErrors(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (frontUploading || backUploading) {
      setErrors('Please wait for documents to finish uploading.');
      return;
    }
    setLoading(true);
    setErrors(null);
    setSuccess(false);

    // Validate required fields
    if (!formData.document_front_url) {
      setErrors('Please upload the front document first.');
      setLoading(false);
      return;
    }

    // Prepare JSON payload (same pattern as Add Post)
    const submitData = {
      document_type: formData.document_type,
      document_front_url: formData.document_front_url,
      full_name: formData.full_name,
      document_number: formData.document_number,
      date_of_birth: formData.date_of_birth,
    };

    // Only include optional fields if they have values
    if (formData.document_back_url) {
      submitData.document_back_url = formData.document_back_url;
    }
    if (formData.place_of_birth) {
      submitData.place_of_birth = formData.place_of_birth;
    }
    if (formData.nationality) {
      submitData.nationality = formData.nationality;
    }
    if (formData.issue_date) {
      submitData.issue_date = formData.issue_date;
    }
    if (formData.expiry_date) {
      submitData.expiry_date = formData.expiry_date;
    }
    if (formData.address) {
      submitData.address = formData.address;
    }

    try {
      await AxiosClient.post('/identity-verification', submitData);
      setSuccess(true);
      await refreshUser();
      // Fetch updated verification
      const response = await AxiosClient.get('/identity-verification');
      setVerification(response.data.verification);
    } catch (error) {
      setErrors(
        error.response?.data?.message ||
          error.response?.data?.errors ||
          'Failed to submit verification. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    const status = identityStatus || user?.identity_status;
    if (!status) return null;

    switch (status) {
      case 'none':
        return {
          title: 'Identity Verification Required',
          message: 'To create posts, you must verify your identity by submitting a valid ID card or passport.',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
        };
      case 'pending':
        return {
          title: 'Verification Under Review',
          message:
            verification?.admin_notes
              ? `Your verification is being reviewed. ${verification.admin_notes}`
              : 'Your identity documents have been submitted and are under review by our admin team. You will be notified once the review is complete.',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        };
      case 'approved':
        return {
          title: 'Verification Approved',
          message: 'Your identity has been verified. You can now create posts.',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        };
      case 'rejected':
        return {
          title: 'Verification Rejected',
          message: verification?.admin_notes
            ? `Your verification was rejected: ${verification.admin_notes}. Please resubmit with correct documents.`
            : 'Your verification was rejected. Please resubmit with correct documents.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="px-5 mx-auto max-w-[1366px] py-8">
      <h2 className="font-bold text-3xl mb-6">Identity Verification</h2>

      {statusInfo && (
        <div className={`${statusInfo.bgColor} border-l-4 ${statusInfo.color.replace('text-', 'border-')} p-4 mb-6 rounded-md`}>
          <h3 className={`font-bold text-lg ${statusInfo.color} mb-2`}>{statusInfo.title}</h3>
          <p className="text-gray-700">{statusInfo.message}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-600 p-4 mb-6 rounded-md">
          <p className="text-green-700 font-semibold">
            Verification submitted successfully! Your documents are under review.
          </p>
        </div>
      )}

      {errors && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded-md">
          <p className="text-red-700">
            {typeof errors === 'string' ? errors : Object.values(errors).flat().join(', ')}
          </p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-300 mx-auto"></div>
        </div>
      ) : (identityStatus === 'none' || identityStatus === 'rejected' || (!identityStatus && !user?.identity_status)) && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-md shadow-md">
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
            <h4 className="font-bold text-lg mb-2">📋 Instructions / التعليمات</h4>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li>Select your document type (ID Card or Passport)</li>
              <li>Upload a clear photo or PDF of the front of your document</li>
              <li>Optionally upload the back of your document (recommended for ID cards)</li>
              <li>Make sure the document is clear and all information is visible</li>
              <li>Maximum file size: 5MB per file</li>
              <li>Accepted formats: JPG, PNG, PDF</li>
            </ul>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 mt-3" dir="rtl">
              <li>اختر نوع المستند (بطاقة هوية أو جواز سفر)</li>
              <li>ارفع صورة واضحة أو ملف PDF للوجه الأمامي للمستند</li>
              <li>يمكنك اختيارياً رفع الوجه الخلفي (موصى به لبطاقات الهوية)</li>
              <li>تأكد من وضوح المستند ووضوح جميع المعلومات</li>
              <li>الحد الأقصى لحجم الملف: 5 ميجابايت لكل ملف</li>
              <li>الصيغ المقبولة: JPG, PNG, PDF</li>
            </ul>
          </div>

          <div className="mb-6">
            <label htmlFor="document_type" className="block font-semibold text-sm mb-2">
              Document Type / نوع المستند
            </label>
            <select
              id="document_type"
              value={formData.document_type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, document_type: e.target.value }))
              }
              className="border border-gray-300 outline-none py-3 px-4 rounded-md w-full"
              required
            >
              <option value="id_card">ID Card</option>
              <option value="passport">Passport</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block font-semibold text-sm mb-2">
              Document Front (Required) / الوجه الأمامي (مطلوب) <span className="text-red-500">*</span>
            </label>
            <SingleFileUpload
              setFileURL={(url) => handleFileURLChange('document_front_url', url)}
              onUploadingChange={setFrontUploading}
              accept="image/*,.pdf"
              label="Choose Front Document"
              folder="/identity_verifications"
            />
            {formData.document_front_url && (
              <p className="text-sm text-green-600 mt-2">✓ Front document uploaded successfully</p>
            )}
            {frontUploading && (
              <p className="text-sm text-blue-600 mt-2">Uploading front document...</p>
            )}
            <p className="text-sm text-gray-500 mt-1">Accepted formats: JPG, PNG, PDF (Max 5MB)</p>
          </div>

          <div className="mb-6">
            <label className="block font-semibold text-sm mb-2">
              Document Back (Optional) / الوجه الخلفي (اختياري)
            </label>
            <SingleFileUpload
              setFileURL={(url) => handleFileURLChange('document_back_url', url)}
              onUploadingChange={setBackUploading}
              accept="image/*,.pdf"
              label="Choose Back Document"
              folder="/identity_verifications"
            />
            {formData.document_back_url && (
              <p className="text-sm text-green-600 mt-2">✓ Back document uploaded successfully</p>
            )}
            {backUploading && (
              <p className="text-sm text-blue-600 mt-2">Uploading back document...</p>
            )}
            <p className="text-sm text-gray-500 mt-1">Accepted formats: JPG, PNG, PDF (Max 5MB)</p>
          </div>

          {/* Manual Input Fields */}
          <div className="mb-6 border-t pt-6">
            <h3 className="font-bold text-lg mb-4">Identity Information / معلومات الهوية</h3>
            
            <div className="mb-4">
              <label htmlFor="full_name" className="block font-semibold text-sm mb-2">
                Full Name / الاسم الكامل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="border border-gray-300 outline-none py-3 px-4 rounded-md w-full"
                required
                placeholder="Enter your full name as shown on document"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="document_number" className="block font-semibold text-sm mb-2">
                Document Number / رقم المستند <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="document_number"
                name="document_number"
                value={formData.document_number}
                onChange={handleInputChange}
                className="border border-gray-300 outline-none py-3 px-4 rounded-md w-full"
                required
                placeholder="Enter document number"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="date_of_birth" className="block font-semibold text-sm mb-2">
                Date of Birth / تاريخ الميلاد <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className="border border-gray-300 outline-none py-3 px-4 rounded-md w-full"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="place_of_birth" className="block font-semibold text-sm mb-2">
                Place of Birth / مكان الميلاد
              </label>
              <input
                type="text"
                id="place_of_birth"
                name="place_of_birth"
                value={formData.place_of_birth}
                onChange={handleInputChange}
                className="border border-gray-300 outline-none py-3 px-4 rounded-md w-full"
                placeholder="Enter place of birth"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="nationality" className="block font-semibold text-sm mb-2">
                Nationality / الجنسية
              </label>
              <input
                type="text"
                id="nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                className="border border-gray-300 outline-none py-3 px-4 rounded-md w-full"
                placeholder="Enter nationality"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="issue_date" className="block font-semibold text-sm mb-2">
                  Issue Date / تاريخ الإصدار
                </label>
                <input
                  type="date"
                  id="issue_date"
                  name="issue_date"
                  value={formData.issue_date}
                  onChange={handleInputChange}
                  className="border border-gray-300 outline-none py-3 px-4 rounded-md w-full"
                />
              </div>

              <div>
                <label htmlFor="expiry_date" className="block font-semibold text-sm mb-2">
                  Expiry Date / تاريخ الانتهاء
                </label>
                <input
                  type="date"
                  id="expiry_date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleInputChange}
                  className="border border-gray-300 outline-none py-3 px-4 rounded-md w-full"
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="address" className="block font-semibold text-sm mb-2">
                Address / العنوان
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                className="border border-gray-300 outline-none py-3 px-4 rounded-md w-full"
                placeholder="Enter your address"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              frontUploading ||
              backUploading ||
              !formData.document_front_url ||
              !formData.full_name ||
              !formData.document_number ||
              !formData.date_of_birth
            }
            className="bg-yellow-300 hover:bg-yellow-400 text-[#444] font-semibold py-3 px-6 rounded-md transition duration-300 ease disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {frontUploading || backUploading
              ? 'Uploading documents...'
              : loading
                ? 'Submitting...'
                : 'Submit Verification / إرسال التحقق'}
          </button>
        </form>
      )}

      {verification && (identityStatus === 'pending' || user?.identity_status === 'pending') && (
        <div className="bg-white p-6 rounded-md shadow-md">
          <h3 className="font-bold text-lg mb-4">{t('identityVerification.submittedDocuments') || 'Submitted Documents'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold mb-2">{t('identityVerification.frontDocument') || 'Front Document:'}</p>
              {verification.document_front_url ? (
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => window.open(verification.document_front_url, '_blank', 'noopener,noreferrer')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        window.open(verification.document_front_url, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="block cursor-pointer"
                  >
                    <img
                      src={verification.document_front_url}
                      alt="Front Document"
                      className="w-full h-auto max-h-64 object-contain bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'block';
                        }
                      }}
                    />
                    <div style={{ display: 'none' }} className="p-4 text-center text-gray-500">
                      <p>{t('identityVerification.unableToLoad') || 'Unable to load image'}</p>
                      <a
                        href={verification.document_front_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline mt-2 inline-block"
                      >
                        {t('identityVerification.viewDocument') || 'View Document'}
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">{t('identityVerification.noDocument') || 'No document uploaded'}</p>
              )}
            </div>
            {verification.document_back_url && (
              <div>
                <p className="font-semibold mb-2">{t('identityVerification.backDocument') || 'Back Document:'}</p>
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => window.open(verification.document_back_url, '_blank', 'noopener,noreferrer')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        window.open(verification.document_back_url, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="block cursor-pointer"
                  >
                    <img
                      src={verification.document_back_url}
                      alt="Back Document"
                      className="w-full h-auto max-h-64 object-contain bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'block';
                        }
                      }}
                    />
                    <div style={{ display: 'none' }} className="p-4 text-center text-gray-500">
                      <p>{t('identityVerification.unableToLoad') || 'Unable to load image'}</p>
                      <a
                        href={verification.document_back_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline mt-2 inline-block"
                      >
                        {t('identityVerification.viewDocument') || 'View Document'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {(identityStatus === 'approved' || user?.identity_status === 'approved') && (
        <div className="bg-white p-6 rounded-md shadow-md">
          <button
            onClick={() => navigate('/post/add')}
            className="bg-yellow-300 hover:bg-yellow-400 text-[#444] font-semibold py-3 px-6 rounded-md transition duration-300 ease"
          >
            Create Post
          </button>
        </div>
      )}
    </div>
  );
}

export default IdentityVerification;

