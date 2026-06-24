import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, MapPin, Star, ArrowRight } from 'lucide-react';

const CATEGORY_EMOJIS = {
  Electrician: '⚡',
  Plumber: '🔧',
  Cleaner: '🧹',
  'AC Repair': '❄️',
  Carpenter: '🪚',
  Painter: '🎨',
  'Appliance Repair': '🔌',
  Other: '🛠️',
};

const ServiceCard = ({ service, index = 0 }) => {
  const emoji = CATEGORY_EMOJIS[service.category] || '🛠️';
  const provider = service.providerId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="glass-card-hover group overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-600/5 rounded-full translate-x-8 -translate-y-8" />
        <div className="text-4xl mb-3">{emoji}</div>
        <span className="badge bg-primary-500/10 text-primary-400 border border-primary-500/20 text-xs">
          {service.category}
        </span>
        <h3 className="text-white font-semibold mt-2 text-lg leading-tight group-hover:text-primary-400 transition-colors">
          {service.title}
        </h3>
      </div>

      {/* Body */}
      <div className="p-5">
        <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
          {service.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {service.duration}
          </span>
          {provider?.city && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {provider.city}
            </span>
          )}
          {provider?.rating?.average > 0 && (
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {provider.rating.average}
            </span>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-white">₹{service.price.toLocaleString('en-IN')}</span>
            <span className="text-gray-500 text-xs ml-1">{service.priceUnit}</span>
          </div>
          <Link
            to={`/services/${service._id}`}
            className="flex items-center gap-1.5 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors group/btn"
          >
            Book Now
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
export default ServiceCard;
