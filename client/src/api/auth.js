import API from './axios';

export const registerUser = (data) => API.post('/auth/register', data);
export const registerProvider = (data) => API.post('/auth/provider/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
