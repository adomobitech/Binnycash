'use client';

import React, { useState } from 'react';
import OfferDetailsModal from '@/components/offers/OfferDetailsModal';

interface OfferCardProps {
  offer: any;
  onClick?: () => void;
}

export function getPlatformString(offer: any): string {
  return [
    offer?.browsers,
    offer?.platform,
    offer?.device,
    offer?.device_type,
    offer?.os,
    offer?.os_type,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export const DeviceIcon = ({ offer }: { offer: any }) => {
  const p = getPlatformString(offer);

  if (p.includes('ios') || p.includes('iphone') || p.includes('ipad')) {
    return (
      <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.87 6.18c.61-.75 1.02-1.8 0.91-2.85-.9 0-1.99.6-2.62 1.35-.57.67-1.07 1.74-.93 2.78 1.01.08 2.03-.53 2.64-1.28z"/>
      </svg>
    );
  }
  if (p.includes('android')) {
    return (
      <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.523 15.341c.551 0 .998.447.998.998s-.447.998-.998.998-.998-.447-.998-.998.447-.998.998-.998zm-11.046 0c.551 0 .998.447.998.998s-.447.998-.998.998-.998-.447-.998-.998.447-.998.998-.998zm11.38-5.343l2.05-3.551a.498.498 0 00-.182-.682.498.498 0 00-.682.182l-2.079 3.602c-1.472-.673-3.132-1.049-4.888-1.049s-3.416.376-4.888 1.049L5.341 5.767a.498.498 0 00-.682-.182.498.498 0 00-.182.682l2.05 3.551C3.518 11.458 1.5 14.869 1.5 18.828h21c0-3.959-2.018-7.37-5.023-8.83z"/>
      </svg>
    );
  }
  if (p.includes('windows') || p.includes('win')) {
    return (
      <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 3.448l9.143-1.25v8.714H0V3.448zm10.286-1.411L24 0v10.793H10.286V2.037zM0 12.828h9.143v8.714L0 20.294V12.828zm10.286 0H24V24l-13.714-1.931v-9.241z"/>
      </svg>
    );
  }
  if (p.includes('mac') || p.includes('macos') || p.includes('osx')) {
    return (
      <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 18.69h-1.38c-.46 0-.89-.18-1.21-.5l-3.21-3.21c-.71-.71-1.86-.71-2.57 0l-3.21 3.21c-.32.32-.75.5-1.21.5H7.01C5.9 18.69 5 17.79 5 16.68V7.01C5 5.9 5.9 5 7.01 5h12.98c1.11 0 2.01.9 2.01 2.01v9.67c0 1.11-.9 2.01-2.01 2.01zM7 7v9.68c0 .05.04.09.09.09h1.38c.23 0 .44-.09.6-.25l3.21-3.21c1.1-1.1 2.89-1.1 3.99 0l3.21 3.21c.16.16.37.25.6.25H21c.05 0 .09-.04.09-.09V7c0-.05-.04-.09-.09-.09H7.09c-.05 0-.09.04-.09.09z"/>
      </svg>
    );
  }

  // Default Globe for Web / All
  return (
    <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
};

export default function OfferCard({ offer, onClick }: OfferCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!offer) return null;

  const title = offer.offerName || offer.title || offer.name || 'Offer Item';
  const sub = offer.categories || offer.sub || offer.category || 'All';
  const rewardVal = offer.userCredits ?? offer.reward ?? offer.payout ?? 0;
  const reward = `$ ${Number(rewardVal).toFixed(2)}`;
  
  // Robust image extraction
  let rawImage = offer.image_url || offer.preview || offer.image || offer.img || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop';
  
  // Fix relative image paths if backend sends them without domain
  if (rawImage && !rawImage.startsWith('http')) {
    rawImage = `https://apitest.binnycash.com${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
  }

  const handleCardClick = () => {
    if (onClick) onClick();
    setIsModalOpen(true);
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="bg-[#1A1C24] border border-white/5 rounded-2xl overflow-hidden flex flex-col hover:border-[#8B5CF6]/50 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300 cursor-pointer shrink-0 w-[165px] sm:w-[175px]"
      >
        <div className="h-28 w-full bg-white/5 relative overflow-hidden">
          <img src={rawImage} alt={title} className="w-full h-full object-cover" />
        </div>
        <div className="p-3 flex flex-col justify-between flex-1 gap-2">
          <div>
            <h3 className="text-xs font-bold text-white truncate">{title}</h3>
            <p className="text-[10px] text-[#8F95A3] truncate mt-0.5">{sub}</p>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-white/5">
            <span className="text-[13px] font-black text-[#8B5CF6]">{reward}</span>
            <div className="p-1 rounded-md bg-white/5 flex items-center justify-center">
              <DeviceIcon offer={offer} />
            </div>
          </div>
        </div>
      </div>

      <OfferDetailsModal 
        offer={offer} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}