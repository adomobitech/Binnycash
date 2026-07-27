'use client';
import { motion } from 'framer-motion';
import { Wallet, DollarSign, Coins, Sparkles } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

export default function HeroWallet() {
  const currency = useCurrency();
  const isCoin = currency === 'Coin' || currency === 'COIN';

  return (
    <div className="relative w-full h-[300px] flex items-center justify-center">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute w-48 h-48 bg-[#8B5CF6] rounded-full blur-[80px]"
      />

      <motion.div animate={{ y: [0, -20, 0], opacity: [0.2, 1, 0.2] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-10 left-10">
        <Sparkles className="w-6 h-6 text-yellow-400" />
      </motion.div>
      <motion.div animate={{ y: [0, 20, 0], opacity: [0.2, 1, 0.2] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} className="absolute bottom-10 right-10">
        <Sparkles className="w-8 h-8 text-[#00E57A]" />
      </motion.div>

      {/* 🔥 Dynamic Icon (Coins or Dollar) 🔥 */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: [-20, -80, -20], opacity: [0, 1, 0], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.8, ease: "easeInOut" }}
          className="absolute z-10 bg-[#00E57A] border-2 border-white/20 w-32 h-16 rounded-xl flex items-center justify-center shadow-lg transform -rotate-12"
        >
          {isCoin ? (
            <Coins className="w-8 h-8 text-white opacity-80" />
          ) : (
            <DollarSign className="w-8 h-8 text-white opacity-80" />
          )}
        </motion.div>
      ))}

      <motion.div 
        animate={{ y: [-10, 10, -10] }} 
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-20 w-48 h-32 bg-gradient-to-br from-[#8B5CF6] to-[#6d28d9] rounded-2xl border border-white/20 shadow-[0_20px_50px_rgba(139,92,246,0.5)] flex items-center justify-center backdrop-blur-xl"
      >
        <div className="absolute top-4 w-40 h-2 bg-black/20 rounded-full"></div>
        <Wallet className="w-16 h-16 text-white drop-shadow-md" />
      </motion.div>
    </div>
  );
}