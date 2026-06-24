import { motion } from 'framer-motion';
import { Shield, Clock, ThumbsUp, Award, Headphones, CreditCard } from 'lucide-react';

const features = [
  { icon: Shield, title: 'Verified Professionals', description: 'All service providers undergo thorough background checks, skill verification, and identity proof before approval.', color: 'text-primary-400 bg-primary-500/10' },
  { icon: Clock, title: 'On-Time Guarantee', description: "Our providers commit to punctuality. If they're late, we make it right with priority rebooking.", color: 'text-emerald-400 bg-emerald-500/10' },
  { icon: ThumbsUp, title: 'Service Warranty', description: '30-day service warranty on all completed jobs. If unsatisfied, we send a replacement at no extra cost.', color: 'text-violet-400 bg-violet-500/10' },
  { icon: Award, title: 'Best in Class', description: 'Curated selection of top-rated professionals with consistently high reviews and proven track records.', color: 'text-amber-400 bg-amber-500/10' },
  { icon: Headphones, title: '24/7 Support', description: 'Round-the-clock customer support via chat, call, and WhatsApp. We\'re always here when you need us.', color: 'text-blue-400 bg-blue-500/10' },
  { icon: CreditCard, title: 'Transparent Pricing', description: 'No hidden charges. Clear upfront pricing with digital invoices and multiple payment options.', color: 'text-pink-400 bg-pink-500/10' },
];

const WhyChooseUs = () => (
  <section id="about" className="py-20 bg-gray-950">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="section-title">Why Choose <span className="gradient-text">LocalSaathi</span>?</h2>
        <p className="section-subtitle">We're not just a marketplace — we're your service partner</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="glass-card-hover p-6 flex gap-4"
          >
            <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center flex-shrink-0 mt-1`}>
              <feature.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1.5">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
export default WhyChooseUs;
