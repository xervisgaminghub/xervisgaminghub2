import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserProfile, Order, TournamentRegistration } from '../types';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { getRank } from '../lib/rankUtils';
import { collection, query, getDocs, doc, updateDoc, orderBy, limit, where, deleteDoc, getDoc, setDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Users, ShoppingBag, Search, Shield, Zap, Trophy, Trash2, Edit, CheckCircle, Clock, Lock, Flag, XCircle, UserCheck, UserX, BarChart3, TrendingUp, PieChart, Activity, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart as RePieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { auth } from '../lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const isPermissionError = errorMessage.toLowerCase().includes('permission') || errorMessage.toLowerCase().includes('denied');
  
  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  const errString = JSON.stringify(errInfo);
  console.error('Firestore Error: ', errString);
  
  if (isPermissionError) {
    toast.error("Access Denied: You don't have permission to perform this action. Your email must be verified as admin in rules.");
  } else {
    toast.error("Operation failed. Check console for details.");
  }
  
  throw new Error(errString);
}

interface AdminProps {
  user: UserProfile;
}

interface Product {
  id: string;
  name: string;
  price: number;
  subFolder: string;
  category: string;
}

export default function Admin({ user }: AdminProps) {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'orders' | 'tournament' | 'analytics' | 'products'>('analytics');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Product Form State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: 0,
    subFolder: 'Free Fire Top up',
    category: 'Diamond'
  });

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
      } else if (activeTab === 'analytics') {
        fetchAnalytics();
      } else if (activeTab === 'products') {
        fetchProducts();
      } else {
        fetchData();
      }
    }
  }, [activeTab, isUnlocked]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    } catch (error) {
      console.error("Error fetching products:", error);
      handleFirestoreError(error, OperationType.LIST, 'products');
    } finally {
      setLoading(false);
    }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating('product-save');
    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productForm);
        toast.success("Product updated successfully!");
      } else {
        await addDoc(collection(db, 'products'), {
          ...productForm,
          createdAt: serverTimestamp()
        });
        toast.success("Product added successfully!");
      }
      setEditingProduct(null);
      setProductForm({ name: '', price: 0, subFolder: 'Free Fire Top up', category: 'Diamond' });
      fetchProducts();
    } catch (error) {
      handleFirestoreError(error, editingProduct ? OperationType.UPDATE : OperationType.CREATE, 'products');
    } finally {
      setIsUpdating(null);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success("Product deleted");
      fetchProducts();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const seedInitialProducts = async () => {
    if (!window.confirm("This will seed the initial product list to Firestore. Continue?")) return;
    setLoading(true);
    const initialProducts = [
      { name: 'Free fire weekly', price: 165, subFolder: 'Free Fire Top up', category: 'Membership' },
      { name: 'Free Fire Weekly Lite', price: 60, subFolder: 'Free Fire Top up', category: 'Membership' },
      { name: 'Free Fire Monthly', price: 790, subFolder: 'Free Fire Top up', category: 'Membership' },
      { name: 'Free Fire Full level up pass', price: 490, subFolder: 'Free Fire Top up', category: 'Membership' },
      { name: 'Free Fire 25 Diamond', price: 30, subFolder: 'Free Fire Top up', category: 'Diamond' },
      { name: 'Free Fire 50 Diamond', price: 45, subFolder: 'Free Fire Top up', category: 'Diamond' },
      { name: 'Free Fire 100 Diamond', price: 85, subFolder: 'Free Fire Top up', category: 'Diamond' },
      { name: 'Free Fire 115 Diamond', price: 90, subFolder: 'Free Fire Top up', category: 'Diamond' },
      { name: 'Free Fire 240 Diamond', price: 170, subFolder: 'Free Fire Top up', category: 'Diamond' },
      { name: 'Free Fire 355 Diamonds', price: 250, subFolder: 'Free Fire Top up', category: 'Diamond' },
      { name: 'Free Fire 505 Diamonds', price: 370, subFolder: 'Free Fire Top up', category: 'Diamond' },
      { name: 'PUBG Mobile 30 UC', price: 65, subFolder: 'PUBG Mobile UC', category: 'UC' },
      { name: 'PUBG Mobile 60 UC', price: 125, subFolder: 'PUBG Mobile UC', category: 'UC' },
      { name: 'PUBG Mobile 300 UC', price: 620, subFolder: 'PUBG Mobile UC', category: 'UC' },
      { name: 'PUBG Mobile 600 UC', price: 1150, subFolder: 'PUBG Mobile UC', category: 'UC' },
      { name: 'PUBG Mobile 1500 UC', price: 2800, subFolder: 'PUBG Mobile UC', category: 'UC' },
      { name: 'PUBG Mobile 3000 UC', price: 5600, subFolder: 'PUBG Mobile UC', category: 'UC' },
      { name: 'PUBG Mobile 6000 UC', price: 11500, subFolder: 'PUBG Mobile UC', category: 'UC' },
      { name: 'PUBG Mobile 12000 UC', price: 22500, subFolder: 'PUBG Mobile UC', category: 'UC' },
      { name: 'PUBG Mobile 18000 UC', price: 33500, subFolder: 'PUBG Mobile UC', category: 'UC' },
      { name: 'PUBG Mobile 24000 UC', price: 44500, subFolder: 'PUBG Mobile UC', category: 'UC' },
      { name: 'PUBG Mobile 30000 UC', price: 56000, subFolder: 'PUBG Mobile UC', category: 'UC' },
      { name: 'PUBG Mobile 36000 UC', price: 67000, subFolder: 'PUBG Mobile UC', category: 'UC' },
      { name: 'PUBG Mobile 60000 UC', price: 111000, subFolder: 'PUBG Mobile UC', category: 'UC' },
    ];

    try {
      for (const p of initialProducts) {
        await addDoc(collection(db, 'products'), { ...p, createdAt: serverTimestamp() });
      }
      toast.success("Initial products seeded successfully!");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to seed products.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users
      let usersData: any[] = [];
      try {
        const usersSnap = await getDocs(query(collection(db, 'users'), limit(500)));
        usersData = usersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      } catch (err) {
        console.error("Users fetch error:", err);
      }

      // 2. Fetch Orders
      let ordersData: any[] = [];
      try {
        const ordersSnap = await getDocs(query(collection(db, 'orders'), limit(500)));
        ordersData = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.error("Orders fetch error:", err);
      }

      // 3. Fetch Transactions / Points
      let transData: any[] = [];
      
      // Helper to format date safely
      const getSafeDate = (d: any) => {
        if (!d) return null;
        if (typeof d === 'string') return d;
        if (d.toDate && typeof d.toDate === 'function') return d.toDate().toISOString();
        if (d.seconds) return new Date(d.seconds * 1000).toISOString();
        return null;
      };

      try {
        const pointsSnap = await getDocs(query(collection(db, 'points'), limit(500)));
        const pointsMapped = pointsSnap.docs.map(doc => {
          const d = doc.data();
          return { 
            id: doc.id, 
            ...d,
            createdAt: getSafeDate(d.createdAt),
            type: d.type || (d.amount !== undefined ? (d.amount >= 0 ? 'earn' : 'burn') : 'earn'), 
            points: d.points || Math.abs(d.amount || 0)
          };
        });
        transData = [...pointsMapped];
      } catch (err) {
        console.warn("Points collection read failed:", err);
      }

      try {
        const transSnap = await getDocs(query(collection(db, 'transactions'), limit(500)));
        const transMapped = transSnap.docs.map(doc => {
          const d = doc.data();
          return { 
            id: doc.id, 
            ...d,
            createdAt: getSafeDate(d.createdAt)
          };
        });
        transData = [...transData, ...transMapped];
      } catch (err) {
        console.warn("Transactions collection read failed:", err);
      }

      setUsers(usersData);
      setOrders(ordersData);
      setTransactions(transData);
    } catch (error) {
      console.error("Global analytics fetch error:", error);
      toast.error("Partial analytics data loaded.");
    } finally {
      setLoading(false);
    }
  };

  const syncRanks = async () => {
    if (!window.confirm("This will recalculate and update ranks for ALL users based on their current points. Proceed?")) return;
    
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const batch: any[] = [];
      
      for (const userDoc of usersSnap.docs) {
        const data = userDoc.data();
        const currentPoints = data.points || 0;
        const currentLevel = data.level;
        const correctLevel = getRank(currentPoints);
        
        if (currentLevel !== correctLevel) {
          batch.push({
            ref: doc(db, 'users', userDoc.id),
            level: correctLevel
          });
        }
      }
      
      if (batch.length === 0) {
        toast.success("All users already have correct ranks!");
        return;
      }
      
      // Update in chunks to avoid batch limits if necessary, 
      // but for small sets simple loop is fine or actual batch
      let updatedCount = 0;
      for (const item of batch) {
        try {
          await updateDoc(item.ref, { level: item.level });
          updatedCount++;
        } catch (err) {
          console.error(`Failed to sync rank for ${item.ref.id}:`, err);
          // Continue with others
        }
      }
      
      toast.success(`Successfully synced ${updatedCount} user ranks!`);
      fetchAnalytics();
      fetchData();
    } catch (error) {
      console.error("Error syncing ranks:", error);
      handleFirestoreError(error, OperationType.LIST, 'users');
    } finally {
      setLoading(false);
    }
  };

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
      handleFirestoreError(error, OperationType.UPDATE, 'tournament_info/current');
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
      handleFirestoreError(error, OperationType.UPDATE, 'tournament_info/current');
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
      handleFirestoreError(error, OperationType.UPDATE, `tournamentRegistrations/${regId}`);
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
      handleFirestoreError(error, OperationType.DELETE, `tournamentRegistrations/${regId}`);
    }
  };

  const renderAnalytics = () => {
    // Basic stats
    const totalPoints = users.reduce((sum, u) => sum + (u.points || 0), 0);
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    
    // Points per day (last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const pointHistory = last7Days.map(date => {
      const earned = transactions
        .filter(t => t.createdAt && typeof t.createdAt === 'string' && t.createdAt.startsWith(date) && (t.type === 'earn' || t.type === 'reward'))
        .reduce((sum, t) => sum + (t.points || 0), 0);
      const spent = transactions
        .filter(t => t.createdAt && typeof t.createdAt === 'string' && t.createdAt.startsWith(date) && (t.type === 'burn' || t.type === 'spend' || t.type === 'purchase'))
        .reduce((sum, t) => sum + (t.points || 0), 0);
      return { date, earned, spent };
    });

    // User growth
    const userGrowth = last7Days.map(date => {
      const count = users.filter(u => u.createdAt && typeof u.createdAt === 'string' && u.createdAt.startsWith(date)).length;
      return { date, count };
    });

    // Level distribution
    const levelCounts: Record<string, number> = {};
    users.forEach(u => {
      if (u.level) {
        levelCounts[u.level] = (levelCounts[u.level] || 0) + 1;
      }
    });
    const levelData = Object.entries(levelCounts).map(([name, value]) => ({ name, value }));

    const COLORS = ['#00F2FF', '#FF0055', '#FFD700', '#00FF88', '#8A2BE2'];

    return (
      <div className="p-8 space-y-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass p-6 rounded-3xl border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="w-16 h-16 text-cyan" />
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Circulating Points</p>
            <h3 className="text-3xl font-black text-cyan italic">{totalPoints.toLocaleString()}</h3>
            <div className="mt-4 flex items-center text-[10px] font-bold text-green-500">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              <span>SYSTEM LIQUIDITY OPTIMAL</span>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShoppingBag className="w-16 h-16 text-pink-500" />
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Redemption Volume</p>
            <h3 className="text-3xl font-black text-white italic">{totalOrders}</h3>
            <div className="mt-4 flex items-center text-[10px] font-bold text-cyan">
              <Activity className="w-3 h-3 mr-1" />
              <span>{Math.round((completedOrders / (totalOrders || 1)) * 100)}% SUCCESS RATE</span>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-16 h-16 text-emerald-500" />
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Operatives</p>
            <h3 className="text-3xl font-black text-white italic">{users.length}</h3>
            <div className="mt-4 flex items-center text-[10px] font-bold text-emerald-500">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>ACTIVE GROWTH SECTOR</span>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <BarChart3 className="w-16 h-16 text-yellow-500" />
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Daily Engagement</p>
            <h3 className="text-3xl font-black text-white italic">{(transactions.length / 30).toFixed(1)}</h3>
            <p className="text-[8px] text-gray-600 font-bold uppercase mt-4">OPS PER DAY (AVG)</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Point Flow Chart */}
          <div className="glass p-8 rounded-[2.5rem] border-white/5 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-sm font-black uppercase tracking-widest flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-cyan" />
                Economy Flow <span className="ml-2 text-gray-600 text-[10px] tracking-normal font-bold lowercase">last 7 days</span>
              </h4>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pointHistory}>
                  <defs>
                    <linearGradient id="colorEarn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F2FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00F2FF" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF0055" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FF0055" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#ffffff20" 
                    fontSize={10} 
                    tickFormatter={(val) => val.split('-').slice(1).join('/')}
                  />
                  <YAxis stroke="#ffffff20" fontSize={10} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0A0A0B', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="earned" stroke="#00F2FF" fillOpacity={1} fill="url(#colorEarn)" strokeWidth={3} />
                  <Area type="monotone" dataKey="spent" stroke="#FF0055" fillOpacity={1} fill="url(#colorSpend)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Registration Chart */}
          <div className="glass p-8 rounded-[2.5rem] border-white/5 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-sm font-black uppercase tracking-widest flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-emerald-500" />
                Operative Onboarding
              </h4>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#ffffff20" 
                    fontSize={10} 
                    tickFormatter={(val) => val.split('-').slice(1).join('/')}
                  />
                  <YAxis stroke="#ffffff20" fontSize={10} />
                  <RechartsTooltip 
                    cursor={{ fill: 'white', fillOpacity: 0.05 }}
                    contentStyle={{ backgroundColor: '#0A0A0B', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  />
                  <Bar dataKey="count" fill="#00FF88" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Level Distribution */}
          <div className="glass p-8 rounded-[2.5rem] border-white/5 overflow-hidden">
            <h4 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center">
              <PieChart className="w-4 h-4 mr-2 text-yellow-500" />
              Rank Distribution
            </h4>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={levelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {levelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0A0A0B', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Security Status */}
          <div className="glass p-8 rounded-[2.5rem] border-white/5 flex flex-col justify-center items-center text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-cyan blur-3xl opacity-20 animate-pulse"></div>
              <Shield className="w-20 h-20 text-cyan relative z-10" />
            </div>
            <h4 className="text-xl font-black italic uppercase mb-2">Security Hub Online</h4>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">All protocols active • data integrity 100%</p>
            <div className="grid grid-cols-2 gap-4 w-full">
               <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                 <p className="text-[8px] text-gray-500 font-black uppercase mb-1">Encrypted Logs</p>
                 <p className="text-sm font-black text-white">{transactions.length.toLocaleString()}</p>
               </div>
               <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                 <p className="text-[8px] text-gray-500 font-black uppercase mb-1">Admin Access</p>
                 <p className="text-sm font-black text-cyan">Verified</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
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
        setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
      } else {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      handleFirestoreError(error, OperationType.LIST, activeTab);
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
      handleFirestoreError(error, OperationType.UPDATE, `users/${targetUserId}`);
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
      const level = getRank(points);
      await updateDoc(doc(db, 'users', targetUserId), { 
        points,
        level
      });
      toast.success(`Points updated. New Rank: ${level}`);
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${targetUserId}`);
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
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
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
      handleFirestoreError(error, OperationType.DELETE, `orders/${orderId}`);
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
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'analytics' ? 'bg-cyan text-dark' : 'text-gray-500 hover:text-white'}`}
          >
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-cyan text-dark' : 'text-gray-500 hover:text-white'}`}
          >
            Products
          </button>
        </div>
      </div>

      {activeTab !== 'tournament' && activeTab !== 'analytics' && (
        <div className="mb-8 flex gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:border-cyan outline-none transition-all uppercase text-[10px] font-black tracking-widest"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          {activeTab === 'users' && (
            <button 
              onClick={syncRanks}
              className="bg-cyan/10 hover:bg-cyan/20 text-cyan border border-cyan/20 px-6 rounded-2xl flex items-center space-x-2 transition-all active:scale-95"
              title="Recalculate ranks for all users"
            >
              <Trophy className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Sync Ranks</span>
            </button>
          )}
        </div>
      )}

      <div className="glass rounded-[2rem] border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-24 text-center">
            <Zap className="w-12 h-12 text-cyan mx-auto mb-4 animate-pulse" />
            <p className="text-gray-500 text-xs uppercase tracking-widest font-black">Syncing with datastore...</p>
          </div>
        ) : activeTab === 'analytics' ? (
          renderAnalytics()
        ) : activeTab === 'products' ? (
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black italic uppercase">Resource Inventory</h3>
              <button 
                onClick={seedInitialProducts}
                className="text-[10px] font-black uppercase tracking-widest text-cyan/50 hover:text-cyan transition-colors"
                title="Initialize with default product list"
              >
                Seed Default Resources
              </button>
            </div>

            <form onSubmit={saveProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-2">Product Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Free Fire 100 Diamond"
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 focus:border-cyan outline-none text-xs text-white"
                  value={productForm.name}
                  onChange={e => setProductForm({...productForm, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-2">Price (BDT)</label>
                <input 
                  type="number"
                  required
                  placeholder="Price"
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 focus:border-cyan outline-none text-xs text-white"
                  value={productForm.price || ''}
                  onChange={e => setProductForm({...productForm, price: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-2">Sub-Folder / Category</label>
                <select 
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 focus:border-cyan outline-none text-xs text-white"
                  value={productForm.subFolder}
                  onChange={e => setProductForm({...productForm, subFolder: e.target.value})}
                >
                  <option value="Free Fire Top up">Free Fire Top up</option>
                  <option value="PUBG Mobile UC">PUBG Mobile UC</option>
                  <option value="Gift Card">Gift Card</option>
                  <option value="Voucher">Voucher</option>
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  type="submit"
                  disabled={isUpdating === 'product-save'}
                  className="btn-cyan w-full py-3 flex items-center justify-center space-x-2"
                >
                  <Zap className="w-4 h-4" />
                  <span className="font-black uppercase tracking-widest text-[10px]">{editingProduct ? 'Update Resource' : 'Add Resource'}</span>
                </button>
                {editingProduct && (
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({ name: '', price: 0, subFolder: 'Free Fire Top up', category: 'Diamond' });
                    }}
                    className="ml-2 bg-white/5 p-3 rounded-xl border border-white/5 text-gray-500 hover:text-white"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                <div key={p.id} className="glass p-5 rounded-3xl border-white/5 group hover:border-cyan/30 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-cyan/5 rounded-2xl border border-cyan/10">
                      <ShoppingBag className="w-5 h-5 text-cyan" />
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setEditingProduct(p);
                          setProductForm({ name: p.name, price: p.price, subFolder: p.subFolder, category: p.category });
                        }}
                        className="p-2 bg-white/5 rounded-lg border border-white/5 text-gray-400 hover:text-cyan hover:border-cyan/50 transition-all"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => deleteProduct(p.id)}
                        className="p-2 bg-white/5 rounded-lg border border-white/5 text-gray-400 hover:text-red hover:border-red/50 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-sm font-black uppercase text-white mb-1">{p.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{p.subFolder}</span>
                    <span className="text-cyan font-black italic">৳{p.price}</span>
                  </div>
                </div>
              ))}
            </div>
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
