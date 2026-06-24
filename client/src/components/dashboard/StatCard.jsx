import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color = 'primary', change, index = 0 }) => {
  const colors = {
    primary: { bg: 'from-primary-600/20 to-primary-700/10', icon: 'bg-primary-600/20 text-primary-400', text: 'text-primary-400' },
    violet: { bg: 'from-violet-600/20 to-violet-700/10', icon: 'bg-violet-600/20 text-violet-400', text: 'text-violet-400' },
    emerald: { bg: 'from-emerald-600/20 to-emerald-700/10', icon: 'bg-emerald-600/20 text-emerald-400', text: 'text-emerald-400' },
    amber: { bg: 'from-amber-600/20 to-amber-700/10', icon: 'bg-amber-600/20 text-amber-400', text: 'text-amber-400' },
    red: { bg: 'from-red-600/20 to-red-700/10', icon: 'bg-red-600/20 text-red-400', text: 'text-red-400' },
    blue: { bg: 'from-blue-600/20 to-blue-700/10', icon: 'bg-blue-600/20 text-blue-400', text: 'text-blue-400' },
  };
  const c = colors[color] || colors.primary;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`glass-card p-6 bg-gradient-to-br ${c.bg} hover:scale-[1.02] transition-all duration-300`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${c.icon} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
            change >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
      </div>
    </motion.div>
  );
};
export default StatCard;
