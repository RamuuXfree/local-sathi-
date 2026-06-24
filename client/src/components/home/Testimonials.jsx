import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  { name: 'Anjali Mehta', city: 'Mumbai', role: 'Homeowner', rating: 5, comment: 'LocalSaathi made finding a trustworthy electrician so easy! Rajesh Kumar was punctual, professional, and solved all our wiring issues within 2 hours. Highly recommend!', emoji: '👩💼' },
  { name: 'Rohan Sharma', city: 'Bengaluru', role: 'Software Engineer', rating: 5, comment: 'Booked a deep cleaning service for my apartment before moving in. Priya and her team were absolutely thorough. The house was spotless. Will definitely book again!', emoji: '👨💻' },
  { name: 'Kavita Reddy', city: 'Hyderabad', role: 'Entrepreneur', rating: 5, comment: 'My AC had been giving trouble for weeks. Found Amit on LocalSaathi, and he fixed the gas and PCB issue in one visit. Great service at a fair price!', emoji: '👩💼' },
  { name: 'Vikash Gupta', city: 'Delhi', role: 'Teacher', rating: 4, comment: 'The platform is very intuitive. Booking a plumber took less than 5 minutes. Suresh arrived on time and fixed our bathroom pipe leak professionally.', emoji: '👨🏫' },
  { name: 'Sneha Patel', city: 'Pune', role: 'Doctor', rating: 5, comment: 'As a busy doctor, I need services I can rely on. LocalSaathi has never let me down. The booking process is seamless and providers are always verified and skilled.', emoji: '👩⚕️' },
  { name: 'Arjun Nair', city: 'Chennai', role: 'Architect', rating: 5, comment: 'I\'ve used LocalSaathi multiple times for painting and carpentry work. Mohit did an exceptional job on my living room. The quality is consistently excellent.', emoji: '👨🏠' },
];

const Testimonials = () => (
  <section className="py-20 bg-gray-900/50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="section-title">What Our <span className="gradient-text">Customers Say</span></h2>
        <p className="section-subtitle">Thousands of happy customers across India trust LocalSaathi</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="glass-card-hover p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <Quote className="w-8 h-8 text-primary-500/40 flex-shrink-0 mt-1" />
              <p className="text-gray-300 text-sm leading-relaxed italic">{t.comment}</p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-violet-700 flex items-center justify-center text-lg">
                {t.emoji}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{t.name}</p>
                <p className="text-gray-500 text-xs">{t.role} • {t.city}</p>
              </div>
              <div className="ml-auto text-amber-400 text-sm">
                {'★'.repeat(t.rating)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
export default Testimonials;
