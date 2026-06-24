import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Navigation, CalendarCheck, Clock, Plus, Bell,
  User, Search, Loader2, CheckCircle, AlertCircle, Phone,
  ChevronRight, Zap
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { createBooking } from '../../api/bookings';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const sidebarLinks = [
  { label: 'Overview', href: '/dashboard', icon: CalendarCheck },
  { label: 'My Bookings', href: '/dashboard/bookings', icon: CalendarCheck },
  { label: 'Book Service', href: '/dashboard/book', icon: Plus },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
];

const CATEGORIES = [
  { name: 'Electrician', emoji: '⚡', color: 'from-yellow-500 to-amber-600' },
  { name: 'Plumber', emoji: '🔧', color: 'from-blue-500 to-cyan-600' },
  { name: 'Cleaner', emoji: '🧹', color: 'from-green-500 to-emerald-600' },
  { name: 'AC Repair', emoji: '❄️', color: 'from-sky-500 to-blue-600' },
  { name: 'Carpenter', emoji: '🪚', color: 'from-orange-500 to-red-600' },
  { name: 'Painter', emoji: '🎨', color: 'from-purple-500 to-violet-600' },
  { name: 'Appliance Repair', emoji: '🔌', color: 'from-gray-500 to-slate-600' },
  { name: 'Other', emoji: '🛠️', color: 'from-rose-500 to-pink-600' },
];

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM',
];

const STEPS = ['Choose Service', 'Your Location', 'Date & Time', 'Confirm'];

const NewBooking = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const preSelected = location.state;

  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(preSelected?.category || '');
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState(null);
  const [assignedProvider, setAssignedProvider] = useState(null);
  const [noProviders, setNoProviders] = useState(false);

  const [gps, setGps] = useState({ lat: null, lng: null, address: '', detecting: false, error: '' });
  const [form, setForm] = useState({
    bookingDate: '',
    bookingTime: '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
    notes: '',
  });

  // ── Socket listeners for real-time updates ─────────────────────────────────
  useEffect(() => {
    if (!socket || !createdBookingId) return;

    const handleAccepted = ({ bookingId, provider, message }) => {
      if (bookingId?.toString() === createdBookingId?.toString()) {
        setSearching(false);
        setAssignedProvider(provider);
        toast.success(message || `${provider.name} accepted your booking!`, { duration: 6000 });
      }
    };

    const handleNoProviders = ({ bookingId, message }) => {
      if (bookingId?.toString() === createdBookingId?.toString()) {
        setSearching(false);
        setNoProviders(true);
        toast.error(message, { duration: 6000 });
      }
    };

    socket.on('booking:accepted', handleAccepted);
    socket.on('booking:noProviders', handleNoProviders);
    return () => {
      socket.off('booking:accepted', handleAccepted);
      socket.off('booking:noProviders', handleNoProviders);
    };
  }, [socket, createdBookingId]);

  // ── GPS Detection ──────────────────────────────────────────────────────────
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGps(g => ({ ...g, error: 'Geolocation is not supported by your browser.' }));
      return;
    }
    setGps(g => ({ ...g, detecting: true, error: '' }));
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        // Reverse geocode via OpenStreetMap Nominatim (free)
        let addressStr = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await resp.json();
          if (data.display_name) {
            const parts = data.display_name.split(',').slice(0, 3);
            addressStr = parts.join(', ');
            const city = data.address?.city || data.address?.town || data.address?.village || '';
            const state = data.address?.state || '';
            const pincode = data.address?.postcode || '';
            setForm(f => ({
              ...f,
              city: city || f.city,
              state: state || f.state,
              pincode: pincode || f.pincode,
            }));
          }
        } catch (_) {}
        setGps({ lat, lng, address: addressStr, detecting: false, error: '' });
        toast.success('📍 Location detected!');
      },
      (err) => {
        setGps(g => ({ ...g, detecting: false, error: 'Could not detect location. Please enter manually.' }));
      },
      { timeout: 10000 }
    );
  }, []);

  const handleSubmit = async () => {
    if (!form.bookingDate || !form.bookingTime) { toast.error('Please select date and time'); return; }
    if (!form.street || !form.city) { toast.error('Please enter your address'); return; }

    setSubmitting(true);
    try {
      const payload = {
        category: selectedCategory,
        bookingDate: form.bookingDate,
        bookingTime: form.bookingTime,
        address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
        notes: form.notes,
        amount: 0,
      };
      if (gps.lat && gps.lng) {
        payload.customerLat = gps.lat;
        payload.customerLng = gps.lng;
        payload.customerAddress = gps.address;
      }

      const { data } = await createBooking(payload);
      setCreatedBookingId(data.booking._id);
      setStep(4); // Searching screen
      if (gps.lat && gps.lng) {
        setSearching(true);
        // Auto-navigate to bookings after 90s if no provider found
        setTimeout(() => {
          setSearching(false);
          navigate('/dashboard/bookings');
        }, 95000);
      } else {
        toast.success('Booking created!');
        navigate('/dashboard/bookings');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return !!selectedCategory;
    if (step === 1) return !!(form.street && form.city);
    if (step === 2) return !!(form.bookingDate && form.bookingTime);
    return true;
  };

  // ── Searching Screen ───────────────────────────────────────────────────────
  if (step === 4) {
    const catData = CATEGORIES.find(c => c.name === selectedCategory);

    if (assignedProvider) {
      return (
        <DashboardLayout links={sidebarLinks} title="Booking Confirmed">
          <div className="max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Provider Assigned! 🎉</h2>
              <p className="text-gray-400 mb-6">Your {selectedCategory} professional is on the way.</p>

              <div className="glass-card p-5 text-left mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-violet-700 flex items-center justify-center text-xl font-bold text-white">
                    {assignedProvider.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{assignedProvider.name}</p>
                    <p className="text-gray-400 text-sm">{assignedProvider.city}</p>
                    {assignedProvider.rating?.average > 0 && (
                      <p className="text-amber-400 text-sm">⭐ {assignedProvider.rating.average} ({assignedProvider.completedJobs} jobs)</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                  <a
                    href={`tel:${assignedProvider.phone}`}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-600/20 hover:bg-emerald-600/30 transition-all text-sm font-medium"
                  >
                    <Phone className="w-4 h-4" />
                    Call Provider
                  </a>
                  <button
                    onClick={() => navigate('/dashboard/bookings')}
                    className="btn-primary text-sm"
                  >
                    Track Booking →
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </DashboardLayout>
      );
    }

    if (noProviders) {
      return (
        <DashboardLayout links={sidebarLinks} title="No Providers Found">
          <div className="max-w-lg mx-auto">
            <div className="glass-card p-8 text-center">
              <div className="w-20 h-20 bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-5">
                <AlertCircle className="w-10 h-10 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No Providers Nearby</h2>
              <p className="text-gray-400 mb-6">
                No {selectedCategory} providers are online in your area right now. Your booking has been saved and will be assigned when a provider becomes available.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1">Try Again</button>
                <button onClick={() => navigate('/dashboard/bookings')} className="btn-primary flex-1">View Booking</button>
              </div>
            </div>
          </div>
        </DashboardLayout>
      );
    }

    return (
      <DashboardLayout links={sidebarLinks} title="Finding Provider...">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-8 text-center"
          >
            {/* Pulsing Radar Animation */}
            <div className="relative w-32 h-32 mx-auto mb-6">
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-primary-500/40"
                  animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                />
              ))}
              <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${catData?.color || 'from-primary-500 to-violet-600'} flex items-center justify-center text-5xl`}>
                {catData?.emoji || '🛠️'}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Searching for Providers...</h2>
            <p className="text-gray-400 mb-1">
              Looking for nearby <span className="text-primary-400 font-semibold">{selectedCategory}</span> professionals
            </p>
            <p className="text-gray-600 text-sm mb-8">Nearby providers have been notified. First to accept gets the job.</p>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[0,1,2,3,4].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-primary-500 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>

            <div className="space-y-3 text-left mb-6">
              {[
                { icon: '📡', text: 'Notifying nearby providers' },
                { icon: '⏱️', text: 'First provider to accept gets assigned' },
                { icon: '📱', text: 'You\'ll be notified immediately' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                  <span className="text-xl">{icon}</span>
                  <p className="text-gray-300 text-sm">{text}</p>
                </div>
              ))}
            </div>

            <button onClick={() => navigate('/dashboard/bookings')} className="btn-secondary w-full">
              Track in My Bookings →
            </button>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout links={sidebarLinks} title="Book a Service">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">

        {/* Step Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                step === i ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white' :
                step > i ? 'bg-emerald-600/20 text-emerald-400' : 'bg-gray-800 text-gray-500'
              }`}>
                <span className="w-4 h-4 rounded-full flex items-center justify-center bg-white/20 text-xs">
                  {step > i ? '✓' : i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className="w-4 h-0.5 bg-gray-800" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── STEP 0: Choose Category ── */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-white">What service do you need?</h2>
                <p className="text-gray-400 mt-1">We'll find the nearest professionals for you</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CATEGORIES.map(cat => (
                  <motion.button
                    key={cat.name}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setSelectedCategory(cat.name); setStep(1); }}
                    className={`p-4 rounded-2xl border-2 transition-all text-center ${
                      selectedCategory === cat.name
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-gray-700/50 bg-gray-800/40 hover:border-gray-600'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl mx-auto mb-2`}>
                      {cat.emoji}
                    </div>
                    <p className="text-white font-medium text-sm">{cat.name}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── STEP 1: Location ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-6 space-y-5"
            >
              <div>
                <h2 className="text-xl font-bold text-white">Where do you need the service?</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Detect your GPS location for faster provider matching
                </p>
              </div>

              {/* GPS Detect Button */}
              <div className={`p-4 rounded-xl border-2 transition-all ${
                gps.lat ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-gray-700/50 bg-gray-800/30'
              }`}>
                {gps.lat ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-emerald-400 font-semibold text-sm">📍 Location Detected</p>
                      <p className="text-gray-300 text-xs truncate">{gps.address}</p>
                    </div>
                    <button onClick={detectLocation} className="text-gray-500 hover:text-gray-300 text-xs">
                      Refresh
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={detectLocation}
                    disabled={gps.detecting}
                    className="w-full flex items-center justify-center gap-3 py-3 text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    {gps.detecting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Navigation className="w-5 h-5" />
                    )}
                    <span className="font-medium">
                      {gps.detecting ? 'Detecting location...' : 'Detect My GPS Location'}
                    </span>
                  </button>
                )}
                {gps.error && <p className="text-red-400 text-xs mt-2 text-center">{gps.error}</p>}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-800" />
                <span className="text-gray-600 text-xs">or enter manually</span>
                <div className="flex-1 h-px bg-gray-800" />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="label">Street Address *</label>
                  <input
                    value={form.street}
                    onChange={e => setForm({ ...form, street: e.target.value })}
                    placeholder="House no., Street, Area"
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">City *</label>
                    <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Mumbai" className="input-field" />
                  </div>
                  <div>
                    <label className="label">Pincode</label>
                    <input value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} placeholder="400001" className="input-field" />
                  </div>
                </div>
              </div>

              {gps.lat && (
                <div className="flex items-center gap-2 p-3 bg-primary-500/5 rounded-xl border border-primary-500/20">
                  <Zap className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  <p className="text-primary-300 text-xs">
                    GPS active — providers within your area will be automatically matched!
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 2: Date & Time ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-6 space-y-5"
            >
              <h2 className="text-xl font-bold text-white">When do you need it?</h2>
              <div>
                <label className="label">Preferred Date *</label>
                <input
                  type="date"
                  value={form.bookingDate}
                  onChange={e => setForm({ ...form, bookingDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Preferred Time *</label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map(t => (
                    <button
                      key={t}
                      onClick={() => setForm({ ...form, bookingTime: t })}
                      className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                        form.bookingTime === t
                          ? 'bg-primary-600/20 border-primary-500 text-primary-400'
                          : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Special Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  placeholder="Any specific instructions for the provider..."
                  className="input-field resize-none"
                />
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Confirm ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-6 space-y-5"
            >
              <h2 className="text-xl font-bold text-white">Review Your Request</h2>

              <div className="space-y-3">
                {[
                  { label: 'Service', value: `${CATEGORIES.find(c=>c.name===selectedCategory)?.emoji} ${selectedCategory}` },
                  { label: 'Location', value: `${form.street}, ${form.city}${form.pincode ? ' - ' + form.pincode : ''}` },
                  { label: 'Date', value: form.bookingDate ? new Date(form.bookingDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) : '—' },
                  { label: 'Time', value: form.bookingTime || '—' },
                  { label: 'GPS Matching', value: gps.lat ? '✅ Enabled — Nearest provider will be auto-matched' : '⚠️ Disabled — Provider search may be slower' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start py-3 border-b border-gray-800/70">
                    <span className="text-gray-500 text-sm flex-shrink-0 w-28">{label}</span>
                    <span className="text-white text-sm font-medium text-right">{value}</span>
                  </div>
                ))}
                {form.notes && (
                  <div className="py-3">
                    <p className="text-gray-500 text-sm mb-1">Notes</p>
                    <p className="text-gray-300 text-sm">{form.notes}</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-primary-500/5 border border-primary-500/20 rounded-xl">
                <p className="text-primary-400 text-sm font-semibold mb-1">🚀 How it works</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Your request will be sent to the nearest {selectedCategory} professionals in your area.
                  The first one to accept gets assigned. You'll be notified instantly!
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Sending Request...</>
                ) : (
                  <><Zap className="w-5 h-5" />Find Nearest Provider</>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav Buttons */}
        {step < 4 && (
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="btn-secondary">
                ← Back
              </button>
            )}
            {step < 3 && step > 0 && (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default NewBooking;
