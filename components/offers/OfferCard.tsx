'use client';

import React, { useState } from 'react';
import OfferDetailsModal from '@/components/offers/OfferDetailsModal';
import SurveyModal from '@/components/surveys/SurveyModal';
import { useCurrency, formatPrice } from '@/hooks/useCurrency'; 

interface OfferCardProps {
  offer: any;
  onClick?: () => void;
  isSurveyCard?: boolean; 
}

export function getPlatformString(offer: any): string {
  // 🔥 HOOK REMOVED FROM HERE (React rules)
  return [
    offer?.browsers,
    offer?.platform,
    offer?.device,
    offer?.device_type,
    offer?.os,
    offer?.os_type,
    offer?.categories,
    offer?.category,
    offer?.sub
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

// 5-devices (Pacho) ka combined icon component (Sirf All ke liye)
const All5DevicesIcon = () => (
  <div className="flex items-center gap-1 opacity-90 px-0.5">
    <svg className="w-3 h-3 text-[#A4C639]" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.341c.551 0 .998.447.998.998s-.447.998-.998.998-.998-.447-.998-.998.447-.998.998-.998zm-11.046 0c.551 0 .998.447.998.998s-.447.998-.998.998-.998-.447-.998-.998.447-.998.998-.998zm11.38-5.343l2.05-3.551a.498.498 0 00-.182-.682.498.498 0 00-.682.182l-2.079 3.602c-1.472-.673-3.132-1.049-4.888-1.049s-3.416.376-4.888 1.049L5.341 5.767a.498.498 0 00-.682-.182.498.498 0 00-.182.682l2.05 3.551C3.518 11.458 1.5 14.869 1.5 18.828h21c0-3.959-2.018-7.37-5.023-8.83z"/></svg>
    <svg className="w-3 h-3 text-zinc-200" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.87 6.18c.61-.75 1.02-1.8 0.91-2.85-.9 0-1.99.6-2.62 1.35-.57.67-1.07 1.74-.93 2.78 1.01.08 2.03-.53 2.64-1.28z"/></svg>
    <svg className="w-[11px] h-[11px] text-[#00A4EF]" viewBox="0 0 24 24" fill="currentColor"><path d="M0 3.448l9.143-1.25v8.714H0V3.448zm10.286-1.411L24 0v10.793H10.286V2.037zM0 12.828h9.143v8.714L0 20.294V12.828zm10.286 0H24V24l-13.714-1.931v-9.241z"/></svg>
    <svg className="w-3 h-3 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="12" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>
    <svg className="w-[10px] h-[10px] text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
  </div>
);

export const DeviceIcon = ({ offer }: { offer: any }) => {
  const rawBrowsers = String(offer?.browsers || offer?.platform || offer?.os || offer?.device_type || '').toLowerCase();

  if (rawBrowsers === 'all' || rawBrowsers === 'global' || rawBrowsers === '') {
    return <All5DevicesIcon />;
  }

  const isAndroid = rawBrowsers.includes('android');
  const isWindows = rawBrowsers.includes('windows') || rawBrowsers.includes('win') || rawBrowsers.includes('pc') || rawBrowsers.includes('desktop');
  const isMac = rawBrowsers.includes('mac') || rawBrowsers.includes('osx');
  const isIpad = rawBrowsers.includes('ipad');
  const isIos = rawBrowsers.includes('ios') || rawBrowsers.includes('iphone');

  if (isAndroid) {
    return (
      <svg className="w-3.5 h-3.5 text-[#A4C639]" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.341c.551 0 .998.447.998.998s-.447.998-.998.998-.998-.447-.998-.998.447-.998.998-.998zm-11.046 0c.551 0 .998.447.998.998s-.447.998-.998.998-.998-.447-.998-.998.447-.998.998-.998zm11.38-5.343l2.05-3.551a.498.498 0 00-.182-.682.498.498 0 00-.682.182l-2.079 3.602c-1.472-.673-3.132-1.049-4.888-1.049s-3.416.376-4.888 1.049L5.341 5.767a.498.498 0 00-.682-.182.498.498 0 00-.182.682l2.05 3.551C3.518 11.458 1.5 14.869 1.5 18.828h21c0-3.959-2.018-7.37-5.023-8.83z"/></svg>
    );
  }
  
  if (isWindows) {
    return (
      <svg className="w-3.5 h-3.5 text-[#00A4EF]" viewBox="0 0 24 24" fill="currentColor"><path d="M0 3.448l9.143-1.25v8.714H0V3.448zm10.286-1.411L24 0v10.793H10.286V2.037zM0 12.828h9.143v8.714L0 20.294V12.828zm10.286 0H24V24l-13.714-1.931v-9.241z"/></svg>
    );
  }

  if (isMac) {
    return (
      <svg className="w-3.5 h-3.5 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="12" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>
    );
  }

  if (isIpad) {
    return (
      <svg className="w-3.5 h-3.5 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
    );
  }

  if (isIos) {
    return (
      <svg className="w-3.5 h-3.5 text-zinc-300" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.87 6.18c.61-.75 1.02-1.8 0.91-2.85-.9 0-1.99.6-2.62 1.35-.57.67-1.07 1.74-.93 2.78 1.01.08 2.03-.53 2.64-1.28z"/></svg>
    );
  }

  return <All5DevicesIcon />;
};

export default function OfferCard({ offer, onClick, isSurveyCard = false }: OfferCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 🔥 CORRECT PLACEMENT: Hook hamesha component body me hota hai
  const currency = useCurrency();

  if (!offer) return null;

  const title = offer.offerName || offer.title || offer.name || offer.offer_name || 'Offer Item';
  const sub = offer.categories || offer.sub || offer.category || 'All';
  const rewardVal = offer.userCredits ?? offer.reward ?? offer.payout ?? 0;
  
  // 🔥 DYNAMIC REWARD FORMATTING
  const formattedReward = formatPrice(rewardVal, currency);
  
  let rawImage = offer.image_url || offer.preview || offer.image || offer.img || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop';
  
  if (rawImage && !rawImage.startsWith('http')) {
    rawImage = `https://apitest.binnycash.com${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
  }

  const handleCardClick = () => {
    if (onClick) onClick();
    setIsModalOpen(true);
  };

  const isStrictlySurvey = isSurveyCard || offer?.offer_type === 'survey';

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
            {/* 🔥 PRICING RENDERED HERE */}
            <span className="text-[13px] font-black text-[#8B5CF6]">{formattedReward}</span>
            <div className="p-1 rounded-md bg-white/5 flex items-center justify-center min-w-[24px] min-h-[24px]">
              <DeviceIcon offer={offer} />
            </div>
          </div>
        </div>
      </div>

      {isStrictlySurvey ? (
        <SurveyModal survey={offer} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      ) : (
        <OfferDetailsModal offer={offer} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
} 