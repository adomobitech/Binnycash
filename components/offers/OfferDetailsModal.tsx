'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PlayCircle, Star, CheckCircle2, Monitor, Smartphone, ShieldCheck, Sparkles } from "lucide-react";

const AndroidIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#A4C639]">
    <path d="M17.523 15.3414C17.523 15.3414 17.523 15.3414 17.523 15.3414C17.523 16.1432 16.8924 16.7738 16.0906 16.7738C15.2889 16.7738 14.6583 16.1432 14.6583 15.3414C14.6583 14.5397 15.2889 13.9091 16.0906 13.9091C16.8924 13.9091 17.523 14.5397 17.523 15.3414ZM9.34167 15.3414C9.34167 15.3414 9.34167 15.3414 9.34167 15.3414C9.34167 16.1432 8.71108 16.7738 7.90933 16.7738C7.10759 16.7738 6.47699 16.1432 6.47699 15.3414C6.47699 14.5397 7.10759 13.9091 7.90933 13.9091C8.71108 13.9091 9.34167 14.5397 9.34167 15.3414ZM17.9622 10.7416L19.8661 7.44426C19.9868 7.23517 19.915 6.96781 19.7059 6.84717C19.4968 6.72652 19.2295 6.79828 19.1088 7.00737L17.1706 10.3644C15.6171 9.64654 13.8631 9.24584 12.0003 9.24584C10.1374 9.24584 8.38338 9.64654 6.82998 10.3644L4.89173 7.00737C4.77109 6.79828 4.50373 6.72652 4.29464 6.84717C4.08554 6.96781 4.01379 7.23517 4.13444 7.44426L6.03831 10.7416C2.63935 12.6075 0.354181 16.166 0.0546875 20.315H23.9458C23.6463 16.166 21.3612 12.6075 17.9622 10.7416Z" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.72.845-1.391 2.275-1.222 3.637 1.35.104 2.623-.624 3.51-1.625z" />
  </svg>
);

const WindowsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#00A4EF]">
    <path d="M0 3.448l9.143-1.25v8.714H0V3.448zm10.286-1.411L24 0v10.793H10.286V2.037zM0 12.828h9.143v8.714L0 20.294V12.828zm10.286 0H24V24l-13.714-1.931v-9.241z"/>
  </svg>
);

export default function OfferDetailsModal({ offer, isOpen, onClose }: any) {
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isProcessingClick, setIsProcessingClick] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [targetDeviceName, setTargetDeviceName] = useState<string>('Android');
  const [currentOS, setCurrentOS] = useState<string>('Windows');
  const [apiError, setApiError] = useState<string | null>(null); 

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      if (ua.includes('Win')) setCurrentOS('Windows');
      else if (ua.includes('Mac')) setCurrentOS('macOS');
      else if (ua.includes('Linux')) setCurrentOS('Linux');
      else setCurrentOS('Desktop');
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setQrCodeUrl(null);
      setApiError(null);
      document.body.style.overflow = 'unset';
      return;
    }
    
    document.body.style.overflow = 'hidden';
    if (!offer) return;

    const fetchOfferDetails = async () => {
      setIsLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      const offerId = offer._id || offer.id || offer.offer_id;

      try {
        const res = await fetch(`https://apitest.binnycash.com/api/user/viewOffer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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

    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, offer]);

  const handlePlayClick = async () => {
    setIsProcessingClick(true);
    setApiError(null);
    
    // 🔥 1. DEVICE DETECTION (Synchronous to avoid popup blocks) 🔥
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(ua);
    const isMobile = isIOS || isAndroid || /Mobi|Tablet/i.test(ua);
    const isDesktop = !isMobile;

    const currentData = details || offer;
    const targetPlatforms = String(currentData?.browsers || currentData?.platform || currentData?.os || currentData?.device_type || '').toLowerCase();
    const isUniversal = targetPlatforms === 'all' || targetPlatforms === 'global' || targetPlatforms === '';
    
    const isOfferAndroid = targetPlatforms.includes('android');
    const isOfferIos = targetPlatforms.includes('ios') || targetPlatforms.includes('iphone') || targetPlatforms.includes('ipad');
    const isOfferWindows = targetPlatforms.includes('windows') || targetPlatforms.includes('desktop') || targetPlatforms.includes('pc') || targetPlatforms.includes('win');
    const isOfferMac = targetPlatforms.includes('mac') || targetPlatforms.includes('osx');

    const isStrictlyMobileOffer = (isOfferAndroid || isOfferIos) && !(isOfferWindows || isOfferMac || isUniversal);
    const isStrictlyDesktopOffer = (isOfferWindows || isOfferMac) && !(isOfferAndroid || isOfferIos || isUniversal);

    let showQR = false;
    let generateQRFor = 'Mobile Device';

    if (isDesktop && isStrictlyMobileOffer) {
      showQR = true;
      if (isOfferAndroid && !isOfferIos) generateQRFor = 'Android';
      else if (isOfferIos && !isOfferAndroid) generateQRFor = 'iOS';
      else generateQRFor = 'Android or iOS';
    } 
    else if (isMobile && isStrictlyDesktopOffer) {
      setApiError(`This offer is exclusively for ${isOfferWindows && !isOfferMac ? 'Windows' : isOfferMac && !isOfferWindows ? 'Mac' : 'Desktop'} PCs. Please complete this on your computer.`);
      setIsProcessingClick(false);
      return; 
    }

    // 🔥 2. OPEN BLANK TAB IMMEDIATELY (BYPASS POPUP BLOCKER) 🔥
    let newTab: Window | null = null;
    if (!showQR) {
      newTab = window.open('about:blank', '_blank');
    }

    try {
      const token = localStorage.getItem('token') || '';
      const targetId = offer._id || offer.id || offer.offer_id;

      const res = await fetch(`https://apitest.binnycash.com/api/user/tracking/user_click`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ offerId: targetId }) 
      });

      const responseText = await res.text();
      let finalRedirectUrl = '';
      let errorMessage = '';

      try {
        const jsonRes = JSON.parse(responseText);
        if (jsonRes.type === 'error' || jsonRes.status === 'error' || jsonRes.code !== 200) {
          errorMessage = jsonRes.message || 'Device not supported or offer unavailable.';
        }
        finalRedirectUrl = jsonRes?.url || jsonRes?.link || jsonRes?.click_url || jsonRes?.data?.url || jsonRes?.data?.link || jsonRes?.data?.click_url || '';
      } catch (e) {
        const urlMatch = responseText.match(/location\.replace\("([^"]+)"\)/i) || 
                         responseText.match(/url=([^"]+)/i) || 
                         responseText.match(/https?:\/\/[^\s"'<>]+/i);
        if (urlMatch) {
          finalRedirectUrl = urlMatch[1] || urlMatch[0];
        }
      }

      if (errorMessage && !finalRedirectUrl) {
        if (newTab) newTab.close();
        setApiError(errorMessage);
        setIsProcessingClick(false);
        return;
      }

      if (!finalRedirectUrl || finalRedirectUrl === '#') {
        finalRedirectUrl = offer?.click_url || offer?.link || offer?.url;
      }

      // 🔥 3. ACTION 🔥
      if (showQR) {
        setTargetDeviceName(generateQRFor);
        setQrCodeUrl(finalRedirectUrl);
      } else {
        if (newTab) {
          newTab.location.href = finalRedirectUrl;
        } else {
          window.open(finalRedirectUrl, '_blank');
        }
        onClose();
      }

    } catch (err) {
      console.error("Error processing click URL:", err);
      if (newTab) {
         newTab.location.href = offer?.click_url || offer?.link || offer?.url || 'https://binnycash.com';
      }
      onClose();
    } finally {
      setIsProcessingClick(false);
    }
  };

  if (!isOpen || !offer) return null;

  const currentData = details || offer;
  let rawImage = currentData?.image_url || currentData?.preview || currentData?.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop';
  if (rawImage && !rawImage.startsWith('http')) rawImage = `https://apitest.binnycash.com${rawImage}`;

  let rawNetworkLogo = currentData?.networkImage || currentData?.network_image;
  if (rawNetworkLogo && !rawNetworkLogo.startsWith('http')) rawNetworkLogo = `https://apitest.binnycash.com${rawNetworkLogo}`;

  const title = currentData?.offerName || currentData?.title || 'Offer Details';
  const rewardAmount = currentData?.userCredits ?? currentData?.reward ?? currentData?.payout ?? 0;
  const networkName = currentData?.network || currentData?.provider || 'BinnyCash';
  const category = currentData?.categories || currentData?.category || 'All';
  const requirements = currentData?.offer_requirements || currentData?.requirements || "CPA offer";
  const description = currentData?.description || "Complete the task as instructed to receive your reward.";
  const events = currentData?.offer_events || [];

  const pString = String(currentData?.browsers || category || '').toLowerCase();
  const isIos = pString.includes('ios') || pString.includes('iphone') || pString.includes('ipad');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }} 
          transition={{ duration: 0.2 }}
          className={`w-full max-w-[500px] rounded-[28px] max-h-[90vh] overflow-y-auto no-scrollbar relative border border-white/10 shadow-2xl ${qrCodeUrl ? 'bg-[#0B0D15]' : 'bg-[#111319]'}`}
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-[#8F95A3] hover:text-white transition-colors border border-white/5 cursor-pointer z-50"
          >
            <X className="w-4 h-4" />
          </button>

          {qrCodeUrl ? (
            <div className="relative p-8 pt-10 flex flex-col items-center text-center overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#8B5CF6]/20 blur-[100px] rounded-full pointer-events-none" />

              <div className="relative w-12 h-12 rounded-full border border-[#8B5CF6]/30 bg-black/40 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(139,92,246,0.3)] z-10 backdrop-blur-md">
                {targetDeviceName.toLowerCase().includes('android') ? <AndroidIcon /> : targetDeviceName.toLowerCase().includes('windows') ? <WindowsIcon /> : <AppleIcon />}
              </div>

              <h2 className="text-2xl font-black text-white mb-2 relative z-10">Open on {targetDeviceName}</h2>
              <p className="text-[#8F95A3] text-sm mb-8 relative z-10 flex items-center justify-center gap-2 max-w-[85%]">
                <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
                Scan this QR code on a supported {targetDeviceName} device to start the offer.
                <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
              </p>

              <div className="relative z-10 p-[2px] rounded-[24px] bg-gradient-to-b from-[#A855F7] to-[#8B5CF6]/10 shadow-[0_0_50px_rgba(139,92,246,0.4)] mb-8">
                <div className="bg-white p-3 rounded-[22px]">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrCodeUrl)}&margin=10`} 
                    alt="Scan to play"
                    className="w-[200px] h-[200px] object-contain rounded-xl"
                  />
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between bg-black/40 backdrop-blur-md border border-white/5 rounded-[20px] p-4 w-full max-w-[280px] mb-8 shadow-inner">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-white/40" />
                  <div className="flex flex-col items-start border-l border-white/10 pl-3">
                    <span className="text-[10px] text-white/50 uppercase tracking-wide">Current device</span>
                    <span className="text-[15px] font-bold text-white leading-tight">{currentOS}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                  {currentOS === 'Windows' ? <WindowsIcon /> : <AppleIcon />}
                </div>
              </div>

              <div className="relative z-10 w-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-2xl p-4 flex items-center gap-3 text-left">
                <ShieldCheck className="w-6 h-6 text-[#8B5CF6] shrink-0" />
                <div className="flex flex-col">
                  <span className="text-white text-sm font-bold">Secure connection</span>
                  <span className="text-[#8F95A3] text-xs">Your scan is safe and encrypted</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="sticky top-0 bg-[#111319]/95 backdrop-blur-md z-20 flex items-center p-4 border-b border-white/5">
                <h2 className="text-white font-black text-base truncate pr-10">{title}</h2>
              </div>

              {isLoading ? (
                <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
                  <div className="w-10 h-10 border-4 border-[#A855F7]/30 border-t-[#A855F7] rounded-full animate-spin mb-4"></div>
                  <p className="text-[#8F95A3] text-sm font-bold">Loading offer details...</p>
                </div>
              ) : (
                <div className="p-4 sm:p-5 flex flex-col gap-5">
                  <div className="w-full h-[180px] rounded-xl overflow-hidden relative flex items-center justify-center bg-[#1A1C24]">
                    <img src={rawImage} alt="blur-bg" className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110" />
                    <img src={rawImage} alt={title} className="w-[100px] h-[100px] rounded-2xl relative z-10 shadow-2xl object-cover" />
                    <div className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                      {isIos ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                    </div>
                  </div>

                  <div className="text-center">
                    <h1 className="text-3xl font-black text-white drop-shadow-md">$ {parseFloat(String(rewardAmount)).toFixed(2)}</h1>
                  </div>

                  <div className="grid grid-cols-4 divide-x divide-white/5 py-3 border-y border-white/5">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-white font-bold text-xs truncate max-w-[90px]">{currentData?.status || 'Active'}</span>
                      <span className="text-[#8F95A3] text-[10px] font-medium uppercase tracking-wider">Status</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                      </div>
                      <span className="text-[#8F95A3] text-[10px] font-medium uppercase tracking-wider">Popularity</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-white font-bold text-xs truncate max-w-[90px] px-1 uppercase">{category}</span>
                      <span className="text-[#8F95A3] text-[10px] font-medium uppercase tracking-wider">Category</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1">
                      {rawNetworkLogo ? (
                        <img src={rawNetworkLogo} alt={networkName} className="h-4 object-contain mb-0.5 max-w-[70px]" onError={(e: any) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'block'; }} />
                      ) : null}
                      <span className="text-white font-bold text-xs truncate max-w-[80px]" style={{ display: rawNetworkLogo ? 'none' : 'block' }}>{networkName}</span>
                      <span className="text-[#8F95A3] text-[10px] font-medium uppercase tracking-wider">Provider</span>
                    </div>
                  </div>

                  {/* 🔥 ERROR ALERT BOX 🔥 */}
                  {apiError && (
                    <div className="w-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold p-3 rounded-xl text-center animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                      {apiError}
                    </div>
                  )}

                  <button 
                    onClick={handlePlayClick} disabled={isProcessingClick}
                    className="w-full py-4 rounded-xl bg-[#A855F7] hover:bg-[#9333EA] shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isProcessingClick ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>
                      <PlayCircle className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                      <span className="text-white font-black text-base">Play & Earn ${parseFloat(String(rewardAmount)).toFixed(2)}</span>
                    </>}
                  </button>

                  <div className="bg-[#1A1C24] border border-white/5 rounded-xl p-4 flex flex-col gap-1">
                    <h3 className="text-white font-bold text-sm">Requirements</h3>
                    <p className="text-[#8F95A3] text-xs leading-relaxed">{requirements}</p>
                  </div>

                  <div className="flex flex-col gap-3 mt-1">
                    <div className="flex flex-col">
                      <h3 className="text-white font-black text-sm mb-1">Details</h3>
                      <div className="w-8 h-0.5 bg-[#A855F7] rounded-full mb-3"></div>
                      <div className="bg-[#1A1C24] border border-white/5 rounded-xl p-4 flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                          <h4 className="text-white font-bold text-sm">Description</h4>
                          <p className="text-[#8F95A3] text-xs leading-relaxed whitespace-pre-wrap">{description}</p>
                        </div>
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
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}