import { motion } from 'motion/react';
import { UserProfile, Order } from '../types';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Zap, Trophy, Users, History, Copy, Gift, User, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  user: UserProfile;
}

export default function Dashboard({ user }: DashboardProps) {
  const { isAdmin } = useAuth();
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
        <div className="stat-panel border-white/5 relative overflow-hidden group lg:col-span-3 bg-black/40 backdrop-blur-3xl shadow-[inset_0_0_40px_rgba(255,255,255,0.02)]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy className="w-16 h-16 text-cyan" />
          </div>
          <p className="stat-label mb-1">Current Level</p>
          <h2 className="text-4xl font-black text-cyan drop-shadow-[0_0_15px_rgba(0,229,255,0.3)] mb-2">{user.level}</h2>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
            <div className="bg-cyan h-full shadow-[0_0_10px_rgba(0,229,255,0.5)]" style={{ width: `${(user.points % 100)}%` }}></div>
          </div>
          <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-widest font-bold">{(100 - (user.points % 100))} points to next level</p>
        </div>

        {isAdmin && (
          <Link to="/admin" className="lg:col-span-3">
            <div className="stat-panel border-cyan/20 bg-cyan/5 relative overflow-hidden group hover:bg-cyan/10 transition-all cursor-pointer">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield className="w-16 h-16 text-cyan" />
              </div>
              <p className="stat-label mb-1 text-cyan">Administrative Access</p>
              <h2 className="text-2xl font-black text-white uppercase italic">Open Admin Panel</h2>
              <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-widest font-bold font-mono">Manage Users • Orders • Site Config</p>
            </div>
          </Link>
        )}
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
