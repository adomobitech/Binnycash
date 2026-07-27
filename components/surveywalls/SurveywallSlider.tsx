'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import OfferCard from '@/components/offers/OfferCard';
import { ListChecks } from "lucide-react";
export default function SurveywallSlider({ surveywalls = [], isLoading = false }: any) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
  }, [surveywalls]);

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
    <div className="w-full flex flex-col gap-3">
      <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 bg-[#14171F] p-3 md:p-4 rounded-xl border border-white/5">
        <div className="flex items-center gap-2 shrink-0">
          <ListChecks className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-black text-white whitespace-nowrap">Survey Walls</h2>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {showArrows && (
            <div className="hidden sm:flex items-center gap-1.5">
              {canScrollLeft && (
                <button onClick={() => scroll('left')} className="w-8 h-8 rounded-lg bg-[#1A1C24] border border-white/5 flex items-center justify-center text-[#8F95A3] hover:text-white transition-all cursor-pointer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
              )}
              {canScrollRight && (
                <button onClick={() => scroll('right')} className="w-8 h-8 rounded-lg bg-[#1A1C24] border border-white/5 flex items-center justify-center text-[#8F95A3] hover:text-white transition-all cursor-pointer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              )}
            </div>
          )}
          <Link href="/surveywalls" className="text-[11px] font-bold text-white bg-[#8B5CF6]/20 px-3.5 py-2 rounded-lg border border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/40 transition-colors whitespace-nowrap">
            View All
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-3 overflow-hidden py-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 w-[165px] sm:w-[175px] bg-white/5 animate-pulse rounded-2xl shrink-0"></div>
          ))}
        </div>
      ) : surveywalls.length > 0 ? (
        <div ref={sliderRef} onScroll={checkScroll} className="flex overflow-x-auto no-scrollbar gap-3 pb-3 pt-1 snap-x scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {surveywalls.map((item: any, index: number) => {
            const fixedItem = {
              ...item,
              image: item.image && !item.image.startsWith('http') 
                ? `https://apitest.binnycash.com${item.image}` 
                : item.image
            };
            return (
              <div key={item._id || item.id || index} className="snap-start">
                <OfferCard offer={fixedItem} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#1A1C24] border border-white/5 rounded-2xl text-[#8F95A3] text-sm">
          No surveywalls available right now. Check back later!
        </div>
      )}
    </div>
  );
}