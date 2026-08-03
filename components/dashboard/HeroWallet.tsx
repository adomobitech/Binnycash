'use client';
import { motion } from 'framer-motion';
import { Wallet, DollarSign, Coins, Sparkles, Star } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

export default function HeroWallet() {
  const currency = useCurrency();
  const isCoin = currency === 'Coin' || currency === 'COIN';

  return (
    <div className="relative w-full h-[150px] flex items-center justify-center">
      
      {/* Background glowing orb */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[100px] h-[100px] bg-[#8B5CF6] rounded-full blur-[40px]"
      />

      {/* Twinkling Stars & Sparkles around the wallet */}
      <motion.div animate={{ y: [0, -8, 0], opacity: [0.2, 1, 0.2], rotate: [0, 15, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-2 left-0">
        <Sparkles className="w-5 h-5 text-yellow-400" />
      </motion.div>
      <motion.div animate={{ y: [0, 8, 0], opacity: [0.2, 1, 0.2] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} className="absolute bottom-2 right-0">
        <Star className="w-4 h-4 text-[#00E57A] fill-[#00E57A]" />
      </motion.div>
      <motion.div animate={{ scale: [0.8, 1.2, 0.8], opacity: [0, 0.8, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} className="absolute top-6 right-4">
        <Sparkles className="w-3 h-3 text-pink-400" />
      </motion.div>

      {/* Floating Coins/Dollars popping out of the wallet */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ y: 20, opacity: 0, scale: 0.5 }}
          animate={{ 
            y: [-10, -50, -10], 
            x: [0, i % 2 === 0 ? 20 : -20, 0],
            opacity: [0, 1, 0], 
            scale: [0.7, 1.1, 0.7],
            rotate: [0, i % 2 === 0 ? 25 : -25, 0]
          }}
          transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.9, ease: "easeInOut" }}
          className="absolute z-10 bg-gradient-to-br from-[#00E57A] to-[#04B463] border border-white/30 w-[45px] h-[25px] rounded-[8px] flex items-center justify-center shadow-[0_5px_15px_rgba(0,229,122,0.4)]"
        >
          {isCoin ? (
            <Coins className="w-4 h-4 text-white drop-shadow-md" />
          ) : (
            <DollarSign className="w-4 h-4 text-white drop-shadow-md" />
          )}
        </motion.div>
      ))}

      {/* Main 3D Wallet Icon Container */}
      <motion.div 
        animate={{ y: [-4, 4, -4], rotate: [-1, 1, -1] }} 
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-20 w-32 h-[85px] bg-gradient-to-br from-[#8B5CF6] via-[#7C3AED] to-[#5B21B6] rounded-[20px] border border-white/20 shadow-[0_15px_35px_rgba(139,92,246,0.4)] flex flex-col items-center justify-center backdrop-blur-xl overflow-hidden"
      >
        {/* Inner highlights for 3D effect */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
        
        {/* Wallet Flap Detail */}
        <div className="absolute top-2 w-16 h-1.5 bg-black/20 rounded-full shadow-inner"></div>
        
        <Wallet className="w-10 h-10 text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.3)] mt-2" />
      </motion.div>
      
    </div>
  );
}