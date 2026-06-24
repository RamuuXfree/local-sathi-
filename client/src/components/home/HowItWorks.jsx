import { motion } from 'framer-motion';
import { Search, UserCheck, CalendarCheck, Star } from 'lucide-react';

const steps = [
  { icon: Search, step: '01', title: 'Browse & Search', description: 'Search for the service you need. Filter by category, location, and availability.', color: 'text-primary-400 bg-primary-500/10' },
  { icon: UserCheck, step: '02', title: 'Choose a Provider', description: 'View verified provider profiles, ratings, reviews, and pricing before booking.', color: 'text-violet-400 bg-violet-500/10' },
  { icon: CalendarCheck, step: '03', title: 'Book a Slot', description: 'Pick a date and time that suits you. Fill in your address and any special notes.', color: 'text-emerald-400 bg-emerald-500/10' },
  { icon: Star, step: '04', title: 'Rate & Review', description: 'After the service, rate your experience and help others make informed decisions.', color: 'text-amber-400 bg-amber-500/10' },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-20 bg-gray-900/50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="section-title">How It <span className="gradient-text">Works</span></h2>
        <p className="section-subtitle">Get your service done in 4 simple steps</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
        {/* Connector line */}
        <div className="hidden lg:block absolute top-8 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-primary-500 via-violet-500 to-emerald-500 opacity-30" />

        {steps.map((step, i) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="glass-card p-6 text-center relative"
          >
            <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-4 relative z-10`}>
              <step.icon className="w-7 h-7" />
            </div>
            <span className="text-4xl font-black text-gray-800 absolute top-4 right-4">{step.step}</span>
            <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
export default HowItWorks;
