import {
  Mail,
  MapPin,
  Phone
} from "lucide-react";
import { Link } from "react-router-dom";
import mapImage from "../../assets/africa.svg";
import logo from "../../assets/light-bg-logo.svg";

const Footer = () => {
  return (
    <footer className="bg-primary relative overflow-hidden py-12 text-white">
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 md:grid-cols-3">
        {/* About Section */}
        <div>
          <div className="flex items-center gap-4">
            <img src={logo} alt="Book Nook Logo" className="h-auto w-30" />
            <p className="text-sm leading-relaxed text-gray-200">
              Your digital library — borrow or buy books easily. Curated
              collections, fast search, and a friendly interface.
            </p>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="md:pl-16">
          <h4 className="mb-4 text-lg font-semibold">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="text-white hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link to="/borrow-books" className="text-white hover:underline">
                Borrow Books
              </Link>
            </li>
            <li>
              <Link to="/purchase-books" className="text-white hover:underline">
                Purchase Books
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Section with Map */}
        <div className="relative flex items-center">
          {/* Contact Info */}
          <div className="relative z-10 flex-1 pr-6">
            <h4 className="mb-4 text-lg font-semibold">Contact & Location</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <a
                  href="https://www.google.com/maps?q=123+Library+St.,+Fayoum,+Egypt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:text-gray-400"
                >
                  <MapPin className="h-5 w-5" />
                  <span>123 Library St., Fayoum, Egypt</span>
                </a>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="tel:+201006641942"
                  className="flex items-center gap-3 hover:text-gray-400"
                >
                  <Phone className="h-5 w-5" />
                  <span>+20 123 456 7890</span>
                </a>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="mailto:booknook@gmail.com"
                  className="flex items-center gap-3 hover:text-gray-400"
                >
                  <Mail className="h-5 w-5" />
                  <span>book.nook.eglib@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

          {/* Map Image aligned right */}
          <div className="top--10 pointer-events-none absolute right-70 flex h-45 w-1/2 items-center justify-end">
            <img
              src={mapImage}
              alt="Map"
              className="h-full w-full object-contain opacity-10 brightness-0 invert filter"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-500 pt-6 text-center text-xs text-gray-300">
        © {new Date().getFullYear()} Book Nook. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
