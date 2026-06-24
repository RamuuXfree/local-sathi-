const User = require('../models/User');
const Provider = require('../models/Provider');
const { sendTokenResponse } = require('../utils/jwt');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, phone, password, address, role: 'user' });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Register provider (submit application)
// @route   POST /api/auth/provider/register
// @access  Public
const registerProvider = async (req, res, next) => {
  try {
    const {
      name, email, phone, password, category, experience, city, state,
      skills, pricing, bio, governmentIdType, governmentIdNumber,
      certifications, serviceAreas, yearsInBusiness,
    } = req.body;

    const existingProvider = await Provider.findOne({ email });
    if (existingProvider) {
      return res.status(400).json({ success: false, message: 'Email already registered as a provider' });
    }

    await Provider.create({
      name, email, phone, password, category,
      experience: experience || 0,
      city, state: state || '',
      skills: skills || [],
      pricing: pricing || {},
      bio: bio || '',
      role: 'provider',
      applicationStatus: 'pending',
      governmentIdType: governmentIdType || '',
      governmentIdNumber: governmentIdNumber || '',
      certifications: certifications || [],
      serviceAreas: serviceAreas || [],
      yearsInBusiness: yearsInBusiness || 0,
      submittedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted! Awaiting admin approval.',
      applicationStatus: 'pending',
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Login user/provider/admin
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    let user = null;

    if (role === 'provider') {
      user = await Provider.findOne({ email }).select('+password');
    } else {
      // Covers 'user' and 'admin'
      user = await User.findOne({ email }).select('+password');
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check provider approval
    if (user.role === 'provider' && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your provider account is pending approval by admin.',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

module.exports = { registerUser, registerProvider, login, getMe };
