import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, Calendar, Users, MapPin, ExternalLink, X, CheckCircle, Clock, Shield, Star, Megaphone, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { UserProfile, Tournament as TournamentType, TournamentRegistration } from '../types';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, deleteDoc, doc, writeBatch, onSnapshot, where, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';

interface TournamentProps {
  user: UserProfile | null;
}

export default function Tournament({ user }: TournamentProps) {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'official' | 'community'>('official');
  const [showRegForm, setShowRegForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [currentTournament, setCurrentTournament] = useState<TournamentType | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRegistration, setUserRegistration] = useState<TournamentRegistration | null>(null);

  useEffect(() => {
    const fetchActiveTournament = async () => {
      try {
        const q = query(
          collection(db, 'tournaments'), 
          where('status', 'in', ['active', 'upcoming']),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const t = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as TournamentType;
          setCurrentTournament(t);
        }
      } catch (error) {
        console.error("Error fetching active tournament:", error);
      }
    };

    fetchActiveTournament();
  }, []);

  useEffect(() => {
    if (!currentTournament) {
      setRegistrations([]);
      setUserRegistration(null);
      return;
    }

    // Subscribe to registrations for this tournament
    const qRegs = query(
      collection(db, 'tournamentRegistrations'), 
      where('tournamentId', '==', currentTournament.id),
      orderBy('createdAt', 'asc')
    );
    
    const unsubRegs = onSnapshot(qRegs, (snapshot) => {
      const allRegs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TournamentRegistration));
      setRegistrations(allRegs.filter(r => r.status === 'approved' || isAdmin));
      
      if (user) {
        const myReg = allRegs.find(r => r.userId === user.uid);
        setUserRegistration(myReg || null);
      }
    });

    return () => unsubRegs();
  }, [currentTournament, user, isAdmin]);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !currentTournament) {
      toast.error("Please login/Wait for system initialization!");
      return;
    }

    if (registrations.length >= 12) {
      toast.error("Tournament sector is full! Entry denied.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = {
      userId: user.uid,
      tournamentId: currentTournament.id,
      teamName: formData.get('teamName') as string,
      player1: formData.get('player1') as string,
      player2: formData.get('player2') as string,
      player3: formData.get('player3') as string,
      player4: formData.get('player4') as string,
      phone: formData.get('phone') as string,
      status: 'pending',
      createdAt: serverTimestamp()
    };

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'tournamentRegistrations'), data);
      setShowRegForm(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration signal lost. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRegistrationStatus = async (id: string, status: 'approved' | 'denied', denyReason?: string) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'tournamentRegistrations', id), {
        status,
        ...(denyReason && { denyReason }),
        updatedAt: serverTimestamp()
      });
      toast.success(`Protocol updated: ${status}`);
    } catch (error) {
      toast.error("Status update protocol error.");
    }
  };

  const deleteRegistration = async (id: string) => {
    if (!isAdmin) return;
    if (!window.confirm("Terminate this registration data?")) return;
    try {
      await deleteDoc(doc(db, 'tournamentRegistrations', id));
      toast.success("Registration data purged.");
    } catch (error) {
      toast.error("Process termination failed.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-4 tracking-tighter">ESPORTS <span className="neon-text uppercase">Arena</span></h1>
        <p className="text-gray-400 max-w-xl mx-auto uppercase text-[10px] font-bold tracking-[0.2em]">Select your sector and initiate combat registration.</p>
        
        {currentTournament?.scrollingText && (
          <div className="mt-8 overflow-hidden bg-cyan/5 border-y border-cyan/10 py-3 relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0A0A0B] to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0A0A0B] to-transparent z-10" />
            <motion.div 
              animate={{ x: [0, -1000] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="whitespace-nowrap flex items-center space-x-8"
            >
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Star className="w-3 h-3 text-cyan fill-cyan" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan italic">
                    {currentTournament.scrollingText}
                  </span>
                  <Megaphone className="w-3 h-3 text-cyan" />
                </div>
              ))}
            </motion.div>
          </div>
        )}
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
                
                <h2 className="text-4xl font-black text-white mb-6 tracking-tighter uppercase tabular-nums">
                  {currentTournament?.title || 'FREEFIRE BATTLE LEAGUE'}
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <DetailItem label="Schedule" value={currentTournament?.schedule || 'Every Thursday'} />
                  <DetailItem label="Start Time" value={currentTournament?.startTime || '9:00 PM'} />
                  <DetailItem label="Entry Fee" value={currentTournament?.entryFee || 'FREE (0 BDT)'} />
                  <DetailItem label="Platform" value={currentTournament?.platform || 'Mobile'} />
                </div>

                <div className="p-6 bg-cyan/5 border border-cyan/10 rounded-2xl mb-8 backdrop-blur-md">
                  <p className="text-xs text-cyan font-black uppercase tracking-[0.2em] mb-2">Prize Pool Information:</p>
                  <p className="text-sm text-gray-300 font-bold leading-relaxed">
                    {currentTournament?.prizePool || 'Total: 100 Diamonds. 25 Diamonds per player for the winner squad (100 total).'}
                  </p>
                </div>

                {currentTournament?.rules && (
                  <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl mb-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-cyan/10 rounded-lg">
                        <FileText className="w-4 h-4 text-cyan" />
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-white italic">Sector Rules & Protocol</h3>
                    </div>
                    <div className="prose prose-invert prose-cyan max-w-none">
                      <div className="text-sm text-gray-400 font-bold leading-loose markdown-body">
                        <ReactMarkdown>{currentTournament.rules}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  {userRegistration ? (
                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                       <div className="flex items-center justify-between mb-4">
                         <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Your Status</p>
                         <span className={`px-3 py-1 rounded text-[10px] font-black uppercase border ${
                           userRegistration.status === 'approved' ? 'bg-green-500/20 text-green-500 border-green-500/30' :
                           userRegistration.status === 'denied' ? 'bg-red/20 text-red border-red/30' :
                           'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
                         }`}>
                           {userRegistration.status}
                         </span>
                       </div>
                       <div className="space-y-3">
                         <p className="text-xl font-black text-white italic truncate">{userRegistration.teamName}</p>
                         {userRegistration.status === 'denied' && (
                           <div className="p-4 bg-red/10 border border-red/20 rounded-xl space-y-1">
                             <p className="text-[8px] font-black text-red uppercase tracking-widest opacity-60 italic">Denial Intel:</p>
                             <p className="text-xs text-white font-bold italic leading-relaxed">
                               {userRegistration.denyReason || 'No specific reason provided by Command.'}
                             </p>
                           </div>
                         )}
                         {userRegistration.status === 'pending' && (
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic flex items-center">
                             <Clock className="w-3 h-3 mr-2 text-yellow-500" />
                             Awaiting High-Table clearance...
                           </p>
                         )}
                       </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        if (!user) {
                          toast.error("You must be logged in to register!");
                          return;
                        }
                        if (!currentTournament?.registrationActive) {
                          toast.error("REGISTRATION LOCKED: The sector command has currently suspended new entries.");
                          return;
                        }
                        setShowRegForm(true);
                      }}
                      className={`px-12 py-4 flex-1 text-center transition-all ${
                        currentTournament?.registrationActive 
                          ? 'btn-neon' 
                          : 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed uppercase font-black tracking-widest text-xs rounded-xl'
                      }`}
                    >
                      {currentTournament?.registrationActive ? 'Initiate Registration' : 'Registration Closed'}
                    </button>
                  )}
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
                    <div className="h-2 w-32 bg-white/5 rounded-full overflow-hidden">
                      <div className="bg-cyan h-full" style={{ width: `${(registrations.length / 12) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {registrations.map((reg, i) => (
                    <div key={reg.id} className="flex flex-col p-6 bg-white/5 rounded-2xl border border-white/5 group hover:border-cyan/30 transition-all relative overflow-hidden">
                      {isAdmin && (
                        <div className="absolute top-4 right-4 flex space-x-2">
                           <button onClick={() => updateRegistrationStatus(reg.id!, 'approved')} className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle className="w-3 h-3" /></button>
                           <button onClick={() => {
                             const reason = prompt("Denial Reason:");
                             if (reason) updateRegistrationStatus(reg.id!, 'denied', reason);
                           }} className="p-1.5 bg-red/10 text-red rounded-lg border border-red/20 hover:bg-red hover:text-white transition-all"><X className="w-3 h-3" /></button>
                           <button onClick={() => deleteRegistration(reg.id!)} className="p-1.5 bg-white/5 text-gray-500 rounded-lg border border-white/10 hover:bg-red hover:text-white transition-all"><X className="w-3 h-3 rotate-45" /></button>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-[10px] font-black text-gray-600 bg-white/5 w-6 h-6 flex items-center justify-center rounded">#{i + 1}</span>
                        <div className="flex flex-col">
                          <p className="font-black text-base text-white italic truncate">{reg.teamName}</p>
                          <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${
                            reg.status === 'approved' ? 'text-emerald-500' :
                            reg.status === 'denied' ? 'text-red' : 'text-yellow-500'
                          }`}>{reg.status}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-y-2 pt-4 border-t border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Lead</span>
                          <span className="text-[10px] text-cyan font-bold truncate">{reg.player1}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Contact</span>
                          <span className="text-[10px] text-gray-400 font-bold">{reg.phone}</span>
                        </div>
                      </div>
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
                  <p className="text-2xl font-black text-white tracking-widest uppercase mb-1 underline decoration-yellow-500 text-center">
                    {currentTournament?.winnerTeam || 'Diabolic Death Squad'}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                    {currentTournament?.victoryDate ? `Victory achieved on ${currentTournament.victoryDate}` : 'Victory achieved on 24/04'}
                  </p>
                </div>
              </div>

              <div className="stat-panel border-white/5 bg-black/40">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Operational Intel</h4>
                <ul className="space-y-3">
                  {currentTournament?.operationalIntel ? (
                    currentTournament.operationalIntel.split('\n').filter(line => line.trim()).map((line, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-[10px] text-gray-400 font-bold">
                        <CheckCircle className="w-3 h-3 text-cyan mt-0.5 shrink-0" />
                        <span>{line.trim()}</span>
                      </li>
                    ))
                  ) : (
                    <>
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
                    </>
                  )}
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
