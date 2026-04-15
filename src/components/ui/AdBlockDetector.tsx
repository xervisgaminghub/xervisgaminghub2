import { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

export default function AdBlockDetector() {
  const [isDetected, setIsDetected] = useState(false);

  useEffect(() => {
    const checkAdBlock = async () => {
      // Method 1: Fetch check
      let adBlockEnabled = false;
      try {
        await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store'
        });
      } catch (error) {
        adBlockEnabled = true;
      }

      // Method 2: Bait element check
      if (!adBlockEnabled) {
        const bait = document.createElement('div');
        bait.innerHTML = '&nbsp;';
        bait.className = 'adsbox ad-unit ad-zone ad-space ad-container';
        bait.style.position = 'absolute';
        bait.style.top = '-1000px';
        bait.style.left = '-1000px';
        document.body.appendChild(bait);

        setTimeout(() => {
          if (bait.offsetHeight === 0 || bait.offsetWidth === 0 || window.getComputedStyle(bait).display === 'none' || window.getComputedStyle(bait).visibility === 'hidden') {
            setIsDetected(true);
          }
          document.body.removeChild(bait);
        }, 100);
      } else {
        setIsDetected(true);
      }

      // Method 3: Script load check
      if (!adBlockEnabled) {
        const script = document.createElement('script');
        script.src = 'https://www.google-analytics.com/analytics.js';
        script.onerror = () => setIsDetected(true);
        document.head.appendChild(script);
        setTimeout(() => {
          if (document.head.contains(script)) {
            document.head.removeChild(script);
          }
        }, 1000);
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
