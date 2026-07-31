'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PlayCircle, Star, CheckCircle2, AlertCircle, Smartphone, ShieldCheck, Sparkles } from "lucide-react";
import SurveyModal from '@/components/surveys/SurveyModal';
import { useCurrency, formatPrice } from '@/hooks/useCurrency'; 

interface OfferCardProps {
  offer: any;
  onClick?: () => void;
  isSurveyCard?: boolean; 
}

export function getPlatformString(offer: any): string {
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

const All5DevicesIcon = () => (
  <div className="flex items-center gap-1 opacity-90 px-0.5">
    <svg className="w-2.5 h-2.5 text-[#A4C639]" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.341c.551 0 .998.447.998.998s-.447.998-.998.998-.998-.447-.998-.998.447-.998.998-.998zm-11.046 0c.551 0 .998.447.998.998s-.447.998-.998.998-.998-.447-.998-.998.447-.998.998-.998zm11.38-5.343l2.05-3.551a.498.498 0 00-.182-.682.498.498 0 00-.682.182l-2.079 3.602c-1.472-.673-3.132-1.049-4.888-1.049s-3.416.376-4.888 1.049L5.341 5.767a.498.498 0 00-.682-.182.498.498 0 00-.182.682l2.05 3.551C3.518 11.458 1.5 14.869 1.5 18.828h21c0-3.959-2.018-7.37-5.023-8.83z"/></svg>
    <svg className="w-2.5 h-2.5 text-zinc-200" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.87 6.18c.61-.75 1.02-1.8 0.91-2.85-.9 0-1.99.6-2.62 1.35-.57.67-1.07 1.74-.93 2.78 1.01.08 2.03-.53 2.64-1.28z"/></svg>
    <svg className="w-[10px] h-[10px] text-[#00A4EF]" viewBox="0 0 24 24" fill="currentColor"><path d="M0 3.448l9.143-1.25v8.714H0V3.448zm10.286-1.411L24 0v10.793H10.286V2.037zM0 12.828h9.143v8.714L0 20.294V12.828zm10.286 0H24V24l-13.714-1.931v-9.241z"/></svg>
    <svg className="w-2.5 h-2.5 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="12" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>
    <svg className="w-[9px] h-[9px] text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
  </div>
);

const AndroidIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-[#A4C639]">
    <path d="M17.523 15.341c.551 0 .998.447.998.998s-.447.998-.998.998-.998-.447-.998-.998.447-.998.998-.998zm-11.046 0c.551 0 .998.447.998.998s-.447.998-.998.998-.998-.447-.998-.998.447-.998.998-.998zm11.38-5.343l2.05-3.551a.498.498 0 00-.182-.682.498.498 0 00-.682.182l-2.079 3.602c-1.472-.673-3.132-1.049-4.888-1.049s-3.416.376-4.888 1.049L5.341 5.767a.498.498 0 00-.682-.182.498.498 0 00-.182.682l2.05 3.551C3.518 11.458 1.5 14.869 1.5 18.828h21c0-3.959-2.018-7.37-5.023-8.83z"/></svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-white">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.72.845-1.391 2.275-1.222 3.637 1.35.104 2.623-.624 3.51-1.625z" /></svg>
);

const WindowsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#00A4EF]">
    <path d="M0 3.448l9.143-1.25v8.714H0V3.448zm10.286-1.411L24 0v10.793H10.286V2.037zM0 12.828h9.143v8.714L0 20.294V12.828zm10.286 0H24V24l-13.714-1.931v-9.241z"/></svg>
);

function getUserId(): string {
  if (typeof window === 'undefined') return '';
  const isNumeric = (v: any) => v !== null && v !== undefined && /^\d+$/.test(String(v));
  try {
    const keys = ['loginResponse', 'authResponse', 'loginData', 'userDetails', 'user', 'userData', 'profile', 'authUser', 'userId', 'user_id', 'uid', 'sid'];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      if (isNumeric(raw)) return String(raw);
      try {
        const parsed = JSON.parse(raw);
        const id = parsed?.data?.userDetails?.id ?? parsed?.userDetails?.id ?? parsed?.id ?? parsed?._id ?? parsed?.userId ?? parsed?.user_id;
        if (isNumeric(id)) return String(id);
      } catch {}
    }
  } catch (err) {}
  return '';
}

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

  if (isAndroid) return <AndroidIcon />;
  if (isWindows) return <WindowsIcon />;
  if (isMac) return <svg className="w-[14px] h-[14px] text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="12" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>;
  if (isIpad) return <svg className="w-[14px] h-[14px] text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>;
  if (isIos) return <AppleIcon />;

  return <All5DevicesIcon />;
};

function OfferDetailsModal({ offer, isOpen, onClose }: any) {
  // Same logic as before... keeping modal intact
  const currency = useCurrency();
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
      const isIOSUA = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (/Android/i.test(ua)) setCurrentOS('Android');
      else if (isIOSUA) setCurrentOS('iOS');
      else if (ua.includes('Win')) setCurrentOS('Windows');
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
    else if (isAndroid && isOfferIos && !isOfferAndroid && !isUniversal) {
      setApiError('This offer is exclusively for iOS devices. Please open it on an iPhone/iPad.');
      setIsProcessingClick(false);
      return;
    }
    else if (isIOS && isOfferAndroid && !isOfferIos && !isUniversal) {
      setApiError('This offer is exclusively for Android devices. Please open it on an Android device.');
      setIsProcessingClick(false);
      return;
    }

    const targetId = offer.id ?? offer._id ?? offer.offer_id;
    const userId = getUserId();

    if (!userId) {
      setApiError('Could not identify your account. Please log in again and retry.');
      setIsProcessingClick(false);
      return;
    }

    if (showQR) {
      const trackingUrl = `https://apitest.binnycash.com/api/user/tracking/user_click?sid=${encodeURIComponent(userId)}&o=${encodeURIComponent(targetId)}`;
      setTargetDeviceName(generateQRFor);
      setQrCodeUrl(trackingUrl);
      setIsProcessingClick(false);
      return;
    }

    const newTab: Window | null = window.open('about:blank', '_blank');

    try {
      const token = localStorage.getItem('token') || '';

      const res = await fetch(
        `https://apitest.binnycash.com/api/user/tracking/user_click?sid=${encodeURIComponent(userId)}&o=${encodeURIComponent(targetId)}`,
        {
          method: 'GET',
          headers: { 'Accept': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
        }
      );

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

      if (newTab) {
        newTab.location.href = finalRedirectUrl;
      } else {
        window.open(finalRedirectUrl, '_blank');
      }
      onClose();

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
  const formattedReward = formatPrice(rewardAmount, currency);

  const networkName = currentData?.network || currentData?.provider || 'BinnyCash';
  const category = currentData?.categories || currentData?.category || 'All';
  const requirements = currentData?.offer_requirements || currentData?.requirements || "CPA offer";
  const description = currentData?.description || "Complete the task as instructed to receive your reward.";
  const events = currentData?.offer_events || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }} 
          transition={{ duration: 0.2 }}
          className={`w-full max-w-[500px] rounded-[28px] max-h-[90vh] overflow-y-auto no-scrollbar relative border border-white/10 shadow-2xl ${qrCodeUrl ? 'bg-[#0B0D15]' : 'bg-[#111319]'}`}
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/80 text-white transition-all border border-white/10 cursor-pointer z-[10000]"
          >
            <X className="w-5 h-5" />
          </button>

          {qrCodeUrl ? (
            <div className="relative p-8 pt-10 flex flex-col items-center text-center overflow-hidden h-full">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#8B5CF6]/20 blur-[100px] rounded-full pointer-events-none" />

              <div className="relative w-14 h-14 rounded-full border border-[#8B5CF6]/30 bg-black/40 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(139,92,246,0.3)] z-10 backdrop-blur-md">
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
                  {currentOS === 'Windows' ? <WindowsIcon /> : currentOS === 'Android' ? <AndroidIcon /> : <AppleIcon />}
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
                      <DeviceIcon offer={currentData} />
                    </div>
                  </div>

                  <div className="text-center">
                    <h1 className="text-3xl font-black text-white drop-shadow-md">{formattedReward}</h1>
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
                      <span className="text-white font-black text-base">Play & Earn {formattedReward}</span>
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
                                  <span className="text-emerald-400 font-black text-xs">+{formatPrice(ev.event_payout || 0, currency)}</span>
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

// ----------------------------------------------------
// 櫨 MAIN EXPORTED COMPONENT (OFFER CARD) 櫨
// ----------------------------------------------------
export default function OfferCard({ offer, onClick, isSurveyCard = false }: OfferCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currency = useCurrency();

  if (!offer) return null;

  const title = offer.offerName || offer.title || offer.name || offer.offer_name || 'Offer Item';
  const sub = offer.categories || offer.sub || offer.category || 'All';
  const rewardVal = offer.userCredits ?? offer.reward ?? offer.payout ?? 0;
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
        // 🔥 Reduced width (w-[140px] sm:w-[150px]) and height to make it more compact
        className="bg-[#1A1C24] border border-white/5 rounded-2xl overflow-hidden flex flex-col hover:border-[#8B5CF6]/50 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300 cursor-pointer shrink-0 w-[140px] sm:w-[150px] h-full"
      >
        {/* 🔥 Reduced image height (h-24) */}
        <div className="h-24 w-full bg-white/5 relative overflow-hidden">
          <img src={rawImage} alt={title} className="w-full h-full object-cover" />
        </div>
        
        {/* 🔥 Reduced padding and gap */}
        <div className="p-2.5 flex flex-col justify-between flex-1 gap-1.5">
          <div>
            <h3 className="text-[11px] sm:text-xs font-bold text-white truncate">{title}</h3>
            <p className="text-[9px] sm:text-[10px] text-[#8F95A3] truncate mt-0.5">{sub}</p>
          </div>
          <div className="flex justify-between items-center pt-1.5 border-t border-white/5 mt-1">
            <span className="text-xs sm:text-[13px] font-black text-[#8B5CF6]">{formattedReward}</span>
            <div className="p-1 rounded-md bg-white/5 flex items-center justify-center min-w-[20px] min-h-[20px]">
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