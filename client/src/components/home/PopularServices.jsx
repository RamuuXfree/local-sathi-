import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SERVICES = [
  { id: 1, emoji: '⚡', title: 'Electrician', description: 'Wiring, repairs, installations', color: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/20' },
  { id: 2, emoji: '🔧', title: 'Plumber', description: 'Leak fix, pipe fitting, faucets', color: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-500/20' },
  { id: 3, emoji: '🧹', title: 'Cleaner', description: 'Home & office deep cleaning', color: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/20' },
  { id: 4, emoji: '❄️', title: 'AC Repair', description: 'Service, gas refill, PCB repair', color: 'from-sky-500/20 to-blue-500/10', border: 'border-sky-500/20' },
  { id: 5, emoji: '🪚', title: 'Carpenter', description: 'Furniture repair, custom work', color: 'from-orange-500/20 to-amber-500/10', border: 'border-orange-500/20' },
  { id: 6, emoji: '🎨', title: 'Painter', description: 'Interior & exterior painting', color: 'from-pink-500/20 to-rose-500/10', border: 'border-pink-500/20' },
  { id: 7, emoji: '🔌', title: 'Appliance Repair', description: 'Washing machine, fridge, microwave', color: 'from-violet-500/20 to-purple-500/10', border: 'border-violet-500/20' },
  { id: 8, emoji: '📱', title: 'More Services', description: 'Explore all service categories', color: 'from-primary-500/20 to-violet-500/10', border: 'border-primary-500/20' },
];

const PopularServices = () => (
  <section className="py-20 bg-gray-950">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <h2 className="section-title">Popular <span className="gradient-text">Services</span></h2>
        <p className="section-subtitle">Choose from our wide range of professional home services</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {SERVICES.map((service, i) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Link
              to={`/services?category=${service.title}`}
              className={`block glass-card-hover p-5 text-center bg-gradient-to-br ${service.color} border ${service.border} group`}
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{service.emoji}</div>
              <h3 className="text-white font-semibold text-sm mb-1">{service.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{service.description}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
export default PopularServices;
