export default function Footer() {
  return (
    <footer className="px-8 py-5 border-t border-cyan/20 flex flex-col md:flex-row justify-between items-center text-[11px] font-bold uppercase tracking-widest bg-[#0a0d14]/90 backdrop-blur-xl relative z-10 text-gray-400">
      <div className="flex items-center gap-3">
        <img 
          src="https://lh3.googleusercontent.com/d/1ETwW87GvcSFzBMdin6jdJB4Npnyz4MYM" 
          alt="Logo" 
          className="h-7 w-auto hover:brightness-125 drop-shadow-[0_0_10px_rgba(0,240,255,0.4)] transition-all"
          referrerPolicy="no-referrer"
        />
        <span>© 2026 XERVIS GAMING HUB • ESPORTS TERMINAL BD</span>
      </div>
      <div className="flex items-center gap-6 mt-3 md:mt-0 text-xs">
        <a href="https://youtube.com/@xarvis-live" target="_blank" rel="noopener noreferrer" className="hover:text-red transition-colors flex items-center gap-1">
          YouTube
        </a>
        <a href="https://t.me/xarvis2" target="_blank" rel="noopener noreferrer" className="hover:text-cyan transition-colors flex items-center gap-1">
          Telegram
        </a>
        <a href="https://wa.me/8801977768511" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors flex items-center gap-1">
          WhatsApp Support
        </a>
      </div>
    </footer>
  );
}
