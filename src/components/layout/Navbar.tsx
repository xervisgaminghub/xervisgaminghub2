import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserProfile } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Menu, X, Home, ShoppingBag, Zap, LayoutDashboard, Newspaper, Trophy, Info, FileText, Youtube, Send, Instagram, Facebook, MessageSquare, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  user: UserProfile | null;
}

const NAV_LINKS = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', path: '/store', icon: ShoppingBag },
  { name: 'Tournament', path: '/tournament', icon: Trophy },
  { name: 'About', path: '/about', icon: Info },
  { name: 'Terms', path: '/terms', icon: FileText },
];

const SOCIAL_LINKS = [
  { name: 'Telegram', url: 'https://t.me/xarvis2', icon: Send, color: 'hover:text-[#229ED9]' },
  { name: 'YouTube', url: 'https://youtube.com/@xarvis-live', icon: Youtube, color: 'hover:text-[#FF0000]' },
  { name: 'Instagram', url: '#', icon: Instagram, color: 'hover:text-[#E4405F]' },
  { name: 'Facebook', url: '#', icon: Facebook, color: 'hover:text-[#1877F2]' },
];

export default function Navbar({ user }: NavbarProps) {
  const { logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const adminLink = isAdmin ? [{ name: 'Admin', path: '/admin', icon: Shield }] : [];
  const allNavLinks = [...NAV_LINKS, ...adminLink];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 flex flex-col border-b border-cyan/10 bg-black/40 backdrop-blur-3xl shadow-[0_4px_30px_rgba(0,0,0,0.7)]">
      {/* Top Tier: Logo & Auth */}
      <div className="h-24 md:h-28 px-4 md:px-8 flex items-center justify-between border-b border-white/5 relative overflow-hidden">
        {/* Animated Lightning Accent background for Navbar */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[1px] h-full bg-cyan blur-sm animate-pulse" />
          <div className="absolute top-0 right-1/4 w-[1px] h-full bg-cyan blur-sm animate-pulse delay-700" />
        </div>
        {/* Logo Section */}
        <Link to="/" className="flex items-center shrink-0">
          <img 
            src="https://lh3.googleusercontent.com/d/1ETwW87GvcSFzBMdin6jdJB4Npnyz4MYM" 
            alt="Xervis Gaming Logo" 
            className="h-20 md:h-24 w-auto transition-transform hover:scale-110 active:scale-95" 
            referrerPolicy="no-referrer"
          />
        </Link>

        {/* Auth / User Section */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex flex-col items-end hidden xs:flex">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">Points</span>
                <span className="text-xs font-black text-cyan drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">{user.points.toLocaleString()}</span>
              </div>
              
              <Link to="/dashboard" className="w-9 h-9 rounded-lg border border-cyan/30 overflow-hidden shadow-[0_0_10px_rgba(0,255,255,0.2)] hover:border-cyan transition-colors">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                  alt="avatar" 
                  className="w-full h-full object-cover" 
                />
              </Link>

              <button 
                onClick={handleLogout}
                className="p-2 text-red/70 hover:text-red hover:bg-red/10 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link 
                to="/login" 
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-cyan px-3 py-1.5 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="text-[10px] font-black uppercase tracking-widest bg-cyan/10 border border-cyan/30 text-cyan px-4 py-1.5 rounded-lg hover:bg-cyan hover:text-dark transition-all shadow-[0_0_15px_rgba(0,255,255,0.2)]"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Tier: All Navigation Links */}
      <div className="overflow-x-auto custom-scrollbar bg-black/40 border-t border-white/5">
        <div className="flex items-center justify-start lg:justify-center min-w-max px-4 py-2 space-x-1 md:space-x-4">
          {/* Main Links */}
          {allNavLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap group ${
                isActive(link.path) 
                  ? 'text-cyan bg-cyan/10 border border-cyan/20 shadow-[0_0_15px_rgba(0,255,255,0.1)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <link.icon className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${isActive(link.path) ? 'text-cyan' : 'text-gray-500'}`} />
              <span>{link.name}</span>
            </Link>
          ))}

          {/* Social Links Block */}
          <div className="h-6 w-[2px] bg-white/10 mx-2" />
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              {SOCIAL_LINKS.map((social) => (
              <a 
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center p-2 rounded-lg bg-white/5 border border-white/5 transition-all hover:bg-white/10 ${social.color}`}
                title={social.name}
              >
                <social.icon className="w-3.5 h-3.5" />
              </a>
            ))}
            
            <a 
              href="https://wa.me/8801977768511" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-3 py-2 bg-green-500/10 border border-green-500/30 text-green-500 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-green-500 hover:text-white transition-all ml-1"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Support</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
  );
}
