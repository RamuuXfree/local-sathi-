import API from './axios';

export const getAnalytics = () => API.get('/admin/analytics');
export const getRecentBookings = () => API.get('/admin/bookings/recent');
export const getTopProviders = () => API.get('/admin/providers/top');
export const getAllUsers = (params) => API.get('/admin/users', { params });
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
