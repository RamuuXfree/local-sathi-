import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, CalendarCheck, Plus, User } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { getNotifications, markAsRead, markAllAsRead } from '../../api/notifications';
import toast from 'react-hot-toast';

const sidebarLinks = [
  { label: 'Overview', href: '/dashboard', icon: CalendarCheck },
  { label: 'My Bookings', href: '/dashboard/bookings', icon: CalendarCheck },
  { label: 'Book Service', href: '/dashboard/book', icon: Plus },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
];

const TYPE_ICONS = {
  booking_created: '📝',
  booking_accepted: '✅',
  booking_rejected: '❌',
  booking_completed: '⭐',
  booking_cancelled: '🚧',
  general: '🔔',
};

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data } = await getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    try { await markAsRead(id); fetchNotifications(); } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try { await markAllAsRead(); toast.success('All notifications marked as read'); fetchNotifications(); } catch (err) {}
  };

  return (
    <DashboardLayout links={sidebarLinks} title="Notifications">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Notifications</h2>
            {unreadCount > 0 && <p className="text-gray-400 text-sm">{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>

        {loading ? <Loader /> : notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="You'll see booking updates and alerts here." />
        ) : (
          <div className="space-y-3">
            {notifications.map((notif, i) => (
              <motion.div
                key={notif._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => !notif.isRead && handleMarkRead(notif._id)}
                className={`glass-card p-4 flex items-start gap-4 cursor-pointer transition-all ${
                  !notif.isRead ? 'border-primary-500/30 bg-primary-500/5' : 'hover:border-gray-700'
                }`}
              >
                <div className="text-2xl">{TYPE_ICONS[notif.type] || '🔔'}</div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${!notif.isRead ? 'text-white' : 'text-gray-300'}`}>{notif.title}</p>
                  <p className="text-gray-400 text-sm mt-0.5 leading-relaxed">{notif.message}</p>
                  <p className="text-gray-600 text-xs mt-1">{new Date(notif.createdAt).toLocaleString('en-IN')}</p>
                </div>
                {!notif.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1" />}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};
export default UserNotifications;
