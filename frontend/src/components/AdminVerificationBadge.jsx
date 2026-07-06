import React from 'react';

const normalizeVerificationStatus = (status) => {
  const value = String(status || 'pending').toLowerCase();
  if (value === 'approved') return 'verified';
  if (value === 'not_requested') return 'pending';
  return value;
};

function AdminVerificationBadge({ verificationStatus }) {
  const status = normalizeVerificationStatus(verificationStatus);
  const label =
    status === 'verified'
      ? 'Verified'
      : status === 'rejected'
      ? 'Rejected'
      : 'Pending';

  return (
    <span className={`status-pill status-pill--${status}`}>
      {status === 'verified' && <span className="me-1">✓</span>}
      {label}
    </span>
  );
}

export default AdminVerificationBadge;
