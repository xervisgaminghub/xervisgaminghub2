import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserProfile, Order } from '../types';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, getDocs, doc, updateDoc, orderBy, limit, where, deleteDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { Users, ShoppingBag, Search, Shield, Zap, Trophy, Trash2, Edit, CheckCircle, Clock, Lock, Flag } from 'lucide-react';

interface AdminProps {
  user: UserProfile;
}

export default function Admin({ user }: AdminProps) {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'orders' | 'tournament'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Tournament Info State
  const [winnerTeam, setWinnerTeam] = useState('');
  const [victoryDate, setVictoryDate] = useState('');

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
      const infoDoc = await getDoc(doc(db, 'tournament_info', 'current'));
      if (infoDoc.exists()) {
        const data = infoDoc.data();
        setWinnerTeam(data.winnerTeam || '');
        setVictoryDate(data.victoryDate || '');
      }
    } catch (error) {
      console.error("Error fetching tournament info:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTournamentInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating('tournament');
    try {
      await setDoc(doc(db, 'tournament_info', 'current'), {
        winnerTeam,
        victoryDate,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast.success("Tournament winner updated successfully!");
    } catch (error) {
      console.error("Error updating tournament info:", error);
      toast.error("Failed to update tournament info.");
    } finally {
      setIsUpdating(null);
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

  const updateUserRole = async (targetUserId: string, currentRole: string | undefined) => {
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

  const updateOrderStatus = async (orderId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'processing' ? 'completed' : 'processing';
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
                           onClick={() => updateUserRole(u.uid, u.role)}
                           disabled={isUpdating === u.uid}
                           className={`p-2 rounded-lg transition-colors ${u.role === 'admin' ? 'text-red hover:bg-red/20' : 'text-gray-400 hover:bg-white/10'}`}
                           title={u.role === 'admin' ? "Remove Admin" : "Make Admin"}
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
                       <div className={`flex items-center space-x-2 ${o.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>
                         {o.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                         <span className="font-black tracking-widest">{o.status}</span>
                       </div>
                     </td>
                     <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end space-x-2">
                         <button 
                           onClick={() => updateOrderStatus(o.id!, o.status)}
                           className={`p-2 rounded-lg transition-colors ${o.status === 'completed' ? 'text-yellow-500 hover:bg-yellow-500/20' : 'text-green-500 hover:bg-green-500/20'}`}
                           title="Toggle Status"
                         >
                           <CheckCircle className="w-4 h-4" />
                         </button>
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
            <div className="max-w-2xl">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-cyan/10 rounded-xl border border-cyan/20">
                  <Flag className="w-6 h-6 text-cyan" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic">Tournament <span className="text-cyan">Information</span></h3>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Update previous week winner and other operational intel</p>
                </div>
              </div>

              <form onSubmit={updateTournamentInfo} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Previous Week Winner Team</label>
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

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isUpdating === 'tournament'}
                    className="btn-cyan px-12 py-4 flex items-center justify-center space-x-2"
                  >
                    {isUpdating === 'tournament' ? (
                      <span className="h-4 w-4 border-2 border-dark/20 border-t-dark rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span className="font-black uppercase tracking-widest">Deploy Updates</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-12 p-6 bg-cyan/5 border border-cyan/10 rounded-2xl border-dashed">
                <h4 className="text-[10px] font-black text-cyan uppercase tracking-widest mb-2 flex items-center">
                  <Shield className="w-3 h-3 mr-2" />
                  Live Preview Data:
                </h4>
                <div className="flex items-center space-x-4">
                   <div className="p-3 bg-white/5 rounded-full">
                     <Trophy className="w-6 h-6 text-yellow-500" />
                   </div>
                   <div>
                     <p className="text-lg font-black uppercase text-white">{winnerTeam || '---'}</p>
                     <p className="text-[10px] text-gray-500 font-bold uppercase">Achieved on: {victoryDate || '---'}</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
         )}
      </div>
    </div>
  );
}
