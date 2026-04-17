import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Zap, Trophy, ShoppingBag, LayoutDashboard, Newspaper, Info, FileText, Home as HomeIcon, MessageSquare, Send, Youtube, Play } from 'lucide-react';
import YouTubeIndicator from '../components/ui/YouTubeIndicator';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { UserProfile } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface HomeProps {
  user: UserProfile | null;
}

const HUB_LINKS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, color: 'text-cyan', desc: 'Manage your profile & track points' },
  { name: 'Shop Store', path: '/store', icon: ShoppingBag, color: 'text-yellow-500', desc: 'Premium top-ups & digital goods' },
  { name: 'Earning', path: '/earning', icon: Zap, color: 'text-red', desc: 'Earn points by watching ads & tasks' },
  { name: 'Tournaments', path: '/tournament', icon: Trophy, color: 'text-emerald-500', desc: 'Join esports events & win big' },
  { name: 'About Us', path: '/about', icon: Info, color: 'text-purple-500', desc: 'Learn about Xervis Hub protocol' },
  { name: 'Legal Terms', path: '/terms', icon: FileText, color: 'text-gray-400', desc: 'User agreements & privacy policy' },
  { name: 'Support', path: '#', icon: MessageSquare, color: 'text-green-500', desc: 'Direct WhatsApp contact with staff', isExternal: true, url: 'https://wa.me/8801961448374' },
];

export default function Home({ user }: HomeProps) {
  const [news, setNews] = useState<any[]>([]);
  const [stats, setStats] = useState({ purchases: 0, referrals: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      if (user) {
        try {
          const ordersQuery = query(collection(db, 'orders'), where('userId', '==', user.uid));
          const ordersSnap = await getDocs(ordersQuery);
          const referralsQuery = query(collection(db, 'users'), where('referredBy', '==', user.referralCode));
          const referralsSnap = await getDocs(referralsQuery);

          setStats({
            purchases: ordersSnap.size,
            referrals: referralsSnap.size
          });
        } catch (error) {
          console.error("Error fetching stats:", error);
        }
      }
    };

    const fetchNews = async () => {
      try {
        const response = await axios.get('/api/news?q=gaming+esports&sortBy=publishedAt');
        if (response.data && response.data.articles) {
          setNews(response.data.articles.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
    fetchStats();
  }, [user]);

  const xpProgress = user ? (user.points % 1000) : 0;
  const xpPercentage = (xpProgress / 1000) * 100;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Section: Hero & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Hero Banner */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="h-[300px] rounded-3xl border border-cyan/20 relative overflow-hidden flex items-end p-8 group">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000" 
                alt="Hero" 
                className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            </div>
            
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-5xl font-black leading-none mb-2 tracking-tighter">CENTRAL <span className="text-cyan">HUB</span></h1>
                <p className="text-gray-300 mb-6 max-w-md">Welcome to Xervis Protocol. Select a sector from the command matrix below to initiate your gaming session.</p>
                <div className="flex gap-4">
                  <Link to="/store" className="bg-cyan text-dark px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:bg-white transition-all">Quick Recharge</Link>
                  <Link to="/tournament" className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all">Active Events</Link>
                </div>
              </motion.div>
            </div>

            <div className="absolute top-8 right-8 z-20">
              <YouTubeIndicator />
            </div>
          </div>

          {/* Scrolling Ticker - Moved Under Hub */}
          <div className="bg-cyan/10 border border-cyan/30 rounded-xl h-10 flex items-center overflow-hidden relative shadow-[0_0_20px_rgba(0,255,255,0.05)]">
            <div className="absolute left-0 top-0 bottom-0 px-3 bg-cyan text-dark z-10 flex items-center shadow-[5px_0_15px_rgba(0,0,0,0.5)]">
              <Zap className="w-4 h-4" />
              <span className="ml-2 text-[10px] font-black uppercase tracking-widest">Alert</span>
            </div>
            <div className="scrolling-text text-[10px] font-bold text-cyan uppercase tracking-[0.2em] w-full">
              🔥 Welcome to Xervis Gaming Hub 🎮 | Play • Earn • Redeem 💰 | 💎 Free Fire Diamond Top-Up Available Now ⚡ | 🎁 Watch Ads & Unlock Free Downloads | 👥 Invite Friends & Earn Bonus Points 🔥 | 🏆 Level Up System Active – Reach Diamond & Crown 👑 | 💸 10 Points = 1 BDT | 🎯 Daily Earning সুযোগ চলছে | 🚨 AdBlock বন্ধ না করলে Download Unlock হবে না ❌ | 🎮 Mini Games খেলুন এবং প্রতি মিনিটে Point Earn করুন | 📡 Live Tournament Updates Coming Soon | 🚀 Join Now & Start Earning Today!
            </div>
          </div>
        </div>

        {/* Tactical Stats */}
        <div className="flex flex-col gap-6">
          <div className="stat-panel bg-black/40 h-full flex flex-col justify-between">
            <div>
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-6">User Telemetry</h4>
              <div className="grid grid-cols-2 gap-4">
                <StatBox value={user ? stats.purchases.toString() : "0"} label="Orders" />
                <StatBox value={user ? stats.referrals.toString() : "0"} label="Refs" />
                <StatBox value={user ? `৳${Math.floor(user.points / 10)}` : "৳0"} label="Credit" />
                <StatBox value={user ? user.level : "--"} label="Rank" />
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="flex justify-between text-[10px] mb-2 font-black uppercase tracking-widest">
                <span className="text-cyan">Progression Matrix</span>
                <span className="text-gray-500">{user ? xpProgress : 0} / 1000 XP</span>
              </div>
              <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${user ? xpPercentage : 0}%` }}
                  className="bg-cyan h-full rounded-full shadow-[0_0_15px_rgba(0,255,255,0.6)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Matrix Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="h-[2px] flex-grow bg-gradient-to-r from-cyan/50 to-transparent" />
        <h2 className="text-xl font-black uppercase tracking-[0.5em] text-white">Command <span className="text-cyan">Matrix</span></h2>
        <div className="h-[2px] flex-grow bg-gradient-to-l from-cyan/50 to-transparent" />
      </div>

      {/* Main Hub Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {HUB_LINKS.map((link, idx) => (
          <HubTile key={link.name} link={link} index={idx} />
        ))}
      </div>

      {/* Bottom Footer Section: News & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-white/5">
        <div className="lg:col-span-2">
          <div className="flex items-center space-x-3 mb-6">
            <Newspaper className="w-5 h-5 text-cyan" />
            <h3 className="text-sm font-black uppercase tracking-widest">Global Patch Notes & News</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news.map((item, i) => (
              <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="group">
                <div className="aspect-video rounded-xl bg-white/5 mb-3 overflow-hidden border border-white/5 group-hover:border-cyan/30 transition-all">
                  <img src={item.urlToImage || 'https://picsum.photos/seed/gaming/400/225'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h4 className="text-[11px] font-bold leading-tight group-hover:text-cyan transition-colors line-clamp-2">{item.title}</h4>
                <p className="text-[9px] text-gray-500 mt-2 font-black uppercase tracking-tighter">{item.source.name}</p>
              </a>
            ))}
          </div>
        </div>

        <div className="stat-panel border-white/5 bg-white/[0.02]">
          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Network Connectivity</h4>
          <div className="space-y-3">
            <SocialEntry icon={Youtube} label="YouTube Live" sub="Subscribers & Streams" color="text-red" url="https://youtube.com/@xarvis-live" />
            <SocialEntry icon={Send} label="Telegram Hub" sub="Daily Codes & Updates" color="text-blue-400" url="https://t.me/xarvis2" />
          </div>
          <p className="mt-8 text-[9px] text-center text-gray-600 font-bold uppercase tracking-[0.2em] leading-relaxed">
            Authorized Personnel Only. Xervis Hub Protocol v1.0.4 - All Data Encrypted.
          </p>
        </div>
      </div>
    </div>
  );
}

function HubTile({ link, index }: { link: any, index: number }) {
  const Icon = link.icon;
  const Content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="group relative flex flex-col p-6 rounded-3xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.07] hover:border-cyan/30 transition-all duration-300 overflow-hidden min-h-[160px]"
    >
      <div className={`p-3 rounded-2xl bg-black/40 w-fit mb-4 group-hover:scale-110 transition-transform ${link.color} shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-black uppercase tracking-widest mb-1 group-hover:text-cyan transition-colors">{link.name}</h3>
      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight leading-relaxed">{link.desc}</p>
      
      {/* Visual Accents */}
      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 group-hover:text-cyan transition-all">
        <Zap className="w-12 h-12 -mr-6 -mt-6" />
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );

  return link.isExternal ? (
    <a href={link.url} target="_blank" rel="noopener noreferrer">{Content}</a>
  ) : (
    <Link to={link.path}>{Content}</Link>
  );
}

function SocialEntry({ icon: Icon, label, sub, color, url }: { icon: any, label: string, sub: string, color: string, url: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
      <div className={`p-2 rounded-lg bg-black/40 ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[11px] font-black uppercase tracking-tighter text-white">{label}</p>
        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">{sub}</p>
      </div>
    </a>
  );
}

function StatBox({ value, label }: { value: string, label: string }) {
  return (
    <div className="flex flex-col items-center p-3 rounded-xl bg-black/30 border border-white/5">
      <span className="text-xl font-black text-cyan tracking-tighter shadow-cyan/50 drop-shadow-[0_0_5px_rgba(0,255,255,0.4)]">{value}</span>
      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">{label}</span>
    </div>
  );
}
