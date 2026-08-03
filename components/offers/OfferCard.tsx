'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Star, CheckCircle2, AlertCircle, Smartphone, ShieldCheck, Sparkles } from "lucide-react";
import SurveyModal from '@/components/surveys/SurveyModal';
import { useCurrency, formatPrice } from '@/hooks/useCurrency'; 

interface OfferCardProps {
  offer: any;
  onClick?: () => void;
  isSurveyCard?: boolean; 
}

const All5DevicesIcon = () => (
  <div className="flex items-center gap-1 opacity-90 px-0.5">
    <svg className="w-2.5 h-2.5 text-[#A4C639]" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.341c.551 0 .998.447.998.998s-.447.998-.998.998-.998-.447-.998-.998.447-.998.998-.998zm-11.046 0c.551 0 .998.447.998.998s-.447.998-.998.998-.998-.447-.998-.998.447-.998.998-.998zm11.38-5.343l2.05-3.551a.498.498 0 00-.182-.682.498.498 0 00-.682.182l-2.079 3.602c-1.472-.673-3.132-1.049-4.888-1.049s-3.416.376-4.888 1.049L5.341 5.767a.498.498 0 00-.682-.182.498.498 0 00-.182.682l2.05 3.551C3.518 11.458 1.5 14.869 1.5 18.828h21c0-3.959-2.018-7.37-5.023-8.83z"/></svg>
    <svg className="w-2.5 h-2.5 text-zinc-200" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.87 6.18c.61-.75 1.02-1.8 0.91-2.85-.9 0-1.99.6-2.62 1.35-.57.67-1.07 1.74-.93 2.78 1.01.08 2.03-.53 2.64-1.28z"/></svg>
    <svg className="w-[10px] h-[10px] text-[#00A4EF]" viewBox="0 0 24 24" fill="currentColor"><path d="M0 3.448l9.143-1.25v8.714H0V3.448zm10.286-1.411L24 0v10.793H10.286V2.037zM0 12.828h9.143v8.714L0 20.294V12.828zm10.286 0H24V24l-13.714-1.931v-9.241z"/></svg>
    <svg className="w-2.5 h-2.5 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="12" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>
  </div>
);

const AndroidIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[13px] h-[13px] fill-[#A4C639]"><path d="M17.523 15.341c.551 0 .998.447.998.998s-.447.998-.998.998-.998-.447-.998-.998.447-.998.998-.998zm-11.046 0c.551 0 .998.447.998.998s-.447.998-.998.998-.998-.447-.998-.998.447-.998.998-.998zm11.38-5.343l2.05-3.551a.498.498 0 00-.182-.682.498.498 0 00-.682.182l-2.079 3.602c-1.472-.673-3.132-1.049-4.888-1.049s-3.416.376-4.888 1.049L5.341 5.767a.498.498 0 00-.682-.182.498.498 0 00-.182.682l2.05 3.551C3.518 11.458 1.5 14.869 1.5 18.828h21c0-3.959-2.018-7.37-5.023-8.83z"/></svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[13px] h-[13px] fill-white"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.72.845-1.391 2.275-1.222 3.637 1.35.104 2.623-.624 3.51-1.625z" /></svg>
);

const WindowsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[13px] h-[13px] fill-[#00A4EF]"><path d="M0 3.448l9.143-1.25v8.714H0V3.448zm10.286-1.411L24 0v10.793H10.286V2.037zM0 12.828h9.143v8.714L0 20.294V12.828zm10.286 0H24V24l-13.714-1.931v-9.241z"/></svg>
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
  if (rawBrowsers === 'all' || rawBrowsers === 'global' || rawBrowsers === '') return <All5DevicesIcon />;
  const isAndroid = rawBrowsers.includes('android');
  const isWindows = rawBrowsers.includes('windows') || rawBrowsers.includes('win') || rawBrowsers.includes('pc') || rawBrowsers.includes('desktop');
  const isMac = rawBrowsers.includes('mac') || rawBrowsers.includes('osx');
  const isIpad = rawBrowsers.includes('ipad');
  const isIos = rawBrowsers.includes('ios') || rawBrowsers.includes('iphone');

  if (isAndroid) return <AndroidIcon />;
  if (isWindows) return <WindowsIcon />;
  if (isMac) return <svg className="w-[13px] h-[13px] text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="12" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>;
  if (isIpad) return <svg className="w-[13px] h-[13px] text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>;
  if (isIos) return <AppleIcon />;
  return <All5DevicesIcon />;
};

function OfferDetailsModal({ offer, isOpen, onClose }: any) {
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

  const title = currentData?.offerName || currentData?.title || 'Offer Details';
  const networkName = currentData?.network || currentData?.provider || 'App';
  const category = currentData?.categories || currentData?.category || 'App';
  const rewardAmount = currentData?.userCredits ?? currentData?.reward ?? currentData?.payout ?? 0;
  const formattedReward = formatPrice(rewardAmount, currency);
  const requirements = currentData?.offer_requirements || currentData?.requirements || "Complete task to earn reward";
  const description = currentData?.description || "Complete the task as instructed to receive your reward.";
  const events = currentData?.offer_events || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
        
        {qrCodeUrl ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            className="w-full max-w-[380px] bg-[#0a0a0f] rounded-[28px] relative shadow-2xl flex flex-col items-center p-0 overflow-visible mx-auto border border-gray-800/60"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800/40 hover:bg-gray-700/60 text-[#8F95A3] hover:text-white transition-colors cursor-pointer z-50"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative p-6 pt-12 sm:p-8 sm:pt-14 flex flex-col items-center text-center w-full">
              <div className="absolute -top-7">
                <div className="p-[2px] rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-[0_0_20px_rgba(168,85,247,0.6)]">
                  <div className="bg-[#12121a] p-3 rounded-full flex items-center justify-center">
                    {targetDeviceName.toLowerCase().includes('android') ? <AndroidIcon /> : targetDeviceName.toLowerCase().includes('windows') ? <WindowsIcon /> : <AppleIcon />}
                  </div>
                </div>
              </div>

              <div className="mt-2 text-center space-y-3">
                <h2 className="text-2xl font-extrabold text-white tracking-wide">Open on {targetDeviceName}</h2>
                <div className="flex items-start justify-center gap-2 text-[#8F95A3] text-sm px-2">
                  <Sparkles size={16} className="text-purple-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">Scan this QR code on a supported {targetDeviceName} device to start the offer.</p>
                  <Sparkles size={16} className="text-purple-400 shrink-0 mt-0.5" />
                </div>
              </div>

              <div className="mt-8 mb-8 p-1 rounded-[28px] bg-gradient-to-br from-purple-500 via-purple-400 to-blue-500 shadow-[0_0_35px_rgba(168,85,247,0.35)]">
                <div className="bg-white p-3 sm:p-4 rounded-[24px]">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrCodeUrl)}&margin=10`} 
                    alt="Scan to play"
                    className="w-48 h-48 object-contain rounded-xl"
                  />
                </div>
              </div>

              <div className="w-full bg-black/40 rounded-2xl p-3 flex items-center justify-between border border-gray-800/50">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-800/60 p-2.5 rounded-xl text-purple-400">
                    <Smartphone size={20} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">
                      Current Device
                    </span>
                    <span className="text-white font-bold text-base leading-tight">
                      {currentOS}
                    </span>
                  </div>
                </div>
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex items-center justify-center w-10 h-10">
                  {currentOS === 'Windows' ? <WindowsIcon /> : currentOS === 'Android' ? <AndroidIcon /> : <AppleIcon />}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
            className="w-full max-w-[420px] max-h-[85vh] bg-[#12151D] border border-white/5 rounded-[24px] overflow-hidden relative shadow-2xl flex flex-col"
          >
            <div className="flex justify-between items-start px-5 pt-5 pb-3 bg-[#12151D] shrink-0 z-10">
              <h2 className="text-white font-bold text-lg truncate pr-4">{title}</h2>
              <button 
                onClick={onClose}
                className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 pb-5 overflow-y-auto no-scrollbar flex-1">
              <div className="w-full h-[160px] rounded-[16px] overflow-hidden relative flex items-center justify-center bg-[#1A1C24] mb-4 shrink-0">
                <img src={rawImage} alt="bg" className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125" />
                <img src={rawImage} alt={title} className="w-[70px] h-[70px] rounded-2xl relative z-10 shadow-lg object-cover bg-white" />
                <div className="absolute top-3 right-3 z-10">
                  <DeviceIcon offer={currentData} />
                </div>
              </div>

              <h1 className="text-center text-[32px] font-black text-white mb-4 shrink-0">{formattedReward}</h1>

              <div className="flex items-center justify-between border-t border-b border-white/5 py-3 mb-4 shrink-0">
                <div className="flex flex-col items-center flex-1 border-r border-white/5">
                  <span className="text-white font-bold text-[13px] truncate">{currentData?.status || 'Active'}</span>
                  <span className="text-[#8F95A3] text-[9px] font-bold uppercase tracking-wider mt-0.5">Status</span>
                </div>
                <div className="flex flex-col items-center flex-1 border-r border-white/5">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                  </div>
                  <span className="text-[#8F95A3] text-[9px] font-bold uppercase tracking-wider mt-0.5">Popularity</span>
                </div>
                <div className="flex flex-col items-center flex-1 border-r border-white/5">
                  <span className="text-white font-bold text-[13px] truncate px-1 uppercase">{category}</span>
                  <span className="text-[#8F95A3] text-[9px] font-bold uppercase tracking-wider mt-0.5">Category</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <span className="text-white font-bold text-[13px] truncate">{networkName}</span>
                  <span className="text-[#8F95A3] text-[9px] font-bold uppercase tracking-wider mt-0.5">Provider</span>
                </div>
              </div>

              <button 
                onClick={handlePlayClick} disabled={isProcessingClick}
                className="w-full shrink-0 py-3.5 rounded-[12px] bg-[#9333EA] hover:bg-[#8B5CF6] text-white font-bold text-[15px] transition-colors flex items-center justify-center gap-2 cursor-pointer mb-4 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
              >
                {isProcessingClick ? "Processing..." : <> <Play className="w-4 h-4 fill-white" /> Play & Earn {formattedReward} </>}
              </button>

              {apiError && (
                <div className="w-full shrink-0 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold p-3 rounded-xl mb-4 text-center">
                  {apiError}
                </div>
              )}

              <div className="bg-[#1A1C24] rounded-[12px] p-4 mb-4 border border-white/5 shrink-0">
                <h4 className="text-white font-bold text-[13px] mb-1">Requirements</h4>
                <p className="text-[#8F95A3] text-[12px] leading-relaxed">{requirements}</p>
              </div>

              <div className="flex flex-col shrink-0">
                <div className="border-b-2 border-[#8B5CF6] pb-1 w-fit mb-3">
                  <h3 className="text-white font-bold text-sm">Details</h3>
                </div>
                
                <div className="bg-[#1A1C24] border border-white/5 rounded-[12px] p-4 flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <h4 className="text-white font-bold text-[13px]">Description</h4>
                    <p className="text-[#8F95A3] text-[12px] leading-relaxed whitespace-pre-wrap">{description}</p>
                  </div>
                  
                  {events.length > 0 && (
                    <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
                      <h4 className="text-white font-bold text-[11px] uppercase tracking-wider">Milestone Events</h4>
                      <div className="flex flex-col gap-2">
                        {events.map((ev: any, idx: number) => (
                          <div key={ev._id || idx} className="flex items-center justify-between bg-white/5 p-2.5 rounded-lg border border-white/5">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span className="text-white text-[11px] leading-tight">{ev.event_name}</span>
                            </div>
                            <span className="text-emerald-400 font-black text-xs shrink-0 pl-2">+{formatPrice(ev.event_payout || 0, currency)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}

export default function OfferCard({ offer, onClick, isSurveyCard = false }: OfferCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const currency = useCurrency();

  if (!offer) return null;

  const title = offer.offerName || offer.title || offer.name || offer.offer_name || 'Offer Item';
  const subtitle = offer.categories || offer.sub || offer.category || offer.network || offer.provider || 'App';
  
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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-full h-full bg-[#161821] border border-white/5 rounded-[16px] p-2.5 sm:p-3 flex flex-col cursor-pointer overflow-hidden group transition-all duration-200 hover:border-[#8B5CF6]/50 shadow-sm hover:shadow-[0_8px_20px_rgba(139,92,246,0.15)]"
      >
        {/* YEH RAHA 100% PERFECT BACKDROP BLUR FIX */}
        <div className="w-full aspect-square bg-[#1A1C24] rounded-xl overflow-hidden mb-2.5 shrink-0 shadow-sm border border-white/5 relative">
          <img 
            src={rawImage} 
            alt={title} 
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`} 
          />
          
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                /* CSS Native Backdrop Filter: Blur aayega, dark colors pure black nahi honge */
                className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden bg-black/20 backdrop-blur-md"
              >
                <motion.div 
                  initial={{ scale: 0.8, y: 5 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.8, y: 5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative z-30 flex flex-col items-center pointer-events-none"
                >
                  <div className="w-11 h-11 rounded-full bg-[#A855F7] flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(168,85,247,0.8)]">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                  <span className="text-white font-extrabold text-[13px] sm:text-[14px] tracking-wide drop-shadow-lg">
                    {isStrictlySurvey ? 'Start Survey' : 'Start Offer'}
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col flex-1 px-1">
          <h3 className="text-white font-bold text-[14px] sm:text-[15px] leading-tight line-clamp-1">{title}</h3>
          <span className="text-[#9CA3AF] text-[11px] sm:text-[12px] font-medium truncate mt-0.5">{subtitle}</span>
          
          <div className="mt-auto pt-3 pb-0.5 flex items-center justify-between">
            <span className="text-[#A855F7] font-black text-[14px] sm:text-[15px] drop-shadow-sm">{formattedReward}</span>
            <div className="opacity-80"><DeviceIcon offer={offer} /></div>
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