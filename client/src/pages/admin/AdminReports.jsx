import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Users, Briefcase, CalendarCheck, Bell, FileText,
  TrendingUp, DollarSign, Award, Star, CheckCircle
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import Loader from '../../components/common/Loader';
import { getAnalytics, getTopProviders } from '../../api/admin';

const sidebarLinks = [
  { label: 'Overview', href: '/admin/dashboard', icon: BarChart3 },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Providers', href: '/admin/providers', icon: Briefcase },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
  { label: 'Reports', href: '/admin/reports', icon: FileText },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
];

const RANK_STYLES = [
  'bg-amber-400/20 text-amber-400',
  'bg-gray-400/20 text-gray-400',
  'bg-orange-400/20 text-orange-400',
];

const AdminReports = () => {
  const [analytics, setAnalytics] = useState(null);
  const [topProviders, setTopProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnalytics(), getTopProviders()])
      .then(([aRes, pRes]) => {
        setAnalytics(aRes.data.analytics);
        setTopProviders(pRes.data.providers || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout links={sidebarLinks} title="Reports">
        <Loader />
      </DashboardLayout>
    );
  }

  const completionRate = analytics?.totalBookings > 0
    ? Math.round((analytics.completedBookings / analytics.totalBookings) * 100)
    : 0;

  return (
    <DashboardLayout links={sidebarLinks} title="Reports">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Platform Reports</h2>
          <p className="text-gray-400 text-sm mt-0.5">Analytics and performance insights</p>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={`₹${(analytics?.totalRevenue || 0).toLocaleString('en-IN')}`} icon={DollarSign} color="emerald" index={0} />
          <StatCard title="Active Services" value={analytics?.totalServices || 0} icon={Briefcase} color="primary" index={1} />
          <StatCard title="Completion Rate" value={`${completionRate}%`} icon={TrendingUp} color="violet" index={2} />
          <StatCard title="Approved Providers" value={analytics?.approvedProviders || 0} icon={CheckCircle} color="amber" index={3} />
        </div>

        {/* Top Providers */}
        <div className="glass-card p-6">
          <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Top Performing Providers
          </h3>
          {topProviders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No provider data yet</p>
          ) : (
            <div className="space-y-3">
              {topProviders.slice(0, 8).map((provider, i) => (
                <motion.div
                  key={provider._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4 py-3 border-b border-gray-800/60 last:border-0 hover:bg-gray-800/20 rounded-xl px-2 transition-colors"
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${RANK_STYLES[i] || 'bg-gray-800 text-gray-500'}`}>
                    {i + 1}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-violet-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {provider.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{provider.name}</p>
                    <p className="text-gray-500 text-xs">{provider.category} • {provider.city}</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 text-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {provider.rating?.average?.toFixed(1) || '0.0'}
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-semibold text-sm">
                      ₹{(provider.totalEarnings || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-gray-500 text-xs">{provider.completedJobs || 0} jobs</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Category breakdown */}
        {analytics?.categoryStats?.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-400" />
              Revenue by Category
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analytics.categoryStats.map(cat => (
                <div key={cat._id} className="bg-gray-800/60 rounded-xl p-4 text-center border border-gray-700/50">
                  <p className="text-white font-bold text-xl">{cat.count}</p>
                  <p className="text-gray-400 text-xs mt-1">{cat._id}</p>
                  {cat.totalRevenue > 0 && (
                    <p className="text-emerald-400 text-sm font-medium mt-1">
                      ₹{cat.totalRevenue.toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default AdminReports;
