import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { User, Lock, Phone, AtSign, Save, ShieldCheck, Mail } from 'lucide-react';

export default function Settings() {
  const { user, firebaseUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    phone: user?.phone || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (!user || !firebaseUser) return null;

  const isPasswordUser = firebaseUser.providerData.some(p => p.providerId === 'password');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // If username changed, check for uniqueness
      if (profileForm.username !== user.username) {
        const q = query(collection(db, 'users'), where('username', '==', profileForm.username));
        const snap = await getDocs(q);
        if (!snap.empty) {
          toast.error("Username already taken. Access denied.");
          setLoading(false);
          return;
        }
      }

      await updateDoc(doc(db, 'users', user.uid), {
        name: profileForm.name,
        username: profileForm.username,
        phone: profileForm.phone
      });
      toast.success("Profile synchronized with central database.");
    } catch (error: any) {
      toast.error("Profile synchronization failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (!firebaseUser.email) return;

      const credential = EmailAuthProvider.credential(firebaseUser.email, passwordForm.currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, passwordForm.newPassword);
      
      toast.success("Security credentials updated successfully.");
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error("Authentication override failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
          <ShieldCheck className="text-cyan w-10 h-10" />
          <span>Account <span className="neon-text">Settings</span></span>
        </h1>
        <p className="text-gray-400">Modify your identity coordinates and security protocols.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Form */}
        <section className="glass p-8 rounded-3xl border-white/10">
          <h3 className="text-xl mb-8 flex items-center space-x-2 font-black italic">
            <User className="w-5 h-5 text-cyan" />
            <span>Identity Profile</span>
          </h3>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-cyan outline-none transition-all text-sm font-bold"
                  value={profileForm.name}
                  onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">Gaming Alias (Username)</label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-cyan outline-none transition-all text-sm font-bold"
                  value={profileForm.username}
                  onChange={e => setProfileForm({...profileForm, username: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">Email Address (Read-only)</label>
              <div className="relative opacity-50">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none text-sm font-bold cursor-not-allowed"
                  value={user.email}
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">Comms Protocol (Phone)</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text"
                  placeholder="e.g. +880123456789"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-cyan outline-none transition-all text-sm font-bold"
                  value={profileForm.phone}
                  onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-neon w-full flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Synchronizing...' : 'Update Identity'}</span>
            </button>
          </form>
        </section>

        {/* Password Form */}
        <section className="glass p-8 rounded-3xl border-white/10 relative overflow-hidden">
          {!isPasswordUser && (
            <div className="absolute inset-0 z-10 bg-dark/80 backdrop-blur-[2px] flex items-center justify-center p-8 text-center">
              <div className="space-y-4">
                <ShieldCheck className="w-12 h-12 text-cyan mx-auto opacity-50" />
                <p className="text-sm font-bold text-gray-400">This account is authorized via Google. Secondary access keys are not required.</p>
              </div>
            </div>
          )}
          <h3 className="text-xl mb-8 flex items-center space-x-2 font-black italic">
            <Lock className="w-5 h-5 text-red" />
            <span>Security Override</span>
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-red/50 focus:border-red outline-none transition-all text-sm font-bold"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  required={isPasswordUser}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">New Access Key (Password)</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="password"
                  minLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-cyan outline-none transition-all text-sm font-bold"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  required={isPasswordUser}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">Confirm Access Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-cyan outline-none transition-all text-sm font-bold"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  required={isPasswordUser}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !isPasswordUser}
              className="w-full py-4 bg-red/10 border border-red/30 text-red rounded-xl font-black uppercase tracking-widest hover:bg-red hover:text-white transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Processing...' : 'Change Access Key'}</span>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
