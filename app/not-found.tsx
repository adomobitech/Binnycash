'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Rocket, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[85vh] bg-[#08080C] flex flex-col items-center justify-center relative overflow-hidden font-sans text-white">
      
      {/* 🔥 YE CSS TRICK 404 PAGE PAR TICKER KO GAYAB KAR DEGI 🔥 */}
      <style dangerouslySetInnerHTML={{ __html: `
        #global-ticker-wrapper { display: none !important; }
      `}} />

      {/* --- CRAZY GLOWING BACKGROUNDS --- */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-[#8B5CF6]/10 blur-[100px] md:blur-[150px] rounded-full pointer-events-none z-0" />
      
      {/* --- FLOATING PARTICLES --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white] animate-ping" />
        <div className="absolute top-[60%] right-[15%] w-3 h-3 bg-[#00E57A] rounded-full shadow-[0_0_15px_#00E57A] animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-2xl mt-10">
        
        {/* --- ANIMATED ICON --- */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative mb-6"
        >
          {/* Glowing back-circle */}
          <div className="absolute inset-0 bg-[#8B5CF6] blur-[30px] opacity-40 rounded-full" />
          
          {/* Main Icon Container */}
          <div className="w-28 h-28 md:w-32 md:h-32 bg-[#1A1C24] border-2 border-[#8B5CF6]/40 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <Rocket className="w-12 h-12 md:w-16 md:h-16 text-[#00E57A]" />
          </div>
          <Sparkles className="absolute -top-2 -right-4 w-8 h-8 text-[#A66CFF] animate-pulse" />
        </motion.div>

        {/* --- 404 TEXT --- */}
        <h1 className="text-[80px] md:text-[130px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-[#A66CFF] to-[#2E1854] drop-shadow-2xl relative z-10 mb-2">
          404
        </h1>

        <h2 className="text-2xl md:text-3xl font-black mb-4 text-white tracking-tight">
          Page Not Found
        </h2>
        
        <p className="text-[#8F95A3] md:text-base mb-10 leading-relaxed max-w-sm">
          Looks like you've wandered into the unknown. The page you're looking for has vanished or never existed.
        </p>

        {/* --- ACTION BUTTON --- */}
        <Link href="/" className="w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] px-10 py-4 rounded-2xl text-white font-black shadow-[0_0_25px_rgba(139,92,246,0.4)] flex items-center justify-center gap-3 border border-[#A66CFF]/30 transition-all cursor-pointer text-sm tracking-wider uppercase"
          >
            <Home className="w-5 h-5" /> Return to Homepage
          </motion.button>
        </Link>

      </div>
    </div>
  );
}