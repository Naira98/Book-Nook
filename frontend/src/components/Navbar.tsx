import type { FC } from 'react';
import { Link, useLocation} from 'react-router-dom'; 
// import ThemeToggle from '../components/shared/ThemeToggle';
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

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Borrow Books', path: '/borrow-books' },
    { name: 'Purchase Books', path: '/purchase-books' },
    { name: 'Login', path: '/login' },
    { name: 'Register', path: '/register' },

  ];

  return (
    <nav className="bg-primary text-white p-3 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4"> 
        {/* Logo Section */}
        <Link to="/" className="text-2l font-bold text-secondary flex items-center">
          <img src="/src/assets/light-bg-logo.svg" alt="Book Nook Logo" className="h-10 mr-2" />
          Book Nook
        </Link>

            {/* Theme Toggle */}
            {/* <ThemeToggle /> */}

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
  );
};

export default Navbar;