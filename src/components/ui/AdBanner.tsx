import { useEffect, useRef } from 'react';

export default function AdBanner() {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bannerRef.current && !bannerRef.current.firstChild) {
      const atOptions = {
        key: 'c9c49c04524ffe3117b658e140b82cc6',
        format: 'iframe',
        height: 60,
        width: 468,
        params: {},
      };

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `atOptions = ${JSON.stringify(atOptions)}`;
      
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = 'https://www.highperformanceformat.com/c9c49c04524ffe3117b658e140b82cc6/invoke.js';

      bannerRef.current.appendChild(script);
      bannerRef.current.appendChild(invokeScript);
    }
  }, []);

  return (
    <div className="flex justify-center my-8">
      <div ref={bannerRef} className="min-h-[60px] min-w-[468px] bg-white/5 rounded-lg border border-white/5 flex items-center justify-center overflow-hidden">
        {/* Ad will be injected here */}
      </div>
    </div>
  );
}
