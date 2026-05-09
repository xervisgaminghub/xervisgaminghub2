import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, Calendar, Users, MapPin, ExternalLink, X, CheckCircle, Clock, Shield, Star, Megaphone, FileText, Lock, MessageSquare, DollarSign } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'official' | 'community'>('community');
  const [tournaments, setTournaments] = useState<TournamentType[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<TournamentType | null>(null);
  const [showRegForm, setShowRegForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRegistration, setUserRegistration] = useState<TournamentRegistration | null>(null);
  const [globalScrollingText, setGlobalScrollingText] = useState('');

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'tournament_info', 'current'), (doc) => {
      if (doc.exists()) {
        setGlobalScrollingText(doc.data().scrollingText || '');
      }
    });
    return () => unsubSettings();
  }, []);

  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'tournaments'), 
          where('status', '!=', 'archived'),
          orderBy('status', 'asc'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const tList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TournamentType));
        setTournaments(tList);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  useEffect(() => {
    if (!selectedTournament) {
      setRegistrations([]);
      setUserRegistration(null);
      return;
    }

    const qRegs = query(
      collection(db, 'tournamentRegistrations'), 
      where('tournamentId', '==', selectedTournament.id),
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
  }, [selectedTournament, user, isAdmin]);

  const filteredTournaments = tournaments.filter(t => activeTab === 'official' ? t.isOfficial : !t.isOfficial);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !selectedTournament) {
      toast.error("Please login/Wait for system initialization!");
      return;
    }

    if (registrations.length >= 12) {
      toast.error("Tournament sector is full! Entry denied.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    
    const registrationData: any = {
      userId: user.uid,
      tournamentId: selectedTournament.id,
      teamName: formData.get('teamName') as string,
      player1Name: formData.get('player1Name') as string,
      player1UID: formData.get('player1UID') as string,
      player2Name: formData.get('player2Name') as string,
      player2UID: formData.get('player2UID') as string,
      player3Name: formData.get('player3Name') as string,
      player3UID: formData.get('player3UID') as string,
      player4Name: formData.get('player4Name') as string,
      player4UID: formData.get('player4UID') as string,
      phone: formData.get('phone') as string,
      status: 'pending',
      createdAt: serverTimestamp()
    };

    if (selectedTournament.isPaid) {
      const txid = formData.get('transactionId') as string;
      if (!txid) {
        toast.error("Transaction ID is required for paid tournaments!");
        return;
      }
      registrationData.transactionId = txid;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'tournamentRegistrations'), registrationData);
      setShowRegForm(false);
      setShowSuccessModal(true);

      // Redirect to WhatsApp for paid tournaments with registration summary
      if (selectedTournament.isPaid) {
        const summary = `Tournament: ${selectedTournament.title}\nTeam: ${registrationData.teamName}\nLeader: ${registrationData.player1Name}\nUID: ${registrationData.player1UID}\nPhone: ${registrationData.phone}\nTXID: ${registrationData.transactionId}`;
        const encoded = encodeURIComponent(summary);
        window.open(`https://wa.me/8801977768511?text=${encoded}`, '_blank');
      }
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
        
        {globalScrollingText && (
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
                    {globalScrollingText}
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
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {!selectedTournament ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTournaments.map(t => (
                  <motion.div 
                    key={t.id}
                    whileHover={{ scale: 1.02 }}
                    className="glass rounded-3xl border-white/5 overflow-hidden group cursor-pointer"
                    onClick={() => setSelectedTournament(t)}
                  >
                    <div className="h-48 relative">
                      <img 
                        src="https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=800" 
                        alt={t.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-50"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent" />
                      <div className="absolute top-4 right-4 bg-cyan/20 backdrop-blur-md px-3 py-1 rounded-lg border border-cyan/30">
                        <span className="text-[8px] font-black uppercase text-cyan tracking-widest">{t.status}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight group-hover:text-cyan transition-colors">{t.title}</h3>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="space-y-1">
                          <p className="text-[10px] text-gray-500 font-black uppercase">Prize Pool</p>
                          <p className="text-xs font-bold text-white leading-tight line-clamp-1">{t.prizePool}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-gray-500 font-black uppercase">Platform</p>
                          <p className="text-xs font-bold text-white">{t.platform}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-gray-500 font-black uppercase">Schedule</p>
                          <p className="text-xs font-bold text-white">{t.schedule}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-gray-500 font-black uppercase">Starts</p>
                          <p className="text-xs font-bold text-white">{t.startTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5 font-black uppercase text-[10px] tracking-widest">
                        <span className={t.isPaid ? 'text-yellow-500' : 'text-emerald-500'}>
                          {t.isPaid ? `৳${t.entryFeeAmount} Entry` : 'Free Entry'}
                        </span>
                        <div className="flex items-center text-cyan group-hover:translate-x-1 transition-transform">
                          <span>View Details</span>
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {loading && [1,2,3].map(i => (
                  <div key={i} className="h-96 glass rounded-3xl animate-pulse" />
                ))}
                {!loading && filteredTournaments.length === 0 && (
                  <div className="col-span-full py-24 text-center">
                    {activeTab === 'official' ? (
                      <div className="space-y-6">
                        <Trophy className="w-20 h-20 text-gray-700 mx-auto opacity-30" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest">No official tournament registration yet.</h2>
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
                      </div>
                    ) : (
                      <p className="text-gray-500 font-black uppercase tracking-widest italic">No tournament dossiers detected.</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Back Button */}
                <div className="col-span-full">
                  <button 
                    onClick={() => setSelectedTournament(null)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-white transition-colors group mb-6"
                  >
                    <X className="w-4 h-4 group-hover:-rotate-90 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-[0.3em]">Back to Archive</span>
                  </button>
                </div>

                {/* Tournament Details */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="glass p-8 lg:p-12 rounded-3xl border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Trophy className="w-32 h-32 text-cyan" />
                    </div>
                    
                    <h2 className="text-4xl font-black text-white mb-6 tracking-tighter uppercase tabular-nums">
                      {selectedTournament.title}
                    </h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                      <DetailItem label="Schedule" value={selectedTournament.schedule} />
                      <DetailItem label="Start Time" value={selectedTournament.startTime} />
                      <DetailItem label="Entry Fee" value={selectedTournament.isPaid ? `৳${selectedTournament.entryFeeAmount}` : selectedTournament.entryFee || 'FREE'} />
                      <DetailItem label="Platform" value={selectedTournament.platform} />
                    </div>

                    <div className="p-6 bg-cyan/5 border border-cyan/10 rounded-2xl mb-8 backdrop-blur-md">
                      <p className="text-xs text-cyan font-black uppercase tracking-[0.2em] mb-2">Prize Pool Information:</p>
                      <p className="text-sm text-gray-300 font-bold leading-relaxed">
                        {selectedTournament.prizePool}
                      </p>
                    </div>

                    {selectedTournament.rules && (
                      <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl mb-8">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="p-2 bg-cyan/10 rounded-lg">
                            <FileText className="w-4 h-4 text-cyan" />
                          </div>
                          <h3 className="text-sm font-black uppercase tracking-widest text-white italic">Sector Rules & Protocol</h3>
                        </div>
                        <div className="prose prose-invert prose-cyan max-w-none">
                          <div className="text-sm text-gray-400 font-bold leading-loose markdown-body">
                            <ReactMarkdown>{selectedTournament.rules}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ID and Password Section */}
                    {userRegistration?.status === 'approved' && (
                      <div className="p-8 bg-black/40 border border-cyan/20 rounded-3xl mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Lock className="w-16 h-16 text-cyan" />
                        </div>
                        <div className="flex items-center space-x-3 mb-6 text-cyan">
                          <Shield className="w-5 h-5" />
                          <h3 className="text-lg font-black uppercase italic tracking-widest">Enclave Access Intel</h3>
                        </div>
                        {selectedTournament.isIdPassLocked ? (
                          <div className="flex flex-col items-center justify-center py-4 text-center">
                            <Lock className="w-10 h-10 text-gray-600 mb-3" />
                            <p className="text-xs text-gray-500 font-black uppercase tracking-[0.2em]">Intel Sector Locked by Command</p>
                            <p className="text-[10px] text-gray-600 mt-2">Access codes will be decrypted shortly before deployment start.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Room ID</p>
                              <p className="text-xl font-black text-white tracking-[0.2em]">{selectedTournament.roomId || 'DECRYPTING...'}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Password</p>
                              <p className="text-xl font-black text-white tracking-[0.2em]">{selectedTournament.password || 'DECRYPTING...'}</p>
                            </div>
                          </div>
                        )}
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
                             {userRegistration.status === 'approved' && (
                               <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest italic flex items-center">
                                 <CheckCircle className="w-3 h-3 mr-2" />
                                 Cleared for deployment. Check ID/PASS section above.
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
                            if (!selectedTournament?.registrationActive) {
                              toast.error("REGISTRATION LOCKED: The sector command has currently suspended new entries.");
                              return;
                            }
                            setShowRegForm(true);
                          }}
                          className={`px-12 py-4 flex-1 text-center transition-all ${
                            selectedTournament?.registrationActive 
                              ? 'btn-neon' 
                              : 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed uppercase font-black tracking-widest text-xs rounded-xl'
                          }`}
                        >
                          {selectedTournament?.registrationActive ? 'Initiate Registration' : 'Registration Closed'}
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
                          
                          <div className="grid grid-cols-2 gap-y-2 pt-4 border-t border-white/5 text-[10px]">
                            <div className="flex flex-col col-span-2 mb-2">
                              <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest italic">Squad Dossier</span>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 font-bold text-gray-400">
                                <span>{reg.player1Name}</span>
                                <span>{reg.player2Name}</span>
                                <span>{reg.player3Name}</span>
                                <span>{reg.player4Name}</span>
                              </div>
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
                    <h4 className="text-[10px] font-black text-cyan uppercase tracking-widest mb-4">Winner History</h4>
                    <div className="flex flex-col items-center py-4">
                      <div className="relative mb-4">
                        <Trophy className="w-16 h-16 text-yellow-500 animate-pulse" />
                        <div className="absolute inset-0 blur-xl bg-yellow-500/20 rounded-full"></div>
                      </div>
                      <p className="text-2xl font-black text-white tracking-widest uppercase mb-1 underline decoration-yellow-500 text-center">
                        {selectedTournament.winnerTeam || 'TBD'}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                        {selectedTournament.victoryDate ? `Victory achieved on ${selectedTournament.victoryDate}` : 'Awaiting Outcome'}
                      </p>
                    </div>
                  </div>

                  <div className="stat-panel border-white/5 bg-black/40">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Operational Intel</h4>
                    <ul className="space-y-3">
                      {selectedTournament.operationalIntel ? (
                        selectedTournament.operationalIntel.split('\n').filter(line => line.trim()).map((line, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-[10px] text-gray-400 font-bold">
                            <CheckCircle className="w-3 h-3 text-cyan mt-0.5 shrink-0" />
                            <span>{line.trim()}</span>
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="flex items-start space-x-2 text-[10px] text-gray-400 font-bold">
                            <CheckCircle className="w-3 h-3 text-cyan mt-0.5 shrink-0" />
                            <span>Authentication: UID and IGN must match</span>
                          </li>
                        </>
                      )}
                      <li className="flex items-start space-x-2 text-[10px] text-gray-400 font-bold">
                        <Shield className="w-3 h-3 text-cyan mt-0.5 shrink-0" />
                        <span>Security: Fair play protocol active</span>
                      </li>
                      <li className="flex items-start space-x-2 text-[10px] text-gray-400 font-bold">
                        <MessageSquare className="w-3 h-3 text-cyan mt-0.5 shrink-0" />
                        <span>Support: WhatsApp 01977768511</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      {/* Registration Modal */}
      <AnimatePresence>
        {showRegForm && selectedTournament && (
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
              className="relative w-full max-w-xl glass p-8 rounded-3xl border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button 
                onClick={() => setShowRegForm(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-8">
                <h3 className="text-2xl font-black text-white mb-2 tracking-tighter uppercase">Combat Registration Form</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic">{selectedTournament.title}</p>
                {selectedTournament.isPaid && (
                  <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                    <p className="text-[10px] text-yellow-500 font-black uppercase tracking-widest mb-2 flex items-center">
                      <DollarSign className="w-3 h-3 mr-1" /> Payment Required: ৳{selectedTournament.entryFeeAmount}
                    </p>
                    <p className="text-[8px] text-gray-400 font-bold uppercase leading-relaxed">
                      Please complete payment to bKash/Nagad (01977768511) and provide the Transaction ID below. After submission, you will be redirected to WhatsApp for clearance.
                    </p>
                  </div>
                )}
              </div>
              
              <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center">
                    <Star className="w-3 h-3 mr-2 text-cyan" /> Team Name
                  </label>
                  <input name="teamName" required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-cyan text-sm outline-none transition-all font-bold" />
                </div>

                <div className="space-y-4">
                  <h4 className="text-[8px] font-black text-cyan uppercase tracking-[0.2em] mb-2 border-b border-white/5 pb-1">Operative Alpha (Leader)</h4>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">In-game Name</label>
                    <input name="player1Name" required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-cyan text-sm outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Player UID</label>
                    <input name="player1UID" required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-cyan text-sm outline-none transition-all" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 border-b border-white/5 pb-1">Operative Bravo</h4>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">In-game Name</label>
                    <input name="player2Name" required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-cyan text-sm outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Player UID</label>
                    <input name="player2UID" required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-cyan text-sm outline-none transition-all" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 border-b border-white/5 pb-1">Operative Charlie</h4>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">In-game Name</label>
                    <input name="player3Name" required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-cyan text-sm outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Player UID</label>
                    <input name="player3UID" required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-cyan text-sm outline-none transition-all" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 border-b border-white/5 pb-1">Operative Delta</h4>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">In-game Name</label>
                    <input name="player4Name" required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-cyan text-sm outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Player UID</label>
                    <input name="player4UID" required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-cyan text-sm outline-none transition-all" />
                  </div>
                </div>

                <div className="col-span-full pt-4 border-t border-white/5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center">
                    <MessageSquare className="w-3 h-3 mr-2 text-cyan" /> WhatsApp Contact
                  </label>
                  <input name="phone" placeholder="e.g. 017xxxxxxxx" required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-cyan text-sm outline-none transition-all" />
                </div>

                {selectedTournament.isPaid && (
                  <div className="col-span-full">
                    <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-2 flex items-center">
                      <Zap className="w-3 h-3 mr-2" /> Transaction ID (TXID)
                    </label>
                    <input name="transactionId" required className="w-full bg-yellow-500/5 border border-yellow-500/20 p-3 rounded-xl focus:border-yellow-500 text-sm outline-none transition-all font-mono" />
                  </div>
                )}

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
                        <span>Confirm Enrollment</span>
                      </>
                    )}
                  </button>
                  <p className="text-[8px] text-center text-gray-600 mt-4 font-black uppercase tracking-widest italic leading-relaxed">
                    By confirming enrollment, you agree to comply with all segment rules and fair-play protocols. Any data breach will result in immediate disqualification.
                  </p>
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
