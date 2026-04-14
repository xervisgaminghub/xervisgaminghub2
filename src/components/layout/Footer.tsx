export default function Footer() {
  return (
    <footer className="px-8 py-4 border-t border-cyan/20 flex flex-col md:flex-row justify-between items-center text-[11px] opacity-50 font-bold uppercase tracking-widest bg-black/50">
      <div>© 2026 Xervis Gaming Hub • Privacy Policy • Terms & Conditions</div>
      <div className="flex gap-5 mt-2 md:mt-0">
        <a href="#" className="hover:text-cyan transition-colors">Facebook</a>
        <a href="https://youtube.com/@xarvis-live" className="hover:text-cyan transition-colors">YouTube</a>
        <a href="https://t.me/xarvis2" className="hover:text-cyan transition-colors">Telegram</a>
        <a href="#" className="hover:text-cyan transition-colors">Instagram</a>
      </div>
    </footer>
  );
}
