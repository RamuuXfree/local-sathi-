require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const connectDB = require('./config/db');
const socketConfig = require('./config/socket');
const errorHandler = require('./middleware/errorHandler');
const { initTwilio } = require('./services/twilioService');
const { initWhatsApp } = require('./services/whatsappService');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const providerRoutes = require('./routes/providers');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const applicationRoutes = require('./routes/applications');

const app = express();
const httpServer = http.createServer(app);

// -----------------------------
// Debug env check
// -----------------------------
console.log('\n========== ENV CHECK ==========');
console.log('PORT:', process.env.PORT || 5000);
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('CLIENT_URL:', process.env.CLIENT_URL || 'http://localhost:5174');
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);

if (process.env.MONGO_URI) {
  const safeMongoUri = process.env.MONGO_URI.replace(/\/\/(.*?):(.*?)@/, '//***:***@');
  console.log('MONGO_URI:', safeMongoUri);
} else {
  console.log('❌ MONGO_URI not found in server/.env');
}
console.log('================================\n');

// -----------------------------
// Connect Database
// -----------------------------
connectDB();

// -----------------------------
// Initialize services
// -----------------------------
initTwilio();
initWhatsApp();

// -----------------------------
// Initialize Socket.io
// -----------------------------
socketConfig.init(httpServer);

// -----------------------------
// Middleware
// -----------------------------
app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman / server requests
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// -----------------------------
// API Routes
// -----------------------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/applications', applicationRoutes);

// -----------------------------
// Health check
// -----------------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LocalSaathi API is running 🚀',
    timestamp: new Date(),
    env: process.env.NODE_ENV || 'development',
  });
});

// -----------------------------
// 404 handler
// -----------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// -----------------------------
// Global error handler
// -----------------------------
app.use(errorHandler);

// -----------------------------
// Start server
// -----------------------------
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 LocalSaathi Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Allowed CORS origins: ${allowedOrigins.join(', ')}\n`);
});