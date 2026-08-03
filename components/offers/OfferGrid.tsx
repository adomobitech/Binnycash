'use client';

import React from 'react';
import OfferCard from './OfferCard';
import OfferFilters from './OfferFilters';
import { filterOffersByDevice } from './OfferSlider';

interface OfferGridProps {
  offers: any[];
  isLoading: boolean;
  selectedDevices: string[]; 
  onSelectDevice: (device: string) => void;
}

export default function OfferGrid({ offers, isLoading, selectedDevices, onSelectDevice }: OfferGridProps) {
  const filtered = filterOffersByDevice(offers, selectedDevices);
  
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#14171F] p-4 rounded-2xl border border-white/5">
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <span className="text-[#8B5CF6]">🔥</span> All Offers
        </h1>
        
        {/* 🔥 MOBILE PAR HIDE, DESKTOP PAR SHOW 🔥 */}
        <div className="hidden md:block">
          <OfferFilters selectedDevices={selectedDevices} onSelectDevice={onSelectDevice} />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 min-[450px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4 lg:gap-5">
          {[...Array(14)].map((_, i) => (
            <div key={i} className="h-48 bg-[#111319] animate-pulse rounded-[16px] border border-white/5"></div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 min-[450px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4 lg:gap-5">
          {filtered.map((offer, index) => (
            <OfferCard key={offer._id || offer.id || index} offer={offer} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#1A1C24] border border-white/5 rounded-[16px] text-[#8F95A3] text-sm">
          No offers available for this filter right now.
        </div>
      )}
    </div>
  );
}