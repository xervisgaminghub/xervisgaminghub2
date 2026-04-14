import { motion } from 'motion/react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-dark z-50 flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="relative w-24 h-24"
      >
        <div className="absolute inset-0 border-4 border-cyan rounded-full animate-ping opacity-20"></div>
        <div className="absolute inset-0 border-4 border-cyan rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-cyan font-black text-2xl">X</span>
        </div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-cyan tracking-[0.3em] uppercase text-sm font-bold animate-pulse"
      >
        Initializing Xervis Hub...
      </motion.p>
    </div>
  );
}
