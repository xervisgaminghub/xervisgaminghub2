import GoogleAdSense from './GoogleAdSense';

export default function AdBanner() {
  return (
    <div className="w-full overflow-hidden my-4 flex justify-center bg-black/20 rounded-xl border border-white/5 p-2 min-h-[90px]">
      <ins className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
           data-ad-slot="XXXXXXXXXX"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
      <GoogleAdSense />
    </div>
  );
}
