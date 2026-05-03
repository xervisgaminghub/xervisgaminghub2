import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, Calendar, Users, MapPin, ExternalLink, X, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { toast } from 'sonner';

interface Registration {
  id: string;
  teamName: string;
  player1: string;
  createdAt: any;
}

interface TournamentProps {
  user: UserProfile | null;
}

export default function Tournament({ user }: TournamentProps) {
  const [activeTab, setActiveTab] = useState<'official' | 'community'>('official');
  const [showRegForm, setShowRegForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.email === 'mdmasumofficial7@gmail.com';

  useEffect(() => {
    fetchRegistrations();
  }, []);

  useEffect(() => {
    if (activeTab === 'official') {
      toast("No official tournament registration yet.", {
        description: "Status: Standby mode active.",
        duration: 3000
      });
    }
  }, [activeTab]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'tournamentRegistrations'), orderBy('createdAt', 'asc'), limit(12));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
      setRegistrations(data);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearRegistrations = async () => {
    if (!isAdmin) return;
    if (!window.confirm("Are you sure you want to CLEAR ALL registrations? This cannot be undone.")) return;

    setIsClearing(true);
    try {
      const batch = writeBatch(db);
      registrations.forEach((reg) => {
        batch.delete(doc(db, 'tournamentRegistrations', reg.id));
      });
      await batch.commit();
      setRegistrations([]);
      toast.success("All registrations have been cleared.");
      fetchRegistrations();
    } catch (error) {
      console.error("Error clearing registrations:", error);
      toast.error("Failed to clear registrations.");
    } finally {
      setIsClearing(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to register!");
      return;
    }

    if (registrations.length >= 12) {
      toast.error("Tournament is full! Max 12 teams allowed.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = {
      userId: user.uid,
      teamName: formData.get('teamName') as string,
      player1: formData.get('player1') as string,
      player2: formData.get('player2') as string,
      player3: formData.get('player3') as string,
      player4: formData.get('player4') as string,
      phone: formData.get('phone') as string,
      createdAt: serverTimestamp()
    };

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'tournamentRegistrations'), data);
      setShowRegForm(false);
      setShowSuccessModal(true);
      fetchRegistrations();
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-4 tracking-tighter">ESPORTS <span className="neon-text uppercase">Arena</span></h1>
        <p className="text-gray-400 max-w-xl mx-auto uppercase text-[10px] font-bold tracking-[0.2em]">Select your sector and initiate combat registration.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-12">
        <div className="bg-white/5 p-1 rounded-2xl flex border border-white/10">
          <button 
            onClick={() => setActiveTab('official')}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'official' ? 'bg-cyan text-dark shadow-[0_0_20px_rgba(0,255,255,0.3)]' : 'text-gray-400 hover:text-white'}`}
          >
            Official Tournament
          </button>
          <button 
            onClick={() => setActiveTab('community')}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'community' ? 'bg-cyan text-dark shadow-[0_0_20px_rgba(0,255,255,0.3)]' : 'text-gray-400 hover:text-white'}`}
          >
            Our Tournaments
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'official' ? (
          <motion.div
            key="official"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-24 glass rounded-3xl border-dashed border-white/10"
          >
            <Trophy className="w-20 h-20 text-gray-700 mx-auto mb-6 opacity-30" />
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4">No official tournament registration yet.</h2>
            <div className="max-w-md mx-auto p-6 bg-black/40 border border-white/5 rounded-2xl">
              <p className="text-sm text-gray-400 mb-6 font-bold uppercase tracking-wider">
                To watch Official Tournament Click on Live Stream button.
              </p>
              <a 
                href="https://www.youtube.com/@ffesportsbdofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-red w-full flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Live Stream</span>
              </a>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="community"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Tournament Details */}
            <div className="lg:col-span-2 space-y-8">
              <div className="glass p-8 lg:p-12 rounded-3xl border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Trophy className="w-32 h-32 text-cyan" />
                </div>
                
                <h2 className="text-4xl font-black text-white mb-6 tracking-tighter">FREEFIRE <span className="text-cyan">BATTLE LEAGUE</span></h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <DetailItem label="Schedule" value="Every Thursday" />
                  <DetailItem label="Start Time" value="9:00 PM" />
                  <DetailItem label="Entry Fee" value="FREE (0 BDT)" />
                  <DetailItem label="Platform" value="Mobile" />
                </div>

                <div className="p-6 bg-cyan/5 border border-cyan/10 rounded-2xl mb-8 backdrop-blur-md">
                  <p className="text-xs text-cyan font-black uppercase tracking-[0.2em] mb-2">Prize Pool Information:</p>
                  <p className="text-sm text-gray-300 font-bold leading-relaxed">
                    Total: 100 Diamonds. 25 Diamonds per player for the winner squad (100 total).
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => {
                      if (!user) {
                        toast.error("You must be logged in to register!");
                        return;
                      }
                      setShowRegForm(true);
                    }}
                    className="btn-neon px-12 py-4 flex-1 text-center"
                  >
                    Initiate Registration
                  </button>
                </div>
              </div>

              {/* Registered Teams */}
              <div className="glass p-8 rounded-3xl border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black flex items-center space-x-3">
                    <Users className="w-5 h-5 text-cyan" />
                    <span>Registered Operatives ({registrations.length}/12)</span>
                  </h3>
                  <div className="flex items-center space-x-4">
                    {isAdmin && registrations.length > 0 && (
                      <button 
                        onClick={clearRegistrations}
                        disabled={isClearing}
                        className="text-[10px] font-black text-red hover:text-white uppercase tracking-widest px-3 py-1 border border-red/30 rounded hover:bg-red transition-all flex items-center space-x-1"
                      >
                        {isClearing ? 'Clearing...' : 'Clear All'}
                      </button>
                    )}
                    <div className="h-2 w-32 bg-white/5 rounded-full overflow-hidden">
                      <div className="bg-cyan h-full" style={{ width: `${(registrations.length / 12) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {registrations.map((reg, i) => (
                    <div key={reg.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-black text-gray-500">#{i + 1}</span>
                        <p className="font-bold text-sm text-white">{reg.teamName}</p>
                      </div>
                      <span className="text-[10px] text-cyan font-black uppercase tracking-widest">{reg.player1}</span>
                    </div>
                  ))}
                  {registrations.length === 0 && (
                    <p className="col-span-full text-center py-8 text-gray-600 font-bold uppercase text-[10px] tracking-widest">No deployments detected.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              <div className="stat-panel border-cyan/20 bg-cyan/5">
                <h4 className="text-[10px] font-black text-cyan uppercase tracking-widest mb-4">Previous Week Winner</h4>
                <div className="flex flex-col items-center py-4">
                  <div className="relative mb-4">
                    <Trophy className="w-16 h-16 text-yellow-500 animate-pulse" />
                    <div className="absolute inset-0 blur-xl bg-yellow-500/20 rounded-full"></div>
                  </div>
                  <p className="text-2xl font-black text-white tracking-widest uppercase mb-1 underline decoration-yellow-500 text-center">Diabolic Death Squad</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Victory achieved on 24/04</p>
                </div>
              </div>

              <div className="stat-panel border-white/5 bg-black/40">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Operational Intel</h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2 text-[10px] text-gray-400 font-bold">
                    <CheckCircle className="w-3 h-3 text-cyan mt-0.5 shrink-0" />
                    <span>Mode: Battle Royale (Squad)</span>
                  </li>
                  <li className="flex items-start space-x-2 text-[10px] text-gray-400 font-bold">
                    <CheckCircle className="w-3 h-3 text-cyan mt-0.5 shrink-0" />
                    <span>Map: Bermuda / Alpine</span>
                  </li>
                  <li className="flex items-start space-x-2 text-[10px] text-gray-400 font-bold">
                    <CheckCircle className="w-3 h-3 text-cyan mt-0.5 shrink-0" />
                    <span>Verification: In-game IDs must match registration data</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration Modal */}
      <AnimatePresence>
        {showRegForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark/95 backdrop-blur-md"
              onClick={() => setShowRegForm(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg glass p-8 rounded-3xl border-white/10"
            >
              <button 
                onClick={() => setShowRegForm(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-black text-white mb-8 tracking-tighter uppercase">Combat Registration Form</h3>
              
              <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-full">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Team Name</label>
                  <input name="teamName" required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-cyan text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Leader Name (Player 1)</label>
                  <input name="player1" required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-cyan text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Player 2</label>
                  <input name="player2" required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-cyan text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Player 3</label>
                  <input name="player3" required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-cyan text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Player 4</label>
                  <input name="player4" required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-cyan text-sm outline-none transition-all" />
                </div>
                <div className="col-span-full">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">WhatsApp/Contact Number</label>
                  <input name="phone" required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-cyan text-sm outline-none transition-all" />
                </div>

                <div className="col-span-full pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn-cyan w-full py-4 flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <span className="h-4 w-4 border-2 border-dark/20 border-t-dark rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        <span>Confirm Deployment</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark/95 backdrop-blur-xl"
              onClick={() => setShowSuccessModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md glass p-10 rounded-3xl border-cyan/30 text-center"
            >
              <div className="w-20 h-20 bg-cyan/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-cyan animate-bounce" />
              </div>
              <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">MISSION ACCREDITED</h3>
              <p className="text-gray-400 mb-8 font-bold uppercase text-xs tracking-widest leading-relaxed">
                Congratulations! your registration has been completed. Your squad is now queued for deployment in the Battle League.
              </p>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="btn-cyan w-full py-4 tracking-[0.3em]"
              >
                RETURN TO HQ
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-black text-white">{value}</p>
    </div>
  );
}
