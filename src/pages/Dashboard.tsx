import { motion } from 'motion/react';
import { UserProfile, Order } from '../types';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Zap, Trophy, Users, History, Copy, Gift, User } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface DashboardProps {
  user: UserProfile;
}

export default function Dashboard({ user }: DashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const snapshot = await getDocs(q);
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user.uid]);

  const copyReferral = () => {
    navigator.clipboard.writeText(user.referralCode);
    toast.success("Referral code copied!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-black mb-2">Welcome Back, <span className="neon-text">{user.username}</span></h1>
        <p className="text-gray-400">Manage your account and track your rewards.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Points Card */}
        <div className="stat-panel relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-16 h-16 text-cyan" />
          </div>
          <p className="stat-label mb-1">Total Points</p>
          <h2 className="stat-value text-4xl mb-2">{user.points.toLocaleString()}</h2>
          <div className="flex items-center space-x-2 text-[10px] text-cyan font-bold uppercase tracking-widest">
            <Gift className="w-3 h-3" />
            <span>{user.points / 10} BDT Value</span>
          </div>
        </div>

        {/* Level Card */}
        <div className="stat-panel border-red/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy className="w-16 h-16 text-red" />
          </div>
          <p className="stat-label mb-1">Current Level</p>
          <h2 className="text-4xl font-black text-red drop-shadow-[0_0_10px_rgba(255,0,51,0.5)] mb-2">{user.level}</h2>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-red h-full" style={{ width: `${(user.points % 100)}%` }}></div>
          </div>
          <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-widest font-bold">{(100 - (user.points % 100))} points to next level</p>
        </div>

        {/* Referral Card */}
        <div className="stat-panel border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-16 h-16 text-white" />
          </div>
          <p className="stat-label mb-1">Referral Code</p>
          <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg border border-white/5 mb-2">
            <span className="font-mono text-lg font-bold tracking-widest">{user.referralCode}</span>
            <button onClick={copyReferral} className="p-1.5 hover:bg-white/10 rounded transition-colors">
              <Copy className="w-4 h-4 text-cyan" />
            </button>
          </div>
          <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Earn 20 points per referral</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="glass p-8 rounded-3xl border-white/10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl flex items-center space-x-2">
              <History className="w-5 h-5 text-cyan" />
              <span>Recent Orders</span>
            </h3>
            <Link to="/store" className="text-xs text-cyan hover:underline uppercase tracking-widest font-bold">New Order</Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-xl"></div>)}
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-cyan/20 transition-all">
                  <div>
                    <p className="font-bold text-sm">{order.productName}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-cyan">{order.price} BDT</p>
                    <span className={`text-[10px] uppercase tracking-widest font-black ${order.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">No orders found yet.</p>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="glass p-8 rounded-3xl border-white/10">
          <h3 className="text-xl mb-8 flex items-center space-x-2">
            <User className="w-5 h-5 text-cyan" />
            <span>Profile Details</span>
          </h3>
          <div className="space-y-6">
            <DetailItem label="Full Name" value={user.name} />
            <DetailItem label="Email Address" value={user.email} />
            <DetailItem label="Phone Number" value={user.phone || 'Not provided'} />
            <DetailItem label="Member Since" value={new Date(user.createdAt).toLocaleDateString()} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col space-y-1">
      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
