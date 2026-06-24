const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const providerSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    phone: { type: String, required: [true, 'Phone number is required'] },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    role: { type: String, default: 'provider' },
    category: {
      type: String,
      required: [true, 'Service category is required'],
      enum: ['Electrician', 'Plumber', 'Cleaner', 'AC Repair', 'Carpenter', 'Painter', 'Appliance Repair', 'Other'],
    },
    experience: { type: Number, default: 0 },
    city: { type: String, required: [true, 'City is required'] },
    state: { type: String, default: '' },
    skills: [String],
    pricing: {
      basePrice: { type: Number, default: 0 },
      priceUnit: { type: String, default: 'per visit' },
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    idProof: { type: String, default: '' },
    totalEarnings: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],

    // ─── Location & Availability (for matching) ─────────────────────────────
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      updatedAt: { type: Date },
    },
    serviceRadius: { type: Number, default: 10 }, // km
    isOnline: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },

    // ─── Application Tracking ────────────────────────────────────────────────
    applicationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'hold'],
      default: 'pending',
    },
    applicationDocuments: [
      {
        name: { type: String },
        url: { type: String },
        type: { type: String, enum: ['id_proof', 'certificate', 'photo', 'other'], default: 'other' },
      },
    ],
    governmentIdType: {
      type: String,
      enum: ['Aadhar', 'PAN', 'Passport', 'Driving License', 'Voter ID', 'Other', ''],
      default: '',
    },
    governmentIdNumber: { type: String, default: '' },
    workPhotos: [String],
    certifications: [String],
    serviceAreas: [String],
    yearsInBusiness: { type: Number, default: 0 },
    adminNotes: { type: String, default: '' },
    rejectionReason: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

providerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

providerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Provider', providerSchema);
