import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Wrench, DollarSign, Star, User } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import BookingCard from '../../components/common/BookingCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { getProviderBookings, updateBookingStatus } from '../../api/bookings';
import toast from 'react-hot-toast';

const sidebarLinks = [
  { label: 'Overview', href: '/provider/dashboard', icon: CalendarCheck },
  { label: 'Bookings', href: '/provider/bookings', icon: CalendarCheck },
  { label: 'My Services', href: '/provider/services', icon: Wrench },
  { label: 'Earnings', href: '/provider/earnings', icon: DollarSign },
  { label: 'Reviews', href: '/provider/reviews', icon: Star },
  { label: 'Profile', href: '/provider/profile', icon: User },
];

const STATUS_FILTERS = ['all', 'pending', 'accepted', 'in-progress', 'completed', 'rejected'];

const ProviderBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await getProviderBookings();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleAction = async (type, booking) => {
    const statusMap = { accept: 'accepted', reject: 'rejected', complete: 'completed' };
    try {
      await updateBookingStatus(booking._id, {
        status: statusMap[type],
        note: `${statusMap[type]} by provider`,
      });
      toast.success(`Booking ${statusMap[type]}!`);
      fetchBookings();
    } catch (err) {
      toast.error('Action failed. Please try again.');
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const getActions = (booking) => {
    if (booking.status === 'pending') {
      return [
        { type: 'accept', label: 'Accept', className: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20' },
        { type: 'reject', label: 'Reject', className: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' },
      ];
    }
    if (booking.status === 'accepted') {
      return [
        { type: 'complete', label: '✓ Mark Complete', className: 'bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 border border-primary-500/20' },
      ];
    }
    return [];
  };

  return (
    <DashboardLayout links={sidebarLinks} title="Booking Requests">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Booking Requests</h2>
          <span className="badge bg-primary-500/10 text-primary-400 border border-primary-500/20 text-sm px-3 py-1">
            {bookings.filter(b => b.status === 'pending').length} pending
          </span>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${
                filter === s
                  ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white shadow-glow'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {s} {s !== 'all' && `(${bookings.filter(b => b.status === s).length})`}
            </button>
          ))}
        </div>

        {loading ? <Loader /> : filtered.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No bookings found"
            description={filter === 'all' ? 'No bookings yet. Share your profile to get started!' : `No ${filter} bookings.`}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(b => (
              <BookingCard
                key={b._id}
                booking={b}
                onAction={handleAction}
                actions={getActions(b)}
              />
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default ProviderBookings;
