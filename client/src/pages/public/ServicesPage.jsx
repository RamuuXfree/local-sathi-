import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import ServiceCard from '../../components/common/ServiceCard';
import Loader, { SkeletonCard } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { getAllServices } from '../../api/services';

const CATEGORIES = ['All', 'Electrician', 'Plumber', 'Cleaner', 'AC Repair', 'Carpenter', 'Painter', 'Appliance Repair'];

const ServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category && category !== 'All') params.category = category;
      const { data } = await getAllServices(params);
      setServices(data.services || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, [category, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchServices();
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
    if (cat !== 'All') setSearchParams({ category: cat });
    else setSearchParams({});
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-16">
        {/* Header */}
        <div className="bg-hero-gradient py-16 px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Browse <span className="gradient-text">Services</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8">Find the right professional for every need</p>
            <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..." className="input-field pl-12 h-12" />
              </div>
              <button type="submit" className="btn-primary px-6">Search</button>
            </form>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  category === cat
                    ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white shadow-glow'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Active filter badge */}
          {(search || category !== 'All') && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gray-400 text-sm">Active filters:</span>
              {category !== 'All' && (
                <span className="badge bg-primary-500/10 text-primary-400 border border-primary-500/20">
                  {category} <button onClick={() => handleCategoryChange('All')} className="ml-1"><X className="w-3 h-3" /></button>
                </span>
              )}
              {search && (
                <span className="badge bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  "{search}" <button onClick={() => setSearch('')} className="ml-1"><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : services.length === 0 ? (
            <EmptyState
              title="No services found"
              description="Try adjusting your search or category filter to find the service you need."
              action={<button onClick={() => { setSearch(''); handleCategoryChange('All'); }} className="btn-primary">Clear Filters</button>}
            />
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-4">{services.length} services found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {services.map((service, i) => (
                  <ServiceCard key={service._id} service={service} index={i} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-xl font-medium text-sm transition-all ${
                      p === page ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}>{p}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default ServicesPage;
