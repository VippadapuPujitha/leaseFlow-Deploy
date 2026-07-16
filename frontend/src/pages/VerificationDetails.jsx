import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AdminVerificationBadge from '../components/AdminVerificationBadge';
import AdminSidebar from '../components/AdminSidebar';
import VerifiedStamp from '../components/VerifiedStamp';
import {
  getAdminPropertyById,
  notifyAdminDataChanged,
  rejectProperty,
  verifyProperty,
} from '../services/adminService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const normalizeStatus = (status) => {
  const value = String(status || 'pending').toLowerCase();
  if (value === 'approved') return 'verified';
  if (value === 'not_requested') return 'pending';
  return value;
};

const getFileName = (value) => {
  const rawValue = String(value || '');
  const normalizedValue = rawValue.replace(/\\/g, '/');

  return normalizedValue.split('/').filter(Boolean).pop() || '';
};

const resolvePublicUploadUrl = (value, fileType) => {
  if (!value) {
    return '';
  }

  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) {
    return value;
  }

  const fileName = getFileName(value);

  if (!fileName) {
    return '';
  }

  if (fileType === 'image') {
    return `${API_BASE_URL}/uploads/images/${fileName}`;
  }

  return `${API_BASE_URL}/uploads/documents/${fileName}`;
};

const isImageUrl = (url) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url || '');

function VerificationDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectConfirmation, setShowRejectConfirmation] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [previewImageLabel, setPreviewImageLabel] = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getAdminPropertyById(id);
        setProperty(response.data.property || null);
        setRejectionReason(response.data.property?.rejectionReason || '');
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Unable to load verification details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const ownerName = useMemo(
    () => property?.ownerId?.name || property?.ownerDetails?.name || 'Owner unavailable',
    [property]
  );

  const handleApprove = async () => {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await verifyProperty(id);
      setProperty(response.data.property || property);
      setRejectionReason('');
      setShowRejectConfirmation(false);
      setMessage('Property verified successfully.');
      notifyAdminDataChanged();
    } catch (approveError) {
      setError(approveError.response?.data?.message || 'Unable to approve property.');
    } finally {
      setSaving(false);
    }
  };

  const handleRejectClick = () => {
    setError('');
    setMessage('');
    setShowRejectConfirmation(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please add a rejection reason before rejecting the property.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await rejectProperty(id, rejectionReason.trim());
      setProperty(response.data.property || property);
      setShowRejectConfirmation(false);
      setMessage('Property rejected successfully.');
      notifyAdminDataChanged();
    } catch (rejectError) {
      setError(rejectError.response?.data?.message || 'Unable to reject property.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="alert alert-info">Loading verification details...</div>;
  }

  if (error && !property) {
    return (
      <div className="admin-shell">
        <div className="alert alert-danger">{error}</div>
        <Link to="/admin/verification-requests" className="btn btn-secondary-soft">
          Back to queue
        </Link>
      </div>
    );
  }

  if (!property) {
    return <div className="alert alert-warning">Property not found.</div>;
  }

  const imageUrls = (property.imageUrls?.length ? property.imageUrls : property.images || [])
    .map((image) => resolvePublicUploadUrl(image, 'image'))
    .filter(Boolean);
  const taxDocumentUrl = resolvePublicUploadUrl(
    property.taxDocumentUrl || property.taxDocument || property.taxReceipt
  , 'document');
  const ownershipDocumentUrl = resolvePublicUploadUrl(
    property.ownershipDocumentUrl || property.ownershipDocument || property.electricityBill
  , 'document');
  const ownerIdDocumentUrl = resolvePublicUploadUrl(
    property.aadhaarPan || property.ownerId?.aadhaarPan || property.ownerDetails?.aadhaarPan,
    'document'
  );
  const status = normalizeStatus(property.verificationStatus);
  const statusLabel = status === 'verified' ? 'Verified' : status === 'rejected' ? 'Rejected' : 'Pending';

  const openImagePreview = (url, label) => {
    setPreviewImageUrl(url);
    setPreviewImageLabel(label);
  };

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-main">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <p className="admin-eyebrow mb-2">Admin Module</p>
          <h1 className="page-title mb-2">Verification Details</h1>
          <p className="page-subtitle mb-0">Inspect full property details before approving or rejecting.</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/admin/verification-requests" className="btn btn-secondary-soft">
            Back to queue
          </Link>
          <Link to="/admin/all-properties" className="btn btn-outline-primary">
            All properties
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card card-glass p-4 h-100">
            <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-3">
              <div>
                <h2 className="h4 mb-2">{property.title}</h2>
                <AdminVerificationBadge verificationStatus={property.verificationStatus} />
                {status === 'verified' && <div className="text-success small mt-3">Verified status</div>}
                {status === 'rejected' && (
                  <div className="text-danger small mt-2">
                    {property.rejectionReason || 'No rejection reason provided.'}
                  </div>
                )}
              </div>
              <div className="text-md-end">
                <p className="mb-1"><strong>Owner:</strong> {ownerName}</p>
                <p className="mb-1"><strong>Email:</strong> {property.ownerId?.email || property.ownerDetails?.email || 'N/A'}</p>
                <p className="mb-0"><strong>Phone:</strong> {property.ownerId?.phone || property.ownerDetails?.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="details-grid mb-4">
              <div className="details-card">
                <strong>Address</strong>
                <p>{property.address || 'N/A'}</p>
              </div>
              <div className="details-card">
                <strong>Property Type</strong>
                <p>{property.propertyType || 'N/A'}</p>
              </div>
              <div className="details-card">
                <strong>Rent</strong>
                <p>{property.rent ? `Rs. ${property.rent}` : 'N/A'}</p>
              </div>
              <div className="details-card">
                <strong>Rental Status</strong>
                <p>{property.rentalStatus || 'Available'}</p>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="h5 mb-3">Description</h3>
              <p className="text-muted mb-0">{property.description || 'No description available.'}</p>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="h5 mb-0">Property Images</h3>
                <span className="text-muted">{imageUrls.length} image(s)</span>
              </div>
              <div className="verification-image-grid">
                {imageUrls.length ? (
                  imageUrls.map((url, index) => (
                    <div key={url} className="verification-image-card">
                      <a href={url} target="_blank" rel="noreferrer" className="d-block position-relative">
                        <img src={url} alt={property.title} className="img-fluid" />
                        {index === 0 && (
                          <VerifiedStamp verificationStatus={property.verificationStatus} className="verified-stamp--overlay" />
                        )}
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="text-muted">No property images uploaded.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card card-glass p-4 mb-4">
            <h3 className="h5 mb-3">Uploaded Documents</h3>
            <div className="mb-3">
              <strong className="d-block mb-2">Tax Document</strong>
              {taxDocumentUrl ? (
                <div className="mb-2">
                  <a href={taxDocumentUrl} target="_blank" rel="noreferrer" className="d-block">
                    {isImageUrl(taxDocumentUrl) ? (
                      <img src={taxDocumentUrl} alt="Tax document" className="img-fluid rounded-4" />
                    ) : (
                      <iframe src={taxDocumentUrl} title="Tax document" className="verification-document-frame" />
                    )}
                  </a>
                </div>
              ) : (
                <p className="text-muted mb-2">No tax document uploaded.</p>
              )}
            </div>

            <div>
              <strong className="d-block mb-2">Ownership Document</strong>
              {ownershipDocumentUrl ? (
                <div className="mb-2">
                  <a href={ownershipDocumentUrl} target="_blank" rel="noreferrer" className="d-block">
                    {isImageUrl(ownershipDocumentUrl) ? (
                      <img src={ownershipDocumentUrl} alt="Ownership document" className="img-fluid rounded-4" />
                    ) : (
                      <iframe src={ownershipDocumentUrl} title="Ownership document" className="verification-document-frame" />
                    )}
                  </a>
                </div>
              ) : (
                <p className="text-muted mb-2">No ownership document uploaded.</p>
              )}
            </div>
            <div className="mt-4">
              <strong className="d-block mb-2">Owner ID</strong>
              {ownerIdDocumentUrl ? (
                <div className="mb-2">
                  <a href={ownerIdDocumentUrl} target="_blank" rel="noreferrer" className="d-block">
                    {isImageUrl(ownerIdDocumentUrl) ? (
                      <img src={ownerIdDocumentUrl} alt="Owner ID document" className="img-fluid rounded-4" />
                    ) : (
                      <iframe src={ownerIdDocumentUrl} title="Owner ID document" className="verification-document-frame" />
                    )}
                  </a>
                </div>
              ) : (
                <p className="text-muted mb-2">No owner ID uploaded.</p>
              )}
            </div>
          </div>

          <div className="card card-glass p-4">
            <h3 className="h5 mb-3">Admin Actions</h3>
            <div className="d-grid gap-2">
              <button type="button" className="btn btn-gradient" onClick={handleApprove} disabled={saving}>
                Approve
              </button>
              <button type="button" className="btn btn-outline-danger" onClick={handleRejectClick} disabled={saving}>
                Reject
              </button>
            </div>
            {showRejectConfirmation && (
              <div className="mt-3">
                <div className="mb-3">
                  <label className="form-label" htmlFor="rejectionReason">
                    Rejection Reason
                  </label>
                  <textarea
                    id="rejectionReason"
                    className="form-control"
                    rows="4"
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    placeholder="Explain why this property should be rejected"
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-outline-danger w-100"
                  onClick={handleConfirmReject}
                  disabled={saving}
                >
                  Confirm Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {previewImageUrl && (
        <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true" onClick={() => setPreviewImageUrl('')}>
          <div className="modal-dialog modal-lg modal-dialog-centered" role="document" onClick={(event) => event.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{previewImageLabel || 'Image preview'}</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setPreviewImageUrl('')} />
              </div>
              <div className="modal-body text-center">
                <img src={previewImageUrl} alt={previewImageLabel || 'Property preview'} className="img-fluid verification-preview-img rounded-4" />
              </div>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}

export default VerificationDetails;
