import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Phone, ChevronRight } from 'lucide-react';
import Badge from './Badge';

const BookingCard = ({ booking, onAction, actions = [] }) => {
  const service = booking.serviceId;
  const provider = booking.providerId;
  const user = booking.userId;
  const date = new Date(booking.bookingDate).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 hover:border-gray-700 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">
            {service?.title || 'Service'}
          </h3>
          <p className="text-gray-400 text-sm">{service?.category}</p>
        </div>
        <Badge label={booking.status} variant={booking.status} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Calendar className="w-4 h-4 text-primary-400" />
          {date}
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Clock className="w-4 h-4 text-primary-400" />
          {booking.bookingTime}
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm sm:col-span-2">
          <MapPin className="w-4 h-4 text-primary-400" />
          {booking.address?.street}, {booking.address?.city}
        </div>
      </div>

      {provider && (
        <div className="flex items-center gap-2 py-2.5 px-3 bg-gray-800/60 rounded-xl mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-violet-700 flex items-center justify-center text-xs font-bold text-white">
            {provider.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{provider.name}</p>
            <p className="text-xs text-gray-500">{provider.city}</p>
          </div>
          {provider.phone && (
            <a href={`tel:${provider.phone}`} className="p-1.5 rounded-lg bg-primary-600/10 text-primary-400 hover:bg-primary-600/20 transition-colors">
              <Phone className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {user && (
        <div className="flex items-center gap-2 py-2.5 px-3 bg-gray-800/60 rounded-xl mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-xs font-bold text-white">
            {user.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-500">{user.phone}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-white font-bold text-lg">₹{booking.amount?.toLocaleString('en-IN')}</span>
        {actions.length > 0 && (
          <div className="flex gap-2">
            {actions.map((action) => (
              <button
                key={action.label}
                onClick={() => onAction && onAction(action.type, booking)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${action.className}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
export default BookingCard;
