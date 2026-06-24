import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, Star, Briefcase, CheckCircle, Calendar, Send } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import RatingStars from '../../components/common/RatingStars';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { getServiceById } from '../../api/services';
import { getProviderReviews } from '../../api/reviews';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serviceRes] = await Promise.all([getServiceById(id)]);
        setService(serviceRes.data.service);
        if (serviceRes.data.service?.providerId?._id) {
          const reviewRes = await getProviderReviews(serviceRes.data.service.providerId._id);
          setReviews(reviewRes.data.reviews || []);
        }
      } catch (err) {
        toast.error('Service not found');
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleBookNow = () => {
    if (!user) {
      toast.error('Please log in to book a service');
      navigate('/login');
      return;
    }
    if (user.role !== 'user') {
      toast.error('Only customers can book services');
      return;
    }
    navigate('/dashboard/book', { state: { service, provider: service.providerId } });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
  if (!service) return null;

  const provider = service.providerId;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back */}
          <Link to="/services" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 mt-4">
            <ArrowLeft className="w-4 h-4" /> Back to Services
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <Badge label={service.category} variant={service.category.toLowerCase()} />
                    <h1 className="text-2xl md:text-3xl font-bold text-white mt-2">{service.title}</h1>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">₹{service.price.toLocaleString('en-IN')}</div>
                    <div className="text-gray-500 text-sm">{service.priceUnit}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-5 text-sm text-gray-400">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary-400" />{service.duration}</span>
                  {provider?.city && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary-400" />{provider.city}</span>}
                </div>

                <p className="text-gray-300 leading-relaxed">{service.description}</p>

                {service.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {service.tags.map(tag => <span key={tag} className="px-2.5 py-1 bg-gray-800 text-gray-400 rounded-lg text-xs border border-gray-700">{tag}</span>)}
                  </div>
                )}
              </motion.div>

              {/* Provider Info */}
              {provider && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">About the Provider</h2>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-violet-700 flex items-center justify-center text-3xl flex-shrink-0">
                      {service.category === 'Electrician' ? '⚡' : service.category === 'Plumber' ? '🔧' : service.category === 'Cleaner' ? '🧹' : '🛠️'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-bold text-lg">{provider.name}</h3>
                        {provider.isApproved && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                      </div>
                      <RatingStars rating={provider.rating?.average || 0} showCount count={provider.rating?.count || 0} size="md" />
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{provider.city}</span>
                        <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{provider.experience}+ years</span>
                      </div>
                      {provider.bio && <p className="text-gray-400 text-sm mt-3 leading-relaxed">{provider.bio}</p>}
                      {provider.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {provider.skills.map(skill => <span key={skill} className="px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded-lg text-xs border border-primary-500/20">{skill}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Reviews */}
              {reviews.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Customer Reviews ({reviews.length})</h2>
                  <div className="space-y-4">
                    {reviews.slice(0, 5).map((review) => (
                      <div key={review._id} className="border-b border-gray-800 pb-4 last:border-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 to-violet-700 flex items-center justify-center text-sm font-bold text-white">
                            {review.userId?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{review.userId?.name}</p>
                            <RatingStars rating={review.rating} size="sm" />
                          </div>
                          <span className="ml-auto text-gray-600 text-xs">{new Date(review.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed ml-12">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-white mb-4">Book This Service</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Base Price</span>
                    <span className="text-white font-medium">₹{service.price.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-white font-medium">{service.duration}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Unit</span>
                    <span className="text-white font-medium">{service.priceUnit}</span>
                  </div>
                  <div className="border-t border-gray-800 pt-3 flex justify-between">
                    <span className="text-gray-300 font-medium">Total</span>
                    <span className="text-white font-bold text-lg">₹{service.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button onClick={handleBookNow} className="btn-primary w-full flex items-center justify-center gap-2 mb-3">
                  <Calendar className="w-4 h-4" /> Book Now
                </button>
                <p className="text-gray-500 text-xs text-center">Free cancellation up to 2 hours before service</p>

                <div className="mt-5 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <p className="text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Satisfaction guaranteed or your money back
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default ServiceDetailPage;
