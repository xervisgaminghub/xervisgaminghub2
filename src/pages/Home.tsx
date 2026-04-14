import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Zap, Trophy, Users, History, Gift, Play, Newspaper, ExternalLink, Calendar, User as UserIcon } from 'lucide-react';
import YouTubeIndicator from '../components/ui/YouTubeIndicator';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('/api/news?q=gaming+esports&sortBy=publishedAt');
        setNews(response.data.articles.slice(0, 3));
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="max-w-[1024px] mx-auto p-5 grid grid-cols-1 lg:grid-cols-[660px_1fr] gap-5">
      {/* Left Column */}
      <section className="flex flex-col gap-5">
        {/* Hero Section */}
        <div className="h-[200px] rounded-xl border border-cyan/20 relative overflow-hidden flex items-end p-6 group">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000" 
              alt="Hero" 
              className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          </div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-black leading-none mb-1">RECHARGE <span className="text-cyan">NOW</span></h1>
            <p className="text-sm opacity-80 mb-4">Instant Top-up for Free Fire, PUBG & More.</p>
            <div className="flex gap-3">
              <Link to="/store" className="bg-cyan text-dark px-3 py-1.5 rounded font-black text-[11px] uppercase tracking-wider">FF Weekly @ 165 BDT</Link>
              <Link to="/store" className="bg-white/10 px-3 py-1.5 rounded font-black text-[11px] uppercase tracking-wider hover:bg-white/20 transition-colors">FF Monthly @ 790 BDT</Link>
            </div>
          </div>

          <div className="absolute bottom-5 right-5">
            <YouTubeIndicator />
          </div>
        </div>

        {/* Shop Grid Preview */}
        <div className="grid grid-cols-3 gap-4">
          <ProductPreviewCard icon="💎" name="115 Diamonds" price="85" />
          <ProductPreviewCard icon="📦" name="Weekly Lite" price="60" />
          <ProductPreviewCard icon="🏆" name="Level Up Pass" price="490" />
          <ProductPreviewCard icon="🔥" name="505 Diamonds" price="405" />
          <ProductPreviewCard icon="💎" name="25 Diamonds" price="25" />
          <ProductPreviewCard icon="💳" name="Monthly Pass" price="790" />
        </div>
      </section>

      {/* Right Column */}
      <section className="flex flex-col gap-5">
        {/* Stat Panel */}
        <div className="stat-panel">
          <div className="flex justify-between mb-4">
            <StatBox value="42" label="Purchases" />
            <StatBox value="15" label="Referrals" />
            <StatBox value="৳ 245" label="Balance" />
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
            <div className="bg-cyan h-full shadow-[0_0_10px_rgba(0,255,255,0.5)]" style={{ width: '75%' }}></div>
          </div>
          <div className="flex justify-between text-[10px] opacity-60 font-bold uppercase tracking-widest">
            <span>Level Progress</span>
            <span>750 / 1000 XP</span>
          </div>
        </div>

        {/* Earning Card */}
        <div className="bg-red/5 border border-red/30 rounded-xl p-4">
          <h4 className="text-xs font-black text-red uppercase tracking-widest mb-4">Earning Zone</h4>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/earning" className="bg-black/30 p-3 rounded-lg text-center hover:bg-black/50 transition-colors">
              <div className="text-xl mb-1">📺</div>
              <div className="text-[9px] font-black uppercase tracking-wider">Watch Ads</div>
            </Link>
            <Link to="/earning" className="bg-black/30 p-3 rounded-lg text-center hover:bg-black/50 transition-colors">
              <div className="text-xl mb-1">🎮</div>
              <div className="text-[9px] font-black uppercase tracking-wider">Mini Games</div>
            </Link>
          </div>
          <p className="text-[10px] text-center mt-3 opacity-60 font-bold uppercase tracking-widest">Current: 10 Points = 1 BDT</p>
        </div>

        {/* News Panel */}
        <div className="stat-panel flex-1">
          <h4 className="text-xs font-black uppercase tracking-widest mb-4">Latest Esports News</h4>
          <div className="space-y-4">
            {news.length > 0 ? news.map((item, i) => (
              <div key={i} className="pb-3 border-b border-white/5 last:border-0 last:pb-0">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[13px] font-bold leading-tight hover:text-cyan transition-colors line-clamp-2 mb-1 block">
                  {item.title}
                </a>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  {new Date(item.publishedAt).toLocaleDateString()} • {item.source.name}
                </div>
              </div>
            )) : (
              <div className="text-xs text-gray-500">Loading news...</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductPreviewCard({ icon, name, price }: { icon: string, name: string, price: string }) {
  return (
    <div className="glass-cyan p-4 rounded-lg flex flex-col gap-2 hover:border-cyan transition-all group">
      <div className="h-20 bg-black/30 rounded flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <h3 className="text-[12px] text-gray-400 font-bold truncate">{name}</h3>
        <div className="text-lg font-black text-cyan">৳ {price}</div>
      </div>
      <Link to="/store" className="bg-cyan text-dark py-2 rounded font-black text-[10px] text-center uppercase tracking-widest hover:bg-white transition-colors">
        Buy Now
      </Link>
    </div>
  );
}

function StatBox({ value, label }: { value: string, label: string }) {
  return (
    <div className="text-center">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
