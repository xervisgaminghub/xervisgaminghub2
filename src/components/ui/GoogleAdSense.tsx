import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function GoogleAdSense() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error', e);
    }
  }, []);

  return (
    <div className="flex justify-center my-8 overflow-hidden">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3155487622481872"
        data-ad-slot="YOUR_AD_SLOT_ID" // User needs to provide this for manual units
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
