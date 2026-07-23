'use client';

import React from 'react';

export default function LiveTicker({ feeds = [] }: { feeds: any[] }) {
  // Agar koi live data nahi hai toh ticker hide kar do
  if (!feeds || feeds.length === 0) return null;

  // Seamless infinite loop ke liye array ko duplicate kar rahe hain
  // Ek half array ka 50% banayega, taaki scroll ekdum smooth ho
  const half = [...feeds, ...feeds, ...feeds, ...feeds]; 
  const displayFeeds = [...half, ...half];

  return (
    <div className="w-full bg-[#0B0D19] border-b border-white/5 py-4 overflow-hidden flex relative">
      
      {/* 🔴 LIVE Badge indicator floating on the left */}
      <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center px-4 bg-gradient-to-r from-[#0B0D19] via-[#0B0D19] to-transparent">
        <div className="flex items-center gap-2 bg-[#1A1C24] border border-white/5 px-3 py-1.5 rounded-full shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#A855F7] shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse"></span>
          <span className="text-white text-xs font-black tracking-widest uppercase">Live</span>
        </div>
      </div>

      {/* Right side fade effect for smooth disappearing */}
      <div className="absolute right-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-l from-[#0B0D19] to-transparent z-10 pointer-events-none"></div>

      {/* Marquee Scrolling Container */}
      <div className="flex items-center gap-3 animate-marquee whitespace-nowrap hover:[animation-play-state:paused] pl-32">
        {displayFeeds.map((feed, idx) => {
          // Fallback handling for data fields
          const name = feed.userName || feed.username || feed.name || 'User';
          const subText = feed.offer || feed.title || feed.network || 'Completed Offer';
          const amount = feed.totalUsdValue || feed.reward || feed.amount || '0.00';
          
          let imageUrl = feed.image || `https://ui-avatars.com/api/?name=${name.replace(/\s+/g, '+')}&background=1A1C24&color=fff`;
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `https://apitest.binnycash.com${imageUrl}`;
          }

          return (
            <div 
              key={`${feed._id || 'feed'}-${idx}`} 
              className="flex items-center gap-3 bg-[#161821] hover:bg-[#1A1C24] transition-colors border border-white/5 rounded-xl p-2 pr-4 shrink-0 min-w-[200px] max-w-[260px] cursor-default shadow-sm"
            >
              {/* Left Image */}
              <img 
                src={imageUrl} 
                alt={name} 
                className="w-10 h-10 rounded-lg object-cover bg-white/5 shrink-0 border border-white/5" 
                onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${name.replace(/\s+/g, '+')}&background=8B5CF6&color=fff`; }} 
              />
              
              {/* Center Text (Name & Category) */}
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-white text-[13px] font-bold truncate">{name}</span>
                <span className="text-[#8F95A3] text-[11px] font-medium truncate">{subText}</span>
              </div>
              
              {/* Right Price (Purple $ and Amount) */}
              <div className="flex items-center gap-1 shrink-0 ml-1">
                <span className="text-[#A855F7] font-black text-sm">$</span>
                <span className="text-white font-black text-[15px] leading-none">{parseFloat(amount).toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Marquee CSS Keyframes */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          /* 🔥 Speed yahan slow ki hai (60s se 120s kar diya) 🔥 */
          animation: marquee 120s linear infinite; 
          width: max-content;
        }
      `}} />
    </div>
  );
}