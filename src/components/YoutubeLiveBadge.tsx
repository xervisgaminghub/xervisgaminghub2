import { useState, useEffect } from 'react';
import { Youtube } from 'lucide-react';
import { motion } from 'motion/react';

export default function YoutubeLiveBadge() {
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLiveStatus = async () => {
      try {
        const response = await fetch('/api/youtube-live');
        const data = await response.json();
        setIsLive(data.isLive);
      } catch (error) {
        console.error("Live check failed:", error);
        setIsLive(false);
      } finally {
        setLoading(false);
      }
    };

    checkLiveStatus();
    // Re-check every 2 minutes
    const interval = setInterval(checkLiveStatus, 120000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  const url = "https://youtube.com/@xarvis-live/live";

  return (
    <a 
      href={isLive ? url : undefined}
      target={isLive ? "_blank" : undefined}
      rel={isLive ? "noopener noreferrer" : undefined}
      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all ${
        isLive 
          ? 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] cursor-pointer' 
          : 'bg-white/5 border-white/10 text-gray-600 grayscale cursor-not-allowed'
      }`}
    >
      <div className="relative">
        <Youtube className="w-3.5 h-3.5" />
        {isLive && (
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-red-500 rounded-full -z-10 blur-sm"
          />
        )}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
        {isLive ? 'Xervis Live Now' : 'Xervis Offline'}
      </span>
      {isLive && (
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      )}
    </a>
  );
}
