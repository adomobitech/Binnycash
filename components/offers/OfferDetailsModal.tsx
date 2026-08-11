'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PlayCircle, Star, CheckCircle2, Monitor, Smartphone, ShieldCheck, Sparkles, RotateCcw, Headphones, ChevronRight } from "lucide-react";
import { DeviceIcon } from '@/components/offers/OfferCard';
import { useCurrency, formatPrice } from '@/hooks/useCurrency'; 
import Link from 'next/link';

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

function getUserId(): string {
  if (typeof window === 'undefined') return '';
  const isNumeric = (v: any) => v !== null && v !== undefined && /^\d+$/.test(String(v));
  try {
    const wrapperKeys = ['loginResponse', 'authResponse', 'loginData'];
    for (const key of wrapperKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        const id = parsed?.data?.userDetails?.id ?? parsed?.userDetails?.id;
        if (isNumeric(id)) return String(id);
      } catch {}
    }
    const objectKeys = ['userDetails', 'user', 'userData', 'profile', 'authUser'];
    for (const key of objectKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        const candidates = [parsed?.id, parsed?.userDetails?.id, parsed?._id, parsed?.userId, parsed?.user_id];
        const numericMatch = candidates.find(isNumeric);
        if (numericMatch !== undefined) return String(numericMatch);
      } catch {}
    }
    const directKeys = ['userId', 'user_id', 'uid', 'sid'];
    for (const key of directKeys) {
      const val = localStorage.getItem(key);
      if (isNumeric(val)) return String(val);
    }
  } catch (err) {
    console.error('Could not resolve user id:', err);
  }
  return '';
}

const getCleanString = (val: any) => {
  const s = String(val || '').trim();
  if (s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined' || s === '') return '';
  return s;
};

export default function OfferDetailsModal({ offer, isOpen, onClose }: any) {
  const currency = useCurrency();
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingClick, setIsProcessingClick] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [targetDeviceName, setTargetDeviceName] = useState<string>('Android');
  const [currentOS, setCurrentOS] = useState<string>('Windows');
  const [apiError, setApiError] = useState<string | null>(null); 
  
  const [activeInnerTab, setActiveInnerTab] = useState<'rewards' | 'details'>('rewards');
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

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

  useEffect(() => {
    const evs = (details?.offer_events || offer?.offer_events || details?.events || offer?.events || []);
    if (evs.length > 0) setActiveInnerTab('rewards');
    else setActiveInnerTab('details');
  }, [details, offer]);

  const handlePlayClick = async () => {
    setIsProcessingClick(true);
    setApiError(null);
    
    const ua = navigator.userAgent;
    const isDesktop = !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

    const targetId = offer.id ?? offer._id ?? offer.offer_id;
    const userId = getUserId();

    if (!userId) {
      setApiError('Could not identify your account. Please log in again and retry.');
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
      let isDeviceError = false;

      try {
        const jsonRes = JSON.parse(responseText);
        
        // 🔥 FIX: Let the API decide if device is supported 🔥
        if (jsonRes.type === 'error' || jsonRes.status === 'error' || jsonRes.code !== 200) {
          errorMessage = jsonRes.message || 'Offer unavailable.';
          const msgLower = errorMessage.toLowerCase();
          
          if (msgLower.includes('device') || msgLower.includes('support') || msgLower.includes('platform') || msgLower.includes('os') || msgLower.includes('not allow')) {
              isDeviceError = true;
          }
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
        
        // 🔥 SHOW QR ONLY IF BACKEND REJECTED DUE TO DEVICE OR WE'RE ON PC WITH ERROR 🔥
        if (isDeviceError || isDesktop) {
          const trackingUrl = `https://apitest.binnycash.com/api/user/tracking/user_click?sid=${encodeURIComponent(userId)}&o=${encodeURIComponent(targetId)}`;
          
          let generateQRFor = 'Mobile Device';
          const currentData = details || offer;
          const targetPlatforms = String(currentData?.device || currentData?.browsers || currentData?.platform || currentData?.os || '').toLowerCase();
          
          if (targetPlatforms.includes('ios') || targetPlatforms.includes('iphone') || targetPlatforms.includes('ipad')) {
             generateQRFor = 'iOS';
          } else if (targetPlatforms.includes('android')) {
             generateQRFor = 'Android';
          }
          
          setTargetDeviceName(generateQRFor);
          setQrCodeUrl(trackingUrl);
        } else {
          setApiError(errorMessage);
        }
        
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
  const offerIdForSupport = currentData?.id || currentData?._id || currentData?.offer_id || '';
  const rewardAmount = currentData?.userCredits ?? currentData?.reward ?? currentData?.payout ?? 0;
  const formattedReward = formatPrice(Number(rewardAmount) || 0, currency);

  const networkName = currentData?.network || currentData?.provider || 'BinnyCash';
  const category = currentData?.categories || currentData?.category || 'All';
  
  const descCurrent = getCleanString(currentData?.description);
  const description = descCurrent || "Complete the task as instructed to receive your reward.";

  const reqCurrent = getCleanString(currentData?.offer_requirements) || getCleanString(currentData?.requirements);
  const requirements = reqCurrent || "Install and Launch to earn reward.";

  const events = currentData?.offer_events || currentData?.events || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
        
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
                      Current device
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
            transition={{ duration: 0.2 }}
            className={`w-full max-w-[400px] rounded-[24px] max-h-[90vh] overflow-y-auto custom-scrollbar relative border border-white/10 shadow-2xl bg-[#0B0D14] flex flex-col`}
          >
            <div className="sticky top-0 bg-[#0B0D14]/95 backdrop-blur-md z-20 px-5 pt-5 pb-3 flex items-center justify-between">
              <h2 className="text-white font-black text-lg truncate pr-4">{title}</h2>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-[#8F95A3] hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isLoading ? (
              <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-10 h-10 border-4 border-[#A855F7]/30 border-t-[#A855F7] rounded-full animate-spin mb-4"></div>
                <p className="text-[#8F95A3] text-sm font-bold">Loading offer details...</p>
              </div>
            ) : (
              <div className="px-5 pb-5 flex flex-col gap-4 mt-1">
                
                <div className="w-full h-[150px] rounded-2xl overflow-hidden relative flex items-center justify-center bg-[#1A1C24] shrink-0 border border-white/5">
                  <img src={rawImage} className="absolute inset-0 w-full h-full object-cover blur-[30px] opacity-40 scale-110" alt="blur-bg" />
                  
                  <div className="absolute top-2.5 right-2.5 z-10 flex items-center justify-center text-white opacity-80">
                    <DeviceIcon offer={currentData} />
                  </div>
                  
                  <img src={rawImage} alt={title} className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl relative z-10 shadow-2xl object-cover" />
                </div>

                <div className="text-center">
                  <h1 className="text-2xl font-black text-[#A855F7] drop-shadow-md">{formattedReward}</h1>
                </div>

                <div className="grid grid-cols-4 divide-x divide-white/5 py-1 mb-1">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-white font-bold text-[10px] truncate max-w-[90px]">{currentData?.status || 'Not Started'}</span>
                    <span className="text-[#8F95A3] text-[9px] font-medium uppercase tracking-wider">Status</span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1">
                    <div className="flex items-center gap-0.5">
                      {[1,2,3].map(i => <Star key={i} className="w-2 h-2 text-amber-400 fill-amber-400" />)}
                      {[4,5].map(i => <Star key={i} className="w-2 h-2 text-gray-600 fill-gray-600" />)}
                    </div>
                    <span className="text-[#8F95A3] text-[9px] font-medium uppercase tracking-wider">Popularity</span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-white font-bold text-[10px] truncate max-w-[90px] px-1 capitalize">{category}</span>
                    <span className="text-[#8F95A3] text-[9px] font-medium uppercase tracking-wider">Category</span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1">
                    {rawNetworkLogo ? (
                      <img src={rawNetworkLogo} alt={networkName} className="h-3.5 object-contain mb-0.5 max-w-[70px]" onError={(e: any) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'block'; }} />
                    ) : null}
                    <span className="text-white font-bold text-[10px] truncate max-w-[80px]" style={{ display: rawNetworkLogo ? 'none' : 'block' }}>{networkName}</span>
                    <span className="text-[#8F95A3] text-[9px] font-medium uppercase tracking-wider">Provider</span>
                  </div>
                </div>

                <button 
                  onClick={handlePlayClick} disabled={isProcessingClick}
                  className="w-full py-3 rounded-[12px] bg-[#A855F7] hover:bg-[#9333EA] shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-70"
                >
                  {isProcessingClick ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>
                    <Play className="w-4 h-4 text-white fill-white transition-transform" />
                    <span className="text-white font-black text-[14px]">Play & Earn</span>
                  </>}
                </button>

                {apiError && (
                  <div className="w-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold p-3 rounded-xl text-center animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                    {apiError}
                  </div>
                )}

                <div className="bg-[#161821] border border-white/5 rounded-2xl p-4 mt-1">
                   <h4 className="text-white font-bold text-[12px] mb-1">Requirements</h4>
                   <p className="text-[#8F95A3] text-[11px] leading-relaxed">{requirements}</p>
                </div>

                <div className="flex flex-col gap-3">
                  {events && events.length > 0 && (
                    <div className="flex items-center gap-5 border-b border-white/10 px-2 mt-1">
                      <button
                        onClick={() => setActiveInnerTab('rewards')}
                        className={`pb-2.5 text-[12px] font-bold transition-all relative ${activeInnerTab === 'rewards' ? 'text-[#00E57A]' : 'text-[#8F95A3] hover:text-white'}`}
                      >
                        Rewards
                        {activeInnerTab === 'rewards' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00E57A] rounded-t-full shadow-[0_0_8px_rgba(0,229,122,0.5)]"></span>}
                      </button>
                      <button
                        onClick={() => setActiveInnerTab('details')}
                        className={`pb-2.5 text-[12px] font-bold transition-all relative ${activeInnerTab === 'details' ? 'text-[#8B5CF6]' : 'text-[#8F95A3] hover:text-white'}`}
                      >
                        Details
                        {activeInnerTab === 'details' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#8B5CF6] rounded-t-full shadow-[0_0_8px_rgba(139,92,246,0.5)]"></span>}
                      </button>
                    </div>
                  )}

                  <div className="w-full">
                    {/* Rewards Tab Content */}
                    {activeInnerTab === 'rewards' && events && events.length > 0 && (
                      <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                        {events.map((ev: any, idx: number) => (
                          <div key={ev._id || idx} className="flex items-center justify-between bg-[#1A1C24] p-3 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2.5 pr-2">
                              <div className="w-4 h-4 rounded-full bg-[#00E57A]/10 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-2.5 h-2.5 text-[#00E57A]" />
                              </div>
                              <span className="text-white text-[11px] font-medium leading-tight">{ev.event_name}</span>
                            </div>
                            <span className="text-[#00E57A] font-black text-[12px] shrink-0 pl-1">+{formatPrice(Number(ev.event_payout) || 0, currency)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Details Tab Content */}
                    {activeInnerTab === 'details' && (
                      <div className="flex flex-col gap-2.5 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
                        <div className="bg-[#1A1C24] border border-white/5 rounded-2xl p-4">
                           <h4 className="text-white font-bold text-[12px] mb-1">Description</h4>
                           <p className="text-[#8F95A3] text-[11px] leading-relaxed whitespace-pre-wrap">{description}</p>
                        </div>

                        <div className="bg-[#1A1C24] border border-white/5 rounded-2xl p-3.5 flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                            <RotateCcw className="w-3.5 h-3.5 text-[#8B5CF6]" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white font-bold text-[12px]">Task Order Flexibility</span>
                            <span className="text-[#8F95A3] text-[10px] leading-tight mt-0.5">Tasks can be completed in any order.</span>
                          </div>
                        </div>

                        <div className="bg-[#1A1C24] border border-white/5 rounded-2xl p-3.5 flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                            <Smartphone className="w-3.5 h-3.5 text-[#8B5CF6]" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white font-bold text-[12px]">New Users Only</span>
                            <span className="text-[#8F95A3] text-[10px] leading-tight mt-0.5">Valid only for users who haven't installed this before.</span>
                          </div>
                        </div>

                        <div onClick={() => setIsPayoutModalOpen(true)} className="bg-[#1A1C24] hover:bg-[#252836] transition-colors border border-white/5 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer group mb-2">
                          <div className="flex flex-col">
                            <span className="text-white font-bold text-[12px]">Why Does Payout Take Time?</span>
                            <span className="text-[#8F95A3] text-[10px] mt-0.5">Depends on offer type and checks...</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#8F95A3] group-hover:text-white transition-colors shrink-0" />
                        </div>
                        
                        <Link
                          href={`/support?category=${encodeURIComponent('Offer and Surveys')}&description=${encodeURIComponent(`Offer Name: ${title}\nOffer ID: ${offerIdForSupport}`)}`}
                          className="bg-[#1A1C24] hover:bg-[#252836] border border-white/5 rounded-2xl p-3.5 flex items-center justify-center gap-2 transition-all cursor-pointer w-full hover:scale-[1.02] mt-1"
                        >
                          <Headphones className="w-4 h-4 text-[#8F95A3]" />
                          <span className="text-white font-bold text-[13px] tracking-wide">Contact Support</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
            
            <style dangerouslySetInnerHTML={{__html: `
              .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.5); }
            `}} />
          </motion.div>
        )}

        {/* 🔥 PAYOUT MODAL POPUP 🔥 */}
        {isPayoutModalOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsPayoutModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.3 }}
              className="relative w-full max-w-[400px] p-6 flex flex-col bg-[#161821] border border-white/10 rounded-[20px] shadow-2xl z-10"
            >
              <button onClick={() => setIsPayoutModalOpen(false)} className="absolute top-4 right-4 text-[#8F95A3] hover:text-white transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
              
              <h2 className="text-[17px] font-black text-white mb-3 text-center">Why Does Payout Take Time??</h2>
              
              <p className="text-[#A0A5B1] text-[13px] leading-relaxed mb-5 text-left">
                Payout time depends on the type of offer you complete. Some tasks need verification from our partners, which may take a little longer. We also review certain activities to make sure all terms are followed. We always try to process rewards quickly, but sometimes delays happen due to external checks beyond our control.
              </p>
              
              <div className="flex justify-end w-full">
                <button onClick={() => setIsPayoutModalOpen(false)} className="bg-[#A855F7] hover:bg-[#9333EA] text-white text-[13px] font-bold py-2 px-6 rounded-[8px] transition-colors shadow-lg cursor-pointer">
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
}