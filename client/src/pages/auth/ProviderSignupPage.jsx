import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail, Lock, User, Phone, MapPin, Briefcase, Wrench,
  Eye, EyeOff, CheckCircle, AlertCircle, Plus, X
} from 'lucide-react';
import { registerProvider } from '../../api/auth';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electrician', 'Plumber', 'Cleaner', 'AC Repair', 'Carpenter', 'Painter', 'Appliance Repair', 'Other'];
const GOV_ID_TYPES = ['Aadhar', 'PAN', 'Passport', 'Driving License', 'Voter ID', 'Other'];
const STEPS = ['Basic Info', 'Professional', 'Documents', 'Review'];

const ProviderSignupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    // Step 1 - Basic Info
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    state: '',
    // Step 2 - Professional
    category: '',
    experience: '',
    yearsInBusiness: '',
    bio: '',
    skills: [],
    skillInput: '',
    serviceAreas: [],
    areaInput: '',
    // Step 3 - Documents
    governmentIdType: '',
    governmentIdNumber: '',
    certifications: [],
    certInput: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const addTag = (field, inputField, value) => {
    if (!value.trim()) return;
    if (form[field].includes(value.trim())) return;
    setForm({ ...form, [field]: [...form[field], value.trim()], [inputField]: '' });
  };

  const removeTag = (field, tag) => {
    setForm({ ...form, [field]: form[field].filter(t => t !== tag) });
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.name || !form.email || !form.phone || !form.password || !form.city) {
        setError('Please fill all required fields.');
        return false;
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return false;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        return false;
      }
    }
    if (step === 1) {
      if (!form.category) {
        setError('Please select a service category.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await registerProvider({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        city: form.city,
        state: form.state,
        category: form.category,
        experience: parseInt(form.experience) || 0,
        yearsInBusiness: parseInt(form.yearsInBusiness) || 0,
        bio: form.bio,
        skills: form.skills,
        serviceAreas: form.serviceAreas,
        governmentIdType: form.governmentIdType,
        governmentIdNumber: form.governmentIdNumber,
        certifications: form.certifications,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card w-full max-w-lg p-10 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Application Submitted!</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Your provider application has been received. Our admin team will review it shortly.
            You'll receive a notification once a decision is made.
          </p>
          <div className="space-y-3 text-sm text-left bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
            {[
              '📋 Application is being reviewed',
              '🔍 Our team verifies all details & documents',
              '✅ Once approved, you can log in and start accepting bookings',
              '📧 You\'ll get an email & app notification with the decision',
            ].map(item => (
              <p key={item} className="text-gray-300">{item}</p>
            ))}
          </div>
          <Link to="/login" className="btn-primary w-full">
            Go to Login Page
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero-gradient py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center gap-2.5 justify-center mb-6">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-violet-600 rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">LocalSaathi</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Become a Provider</h1>
          <p className="text-gray-400 mt-2">Join thousands of professionals earning on LocalSaathi</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <div className={`flex flex-col items-center gap-1`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  i < step ? 'bg-emerald-600 text-white' :
                  i === step ? 'bg-gradient-to-br from-primary-600 to-violet-600 text-white shadow-glow' :
                  'bg-gray-800 text-gray-500 border border-gray-700'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs whitespace-nowrap hidden sm:block ${i === step ? 'text-primary-400' : 'text-gray-600'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 mb-4 transition-all duration-300 ${i < step ? 'bg-emerald-600' : 'bg-gray-800'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-card p-6 sm:p-8"
        >
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* ── STEP 0: BASIC INFO ── */}
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Rajesh Kumar" className="input-field pl-11" required />
                  </div>
                </div>
                <div>
                  <label className="label">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" className="input-field pl-11" required />
                  </div>
                </div>
                <div>
                  <label className="label">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" className="input-field pl-11" required />
                  </div>
                </div>
                <div>
                  <label className="label">City *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input name="city" value={form.city} onChange={handleChange} placeholder="Mumbai" className="input-field pl-11" required />
                  </div>
                </div>
                <div>
                  <label className="label">State</label>
                  <input name="state" value={form.state} onChange={handleChange} placeholder="Maharashtra" className="input-field" />
                </div>
                <div>
                  <label className="label">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Min. 6 characters" className="input-field pl-11 pr-12" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" className="input-field pl-11" required />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 1: PROFESSIONAL ── */}
          {step === 1 && (
            <div className="space-y-5">
              <h3 className="text-white font-bold text-lg mb-4">Professional Details</h3>
              <div>
                <label className="label">Service Category *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat })}
                      className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                        form.category === cat
                          ? 'border-primary-500 bg-primary-500/15 text-primary-400'
                          : 'border-gray-700 bg-gray-800/60 text-gray-400 hover:border-gray-600 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Experience (Years)</label>
                  <input name="experience" type="number" min="0" max="50" value={form.experience} onChange={handleChange} placeholder="5" className="input-field" />
                </div>
                <div>
                  <label className="label">Years in Business</label>
                  <input name="yearsInBusiness" type="number" min="0" max="50" value={form.yearsInBusiness} onChange={handleChange} placeholder="3" className="input-field" />
                </div>
              </div>

              <div>
                <label className="label">About Yourself</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
                  placeholder="Describe your expertise, services you offer, and why customers should choose you..."
                  className="input-field resize-none" />
              </div>

              {/* Skills */}
              <div>
                <label className="label">Skills</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={form.skillInput}
                    onChange={e => setForm({ ...form, skillInput: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('skills', 'skillInput', form.skillInput))}
                    placeholder="e.g. Wiring, Panel Repair"
                    className="input-field text-sm flex-1"
                  />
                  <button type="button" onClick={() => addTag('skills', 'skillInput', form.skillInput)} className="px-3 py-2 bg-primary-600/20 text-primary-400 rounded-xl border border-primary-600/20 hover:bg-primary-600/30 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {form.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.skills.map(s => (
                      <span key={s} className="flex items-center gap-1 px-3 py-1 bg-primary-600/10 text-primary-400 rounded-lg text-sm border border-primary-600/20">
                        {s}
                        <button type="button" onClick={() => removeTag('skills', s)} className="text-primary-500 hover:text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Service Areas */}
              <div>
                <label className="label">Service Areas (Pin codes or areas)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={form.areaInput}
                    onChange={e => setForm({ ...form, areaInput: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('serviceAreas', 'areaInput', form.areaInput))}
                    placeholder="e.g. Bandra, 400050"
                    className="input-field text-sm flex-1"
                  />
                  <button type="button" onClick={() => addTag('serviceAreas', 'areaInput', form.areaInput)} className="px-3 py-2 bg-gray-700 text-gray-300 rounded-xl border border-gray-600 hover:bg-gray-600 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {form.serviceAreas.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.serviceAreas.map(a => (
                      <span key={a} className="flex items-center gap-1 px-3 py-1 bg-gray-800 text-gray-300 rounded-lg text-sm border border-gray-700">
                        📍 {a}
                        <button type="button" onClick={() => removeTag('serviceAreas', a)} className="text-gray-500 hover:text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 2: DOCUMENTS ── */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="text-white font-bold text-lg mb-1">Documents & Verification</h3>
              <p className="text-gray-400 text-sm mb-4">This helps us verify your identity and speeds up the approval process.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Government ID Type</label>
                  <select name="governmentIdType" value={form.governmentIdType} onChange={handleChange} className="input-field">
                    <option value="">Select ID type</option>
                    {GOV_ID_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">ID Number</label>
                  <input name="governmentIdNumber" value={form.governmentIdNumber} onChange={handleChange}
                    placeholder="XXXX XXXX XXXX" className="input-field font-mono" />
                </div>
              </div>

              {/* Certifications */}
              <div>
                <label className="label">Certifications / Qualifications</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={form.certInput}
                    onChange={e => setForm({ ...form, certInput: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('certifications', 'certInput', form.certInput))}
                    placeholder="e.g. ITI Electrician, ISO Certified"
                    className="input-field text-sm flex-1"
                  />
                  <button type="button" onClick={() => addTag('certifications', 'certInput', form.certInput)} className="px-3 py-2 bg-amber-600/20 text-amber-400 rounded-xl border border-amber-600/20 hover:bg-amber-600/30 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {form.certifications.length > 0 && (
                  <div className="space-y-1.5">
                    {form.certifications.map(c => (
                      <div key={c} className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 text-sm text-gray-300">
                        🏆 {c}
                        <button type="button" onClick={() => removeTag('certifications', c)} className="text-gray-500 hover:text-red-400 ml-2">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Privacy note */}
              <div className="p-4 bg-blue-500/5 border border-blue-500/15 rounded-xl">
                <p className="text-blue-400 text-sm font-semibold mb-1">🔒 Privacy Notice</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Your documents are encrypted and only visible to LocalSaathi administrators for verification. They will never be shared with customers.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 3: REVIEW ── */}
          {step === 3 && (
            <div className="space-y-5">
              <h3 className="text-white font-bold text-lg mb-1">Review Your Application</h3>
              <p className="text-gray-400 text-sm mb-4">Please review the details before submitting. You can go back to edit.</p>

              <div className="space-y-3">
                {[
                  { label: 'Name', value: form.name },
                  { label: 'Email', value: form.email },
                  { label: 'Phone', value: form.phone },
                  { label: 'Location', value: `${form.city}${form.state ? ', ' + form.state : ''}` },
                  { label: 'Category', value: form.category },
                  { label: 'Experience', value: form.experience ? `${form.experience} years` : '—' },
                  { label: 'ID Type', value: form.governmentIdType || '—' },
                  { label: 'ID Number', value: form.governmentIdNumber || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-800/70">
                    <span className="text-gray-500 text-sm">{label}</span>
                    <span className="text-white text-sm font-medium text-right max-w-xs truncate">{value}</span>
                  </div>
                ))}
                {form.skills.length > 0 && (
                  <div className="flex justify-between items-start py-2.5 border-b border-gray-800/70">
                    <span className="text-gray-500 text-sm">Skills</span>
                    <span className="text-white text-sm text-right">{form.skills.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-sm text-gray-400 leading-relaxed">
                By submitting, you agree to LocalSaathi's Terms of Service and Privacy Policy. Your application will be reviewed within 24–48 hours.
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="btn-secondary flex-1"
              >
                ← Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary flex-1"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Submit Application</>
                )}
              </button>
            )}
          </div>
        </motion.div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already a provider?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ProviderSignupPage;
