import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarCheck, Plus, Bell, User, Filter } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import BookingCard from '../../components/common/BookingCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { getUserBookings, cancelBooking } from '../../api/bookings';
import toast from 'react-hot-toast';

const STATUS_FILTERS = ['all', 'pending', 'accepted', 'in-progress', 'completed', 'cancelled', 'rejected'];

const sidebarLinks = [
  { label: 'Overview', href: '/dashboard', icon: CalendarCheck },
  { label: 'My Bookings', href: '/dashboard/bookings', icon: CalendarCheck },
  { label: 'Book Service', href: '/dashboard/book', icon: Plus },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
];

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await getUserBookings();
      setBookings(data.bookings || []);
    } catch (err) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (type, booking) => {
    if (type === 'cancel') {
      try {
        await cancelBooking(booking._id);
        toast.success('Booking cancelled successfully');
        fetchBookings();
      } catch (err) { toast.error(err.response?.data?.message || 'Cannot cancel'); }
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <DashboardLayout links={sidebarLinks} title="My Bookings">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">My Bookings</h2>
          <Link to="/services" className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Booking
          </Link>
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-4 py-1.5 rounded-xl text-sm font-medium capitalize transition-all ${
              filter === s ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}>{s}</button>
          ))}
        </div>

        {loading ? <Loader /> : filtered.length === 0 ? (
          <EmptyState
            title="No bookings found"
            description={filter === 'all' ? "You haven't made any bookings yet." : `No ${filter} bookings.`}
            action={<Link to="/services" className="btn-primary">Browse Services</Link>}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(b => (
              <BookingCard
                key={b._id}
                booking={b}
                onAction={handleCancel}
                actions={['pending', 'accepted'].includes(b.status) ? [{ type: 'cancel', label: 'Cancel Booking', className: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' }] : []}
              />
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};
export default UserBookings;
