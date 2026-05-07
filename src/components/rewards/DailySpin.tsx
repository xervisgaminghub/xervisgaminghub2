import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../lib/firebase';
import { doc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { toast } from 'sonner';
import { Sparkles, Trophy, Zap, Gift, Timer, Star, CheckCircle } from 'lucide-react';
import { UserProfile } from '../../types';

interface DailySpinProps {
  user: UserProfile;
}

export default function DailySpin({ user }: DailySpinProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reward, setReward] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    const updateTimer = () => {
      if (!user.lastSpinAt) {
        setTimeLeft(null);
        return;
      }

      const lastSpin = user.lastSpinAt.toDate ? user.lastSpinAt.toDate() : new Date(user.lastSpinAt);
      const nextSpin = new Date(lastSpin.getTime() + 24 * 60 * 60 * 1000);
      const now = new Date();

      if (now >= nextSpin) {
        setTimeLeft(null);
      } else {
        const diff = nextSpin.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    const timer = setInterval(updateTimer, 1000);
    updateTimer();
    return () => clearInterval(timer);
  }, [user.lastSpinAt]);

  const handleSpin = async () => {
    if (isSpinning || timeLeft) return;

    setIsSpinning(true);
    
    // Virtual delay for "spinning" effect
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Choose reward based on weighted probabilities
    const rewards = [5, 5, 5, 5, 10, 10, 10, 20, 20, 50, 100];
    const winAmount = rewards[Math.floor(Math.random() * rewards.length)];

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        points: increment(winAmount),
        lastSpinAt: serverTimestamp()
      });
      
      setReward(winAmount);
      toast.success(`MISSION ACCOMPLISHED! Received ${winAmount} Cosmic Credits!`);
    } catch (error) {
      console.error("Reward claim error:", error);
      toast.error("COMMUNICATION ERROR: Failed to claim reward.");
    } finally {
      setIsSpinning(false);
    }
  };

  return (
    <>
      {/* Floating Entry Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-8 z-[60] bg-cyan/10 backdrop-blur-xl border border-cyan/30 p-4 rounded-2xl shadow-[0_0_30px_rgba(0,229,255,0.2)] group"
      >
        <div className="relative">
          <Gift className={`w-8 h-8 text-cyan ${!timeLeft ? 'opacity-100' : 'opacity-40'}`} />
          {!timeLeft && (
            <motion.div 
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-red rounded-full shadow-[0_0_15px_#FF3B3F]" 
            />
          )}
        </div>
        <div className="mt-2 text-center">
          <p className="text-[10px] font-black text-cyan uppercase tracking-widest">Daily</p>
          <p className="text-[8px] text-gray-500 font-bold uppercase">{timeLeft || 'READY'}</p>
        </div>
      </motion.button>

      {/* Reward Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSpinning && setIsOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#05070a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-cyan/5 to-transparent pointer-events-none" />
              
              <div className="p-8 pb-12 text-center space-y-8 relative">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 bg-cyan/10 rounded-3xl border border-cyan/20">
                      <Sparkles className="w-12 h-12 text-cyan" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Cosmic <span className="text-cyan">Lucky Spin</span></h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Claim your daily operative resources</p>
                  </div>
                </div>

                <div className="relative py-12">
                  {/* Decorative rotating rings */}
                  <motion.div 
                    animate={{ rotate: isSpinning ? 1080 : 0 }}
                    transition={{ duration: 5, ease: "circOut" }}
                    className="w-48 h-48 border-4 border-dashed border-cyan/20 rounded-full mx-auto flex items-center justify-center relative"
                  >
                    <div className="w-40 h-40 border-2 border-cyan/10 rounded-full flex items-center justify-center">
                      {isSpinning ? (
                        <div className="text-cyan font-black text-4xl italic animate-pulse">?</div>
                      ) : reward ? (
                        <motion.div 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }} 
                          className="text-center"
                        >
                          <p className="text-4xl font-black text-cyan">+{reward}</p>
                          <p className="text-[10px] text-gray-500 uppercase font-black">Credits</p>
                        </motion.div>
                      ) : (
                        <Trophy className={`w-16 h-16 ${timeLeft ? 'text-gray-700' : 'text-cyan'}`} />
                      )}
                    </div>
                  </motion.div>

                  {/* Indicators */}
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute top-1/2 left-1/2 w-full h-1"
                      style={{ transform: `translate(-50%, -50%) rotate(${i * 45}deg)` }}
                    >
                      <div className={`w-2 h-2 rounded-full absolute right-2 blur-[1px] ${isSpinning ? 'bg-cyan animate-pulse' : 'bg-cyan/20'}`} />
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  {timeLeft ? (
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                      <div className="flex items-center justify-center space-x-3 mb-2">
                        <Timer className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-black text-white uppercase tracking-widest">COOLDOWN ACTIVE</span>
                      </div>
                      <p className="text-2xl font-black text-gray-400 font-mono tracking-tighter">{timeLeft}</p>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-2">Next terminal authorization in 24 hours</p>
                    </div>
                  ) : reward ? (
                    <div className="space-y-4">
                      <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 text-emerald-500 flex items-center justify-center space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">Rewards Dispatched</span>
                      </div>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          setReward(null);
                        }}
                        className="w-full bg-white text-dark py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all"
                      >
                        Return to Base
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleSpin}
                      disabled={isSpinning}
                      className="w-full bg-cyan text-dark py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:shadow-[0_0_50px_rgba(0,229,255,0.6)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 group overflow-hidden relative"
                    >
                      <div className="relative z-10 flex items-center justify-center space-x-3">
                        <Zap className="w-5 h-5 fill-dark group-hover:animate-bounce" />
                        <span>{isSpinning ? 'Initiating Transmission...' : 'Launch Spin Request'}</span>
                      </div>
                      <motion.div 
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" 
                      />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 opacity-50">
                  <div className="flex items-center space-x-2">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-[8px] font-black uppercase text-gray-500">Security: Encrypted</span>
                  </div>
                  <span className="text-[8px] font-black uppercase text-gray-500 tracking-tighter">Terminal ID: {user.uid.slice(0, 8)}</span>
                </div>
              </div>

              {/* Close Button */}
              {!isSpinning && (
                <button 
                  onClick={() => setIsOpen(false)}
                  className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors"
                >
                  <Zap className="w-6 h-6 rotate-45" />
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
