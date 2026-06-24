import API from './axios';

export const getAllProviders = (params) => API.get('/providers', { params });
export const getProviderById = (id) => API.get(`/providers/${id}`);
export const getProviderProfile = () => API.get('/providers/profile');
export const updateProviderProfile = (data) => API.put('/providers/profile', data);
export const toggleOnlineStatus = (data) => API.put('/providers/me/online', data);
export const updateProviderLocation = (data) => API.put('/providers/me/location', data);
export const getProvidersForMap = () => API.get('/providers/map');
export const getAllProvidersAdmin = (params) => API.get('/providers/admin/all', { params });
export const approveProvider = (id, data) => API.put(`/providers/${id}/approve`, data);
export const suspendProvider = (id, data) => API.put(`/providers/${id}/suspend`, data);
