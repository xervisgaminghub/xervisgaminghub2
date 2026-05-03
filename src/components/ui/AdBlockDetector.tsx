import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert } from 'lucide-react';

export default function AdBlockDetector() {
  const [isAdBlockEnabled, setIsAdBlockEnabled] = useState(false);

  useEffect(() => {
    const checkDetection = async () => {
      // Method 1: Bait Element Detection
      const bait = document.createElement('div');
      bait.innerHTML = '&nbsp;';
      bait.className = 'adsbox ad-unit banner-ad pub_300x250 pub_300x250m pub_728x90 text-ad textAd ads-container gpt-ad';
      bait.setAttribute('style', 'width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;');
      document.body.appendChild(bait);

      // Give the adblocker a moment to remove or hide the element
      await new Promise(resolve => setTimeout(resolve, 100));

      const isHidden = 
        window.getComputedStyle(bait).getPropertyValue('display') === 'none' ||
        window.getComputedStyle(bait).getPropertyValue('visibility') === 'hidden' ||
        bait.offsetParent === null ||
        bait.offsetHeight === 0 ||
        bait.offsetWidth === 0;

      document.body.removeChild(bait);

      if (isHidden) {
        setIsAdBlockEnabled(true);
        return;
      }

      // Method 2: Network Probe (Fallback/Secondary)
      try {
        const url = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
        const response = await fetch(new Request(url), { mode: "no-cors", cache: 'no-store' });
        // If we reach here, the network request might have succeeded (or was allowed but content was empty)
        // Some blockers allow the request but return a 0-byte file
        if (response.type === 'opaque') {
           // Success in no-cors mode returns opaque
           setIsAdBlockEnabled(false);
        }
      } catch (error) {
        setIsAdBlockEnabled(true);
      }
    };

    // Check periodically or after a delay to catch late-loading blockers
    const timer = setTimeout(checkDetection, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!isAdBlockEnabled) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-4"
      >
        <div className="max-w-md w-full glass-cyan p-10 rounded-[2rem] border-red/30 text-center shadow-[0_0_100px_rgba(255,0,0,0.15)]">
          <div className="relative mb-8">
            <ShieldAlert className="w-20 h-20 text-red mx-auto relative z-10" />
            <div className="absolute inset-0 bg-red/20 blur-2xl rounded-full" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 italic">Access Terminated</h2>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-[0.2em] leading-relaxed mb-10">
            Ad-Blocking protocol detected. Our terminal requires an active connection to the ad-delivery network to maintain protocol integrity.
          </p>
          <div className="space-y-4">
            <button 
              onClick={() => window.location.reload()}
              className="w-full btn-red py-4 text-xs font-black tracking-[0.3em] shadow-[0_0_30px_rgba(255,59,63,0.3)]"
            >
              RESTART TERMINAL
            </button>
            <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">
              Please disable AdBlock & Refresh
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
