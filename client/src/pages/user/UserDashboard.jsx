import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarCheck, Clock, CheckCircle, XCircle,
  Plus, Bell, User, LayoutDashboard
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import BookingCard from '../../components/common/BookingCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { getUserBookings, cancelBooking } from '../../api/bookings';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const sidebarLinks = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Bookings', href: '/dashboard/bookings', icon: CalendarCheck },
  { label: 'Book Service', href: '/dashboard/book', icon: Plus },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
];

const UserDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data } = await getUserBookings();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('booking:statusUpdate', ({ bookingId, status, message }) => {
      toast(message, {
        icon: status === 'accepted' ? '✅' : status === 'rejected' ? '❌' : '🔔',
      });
      fetchBookings();
    });
    return () => socket.off('booking:statusUpdate');
  }, [socket]);

  const stats = [
    { title: 'Total Bookings', value: bookings.length, icon: CalendarCheck, color: 'primary', index: 0 },
    { title: 'Pending', value: bookings.filter(b => b.status === 'pending').length, icon: Clock, color: 'amber', index: 1 },
    { title: 'Completed', value: bookings.filter(b => b.status === 'completed').length, icon: CheckCircle, color: 'emerald', index: 2 },
    { title: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, icon: XCircle, color: 'red', index: 3 },
  ];

  const recentBookings = bookings.slice(0, 3);

  const handleCancel = async (type, booking) => {
    if (type === 'cancel') {
      try {
        await cancelBooking(booking._id);
        toast.success('Booking cancelled');
        fetchBookings();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to cancel');
      }
    }
  };

  return (
    <DashboardLayout links={sidebarLinks} title="Dashboard">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-400 mt-1">Here's an overview of your service bookings.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => <StatCard key={s.title} {...s} />)}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/dashboard/book"
            className="glass-card p-5 flex items-center gap-4 hover:border-primary-500/30 transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-600/20 text-primary-400 flex items-center justify-center group-hover:bg-primary-600/30 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-semibold">Book New Service</p>
              <p className="text-gray-500 text-sm">Find and book a professional</p>
            </div>
          </Link>
          <Link
            to="/dashboard/bookings"
            className="glass-card p-5 flex items-center gap-4 hover:border-primary-500/30 transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center group-hover:bg-violet-600/30 transition-colors">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-semibold">View All Bookings</p>
              <p className="text-gray-500 text-sm">{bookings.length} total bookings</p>
            </div>
          </Link>
        </div>

        {/* Recent Bookings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Bookings</h3>
            <Link to="/dashboard/bookings" className="text-primary-400 text-sm hover:text-primary-300 transition-colors">
              View all
            </Link>
          </div>
          {loading ? <Loader /> : recentBookings.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No bookings yet"
              description="Book your first service to get started!"
              action={<Link to="/services" className="btn-primary">Browse Services</Link>}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {recentBookings.map(b => (
                <BookingCard
                  key={b._id}
                  booking={b}
                  onAction={handleCancel}
                  actions={
                    ['pending', 'accepted'].includes(b.status)
                      ? [{ type: 'cancel', label: 'Cancel', className: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' }]
                      : []
                  }
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default UserDashboard;
