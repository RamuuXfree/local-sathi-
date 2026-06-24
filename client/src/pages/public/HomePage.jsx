import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import Hero from '../../components/home/Hero';
import PopularServices from '../../components/home/PopularServices';
import HowItWorks from '../../components/home/HowItWorks';
import WhyChooseUs from '../../components/home/WhyChooseUs';
import FeaturedProviders from '../../components/home/FeaturedProviders';
import Testimonials from '../../components/home/Testimonials';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const HomePage = () => (
  <div className="min-h-screen">
    <Navbar />
    <Hero />
    <PopularServices />
    <HowItWorks />
    <FeaturedProviders />
    <WhyChooseUs />
    <Testimonials />

    {/* CTA Banner */}
    <section className="py-20 bg-gradient-to-r from-primary-900/40 via-violet-900/30 to-primary-900/40 border-y border-primary-500/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Book a Service?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join 50,000+ satisfied customers who trust LocalSaathi for all their home service needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/services" className="btn-primary flex items-center justify-center gap-2 text-lg px-8 py-4">
              Explore Services <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/provider/signup" className="btn-outline flex items-center justify-center gap-2 text-lg px-8 py-4">
              Become a Provider
            </Link>
          </div>
        </motion.div>
      </div>
    </section>

    <Footer />
  </div>
);

export default HomePage;
