const Provider = require('../models/Provider');

/**
 * Haversine formula — returns distance in km between two GPS coordinates
 */
const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Find providers near a customer location for a given service category.
 * Returns sorted array of { provider, distance } — nearest first.
 */
const findNearbyProviders = async (lat, lng, category, maxCount = 5) => {
  const candidates = await Provider.find({
    category,
    isApproved: true,
    isOnline: true,
    isAvailable: true,
    'location.lat': { $ne: null },
    'location.lng': { $ne: null },
  }).select('name phone location serviceRadius _id');

  if (!candidates.length) return [];

  return candidates
    .map((p) => ({
      provider: p,
      distance: parseFloat(haversine(lat, lng, p.location.lat, p.location.lng).toFixed(2)),
    }))
    .filter(({ provider, distance }) => distance <= (provider.serviceRadius || 10))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxCount);
};

/**
 * Get all approved providers with location set (for admin map).
 */
const getAllProviderLocations = async () => {
  return Provider.find({
    isApproved: true,
    'location.lat': { $ne: null },
    'location.lng': { $ne: null },
  }).select('name phone category city isOnline isAvailable location rating completedJobs avatar serviceRadius');
};

module.exports = { haversine, findNearbyProviders, getAllProviderLocations };
