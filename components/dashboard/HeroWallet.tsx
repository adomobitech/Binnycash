'use client';
import { motion } from 'framer-motion';
import { Wallet, DollarSign, Coins, Sparkles } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

export default function HeroWallet() {
  const currency = useCurrency();
  const isCoin = currency === 'Coin' || currency === 'COIN';

  return (
    // Reduced height from 200px to 150px
    <div className="relative w-full h-[150px] flex items-center justify-center">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute w-28 h-28 bg-[#8B5CF6] rounded-full blur-[50px]"
      />

      <motion.div animate={{ y: [0, -10, 0], opacity: [0.2, 1, 0.2] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-2 left-16">
        <Sparkles className="w-3 h-3 text-yellow-400" />
      </motion.div>
      <motion.div animate={{ y: [0, 10, 0], opacity: [0.2, 1, 0.2] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} className="absolute bottom-2 right-16">
        <Sparkles className="w-4 h-4 text-[#00E57A]" />
      </motion.div>

      {/* 🔥 Dynamic Icon (Coins or Dollar) - Scaled down 🔥 */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: [-10, -40, -10], opacity: [0, 1, 0], scale: [0.6, 0.9, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.8, ease: "easeInOut" }}
          className="absolute z-10 bg-[#00E57A] border border-white/20 w-16 h-8 rounded-[8px] flex items-center justify-center shadow-lg transform -rotate-12"
        >
          {isCoin ? (
            <Coins className="w-4 h-4 text-white opacity-80" />
          ) : (
            <DollarSign className="w-4 h-4 text-white opacity-80" />
          )}
        </motion.div>
      ))}

      {/* Main Wallet Body - Scaled down */}
      <motion.div 
        animate={{ y: [-5, 5, -5] }} 
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-20 w-28 h-20 bg-gradient-to-br from-[#8B5CF6] to-[#6d28d9] rounded-2xl border border-white/20 shadow-[0_10px_25px_rgba(139,92,246,0.4)] flex items-center justify-center backdrop-blur-xl"
      >
        <div className="absolute top-2 w-20 h-1 bg-black/20 rounded-full"></div>
        <Wallet className="w-8 h-8 text-white drop-shadow-md" />
      </motion.div>
    </div>
  );
}