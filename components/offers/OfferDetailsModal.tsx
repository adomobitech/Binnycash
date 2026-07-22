'use client';

import React, { useState, useEffect } from 'react';
import { X, PlayCircle, Star, CheckCircle2, Monitor, Smartphone } from "lucide-react";

export default function OfferDetailsModal({ offer, isOpen, onClose }: any) {
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !offer) return;
    
    document.body.style.overflow = 'hidden';

    const fetchOfferDetails = async () => {
      setIsLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      const offerId = offer._id || offer.id || offer.offer_id;

      try {
        const res = await fetch(`https://apitest.binnycash.com/api/user/viewOffer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'token': token || ''
          },
          body: JSON.stringify({ offer_id: offerId })
        });
        
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const jsonRes = await res.json();
          setDetails(jsonRes?.data || jsonRes);
        } else {
          setDetails(offer);
        }
      } catch (err) {
        console.error("Error fetching offer details:", err);
        setDetails(offer);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOfferDetails();

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, offer]);

  if (!isOpen || !offer) return null;

  const currentData = details || offer;

  // Main Banner Image Resolution
  let rawImage = currentData?.image_url || currentData?.preview || currentData?.image || currentData?.img || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop';
  if (rawImage && !rawImage.startsWith('http')) {
    rawImage = `https://apitest.binnycash.com${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
  }

  // 🔥 Network/Provider Logo Resolution & Fallback Fix
  let rawNetworkLogo = currentData?.networkImage || currentData?.network_image;
  if (rawNetworkLogo && !rawNetworkLogo.startsWith('http')) {
    rawNetworkLogo = `https://apitest.binnycash.com${rawNetworkLogo.startsWith('/') ? '' : '/'}${rawNetworkLogo}`;
  }

  const title = currentData?.offerName || currentData?.title || currentData?.name || 'Offer Details';
  const rewardAmount = currentData?.userCredits ?? currentData?.reward ?? currentData?.payout ?? 0;
  const networkName = currentData?.network || currentData?.provider || 'BinnyCash';
  const category = currentData?.categories || currentData?.category || 'All';
  const description = currentData?.description || "Complete the task as instructed to receive your reward.";
  const requirements = currentData?.offer_requirements || currentData?.requirements || "CPA offer";
  const actionLink = currentData?.link || '#';
  const events = currentData?.offer_events || [];

  const pString = String(currentData?.browsers || category || '').toLowerCase();
  const isAndroid = pString.includes('android');
  const isIos = pString.includes('ios') || pString.includes('iphone') || pString.includes('ipad');

  const handlePlayClick = () => {
    if (actionLink && actionLink !== '#') {
      window.open(actionLink, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111319] w-full max-w-[500px] rounded-2xl max-h-[90vh] overflow-y-auto no-scrollbar relative border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#111319]/95 backdrop-blur-md z-20 flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-white font-black text-base truncate pr-4">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8F95A3] hover:text-white transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-10 h-10 border-4 border-[#A855F7]/30 border-t-[#A855F7] rounded-full animate-spin mb-4"></div>
            <p className="text-[#8F95A3] text-sm font-bold">Loading offer details...</p>
          </div>
        ) : (
          <div className="p-4 sm:p-5 flex flex-col gap-5">
            
            {/* Banner Section */}
            <div className="w-full h-[180px] rounded-xl overflow-hidden relative flex items-center justify-center bg-[#1A1C24]">
              <img src={rawImage} alt="blur-bg" className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110" />
              <img src={rawImage} alt={title} className="w-[100px] h-[100px] rounded-2xl relative z-10 shadow-2xl object-cover" />
              
              <div className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                {isIos ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
              </div>
            </div>

            {/* Price */}
            <div className="text-center">
              <h1 className="text-3xl font-black text-white drop-shadow-md">$ {parseFloat(String(rewardAmount)).toFixed(2)}</h1>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 divide-x divide-white/5 py-3 border-y border-white/5">
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-white font-bold text-xs truncate max-w-[90px]">
                  {currentData?.status || 'Not Started'}
                </span>
                <span className="text-[#8F95A3] text-[10px] font-medium uppercase tracking-wider">Status</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <Star className="w-3 h-3 text-white/20 fill-white/20" />
                  <Star className="w-3 h-3 text-white/20 fill-white/20" />
                  <Star className="w-3 h-3 text-white/20 fill-white/20" />
                  <Star className="w-3 h-3 text-white/20 fill-white/20" />
                </div>
                <span className="text-[#8F95A3] text-[10px] font-medium uppercase tracking-wider">Popularity</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-white font-bold text-xs truncate max-w-[90px] px-1 uppercase">{category}</span>
                <span className="text-[#8F95A3] text-[10px] font-medium uppercase tracking-wider">Category</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1">
                {rawNetworkLogo ? (
                  <img 
                    src={rawNetworkLogo} 
                    alt={networkName} 
                    className="h-4 object-contain mb-0.5 max-w-[70px]" 
                    onError={(e: any) => {
                      // Fallback to text if network image fails to load
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <span className="text-white font-bold text-xs truncate max-w-[80px]" style={{ display: rawNetworkLogo ? 'none' : 'block' }}>
                  {networkName}
                </span>
                <span className="text-[#8F95A3] text-[10px] font-medium uppercase tracking-wider">Provider</span>
              </div>
            </div>

            {/* CTA Button */}
            <button 
              onClick={handlePlayClick}
              className="w-full py-4 rounded-xl bg-[#A855F7] hover:bg-[#9333EA] shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <PlayCircle className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              <span className="text-white font-black text-base">Play & Earn ${parseFloat(String(rewardAmount)).toFixed(2)}</span>
            </button>

            {/* Requirements Box */}
            <div className="bg-[#1A1C24] border border-white/5 rounded-xl p-4 flex flex-col gap-1">
              <h3 className="text-white font-bold text-sm">Requirements</h3>
              <p className="text-[#8F95A3] text-xs leading-relaxed">
                {requirements}
              </p>
            </div>

            {/* Description & Dynamic Events Section */}
            <div className="flex flex-col gap-3 mt-1">
              <div className="flex flex-col">
                <h3 className="text-white font-black text-sm mb-1">Details</h3>
                <div className="w-8 h-0.5 bg-[#A855F7] rounded-full mb-3"></div>
                <div className="bg-[#1A1C24] border border-white/5 rounded-xl p-4 flex flex-col gap-4">
                  
                  <div className="flex flex-col gap-1">
                    <h4 className="text-white font-bold text-sm">Description</h4>
                    <p className="text-[#8F95A3] text-xs leading-relaxed whitespace-pre-wrap">
                      {description}
                    </p>
                  </div>

                  {/* Render Offer Events dynamically if available */}
                  {events.length > 0 && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                      <h4 className="text-white font-bold text-xs uppercase tracking-wider text-[#A855F7]">Milestone Events</h4>
                      <div className="flex flex-col gap-2">
                        {events.map((ev: any, idx: number) => (
                          <div key={ev._id || idx} className="flex items-center justify-between bg-white/5 p-2.5 rounded-lg border border-white/5">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span className="text-white text-xs font-medium">{ev.event_name}</span>
                            </div>
                            <span className="text-emerald-400 font-black text-xs">+${parseFloat(String(ev.event_payout || 0)).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#A855F7]/10 flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4 text-[#A855F7]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-sm">New Users Only</span>
                      <span className="text-[#8F95A3] text-xs">This offer is valid only for users who have not installed the app before.</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}