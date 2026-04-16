export default function Footer() {
  return (
    <footer className="px-8 py-4 border-t border-cyan/20 flex flex-col md:flex-row justify-between items-center text-[11px] opacity-50 font-bold uppercase tracking-widest bg-black/50">
      <div className="flex items-center gap-2">
        <img 
          src="https://lh3.googleusercontent.com/d/1ETwW87GvcSFzBMdin6jdJB4Npnyz4MYM" 
          alt="Logo" 
          className="h-6 w-auto brightness-50 grayscale hover:grayscale-0 hover:brightness-100 transition-all"
          referrerPolicy="no-referrer"
        />
        <span>© 2026 XERVIS • Privacy Policy • Terms & Conditions</span>
      </div>
      <div className="flex gap-5 mt-2 md:mt-0">
        <a href="#" className="hover:text-cyan transition-colors">Facebook</a>
        <a href="https://youtube.com/@xarvis-live" className="hover:text-cyan transition-colors">YouTube</a>
        <a href="https://t.me/xarvis2" className="hover:text-cyan transition-colors">Telegram</a>
        <a href="#" className="hover:text-cyan transition-colors">Instagram</a>
      </div>
    </footer>
  );
}
