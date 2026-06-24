import API from './axios';
export const updateProfile = (data) => API.put('/users/profile', data);
export const getProfile = () => API.get('/users/profile');
