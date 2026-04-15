import { useState, useEffect } from 'react';

export default function YouTubeIndicator() {
  const [isLive, setIsLive] = useState(false);

  // In a real app, you'd fetch this from YouTube API
  useEffect(() => {
    // Mocking live status
    const timer = setTimeout(() => setIsLive(Math.random() > 0.5), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="inline-flex items-center space-x-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
      <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red animate-pulse shadow-[0_0_10px_rgba(255,0,51,0.8)]' : 'bg-gray-500'}`}></div>
      <span className="text-[10px] font-black uppercase tracking-widest">
        {isLive ? 'Xervis Live Now' : 'Xervis Offline'}
      </span>
    </div>
  );
}
