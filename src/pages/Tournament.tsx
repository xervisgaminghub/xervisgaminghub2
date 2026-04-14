import { motion } from 'motion/react';
import { Trophy, Play, Calendar, Users, MapPin } from 'lucide-react';

const TOURNAMENTS = [
  {
    id: 1,
    title: "Free Fire Bangladesh Official",
    type: "Official",
    prize: "500,000 BDT",
    date: "April 25, 2026",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070",
    link: "https://www.youtube.com/@FreeFireBangladeshOfficialYT"
  },
  {
    id: 2,
    title: "Xervis Community Cup",
    type: "Unofficial",
    prize: "5,000 BDT",
    date: "May 02, 2026",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2071",
    link: "https://youtube.com/@xarvis-live"
  },
  {
    id: 3,
    title: "Pro League Season 4",
    type: "Official",
    prize: "1,000,000 BDT",
    date: "June 15, 2026",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=2070",
    link: "https://www.youtube.com/@FreeFireBangladeshOfficialYT"
  }
];

export default function Tournament() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-4">ESPORTS <span className="neon-text">TOURNAMENTS</span></h1>
        <p className="text-gray-400 max-w-xl mx-auto">Join the battle and compete with the best players in Bangladesh.</p>
      </div>

      <div className="space-y-12">
        {TOURNAMENTS.map((tournament, index) => (
          <motion.div
            key={tournament.id}
            initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="glass rounded-3xl overflow-hidden border-white/5 hover:border-cyan/20 transition-all group grid grid-cols-1 lg:grid-cols-5"
          >
            <div className="lg:col-span-2 relative aspect-video lg:aspect-auto overflow-hidden">
              <img 
                src={tournament.image} 
                alt={tournament.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-dark/80 to-transparent lg:hidden"></div>
            </div>

            <div className="lg:col-span-3 p-8 lg:p-12 flex flex-col justify-center">
              <div className="flex items-center space-x-4 mb-6">
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${tournament.type === 'Official' ? 'bg-red text-white' : 'bg-cyan text-dark'}`}>
                  {tournament.type}
                </span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center">
                  <Calendar className="w-3 h-3 mr-1" /> {tournament.date}
                </span>
              </div>

              <h2 className="text-3xl font-black mb-4 group-hover:text-cyan transition-colors">{tournament.title}</h2>
              
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Prize Pool</p>
                  <p className="text-xl font-black text-white">{tournament.prize}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Platform</p>
                  <p className="text-xl font-black text-white">Mobile</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <a 
                  href={tournament.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-neon w-full sm:w-auto flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Watch Stream</span>
                </a>
                <button className="btn-red w-full sm:w-auto">Register Now</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
