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
        <OfferFilters selectedDevices={selectedDevices} onSelectDevice={onSelectDevice} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div key={i} className="h-44 bg-white/5 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {filtered.map((offer, index) => (
            <OfferCard key={offer._id || offer.id || index} offer={offer} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#1A1C24] border border-white/5 rounded-2xl text-[#8F95A3] text-sm">
          No offers available for this filter right now.
        </div>
      )}
    </div>
  );
}