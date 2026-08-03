'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import OfferCard from '@/components/offers/OfferCard';
import OfferFilters from '@/components/offers/OfferFilters'; 
import { Sparkles, ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";

export function filterOffersByDevice(offers: any[], selectedDevices: string[]) {
  if (!selectedDevices || selectedDevices.length === 0 || selectedDevices.includes('all')) return offers;

  return offers.filter((offer) => {
    const browsers = String(offer?.browsers || offer?.platform || offer?.os || offer?.device_type || '').toLowerCase();
    if (browsers === 'all' || browsers === 'global' || browsers === '') return false; 
    
    return selectedDevices.some((device) => {
      if (device === 'android') return browsers.includes('android');
      if (device === 'ios') return browsers.includes('ios') || browsers.includes('iphone');
      if (device === 'windows') return browsers.includes('windows') || browsers.includes('win') || browsers.includes('pc') || browsers.includes('desktop');
      if (device === 'mac') return browsers.includes('mac') || browsers.includes('osx');
      if (device === 'ipad') return browsers.includes('ipad');
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
  
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const filteredOffers = filterOffersByDevice(offers, selectedDevices);

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
  }, [filteredOffers]);

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

  const handleDeviceSelect = (dev: string) => {
    if (dev === 'all') {
      onSelectDevice(''); 
    } else {
      onSelectDevice(dev);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 mt-6">
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-4">
        
        <div className="flex flex-col shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
            <h2 className="text-xl font-black text-white tracking-widest uppercase">OFFERS</h2>
          </div>
          <p className="text-[#8F95A3] text-xs font-medium">Complete offers and earn exciting rewards.</p>
        </div>

        <div className="flex-1 flex lg:justify-center">
          <OfferFilters selectedDevices={selectedDevices} onSelectDevice={handleDeviceSelect} />
        </div>

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
          <Link href="/offers" className="flex items-center gap-1.5 text-sm text-[#8B5CF6] font-bold hover:text-[#A855F7] transition-colors cursor-pointer pl-2 border-l border-white/10">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      <div className="relative group">
        {isLoading ? (
          <div className="flex gap-3 sm:gap-4 overflow-hidden py-1">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-[210px] w-[145px] sm:w-[165px] lg:w-[175px] bg-[#161821] animate-pulse rounded-[16px] shrink-0 border border-white/5"></div>
            ))}
          </div>
        ) : filteredOffers.length > 0 ? (
          <div 
            ref={sliderRef} 
            onScroll={checkScroll} 
            className="flex overflow-x-auto no-scrollbar gap-3 sm:gap-4 pb-2 snap-x scroll-smooth" 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredOffers.map((offer: any, index: number) => (
              <div key={offer._id || offer.id || index} className="snap-start shrink-0 w-[145px] sm:w-[165px] lg:w-[175px]">
                <OfferCard offer={offer} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#120F1A] border border-white/5 rounded-2xl text-[#8F95A3] text-sm">
            No matching offers found for this category.
          </div>
        )}
      </div>
    </div>
  );
}