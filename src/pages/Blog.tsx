import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import axios from 'axios';
import { Newspaper, ExternalLink, Calendar, User } from 'lucide-react';

export default function Blog() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('/api/news?q=gaming+esports&sortBy=publishedAt');
        setNews(response.data.articles.slice(0, 12));
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-4">GAMING <span className="neon-text">NEWS</span></h1>
        <p className="text-gray-400 max-w-xl mx-auto">Stay ahead of the game with the latest esports news, guides, and updates.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass aspect-[4/5] rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((article, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-3xl overflow-hidden border-white/5 hover:border-cyan/30 transition-all group flex flex-col"
            >
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={article.urlToImage || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2071'} 
                  alt={article.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-cyan text-dark text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  {article.source.name}
                </div>
              </div>
              
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center space-x-4 text-[10px] text-gray-500 uppercase tracking-widest mb-4">
                  <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date(article.publishedAt).toLocaleDateString()}</span>
                  <span className="flex items-center"><User className="w-3 h-3 mr-1" /> {article.author?.slice(0, 15) || 'Staff'}</span>
                </div>
                
                <h3 className="text-lg font-bold mb-4 line-clamp-2 group-hover:text-cyan transition-colors">{article.title}</h3>
                <p className="text-gray-400 text-sm mb-6 line-clamp-3 flex-grow">{article.description}</p>
                
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 w-full py-3 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  <span>Read Full Article</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
