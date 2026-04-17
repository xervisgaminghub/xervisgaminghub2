import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { ShoppingCart, Diamond, ShieldCheck, CreditCard, Send, Folder, Download, Search } from 'lucide-react';

interface StoreProps {
  user: UserProfile | null;
}

const PRODUCTS = [
  { id: 'w-165', name: 'Weekly Membership', price: 165, subFolder: 'Free Fire Top up', category: 'Membership', image: 'https://picsum.photos/seed/ffw/200/200' },
  { id: 'm-790', name: 'Monthly Membership', price: 790, subFolder: 'Free Fire Top up', category: 'Membership', image: 'https://picsum.photos/seed/ffm/200/200' },
  { id: 'wl-60', name: 'Weekly Lite', price: 60, subFolder: 'Free Fire Top up', category: 'Membership', image: 'https://picsum.photos/seed/ffwl/200/200' },
  { id: 'lup-490', name: 'Level Up Pass', price: 490, subFolder: 'Free Fire Top up', category: 'Membership', image: 'https://picsum.photos/seed/fflup/200/200' },
  { id: 'd-25', name: '25 Diamonds', price: 25, subFolder: 'Free Fire Top up', category: 'Diamond', image: 'https://picsum.photos/seed/ffd25/200/200' },
  { id: 'd-50', name: '50 Diamonds', price: 50, subFolder: 'Free Fire Top up', category: 'Diamond', image: 'https://picsum.photos/seed/ffd50/200/200' },
  { id: 'd-100', name: '100 Diamonds', price: 100, subFolder: 'Free Fire Top up', category: 'Diamond', image: 'https://picsum.photos/seed/ffd100/200/200' },
  { id: 'd-115', name: '115 Diamonds', price: 115, subFolder: 'Free Fire Top up', category: 'Diamond', image: 'https://picsum.photos/seed/ffd115/200/200' },
  { id: 'd-240', name: '240 Diamonds', price: 240, subFolder: 'Free Fire Top up', category: 'Diamond', image: 'https://picsum.photos/seed/ffd240/200/200' },
  { id: 'd-355', name: '355 Diamonds', price: 355, subFolder: 'Free Fire Top up', category: 'Diamond', image: 'https://picsum.photos/seed/ffd355/200/200' },
  { id: 'd-505', name: '505 Diamonds', price: 505, subFolder: 'Free Fire Top up', category: 'Diamond', image: 'https://picsum.photos/seed/ffd505/200/200' },
  { 
    id: 'lunar-file', 
    name: 'Lunar Client File', 
    price: 0, 
    subFolder: 'Download File', 
    category: 'File', 
    image: 'https://drive.google.com/uc?export=view&id=16Mkvo_fhBqNS73rxUyaPOw7vIHKdP6n2',
    description: 'Lunar Client Optimized Mod File. Boost your Minecraft gameplay with smoother performance, higher FPS, and a clean interface using this optimized Lunar Client config.',
    features: ['⚡ FPS Boost', '🎯 Smooth gameplay', '🧹 Clean HUD', '🔧 Optimized settings', '🌙 Lunar Client compatible'],
    details: 'Version: Latest • Size: Lightweight • Works with most Minecraft versions',
    downloadUrl: 'https://xervisgaminghub.blogspot.com/2026/04/lunar-client-file-download.html'
  },
];

const SUB_FOLDERS = [
  { name: 'Free Fire Top up', icon: Diamond, color: 'text-cyan' },
  { name: 'Download File', icon: Download, color: 'text-yellow-500' },
];

export default function Store({ user }: StoreProps) {
  const [activeFolder, setActiveFolder] = useState('Free Fire Top up');
  const [selectedProduct, setSelectedProduct] = useState<typeof PRODUCTS[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderData, setOrderData] = useState({
    uid: '',
    name: '',
    email: user?.email || '',
    txid: '',
    paymentMethod: 'bKash'
  });
  const [loading, setLoading] = useState(false);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to place an order.");
      return;
    }
    if (!selectedProduct) {
      toast.error("Please select a product.");
      return;
    }

    setLoading(true);
    try {
      const order = {
        userId: user.uid,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        price: selectedProduct.price,
        uid: orderData.uid,
        transactionId: orderData.txid,
        paymentMethod: orderData.paymentMethod,
        status: 'processing',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'orders'), order);

      // Redirect to WhatsApp
      const message = `ORDER DETAILS:%0AUID: ${orderData.uid}%0AName: ${orderData.name}%0ATXID: ${orderData.txid}%0AProduct: ${selectedProduct.name}%0APrice: ${selectedProduct.price} BDT`;
      window.open(`https://wa.me/8801878928045?text=${message}`, '_blank');

      toast.success("Order placed successfully! Redirecting to WhatsApp...");
      setSelectedProduct(null);
      setOrderData({ ...orderData, uid: '', txid: '' });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = PRODUCTS.filter(p => 
    p.subFolder === activeFolder && 
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black mb-4 tracking-tighter uppercase italic">Xervis <span className="text-cyan">Depot</span></h1>
        <p className="text-gray-400 max-w-xl mx-auto uppercase text-[10px] font-black tracking-[0.3em]">Protocol Sector: Resource Procurement & Distribution</p>
      </div>

      {/* Folder Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
        {SUB_FOLDERS.map((folder) => {
          const Icon = folder.icon;
          const isActive = activeFolder === folder.name;
          return (
            <button
              key={folder.name}
              onClick={() => {
                setActiveFolder(folder.name);
                setSelectedProduct(null);
              }}
              className={`flex items-center space-x-3 px-6 py-4 rounded-2xl border transition-all relative overflow-hidden group ${
                isActive 
                  ? 'bg-cyan/10 border-cyan/40 text-cyan shadow-[0_0_25px_rgba(0,255,255,0.1)]' 
                  : 'bg-white/[0.03] border-white/5 text-gray-500 hover:border-white/20 hover:text-white'
              }`}
            >
              <div className={`p-2 rounded-lg bg-black/40 ${isActive ? folder.color : 'text-gray-600'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-black uppercase tracking-widest text-xs">{folder.name}</span>
              {isActive && (
                <motion.div 
                  layoutId="active-folder-glow"
                  className="absolute inset-0 bg-cyan/5 blur-xl -z-10"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Product List */}
        <div className="lg:col-span-2">
          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder={`Search in ${activeFolder}...`}
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:border-cyan/50 outline-none transition-all uppercase text-[10px] font-black tracking-widest"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-24 glass rounded-3xl border-dashed border-white/10">
              <Download className="w-16 h-16 text-gray-700 mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-black text-gray-600 uppercase tracking-widest mb-2">No Resources Found</h3>
              <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">No matching items indexed in this sector. Transmission pending.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map(product => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedProduct(product)}
                    className={`glass-cyan p-5 rounded-3xl cursor-pointer border transition-all relative overflow-hidden group ${
                      selectedProduct?.id === product.id 
                        ? 'border-cyan bg-cyan/5 shadow-[0_0_30px_rgba(0,255,255,0.1)]' 
                        : 'border-white/5 hover:border-white/20 bg-white/[0.02]'
                    }`}
                  >
                    <div className="h-28 bg-black/40 rounded-2xl flex items-center justify-center text-5xl mb-4 group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        product.category === 'Diamond' ? '💎' : '💳'
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest truncate">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-cyan font-black text-xl tracking-tighter">৳{product.price}</p>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${selectedProduct?.id === product.id ? 'bg-cyan border-cyan text-dark' : 'border-white/10 text-gray-600'}`}>
                          <ShoppingCart className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Order Form */}
        <div className="lg:col-span-1">
          <div className="glass p-8 rounded-3xl border-cyan/20 sticky top-24">
            <h3 className="text-xl font-black mb-6 flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-cyan" />
              <span>Checkout</span>
            </h3>

            {selectedProduct ? (
              selectedProduct.subFolder === 'Download File' ? (
                <div className="space-y-6">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Resource Index</p>
                    <p className="font-bold text-cyan text-lg">{selectedProduct.name}</p>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">{(selectedProduct as any).description}</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">Tactical Features</p>
                    <div className="grid grid-cols-1 gap-2">
                      {(selectedProduct as any).features?.map((f: string) => (
                        <div key={f} className="flex items-center space-x-2 text-[10px] text-gray-300 font-bold bg-white/5 p-2 rounded-lg border border-white/5">
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-[9px] text-yellow-500 font-black uppercase tracking-widest mb-1 italic">Security Advisory:</p>
                    <p className="text-[10px] text-gray-400 leading-tight">🛡️ Safe & Tested. ⚠️ Files hosted on third-party servers (MediaFire). Use at own risk.</p>
                  </div>

                  <a 
                    href={(selectedProduct as any).downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-neon w-full py-4 flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Now</span>
                  </a>

                  <p className="text-[9px] text-gray-600 text-center uppercase tracking-[0.2em] font-black italic">
                    {(selectedProduct as any).details}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleOrder} className="space-y-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Selected Product</p>
                  <p className="font-bold text-cyan">{selectedProduct.name}</p>
                  <p className="text-2xl font-black">{selectedProduct.price} BDT</p>
                </div>

                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Game UID" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-cyan outline-none transition-all"
                    value={orderData.uid}
                    onChange={e => setOrderData({...orderData, uid: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder="In-game Name" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-cyan outline-none transition-all"
                    value={orderData.name}
                    onChange={e => setOrderData({...orderData, name: e.target.value})}
                  />
                  
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">Payment Method</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['bKash', 'Nagad', 'Rocket'].map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setOrderData({...orderData, paymentMethod: method})}
                          className={`py-2 text-[10px] font-bold uppercase rounded-lg border transition-all ${orderData.paymentMethod === method ? 'bg-cyan/20 border-cyan text-cyan' : 'border-white/10 text-gray-500 hover:border-white/20'}`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-red/10 p-4 rounded-xl border border-red/20">
                    <p className="text-[10px] text-red font-bold uppercase tracking-widest mb-1">Send Money To:</p>
                    <p className="text-xl font-black text-white">01878928045</p>
                  </div>

                  <input 
                    type="text" 
                    placeholder="Transaction ID" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-cyan outline-none transition-all"
                    value={orderData.txid}
                    onChange={e => setOrderData({...orderData, txid: e.target.value})}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-neon w-full py-4 mt-4 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? 'Processing...' : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Order</span>
                    </>
                  )}
                </button>
                
                <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest">
                  <ShieldCheck className="w-3 h-3 inline mr-1" />
                  Secure Transaction Verification
                </p>
              </form>
            )) : (
              <div className="text-center py-12">
                <Diamond className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Select a product to start your order.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
