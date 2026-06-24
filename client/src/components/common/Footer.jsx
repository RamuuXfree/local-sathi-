import { Link } from 'react-router-dom';
import { Wrench, Phone, Mail, MapPin, Globe, MessageCircle, Camera, Play } from 'lucide-react';

const Footer = () => {
  const services = ['Electrician', 'Plumber', 'Cleaner', 'AC Repair', 'Carpenter', 'Painter', 'Appliance Repair'];
  const company = [
    { label: 'About Us', href: '/#about' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Become a Provider', href: '/provider/signup' },
    { label: 'Careers', href: '#' },
  ];

  return (
    <footer className="bg-gray-950 border-t border-gray-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-violet-600 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">LocalSaathi</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              India's most trusted platform for booking verified local service professionals. Quality service at your doorstep.
            </p>
            <div className="flex items-center gap-3">
            {[Globe, MessageCircle, Camera, Play].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-primary-600 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2.5">
              {services.map((service) => (
                <li key={service}>
                  <Link
                    to={`/services?category=${service}`}
                    className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-200"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2.5">
              {company.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 text-sm">123 Tech Park, Bandra, Mumbai 400051</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <a href="tel:+919000000000" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                  +91 90000 00000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <a href="mailto:hello@localsaathi.com" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                  hello@localsaathi.com
                </a>
              </li>
            </ul>

            {/* App Download Placeholder */}
            <div className="mt-5">
              <p className="text-xs text-gray-500 mb-2">Download our app</p>
              <div className="flex gap-2">
                <div className="px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 text-xs text-gray-400 cursor-pointer hover:border-primary-500 transition-colors">
                  📱 App Store
                </div>
                <div className="px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 text-xs text-gray-400 cursor-pointer hover:border-primary-500 transition-colors">
                  🤖 Play Store
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} LocalSaathi. All rights reserved. Made with ❤️ in India.
          </p>
          <div className="flex items-center gap-4">
            <Link to="#" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">Privacy Policy</Link>
            <Link to="#" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">Terms of Service</Link>
            <Link to="#" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
