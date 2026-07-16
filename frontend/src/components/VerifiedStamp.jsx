import React from 'react';
import { normalizeVerificationStatus } from './AdminVerificationBadge';

function VerifiedStamp({ verificationStatus, className = '' }) {
  const status = normalizeVerificationStatus(verificationStatus);

  if (status !== 'verified') {
    return null;
  }

  return (
    <div
      className={`verified-stamp${className ? ` ${className}` : ' verified-stamp--inline'}`}
      aria-hidden="true"
    >
      <span className="check">✓</span>
      VERIFIED
    </div>
  );
}

export default VerifiedStamp;
