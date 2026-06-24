import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, CalendarCheck, BarChart3, Bell, FileText } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { getAdminBookings } from '../../api/bookings';

const sidebarLinks = [
  { label: 'Overview', href: '/admin/dashboard', icon: BarChart3 },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Providers', href: '/admin/providers', icon: Briefcase },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
  { label: 'Reports', href: '/admin/reports', icon: FileText },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
];

const STATUS_FILTERS = ['all', 'pending', 'accepted', 'in-progress', 'completed', 'cancelled', 'rejected'];

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    const params = filter !== 'all' ? { status: filter } : {};
    getAdminBookings(params)
      .then(({ data }) => setBookings(data.bookings || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <DashboardLayout links={sidebarLinks} title="Manage Bookings">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">All Bookings</h2>
          <p className="text-gray-400 text-sm mt-0.5">Monitor and manage all platform bookings</p>
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
              {s}
            </button>
          ))}
        </div>

        {loading ? <Loader /> : bookings.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No bookings found"
            description={`No ${filter === 'all' ? '' : filter + ' '}bookings on the platform yet.`}
          />
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-500 text-xs border-b border-gray-800 bg-gray-900/60">
                    <th className="text-left px-5 py-4">Customer</th>
                    <th className="text-left px-5 py-4">Service</th>
                    <th className="text-left px-5 py-4">Provider</th>
                    <th className="text-left px-5 py-4">Date</th>
                    <th className="text-left px-5 py-4">Status</th>
                    <th className="text-right px-5 py-4">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {bookings.map((b, i) => (
                    <motion.tr
                      key={b._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="text-sm hover:bg-gray-800/20 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-600 to-violet-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {b.userId?.name?.charAt(0)}
                          </div>
                          <span className="text-gray-200 font-medium">{b.userId?.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-400">
                        {b.serviceId?.title?.substring(0, 22)}{b.serviceId?.title?.length > 22 ? '…' : ''}
                      </td>
                      <td className="px-5 py-4 text-gray-400">{b.providerId?.name}</td>
                      <td className="px-5 py-4 text-gray-500 text-xs">
                        {new Date(b.bookingDate).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <Badge label={b.status} variant={b.status} />
                      </td>
                      <td className="px-5 py-4 text-right text-white font-semibold">
                        ₹{(b.amount || 0).toLocaleString('en-IN')}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default ManageBookings;
