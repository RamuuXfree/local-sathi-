import API from './axios';

export const getAllApplications = (params) => API.get('/applications', { params });
export const getApplicationById = (id) => API.get(`/applications/${id}`);
export const updateApplicationStatus = (id, data) => API.put(`/applications/${id}/status`, data);
export const addAdminNote = (id, data) => API.put(`/applications/${id}/note`, data);
export const getApplicationStats = () => API.get('/applications/stats');
