import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CalendarCheck, Wrench, TrendingUp, Star, User, ArrowUpRight } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { getProviderBookings } from '../../api/bookings';
import { useAuth } from '../../context/AuthContext';

const sidebarLinks = [
  { label: 'Overview', href: '/provider/dashboard', icon: CalendarCheck },
  { label: 'Bookings', href: '/provider/bookings', icon: CalendarCheck },
  { label: 'My Services', href: '/provider/services', icon: Wrench },
  { label: 'Earnings', href: '/provider/earnings', icon: DollarSign },
  { label: 'Reviews', href: '/provider/reviews', icon: Star },
  { label: 'Profile', href: '/provider/profile', icon: User },
];

const ProviderEarnings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProviderBookings({ status: 'completed' })
      .then(({ data }) => setBookings(data.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalEarnings = bookings.reduce((acc, b) => acc + (b.amount || 0), 0);

  const now = new Date();
  const monthlyEarnings = bookings
    .filter(b => {
      const d = new Date(b.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((acc, b) => acc + (b.amount || 0), 0);

  const weeklyEarnings = bookings
    .filter(b => {
      const d = new Date(b.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    })
    .reduce((acc, b) => acc + (b.amount || 0), 0);

  return (
    <DashboardLayout links={sidebarLinks} title="Earnings">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Earnings Overview</h2>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Earnings" value={`₹${totalEarnings.toLocaleString('en-IN')}`} icon={DollarSign} color="violet" index={0} />
          <StatCard title="This Month" value={`₹${monthlyEarnings.toLocaleString('en-IN')}`} icon={TrendingUp} color="emerald" index={1} />
          <StatCard title="This Week" value={`₹${weeklyEarnings.toLocaleString('en-IN')}`} icon={ArrowUpRight} color="blue" index={2} />
        </div>

        {/* Completed Bookings Table */}
        <div className="glass-card p-6">
          <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Completed Bookings
          </h3>
          {loading ? <Loader /> : bookings.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No earnings yet"
              description="Complete bookings to start tracking your earnings."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-500 text-sm border-b border-gray-800">
                    <th className="text-left pb-3">Service</th>
                    <th className="text-left pb-3">Customer</th>
                    <th className="text-left pb-3">Date</th>
                    <th className="text-right pb-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {bookings.map(b => (
                    <tr key={b._id} className="text-sm hover:bg-gray-800/20 transition-colors">
                      <td className="py-3.5 text-gray-200 font-medium">{b.serviceId?.title || 'Service'}</td>
                      <td className="py-3.5 text-gray-400">{b.userId?.name || '-'}</td>
                      <td className="py-3.5 text-gray-500">
                        {new Date(b.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 text-right font-semibold text-emerald-400">
                        ₹{(b.amount || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-700">
                    <td colSpan={3} className="pt-4 text-gray-300 font-semibold">Total</td>
                    <td className="pt-4 text-right text-white font-bold text-lg">
                      ₹{totalEarnings.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default ProviderEarnings;
