'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import OfferwallCard from '@/components/offerwalls/OfferwallCard';
import OfferwallModal from '@/components/offerwalls/OfferwallModal';
import { Boxes, ChevronLeft, ChevronRight } from "lucide-react";

export default function OfferwallSlider({ offerwalls = [], isLoading = false }: any) {
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // 🚀 Arrow visibility states
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  const [selectedOfferwall, setSelectedOfferwall] = useState<any>(null);

  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 5); 
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5); 
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [offerwalls]);

  // 🚀 Smooth Scroll Functions
  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 mt-6 relative">
      
      {/* 🚀 Header Section - Blended with background */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-4">
        
        {/* Title */}
        <div className="flex flex-col shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Boxes className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-black text-white tracking-widest uppercase">OFFER WALLS</h2>
          </div>
          <p className="text-[#8F95A3] text-xs font-medium">Explore top offer walls to maximize your earnings.</p>
        </div>

        {/* Dynamic Arrows */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5">
            {canScrollLeft && (
              <button 
                onClick={scrollLeft} 
                className="w-9 h-9 rounded-[10px] bg-[#111319] border border-white/10 flex items-center justify-center text-[#8F95A3] hover:text-white hover:bg-white/5 transition-all cursor-pointer shadow-sm"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
            {canScrollRight && (
              <button 
                onClick={scrollRight} 
                className="w-9 h-9 rounded-[10px] bg-[#111319] border border-white/10 flex items-center justify-center text-[#8F95A3] hover:text-white hover:bg-white/5 transition-all cursor-pointer shadow-sm"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Slider Section */}
      <div className="relative group">
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden py-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-[230px] sm:h-[250px] w-[160px] sm:w-[180px] bg-[#161821] animate-pulse rounded-[24px] shrink-0 border border-white/5"></div>
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
          <div className="text-center py-12 bg-[#120F1A] border border-white/5 rounded-[24px] text-[#8F95A3] text-sm font-medium shadow-inner">
            No offer walls available right now. Check back later!
          </div>
        )}
      </div>

      <OfferwallModal 
        isOpen={!!selectedOfferwall} 
        onClose={() => setSelectedOfferwall(null)} 
        offerwall={selectedOfferwall} 
      />
    </div>
  );
}