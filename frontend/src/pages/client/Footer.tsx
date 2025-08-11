import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Facebook, Instagram, Twitter } from 'lucide-react';
import logo from '../../assets/dark-bg-logo.svg';
import mapImage from '../../assets/africa.svg';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary mt-12 py-12 text-white relative overflow-hidden">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* About Section */}
        <div>
          <div className="flex items-center mb-1">
            <img src={logo} alt="Book Nook Logo" className="w-30 h-auto mr-2" />
            <p className="text-gray-200 text-sm leading-relaxed">
              Your digital library — borrow or buy books easily. Curated collections, fast search, and a friendly interface.
            </p>
          </div>

          <div className="flex items-center gap-4 ml-3 ">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white hover:text-gray-400 transition-colors duration-200">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-white hover:text-gray-400 transition-colors duration-200">
              <Twitter className="w-6 h-6" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white hover:text-gray-400 transition-colors duration-200">
              <Instagram className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="md:pl-16">
          <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="text-white hover:underline">Home</Link></li>
            <li><Link to="/borrow-books" className="text-white hover:underline">Borrow Books</Link></li>
            <li><Link to="/purchase-books" className="text-white hover:underline">Purchase Books</Link></li>
            <li><Link to="/login" className="text-white hover:underline">Login</Link></li>
          </ul>
        </div>

        {/* Contact Section with Map */}
        <div className="relative flex items-center">
          {/* Contact Info */}
          <div className="relative z-10 flex-1 pr-6">
            <h4 className="text-lg font-semibold mb-4">Contact & Location</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <a
                  href="https://www.google.com/maps?q=123+Library+St.,+Fayoum,+Egypt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:text-gray-400"
                >
                  <MapPin className="w-5 h-5" />
                  <span>123 Library St., Fayoum, Egypt</span>
                </a>
              </div>
              <div className="flex items-center gap-3">
                <a href="tel:+201006641942" className="flex items-center gap-3 hover:text-gray-400">
                  <Phone className="w-5 h-5" />
                  <span>+20 100 664 1942</span>
                </a>
              </div>
              <div className="flex items-center gap-3">
                <a href="mailto:booknook@gmail.com" className="flex items-center gap-3 hover:text-gray-400">
                  <Mail className="w-5 h-5" />
                  <span>booknook@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

          {/* Map Image aligned right */}
          <div className="absolute right-70 top--10 w-1/2 h-45 flex justify-end items-center pointer-events-none">
            <img
              src={mapImage}
              alt="Map"
              className="w-full h-full object-contain opacity-10 filter brightness-0 invert"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-500 mt-8 pt-6 text-center text-xs text-gray-300">
        © {new Date().getFullYear()} Book Nook. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
