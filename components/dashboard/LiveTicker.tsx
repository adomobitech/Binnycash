'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

interface LiveTickerProps {
  feeds: any[];
}

function TickerAvatar({ userImage, userName, avatarBg, initialChar }: { userImage: string; userName: string; avatarBg: string; initialChar: string }) {
  const [hasError, setHasError] = useState(false);

  // Fallback if no image or image fails to load
  if (!userImage || userImage.trim() === '' || hasError) {
    return (
      <div className={`w-full h-full ${avatarBg} flex items-center justify-center text-white text-xs font-black`}>
        {initialChar}
      </div>
    );
  }

  // Helper logic to correct paths coming from backend
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
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [duration, setDuration] = useState(20); // Default speed

  // Perfect measurement logic for seamless loop trigger and CONSTANT speed
  useEffect(() => {
    const checkWidth = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.getBoundingClientRect().width;
        // Measure strictly the width of ONE block of items
        const contentWidth = contentRef.current.getBoundingClientRect().width;
        
        // Trigger scroll only if content is wider than screen space
        setShouldScroll(contentWidth > containerWidth);

        // Dynamically set animation duration based on pixels (constant speed regardless of item count)
        // 40 pixels per second is a very smooth reading speed
        setDuration(Math.max(contentWidth / 40, 10));
      }
    };

    // Check on mount and slightly after to account for DOM painting/images
    checkWidth();
    const timeoutId = setTimeout(checkWidth, 200);

    // Watch for screen resizing dynamically
    window.addEventListener('resize', checkWidth);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkWidth);
    };
  }, [feeds]);

  if (!feeds || feeds.length === 0) return null;

  // Render function to keep our markup clean (DRY principle)
  const renderFeeds = (isClone = false) => {
    return feeds.map((feed, idx) => {
      const userName = feed.userName || feed.username || 'User';
      const statusText = feed.status || 'Completed';
      const userImage = feed.image || feed.profilePic;
      const amountVal = Number(feed.amount || feed.reward || 0);
      const initialChar = userName.charAt(0).toUpperCase();

      // Consistent colors based on string to keep avatar bg same for same user
      const colors = ['bg-amber-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500'];
      const charCode = initialChar.charCodeAt(0) || 0;
      const avatarBg = colors[charCode % colors.length];

      // Give unique keys to clone items to prevent React rendering issues
      const itemKey = isClone ? `clone-${feed._id || idx}-${idx}` : `original-${feed._id || idx}-${idx}`;

      return (
        <div 
          key={itemKey}
          className="bg-[#1A1725] border border-white/[0.08] hover:border-[#A66CFF]/40 rounded-2xl px-4 py-2.5 flex items-center gap-3 shrink-0 shadow-lg transition-colors cursor-default"
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
    });
  };

  return (
    <div className="w-full bg-[#120F1A]/85 backdrop-blur-md border-b border-white/[0.06] py-3 overflow-hidden relative z-20">
      
      {/* 
        Injecting the Keyframes locally with Hardware Acceleration.
        will-change and backface-visibility completely eliminate micro-stutters.
      */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes seamless-ticker {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-seamless-loop {
          animation: seamless-ticker ${duration}s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
        }
      `}} />

      <div className="max-w-[1600px] mx-auto flex items-center">
        
        {/* Fixed Live Label on Left */}
        <div className="flex items-center gap-2 shrink-0 px-4 sm:px-6 bg-[#120F1A] z-10 border-r border-white/10 py-1 h-full shadow-[10px_0_15px_-5px_rgba(18,15,26,1)]">
          <span className="w-2 h-2 rounded-full bg-[#00E57A] animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wider uppercase flex items-center gap-1.5 whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-[#A66CFF]" /> Live Activity
          </span>
        </div>

        {/* Ticker Scrolling Container */}
        <div 
          ref={containerRef}
          className={`flex overflow-hidden relative w-full ${shouldScroll ? '[-webkit-mask-image:linear-gradient(to_right,transparent,black_1%,black_99%,transparent)] [mask-image:linear-gradient(to_right,transparent,black_1%,black_99%,transparent)]' : 'px-4'}`}
        >
          {/* The Scrolling Track (Uses pause on hover for better UX) */}
          <div className={`flex w-max ${shouldScroll ? 'animate-seamless-loop hover:[animation-play-state:paused]' : ''}`}>
            
            {/* BLOCK 1: Original Feeds (Always rendered, used for width measurement) */}
            {/* IMPORTANT: pr-4 precisely balances the gap so the loop doesn't jump */}
            <div ref={contentRef} className="flex items-center gap-4 pr-4">
              {renderFeeds(false)}
            </div>

            {/* BLOCK 2: Cloned Feeds (Only appears when scrolling is needed to make the loop seamless) */}
            {shouldScroll && (
              <div className="flex items-center gap-4 pr-4" aria-hidden="true">
                {renderFeeds(true)}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}