import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Trophy, Medal, Star, Shield, Zap, TrendingUp, Users } from 'lucide-react';
import { UserProfile } from '../types';
import { getRank } from '../lib/rankUtils';

export default function Leaderboard() {
  const [topUsers, setTopUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('points', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserProfile[];
      setTopUsers(users);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 1: return 'text-gray-300 bg-gray-500/10 border-gray-500/20';
      case 2: return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      default: return 'text-cyan bg-cyan/5 border-cyan/10';
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1: return <Medal className="w-5 h-5 text-gray-300" />;
      case 2: return <Medal className="w-5 h-5 text-orange-400" />;
      default: return <Star className="w-4 h-4 text-cyan/50" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block mb-4"
        >
          <div className="flex items-center justify-center space-x-3 bg-cyan/10 border border-cyan/20 px-6 py-2 rounded-full">
            <Zap className="w-4 h-4 text-cyan" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan">Galactic Rankings</span>
          </div>
        </motion.div>
        
        <h1 className="text-5xl sm:text-6xl font-black italic uppercase tracking-tighter mb-4">
          Operative <span className="text-cyan">Leaderboard</span>
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-xs uppercase font-bold tracking-widest leading-relaxed">
          The elite sectors of Xervis Hub. Rankings based on earned Cosmic Credits and tactical activity.
        </p>

        {/* Floating background glows */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan/10 rounded-full blur-[100px] pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top 3 Podium */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {topUsers.slice(0, 3).map((user, index) => (
            <motion.div
              key={user.uid}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-1 rounded-[2.5rem] bg-gradient-to-b ${
                index === 0 ? 'from-yellow-500/30 to-transparent' :
                index === 1 ? 'from-gray-400/30 to-transparent' :
                'from-orange-400/30 to-transparent'
              }`}
            >
              <div className="h-full bg-[#05070a] rounded-[2.4rem] p-8 flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  {getRankIcon(index)}
                </div>
                
                <div className="relative mb-6">
                  <div className={`w-24 h-24 rounded-[2rem] border-2 p-1 ${
                    index === 0 ? 'border-yellow-500' :
                    index === 1 ? 'border-gray-400' :
                    'border-orange-400'
                  }`}>
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                      alt="avatar" 
                      className="w-full h-full rounded-[1.8rem] bg-white/5"
                    />
                  </div>
                  <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-dark border border-white/10 flex items-center justify-center font-black text-xs">
                    #{index + 1}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-white italic uppercase">{user.name}</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">@{user.username}</span>
                  </div>
                  
                  <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getRank(user.points).color}`}>
                    {getRank(user.points).name}
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <p className="text-2xl font-black text-cyan italic tracking-tighter">{user.points.toLocaleString()}</p>
                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Credits</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Rest of the leaderboard */}
        <div className="lg:col-span-3 space-y-4">
          <div className="hidden md:grid grid-cols-6 px-8 text-gray-600 font-black uppercase text-[10px] tracking-widest mb-4">
            <span className="col-span-1">Rank</span>
            <span className="col-span-2">Operative</span>
            <span className="col-span-1">Division</span>
            <span className="col-span-1">Join Date</span>
            <span className="col-span-1 text-right">Resource Level</span>
          </div>

          <div className="space-y-3">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
              ))
            ) : topUsers.slice(3).map((user, index) => (
              <motion.div
                key={user.uid}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass p-4 sm:p-6 rounded-3xl border-white/5 hover:border-cyan/30 transition-all flex flex-col md:grid md:grid-cols-6 items-center gap-4 group"
              >
                <div className="col-span-1 flex items-center space-x-4">
                  <span className="text-lg font-black text-gray-600 opacity-50">#{index + 4}</span>
                  <div className="w-12 h-12 rounded-xl border border-white/10 overflow-hidden shrink-0">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                      alt="avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="col-span-2 flex flex-col items-center md:items-start text-center md:text-left">
                  <span className="text-sm font-black text-white italic uppercase group-hover:text-cyan transition-colors">{user.name}</span>
                  <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">@{user.username}</span>
                </div>

                <div className="col-span-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${getRank(user.points).color} border-current opacity-70`}>
                    {getRank(user.points).name}
                  </span>
                </div>

                <div className="col-span-1 flex flex-col items-center md:items-start">
                  <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Authorized</span>
                  <span className="text-[10px] text-white font-bold">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="col-span-1 text-right flex flex-col items-center md:items-end w-full md:w-auto">
                    <div className="flex items-center space-x-2">
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                        <span className="text-lg font-black text-cyan italic tracking-tighter">{user.points.toLocaleString()}</span>
                    </div>
                  <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Credits</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 p-8 bg-cyan/5 border border-cyan/10 rounded-[3rem] text-center space-y-4">
            <Users className="w-8 h-8 text-cyan mx-auto opacity-50" />
            <h4 className="text-sm font-black text-white uppercase tracking-widest">Tactical Advantage</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase max-w-lg mx-auto leading-relaxed">
              Maintain active engagement and claim your daily cosmic rewards to ascend through the divisions. 
              The top elite receive exclusive seasonal drops and custom terminal badges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
