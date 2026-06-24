import API from './axios';

export const createReview = (data) => API.post('/reviews', data);
export const getProviderReviews = (providerId) => API.get(`/reviews/provider/${providerId}`);
export const getMyReviews = () => API.get('/reviews/my-reviews');
