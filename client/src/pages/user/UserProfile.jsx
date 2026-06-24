import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Save, CalendarCheck, Plus, Bell } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../api/users';
import toast from 'react-hot-toast';

const sidebarLinks = [
  { label: 'Overview', href: '/dashboard', icon: CalendarCheck },
  { label: 'My Bookings', href: '/dashboard/bookings', icon: CalendarCheck },
  { label: 'Book Service', href: '/dashboard/book', icon: Plus },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
];

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateProfile({
        name: form.name,
        phone: form.phone,
        address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
      });
      updateUser(data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  return (
    <DashboardLayout links={sidebarLinks} title="Profile">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl space-y-6">
        <h2 className="text-2xl font-bold text-white">Profile Settings</h2>

        {/* Avatar */}
        <div className="glass-card p-5 flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-3xl font-bold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{user?.name}</h3>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <span className="badge bg-primary-500/10 text-primary-400 border border-primary-500/20 mt-1">Customer</span>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <h3 className="text-white font-semibold">Personal Information</h3>
          <div><label className="label">Full Name</label><div className="relative"><User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" /><input name="name" value={form.name} onChange={handleChange} className="input-field pl-11" /></div></div>
          <div><label className="label">Email (read-only)</label><input value={user?.email} disabled className="input-field opacity-50 cursor-not-allowed" /></div>
          <div><label className="label">Phone</label><div className="relative"><Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" /><input name="phone" value={form.phone} onChange={handleChange} className="input-field pl-11" /></div></div>

          <h3 className="text-white font-semibold pt-2">Address</h3>
          <div><label className="label">Street</label><input name="street" value={form.street} onChange={handleChange} placeholder="123 MG Road" className="input-field" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">City</label><input name="city" value={form.city} onChange={handleChange} placeholder="Mumbai" className="input-field" /></div>
            <div><label className="label">Pincode</label><input name="pincode" value={form.pincode} onChange={handleChange} placeholder="400001" className="input-field" /></div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>
    </DashboardLayout>
  );
};
export default UserProfile;
