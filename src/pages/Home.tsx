import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Zap, Trophy, ShoppingBag, LayoutDashboard, Info, FileText, MessageSquare, Send, Youtube, Users, Gamepad2, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { UserProfile } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, onSnapshot } from 'firebase/firestore';
import AdSense from '../components/AdSense';
import { getPointsToNextRank } from '../lib/rankUtils';

interface HomeProps {
  user: UserProfile | null;
}

const HUB_LINKS = [
  { name: 'Player HQ', path: '/dashboard', icon: LayoutDashboard, color: 'text-cyan', desc: 'Manage your profile & track battle points' },
  { name: 'Diamond Depot', path: '/store', icon: ShoppingBag, color: 'text-cyan', desc: 'Instant Free Fire diamonds & gaming UC' },
  { name: 'Esports Tournaments', path: '/tournament', icon: Trophy, color: 'text-red', desc: 'Compete in high-stakes bracket circuits' },
  { name: 'Squad Recruitment', path: '/join-team', icon: Users, color: 'text-purple-400', desc: 'Join or scout verified esports rosters' },
  { name: 'Leaderboard', path: '/leaderboard', icon: Zap, color: 'text-yellow-400', desc: 'Global player hierarchy & top contenders' },
  { name: 'About Protocol', path: '/about', icon: Info, color: 'text-blue-400', desc: 'Learn about Xervis Hub ecosystem' },
  { name: 'Legal Terms', path: '/terms', icon: FileText, color: 'text-gray-400', desc: 'Fair play rules & service terms' },
  { name: 'Direct Support', path: '#', icon: MessageSquare, color: 'text-green-400', desc: 'Direct WhatsApp contact with staff', isExternal: true, url: 'https://wa.me/8801977768511' },
];

export default function Home({ user }: HomeProps) {
  const [stats, setStats] = useState({ purchases: 0 });
  const [scrollingText, setScrollingText] = useState('🎮 WELCOME TO XERVIS GAMING HUB ⚡ | 💎 INSTANT FREE FIRE DIAMOND & PUBG UC TOP-UP ACTIVE | 🏆 ESPORTS TOURNAMENTS & SQUAD RECRUITMENT LIVE | 🎁 SPIN DAILY REWARDS & EARN BATTLE TOKENS | 🏅 SCALE THE LEADERBOARD RANKINGS | 💸 10 POINTS = 1 BDT | 🎯 ASSEMBLE YOUR PRO ROSTER TODAY!');

  const { nextRank, pointsNeeded, progress: xpPercentage } = getPointsToNextRank(user?.points || 0);

  useEffect(() => {
    // Subscribe to tournament info for scrolling text
    const unsub = onSnapshot(doc(db, 'tournament_info', 'current'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.scrollingText) {
          setScrollingText(data.scrollingText);
        }
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (user) {
        try {
          const ordersQuery = query(collection(db, 'orders'), where('userId', '==', user.uid));
          const ordersSnap = await getDocs(ordersQuery);

          setStats({
            purchases: ordersSnap.size
          });
        } catch (error) {
          console.error("Error fetching stats:", error);
        }
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
      {/* Top Section: Hero & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Hero Banner */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="h-[320px] rounded-3xl border border-cyan/20 relative overflow-hidden flex items-end p-8 group shadow-[0_0_50px_rgba(0,240,255,0.15)] bg-dark/90">
            {/* Gaming Backdrop */}
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070" 
                alt="Xervis Esports Gaming Arena" 
                className="w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-1000 select-none"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-[#0a0d14]/70 to-transparent"></div>
              {/* Tactical cyber corner accent */}
              <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                <span className="w-2 h-2 rounded-full bg-cyan animate-pulse"></span>
                <span>SYSTEM: ONLINE</span>
              </div>
            </div>
            
            <div className="relative z-10 max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 text-xs font-black text-red uppercase tracking-[0.3em] mb-2">
                  <Gamepad2 className="w-4 h-4" />
                  <span>PREMIER BANGLADESH GAMING HUB</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black leading-none mb-3 tracking-tighter drop-shadow-[0_0_25px_rgba(0,240,255,0.6)]">
                  XERVIS <span className="text-cyan">GAMING ARENA</span>
                </h1>
                <p className="text-gray-300 mb-6 font-bold uppercase text-[11px] tracking-wider leading-relaxed">
                  Instant Free Fire diamond top-ups, high-octane esports tournament circuits, pro squad recruitment, and daily reward tokens.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/store" className="btn-neon flex items-center gap-2">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Explore Depot</span>
                  </Link>
                  <Link to="/tournament" className="btn-red flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Tournament Fixtures</span>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scrolling Ticker */}
          <div className="bg-black/70 backdrop-blur-md border border-cyan/20 rounded-xl h-11 flex items-center overflow-hidden relative shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
            <div className="absolute left-0 top-0 bottom-0 px-3 bg-cyan text-dark z-10 flex items-center shadow-[5px_0_15px_rgba(0,0,0,0.5)] font-black">
              <Zap className="w-4 h-4" />
              <span className="ml-2 text-[10px] font-black uppercase tracking-widest">LIVE HUD</span>
            </div>
            <div className="scrolling-text text-[11px] font-bold text-cyan uppercase tracking-[0.2em] w-full pl-28">
              {scrollingText}
            </div>
          </div>
        </div>

        {/* Tactical Stats HUD */}
        <div className="flex flex-col gap-6">
          <div className="stat-panel h-full flex flex-col justify-between cyber-card">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-[10px] font-black text-cyan uppercase tracking-[0.4em]">COMBAT OPERATIVE HUD</h4>
                <span className="text-[9px] font-black text-red bg-red/10 border border-red/30 px-2 py-0.5 rounded uppercase">ACTIVE</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <StatBox value={user ? stats.purchases.toString() : "0"} label="Orders Completed" />
                <StatBox value={user ? `৳${Math.floor(user.points / 10)}` : "৳0"} label="Token Balance (BDT)" />
                <StatBox value={user ? user.level : "--"} label="Operative Rank" />
              </div>
            </div>
            
            <div className="mt-6 pt-5 border-t border-cyan/15">
              <div className="flex justify-between text-[10px] mb-2 font-black uppercase tracking-widest">
                <span className="text-cyan">Rank Progression</span>
                <span className="text-gray-400">{user ? (nextRank ? `${pointsNeeded} pts to ${nextRank}` : 'MAX RANK') : 'DE-ACTIVATED'}</span>
              </div>
              <div className="h-3 bg-black/60 rounded-full overflow-hidden border border-cyan/20 p-[2px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${user ? xpPercentage : 0}%` }}
                  className="bg-gradient-to-r from-cyan via-[#33F3FF] to-cyan h-full rounded-full shadow-[0_0_15px_rgba(0,240,255,0.8)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Home Page Ad Slot */}
      <div className="mb-10 glass border-cyan/15 p-4 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.3em] mb-2 text-center">SPONSORED TRANSMISSION</p>
        <AdSense slot="YOUR_AD_SLOT_HERE" />
      </div>

      {/* Navigation Matrix Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="h-[2px] flex-grow bg-gradient-to-r from-cyan/60 to-transparent" />
        <h2 className="text-xl font-black uppercase tracking-[0.4em] text-white">
          COMMAND <span className="text-cyan drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">MATRIX</span>
        </h2>
        <div className="h-[2px] flex-grow bg-gradient-to-l from-cyan/60 to-transparent" />
      </div>

      {/* Main Hub Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {HUB_LINKS.map((link, idx) => (
          <HubTile key={link.name} link={link} index={idx} />
        ))}
      </div>

      {/* Bottom Footer Section: Mission & Connectivity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-cyan/15">
        <div className="lg:col-span-2">
          <div className="stat-panel border-cyan/15 bg-black/40 h-full flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-cyan" />
              <h3 className="text-sm font-black uppercase tracking-widest text-white">ESPORTS DOMINANCE & VERIFIED PROTOCOL</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed uppercase font-bold tracking-wider">
              Xervis Gaming Hub is Bangladesh's dedicated arena for competitive gamers and esports enthusiasts. 
              From instant Free Fire diamond top-ups to organized competitive brackets, squad recruitment, and daily reward systems, 
              we build a secure, lightning-fast platform where your gaming skill and dedication translate into real prestige.
            </p>
          </div>
        </div>

        <div className="stat-panel border-cyan/15 bg-black/40">
          <h4 className="text-[10px] font-black text-cyan uppercase tracking-widest mb-4">TACTICAL COMMS CHANNELS</h4>
          <div className="space-y-3">
            <SocialEntry icon={Youtube} label="YouTube Esports" sub="Tournament Streams & Highlights" color="text-red" url="https://youtube.com/@xarvis-live" />
            <SocialEntry icon={Send} label="Telegram Comms" sub="Daily Codes & Flash Drops" color="text-blue-400" url="https://t.me/xarvis2" />
          </div>
          <p className="mt-6 text-[9px] text-center text-gray-500 font-bold uppercase tracking-[0.2em] leading-relaxed">
            Xervis Cyber Engine v3.0 • Verified Fair Play & Secure Top-Up.
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
      className="group relative flex flex-col p-6 rounded-3xl border border-cyan/15 bg-black/40 hover:bg-black/70 hover:border-cyan/50 transition-all duration-300 overflow-hidden min-h-[160px] shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(0,240,255,0.15)]"
    >
      <div className={`p-3 rounded-2xl bg-black/60 border border-white/5 w-fit mb-4 group-hover:scale-110 group-hover:border-cyan/40 transition-all ${link.color} shadow-[0_0_15px_rgba(0,0,0,0.6)]`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-black uppercase tracking-widest mb-1 group-hover:text-cyan transition-colors">{link.name}</h3>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight leading-relaxed">{link.desc}</p>
      
      {/* Visual Accents */}
      <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-100 group-hover:text-cyan transition-all">
        <Zap className="w-12 h-12 -mr-6 -mt-6" />
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 border border-white/5 hover:border-cyan/30 transition-all group">
      <div className={`p-2 rounded-lg bg-black/60 ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[11px] font-black uppercase tracking-tighter text-white group-hover:text-cyan transition-colors">{label}</p>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{sub}</p>
      </div>
    </a>
  );
}

function StatBox({ value, label }: { value: string, label: string }) {
  return (
    <div className="flex flex-col items-center p-3 rounded-xl bg-black/50 border border-cyan/15 hover:border-cyan/30 transition-colors">
      <span className="text-xl font-black text-cyan tracking-wider drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">{value}</span>
      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{label}</span>
    </div>
  );
}
