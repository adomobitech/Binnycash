'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import OfferCard from '@/components/offers/OfferCard';
import OfferFilters from '@/components/offers/OfferFilters'; // Import ekdum fix

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
  
  // Arrows hide/show ke states
  const [showArrows, setShowArrows] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const filteredOffers = filterOffersByDevice(offers, selectedDevices);

  // Scroll boundaries check karne ka tera wahi logic
  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setShowArrows(scrollWidth > clientWidth);
      setCanScrollLeft(scrollLeft > 5); // Start pe left arrow hide
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5); // End pe right arrow hide
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
    <div className="w-full flex flex-col gap-4">
      {/* Section Header & Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#14171F] p-4 rounded-2xl border border-white/5">
        
        {/* Left Side: Title & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xl">🔥</span>
            <h2 className="text-lg font-black text-white">Featured Offers</h2>
          </div>
          
          <div className="overflow-x-auto w-full sm:w-auto no-scrollbar">
            <OfferFilters selectedDevices={selectedDevices} onSelectDevice={onSelectDevice} />
          </div>
        </div>

        {/* Right Controls: View All & Dynamic Scroll Arrows */}
        <div className="flex items-center gap-3 shrink-0 self-end lg:self-auto">
          <Link 
            href="/offers"
            className="text-sm font-semibold text-[#8F95A3] hover:text-white bg-[#1A1C24] px-4 py-2.5 rounded-xl border border-white/5 hover:border-[#8B5CF6]/40 transition-colors shadow-sm flex items-center"
          >
            View All
          </Link>
          
          {showArrows && (
            <div className="flex items-center gap-2">
              {canScrollLeft && (
                <button 
                  onClick={() => scroll('left')}
                  className="w-10 h-10 rounded-xl bg-[#1A1C24] border border-white/5 flex items-center justify-center text-[#8F95A3] hover:text-white hover:bg-[#232630] hover:border-[#8B5CF6]/40 transition-all cursor-pointer shadow-sm"
                  aria-label="Scroll left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </button>
              )}
              {canScrollRight && (
                <button 
                  onClick={() => scroll('right')}
                  className="w-10 h-10 rounded-xl bg-[#1A1C24] border border-white/5 flex items-center justify-center text-[#8F95A3] hover:text-white hover:bg-[#232630] hover:border-[#8B5CF6]/40 transition-all cursor-pointer shadow-sm"
                  aria-label="Scroll right"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Offers Slider / Grid Container */}
      {isLoading ? (
        <div className="flex gap-4 overflow-hidden py-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 w-[175px] bg-white/5 animate-pulse rounded-2xl shrink-0"></div>
          ))}
        </div>
      ) : filteredOffers.length > 0 ? (
        <div 
          ref={sliderRef}
          onScroll={checkScroll} // YAHAN TERA HIDING LOGIC WAPAS LAG GAYA H
          className="flex overflow-x-auto no-scrollbar gap-4 pb-4 pt-1 snap-x scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
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