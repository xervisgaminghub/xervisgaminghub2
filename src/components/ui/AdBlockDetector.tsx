import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert } from 'lucide-react';

export default function AdBlockDetector() {
  const [isAdBlockEnabled, setIsAdBlockEnabled] = useState(false);

  useEffect(() => {
    async function checkAdBlock() {
      const url = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
      try {
        await fetch(new Request(url), { mode: "no-cors" });
        setIsAdBlockEnabled(false);
      } catch (error) {
        setIsAdBlockEnabled(true);
      }
    }
    checkAdBlock();
  }, []);

  if (!isAdBlockEnabled) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4"
      >
        <div className="max-w-md w-full glass-cyan p-8 rounded-3xl border-red/40 text-center shadow-[0_0_50px_rgba(255,0,0,0.2)]">
          <ShieldAlert className="w-16 h-16 text-red mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Interference Detected</h2>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest leading-relaxed mb-8">
            Ad-Blocking protocol detected. To maintain terminal access and unlock downloads, please disable your blocker and refresh.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full btn-red py-4 text-xs"
          >
            Refresh Terminal
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
