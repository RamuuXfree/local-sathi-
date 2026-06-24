const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Provider = require('../models/Provider');

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to find user in User collection first, then Provider
    let currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      currentUser = await Provider.findById(decoded.id);
    }

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

module.exports = { protect };
