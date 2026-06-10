import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { EsportsTeam, TeamApplication } from '../types';
import { toast } from 'sonner';
import { 
  Users, Shield, Send, CheckCircle, Clock, XCircle, AlertCircle, 
  ChevronRight, Award, MessageSquare, Clipboard, User, Star, Plus, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function JoinTeam() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<EsportsTeam[]>([]);
  const [applications, setApplications] = useState<TeamApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<EsportsTeam | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    inGameName: '',
    uid: '',
    idLevel: '',
    preferredRole: 'Assaulter',
    whatsAppNumber: '',
    previousExperience: 'No' as 'Yes' | 'No',
    prevTeamName: '',
    prevRole: '',
    prevPlayDuration: ''
  });

  useEffect(() => {
    fetchTeams();
    if (user) {
      fetchMyApplications();
    }
  }, [user]);

  const fetchTeams = async () => {
    try {
      const snap = await getDocs(collection(db, 'esportsTeams'));
      const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as EsportsTeam));
      fetched.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setTeams(fetched);
    } catch (error) {
      console.error("Error fetching esports teams:", error);
    } finally {
      if (!user) setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'teamApplications'), 
        where('userId', '==', user.uid)
      );
      const snap = await getDocs(q);
      const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamApplication));
      fetched.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setApplications(fetched);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApply = (team: EsportsTeam) => {
    const alreadyApplied = applications.some(app => app.teamId === team.id && app.status !== 'rejected');
    if (alreadyApplied) {
      toast.info(`You already have an active application for ${team.name}`);
      return;
    }
    setSelectedTeam(team);
    setIsApplying(true);
    setFormData({
      name: user?.name || '',
      inGameName: '',
      uid: '',
      idLevel: '',
      preferredRole: 'Assaulter',
      whatsAppNumber: user?.phone || '',
      previousExperience: 'No',
      prevTeamName: '',
      prevRole: '',
      prevPlayDuration: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!selectedTeam) return;

    if (!formData.name.trim() || !formData.inGameName.trim() || !formData.uid.trim() || !formData.idLevel.trim() || !formData.whatsAppNumber.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (formData.previousExperience === 'Yes' && (!formData.prevTeamName.trim() || !formData.prevRole.trim() || !formData.prevPlayDuration.trim())) {
      toast.error("Please specify your previous team experience fields.");
      return;
    }

    setSubmitting(true);
    try {
      const applicationData = {
        teamId: selectedTeam.id!,
        teamName: selectedTeam.name,
        userId: user.uid,
        userEmail: user.email,
        name: formData.name,
        inGameName: formData.inGameName,
        uid: formData.uid,
        idLevel: formData.idLevel,
        preferredRole: formData.preferredRole,
        whatsAppNumber: formData.whatsAppNumber,
        previousExperience: formData.previousExperience,
        ...(formData.previousExperience === 'Yes' ? {
          prevTeamName: formData.prevTeamName,
          prevRole: formData.prevRole,
          prevPlayDuration: formData.prevPlayDuration
        } : {}),
        status: 'pending' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'teamApplications'), applicationData);
      toast.success(`Application submitted to ${selectedTeam.name} successfully!`);
      setIsApplying(false);
      setSelectedTeam(null);
      fetchMyApplications();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit esports application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-cyan mx-auto mb-4 animate-bounce" />
          <p className="text-gray-400 font-black text-xs uppercase tracking-[0.2em]">Syncing Recruitment Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
      {/* Header Container */}
      <div className="text-center max-w-2xl mx-auto mb-16 relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-10 blur-3xl w-48 h-48 bg-cyan-400 rounded-full pointer-events-none"></div>
        <div className="inline-flex items-center space-x-2 bg-cyan/10 border border-cyan/20 px-4 py-1.5 rounded-full mb-4">
          <Award className="w-3.5 h-3.5 text-cyan animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan">Build Your Esports Career</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-4">
          Esports <span className="text-cyan drop-shadow-[0_0_15px_rgba(0,255,85,0.4)]">Recruitment</span>
        </h1>
        <p className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-wide leading-relaxed">
          Submit your application to participate in our top-tier competitive rosters. Complete the form to get scouted by team captains.
        </p>
      </div>

      {!user ? (
        <div className="max-w-md mx-auto glass p-8 rounded-[2rem] border-cyan/20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/5 rounded-full blur-3xl pointer-events-none"></div>
          <Users className="w-16 h-16 text-cyan/30 mx-auto mb-6" />
          <h2 className="text-2xl font-black uppercase italic mb-2">Registration Locked</h2>
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-8">You must be logged in to access esports recruitment programs.</p>
          <div className="flex flex-col space-y-3">
            <Link to="/login" className="btn-cyan w-full py-4 text-center">
              <span className="font-black uppercase tracking-widest text-dark">Login Now</span>
            </Link>
            <Link to="/signup" className="text-gray-400 hover:text-white text-xs font-black uppercase tracking-widest">
              Create an Account
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Active Recruitments */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-black italic uppercase tracking-wider flex items-center space-x-3 text-white mb-2">
              <Users className="w-5 h-5 text-cyan" />
              <span>Available Teams</span>
            </h2>

            {teams.filter(t => t.recruitmentOpen).length === 0 ? (
              <div className="glass p-12 text-center rounded-3xl border-white/5">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-sm font-bold uppercase text-gray-500 tracking-wider">Recruitment Is Temporarily Closed</p>
                <p className="text-[10px] uppercase text-gray-600 tracking-widest mt-1">Check back later or contact management</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teams.filter(t => t.recruitmentOpen).map(team => {
                  const alreadyApplied = applications.some(app => app.teamId === team.id && app.status !== 'rejected');
                  return (
                    <motion.div 
                      key={team.id}
                      whileHover={{ scale: 1.01, y: -2 }}
                      className="glass p-6 rounded-3xl border-white/5 flex flex-col justify-between relative overflow-hidden group"
                    >
                      {/* Stadium Glow design accent */}
                      <div className="absolute -top-12 -right-12 w-24 h-24 bg-cyan/5 rounded-full blur-2xl group-hover:bg-cyan/10 transition-colors duration-500"></div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-black text-white italic uppercase">{team.name}</h3>
                          <span className="bg-green-500/10 border border-green-500/20 text-green-500 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                            Recruiting
                          </span>
                        </div>
                        <p className="text-gray-400 text-[11px] leading-relaxed mb-6">
                          {team.description || "Looking for highly skilled competitive shooters. Roles and dynamic updates will be provided via active communication channels."}
                        </p>
                      </div>

                      <button 
                        onClick={() => handleOpenApply(team)}
                        disabled={alreadyApplied}
                        className={`w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          alreadyApplied 
                            ? 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed' 
                            : 'bg-cyan/10 hover:bg-cyan border border-cyan/20 hover:text-dark hover:border-cyan hover:shadow-[0_0_15px_rgba(0,255,85,0.25)] text-cyan active:scale-[0.98]'
                        }`}
                      >
                        {alreadyApplied ? "Already Applied" : "Submit Roster Application"}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Application Modal Form */}
            <AnimatePresence>
              {isApplying && selectedTeam && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
                >
                  <motion.div 
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="glass w-full max-w-2xl rounded-3xl border-cyan/25 overflow-hidden my-8 max-h-[90vh] flex flex-col"
                  >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-cyan">Applying For</p>
                        <h3 className="text-xl font-black italic uppercase text-white">{selectedTeam.name}</h3>
                      </div>
                      <button 
                        onClick={() => { setIsApplying(false); setSelectedTeam(null); }}
                        className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Form Layout */}
                    <form onSubmit={handleSubmit} className="flex-grow p-6 overflow-y-auto space-y-6 custom-scrollbar text-left text-sm">
                      {/* Section Title */}
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic border-b border-white/5 pb-2">1. Personal & Game Information</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Real Name *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Enter your real name"
                            className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 focus:border-cyan outline-none text-white text-xs"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">In Game Name (IGN) *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. SKY-WARRIOR"
                            className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 focus:border-cyan outline-none text-white text-xs"
                            value={formData.inGameName}
                            onChange={e => setFormData({ ...formData, inGameName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">UID (Gaming ID) *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. 1572948625"
                            className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 focus:border-cyan outline-none text-white text-xs"
                            value={formData.uid}
                            onChange={e => setFormData({ ...formData, uid: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">In Game Level *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Level 74"
                            className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 focus:border-cyan outline-none text-white text-xs"
                            value={formData.idLevel}
                            onChange={e => setFormData({ ...formData, idLevel: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Preferred Role *</label>
                          <select 
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-cyan outline-none text-white text-xs"
                            value={formData.preferredRole}
                            onChange={e => setFormData({ ...formData, preferredRole: e.target.value })}
                          >
                            <option value="Assaulter" className="bg-dark text-white">Assaulter</option>
                            <option value="Sniper" className="bg-dark text-white">Sniper</option>
                            <option value="IGL (In-Game Leader)" className="bg-dark text-white">IGL</option>
                            <option value="Support" className="bg-dark text-white">Support</option>
                            <option value="All Rounder" className="bg-dark text-white">All Rounder</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">WhatsApp Number *</label>
                          <input 
                            type="tel" 
                            required
                            placeholder="e.g. +8801700000000"
                            className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 focus:border-cyan outline-none text-white text-xs animate-pulse-border"
                            value={formData.whatsAppNumber}
                            onChange={e => setFormData({ ...formData, whatsAppNumber: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Section Experience */}
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic border-b border-white/5 pb-2 pt-2">2. Previous Experience</p>

                      <div className="space-y-3">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Have you ever been part of an esports team? *</label>
                        <div className="flex space-x-4">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, previousExperience: 'Yes' })}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                              formData.previousExperience === 'Yes'
                                ? 'bg-cyan/15 border-cyan text-cyan'
                                : 'bg-black/40 border-white/5 text-gray-400'
                            }`}
                          >
                            Yes, I have
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, previousExperience: 'No' })}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                              formData.previousExperience === 'No'
                                ? 'bg-cyan/15 border-cyan text-cyan'
                                : 'bg-black/40 border-white/5 text-gray-400'
                            }`}
                          >
                            No, None
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {formData.previousExperience === 'Yes' && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden space-y-4 pt-2"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Previous Team Name *</label>
                                <input 
                                  type="text" 
                                  required={formData.previousExperience === 'Yes'}
                                  placeholder="Enter team name"
                                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 focus:border-cyan outline-none text-white text-xs"
                                  value={formData.prevTeamName}
                                  onChange={e => setFormData({ ...formData, prevTeamName: e.target.value })}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Role in Previous Team *</label>
                                <input 
                                  type="text" 
                                  required={formData.previousExperience === 'Yes'}
                                  placeholder="e.g. Lead Assaulter"
                                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 focus:border-cyan outline-none text-white text-xs"
                                  value={formData.prevRole}
                                  onChange={e => setFormData({ ...formData, prevRole: e.target.value })}
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Time Spent With Previous Team *</label>
                              <input 
                                type="text" 
                                required={formData.previousExperience === 'Yes'}
                                placeholder="e.g. 6 Months / 1 Year"
                                className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 focus:border-cyan outline-none text-white text-xs"
                                value={formData.prevPlayDuration}
                                onChange={e => setFormData({ ...formData, prevPlayDuration: e.target.value })}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Footer Actions */}
                      <div className="flex space-x-3 pt-4 border-t border-white/5 md:justify-end">
                        <button
                          type="button"
                          onClick={() => { setIsApplying(false); setSelectedTeam(null); }}
                          className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="flex-grow md:flex-none px-8 py-3 bg-cyan text-dark hover:bg-cyan/90 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,255,85,0.4)] transition-all flex items-center justify-center space-x-2"
                        >
                          {submitting ? (
                            <>
                              <Clock className="w-4 h-4 animate-spin" />
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Submit Application</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Application Status History column */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-black italic uppercase tracking-wider flex items-center space-x-3 text-white mb-2">
              <Clipboard className="w-5 h-5 text-pink-500" />
              <span>Application Status</span>
            </h2>

            {applications.length === 0 ? (
              <div className="glass p-8 text-center rounded-3xl border-white/5">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">No Active Applications</p>
                <p className="text-[9px] text-gray-600 uppercase tracking-widest mt-2">
                  Apply for open rosters on the left to track progress here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map(app => (
                  <div 
                    key={app.id}
                    className="glass p-5 rounded-3xl border-white/5 space-y-4 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Esports Division</span>
                        <h4 className="text-xs font-black uppercase text-white italic">{app.teamName}</h4>
                      </div>

                      {/* Status Tracker and indicators */}
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center space-x-1 border ${
                        app.status === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                        app.status === 'rejected' ? 'bg-red/10 border-red/20 text-red' :
                        app.status === 'hold' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                        'bg-cyan/10 border-cyan/20 text-cyan animate-pulse'
                      }`}>
                        {app.status === 'approved' && <CheckCircle className="w-2.5 h-2.5 mr-1 inline" />}
                        {app.status === 'rejected' && <XCircle className="w-2.5 h-2.5 mr-1 inline" />}
                        {app.status === 'hold' && <AlertCircle className="w-2.5 h-2.5 mr-1 inline" />}
                        {app.status === 'pending' && <Clock className="w-2.5 h-2.5 mr-1 inline" />}
                        <span>{app.status}</span>
                      </span>
                    </div>

                    {/* Meta values */}
                    <div className="bg-black/25 rounded-2xl p-3 text-left space-y-1 text-[10px] text-gray-400 font-mono">
                      <p>IGN : <span className="text-white font-bold">{app.inGameName}</span></p>
                      <p>UID : <span className="text-white font-bold">{app.uid}</span></p>
                      <p>ROLE: <span className="text-cyan font-bold">{app.preferredRole}</span></p>
                    </div>

                    {/* Explanations text based on status */}
                    <div className="text-[10px] leading-relaxed font-bold uppercase tracking-tight">
                      {app.status === 'pending' && (
                        <p className="text-cyan/80">
                          ⚡ Status: Scouts are analyzing your stats. Make sure your WhatsApp is reachable!
                        </p>
                      )}
                      {app.status === 'approved' && (
                        <div className="space-y-3">
                          <p className="text-green-500">
                            🎉 Recruited! You survived the selection process. Get ready to lock in with your matches.
                          </p>
                          <a 
                            href="https://wa.me/8801977768511" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center space-x-2 w-full py-2 bg-green-500 border border-green-600 text-dark rounded-xl font-black text-[9px] tracking-widest hover:brightness-110 transition-all uppercase"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Contact Team Manager</span>
                          </a>
                        </div>
                      )}
                      {app.status === 'hold' && (
                        <p className="text-yellow-500">
                          ⏳ Status: On Hold. Play more matches and increase your level BDT rank to unlock approval.
                        </p>
                      )}
                      {app.status === 'rejected' && (
                        <p className="text-gray-500">
                          ❌ Status: Not accepted. Keep training on custom matches to try next season.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
