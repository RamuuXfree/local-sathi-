import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, CalendarCheck, Wrench, DollarSign, User } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import RatingStars from '../../components/common/RatingStars';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { getMyReviews } from '../../api/reviews';
import { useAuth } from '../../context/AuthContext';

const sidebarLinks = [
  { label: 'Overview', href: '/provider/dashboard', icon: CalendarCheck },
  { label: 'Bookings', href: '/provider/bookings', icon: CalendarCheck },
  { label: 'My Services', href: '/provider/services', icon: Wrench },
  { label: 'Earnings', href: '/provider/earnings', icon: DollarSign },
  { label: 'Reviews', href: '/provider/reviews', icon: Star },
  { label: 'Profile', href: '/provider/profile', icon: User },
];

const ProviderReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyReviews()
      .then(({ data }) => setReviews(data.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Distribution
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));
  const maxCount = Math.max(...distribution.map(d => d.count), 1);

  return (
    <DashboardLayout links={sidebarLinks} title="My Reviews">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Rating Summary */}
        <div className="glass-card p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-extrabold text-white mb-1">
                {user?.rating?.average?.toFixed(1) || '0.0'}
              </div>
              <RatingStars rating={user?.rating?.average || 0} size="lg" />
              <p className="text-gray-400 text-sm mt-1">{user?.rating?.count || 0} reviews</p>
            </div>

            <div className="flex-1 space-y-2 w-full">
              {distribution.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-amber-400 text-sm w-4">{star}★</span>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxCount) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
                    />
                  </div>
                  <span className="text-gray-500 text-sm w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? <Loader /> : reviews.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No reviews yet"
            description="Complete service bookings and ask satisfied customers to leave a review."
          />
        ) : (
          <div className="space-y-4">
            {reviews.map((review, i) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-violet-700 flex items-center justify-center text-sm font-bold text-white">
                    {review.userId?.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{review.userId?.name}</p>
                    <RatingStars rating={review.rating} size="sm" />
                  </div>
                  <span className="text-gray-600 text-xs">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed pl-13">{review.comment}</p>
                {review.bookingId?.serviceId?.title && (
                  <p className="text-gray-600 text-xs mt-2 pl-13">
                    Service: {review.bookingId.serviceId.title}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default ProviderReviews;
