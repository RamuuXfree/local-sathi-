import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, CheckCircle, Star } from 'lucide-react';

const CATEGORY_EMOJIS = {
  Electrician: '⚡', Plumber: '🔧', Cleaner: '🧹', 'AC Repair': '❄️',
  Carpenter: '🪚', Painter: '🎨', 'Appliance Repair': '🔌', Other: '🛠️',
};

const ProviderCard = ({ provider, index = 0 }) => {
  const emoji = CATEGORY_EMOJIS[provider.category] || '🛠️';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="glass-card-hover p-5 flex flex-col"
    >
      {/* Avatar & Name */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-violet-700 flex items-center justify-center text-2xl flex-shrink-0 shadow-glow">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-white font-semibold truncate">{provider.name}</h3>
            {provider.isApproved && (
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            )}
          </div>
          <p className="text-primary-400 text-sm font-medium">{provider.category}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-amber-400 text-sm font-medium">
              {provider.rating?.average?.toFixed(1) || '0.0'}
            </span>
            <span className="text-gray-500 text-xs">({provider.rating?.count || 0} reviews)</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <MapPin className="w-4 h-4 text-gray-600" />
          {provider.city}, {provider.state}
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Briefcase className="w-4 h-4 text-gray-600" />
          {provider.experience} years experience
        </div>
      </div>

      {/* Skills */}
      {provider.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {provider.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded-lg text-xs border border-gray-700">
              {skill}
            </span>
          ))}
          {provider.skills.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-800 text-gray-500 rounded-lg text-xs border border-gray-700">
              +{provider.skills.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Price & CTA */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-800">
        <div>
          <span className="text-white font-bold text-lg">₹{provider.pricing?.basePrice?.toLocaleString('en-IN') || '0'}</span>
          <span className="text-gray-500 text-xs ml-1">{provider.pricing?.priceUnit}</span>
        </div>
        <Link
          to={`/services?category=${provider.category}`}
          className="btn-primary py-2 px-4 text-sm"
        >
          View Services
        </Link>
      </div>
    </motion.div>
  );
};
export default ProviderCard;
