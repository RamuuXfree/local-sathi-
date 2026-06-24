let io;

module.exports = {
  init: (httpServer) => {
    const { Server } = require('socket.io');
    io = new Server(httpServer, {
      cors: {
        origin: [
          process.env.CLIENT_URL || 'http://localhost:5173',
          'http://localhost:5173',
          'http://localhost:5174',
          'http://localhost:5175',
          'http://localhost:5176',
        ],
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    io.on('connection', (socket) => {
      console.log(`⚡ Socket connected: ${socket.id}`);

      // ── Join personal user/provider room ──────────────────────────────────
      socket.on('join', (userId) => {
        socket.join(userId);
        socket.userId = userId;
        console.log(`👤 ${userId} joined personal room`);
      });

      // ── Provider goes ONLINE ──────────────────────────────────────────────
      socket.on('provider:online', async (providerId) => {
        socket.join(providerId);
        socket.providerId = providerId;
        console.log(`🟢 Provider ${providerId} is ONLINE`);
        try {
          const Provider = require('../models/Provider');
          await Provider.findByIdAndUpdate(providerId, { isOnline: true, isAvailable: true });
        } catch (_) {}
        io.emit('provider:statusChange', { providerId, isOnline: true });
      });

      // ── Provider goes OFFLINE ─────────────────────────────────────────────
      socket.on('provider:offline', async (providerId) => {
        console.log(`🔴 Provider ${providerId} is OFFLINE`);
        try {
          const Provider = require('../models/Provider');
          await Provider.findByIdAndUpdate(providerId, { isOnline: false });
        } catch (_) {}
        io.emit('provider:statusChange', { providerId, isOnline: false });
      });

      // ── Provider location update (GPS) ────────────────────────────────────
      socket.on('provider:locationUpdate', async ({ providerId, lat, lng }) => {
        try {
          const Provider = require('../models/Provider');
          await Provider.findByIdAndUpdate(providerId, {
            'location.lat': lat,
            'location.lng': lng,
            'location.updatedAt': new Date(),
          });
          // Broadcast updated position to admin map watchers
          io.to('admin:map').emit('provider:moved', { providerId, lat, lng, timestamp: Date.now() });
        } catch (_) {}
      });

      // ── Admin joins live map room ─────────────────────────────────────────
      socket.on('join:adminMap', () => {
        socket.join('admin:map');
        console.log(`🗺️ Admin joined map room`);
      });

      // ── Disconnect: auto-offline provider ────────────────────────────────
      socket.on('disconnect', async () => {
        if (socket.providerId) {
          try {
            const Provider = require('../models/Provider');
            await Provider.findByIdAndUpdate(socket.providerId, { isOnline: false });
          } catch (_) {}
          io.emit('provider:statusChange', { providerId: socket.providerId, isOnline: false });
          console.log(`🔴 Provider ${socket.providerId} went offline (disconnected)`);
        }
        console.log(`❌ Socket disconnected: ${socket.id}`);
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
  },
};
