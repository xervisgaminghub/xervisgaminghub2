import { motion } from 'motion/react';
import { Info, Shield } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-black mb-6 neon-text">ABOUT XERVIS HUB</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            The ultimate ecosystem for competitive gamers. Join tournaments, earn rewards, and level up your gaming legacy.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-8 rounded-3xl border-cyan/20"
          >
            <div className="w-12 h-12 bg-cyan/10 rounded-xl flex items-center justify-center mb-6">
              <span className="text-cyan w-6 h-6"><Info className="w-6 h-6" /></span>
            </div>
            <h3 className="text-2xl font-bold mb-4">OUR MISSION</h3>
            <p className="text-gray-400 leading-relaxed">
              We started Xervis Hub with one simple goal: to bridge the gap between casual gaming and professional esports. We provide a platform where skill is rewarded and community comes first.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-8 rounded-3xl border-red/20"
          >
            <div className="w-12 h-12 bg-red/10 rounded-xl flex items-center justify-center mb-6">
              <span className="text-red w-6 h-6"><Shield className="w-6 h-6" /></span>
            </div>
            <h3 className="text-2xl font-bold mb-4">FAIR PLAY</h3>
            <p className="text-gray-400 leading-relaxed">
              Security and integrity are our top priorities. Our advanced anti-cheat systems and manual moderation ensure that every tournament and reward is earned fairly.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
