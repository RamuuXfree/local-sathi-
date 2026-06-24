import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck, Clock, CheckCircle, DollarSign, Star,
  Wrench, Bell, User, TrendingUp, MapPin, Phone, Zap,
  WifiOff, Wifi, Navigation, AlertCircle, Timer
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import BookingCard from '../../components/common/BookingCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { getProviderBookings, updateBookingStatus, acceptBooking, rejectBookingRequest } from '../../api/bookings';
import { toggleOnlineStatus, updateProviderLocation } from '../../api/providers';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const sidebarLinks = [
  { label: 'Overview', href: '/provider/dashboard', icon: CalendarCheck },
  { label: 'Bookings', href: '/provider/bookings', icon: CalendarCheck },
  { label: 'My Services', href: '/provider/services', icon: Wrench },
  { label: 'Earnings', href: '/provider/earnings', icon: DollarSign },
  { label: 'Reviews', href: '/provider/reviews', icon: Star },
  { label: 'Profile', href: '/provider/profile', icon: User },
];

const CATEGORY_EMOJI = {
  Electrician: '⚡', Plumber: '🔧', Cleaner: '🧹', 'AC Repair': '❄️',
  Carpenter: '🪚', Painter: '🎨', 'Appliance Repair': '🔌', Other: '🛠️',
};

// ─── Countdown timer hook ─────────────────────────────────────────────────────
const useCountdown = (seconds) => {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => setRemaining(r => r - 1), 1000);
    return () => clearInterval(t);
  }, []);
  return remaining;
};

// ─── Incoming Job Card ────────────────────────────────────────────────────────
const IncomingJobCard = ({ job, onAccept, onReject }) => {
  const countdown = useCountdown(job.expiresIn || 90);
  const [acting, setActing] = useState(false);
  const urgency = countdown < 20 ? 'red' : countdown < 45 ? 'amber' : 'emerald';

  if (countdown <= 0) return null; // expired

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      className="glass-card border-primary-500/30 overflow-hidden"
    >
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary-500 to-violet-600" />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-violet-700 flex items-center justify-center text-2xl flex-shrink-0">
              {CATEGORY_EMOJI[job.category] || '🛠️'}
            </div>
            <div>
              <h3 className="text-white font-bold">{job.category} Service</h3>
              <p className="text-gray-400 text-sm">{job.customerName || 'Customer'} • {job.customerArea || 'Nearby'}</p>
            </div>
          </div>

          {/* Countdown */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold ${
            urgency === 'red' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
            urgency === 'amber' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
            'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            <Timer className="w-3.5 h-3.5" />
            {countdown}s
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {[
            { icon: MapPin, label: `${job.distance ? job.distance + ' km away' : 'Nearby'}`, color: 'text-blue-400' },
            { icon: CalendarCheck, label: new Date(job.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), color: 'text-primary-400' },
            { icon: Clock, label: job.bookingTime || 'Flexible', color: 'text-violet-400' },
            { icon: DollarSign, label: job.amount > 0 ? `₹${job.amount.toLocaleString('en-IN')}` : 'Negotiable', color: 'text-emerald-400' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-2 p-2.5 bg-gray-800/50 rounded-lg">
              <Icon className={`w-3.5 h-3.5 ${color} flex-shrink-0`} />
              <span className="text-gray-300 text-xs font-medium truncate">{label}</span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => { setActing(true); onReject(job.bookingId); }}
            disabled={acting}
            className="flex-1 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-semibold hover:bg-red-500/20 transition-all disabled:opacity-50"
          >
            ✕ Pass
          </button>
          <button
            onClick={() => { setActing(true); onAccept(job.bookingId); }}
            disabled={acting}
            className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {acting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Accept
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const ProviderDashboard = () => {
  const { user, updateUser } = useAuth();
  const { socket } = useSocket();
  const [bookings, setBookings] = useState([]);
  const [incomingJobs, setIncomingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(user?.isOnline || false);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const locationWatchRef = useRef(null);

  const fetchBookings = useCallback(async () => {
    try {
      const { data } = await getProviderBookings();
      setBookings(data.bookings || []);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // ── Socket: incoming job alerts ─────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // Go online and emit provider:online
    if (user?._id && isOnline) {
      socket.emit('provider:online', user._id);
    }

    socket.on('booking:nearbyJob', (jobData) => {
      setIncomingJobs(prev => {
        if (prev.find(j => j.bookingId === jobData.bookingId)) return prev;
        return [jobData, ...prev];
      });
      toast(`🔔 New ${jobData.category} job — ${jobData.distance} km away!`, {
        duration: 5000, icon: '📍',
      });
    });

    socket.on('booking:jobTaken', ({ bookingId }) => {
      setIncomingJobs(prev => prev.filter(j => j.bookingId !== bookingId));
    });

    socket.on('booking:cancelled', ({ bookingId }) => {
      setIncomingJobs(prev => prev.filter(j => j.bookingId !== bookingId));
      fetchBookings();
    });

    socket.on('booking:statusUpdate', () => fetchBookings());
    socket.on('booking:new', () => fetchBookings());

    return () => {
      socket.off('booking:nearbyJob');
      socket.off('booking:jobTaken');
      socket.off('booking:cancelled');
      socket.off('booking:statusUpdate');
      socket.off('booking:new');
    };
  }, [socket, user, isOnline, fetchBookings]);

  // ── GPS location tracking when online ──────────────────────────────────────
  useEffect(() => {
    if (isOnline && navigator.geolocation && socket && user?._id) {
      locationWatchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          socket.emit('provider:locationUpdate', { providerId: user._id, lat, lng });
          updateProviderLocation({ lat, lng }).catch(() => {});
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 30000 }
      );
    } else {
      if (locationWatchRef.current) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
        locationWatchRef.current = null;
      }
    }
    return () => {
      if (locationWatchRef.current) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
      }
    };
  }, [isOnline, socket, user]);

  // ── Toggle Online/Offline ───────────────────────────────────────────────────
  const handleToggleOnline = async () => {
    setTogglingOnline(true);
    const newStatus = !isOnline;
    try {
      await toggleOnlineStatus({ isOnline: newStatus });
      setIsOnline(newStatus);
      updateUser({ ...user, isOnline: newStatus });
      if (socket && user?._id) {
        socket.emit(newStatus ? 'provider:online' : 'provider:offline', user._id);
      }
      toast.success(newStatus ? '🟢 You\'re now online — job alerts enabled!' : '🔴 You\'re now offline');
      if (!newStatus) setIncomingJobs([]);
    } catch (_) {
      toast.error('Failed to update status');
    } finally {
      setTogglingOnline(false);
    }
  };

  // ── Accept / Reject ─────────────────────────────────────────────────────────
  const handleAccept = async (bookingId) => {
    try {
      const { data } = await acceptBooking(bookingId);
      setIncomingJobs(prev => prev.filter(j => j.bookingId !== bookingId));
      toast.success('✅ Job accepted! The customer has been notified.');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not accept — job may have been taken');
      setIncomingJobs(prev => prev.filter(j => j.bookingId !== bookingId));
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await rejectBookingRequest(bookingId);
      setIncomingJobs(prev => prev.filter(j => j.bookingId !== bookingId));
      toast('Job passed', { icon: '↩️' });
    } catch (_) {
      setIncomingJobs(prev => prev.filter(j => j.bookingId !== bookingId));
    }
  };

  const handleAction = async (type, booking) => {
    const statusMap = { complete: 'completed', 'in-progress': 'in-progress' };
    try {
      await updateBookingStatus(booking._id, { status: statusMap[type] || type, note: `Updated to ${type} by provider` });
      toast.success(`Booking updated!`);
      fetchBookings();
    } catch (_) { toast.error('Action failed'); }
  };

  const stats = [
    { title: 'Total Bookings', value: bookings.length, icon: CalendarCheck, color: 'primary', index: 0 },
    { title: 'Active Jobs', value: bookings.filter(b => ['accepted', 'in-progress'].includes(b.status)).length, icon: Clock, color: 'amber', index: 1 },
    { title: 'Completed', value: user?.completedJobs || bookings.filter(b => b.status === 'completed').length, icon: CheckCircle, color: 'emerald', index: 2 },
    { title: 'Earnings', value: `₹${(user?.totalEarnings || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'violet', index: 3 },
  ];

  const activeBookings = bookings.filter(b => ['accepted', 'in-progress'].includes(b.status)).slice(0, 3);

  return (
    <DashboardLayout links={sidebarLinks} title="Provider Dashboard">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

        {/* Header + Online Toggle */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-white">Welcome, {user?.name?.split(' ')[0]}! 👋</h2>
            <p className="text-gray-400 mt-0.5">{user?.category} Professional • {user?.city}</p>
          </div>

          {/* Online/Offline toggle */}
          <div className={`glass-card px-5 py-3 flex items-center gap-4 border ${
            isOnline ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-gray-700'
          }`}>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-emerald-400" />
              ) : (
                <WifiOff className="w-5 h-5 text-gray-500" />
              )}
              <div>
                <p className={`text-sm font-bold ${isOnline ? 'text-emerald-400' : 'text-gray-400'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </p>
                <p className="text-gray-600 text-xs">
                  {isOnline ? 'Receiving job alerts' : 'Not receiving alerts'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleOnline}
              disabled={togglingOnline || !user?.isApproved}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                isOnline ? 'bg-emerald-500' : 'bg-gray-700'
              } disabled:opacity-50`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${
                isOnline ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Approval warning */}
        {!user?.isApproved && (
          <div className="glass-card p-4 border-amber-500/20 bg-amber-500/5 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="text-amber-400 text-sm">⏳ Your account is pending admin approval. You'll receive job alerts once approved.</p>
          </div>
        )}

        {/* GPS Status when online */}
        {isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-3 border-blue-500/20 bg-blue-500/5 flex items-center gap-3"
          >
            <Navigation className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <p className="text-blue-300 text-sm">
              📡 GPS tracking active — your location is being shared for accurate job matching
            </p>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => <StatCard key={s.title} {...s} />)}
        </div>

        {/* Incoming Job Alerts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${incomingJobs.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`} />
              <h3 className="text-lg font-semibold text-white">Incoming Job Alerts</h3>
              {incomingJobs.length > 0 && (
                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-bold border border-red-500/30">
                  {incomingJobs.length} new
                </span>
              )}
            </div>
            {!isOnline && (
              <p className="text-gray-600 text-xs">Go online to receive alerts</p>
            )}
          </div>

          {incomingJobs.length === 0 ? (
            <div className={`glass-card p-8 text-center ${!isOnline ? 'opacity-50' : ''}`}>
              <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium">No incoming jobs right now</p>
              <p className="text-gray-600 text-sm mt-1">
                {isOnline ? 'Job alerts will appear here in real-time' : 'Toggle online to start receiving job alerts'}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {incomingJobs.map(job => (
                  <IncomingJobCard
                    key={job.bookingId}
                    job={job}
                    onAccept={handleAccept}
                    onReject={handleReject}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>

        {/* Active Bookings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Active Jobs</h3>
            <Link to="/provider/bookings" className="text-primary-400 text-sm hover:text-primary-300">View all</Link>
          </div>
          {loading ? <Loader /> : activeBookings.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No active jobs"
              description="Accepted bookings will appear here."
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeBookings.map(b => (
                <BookingCard
                  key={b._id}
                  booking={b}
                  onAction={handleAction}
                  actions={[
                    b.status === 'accepted' && { type: 'in-progress', label: '▶ Start Job', className: 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20' },
                    b.status === 'in-progress' && { type: 'completed', label: '✓ Complete', className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' },
                  ].filter(Boolean)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Manage Services', desc: 'Add or edit your services', href: '/provider/services', icon: Wrench, color: 'primary' },
            { label: 'View Earnings', desc: 'Track your income', href: '/provider/earnings', icon: TrendingUp, color: 'emerald' },
            { label: 'My Reviews', desc: 'See customer feedback', href: '/provider/reviews', icon: Star, color: 'amber' },
          ].map(({ label, desc, href, icon: Icon, color }) => (
            <Link
              key={href}
              to={href}
              className="glass-card p-5 flex items-center gap-4 hover:border-primary-500/30 transition-all duration-300"
            >
              <div className={`w-11 h-11 rounded-xl bg-${color}-600/20 text-${color}-400 flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{label}</p>
                <p className="text-gray-500 text-xs">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default ProviderDashboard;
