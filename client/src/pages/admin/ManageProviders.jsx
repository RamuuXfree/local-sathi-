import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Briefcase, CalendarCheck, BarChart3, Bell, FileText,
  CheckCircle, XCircle, Search, Star
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import RatingStars from '../../components/common/RatingStars';
import { getAllProvidersAdmin, approveProvider } from '../../api/providers';
import toast from 'react-hot-toast';

const sidebarLinks = [
  { label: 'Overview', href: '/admin/dashboard', icon: BarChart3 },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Providers', href: '/admin/providers', icon: Briefcase },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
  { label: 'Reports', href: '/admin/reports', icon: FileText },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
];

const FILTER_OPTIONS = ['all', 'approved', 'pending'];

const ManageProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { isApproved: filter === 'approved' } : {};
      const { data } = await getAllProvidersAdmin(params);
      setProviders(data.providers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProviders(); }, [filter]);

  const handleApprove = async (id, isApproved) => {
    try {
      await approveProvider(id, { isApproved });
      toast.success(isApproved ? '✅ Provider approved!' : 'Provider approval revoked');
      fetchProviders();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const filtered = providers.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase()) ||
    p.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout links={sidebarLinks} title="Manage Providers">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Manage Providers</h2>
            <p className="text-gray-400 text-sm mt-0.5">{providers.length} service providers registered</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search providers..."
                className="input-field pl-10 py-2.5 text-sm w-56"
              />
            </div>
            <div className="flex gap-2">
              {FILTER_OPTIONS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${
                    filter === f
                      ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? <Loader /> : filtered.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No providers found"
            description={`No ${filter === 'all' ? '' : filter + ' '}providers match your search.`}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((provider, i) => (
              <motion.div
                key={provider._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card p-5 hover:border-gray-700 transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-violet-700 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
                    {provider.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-white font-semibold truncate">{provider.name}</h3>
                      {provider.isApproved
                        ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        : <XCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      }
                    </div>
                    <p className="text-primary-400 text-sm">{provider.category} • {provider.city}</p>
                    <RatingStars rating={provider.rating?.average || 0} showCount count={provider.rating?.count || 0} size="sm" />
                  </div>
                  <Badge
                    label={provider.isApproved ? 'Approved' : 'Pending'}
                    variant={provider.isApproved ? 'accepted' : 'pending'}
                  />
                </div>

                <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                  <span>{provider.experience || 0} yrs experience</span>
                  <span>•</span>
                  <span>{provider.completedJobs || 0} jobs completed</span>
                  <span>•</span>
                  <span>₹{(provider.totalEarnings || 0).toLocaleString('en-IN')} earned</span>
                </div>

                {provider.bio && (
                  <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">{provider.bio}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    {provider.pricing?.basePrice
                      ? `₹${provider.pricing.basePrice.toLocaleString('en-IN')} ${provider.pricing.priceUnit}`
                      : 'Pricing not set'
                    }
                  </div>
                  <div className="flex gap-2">
                    {!provider.isApproved && (
                      <button
                        onClick={() => handleApprove(provider._id, true)}
                        className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-xs font-medium transition-all"
                      >
                        ✓ Approve
                      </button>
                    )}
                    {provider.isApproved && (
                      <button
                        onClick={() => handleApprove(provider._id, false)}
                        className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs font-medium transition-all"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default ManageProviders;
