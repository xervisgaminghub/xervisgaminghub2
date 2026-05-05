import { useEffect, useRef } from 'react';

interface AdSenseProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: 'true' | 'false';
  style?: React.CSSProperties;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdSense({ slot, format = 'auto', responsive = 'true', style, className }: AdSenseProps) {
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization in React Strict Mode or on re-renders
    if (initialized.current) return;

    const initializeAd = () => {
      if (!adRef.current) return;

      // Ensure the container has width to avoid "availableWidth=0" error
      const width = adRef.current.parentElement?.clientWidth || 0;
      
      if (width > 0) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          initialized.current = true;
        } catch (e) {
          console.error('AdSense error:', e);
        }
      } else {
        // If width is still 0, try again in a bit
        setTimeout(initializeAd, 100);
      }
    };

    // Small delay to let the layout settle
    const timeoutId = setTimeout(initializeAd, 200);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className={`adsense-container w-full overflow-hidden my-4 ${className || ''}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '100px', minHeight: '50px', ...style }}
        data-ad-client="ca-pub-3155487622481872"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
