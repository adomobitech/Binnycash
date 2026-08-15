'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

interface LiveTickerProps {
  feeds: any[];
}

// Sub-component to safely handle image loading and fallbacks
function TickerAvatar({ userImage, userName, avatarBg, initialChar }: { userImage: string; userName: string; avatarBg: string; initialChar: string }) {
  const [hasError, setHasError] = useState(false);

  if (!userImage || userImage.trim() === '' || hasError) {
    return (
      <div className={`w-full h-full ${avatarBg} flex items-center justify-center text-white text-xs font-black`}>
        {initialChar}
      </div>
    );
  }

  return (
    <img 
      src={userImage} 
      alt={userName} 
      className="w-full h-full object-cover"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
    />
  );
}

export default function LiveTicker({ feeds }: LiveTickerProps) {
  const currency = useCurrency();

  if (!feeds || feeds.length === 0) return null;

  return (
    <div className="w-full bg-[#120F1A]/80 backdrop-blur-md border-b border-white/[0.06] py-3 px-4 sm:px-6 overflow-hidden relative z-20">
      <div className="max-w-[1600px] mx-auto flex items-center gap-4 overflow-x-auto no-scrollbar">
        
        <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-white/10">
          <span className="w-2 h-2 rounded-full bg-[#00E57A] animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wider uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#A66CFF]" /> Live Activity
          </span>
        </div>

        <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
          {feeds.map((feed, idx) => {
            const userName = feed.userName || feed.username || 'User';
            const statusText = feed.status || 'Completed Offer';
            const userImage = feed.image;
            const amountVal = Number(feed.amount || feed.reward || 0);
            const initialChar = userName.charAt(0).toUpperCase();

            const colors = ['bg-amber-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500'];
            const avatarBg = colors[idx % colors.length];

            return (
              <motion.div 
                key={feed._id || idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-[#1A1725] border border-white/[0.08] hover:border-[#A66CFF]/40 rounded-2xl px-4 py-2.5 flex items-center gap-3 shrink-0 shadow-lg transition-all"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center border border-white/10 bg-black/20">
                  <TickerAvatar 
                    userImage={userImage} 
                    userName={userName} 
                    avatarBg={avatarBg} 
                    initialChar={initialChar} 
                  />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white max-w-[120px] truncate">{userName}</span>
                    <span className="text-[10px] font-bold text-[#00E57A] f-mono">
                      +{formatPrice(amountVal, currency)}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-[#8D89A8] capitalize">
                    {statusText}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}