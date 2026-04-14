import { motion } from 'motion/react';
import { ShieldAlert, Info, CreditCard, UserCheck, PackageX } from 'lucide-react';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-black mb-4">TERMS & <span className="neon-text">CONDITIONS</span></h1>
        <p className="text-gray-400">Please read our policies carefully before using Xervis Gaming Hub.</p>
      </motion.div>

      <div className="space-y-8">
        <TermsSection 
          icon={<ShieldAlert className="w-6 h-6 text-red" />}
          title="1. Age Restriction"
          content="Xervis Gaming Hub is strictly for users aged 18 and above. By creating an account, you confirm that you meet this age requirement. We reserve the right to terminate accounts of underage users without notice."
        />

        <TermsSection 
          icon={<PackageX className="w-6 h-6 text-red" />}
          title="2. No Refund Policy"
          content="All digital goods and services, including Free Fire diamond top-ups, memberships, and passes, are non-refundable once the transaction is processed. Please double-check your Game UID before submitting an order."
        />

        <TermsSection 
          icon={<CreditCard className="w-6 h-6 text-cyan" />}
          title="3. Payment Verification"
          content="All payments made via bKash, Nagad, or Rocket must be verified using a valid Transaction ID (TXID). Providing fake or used TXIDs will result in a permanent ban from the platform."
        />

        <TermsSection 
          icon={<Info className="w-6 h-6 text-cyan" />}
          title="4. Digital Goods Policy"
          content="We act as a service provider for game top-ups. Delivery times may vary depending on game server status, but most orders are completed within 5-30 minutes. In case of delays, please contact our WhatsApp support."
        />

        <TermsSection 
          icon={<UserCheck className="w-6 h-6 text-cyan" />}
          title="5. User Responsibility"
          content="Users are responsible for maintaining the security of their accounts. Xervis Gaming Hub is not liable for any loss resulting from shared passwords or unauthorized access to your account."
        />
      </div>
      
      <div className="mt-16 p-8 glass rounded-3xl border-white/5 text-center">
        <p className="text-sm text-gray-500 italic">Last updated: April 14, 2026</p>
      </div>
    </div>
  );
}

function TermsSection({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) {
  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="glass p-8 rounded-2xl border-white/5"
    >
      <div className="flex items-center space-x-4 mb-4">
        {icon}
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <p className="text-gray-400 leading-relaxed">{content}</p>
    </motion.div>
  );
}
