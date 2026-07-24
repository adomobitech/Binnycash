'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import OfferwallCard from '@/components/offerwalls/OfferwallCard';
import OfferwallModal from '@/components/offerwalls/OfferwallModal';
import { Boxes } from "lucide-react";

export default function OfferwallSlider({ offerwalls = [], isLoading = false }: any) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  const [selectedOfferwall, setSelectedOfferwall] = useState<any>(null);

  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setShowArrows(scrollWidth > clientWidth);
      setCanScrollLeft(scrollLeft > 5); 
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5); 
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [offerwalls]);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollAmount = clientWidth * 0.75;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 relative">
      <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 bg-[#111319]/80 backdrop-blur-md p-4 rounded-[20px] border border-white/5 shadow-lg">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
            <Boxes className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-xl font-black text-white whitespace-nowrap">Offer Walls</h2>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {showArrows && (
            <div className="hidden sm:flex items-center gap-2">
              {canScrollLeft && (
                <button onClick={() => scroll('left')} className="w-9 h-9 rounded-xl bg-[#1A1C24] border border-white/10 flex items-center justify-center text-[#8F95A3] hover:text-white hover:bg-white/10 transition-all cursor-pointer shadow-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
              )}
              {canScrollRight && (
                <button onClick={() => scroll('right')} className="w-9 h-9 rounded-xl bg-[#1A1C24] border border-white/10 flex items-center justify-center text-[#8F95A3] hover:text-white hover:bg-white/10 transition-all cursor-pointer shadow-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              )}
            </div>
          )}
          <Link href="/offerwalls" className="text-xs font-bold text-[#8B5CF6] bg-[#8B5CF6]/10 px-4 py-2.5 rounded-xl border border-[#8B5CF6]/20 hover:bg-[#8B5CF6] hover:text-white transition-all whitespace-nowrap">
            View All
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-hidden py-2">
          {[1, 2, 3, 4, 5].map((i) => (
            /* 🔥 Skeleton updated to match new 180x250 size and 24px rounded 🔥 */
            <div key={i} className="h-[230px] sm:h-[250px] w-[160px] sm:w-[180px] bg-white/5 animate-pulse rounded-[24px] shrink-0 border border-white/5"></div>
          ))}
        </div>
      ) : offerwalls.length > 0 ? (
        <div ref={sliderRef} onScroll={checkScroll} className="flex overflow-x-auto no-scrollbar gap-4 sm:gap-5 pb-5 pt-2 snap-x scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {offerwalls.map((item: any, index: number) => {
            const fixedItem = {
              ...item,
              image: item.image && !item.image.startsWith('http') 
                ? `https://apitest.binnycash.com${item.image}` 
                : item.image
            };
            return (
              <div key={item._id || item.id || index} className="snap-start shrink-0">
                <OfferwallCard offerwall={fixedItem} onClick={setSelectedOfferwall} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#111319] border border-white/5 rounded-[24px] text-[#8F95A3] text-sm font-medium shadow-inner">
          No offerwalls available right now. Check back later!
        </div>
      )}

      <OfferwallModal 
        isOpen={!!selectedOfferwall} 
        onClose={() => setSelectedOfferwall(null)} 
        offerwall={selectedOfferwall} 
      />
    </div>
  );
}