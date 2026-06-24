import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Briefcase, Star, Save, CalendarCheck, Wrench, DollarSign, CheckCircle, Clock } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { updateProviderProfile } from '../../api/providers';
import toast from 'react-hot-toast';

const sidebarLinks = [
  { label: 'Overview', href: '/provider/dashboard', icon: CalendarCheck },
  { label: 'Bookings', href: '/provider/bookings', icon: CalendarCheck },
  { label: 'My Services', href: '/provider/services', icon: Wrench },
  { label: 'Earnings', href: '/provider/earnings', icon: DollarSign },
  { label: 'Reviews', href: '/provider/reviews', icon: Star },
  { label: 'Profile', href: '/provider/profile', icon: User },
];

const ProviderProfile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    state: user?.state || '',
    experience: user?.experience || 0,
    bio: user?.bio || '',
    skills: (user?.skills || []).join(', '),
    basePrice: user?.pricing?.basePrice || '',
    priceUnit: user?.pricing?.priceUnit || 'per visit',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateProviderProfile({
        name: form.name,
        phone: form.phone,
        city: form.city,
        state: form.state,
        experience: parseInt(form.experience) || 0,
        bio: form.bio,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        pricing: {
          basePrice: parseFloat(form.basePrice) || 0,
          priceUnit: form.priceUnit,
        },
      });
      updateUser(data.provider);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout links={sidebarLinks} title="Profile">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl space-y-6">
        {/* Profile Card */}
        <div className="glass-card p-5 flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-primary-600 flex items-center justify-center text-3xl font-bold text-white shadow-glow">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-xl">{user?.name}</h3>
            <p className="text-violet-400 font-medium">{user?.category}</p>
            <div className="flex items-center gap-2 mt-1.5">
              {user?.isApproved ? (
                <span className="flex items-center gap-1 text-emerald-400 text-sm">
                  <CheckCircle className="w-4 h-4" /> Approved Provider
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400 text-sm">
                  <Clock className="w-4 h-4" /> Pending Approval
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-amber-400 text-lg font-bold">{user?.rating?.average?.toFixed(1) || '0.0'} ★</p>
            <p className="text-gray-500 text-xs">{user?.rating?.count || 0} reviews</p>
            <p className="text-gray-400 text-xs mt-1">{user?.completedJobs || 0} jobs done</p>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
          <h3 className="text-white font-semibold text-lg">Edit Profile</h3>

          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input name="name" value={form.name} onChange={handleChange} className="input-field pl-11" />
            </div>
          </div>

          <div>
            <label className="label">Email (read-only)</label>
            <input value={user?.email} disabled className="input-field opacity-50 cursor-not-allowed" />
          </div>

          <div>
            <label className="label">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" className="input-field pl-11" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">City</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input name="city" value={form.city} onChange={handleChange} placeholder="Mumbai" className="input-field pl-11" />
              </div>
            </div>
            <div>
              <label className="label">Experience (yrs)</label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input name="experience" type="number" value={form.experience} onChange={handleChange} min="0" className="input-field pl-11" />
              </div>
            </div>
          </div>

          <div>
            <label className="label">Bio / About</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              placeholder="Briefly describe your experience, qualifications, and specializations..."
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="label">Skills (comma-separated)</label>
            <input
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="Wiring, Panel Repair, Fan Installation, Troubleshooting"
              className="input-field"
            />
          </div>

          <div className="pt-2">
            <h4 className="text-white font-medium mb-3">Pricing</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Base Price (₹)</label>
                <input
                  name="basePrice"
                  type="number"
                  value={form.basePrice}
                  onChange={handleChange}
                  placeholder="999"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Price Unit</label>
                <input
                  name="priceUnit"
                  value={form.priceUnit}
                  onChange={handleChange}
                  placeholder="per visit"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </button>
        </form>
      </motion.div>
    </DashboardLayout>
  );
};

export default ProviderProfile;
