'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Lock, Loader2 } from 'lucide-react';

export default function OfferwallCard({ offerwall, onClick, isClicking }: { offerwall: any, onClick?: (ow: any) => void, isClicking?: boolean }) {
  const name = offerwall.title || offerwall.offerwall_name || offerwall.name || 'Offerwall';
  const isLocked = offerwall.status === false;
  
  let imageUrl = offerwall.poster || offerwall.image || '';
  if (imageUrl && !imageUrl.startsWith('http')) {
    const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    imageUrl = `https://api.binnycash.com${cleanPath}`;
  }

  const ratingCount = offerwall.rating ? Math.min(5, Math.max(1, offerwall.rating)) : 5;

  return (
    <motion.div 
      onClick={() => {
        if (!isLocked && onClick) onClick(offerwall);
      }}
      whileHover={!isLocked ? { y: -6, scale: 1.03 } : {}}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative w-[130px] sm:w-[150px] h-[190px] sm:h-[210px] shrink-0 rounded-[20px] p-3 sm:p-4 flex flex-col justify-between overflow-hidden group border border-white/10 ${
        isLocked 
          ? 'opacity-75 grayscale-[40%] cursor-not-allowed shadow-none' 
          : 'cursor-pointer shadow-[0_20px_40px_-12px_rgba(90,46,135,0.55)]'
      }`}
      style={{ 
        background: 'linear-gradient(160deg, #7C3FC4 0%, #6829A8 35%, #4B1D82 70%, #2E1155 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)'
      }}
    >
      {/* Background Decor */}
      <div className="absolute inset-0 rounded-[20px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)] pointer-events-none z-10"></div>
      <div className="absolute -top-8 -left-8 w-[100px] h-[100px] bg-white/20 rounded-full blur-[40px] pointer-events-none z-0"></div>
      <div className="absolute -top-10 -right-16 w-[100px] h-[200px] rotate-[25deg] bg-white/10 pointer-events-none z-0 blur-[2px]"></div>
      <div className="absolute -bottom-10 -right-10 w-[120px] h-[120px] bg-black/30 rounded-full blur-[40px] pointer-events-none z-0"></div>

      {/* API Loading Overlay */}
      {isClicking && (
        <div className="absolute inset-0 z-50 bg-black/60 rounded-[20px] flex flex-col items-center justify-center backdrop-blur-sm">
          <Loader2 className="w-6 h-6 text-white animate-spin mb-2" />
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Connecting...</span>
        </div>
      )}

      {/* Top Header */}
      <div className="relative z-20 flex items-center gap-2">
        <div className="w-[32px] h-[32px] sm:w-[38px] sm:h-[38px] flex items-center justify-center shrink-0 bg-white rounded-[10px] p-1.5 shadow-[0_4px_10px_rgba(0,0,0,0.25)] border border-white/40">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={name} 
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              className="max-w-full max-h-full object-contain drop-shadow-sm rounded-md"
            />
          ) : (
             <span className="text-[#4B1D82] font-black text-lg">{name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span className="text-white/80 font-semibold text-[11px] sm:text-[12px] tracking-wide truncate drop-shadow-sm">
          {name}
        </span>
      </div>

      {/* Bottom Footer */}
      <div className="relative z-20 mt-auto flex flex-col gap-1.5">
        <h3 className="text-white text-[16px] sm:text-[18px] font-bold leading-[1.15] tracking-tight drop-shadow-md line-clamp-2">
          {name}
        </h3>

        {isLocked ? (
          <div className="flex items-center gap-1.5 mt-1">
            <Lock className="w-3.5 h-3.5 text-white/50" />
            <span className="text-[10px] text-white/50 font-medium">Level up to unlock</span>
          </div>
        ) : (
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
        )}
      </div>

      {isLocked && <div className="absolute inset-0 bg-black/20 rounded-[20px] pointer-events-none z-30" />}
      {!isLocked && <div className="absolute inset-0 rounded-[20px] border-[1.5px] border-transparent group-hover:border-white/20 transition-colors duration-300 pointer-events-none z-10"></div>}
    </motion.div>
  );
}