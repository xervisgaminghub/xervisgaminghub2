import { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { ShoppingCart, Diamond, ShieldCheck, CreditCard, Send } from 'lucide-react';

interface StoreProps {
  user: UserProfile | null;
}

const PRODUCTS = [
  { id: 'w-165', name: 'Weekly Membership', price: 165, category: 'Membership', image: 'https://picsum.photos/seed/ffw/200/200' },
  { id: 'm-790', name: 'Monthly Membership', price: 790, category: 'Membership', image: 'https://picsum.photos/seed/ffm/200/200' },
  { id: 'wl-60', name: 'Weekly Lite', price: 60, category: 'Membership', image: 'https://picsum.photos/seed/ffwl/200/200' },
  { id: 'lup-490', name: 'Level Up Pass', price: 490, category: 'Membership', image: 'https://picsum.photos/seed/fflup/200/200' },
  { id: 'd-25', name: '25 Diamonds', price: 25, category: 'Diamond', image: 'https://picsum.photos/seed/ffd25/200/200' },
  { id: 'd-50', name: '50 Diamonds', price: 50, category: 'Diamond', image: 'https://picsum.photos/seed/ffd50/200/200' },
  { id: 'd-100', name: '100 Diamonds', price: 100, category: 'Diamond', image: 'https://picsum.photos/seed/ffd100/200/200' },
  { id: 'd-115', name: '115 Diamonds', price: 115, category: 'Diamond', image: 'https://picsum.photos/seed/ffd115/200/200' },
  { id: 'd-240', name: '240 Diamonds', price: 240, category: 'Diamond', image: 'https://picsum.photos/seed/ffd240/200/200' },
  { id: 'd-355', name: '355 Diamonds', price: 355, category: 'Diamond', image: 'https://picsum.photos/seed/ffd355/200/200' },
  { id: 'd-505', name: '505 Diamonds', price: 505, category: 'Diamond', image: 'https://picsum.photos/seed/ffd505/200/200' },
];

export default function Store({ user }: StoreProps) {
  const [selectedProduct, setSelectedProduct] = useState<typeof PRODUCTS[0] | null>(null);
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-4">DIAMOND <span className="neon-text">STORE</span></h1>
        <p className="text-gray-400 max-w-xl mx-auto">Fastest Free Fire top-up service in Bangladesh. Secure, reliable, and instant.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Product List */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-6">
          {PRODUCTS.map(product => (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedProduct(product)}
              className={`glass-cyan p-4 rounded-lg cursor-pointer border transition-all ${selectedProduct?.id === product.id ? 'border-cyan shadow-[0_0_15px_rgba(0,255,255,0.2)]' : 'border-cyan/10 hover:border-cyan/30'}`}
            >
              <div className="h-24 bg-black/30 rounded flex items-center justify-center text-4xl mb-3">
                {product.category === 'Diamond' ? '💎' : '💳'}
              </div>
              <h3 className="text-[12px] text-gray-400 font-bold truncate mb-1">{product.name}</h3>
              <p className="text-cyan font-black text-lg">৳ {product.price}</p>
            </motion.div>
          ))}
        </div>

        {/* Order Form */}
        <div className="lg:col-span-1">
          <div className="glass p-8 rounded-3xl border-cyan/20 sticky top-24">
            <h3 className="text-xl font-black mb-6 flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-cyan" />
              <span>Checkout</span>
            </h3>

            {selectedProduct ? (
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
            ) : (
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
