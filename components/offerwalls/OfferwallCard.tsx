'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function OfferwallCard({ offerwall, onClick }: { offerwall: any, onClick?: (ow: any) => void }) {
  // 🔥 API JSON ke hisaab se "title" fetch kar rahe hain
  const name = offerwall.title || offerwall.offerwall_name || offerwall.name || 'Offerwall';
  
  let imageUrl = offerwall.image || `https://ui-avatars.com/api/?name=${name.replace(/\s+/g, '+')}&background=8B5CF6&color=fff`;
  if (imageUrl && !imageUrl.startsWith('http')) {
    imageUrl = `https://apitest.binnycash.com${imageUrl}`;
  }

  // API se aayi hui original rating ya default 5 visual stars
  const ratingCount = offerwall.rating ? Math.min(5, Math.max(1, offerwall.rating)) : 5;

  return (
    <motion.div 
      onClick={() => onClick && onClick(offerwall)}
      whileHover={{ y: -6, scale: 1.02 }}
      className="w-[150px] sm:w-[160px] h-[220px] rounded-[24px] p-4 flex flex-col items-center justify-between cursor-pointer border border-white/5 relative overflow-hidden group shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
      style={{
        background: 'linear-gradient(180deg, #2D2145 0%, #1E1730 100%)'
      }}
    >
      <div className="absolute inset-0 bg-[#8B5CF6] opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-2xl pointer-events-none"></div>

      <div className="flex-1 flex items-center justify-center w-full mt-2 relative z-10 pointer-events-none">
        <img 
          src={imageUrl} 
          alt={name} 
          className="max-w-[85%] max-h-[60px] object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-300"
          onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${name.replace(/\s+/g, '+')}&background=8B5CF6&color=fff`; }}
        />
      </div>

      <div className="flex flex-col items-center w-full relative z-10 mb-2 pointer-events-none">
        <h3 className="text-white font-bold text-[15px] text-center w-full truncate mb-1.5 drop-shadow-sm">
          {name}
        </h3>

        <div className="flex items-center gap-[2px]">
          {/* Creating visual stars based on rating */}
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < ratingCount ? 'fill-[#FACC15] text-[#FACC15]' : 'text-white/20'}`} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}