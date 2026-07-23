'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import OfferCard from '@/components/offers/OfferCard';
import OfferFilters from '@/components/offers/OfferFilters'; 
import { Sparkles } from "lucide-react";

export function filterOffersByDevice(offers: any[], selectedDevices: string[]) {
  if (!selectedDevices || selectedDevices.length === 0) return offers;

  return offers.filter((offer) => {
    const browsers = (offer?.browsers || '').toLowerCase();
    const categories = (offer?.categories || offer?.category || '').toLowerCase();
    const offerType = (offer?.offer_type || '').toLowerCase();
    
    const isAndroid = browsers.includes('android') || categories.includes('android') || offerType.includes('android');
    const isIos = browsers.includes('ios') || browsers.includes('iphone') || browsers.includes('ipad') || categories.includes('ios') || offerType.includes('ios');
    const isDesktop = browsers.includes('desktop') || browsers.includes('web') || browsers.includes('pc') || categories.includes('web') || offerType.includes('web');
    const isAll = browsers.includes('all') || (!isAndroid && !isIos && !isDesktop);

    if (isAll) return true;

    return selectedDevices.some((device) => {
      if (device === 'android' && isAndroid) return true;
      if (device === 'ios' && isIos) return true;
      if ((device === 'desktop' || device === 'mac' || device === 'windows') && isDesktop) return true;
      if (device === 'ipad' && isIos) return true;
      return false;
    });
  });
}

export default function OfferSlider({ 
  offers = [], 
  isLoading = false, 
  selectedDevices = [], 
  onSelectDevice = () => {} 
}: any) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const filteredOffers = filterOffersByDevice(offers, selectedDevices);

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
  }, [filteredOffers]);

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
      {/* Header Container */}
      <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 bg-[#14171F] p-3 md:p-4 rounded-xl border border-white/5">
        
        {/* 💥 LEFT SIDE: Title + OfferFilters Ek Saath Grouped Hain */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar max-w-full">
          <div className="flex items-center gap-2 shrink-0">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h2 className="text-base font-black text-white whitespace-nowrap">Featured Offers</h2>
          </div>

          <OfferFilters selectedDevices={selectedDevices} onSelectDevice={onSelectDevice} />
        </div>

        {/* RIGHT SIDE: Navigation Arrows + View All */}
        <div className="flex items-center gap-2 shrink-0 ml-auto lg:ml-0">
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
          <Link href="/offers" className="text-[11px] font-bold text-white bg-[#8B5CF6]/20 px-3.5 py-2 rounded-lg border border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/40 transition-colors whitespace-nowrap">
            View All
          </Link>
        </div>
      </div>

      {/* Offers List / Slider */}
      {isLoading ? (
        <div className="flex gap-3 overflow-hidden py-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 w-[165px] sm:w-[175px] bg-white/5 animate-pulse rounded-2xl shrink-0"></div>
          ))}
        </div>
      ) : filteredOffers.length > 0 ? (
        <div ref={sliderRef} onScroll={checkScroll} className="flex overflow-x-auto no-scrollbar gap-3 pb-3 pt-1 snap-x scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {filteredOffers.map((offer: any, index: number) => (
            <div key={offer._id || offer.id || index} className="snap-start">
              <OfferCard offer={offer} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#1A1C24] border border-white/5 rounded-2xl text-[#8F95A3] text-sm">
          No matching offers found
        </div>
      )}
    </div>
  );
}