'use client';

import React from 'react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency'; 

// 🔥 DYNAMIC COLOR GENERATOR 🔥
const getDynamicColor = (name: string) => {
  const colors = [
    'bg-[#8B5CF6]', // Purple
    'bg-[#3B82F6]', // Blue
    'bg-[#EC4899]', // Pink
    'bg-[#10B981]', // Green
    'bg-[#F59E0B]', // Orange
    'bg-[#EF4444]', // Red
    'bg-[#6366F1]', // Indigo
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function LiveTicker({ feeds = [] }: { feeds: any[] }) {
  const currency = useCurrency();
  
  if (!feeds || feeds.length === 0) return null;

  return (
    <div className="w-full bg-[#0B0D19] border-b border-white/5 py-3 relative overflow-hidden">
      
      {/* Global style to completely hide scrollbar */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Scrollable Container without any bar */}
      <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
        {feeds.map((feed, idx) => {
          const name = feed.userName || feed.username || feed.name || 'User';
          const subText = feed.offer || feed.title || feed.network || 'Completed Offer';
          const amount = feed.totalUsdValue || feed.reward || feed.amount || 0; 

          return (
            <div 
              key={`${feed._id || 'feed'}-${idx}`} 
              className="flex items-center gap-3 bg-[#161821] hover:bg-[#1A1C24] transition-colors border border-white/5 rounded-xl p-2.5 pr-4 shrink-0 min-w-[220px] max-w-[300px] shadow-sm cursor-pointer select-none"
            >
              {/* 🔥 FIRST LETTER & DYNAMIC COLOR BLOCK 🔥 */}
              <div className={`w-10 h-10 rounded-xl ${getDynamicColor(name)} flex items-center justify-center text-white text-[16px] font-black uppercase shrink-0 shadow-sm`}>
                {name.charAt(0)}
              </div>
              
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-white text-[13px] font-bold truncate">{name}</span>
                <span className="text-[#8F95A3] text-[11px] font-medium truncate">{subText}</span>
              </div>
              
              <div className="flex items-center shrink-0 pl-2">
                <span className="text-[#A855F7] font-black text-[14px] leading-none whitespace-nowrap">
                  {formatPrice(amount, currency)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}