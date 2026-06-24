import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Briefcase, CalendarCheck, BarChart3, Bell, FileText,
  TrendingUp, Clock, CheckCircle, DollarSign, ArrowUpRight, MapPin
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { getAnalytics, getRecentBookings } from '../../api/admin';

const sidebarLinks = [
  { label: 'Overview', href: '/admin/dashboard', icon: BarChart3 },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Providers', href: '/admin/providers', icon: Briefcase },
  { label: 'Applications', href: '/admin/applications', icon: FileText },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
  { label: 'Provider Map', href: '/admin/map', icon: MapPin },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
];

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnalytics(), getRecentBookings()])
      .then(([analyticsRes, bookingsRes]) => {
        setAnalytics(analyticsRes.data.analytics);
        setRecentBookings(bookingsRes.data.bookings || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout links={sidebarLinks} title="Admin Dashboard">
        <Loader />
      </DashboardLayout>
    );
  }

  const stats = analytics ? [
    { title: 'Total Users', value: analytics.totalUsers || 0, icon: Users, color: 'primary', index: 0 },
    { title: 'Total Providers', value: analytics.totalProviders || 0, icon: Briefcase, color: 'violet', index: 1 },
    { title: 'Total Bookings', value: analytics.totalBookings || 0, icon: CalendarCheck, color: 'blue', index: 2 },
    { title: 'Total Revenue', value: `₹${(analytics.totalRevenue || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'emerald', index: 3 },
    { title: 'Pending Approvals', value: analytics.pendingProviders || 0, icon: Clock, color: 'amber', index: 4 },
    { title: 'Completed Bookings', value: analytics.completedBookings || 0, icon: CheckCircle, color: 'emerald', index: 5 },
  ] : [];

  return (
    <DashboardLayout links={sidebarLinks} title="Admin Dashboard">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
          <p className="text-gray-400 mt-1">LocalSaathi Platform Analytics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map(s => <StatCard key={s.title} {...s} />)}
        </div>

        {/* Quick Actions */}
        {analytics?.pendingProviders > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-4 border-amber-500/20 bg-amber-500/5 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-white font-medium">
                  {analytics.pendingProviders} provider{analytics.pendingProviders > 1 ? 's' : ''} awaiting approval
                </p>
                <p className="text-gray-400 text-sm">Review and approve provider applications</p>
              </div>
            </div>
            <Link to="/admin/providers" className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5">
              Review <ArrowUpRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

        {/* Category Distribution */}
        {analytics?.categoryStats?.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-400" />
              Bookings by Category
            </h3>
            <div className="space-y-3.5">
              {analytics.categoryStats.map(cat => {
                const total = analytics.categoryStats.reduce((a, c) => a + c.count, 0);
                const pct = total > 0 ? Math.round((cat.count / total) * 100) : 0;
                return (
                  <div key={cat._id}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-300">{cat._id}</span>
                      <span className="text-gray-400">{cat.count} bookings ({pct}%)</span>
                    </div>
                    <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full bg-gradient-to-r from-primary-600 to-violet-600 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Bookings Table */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-primary-400" />
              Recent Bookings
            </h3>
            <Link to="/admin/bookings" className="text-primary-400 text-sm hover:text-primary-300">View all</Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No bookings yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-500 text-xs border-b border-gray-800">
                    <th className="text-left pb-3">Customer</th>
                    <th className="text-left pb-3">Service</th>
                    <th className="text-left pb-3">Provider</th>
                    <th className="text-left pb-3">Status</th>
                    <th className="text-right pb-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {recentBookings.map(b => (
                    <tr key={b._id} className="text-sm hover:bg-gray-800/20 transition-colors">
                      <td className="py-3.5 text-gray-200 font-medium">{b.userId?.name}</td>
                      <td className="py-3.5 text-gray-400">{b.serviceId?.title?.substring(0, 22)}…</td>
                      <td className="py-3.5 text-gray-400">{b.providerId?.name}</td>
                      <td className="py-3.5"><Badge label={b.status} variant={b.status} /></td>
                      <td className="py-3.5 text-right text-white font-medium">
                        ₹{(b.amount || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
