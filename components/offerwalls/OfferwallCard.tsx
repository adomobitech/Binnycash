'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function OfferwallCard({ offerwall, onClick }: { offerwall: any, onClick?: (ow: any) => void }) {
  const name = offerwall.title || offerwall.offerwall_name || offerwall.name || 'Offerwall';
  
  let imageUrl = offerwall.image || `https://ui-avatars.com/api/?name=${name.replace(/\s+/g, '+')}&background=5A2E87&color=fff`;
  if (imageUrl && !imageUrl.startsWith('http')) {
    imageUrl = `https://apitest.binnycash.com${imageUrl}`;
  }

  const ratingCount = offerwall.rating ? Math.min(5, Math.max(1, offerwall.rating)) : 5;

  return (
    <motion.div 
      onClick={() => onClick && onClick(offerwall)}
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      // 🔥 Size Reduced to match other compact cards 🔥
      className="relative w-[130px] sm:w-[150px] h-[190px] sm:h-[210px] shrink-0 rounded-[20px] p-3 sm:p-4 flex flex-col justify-between cursor-pointer overflow-hidden group shadow-[0_20px_40px_-12px_rgba(90,46,135,0.55)] border border-white/10"
      style={{ 
        // 💜 Premium Transparent Purple Glassmorphism Effect 💜
        background: 'linear-gradient(160deg, #7C3FC4 0%, #6829A8 35%, #4B1D82 70%, #2E1155 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)'
      }}
    >
      {/* 🔮 Subtle Inner Glass Highlight & Light Flare */}
      <div className="absolute inset-0 rounded-[20px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)] pointer-events-none z-10"></div>
      {/* Soft glow blob top-left for glass sheen */}
      <div className="absolute -top-8 -left-8 w-[100px] h-[100px] bg-white/20 rounded-full blur-[40px] pointer-events-none z-0"></div>
      {/* Diagonal reflective streak */}
      <div 
        className="absolute -top-10 -right-16 w-[100px] h-[200px] rotate-[25deg] bg-white/10 pointer-events-none z-0 blur-[2px]"
      ></div>
      {/* Bottom-right dark vignette for depth */}
      <div className="absolute -bottom-10 -right-10 w-[120px] h-[120px] bg-black/30 rounded-full blur-[40px] pointer-events-none z-0"></div>

      {/* 🚀 TOP: Small Logo + Name Side-by-Side */}
      <div className="relative z-20 flex items-center gap-2">
        {/* Adjusted Logo Box to fit in small card */}
        <div className="w-[32px] h-[32px] sm:w-[38px] sm:h-[38px] flex items-center justify-center shrink-0 bg-white rounded-[10px] p-1.5 shadow-[0_4px_10px_rgba(0,0,0,0.25)] border border-white/40">
          <img 
            src={imageUrl} 
            alt={name} 
            className="max-w-full max-h-full object-contain drop-shadow-sm rounded-md"
            onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${name.replace(/\s+/g, '+')}&background=5A2E87&color=fff`; }}
          />
        </div>
        
        {/* Top Name (Small & Truncated) */}
        <span className="text-white/80 font-semibold text-[11px] sm:text-[12px] tracking-wide truncate drop-shadow-sm">
          {name}
        </span>
      </div>

      {/* 📝 BOTTOM: Big App Name + Stars */}
      <div className="relative z-20 mt-auto flex flex-col gap-1.5">
        {/* Big Name Above Stars */}
        <h3 className="text-white text-[16px] sm:text-[18px] font-bold leading-[1.15] tracking-tight drop-shadow-md line-clamp-2">
          {name}
        </h3>

        {/* ⭐ Stars */}
        <div className="flex items-center gap-[3px]">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-[12px] h-[12px] sm:w-[14px] sm:h-[14px] ${
                i < ratingCount 
                  ? 'fill-[#FFC107] text-[#FFC107]' 
                  : 'text-white/10 fill-white/5'
              } drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]`} 
            />
          ))}
        </div>
      </div>

      {/* 🔥 Hover Border Glow */}
      <div className="absolute inset-0 rounded-[20px] border-[1.5px] border-transparent group-hover:border-white/20 transition-colors duration-300 pointer-events-none z-10"></div>
    </motion.div>
  );
}