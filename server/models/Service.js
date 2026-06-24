const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Electrician',
        'Plumber',
        'Cleaner',
        'AC Repair',
        'Carpenter',
        'Painter',
        'Appliance Repair',
        'Other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    priceUnit: {
      type: String,
      default: 'per visit',
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    duration: {
      type: String,
      default: '1-2 hours',
    },
    images: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
