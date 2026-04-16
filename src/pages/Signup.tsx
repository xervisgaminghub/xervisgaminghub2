import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, increment } from 'firebase/firestore';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Mail, Lock, User, Phone, CheckCircle2, Users } from 'lucide-react';
import { generateGamingUsername } from '../services/geminiService';
import { sendUserDataToSheet } from '../services/webhookService';

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    phone: '',
    referralCode: '',
    confirm18: false,
    acceptTerms: false
  });
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.confirm18 || !formData.acceptTerms) {
      toast.error("Please accept the terms and confirm your age.");
      return;
    }
    if (parseInt(formData.age) < 18) {
      toast.error("You must be 18+ to join.");
      return;
    }

    setLoading(true);
    try {
      let referrerUid = null;
      let referrerCode = null;

      // Validate Referral Code if provided
      if (formData.referralCode.trim()) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('referralCode', '==', formData.referralCode.trim().toUpperCase()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          toast.error("Invalid referral code.");
          setLoading(false);
          return;
        }
        
        const referrerDoc = querySnapshot.docs[0];
        referrerUid = referrerDoc.id;
        referrerCode = formData.referralCode.trim().toUpperCase();
      }

      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Generate AI Username
      const username = await generateGamingUsername(formData.name);

      const userData = {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        age: parseInt(formData.age),
        phone: formData.phone,
        username: username,
        points: referrerUid ? 20 : 10, // 10 Base + 10 Referral bonus if referred
        level: 'Silver',
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        referredBy: referrerCode || null,
        referralCount: 0,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      // Reward Referrer
      if (referrerUid) {
        await updateDoc(doc(db, 'users', referrerUid), {
          points: increment(20),
          referralCount: increment(1)
        });
      }

      await sendUserDataToSheet(userData);

      if (referrerCode) {
        toast.success(`Welcome to the Hub, ${username}! Referral applied: +10 Bonus Points!`);
      } else {
        toast.success(`Welcome to the Hub, ${username}!`);
      }
      
      navigate('/dashboard');
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
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        const username = await generateGamingUsername(user.displayName || 'Gamer');
        const userData = {
          uid: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          age: 18, // Default for Google
          phone: '',
          username: username,
          points: 10,
          level: 'Silver',
          referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', user.uid), userData);
        await sendUserDataToSheet(userData);
      }
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
          src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070" 
          alt="Signup BG" 
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
          <h2 className="text-3xl font-black tracking-tighter uppercase underline decoration-cyan decoration-4 underline-offset-8">CREATE ACCOUNT</h2>
          <p className="text-gray-400 text-sm mt-2">Join the elite gaming community</p>
        </div>

        <form onSubmit={handleSignup} className="space-x-0 space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Full Name" 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-cyan outline-none transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-cyan outline-none transition-all"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="password" 
              placeholder="Password" 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-cyan outline-none transition-all"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <input 
                type="number" 
                placeholder="Age" 
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-cyan outline-none transition-all"
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Phone (Opt)" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-cyan outline-none transition-all"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Referral Code (Optional)" 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-cyan outline-none transition-all uppercase"
              value={formData.referralCode}
              onChange={e => setFormData({...formData, referralCode: e.target.value})}
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="hidden"
                checked={formData.confirm18}
                onChange={e => setFormData({...formData, confirm18: e.target.checked})}
              />
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.confirm18 ? 'bg-cyan border-cyan' : 'border-white/20 group-hover:border-cyan'}`}>
                {formData.confirm18 && <CheckCircle2 className="w-4 h-4 text-dark" />}
              </div>
              <span className="text-xs text-gray-400">I confirm that I am 18 years or older</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="hidden"
                checked={formData.acceptTerms}
                onChange={e => setFormData({...formData, acceptTerms: e.target.checked})}
              />
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.acceptTerms ? 'bg-cyan border-cyan' : 'border-white/20 group-hover:border-cyan'}`}>
                {formData.acceptTerms && <CheckCircle2 className="w-4 h-4 text-dark" />}
              </div>
              <span className="text-xs text-gray-400">
                I accept the <Link to="/terms" className="text-cyan hover:underline">Terms & Conditions</Link>
              </span>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-neon w-full mt-6 py-4 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Initialize Profile'}
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
          Already a member? <Link to="/login" className="text-cyan font-bold hover:underline">Login here</Link>
        </p>
      </motion.div>
    </div>
  );
}
