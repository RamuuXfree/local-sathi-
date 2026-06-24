import API from './axios';

export const createBooking = (data) => API.post('/bookings', data);
export const acceptBooking = (id) => API.put(`/bookings/${id}/accept`);
export const rejectBookingRequest = (id) => API.put(`/bookings/${id}/reject-request`);
export const getIncomingJobs = () => API.get('/bookings/incoming');
export const getUserBookings = () => API.get('/bookings/user');
export const getProviderBookings = (params) => API.get('/bookings/provider', { params });
export const getAdminBookings = (params) => API.get('/bookings/admin', { params });
export const updateBookingStatus = (id, data) => API.put(`/bookings/${id}/status`, data);
export const cancelBooking = (id) => API.put(`/bookings/${id}/cancel`);
export const adminAssignProvider = (id, data) => API.put(`/bookings/${id}/assign`, data);
export const getBookingById = (id) => API.get(`/bookings/${id}`);
