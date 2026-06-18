import api from '../api/axiosConfig';

export const getAdminProperties = () => api.get('/api/admin/properties');

export const getVerificationQueue = () => api.get('/api/admin/verification-queue');

export const getAdminPropertyById = (id) => api.get(`/api/admin/property/${id}`);

export const verifyProperty = (id) => api.put(`/api/admin/verify/${id}`);

export const rejectProperty = (id, rejectionReason) =>
  api.put(`/api/admin/reject/${id}`, { rejectionReason });

export const deleteProperty = (id) => api.delete(`/api/admin/property/${id}`);
