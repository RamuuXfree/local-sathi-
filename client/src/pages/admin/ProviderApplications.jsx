import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Briefcase, CalendarCheck, BarChart3, Bell, FileText,
  Search, Filter, CheckCircle, XCircle, Clock, Eye,
  ChevronDown, X, AlertCircle, StickyNote, RefreshCw, MapPin,
  Phone, Mail, Star, Award, Shield
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { getAllApplications, updateApplicationStatus, addAdminNote } from '../../api/applications';
import toast from 'react-hot-toast';

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const sidebarLinks = [
  { label: 'Overview', href: '/admin/dashboard', icon: BarChart3 },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Providers', href: '/admin/providers', icon: Briefcase },
  { label: 'Applications', href: '/admin/applications', icon: FileText },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
];

const CATEGORY_EMOJIS = {
  Electrician: '⚡', Plumber: '🔧', Cleaner: '🧹', 'AC Repair': '❄️',
  Carpenter: '🪚', Painter: '🎨', 'Appliance Repair': '🔌', Other: '🛠️',
};

const STATUS_COLORS = {
  pending: { pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
  approved: { pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  rejected: { pill: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400' },
  hold: { pill: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-400' },
};

// ─── Application Detail Modal ─────────────────────────────────────────────────
const ApplicationModal = ({ application, onClose, onStatusUpdate }) => {
  const [newStatus, setNewStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState(application.rejectionReason || '');
  const [adminNotes, setAdminNotes] = useState(application.adminNotes || '');
  const [processing, setProcessing] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const handleStatusUpdate = async (status) => {
    if (status === 'rejected' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setProcessing(true);
    try {
      const { data } = await updateApplicationStatus(application._id, {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : '',
        adminNotes,
      });
      toast.success(`Application ${status} successfully!`);
      onStatusUpdate(data.application);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveNote = async () => {
    setSavingNote(true);
    try {
      await addAdminNote(application._id, { adminNotes });
      toast.success('Note saved');
    } catch (err) {
      toast.error('Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  const submittedDate = application.submittedAt || application.createdAt;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-card border border-gray-700/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-6 py-4 flex items-start justify-between gap-4 z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-violet-700 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
              {application.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{application.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-gray-400 text-sm">{CATEGORY_EMOJIS[application.category]} {application.category}</span>
                <span className="text-gray-600">•</span>
                <span className={`badge border text-xs ${STATUS_COLORS[application.applicationStatus]?.pill || ''}`}>
                  {application.applicationStatus}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 px-6">
          {['details', 'actions', 'notes'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ── DETAILS TAB ── */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Mail, label: 'Email', value: application.email },
                  { icon: Phone, label: 'Phone', value: application.phone },
                  { icon: MapPin, label: 'Location', value: `${application.city}${application.state ? ', ' + application.state : ''}` },
                  { icon: Briefcase, label: 'Experience', value: `${application.experience || 0} years` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 p-3.5 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <div className="w-9 h-9 rounded-lg bg-primary-600/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-500 text-xs">{label}</p>
                      <p className="text-white text-sm font-medium truncate">{value || '—'}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bio */}
              {application.bio && (
                <div className="p-4 bg-gray-800/40 rounded-xl border border-gray-700/50">
                  <p className="text-gray-400 text-xs mb-1.5">Bio / About</p>
                  <p className="text-gray-200 text-sm leading-relaxed">{application.bio}</p>
                </div>
              )}

              {/* Skills */}
              {application.skills?.length > 0 && (
                <div>
                  <p className="text-gray-400 text-xs mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {application.skills.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-primary-600/10 text-primary-400 rounded-lg text-xs border border-primary-600/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Government ID */}
              {(application.governmentIdType || application.governmentIdNumber) && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <p className="text-gray-500 text-xs mb-1">ID Type</p>
                    <p className="text-white text-sm font-medium">{application.governmentIdType || '—'}</p>
                  </div>
                  <div className="p-3.5 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <p className="text-gray-500 text-xs mb-1">ID Number</p>
                    <p className="text-white text-sm font-medium font-mono">{application.governmentIdNumber || '—'}</p>
                  </div>
                </div>
              )}

              {/* Certifications */}
              {application.certifications?.length > 0 && (
                <div>
                  <p className="text-gray-400 text-xs mb-2">Certifications</p>
                  <div className="space-y-1.5">
                    {application.certifications.map((cert, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                        <Award className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        {cert}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Areas */}
              {application.serviceAreas?.length > 0 && (
                <div>
                  <p className="text-gray-400 text-xs mb-2">Service Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {application.serviceAreas.map(area => (
                      <span key={area} className="px-2.5 py-1 bg-gray-800 text-gray-300 rounded-lg text-xs border border-gray-700">
                        📍 {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing */}
              {application.pricing?.basePrice > 0 && (
                <div className="p-3.5 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <p className="text-gray-500 text-xs mb-1">Base Price</p>
                  <p className="text-white text-lg font-bold">
                    ₹{application.pricing.basePrice.toLocaleString('en-IN')}
                    <span className="text-gray-500 text-sm font-normal ml-1">{application.pricing.priceUnit}</span>
                  </p>
                </div>
              )}

              {/* Review info */}
              {application.reviewedAt && (
                <div className="p-3 bg-gray-800/30 rounded-xl border border-gray-700/40 text-xs text-gray-500">
                  Reviewed on {new Date(application.reviewedAt).toLocaleString('en-IN')}
                  {application.reviewedBy?.name && ` by ${application.reviewedBy.name}`}
                </div>
              )}

              {/* Submission date */}
              <div className="text-xs text-gray-600 text-center pt-2">
                Application submitted {submittedDate ? new Date(submittedDate).toLocaleString('en-IN') : '—'}
              </div>
            </div>
          )}

          {/* ── ACTIONS TAB ── */}
          {activeTab === 'actions' && (
            <div className="space-y-5">
              {application.applicationStatus !== 'approved' && (
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-white font-semibold">Approve Application</h4>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    Approving will activate this provider's account. They will be able to log in, create services, and accept bookings. A notification will be sent immediately.
                  </p>
                  <button
                    onClick={() => handleStatusUpdate('approved')}
                    disabled={processing}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {processing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Approve & Activate Account
                  </button>
                </div>
              )}

              {application.applicationStatus !== 'hold' && (
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <h4 className="text-white font-semibold">Put On Hold</h4>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    Place this application on hold while awaiting additional information or verification. The applicant will be notified.
                  </p>
                  <button
                    onClick={() => handleStatusUpdate('hold')}
                    disabled={processing}
                    className="w-full py-3 bg-gradient-to-r from-blue-700 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-500 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {processing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Clock className="w-4 h-4" />}
                    Put On Hold
                  </button>
                </div>
              )}

              {application.applicationStatus !== 'rejected' && (
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <h4 className="text-white font-semibold">Reject Application</h4>
                  </div>
                  <div className="mb-3">
                    <label className="label">Rejection Reason <span className="text-red-400">*</span></label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      placeholder="Explain why this application is being rejected (will be shared with applicant)..."
                      className="input-field resize-none text-sm"
                    />
                  </div>
                  <button
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={processing || !rejectionReason.trim()}
                    className="w-full py-3 bg-gradient-to-r from-red-700 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Reject Application
                  </button>
                </div>
              )}

              {application.rejectionReason && (
                <div className="p-3.5 bg-red-500/5 rounded-xl border border-red-500/20">
                  <p className="text-red-400 text-xs font-semibold mb-1">Previous Rejection Reason:</p>
                  <p className="text-gray-300 text-sm">{application.rejectionReason}</p>
                </div>
              )}
            </div>
          )}

          {/* ── NOTES TAB ── */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div>
                <label className="label">Internal Admin Notes</label>
                <p className="text-gray-500 text-xs mb-2">These notes are only visible to admins and will not be shared with the applicant.</p>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={6}
                  placeholder="Add internal notes about this application — verification steps taken, concerns, follow-up actions needed..."
                  className="input-field resize-none text-sm"
                />
              </div>
              <button
                onClick={handleSaveNote}
                disabled={savingNote}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {savingNote ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <StickyNote className="w-4 h-4" />}
                Save Notes
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Application Row Card ─────────────────────────────────────────────────────
const ApplicationCard = ({ application, index, onView }) => {
  const statusColor = STATUS_COLORS[application.applicationStatus] || STATUS_COLORS.pending;
  const submittedDate = application.submittedAt || application.createdAt;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="glass-card p-5 hover:border-gray-700 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-violet-700 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
          {application.name?.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="text-white font-semibold">{application.name}</h3>
              <p className="text-primary-400 text-sm">
                {CATEGORY_EMOJIS[application.category]} {application.category}
              </p>
            </div>
            <span className={`badge border text-xs flex-shrink-0 ${statusColor.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusColor.dot}`} />
              {application.applicationStatus}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
            <span className="text-gray-500 text-xs flex items-center gap-1">
              <Mail className="w-3 h-3" /> {application.email}
            </span>
            <span className="text-gray-500 text-xs flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {application.city}
            </span>
            <span className="text-gray-500 text-xs flex items-center gap-1">
              <Briefcase className="w-3 h-3" /> {application.experience || 0} yrs exp
            </span>
            <span className="text-gray-600 text-xs">
              {submittedDate ? new Date(submittedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
            </span>
          </div>

          {/* Skills preview */}
          {application.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {application.skills.slice(0, 4).map(skill => (
                <span key={skill} className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs border border-gray-700">
                  {skill}
                </span>
              ))}
              {application.skills.length > 4 && (
                <span className="px-2 py-0.5 bg-gray-800 text-gray-600 rounded text-xs border border-gray-700">
                  +{application.skills.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* View Button */}
        <button
          onClick={() => onView(application)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-primary-600/10 text-primary-400 hover:bg-primary-600/20 border border-primary-600/20 rounded-xl text-sm font-medium transition-all"
        >
          <Eye className="w-4 h-4" />
          Review
        </button>
      </div>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ProviderApplications = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, hold: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const CATEGORIES = ['All', 'Electrician', 'Plumber', 'Cleaner', 'AC Repair', 'Carpenter', 'Painter', 'Appliance Repair', 'Other'];

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        sortBy,
        sortOrder,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;

      const { data } = await getAllApplications(params);
      setApplications(data.applications || []);
      setStats(data.stats || { pending: 0, approved: 0, rejected: 0, hold: 0, total: 0 });
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, categoryFilter, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(fetchApplications, 300);
    return () => clearTimeout(timer);
  }, [fetchApplications]);

  const handleStatusUpdate = (updatedApp) => {
    setApplications(prev =>
      prev.map(a => a._id === updatedApp._id ? updatedApp : a)
    );
    // Refresh stats
    fetchApplications();
  };

  const statCards = [
    { title: 'Total Applications', value: stats.total, icon: FileText, color: 'primary', index: 0 },
    { title: 'Pending Review', value: stats.pending, icon: Clock, color: 'amber', index: 1 },
    { title: 'Approved', value: stats.approved, icon: CheckCircle, color: 'emerald', index: 2 },
    { title: 'Rejected / On Hold', value: (stats.rejected || 0) + (stats.hold || 0), icon: XCircle, color: 'red', index: 3 },
  ];

  return (
    <DashboardLayout links={sidebarLinks} title="Provider Applications">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-white">Provider Applications</h2>
            <p className="text-gray-400 text-sm mt-0.5">Review and manage "Become a Provider" applications</p>
          </div>
          <button
            onClick={fetchApplications}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-gray-300 rounded-xl border border-gray-700 hover:bg-gray-700 hover:text-white transition-all text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(s => <StatCard key={s.title} {...s} />)}
        </div>

        {/* Pending Alert */}
        {stats.pending > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-4 border-amber-500/20 bg-amber-500/5 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-white font-semibold">
                  {stats.pending} application{stats.pending > 1 ? 's' : ''} awaiting review
                </p>
                <p className="text-gray-400 text-sm">Review and approve qualified providers to grow the platform.</p>
              </div>
            </div>
            <button
              onClick={() => setStatusFilter('pending')}
              className="flex-shrink-0 px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-sm font-medium hover:bg-amber-500/30 transition-all"
            >
              View Pending
            </button>
          </motion.div>
        )}

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="flex gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, email, city, category..."
                className="input-field pl-11 text-sm py-2.5"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                showFilters || categoryFilter !== 'all' || sortBy !== 'submittedAt'
                  ? 'bg-primary-600/20 text-primary-400 border-primary-600/30'
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {(categoryFilter !== 'all' || sortBy !== 'submittedAt') && (
                <span className="w-5 h-5 bg-primary-600 text-white rounded-full text-xs flex items-center justify-center">
                  {(categoryFilter !== 'all' ? 1 : 0) + (sortBy !== 'submittedAt' ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'approved', 'rejected', 'hold'].map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${
                  statusFilter === s
                    ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white shadow-glow'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {s}
                {s !== 'all' && stats[s] > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                    statusFilter === s ? 'bg-white/20' : 'bg-gray-700'
                  }`}>
                    {stats[s]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <div>
                  <label className="label text-xs">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
                    className="input-field text-sm py-2"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c === 'All' ? 'all' : c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="input-field text-sm py-2"
                  >
                    <option value="submittedAt">Submission Date</option>
                    <option value="createdAt">Created Date</option>
                    <option value="name">Name</option>
                    <option value="experience">Experience</option>
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Order</label>
                  <select
                    value={sortOrder}
                    onChange={e => setSortOrder(e.target.value)}
                    className="input-field text-sm py-2"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Applications List */}
        {loading ? <Loader text="Loading applications..." /> : applications.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No applications found"
            description={
              search || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'No provider applications have been submitted yet.'
            }
            action={
              (search || statusFilter !== 'all' || categoryFilter !== 'all') && (
                <button
                  onClick={() => { setSearch(''); setStatusFilter('all'); setCategoryFilter('all'); }}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              )
            }
          />
        ) : (
          <>
            <div className="space-y-3">
              {applications.map((app, i) => (
                <ApplicationCard
                  key={app._id}
                  application={app}
                  index={i}
                  onView={setSelectedApp}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-800 text-gray-400 rounded-xl border border-gray-700 hover:bg-gray-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
                >
                  ← Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                        page === p
                          ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-800 text-gray-400 rounded-xl border border-gray-700 hover:bg-gray-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* Results count */}
        {!loading && applications.length > 0 && (
          <p className="text-center text-gray-600 text-sm">
            Showing {applications.length} of {stats.total || 0} applications
          </p>
        )}
      </motion.div>

      {/* Application Detail Modal */}
      <AnimatePresence>
        {selectedApp && (
          <ApplicationModal
            application={selectedApp}
            onClose={() => setSelectedApp(null)}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default ProviderApplications;
