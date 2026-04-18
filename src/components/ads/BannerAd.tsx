import { useEffect, useRef } from 'react';

interface BannerAdProps {
  className?: string;
}

export default function BannerAd({ className = "" }: BannerAdProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adRef.current && adRef.current.children.length === 0) {
      const atOptionsScript = document.createElement('script');
      atOptionsScript.type = 'text/javascript';
      atOptionsScript.innerHTML = `
        atOptions = {
          'key' : 'eb11381d9686c0800a3579c4a38fc11e',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;
      
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = '//www.highperformanceformat.com/eb11381d9686c0800a3579c4a38fc11e/invoke.js';

      adRef.current.appendChild(atOptionsScript);
      adRef.current.appendChild(invokeScript);
    }
  }, []);

  return (
    <div className={`flex justify-center items-center w-full my-6 overflow-hidden ${className}`}>
      <div 
        ref={adRef} 
        className="w-[728px] h-[90px] border border-white/5 bg-black/20 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.3)]"
      />
    </div>
  );
}
