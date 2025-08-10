import type { FC } from 'react';
import { Link, useLocation} from 'react-router-dom'; 
import { useState, useEffect } from 'react';

// SVG for the jagged underline
const JaggedUnderline: FC = () => (
  <svg className="absolute bottom--1 left-0 w-full h-2" viewBox="0 0 100 10" preserveAspectRatio="none">
    <path
      d="M0,5 C25,12 75,-2 100,5"
      stroke="#f9a806" 
      strokeWidth="3"
      fill="none"
    />
  </svg>
);

const Navbar: FC = () => {
  const location = useLocation(); 
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Borrow Books', path: '/borrow-books' },
    { name: 'Purchase Books', path: '/purchase-books' },
    { name: 'Login', path: '/login' },
    { name: 'Register', path: '/register' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 text-white p-3 transition-all duration-300 ${scrolled ? 'bg-primary/80 backdrop-blur-sm shadow-lg' : 'bg-primary shadow-md'}`}>
        <div className="container mx-auto flex justify-between items-center px-4"> 
          {/* Logo Section */}
          <Link to="/" className="text-2l font-bold text-secondary flex items-center">
            <img src="/src/assets/light-bg-logo.svg" alt="Book Nook Logo" className="h-10 mr-2" />
            Book Nook
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-8"> 
            {navLinks.map((link) => (
              <div key={link.name} className="relative">
                <Link
                  to={link.path}
                  className={`
                    text-white hover:text-secondary transition-colors duration-300
                    ${location.pathname === link.path ? 'font-bold' : ''}
                  `}
                >
                  {link.name}
                </Link>
                {location.pathname === link.path && <JaggedUnderline />}
              </div>
            ))}
          </div>
        </div>
      </nav>
      {/* Spacer to prevent content from being hidden behind the fixed navbar */}
      <div className="h-[4.5rem]" />
    </>
  );
};

export default Navbar;