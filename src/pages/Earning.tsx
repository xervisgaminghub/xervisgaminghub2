import { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { db } from '../lib/firebase';
import { doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { toast } from 'sonner';
import { Play, Users, Gamepad, Zap, Lock, Gift, ArrowRight } from 'lucide-react';

interface EarningProps {
  user: UserProfile | null;
}

export default function Earning({ user }: EarningProps) {
  const [adLoading, setAdLoading] = useState(false);

  const handleWatchAd = async () => {
    if (!user) {
      toast.error("Please login to earn points.");
      return;
    }

    setAdLoading(true);
    // Mocking ad watch
    setTimeout(async () => {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          points: increment(5)
        });
        toast.success("+5 Points earned! Ad watch successful.");
      } catch (error) {
        toast.error("Error updating points.");
      } finally {
        setAdLoading(false);
      }
    }, 3000);
  };

  const isGold = user?.level === 'Gold' || user?.level === 'Platinum' || user?.level === 'Diamond' || user?.level === 'Crown' || user?.level === 'Elite Crown';

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-4">EARN <span className="neon-text">REWARDS</span></h1>
        <p className="text-gray-400 max-w-xl mx-auto">Complete simple tasks, watch ads, and refer friends to earn points and cash.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ad Section */}
        <div className="glass p-8 rounded-3xl border-cyan/20 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-cyan/10 rounded-full flex items-center justify-center mb-6">
            <Play className="w-8 h-8 text-cyan" />
          </div>
          <h3 className="text-xl font-bold mb-2">Watch & Earn</h3>
          <p className="text-gray-400 text-sm mb-8">Watch a short 30-sec ad to earn 5 points instantly.</p>
          <button 
            onClick={handleWatchAd}
            disabled={adLoading}
            className="btn-neon w-full py-4 disabled:opacity-50"
          >
            {adLoading ? 'Watching Ad...' : 'Watch Now'}
          </button>
          <p className="text-[10px] text-gray-500 mt-4 uppercase tracking-widest">Limit: 10 ads per day</p>
        </div>

        {/* Referral Section */}
        <div className="glass p-8 rounded-3xl border-red/20 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red/10 rounded-full flex items-center justify-center mb-6">
            <Users className="w-8 h-8 text-red" />
          </div>
          <h3 className="text-xl font-bold mb-2">Refer Friends</h3>
          <p className="text-gray-400 text-sm mb-8">Invite friends to join Xervis. You get 20 points, they get 10 points.</p>
          <div className="w-full bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between mb-4">
            <span className="font-mono font-bold tracking-widest">{user?.referralCode || 'LOGIN TO SEE'}</span>
            <ArrowRight className="w-4 h-4 text-red" />
          </div>
          <button className="btn-red w-full py-4">Share Code</button>
        </div>

        {/* Game Section */}
        <div className="glass p-8 rounded-3xl border-white/10 flex flex-col items-center text-center relative overflow-hidden">
          {!isGold && (
            <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8">
              <Lock className="w-12 h-12 text-gray-500 mb-4" />
              <h4 className="text-lg font-bold mb-2 uppercase">Locked Feature</h4>
              <p className="text-gray-400 text-xs text-center">Reach <span className="text-cyan font-bold">GOLD LEVEL</span> to unlock mini-games and earn 1 point/minute.</p>
            </div>
          )}
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <Gamepad className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">Mini Games</h3>
          <p className="text-gray-400 text-sm mb-8">Play our curated mini-games and earn points for every minute you play.</p>
          <button className="w-full py-4 border border-white/20 rounded-xl text-gray-500 font-bold uppercase tracking-widest">Coming Soon</button>
        </div>
      </div>

      {/* Reward Tiers */}
      <div className="mt-16 glass p-12 rounded-3xl border-white/5">
        <h3 className="text-2xl font-black mb-8 text-center uppercase tracking-tighter">Redemption <span className="text-cyan">Tiers</span></h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <RewardTier points={200} reward="10 BDT Voucher" />
          <RewardTier points={500} reward="20 BDT Voucher" />
          <RewardTier points={1000} reward="100 BDT Cash (bKash)" />
        </div>
      </div>
    </div>
  );
}

function RewardTier({ points, reward }: { points: number, reward: string }) {
  return (
    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center space-x-4">
      <div className="w-12 h-12 bg-cyan/20 rounded-xl flex items-center justify-center">
        <Gift className="w-6 h-6 text-cyan" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{points} Points</p>
        <p className="font-bold">{reward}</p>
      </div>
    </div>
  );
}
