import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Gamepad2, X, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';

const ADMIN_EMAILS = ['mdmasumofficial7@gmail.com', 'sajewel132@gmail.com'];

export default function Login() {
  const { verifyMfa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  
  // 2FA States
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);

  const navigate = useNavigate();

  const generateAndSendOtp = async (user: any) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
      // Store OTP in Firestore
      await setDoc(doc(db, 'admin_otps', user.uid), {
        email: user.email,
        code: code,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes expiry
      });

      // Simulation of sending email
      console.log(`[SIMULATION] Sending OTP to ${user.email}: ${code}`);
      toast.info(`A verification code has been sent to ${user.email} (Check Console for Code)`, {
        duration: 10000
      });
      
      return true;
    } catch (error) {
      console.error("Error generating OTP:", error);
      toast.error("Failed to generate verification code.");
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if user is admin
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      const isAdmin = userData?.role === 'admin' || ADMIN_EMAILS.includes(user.email || '');

      if (isAdmin) {
        setPendingUser(user);
        const success = await generateAndSendOtp(user);
        if (success) {
          setShowOtpStep(true);
        } else {
          await signOut(auth);
        }
      } else {
        toast.success("Welcome back, Gamer!");
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser || !otp) return;

    setVerifyingOtp(true);
    try {
      const otpDoc = await getDoc(doc(db, 'admin_otps', pendingUser.uid));
      
      if (!otpDoc.exists()) {
        toast.error("Verification code expired or not found. Please resend.");
        return;
      }

      const otpData = otpDoc.data();
      const isExpired = new Date(otpData.expiresAt) < new Date();

      if (isExpired) {
        toast.error("Verification code expired.");
        return;
      }

      if (otpData.code === otp) {
        verifyMfa();
        toast.success("Identity verified. Accessing Admin Core...");
        navigate('/dashboard');
      } else {
        toast.error("Invalid verification code.");
      }
    } catch (error: any) {
      toast.error("Verification failed. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const resendOtp = async () => {
    if (!pendingUser) return;
    setLoading(true);
    await generateAndSendOtp(pendingUser);
    setLoading(false);
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
        <AnimatePresence mode="wait">
          {!showOtpStep ? (
            <motion.div
              key="login-form"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
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
          ) : (
            <motion.div
              key="otp-form"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="text-center"
            >
              <div className="mb-8">
                <div className="w-20 h-20 bg-cyan/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan/30">
                  <ShieldCheck className="w-10 h-10 text-cyan animate-pulse" />
                </div>
                <h2 className="text-2xl font-black tracking-tighter uppercase italic">Security Protocol 2FA</h2>
                <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest font-bold">Verification code sent via secure link</p>
              </div>

              <form onSubmit={handleOtpVerify} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-cyan uppercase tracking-[0.3em] mb-3">Enter 6-Digit Code</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="000000"
                    required
                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl py-5 text-center text-3xl font-black tracking-[0.5em] focus:border-cyan outline-none transition-all placeholder:text-gray-800"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                  <p className="text-[9px] text-gray-500 mt-3 font-bold uppercase tracking-widest">Code expires in 5 minutes</p>
                </div>

                <div className="space-y-3">
                  <button 
                    type="submit" 
                    disabled={verifyingOtp || otp.length !== 6}
                    className="btn-cyan w-full py-4 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {verifyingOtp ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span className="font-black uppercase tracking-widest">Verify Identity</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                  
                  <button 
                    type="button"
                    onClick={resendOtp}
                    disabled={loading}
                    className="text-[10px] text-gray-500 hover:text-cyan font-black uppercase tracking-widest transition-colors py-2"
                  >
                    Didn't receive code? Resend
                  </button>
                </div>
              </form>

              <button 
                onClick={() => {
                  setShowOtpStep(false);
                  signOut(auth);
                }}
                className="mt-8 text-[9px] text-red/60 hover:text-red font-black uppercase tracking-tight transition-colors"
              >
                Cancel Authentication
              </button>
            </motion.div>
          )}
        </AnimatePresence>
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
