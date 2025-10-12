import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import teammyLogo from '../../assets/Teammy..png';

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80); // đổi màu khi cuộn quá 80px
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleSignIn = () => {
    alert('Sign in functionality will be implemented soon!');
  };

  return (
    <nav
      className={`w-full h-16 fixed top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md shadow-sm'
          : 'bg-white/10 backdrop-blur-lg border-b border-white/20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex-shrink-0">
            {/* 
            <Link to="/" className="flex items-center font-sans">
              <img src={teammyLogo} alt="Teammy Logo" className="h-8 w-auto" />
            </Link> 
            */}
            <h1
              className={`font-sans text-[24px] leading-[96px] tracking-[-4%] font-black transition-colors duration-300 ${
                scrolled ? 'text-black' : 'text-white'
              }`}
            >
              Teammy.
            </h1>
          </div>

          {/* Nav links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {['discover', 'forum', 'my-groups', 'workspace'].map((item) => (
                <Link
                  key={item}
                  to={`/${item}`}
                  className={`px-3 py-2 transition-colors duration-200 font-sans font-bold text-[15px] ${
                    isActive(`/${item}`)
                      ? scrolled
                        ? 'text-black'
                        : 'text-white'
                      : scrolled
                      ? 'text-gray-800 hover:text-black'
                      : 'text-white hover:text-gray-200'
                  }`}
                >
                  {item
                    .split('-')
                    .map((w) => w[0].toUpperCase() + w.slice(1))
                    .join(' ')}
                </Link>
              ))}
            </div>
          </div>

          {/* Sign in button */}
          <div className="flex-shrink-0">
            <button
              onClick={handleSignIn}
              className={`px-4 py-2 rounded-[32px] text-sm font-medium transition-colors duration-200 flex items-center space-x-1 font-sans ${
                scrolled
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-white/24 text-white hover:bg-white/32 backdrop-blur-sm'
              }`}
            >
              <span>Sign in</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
