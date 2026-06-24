import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Users, Briefcase, CalendarCheck, Bell, FileText,
  MapPin, RefreshCw, Wifi, WifiOff, Search, Filter, Navigation
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { getProvidersForMap } from '../../api/providers';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const sidebarLinks = [
  { label: 'Overview', href: '/admin/dashboard', icon: BarChart3 },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Providers', href: '/admin/providers', icon: Briefcase },
  { label: 'Applications', href: '/admin/applications', icon: FileText },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
  { label: 'Provider Map', href: '/admin/map', icon: MapPin },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
];

const CATEGORY_COLORS = {
  Electrician: '#f59e0b',
  Plumber: '#3b82f6',
  Cleaner: '#10b981',
  'AC Repair': '#06b6d4',
  Carpenter: '#f97316',
  Painter: '#8b5cf6',
  'Appliance Repair': '#6b7280',
  Other: '#ec4899',
};

const CATEGORY_EMOJI = {
  Electrician: '⚡', Plumber: '🔧', Cleaner: '🧹', 'AC Repair': '❄️',
  Carpenter: '🪚', Painter: '🎨', 'Appliance Repair': '🔌', Other: '🛠️',
};

// Load Leaflet from CDN dynamically
const loadLeaflet = () =>
  new Promise((resolve) => {
    if (window.L) { resolve(window.L); return; }

    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve(window.L);
    document.head.appendChild(script);
  });

const ProviderMap = () => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef({});
  const { socket } = useSocket();

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | online | offline
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getProvidersForMap();
      setProviders(data.providers || []);
    } catch (_) {
      toast.error('Failed to load provider locations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  // Build/rebuild Leaflet map
  useEffect(() => {
    let L;

    const initMap = async () => {
      L = await loadLeaflet();
      if (!mapRef.current || leafletMapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [20.5937, 78.9629], // India center
        zoom: 5,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      leafletMapRef.current = map;
    };

    initMap();
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markersRef.current = {};
      }
    };
  }, []);

  // Update markers when providers change
  useEffect(() => {
    if (!leafletMapRef.current || !window.L) return;
    const L = window.L;
    const map = leafletMapRef.current;

    // Remove old markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    const filtered = providers.filter(p => {
      if (filter === 'online' && !p.isOnline) return false;
      if (filter === 'offline' && p.isOnline) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.city.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    if (filtered.length === 0) return;

    const bounds = [];

    filtered.forEach(p => {
      const color = p.isOnline ? CATEGORY_COLORS[p.category] || '#6366f1' : '#4b5563';
      const emoji = CATEGORY_EMOJI[p.category] || '🛠️';

      const icon = L.divIcon({
        html: `
          <div style="
            width: 36px; height: 36px;
            background: ${color};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            display: flex; align-items: center; justify-content: center;
          ">
            <span style="transform: rotate(45deg); font-size: 16px;">${emoji}</span>
          </div>
          ${p.isOnline ? `<div style="
            position: absolute; top: -4px; right: -4px;
            width: 10px; height: 10px;
            background: #10b981; border-radius: 50%;
            border: 2px solid #111827;
          "></div>` : ''}
        `,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([p.location.lat, p.location.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: system-ui; min-width: 180px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 20px;">${emoji}</span>
              <div>
                <p style="font-weight: bold; margin: 0; color: #111;">${p.name}</p>
                <p style="margin: 0; color: #666; font-size: 12px;">${p.category}</p>
              </div>
            </div>
            <div style="border-top: 1px solid #eee; padding-top: 8px; font-size: 12px; color: #555;">
              <p style="margin: 2px 0;">📍 ${p.city}</p>
              <p style="margin: 2px 0;">⭐ ${p.rating?.average || 0} · ${p.completedJobs || 0} jobs</p>
              <p style="margin: 2px 0;">📏 Radius: ${p.serviceRadius || 10} km</p>
              <p style="margin: 4px 0; font-weight: bold; color: ${p.isOnline ? '#10b981' : '#ef4444'};">
                ${p.isOnline ? '🟢 Online' : '🔴 Offline'}
              </p>
            </div>
          </div>
        `);

      markersRef.current[p._id] = marker;
      bounds.push([p.location.lat, p.location.lng]);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [providers, filter, categoryFilter, search]);

  // Socket: real-time provider location updates
  useEffect(() => {
    if (!socket) return;

    socket.emit('join:adminMap');

    socket.on('provider:moved', ({ providerId, lat, lng }) => {
      const marker = markersRef.current[providerId];
      if (marker && window.L) {
        marker.setLatLng([lat, lng]);
      }
    });

    socket.on('provider:statusChange', ({ providerId, isOnline }) => {
      setProviders(prev =>
        prev.map(p => p._id === providerId ? { ...p, isOnline } : p)
      );
    });

    return () => {
      socket.off('provider:moved');
      socket.off('provider:statusChange');
    };
  }, [socket]);

  const onlineCount = providers.filter(p => p.isOnline).length;
  const categories = [...new Set(providers.map(p => p.category))];

  const filteredProviders = providers.filter(p => {
    if (filter === 'online' && !p.isOnline) return false;
    if (filter === 'offline' && p.isOnline) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout links={sidebarLinks} title="Provider Map">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Live Provider Map</h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {onlineCount} online of {providers.length} total providers
            </p>
          </div>
          <button
            onClick={fetchProviders}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-gray-300 rounded-xl border border-gray-700 hover:bg-gray-700 hover:text-white transition-all text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Providers', value: providers.length, icon: Briefcase, color: 'text-primary-400', bg: 'bg-primary-500/10' },
            { label: 'Online Now', value: onlineCount, icon: Wifi, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Offline', value: providers.length - onlineCount, icon: WifiOff, color: 'text-gray-400', bg: 'bg-gray-800' },
            { label: 'Showing', value: filteredProviders.length, icon: MapPin, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`glass-card p-4 flex items-center gap-3 ${bg}`}>
              <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
              <div>
                <p className="text-white font-bold text-lg leading-none">{value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search provider..."
              className="input-field pl-10 py-2 text-sm w-48"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'online', 'offline'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                  filter === f
                    ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {f === 'online' && '🟢 '}{f === 'offline' && '🔴 '}{f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="input-field py-2 text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>)}
          </select>
        </div>

        {/* Map + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Leaflet Map */}
          <div className="lg:col-span-3">
            <div className="glass-card overflow-hidden" style={{ height: '520px' }}>
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Loading map...</p>
                  </div>
                </div>
              ) : (
                <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
              )}
            </div>
          </div>

          {/* Provider List Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card overflow-hidden" style={{ height: '520px' }}>
              <div className="p-3 border-b border-gray-800">
                <p className="text-white font-semibold text-sm">Providers ({filteredProviders.length})</p>
              </div>
              <div className="overflow-y-auto h-full pb-12">
                {filteredProviders.map(p => (
                  <button
                    key={p._id}
                    onClick={() => {
                      setSelected(p);
                      if (leafletMapRef.current && p.location?.lat) {
                        leafletMapRef.current.setView([p.location.lat, p.location.lng], 14);
                        markersRef.current[p._id]?.openPopup();
                      }
                    }}
                    className={`w-full p-3 text-left border-b border-gray-800/50 hover:bg-gray-800/60 transition-colors ${
                      selected?._id === p._id ? 'bg-gray-800/80' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                        style={{ background: (CATEGORY_COLORS[p.category] || '#6366f1') + '33' }}
                      >
                        {CATEGORY_EMOJI[p.category] || '🛠️'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-white text-xs font-semibold truncate">{p.name}</p>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.isOnline ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                        </div>
                        <p className="text-gray-500 text-xs truncate">{p.category} • {p.city}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="glass-card p-4">
          <p className="text-gray-400 text-xs mb-3 font-semibold">MAP LEGEND</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-3 h-3 rounded-full bg-emerald-400" /> Online Provider
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-3 h-3 rounded-full bg-gray-600" /> Offline Provider
            </div>
            {categories.slice(0, 5).map(c => (
              <div key={c} className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-3 h-3 rounded-full" style={{ background: CATEGORY_COLORS[c] }} />
                {c}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default ProviderMap;
