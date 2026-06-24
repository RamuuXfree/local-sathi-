import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Wrench, CalendarCheck, DollarSign, Star, User, X } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { getMyServices, createService, updateService, deleteService } from '../../api/services';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electrician', 'Plumber', 'Cleaner', 'AC Repair', 'Carpenter', 'Painter', 'Appliance Repair', 'Other'];

const sidebarLinks = [
  { label: 'Overview', href: '/provider/dashboard', icon: CalendarCheck },
  { label: 'Bookings', href: '/provider/bookings', icon: CalendarCheck },
  { label: 'My Services', href: '/provider/services', icon: Wrench },
  { label: 'Earnings', href: '/provider/earnings', icon: DollarSign },
  { label: 'Reviews', href: '/provider/reviews', icon: Star },
  { label: 'Profile', href: '/provider/profile', icon: User },
];

const defaultForm = {
  title: '', category: '', description: '',
  price: '', priceUnit: 'per visit', duration: '1-2 hours', tags: '',
};

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    try {
      const { data } = await getMyServices();
      setServices(data.services || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(defaultForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      if (editingId) {
        await updateService(editingId, payload);
        toast.success('Service updated successfully!');
      } else {
        await createService(payload);
        toast.success('Service created successfully!');
      }
      resetForm();
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (service) => {
    setEditingId(service._id);
    setForm({
      title: service.title,
      category: service.category,
      description: service.description,
      price: service.price,
      priceUnit: service.priceUnit,
      duration: service.duration,
      tags: (service.tags || []).join(', '),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await deleteService(id);
      toast.success('Service deleted');
      fetchServices();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <DashboardLayout links={sidebarLinks} title="My Services">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">My Services</h2>
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(defaultForm); }}
            className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
          >
            {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Add Service</>}
          </button>
        </div>

        {/* Service Form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              onSubmit={handleSubmit}
              className="glass-card p-6 space-y-4 border-primary-500/20"
            >
              <h3 className="text-white font-semibold text-lg">
                {editingId ? '✏️ Edit Service' : '➕ New Service'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Service Title *</label>
                  <input name="title" value={form.title} onChange={handleChange}
                    placeholder="e.g., Full Home Electrical Inspection & Repair"
                    className="input-field" required />
                </div>
                <div>
                  <label className="label">Category *</label>
                  <select name="category" value={form.category} onChange={handleChange} className="input-field" required>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Price (₹) *</label>
                  <input name="price" type="number" value={form.price} onChange={handleChange}
                    placeholder="999" min="0" className="input-field" required />
                </div>
                <div>
                  <label className="label">Price Unit</label>
                  <input name="priceUnit" value={form.priceUnit} onChange={handleChange}
                    placeholder="per visit" className="input-field" />
                </div>
                <div>
                  <label className="label">Duration</label>
                  <input name="duration" value={form.duration} onChange={handleChange}
                    placeholder="1-2 hours" className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Description *</label>
                  <textarea name="description" value={form.description} onChange={handleChange}
                    rows={3} placeholder="Describe what this service includes, tools used, process..."
                    className="input-field resize-none" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Tags (comma-separated)</label>
                  <input name="tags" value={form.tags} onChange={handleChange}
                    placeholder="wiring, repair, residential, inspection"
                    className="input-field" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
                  ) : editingId ? 'Update Service' : 'Create Service'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Services Grid */}
        {loading ? <Loader /> : services.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No services yet"
            description="Add your first service listing to start receiving booking requests from customers."
            action={<button onClick={() => setShowForm(true)} className="btn-primary">Add Your First Service</button>}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {services.map((service, i) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 hover:border-gray-700 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <Badge label={service.category} />
                    <h3 className="text-white font-semibold mt-1.5 leading-tight">{service.title}</h3>
                  </div>
                  <div className="flex gap-1.5 ml-3">
                    <button
                      onClick={() => handleEdit(service)}
                      className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-primary-600/20 hover:text-primary-400 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(service._id)}
                      className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-3 line-clamp-2">{service.description}</p>
                {service.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {service.tags.slice(0, 4).map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-800 text-gray-500 rounded-md text-xs border border-gray-700">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                  <div>
                    <span className="text-white font-bold text-lg">₹{service.price.toLocaleString('en-IN')}</span>
                    <span className="text-gray-500 text-sm ml-1">{service.priceUnit}</span>
                  </div>
                  <span className="text-gray-500 text-xs bg-gray-800 px-2.5 py-1 rounded-lg">{service.duration}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default ManageServices;
