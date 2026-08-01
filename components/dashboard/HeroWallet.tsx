'use client';
import { motion } from 'framer-motion';
import { Wallet, DollarSign, Coins, Sparkles } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

export default function HeroWallet() {
  const currency = useCurrency();
  const isCoin = currency === 'Coin' || currency === 'COIN';

  return (
    // 🚀 Scale fix kiya aur size thoda badhaya taaki clear dikhe
    <div className="relative w-full h-[100px] flex items-center justify-center">
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute w-24 h-24 bg-[#8B5CF6] rounded-full blur-[35px]"
      />

      <motion.div animate={{ y: [0, -6, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-0 left-2">
        <Sparkles className="w-4 h-4 text-yellow-400" />
      </motion.div>
      <motion.div animate={{ y: [0, 6, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} className="absolute bottom-0 right-2">
        <Sparkles className="w-4 h-4 text-[#00E57A]" />
      </motion.div>

      {/* 🚀 Coins Visibility Theek Ki */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: [-8, -30, -8], opacity: [0, 1, 0], scale: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.8, ease: "easeInOut" }}
          className="absolute z-10 bg-[#00E57A] border border-white/20 w-12 h-6 rounded-[6px] flex items-center justify-center shadow-md transform -rotate-12"
        >
          {isCoin ? (
            <Coins className="w-3.5 h-3.5 text-white opacity-90" />
          ) : (
            <DollarSign className="w-3.5 h-3.5 text-white opacity-90" />
          )}
        </motion.div>
      ))}

      {/* 🚀 Main Wallet Size aur Style Enhance Kiya */}
      <motion.div 
        animate={{ y: [-3, 3, -3] }} 
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-20 w-24 h-16 bg-gradient-to-br from-[#8B5CF6] to-[#6d28d9] rounded-[14px] border border-white/20 shadow-[0_8px_20px_rgba(139,92,246,0.4)] flex items-center justify-center backdrop-blur-lg"
      >
        <div className="absolute top-1.5 w-12 h-1 bg-black/20 rounded-full"></div>
        <Wallet className="w-7 h-7 text-white drop-shadow-md" />
      </motion.div>
    </div>
  );
}