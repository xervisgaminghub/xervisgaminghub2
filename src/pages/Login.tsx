import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Gamepad2, X } from 'lucide-react';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back, Gamer!");
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      toast.success("Password reset email sent! Check your inbox.");
      setShowForgotModal(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Welcome back, Gamer!");
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20 px-4 flex items-center justify-center relative">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=2070" 
          alt="Login BG" 
          className="w-full h-full object-cover opacity-10"
          referrerPolicy="no-referrer"
        />
      </div>

      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-md glass p-8 rounded-3xl border-cyan/20"
      >
        <div className="text-center mb-8">
          <img 
            src="https://lh3.googleusercontent.com/d/1ETwW87GvcSFzBMdin6jdJB4Npnyz4MYM" 
            alt="Xervis Gaming Logo" 
            className="h-24 w-auto mx-auto mb-4" 
            referrerPolicy="no-referrer"
          />
          <h2 className="text-3xl font-black tracking-tighter uppercase underline decoration-cyan decoration-4 underline-offset-8">LOGIN TO HUB</h2>
          <p className="text-gray-400 text-sm mt-2">Access your gaming dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-cyan outline-none transition-all"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="password" 
              placeholder="Password" 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-cyan outline-none transition-all"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div className="text-right">
            <button 
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-xs text-cyan font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-neon w-full mt-2 py-4 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enter Hub'}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 border-t border-white/10"></div>
            <span className="relative z-10 bg-dark px-4 text-xs text-gray-500 uppercase tracking-widest">Or continue with</span>
          </div>

          <button 
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center space-x-3 py-3 bg-white text-dark font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            <span>Google Account</span>
          </button>
        </div>

        <p className="text-center mt-8 text-sm text-gray-400">
          New to the hub? <Link to="/signup" className="text-cyan font-bold hover:underline">Join now</Link>
        </p>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm glass p-8 rounded-3xl border-cyan/20 relative"
            >
              <button 
                onClick={() => setShowForgotModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <h3 className="text-xl font-black tracking-tighter uppercase mb-2">Reset Password</h3>
                <p className="text-gray-400 text-xs">Enter your email and we'll send a reset link.</p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    type="email" 
                    placeholder="Account Email" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-cyan outline-none transition-all"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-cyan w-full py-3 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
