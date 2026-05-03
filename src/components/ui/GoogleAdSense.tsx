import { useEffect } from 'react';

export default function GoogleAdSense() {
  useEffect(() => {
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (e) {
      console.error('AdSense error', e);
    }
  }, []);

  return null;
}
