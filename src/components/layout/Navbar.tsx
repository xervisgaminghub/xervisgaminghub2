import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserProfile } from '../../types';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { Gamepad2, LogOut } from 'lucide-react';

interface NavbarProps {
  user: UserProfile | null;
}

export default function Navbar({ user }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 h-20 px-8 flex items-center justify-between border-b border-cyan/20 bg-gradient-to-b from-cyan/5 to-transparent backdrop-blur-md">
      <Link to="/" className="flex items-center space-x-2">
        <Gamepad2 className="w-8 h-8 text-cyan" />
        <span className="text-2xl font-black tracking-tighter uppercase">
          XERVIS <span className="text-cyan drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">GAMING HUB</span>
        </span>
      </Link>

      <div className="hidden md:flex items-center space-x-8">
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
        <Link to="/store" className={`nav-link ${isActive('/store') ? 'active' : ''}`}>Shop</Link>
        <Link to="/earning" className={`nav-link ${isActive('/earning') ? 'active' : ''}`}>Earning</Link>
        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
        <Link to="/blog" className={`nav-link ${isActive('/blog') ? 'active' : ''}`}>News</Link>
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-5 bg-white/5 px-4 py-2 rounded-full border border-cyan/20">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Points</div>
              <div className="text-sm font-bold text-cyan leading-none">{user.points.toLocaleString()}</div>
            </div>
            <div className="level-badge">{user.level}</div>
            <Link to="/dashboard" className="w-8 h-8 rounded-full bg-white/10 border border-cyan/30 flex items-center justify-center overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="avatar" className="w-full h-full object-cover" />
            </Link>
            <button onClick={handleLogout} className="text-red hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="btn-neon">Join Hub</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
