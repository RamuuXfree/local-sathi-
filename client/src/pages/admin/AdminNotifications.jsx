import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, BarChart3, Users, Briefcase, CalendarCheck, FileText, CheckCheck } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { getNotifications, markAllAsRead, markAsRead } from '../../api/notifications';
import toast from 'react-hot-toast';

const sidebarLinks = [
  { label: 'Overview', href: '/admin/dashboard', icon: BarChart3 },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Providers', href: '/admin/providers', icon: Briefcase },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
  { label: 'Reports', href: '/admin/reports', icon: FileText },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
];

const TYPE_EMOJI = {
  booking_created: '📝',
  booking_accepted: '✅',
  booking_rejected: '❌',
  booking_completed: '⭐',
  booking_cancelled: '🚫',
  provider_approved: '🎉',
  general: '🔔',
};

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data } = await getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout links={sidebarLinks} title="Notifications">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">System Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-primary-400 text-sm mt-0.5">{unreadCount} unread notifications</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors px-3 py-2 rounded-lg hover:bg-primary-500/10"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>

        {loading ? <Loader /> : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="System notifications and alerts will appear here."
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((notif, i) => (
              <motion.div
                key={notif._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => !notif.isRead && handleMarkRead(notif._id)}
                className={`glass-card p-4 flex items-start gap-4 cursor-pointer transition-all duration-200 ${
                  !notif.isRead
                    ? 'border-primary-500/30 bg-primary-500/5 hover:border-primary-500/50'
                    : 'hover:border-gray-700'
                }`}
              >
                <div className="text-2xl flex-shrink-0">
                  {TYPE_EMOJI[notif.type] || '🔔'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${!notif.isRead ? 'text-white' : 'text-gray-300'}`}>
                    {notif.title}
                  </p>
                  <p className="text-gray-400 text-sm mt-0.5 leading-relaxed">{notif.message}</p>
                  <p className="text-gray-600 text-xs mt-1.5">
                    {new Date(notif.createdAt).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default AdminNotifications;
