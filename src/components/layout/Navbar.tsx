import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserProfile } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Menu, X, Home, ShoppingBag, Zap, LayoutDashboard, Newspaper } from 'lucide-react';
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
    { name: 'Shop', path: '/store', icon: ShoppingBag },
    { name: 'Earning', path: '/earning', icon: Zap },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'News', path: '/blog', icon: Newspaper },
  ];

  return (
    <nav className="sticky top-0 z-50 h-20 px-4 md:px-8 flex items-center justify-between border-b border-cyan/20 glass-cyan">
      {/* Logo Section */}
      <Link to="/" className="flex items-center shrink-0" onClick={() => setIsMenuOpen(false)}>
        <img 
          src="https://lh3.googleusercontent.com/d/1ETwW87GvcSFzBMdin6jdJB4Npnyz4MYM" 
          alt="Xervis Gaming Logo" 
          className="h-12 md:h-16 w-auto" 
          referrerPolicy="no-referrer"
        />
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center space-x-8">
        {navLinks.map((link) => (
          <Link 
            key={link.path}
            to={link.path} 
            className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Right Section: Auth & Mobile Toggle */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {user ? (
          <div className="hidden sm:flex items-center space-x-3 bg-white/5 px-3 py-1.5 rounded-full border border-cyan/20">
            <div className="text-center">
              <div className="text-[8px] uppercase tracking-widest text-gray-500 font-bold">Points</div>
              <div className="text-xs font-bold text-cyan leading-none">{user.points.toLocaleString()}</div>
            </div>
            <div className="level-badge !text-[8px] !px-1.5">{user.level}</div>
            <Link to="/dashboard" className="w-7 h-7 rounded-full bg-white/10 border border-cyan/30 flex items-center justify-center overflow-hidden">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                alt="avatar" 
                className="w-full h-full object-cover" 
              />
            </Link>
            <button onClick={handleLogout} className="text-red hover:scale-110 transition-transform">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center space-x-4">
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="btn-neon !py-1.5 !px-3">Join Hub</Link>
          </div>
        )}

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2 text-cyan hover:bg-white/5 rounded-lg transition-colors"
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 top-20 bg-dark/60 backdrop-blur-sm lg:hidden z-40"
            />
            
            {/* Menu Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-20 right-0 bottom-0 w-[280px] bg-dark border-l border-cyan/20 lg:hidden z-50 p-6 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
            >
              {/* User Info in Mobile Menu (Visible only when logged in) */}
              {user && (
                <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-cyan/10">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-full border-2 border-cyan/50 overflow-hidden">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                        alt="avatar" 
                      />
                    </div>
                    <div>
                      <p className="font-black text-cyan uppercase tracking-tight line-clamp-1">{user.username}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">{user.level} Membership</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-black/40 p-2 rounded-xl border border-white/5 text-center">
                      <p className="text-[8px] text-gray-500 uppercase font-bold">Balance</p>
                      <p className="text-xs font-black text-cyan">{user.points.toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center justify-center space-x-2 bg-red/10 border border-red/20 text-red py-2 rounded-xl text-[10px] font-black uppercase"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Exit Hub</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-4 flex-grow">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-4 p-4 rounded-xl transition-all ${
                      isActive(link.path) 
                        ? 'bg-cyan/10 border border-cyan/30 text-cyan shadow-[0_0_15px_rgba(0,255,255,0.1)]' 
                        : 'border border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <link.icon className={`w-5 h-5 ${isActive(link.path) ? 'text-cyan' : ''}`} />
                    <span className="font-bold uppercase tracking-widest text-xs">{link.name}</span>
                  </Link>
                ))}
              </div>

              {/* Login/Signup in Mobile Menu (If not logged in) */}
              {!user && (
                <div className="mt-auto space-y-3 pt-6 border-t border-cyan/10">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center p-4 border border-white/10 rounded-xl text-white font-bold uppercase text-xs tracking-widest hover:bg-white/5"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center p-4 bg-cyan text-dark rounded-xl font-black uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(0,255,255,0.3)]"
                  >
                    Join Xervis Hub
                  </Link>
                </div>
              )}
              
              <div className="mt-8 text-center opacity-30">
                <p className="text-[8px] uppercase tracking-[0.5em] font-black text-white/50">Xervis Hub v1.0</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
