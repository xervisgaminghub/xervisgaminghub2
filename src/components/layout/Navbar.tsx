import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserProfile } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Menu, X, Home, ShoppingBag, Zap, LayoutDashboard, Newspaper, Trophy, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  user: UserProfile | null;
}

export default function Navbar({ user }: NavbarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/store', icon: ShoppingBag },
    { name: 'Earning', path: '/earning', icon: Zap },
    { name: 'Tournament', path: '/tournament', icon: Trophy },
    { name: 'Blog', path: '/blog', icon: Newspaper },
    { name: 'About', path: '/about', icon: Info },
  ];

  return (
    <nav className="sticky top-0 z-50 h-20 px-4 md:px-8 flex items-center justify-between border-b border-cyan/20 glass-cyan">
      {/* Logo Section */}
      <Link to="/" className="flex items-center shrink-0" onClick={() => setIsMenuOpen(false)}>
        <img 
          src="https://lh3.googleusercontent.com/d/1ETwW87GvcSFzBMdin6jdJB4Npnyz4MYM" 
          alt="Xervis Gaming Logo" 
          className="h-12 md:h-16 w-auto transition-transform hover:scale-110 active:scale-95" 
          referrerPolicy="no-referrer"
        />
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center space-x-10">
        {navLinks.map((link) => (
          <Link 
            key={link.path}
            to={link.path} 
            className={`nav-link text-sm font-black uppercase tracking-widest transition-all hover:text-cyan hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] ${isActive(link.path) ? 'text-cyan drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]' : 'text-gray-400'}`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Right Section: Auth & Mobile Toggle */}
      <div className="flex items-center space-x-4">
        {user && (
          <div className="hidden sm:flex items-center space-x-4 bg-black/40 px-4 py-2 rounded-xl border border-cyan/20 shadow-[0_0_15px_rgba(0,255,255,0.1)]">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Balance</span>
              <span className="text-sm font-black text-cyan drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">{user.points.toLocaleString()} PTS</span>
            </div>
            <div className="w-10 h-10 rounded-lg border-2 border-cyan/30 overflow-hidden shadow-[0_0_10px_rgba(0,255,255,0.2)]">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                alt="avatar" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        )}

        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="group relative p-2 text-cyan overflow-hidden rounded-lg transition-all active:scale-90"
          aria-label="Toggle Menu"
        >
          <div className="absolute inset-0 bg-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          {isMenuOpen ? <X className="w-8 h-8 relative z-10" /> : <Menu className="w-8 h-8 relative z-10" />}
          <div className="absolute -inset-1 bg-cyan/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
            />
            
            {/* Premium Sidebar Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-[320px] bg-black/95 border-l border-cyan/30 z-[70] flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Sidebar Header with Glow */}
              <div className="p-8 border-b border-cyan/10 bg-gradient-to-r from-transparent to-cyan/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/10 blur-[60px] rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-red/10 blur-[60px] rounded-full -ml-16 -mb-16" />
                
                <div className="flex justify-between items-start relative z-10">
                  <Link to="/" onClick={() => setIsMenuOpen(false)}>
                    <img 
                      src="https://lh3.googleusercontent.com/d/1ETwW87GvcSFzBMdin6jdJB4Npnyz4MYM" 
                      alt="Logo" 
                      className="h-10 w-auto" 
                    />
                  </Link>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-lg text-cyan transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* User Section in Sidebar */}
                {user ? (
                  <div className="mt-8 flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl border-2 border-cyan/50 p-1 bg-black/50 overflow-hidden shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                          alt="avatar" 
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-black" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-black text-xl text-white uppercase tracking-tighter truncate">
                        <span className="text-cyan">{user.username.substring(0, 1)}</span>
                        {user.username.substring(1)}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[10px] font-black bg-red px-2 py-0.5 rounded text-white uppercase">{user.level}</span>
                        <span className="text-xs font-bold text-cyan">{user.points.toLocaleString()} PTS</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-8">
                    <h3 className="text-xl font-black text-white italic tracking-widest uppercase">Unauthorized Entry</h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-tighter">Please identify yourself</p>
                  </div>
                )}
              </div>

              {/* Navigation Items */}
              <div className="flex-grow p-4 overflow-y-auto space-y-2">
                {navLinks.map((link, idx) => {
                  const Icon = link.icon;
                  return (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`group relative flex items-center p-4 rounded-xl transition-all duration-300 overflow-hidden ${
                          isActive(link.path) 
                            ? 'bg-cyan/10 border border-cyan/30 text-cyan shadow-[0_0_20px_rgba(0,255,255,0.15)]' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        {/* Hover Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="relative z-10 flex items-center space-x-4">
                          <div className={`p-2 rounded-lg transition-transform duration-300 group-hover:scale-110 group-active:scale-95 ${isActive(link.path) ? 'bg-cyan text-dark shadow-[0_0_10px_rgba(0,255,255,0.8)]' : 'bg-white/5 text-gray-400'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="font-black uppercase tracking-[0.2em] text-xs transition-all group-hover:tracking-[0.3em]">{link.name}</span>
                        </div>

                        {isActive(link.path) && (
                          <motion.div 
                            layoutId="active-indicator"
                            className="absolute right-4 w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_8px_cyan]"
                          />
                        )}
                        
                        {/* Shimmer effect on hover */}
                        <div className="absolute top-0 -left-full bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:left-full transition-all duration-1000" />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Sidebar Footer */}
              <div className="p-6 border-t border-cyan/10 bg-black/60">
                {user ? (
                  <button 
                    onClick={handleLogout}
                    className="w-full group relative flex items-center justify-center space-x-3 bg-red/10 border border-red/30 text-red py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all hover:bg-red hover:text-white hover:shadow-[0_0_25px_rgba(255,0,51,0.4)] active:scale-95"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Terminate Session</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <Link 
                      to="/login" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center p-4 border border-cyan/20 rounded-xl text-cyan font-black uppercase text-xs tracking-widest hover:bg-cyan/10 transition-colors"
                    >
                      Authenticate
                    </Link>
                    <Link 
                      to="/signup" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center p-4 bg-cyan text-dark rounded-xl font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:bg-white transition-all transform hover:-translate-y-1"
                    >
                      Initialize Profile
                    </Link>
                  </div>
                )}
                <div className="mt-6 text-center">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Xervis Protocol OS v1.0.4</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
