'use client';

import React, { useState } from 'react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

interface LiveTickerProps {
  feeds: any[];
}

function TickerAvatar({ userImage, userName, avatarBg, initialChar }: { userImage: string; userName: string; avatarBg: string; initialChar: string }) {
  const [hasError, setHasError] = useState(false);

  if (!userImage || userImage.trim() === '' || hasError) {
    return (
      <div className={`w-full h-full ${avatarBg} flex items-center justify-center text-white text-xs font-black`}>
        {initialChar}
      </div>
    );
  }

  let finalImageSrc = userImage;
  if (userImage.startsWith('/uploads')) {
    finalImageSrc = `https://apitest.binnycash.com${userImage}`;
  }

  return (
    <img 
      src={finalImageSrc} 
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
    <div className="w-full bg-[#120F1A]/85 backdrop-blur-md border-b border-white/[0.06] py-3 z-20">
      
      {/* Scrollbar hide karne ke liye styling taaki clean dikhe */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        
        {/* 
          🔥 STATIC & SIDE-SWIPEABLE FIX:
          - 'overflow-x-auto hide-scroll': Width khatam hone par side swipe enable karega
          - 'flex-nowrap': Cards ko wrap hoke neeche jaane se rokkega
          - Koi auto-scroll ya continuous flow nahi hai, ekdam static!
        */}
        <div className="flex overflow-x-auto hide-scroll w-full flex-nowrap gap-4 pb-1 cursor-grab active:cursor-grabbing">
          {feeds.map((feed, idx) => {
            const userName = feed.userName || feed.username || 'User';
            const statusText = feed.status || 'Completed';
            const userImage = feed.image || feed.profilePic;
            const amountVal = Number(feed.amount || feed.reward || 0);
            const initialChar = userName.charAt(0).toUpperCase();

            const colors = ['bg-amber-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500'];
            const charCode = initialChar.charCodeAt(0) || 0;
            const avatarBg = colors[charCode % colors.length];

            const uniqueKey = feed._id ? `${feed._id}-${idx}` : `feed-${idx}-${userName}`;

            return (
              <div 
                key={uniqueKey}
                className="bg-[#1A1725] border border-white/[0.08] hover:border-[#A66CFF]/40 rounded-2xl px-4 py-2.5 flex items-center gap-3 shrink-0 shadow-lg transition-colors"
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
                    <span className="text-[10px] font-bold text-[#00E57A] f-mono whitespace-nowrap">
                      +{formatPrice(amountVal, currency)}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-[#8D89A8] capitalize whitespace-nowrap">
                    {statusText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}