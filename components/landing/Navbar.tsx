import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'App Features', path: '/features' },
    { label: 'Products', path: '/pricing' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-700 animate-fade-down ${
      scrolled 
        ? 'bg-[#F7F5EF]/95 backdrop-blur-xl shadow-sm py-4 border-b border-gray-200/50' 
        : 'bg-transparent py-8'
    }`}>
      <div className="max-w-[1500px] mx-auto px-10 flex items-center justify-between">
        {/* Left: Branding */}
        <Link to="/" className="flex items-center gap-4 shrink-0">
          <Logo />
          <span className="text-2xl font-serif font-bold text-[#1F1F1F] tracking-tight">
            Nurture Glow
          </span>
        </Link>

        {/* Center: Main Links */}
        <div className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link 
              key={link.label} 
              to={link.path}
              className={`text-[12px] font-bold transition-all tracking-[0.15em] uppercase relative group ${
                location.pathname === link.path ? 'text-[#1F1F1F]' : 'text-gray-500 hover:text-[#1F1F1F]'
              }`}
            >
              {link.label}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#E6C77A] transition-all duration-300 ${
                location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
              }`} />
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="hidden lg:flex items-center gap-8 shrink-0">
          {!user ? (
            <>
              <Link to="/login" className="text-[12px] font-bold text-gray-500 hover:text-[#1F1F1F] transition-colors uppercase tracking-[0.15em]">
                Sign In
              </Link>
              <Link to="/signup" className="px-8 py-3 bg-[#E6C77A] hover:bg-[#d4b56a] text-white rounded-lg text-[11px] font-bold transition-all shadow-xl shadow-[#E6C77A]/20 uppercase tracking-[0.15em]">
                Get Started
              </Link>
            </>
          ) : (
            <Link to="/dashboard" className="px-8 py-3 bg-[#BFE6DA] text-teal-900 rounded-lg text-[11px] font-bold hover:scale-105 transition-all uppercase tracking-[0.15em]">
              Dashboard
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden p-2 text-gray-900" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#F7F5EF] border-b border-gray-200 p-10 space-y-8 shadow-2xl animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link 
              key={link.label} 
              to={link.path} 
              onClick={() => setIsOpen(false)}
              className="block w-full text-left text-sm font-bold text-gray-800 uppercase tracking-widest"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-4">
             <Link to="/login" onClick={() => setIsOpen(false)} className="text-center py-4 text-sm font-bold border border-gray-300 rounded-xl">Sign In</Link>
             <Link to="/signup" onClick={() => setIsOpen(false)} className="text-center py-4 bg-[#E6C77A] text-white rounded-xl font-bold">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;