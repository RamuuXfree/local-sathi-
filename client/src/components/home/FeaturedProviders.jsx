import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getAllProviders } from '../../api/providers';
import ProviderCard from '../common/ProviderCard';
import Loader from '../common/Loader';

const FeaturedProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProviders({ limit: 4 })
      .then(({ data }) => setProviders(data.providers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading providers..." />;
  if (!providers.length) return null;

  return (
    <section className="py-20 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-14"
        >
          <div>
            <h2 className="section-title">Featured <span className="gradient-text">Providers</span></h2>
            <p className="section-subtitle">Top-rated professionals in your city</p>
          </div>
          <Link to="/services" className="btn-outline py-2 px-4 text-sm hidden sm:flex">
            View All
          </Link>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {providers.map((provider, i) => (
            <ProviderCard key={provider._id} provider={provider} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};
export default FeaturedProviders;
