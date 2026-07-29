'use client';

import React from 'react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency'; 

export default function LiveTicker({ feeds = [] }: { feeds: any[] }) {
  const currency = useCurrency();
  
  if (!feeds || feeds.length === 0) return null;

  return (
    <div className="w-full bg-[#0B0D19] border-b border-white/5 py-4">
      
      {/* Scrollable Container */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
        {feeds.map((feed, idx) => {
          const name = feed.userName || feed.username || feed.name || 'User';
          const subText = feed.offer || feed.title || feed.network || 'Completed Offer';
          const amount = feed.totalUsdValue || feed.reward || feed.amount || 0; 
          
          let imageUrl = feed.image || `https://ui-avatars.com/api/?name=${name.replace(/\s+/g, '+')}&background=1A1C24&color=fff`;
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `https://apitest.binnycash.com${imageUrl}`;
          }

          return (
            <div 
              key={`${feed._id || 'feed'}-${idx}`} 
              className="flex items-center gap-3 bg-[#161821] hover:bg-[#1A1C24] transition-colors border border-white/5 rounded-xl p-2 pr-4 shrink-0 min-w-[200px] max-w-[280px] shadow-sm cursor-pointer"
            >
              <img 
                src={imageUrl} 
                alt={name} 
                className="w-10 h-10 rounded-lg object-cover bg-white/5 shrink-0 border border-white/5" 
                onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${name.replace(/\s+/g, '+')}&background=8B5CF6&color=fff`; }} 
              />
              
              <div className="flex flex-col flex-1 min-w-0 pr-2">
                <span className="text-white text-[13px] font-bold truncate">{name}</span>
                <span className="text-[#8F95A3] text-[11px] font-medium truncate">{subText}</span>
              </div>
              
              <div className="flex items-center shrink-0">
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