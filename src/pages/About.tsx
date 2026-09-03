import { motion } from 'motion/react';
import { Info, Shield, Gamepad2, Zap, Trophy, Flame } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 relative z-10">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-xs font-black uppercase tracking-widest mb-4 shadow-[0_0_20px_rgba(0,240,255,0.25)]">
            <Gamepad2 className="w-4 h-4" />
            <span>OPERATIONAL BRIEFING</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-wider neon-text">ABOUT XERVIS GAMING HUB</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto uppercase font-bold tracking-wide text-sm leading-relaxed">
            The premier esports ecosystem and instant gaming top-up destination in Bangladesh. Compete in elite tournament circuits, scout pro rosters, earn battle tokens, and power up your Free Fire inventory.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-8 rounded-3xl border-cyan/30 shadow-[0_0_30px_rgba(0,240,255,0.1)]"
          >
            <div className="w-12 h-12 bg-cyan/10 rounded-2xl flex items-center justify-center mb-6 border border-cyan/30">
              <Trophy className="w-6 h-6 text-cyan" />
            </div>
            <h3 className="text-xl font-black mb-4 uppercase tracking-wider text-white">OUR ESPORTS MISSION</h3>
            <p className="text-gray-300 leading-relaxed text-xs uppercase font-bold tracking-wider">
              We established Xervis Gaming Hub with a clear vision: to empower competitive gamers with seamless diamond top-ups, organized tournament brackets, and verified esports squad recruitment. A space where skill translates into real prestige and rewards.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-8 rounded-3xl border-red/30 shadow-[0_0_30px_rgba(255,42,85,0.1)]"
          >
            <div className="w-12 h-12 bg-red/10 rounded-2xl flex items-center justify-center mb-6 border border-red/30">
              <Shield className="w-6 h-6 text-red" />
            </div>
            <h3 className="text-xl font-black mb-4 uppercase tracking-wider text-white">COMPETITIVE INTEGRITY & FAIR PLAY</h3>
            <p className="text-gray-300 leading-relaxed text-xs uppercase font-bold tracking-wider">
              Uncompromising integrity and user security are our primary pillars. Automated UID validation, tournament anti-cheat audits, and verified match brackets guarantee that every diamond delivery is swift and every victory is earned honestly.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="stat-panel border-cyan/20 bg-black/60 p-8 rounded-3xl text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              <Zap className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-lg font-black uppercase tracking-widest text-white mb-2">COMMUNITY REWARDS PROTOCOL</h3>
          <p className="text-xs text-gray-400 max-w-xl mx-auto uppercase font-bold tracking-wider leading-relaxed">
            Daily wheel spins, 10 Points = 1 BDT token conversions, and live tournament drops keep our Bangladeshi gamer community fueled and ready for victory.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
