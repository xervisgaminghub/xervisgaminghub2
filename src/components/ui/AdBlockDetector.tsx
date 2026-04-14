import { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

export default function AdBlockDetector() {
  const [isDetected, setIsDetected] = useState(false);

  useEffect(() => {
    const checkAdBlock = async () => {
      try {
        const response = await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
          method: 'HEAD',
          mode: 'no-cors'
        });
      } catch (error) {
        setIsDetected(true);
      }
    };

    checkAdBlock();
  }, []);

  if (!isDetected) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-dark/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="max-w-md w-full glass p-8 rounded-3xl border-red/50 text-center">
        <ShieldAlert className="w-16 h-16 text-red mx-auto mb-6 animate-bounce" />
        <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter">AdBlock Detected</h2>
        <p className="text-gray-400 mb-8">
          To support Xervis Gaming Hub and earn rewards, please disable your AdBlocker. 
          Some features like downloads and point earnings are disabled while AdBlock is active.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="btn-red w-full"
        >
          I've Disabled It
        </button>
      </div>
    </div>
  );
}
