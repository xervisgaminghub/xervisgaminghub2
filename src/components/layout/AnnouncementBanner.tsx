import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { Megaphone, Info, AlertTriangle, Star, CheckCircle, ChevronRight, ChevronLeft, X } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'event';
  active: boolean;
  createdAt: any;
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeAnnouncementIndex, setActiveAnnouncementIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'announcements'), 
      where('active', '==', true),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeAnnouncements = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Announcement[];
      setAnnouncements(activeAnnouncements);
      setActiveAnnouncementIndex(0); // Reset to first when new one arrives
    }, (error) => {
      console.error("Announcement listener error:", error);
    });

    return () => unsubscribe();
  }, []);

  // auto-cycle announcements
  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setActiveAnnouncementIndex(prev => (prev + 1) % announcements.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [announcements]);

  if (announcements.length === 0 || !isVisible) return null;

  const current = announcements[activeAnnouncementIndex];

  return (
    <div className="relative z-50 bg-[#0A0A0B] border-b border-white/5 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div 
          key={current.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="max-w-7xl mx-auto px-4 py-3"
        >
          <div className="flex items-center gap-4">
            <div className={`shrink-0 p-2 rounded-lg ${
              current.type === 'warning' ? 'bg-red/10 text-red' :
              current.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
              current.type === 'event' ? 'bg-yellow-500/10 text-yellow-500' :
              'bg-cyan/10 text-cyan'
            }`}>
              {current.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
               current.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
               current.type === 'event' ? <Star className="w-4 h-4" /> :
               <Megaphone className="w-4 h-4" />}
            </div>

            <div className="flex-grow flex flex-col md:flex-row md:items-center gap-1 md:gap-4 overflow-hidden">
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded border self-start md:self-auto ${
                  current.type === 'warning' ? 'bg-red text-dark border-red' :
                  current.type === 'success' ? 'bg-emerald-500 text-dark border-emerald-500' :
                  current.type === 'event' ? 'bg-yellow-500 text-dark border-yellow-500' :
                  'bg-cyan text-dark border-cyan'
              }`}>
                {current.type}
              </span>
              <div className="flex-grow min-w-0">
                <span className="text-white font-black uppercase italic text-xs mr-2">{current.title}:</span>
                <span className="text-gray-400 text-xs font-bold leading-none truncate md:whitespace-normal">{current.message}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {announcements.length > 1 && (
                <div className="hidden sm:flex items-center text-[10px] font-black text-gray-700 mr-2 uppercase tracking-widest">
                  {activeAnnouncementIndex + 1} / {announcements.length}
                </div>
              )}
              
              {announcements.length > 1 && (
                <div className="flex items-center bg-white/5 rounded-lg border border-white/5 overflow-hidden">
                  <button 
                    onClick={() => setActiveAnnouncementIndex(prev => (prev - 1 + announcements.length) % announcements.length)}
                    className="p-2 hover:bg-white/5 text-gray-500 hover:text-white transition-colors border-r border-white/5"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => setActiveAnnouncementIndex(prev => (prev + 1) % announcements.length)}
                    className="p-2 hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              <button 
                onClick={() => setIsVisible(false)}
                className="p-2 hover:bg-white/5 rounded-lg text-gray-700 hover:text-gray-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Animated glow line at top */}
      <div className={`absolute top-0 left-0 h-[1px] w-1/3 blur-sm animate-sweep ${
          current.type === 'warning' ? 'bg-red' :
          current.type === 'success' ? 'bg-emerald-500' :
          current.type === 'event' ? 'bg-yellow-500' :
          'bg-cyan'
      }`} />
    </div>
  );
}
