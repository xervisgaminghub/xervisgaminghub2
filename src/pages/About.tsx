import { motion } from 'motion/react';
import { Info, Shield, Github, Twitter, Mail } from 'lucide-react';

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
              <Info className="text-cyan w-6 h-6" />
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
              <Shield className="text-red w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-4">FAIR PLAY</h3>
            <p className="text-gray-400 leading-relaxed">
              Security and integrity are our top priorities. Our advanced anti-cheat systems and manual moderation ensure that every tournament and reward is earned fairly.
            </p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 glass p-8 rounded-3xl border-white/10 text-center"
        >
          <h3 className="text-2xl font-bold mb-8 uppercase tracking-widest">Connect with Us</h3>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-cyan transition-colors">
              <Twitter className="w-5 h-5" />
              <span>Twitter</span>
            </a>
            <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-cyan transition-colors">
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </a>
            <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-cyan transition-colors">
              <Mail className="w-5 h-5" />
              <span>Email</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
