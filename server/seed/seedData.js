require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Provider = require('../models/Provider');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');
};

const providers = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh@localsaathi.com',
    phone: '+919876543210',
    password: 'Provider@123',
    category: 'Electrician',
    experience: 8,
    city: 'Mumbai',
    state: 'Maharashtra',
    skills: ['Wiring', 'Panel Repair', 'Inverter Installation', 'Fan Installation'],
    pricing: { basePrice: 500, priceUnit: 'per visit' },
    bio: 'Certified electrician with 8+ years of experience in residential and commercial wiring.',
    isApproved: true,
    rating: { average: 4.8, count: 124 },
    completedJobs: 124,
    totalEarnings: 62000,
  },
  {
    name: 'Suresh Patel',
    email: 'suresh@localsaathi.com',
    phone: '+919876543211',
    password: 'Provider@123',
    category: 'Plumber',
    experience: 12,
    city: 'Pune',
    state: 'Maharashtra',
    skills: ['Pipe Fitting', 'Leak Repair', 'Bathroom Fittings', 'Water Heater'],
    pricing: { basePrice: 400, priceUnit: 'per visit' },
    bio: 'Expert plumber handling all types of plumbing work from leak repairs to full bathroom setups.',
    isApproved: true,
    rating: { average: 4.6, count: 89 },
    completedJobs: 89,
    totalEarnings: 35600,
  },
  {
    name: 'Priya Sharma',
    email: 'priya@localsaathi.com',
    phone: '+919876543212',
    password: 'Provider@123',
    category: 'Cleaner',
    experience: 5,
    city: 'Bengaluru',
    state: 'Karnataka',
    skills: ['Deep Cleaning', 'Sofa Cleaning', 'Kitchen Cleaning', 'Post-Construction Cleaning'],
    pricing: { basePrice: 800, priceUnit: 'per session' },
    bio: 'Professional cleaning service with eco-friendly products and systematic deep cleaning.',
    isApproved: true,
    rating: { average: 4.9, count: 201 },
    completedJobs: 201,
    totalEarnings: 160800,
  },
  {
    name: 'Amit Verma',
    email: 'amit@localsaathi.com',
    phone: '+919876543213',
    password: 'Provider@123',
    category: 'AC Repair',
    experience: 10,
    city: 'Delhi',
    state: 'Delhi',
    skills: ['AC Installation', 'Gas Refill', 'PCB Repair', 'Servicing', 'Split AC'],
    pricing: { basePrice: 600, priceUnit: 'per visit' },
    bio: 'Certified AC technician. Expert in all brands — Daikin, Voltas, Blue Star, LG, Samsung.',
    isApproved: true,
    rating: { average: 4.7, count: 156 },
    completedJobs: 156,
    totalEarnings: 93600,
  },
  {
    name: 'Mohit Singh',
    email: 'mohit@localsaathi.com',
    phone: '+919876543214',
    password: 'Provider@123',
    category: 'Carpenter',
    experience: 15,
    city: 'Jaipur',
    state: 'Rajasthan',
    skills: ['Furniture Repair', 'Custom Furniture', 'Door Fitting', 'Wardrobe Installation'],
    pricing: { basePrice: 700, priceUnit: 'per day' },
    bio: 'Master carpenter with 15 years of experience in custom furniture and woodwork.',
    isApproved: true,
    rating: { average: 4.5, count: 78 },
    completedJobs: 78,
    totalEarnings: 54600,
  },
  {
    name: 'Deepak Rathi',
    email: 'deepak@localsaathi.com',
    phone: '+919876543215',
    password: 'Provider@123',
    category: 'Painter',
    experience: 7,
    city: 'Hyderabad',
    state: 'Telangana',
    skills: ['Interior Painting', 'Exterior Painting', 'Texture Paint', 'Waterproofing'],
    pricing: { basePrice: 150, priceUnit: 'per sq ft' },
    bio: 'Professional painter with expertise in interior, exterior, and decorative painting.',
    isApproved: true,
    rating: { average: 4.6, count: 95 },
    completedJobs: 95,
    totalEarnings: 142500,
  },
  {
    name: 'Vikram Joshi',
    email: 'vikram@localsaathi.com',
    phone: '+919876543216',
    password: 'Provider@123',
    category: 'Appliance Repair',
    experience: 9,
    city: 'Chennai',
    state: 'Tamil Nadu',
    skills: ['Washing Machine', 'Refrigerator', 'Microwave', 'Dishwasher', 'TV Repair'],
    pricing: { basePrice: 450, priceUnit: 'per visit' },
    bio: 'Expert in repairing all home appliances. Same-day repair service available.',
    isApproved: true,
    rating: { average: 4.7, count: 132 },
    completedJobs: 132,
    totalEarnings: 59400,
  },
  {
    name: 'Neha Gupta',
    email: 'neha@localsaathi.com',
    phone: '+919876543217',
    password: 'Provider@123',
    category: 'Cleaner',
    experience: 3,
    city: 'Mumbai',
    state: 'Maharashtra',
    skills: ['Home Cleaning', 'Office Cleaning', 'Carpet Cleaning', 'Window Cleaning'],
    pricing: { basePrice: 600, priceUnit: 'per session' },
    bio: 'Dedicated cleaning professional providing reliable and thorough cleaning services.',
    isApproved: false,
    rating: { average: 0, count: 0 },
    completedJobs: 0,
    totalEarnings: 0,
  },
];

const services = [
  {
    title: 'Full Home Electrical Inspection & Repair',
    category: 'Electrician',
    description: 'Complete inspection of your home electrical system, identify faults, and repair wiring issues. Includes switchboard check, wiring inspection, and safety testing.',
    price: 799,
    priceUnit: 'per visit',
    duration: '2-3 hours',
    tags: ['wiring', 'inspection', 'repair', 'residential'],
  },
  {
    title: 'Fan Installation & Repair',
    category: 'Electrician',
    description: 'Professional ceiling and exhaust fan installation with proper wiring and safety checks.',
    price: 399,
    priceUnit: 'per fan',
    duration: '1 hour',
    tags: ['fan', 'installation', 'repair'],
  },
  {
    title: 'Bathroom Plumbing & Leak Fix',
    category: 'Plumber',
    description: 'Complete bathroom plumbing service including tap replacement, pipeline repair, and leak detection.',
    price: 599,
    priceUnit: 'per visit',
    duration: '2-4 hours',
    tags: ['bathroom', 'plumbing', 'leak', 'tap'],
  },
  {
    title: 'Kitchen Pipe & Drain Cleaning',
    category: 'Plumber',
    description: 'Professional kitchen pipe cleaning and drain unclogging service using modern tools.',
    price: 499,
    priceUnit: 'per visit',
    duration: '1-2 hours',
    tags: ['kitchen', 'drain', 'cleaning', 'pipes'],
  },
  {
    title: 'Full Home Deep Cleaning',
    category: 'Cleaner',
    description: 'Complete deep cleaning of your home including kitchen, bathrooms, bedrooms, and living areas with eco-friendly products.',
    price: 1999,
    priceUnit: 'per session',
    duration: '4-6 hours',
    tags: ['deep cleaning', 'home', 'eco-friendly'],
  },
  {
    title: 'AC Service & Gas Refill',
    category: 'AC Repair',
    description: 'Complete AC servicing with filter cleaning, gas refill (if needed), coil cleaning, and performance check.',
    price: 799,
    priceUnit: 'per unit',
    duration: '1-2 hours',
    tags: ['AC', 'service', 'gas refill', 'cleaning'],
  },
  {
    title: 'Wardrobe & Furniture Repair',
    category: 'Carpenter',
    description: 'Professional furniture repair, hinge replacement, drawer fixing, and wardrobe restoration.',
    price: 899,
    priceUnit: 'per day',
    duration: '3-8 hours',
    tags: ['furniture', 'wardrobe', 'repair', 'carpentry'],
  },
  {
    title: '2BHK Interior Painting',
    category: 'Painter',
    description: 'Premium interior painting for a 2BHK apartment with wall preparation, primer, and 2 coats of paint.',
    price: 12000,
    priceUnit: 'flat',
    duration: '3-4 days',
    tags: ['painting', 'interior', '2BHK', 'apartment'],
  },
  {
    title: 'Washing Machine Repair',
    category: 'Appliance Repair',
    description: 'Expert diagnosis and repair of all washing machine issues — drum problems, motor issues, PCB repair, and drainage problems.',
    price: 699,
    priceUnit: 'per visit',
    duration: '1-3 hours',
    tags: ['washing machine', 'repair', 'appliance'],
  },
  {
    title: 'Refrigerator Repair & Gas Refill',
    category: 'Appliance Repair',
    description: 'Complete refrigerator repair service including compressor check, gas refill, thermostat repair, and cooling issue fix.',
    price: 799,
    priceUnit: 'per visit',
    duration: '1-3 hours',
    tags: ['refrigerator', 'fridge', 'repair', 'gas'],
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Provider.deleteMany({});
    await Service.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'LocalSaathi Admin',
      email: process.env.ADMIN_EMAIL || 'admin@localsaathi.com',
      phone: '+919000000000',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin',
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // Create sample user
    const sampleUser = await User.create({
      name: 'Anjali Mehta',
      email: 'anjali@example.com',
      phone: '+919812345678',
      password: 'User@123',
      role: 'user',
      address: { street: '42 MG Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
    });
    console.log(`✅ Sample user created: ${sampleUser.email}`);

    // Create providers
    const createdProviders = [];
    for (const providerData of providers) {
      const provider = await Provider.create(providerData);
      createdProviders.push(provider);
      console.log(`✅ Provider created: ${provider.name} (${provider.category})`);
    }

    // Create services linked to providers
    const serviceMapping = [
      [0, 0], [0, 1],   // Electrician services -> Rajesh
      [1, 2], [1, 3],   // Plumber -> Suresh
      [2, 4],           // Cleaner -> Priya
      [3, 5],           // AC Repair -> Amit
      [4, 6],           // Carpenter -> Mohit
      [5, 7],           // Painter -> Deepak
      [6, 8], [6, 9],   // Appliance -> Vikram
    ];

    const createdServices = [];
    for (const [providerIdx, serviceIdx] of serviceMapping) {
      const provider = createdProviders[providerIdx];
      const serviceData = { ...services[serviceIdx], providerId: provider._id };
      const service = await Service.create(serviceData);
      createdServices.push(service);
      await Provider.findByIdAndUpdate(provider._id, {
        $push: { services: service._id },
      });
    }
    console.log(`✅ ${createdServices.length} services created`);

    // Create sample bookings
    const booking1 = await Booking.create({
      userId: sampleUser._id,
      providerId: createdProviders[0]._id,
      serviceId: createdServices[0]._id,
      bookingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      bookingTime: '10:00 AM',
      address: { street: '42 MG Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
      notes: 'Please bring all necessary tools',
      amount: 799,
      status: 'accepted',
      statusHistory: [
        { status: 'pending', note: 'Booking created' },
        { status: 'accepted', note: 'Provider accepted the request' },
      ],
    });

    const booking2 = await Booking.create({
      userId: sampleUser._id,
      providerId: createdProviders[2]._id,
      serviceId: createdServices[4]._id,
      bookingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      bookingTime: '09:00 AM',
      address: { street: '42 MG Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
      notes: 'Focus on kitchen and bathrooms',
      amount: 1999,
      status: 'completed',
      statusHistory: [
        { status: 'pending', note: 'Booking created' },
        { status: 'accepted', note: 'Provider accepted' },
        { status: 'completed', note: 'Service completed successfully' },
      ],
    });

    await User.findByIdAndUpdate(sampleUser._id, {
      $push: { bookings: { $each: [booking1._id, booking2._id] } },
    });

    // Create review for completed booking
    await Review.create({
      userId: sampleUser._id,
      providerId: createdProviders[2]._id,
      bookingId: booking2._id,
      rating: 5,
      comment: 'Priya did an excellent job! The house was sparkling clean. Very professional and thorough. Highly recommended!',
    });

    console.log(`✅ Sample bookings and reviews created`);
    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📝 Login Credentials:');
    console.log('   Admin:    admin@localsaathi.com / Admin@123');
    console.log('   User:     anjali@example.com / User@123');
    console.log('   Provider: rajesh@localsaathi.com / Provider@123');
    console.log('   Provider: priya@localsaathi.com / Provider@123');
    console.log('\n⚠️  Note: Providers login with role="provider" selected\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
