import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserProfile, Order, TournamentRegistration } from '../types';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, getDocs, doc, updateDoc, orderBy, limit, where, deleteDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { Users, ShoppingBag, Search, Shield, Zap, Trophy, Trash2, Edit, CheckCircle, Clock, Lock, Flag, XCircle, UserCheck, UserX } from 'lucide-react';

interface AdminProps {
  user: UserProfile;
}

export default function Admin({ user }: AdminProps) {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'orders' | 'tournament'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Tournament Info State
  const [winnerTeam, setWinnerTeam] = useState('');
  const [victoryDate, setVictoryDate] = useState('');
  const [scrollingText, setScrollingText] = useState('');

  // Password Lock State
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passError, setPassError] = useState(false);

  useEffect(() => {
    if (isAdmin && isUnlocked) {
      if (activeTab === 'tournament') {
        fetchTournamentInfo();
      } else {
        fetchData();
      }
    }
  }, [activeTab, isUnlocked]);

  const fetchTournamentInfo = async () => {
    setLoading(true);
    try {
      // Fetch info
      const infoDoc = await getDoc(doc(db, 'tournament_info', 'current'));
      if (infoDoc.exists()) {
        const data = infoDoc.data();
        setWinnerTeam(data.winnerTeam || '');
        setVictoryDate(data.victoryDate || '');
        setScrollingText(data.scrollingText || '');
      }

      // Fetch registrations
      const q = query(collection(db, 'tournamentRegistrations'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setRegistrations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TournamentRegistration)));
    } catch (error) {
      console.error("Error fetching tournament data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateWinnerInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating('winner');
    try {
      await setDoc(doc(db, 'tournament_info', 'current'), {
        winnerTeam,
        victoryDate,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast.success("Tournament winner updated successfully!");
    } catch (error) {
      console.error("Error updating winner info:", error);
      toast.error("Failed to update tournament info.");
    } finally {
      setIsUpdating(null);
    }
  };

  const updateAlertText = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating('alert');
    try {
      await setDoc(doc(db, 'tournament_info', 'current'), {
        scrollingText,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast.success("Alert scroll text updated successfully!");
    } catch (error) {
      console.error("Error updating alert text:", error);
      toast.error("Failed to update alert text.");
    } finally {
      setIsUpdating(null);
    }
  };

  const updateRegistrationStatus = async (regId: string, status: 'approved' | 'denied') => {
    let denyReason = '';
    if (status === 'denied') {
      const reason = prompt("Enter denial reason (optional):");
      if (reason === null) return; // User cancelled
      denyReason = reason;
    }

    setIsUpdating(regId);
    try {
      await updateDoc(doc(db, 'tournamentRegistrations', regId), { 
        status,
        denyReason: status === 'denied' ? denyReason : ''
      });
      toast.success(`Registration ${status}`);
      fetchTournamentInfo();
    } catch (error) {
      toast.error("Failed to update registration");
    } finally {
      setIsUpdating(null);
    }
  };

  const deleteRegistration = async (regId: string) => {
    if (!window.confirm("Delete this registration?")) return;
    try {
      await deleteDoc(doc(db, 'tournamentRegistrations', regId));
      toast.success("Registration deleted");
      fetchTournamentInfo();
    } catch (error) {
      toast.error("Failed to delete registration");
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '1357') {
      setIsUnlocked(true);
      setPassError(false);
      toast.success("Terminal Unlocked. Welcome, Grandmaster.");
    } else {
      setPassError(true);
      setPasscode('');
      toast.error("Invalid Access Code. Terminal remains locked.");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        setUsers(snapshot.docs.map(doc => doc.data() as UserProfile));
      } else {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch administrative data.");
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (targetUserId: string, targetEmail: string, currentRole: string | undefined) => {
    if (user.email !== 'sajewel132@gmail.com') {
      toast.error("Only the Main Admin can manage roles.");
      return;
    }

    if (targetEmail === 'sajewel132@gmail.com') {
      toast.error("Main Admin role cannot be modified.");
      return;
    }

    setIsUpdating(targetUserId);
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await updateDoc(doc(db, 'users', targetUserId), { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update role");
    } finally {
      setIsUpdating(null);
    }
  };

  const updateUserPoints = async (targetUserId: string, currentPoints: number) => {
    const newPoints = prompt("Enter new points:", currentPoints.toString());
    if (newPoints === null) return;
    const points = parseInt(newPoints);
    if (isNaN(points)) return;

    setIsUpdating(targetUserId);
    try {
      await updateDoc(doc(db, 'users', targetUserId), { points });
      toast.success("Points updated successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to update points");
    } finally {
      setIsUpdating(null);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'completed' | 'failed') => {
    setIsUpdating(orderId);
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update order status");
    } finally {
      setIsUpdating(null);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      toast.success("Order deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete order");
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red mx-auto mb-4 opacity-20" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Access Denied</h2>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-bold">Unauthorized operative identified. Terminal locked.</p>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md glass p-8 rounded-[2rem] border-cyan/20 text-center"
        >
          <div className="w-20 h-20 bg-cyan/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan/30">
            <Lock className={`w-10 h-10 ${passError ? 'text-red animate-shake' : 'text-cyan'}`} />
          </div>
          
          <h2 className="text-3xl font-black tracking-tighter uppercase italic mb-2">Terminal <span className="text-cyan">Locked</span></h2>
          <p className="text-gray-400 text-xs uppercase tracking-[0.2em] font-bold mb-8">Level 0 Verification Required</p>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="relative">
              <input 
                type="password" 
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="ENTER ACCESS CODE"
                className={`w-full bg-white/5 border-2 rounded-2xl py-4 text-center text-xl font-black tracking-[0.5em] outline-none transition-all placeholder:text-gray-700 placeholder:tracking-normal placeholder:text-xs ${passError ? 'border-red/50 focus:border-red animate-shake' : 'border-white/10 focus:border-cyan'}`}
                autoFocus
              />
            </div>
            
            <button 
              type="submit"
              className="btn-cyan w-full py-4 flex items-center justify-center space-x-2 group"
            >
              <Zap className="w-5 h-5 group-hover:animate-pulse" />
              <span className="font-black uppercase tracking-widest">Authorize Access</span>
            </button>
          </form>

          <p className="mt-8 text-[9px] text-gray-600 uppercase tracking-widest font-mono">
            Cryptographic handshake active • Layer 3 Encryption
          </p>
        </motion.div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 italic">Admin <span className="text-cyan">Terminal</span></h1>
          <p className="text-gray-400 text-xs uppercase tracking-[0.3em] font-black">Level 0 clearance active: Central Management Core</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-cyan text-dark' : 'text-gray-500 hover:text-white'}`}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-cyan text-dark' : 'text-gray-500 hover:text-white'}`}
          >
            Orders
          </button>
          <button 
            onClick={() => setActiveTab('tournament')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'tournament' ? 'bg-cyan text-dark' : 'text-gray-500 hover:text-white'}`}
          >
            Tournament
          </button>
        </div>
      </div>

      {activeTab !== 'tournament' && (
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:border-cyan outline-none transition-all uppercase text-[10px] font-black tracking-widest"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="glass rounded-[2rem] border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-24 text-center">
            <Zap className="w-12 h-12 text-cyan mx-auto mb-4 animate-pulse" />
            <p className="text-gray-500 text-xs uppercase tracking-widest font-black">Syncing with datastore...</p>
          </div>
        ) : activeTab === 'users' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Operative</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Points / Level</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Joined</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map(u => (
                  <tr key={u.uid} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-sm text-white">{u.username}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-tight">{u.email}</p>
                        {u.role === 'admin' && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-cyan/20 text-cyan text-[8px] font-black uppercase rounded border border-cyan/30">ADMIN</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 text-cyan font-bold">
                          <Zap className="w-3 h-3" />
                          <span className="text-sm">{u.points}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-400 font-bold">
                          <Trophy className="w-3 h-3" />
                          <span className="text-[10px] uppercase">{u.level}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                           onClick={() => updateUserPoints(u.uid, u.points)}
                           className="p-2 hover:bg-cyan/20 text-cyan rounded-lg transition-colors"
                           title="Edit Points"
                         >
                           <Edit className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={() => updateUserRole(u.uid, u.email, u.role)}
                           disabled={isUpdating === u.uid || user.email !== 'sajewel132@gmail.com' || u.email === 'sajewel132@gmail.com'}
                           className={`p-2 rounded-lg transition-colors ${
                             u.role === 'admin' 
                               ? 'text-red hover:bg-red/20' 
                               : 'text-gray-400 hover:bg-white/10'
                           } ${
                             (user.email !== 'sajewel132@gmail.com' || u.email === 'sajewel132@gmail.com') ? 'opacity-50 cursor-not-allowed' : ''
                           }`}
                           title={
                             u.email === 'sajewel132@gmail.com' 
                               ? "Permanent Admin" 
                               : user.email !== 'sajewel132@gmail.com'
                                 ? "Main Admin clearance required"
                                 : u.role === 'admin' ? "Remove Admin" : "Make Admin"
                           }
                         >
                           <Shield className="w-4 h-4" />
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         ) : activeTab === 'orders' ? (
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-white/[0.02] border-b border-white/5">
                   <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Order/User</th>
                   <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Details</th>
                   <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
                   <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {orders.map(o => (
                   <tr key={o.id} className="hover:bg-white/[0.01] transition-colors">
                     <td className="px-6 py-4">
                       <div>
                         <p className="font-bold text-sm text-white">{o.productName}</p>
                         <p className="text-[10px] text-cyan uppercase font-black tracking-widest">৳{o.price}</p>
                       </div>
                     </td>
                     <td className="px-6 py-4">
                       <div className="space-y-0.5">
                         <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">UID: {o.uid}</p>
                         <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">TXID: {o.transactionId}</p>
                       </div>
                     </td>
                     <td className="px-6 py-4 text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
                       <div className={`flex items-center space-x-2 ${
                         o.status === 'completed' ? 'text-green-500' : 
                         o.status === 'failed' ? 'text-red' : 
                         'text-yellow-500'
                       }`}>
                         {o.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : 
                          o.status === 'failed' ? <XCircle className="w-4 h-4" /> : 
                          <Clock className="w-4 h-4" />}
                         <span className="font-black tracking-widest">{o.status}</span>
                       </div>
                     </td>
                     <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end space-x-2">
                         {o.status === 'processing' && (
                           <>
                             <button 
                               onClick={() => updateOrderStatus(o.id!, 'completed')}
                               className="p-2 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors"
                               title="Mark Completed"
                             >
                               <CheckCircle className="w-4 h-4" />
                             </button>
                             <button 
                               onClick={() => updateOrderStatus(o.id!, 'failed')}
                               className="p-2 hover:bg-red/20 text-red rounded-lg transition-colors"
                               title="Mark Failed"
                             >
                               <XCircle className="w-4 h-4" />
                             </button>
                           </>
                         )}
                         <button 
                           onClick={() => deleteOrder(o.id!)}
                           className="p-2 hover:bg-red/20 text-red rounded-lg transition-colors"
                           title="Delete Order"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         ) : (
          <div className="p-8 lg:p-12">
            <div className="max-w-2xl space-y-12">
              {/* Section 1: Tournament Winner Info */}
              <div className="space-y-8">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-cyan/10 rounded-xl border border-cyan/20">
                    <Trophy className="w-6 h-6 text-cyan" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic">Winner <span className="text-cyan">Information</span></h3>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Update previous week winner credentials</p>
                  </div>
                </div>

                <form onSubmit={updateWinnerInfo} className="space-y-6 bg-white/[0.02] p-8 rounded-[2rem] border border-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Winner Team Name</label>
                      <input 
                        type="text" 
                        value={winnerTeam}
                        onChange={e => setWinnerTeam(e.target.value)}
                        placeholder="e.g. Diabolic Death Squad"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 px-6 focus:border-cyan outline-none transition-all text-sm font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Victory Date</label>
                      <input 
                        type="text" 
                        value={victoryDate}
                        onChange={e => setVictoryDate(e.target.value)}
                        placeholder="e.g. 24/04"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 px-6 focus:border-cyan outline-none transition-all text-sm font-bold"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isUpdating === 'winner'}
                    className="btn-cyan px-10 py-3 flex items-center justify-center space-x-2"
                  >
                    {isUpdating === 'winner' ? (
                      <span className="h-4 w-4 border-2 border-dark/20 border-t-dark rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span className="font-black uppercase tracking-widest text-[10px]">Update Winner</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Section 2: Alert Scroll Text */}
              <div className="space-y-8">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-cyan/10 rounded-xl border border-cyan/20">
                    <Flag className="w-6 h-6 text-cyan" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic">Alert <span className="text-cyan">Scroll Text</span></h3>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Update global scrolling broadcast message</p>
                  </div>
                </div>

                <form onSubmit={updateAlertText} className="space-y-6 bg-white/[0.02] p-8 rounded-[2rem] border border-white/5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Scroll Content</label>
                    <textarea 
                      value={scrollingText}
                      onChange={e => setScrollingText(e.target.value)}
                      placeholder="Enter broadcast message..."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 px-6 focus:border-cyan outline-none transition-all text-sm font-bold min-h-[120px] resize-none"
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isUpdating === 'alert'}
                    className="btn-cyan px-10 py-3 flex items-center justify-center space-x-2"
                  >
                    {isUpdating === 'alert' ? (
                      <span className="h-4 w-4 border-2 border-dark/20 border-t-dark rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span className="font-black uppercase tracking-widest text-[10px]">Update Scroll Text</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Live Preview Section */}
              <div className="mt-12 p-8 bg-cyan/5 border border-cyan/10 rounded-[2rem] border-dashed">
                <h4 className="text-[10px] font-black text-cyan uppercase tracking-widest mb-4 flex items-center">
                  <Shield className="w-3 h-3 mr-2" />
                  Live Intel Preview:
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                     <div className="p-3 bg-white/5 rounded-full">
                       <Trophy className="w-6 h-6 text-yellow-500" />
                     </div>
                     <div>
                       <p className="text-lg font-black uppercase text-white">{winnerTeam || '---'}</p>
                       <p className="text-[10px] text-gray-500 font-bold uppercase">Victory: {victoryDate || '---'}</p>
                     </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[10px] text-cyan font-bold uppercase leading-relaxed opacity-70 italic line-clamp-2">
                       {scrollingText || 'No alert text set...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 4: Tournament Registrations */}
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-cyan/10 rounded-xl border border-cyan/20">
                      <Users className="w-6 h-6 text-cyan" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase italic">Tournament <span className="text-cyan">Registrations</span></h3>
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Approve or Deny awaiting operatives</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white">{registrations.length}</p>
                    <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">Total Squads</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {registrations.map((reg) => (
                    <div key={reg.id} className="glass p-6 rounded-[2rem] border-white/5 hover:border-white/10 transition-all group">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-black text-white uppercase italic">{reg.teamName}</h4>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                              reg.status === 'approved' ? 'bg-green-500/20 text-green-500 border-green-500/30' :
                              reg.status === 'denied' ? 'bg-red/20 text-red border-red/30' :
                              'bg-yellow-500/20 text-yellow-500 border-yellow-500/30 font-black animate-pulse'
                            }`}>
                              {reg.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                            <p className="text-[10px] text-gray-400 font-bold uppercase"><span className="text-gray-600">L1:</span> {reg.player1}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase"><span className="text-gray-600">P2:</span> {reg.player2}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase"><span className="text-gray-600">P3:</span> {reg.player3}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase"><span className="text-gray-600">P4:</span> {reg.player4}</p>
                          </div>
                          {reg.status === 'denied' && reg.denyReason && (
                            <p className="text-[10px] text-red font-bold uppercase p-2 bg-red/10 rounded-lg border border-red/20">
                              <span className="text-red/60 mr-2 italic">Deny Reason:</span> {reg.denyReason}
                            </p>
                          )}
                          <p className="text-[10px] text-cyan font-black uppercase tracking-widest flex items-center">
                            <span className="text-gray-600 mr-2">Contact:</span> {reg.phone}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          {reg.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => updateRegistrationStatus(reg.id!, 'approved')}
                                className="p-3 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-dark rounded-xl transition-all border border-green-500/20"
                                title="Approve Squad"
                              >
                                <UserCheck className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => updateRegistrationStatus(reg.id!, 'denied')}
                                className="p-3 bg-red/10 hover:bg-red text-red hover:text-dark rounded-xl transition-all border border-red/20"
                                title="Deny Squad"
                              >
                                <UserX className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => deleteRegistration(reg.id!)}
                            className="p-3 bg-white/5 hover:bg-red text-gray-400 hover:text-white rounded-xl transition-all border border-white/10"
                            title="Delete Registration"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {registrations.length === 0 && (
                    <div className="py-12 text-center glass rounded-[2rem] border-dashed border-white/5">
                       <Users className="w-12 h-12 text-gray-700 mx-auto mb-4 opacity-20" />
                       <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">No squad deployments found in sector.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
