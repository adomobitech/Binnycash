'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, PlayCircle, CheckCircle2, RotateCcw, Smartphone, ShieldCheck, Sparkles, AlertCircle, Info, Check } from 'lucide-react';

const AndroidIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#A4C639]"><path d="M17.523 15.3414C17.523 15.3414 17.523 15.3414 17.523 15.3414C17.523 16.1432 16.8924 16.7738 16.0906 16.7738C15.2889 16.7738 14.6583 16.1432 14.6583 15.3414C14.6583 14.5397 15.2889 13.9091 16.0906 13.9091C16.8924 13.9091 17.523 14.5397 17.523 15.3414ZM9.34167 15.3414C9.34167 15.3414 9.34167 15.3414 9.34167 15.3414C9.34167 16.1432 8.71108 16.7738 7.90933 16.7738C7.10759 16.7738 6.47699 16.1432 6.47699 15.3414C6.47699 14.5397 7.10759 13.9091 7.90933 13.9091C8.71108 13.9091 9.34167 14.5397 9.34167 15.3414ZM17.9622 10.7416L19.8661 7.44426C19.9868 7.23517 19.915 6.96781 19.7059 6.84717C19.4968 6.72652 19.2295 6.79828 19.1088 7.00737L17.1706 10.3644C15.6171 9.64654 13.8631 9.24584 12.0003 9.24584C10.1374 9.24584 8.38338 9.64654 6.82998 10.3644L4.89173 7.00737C4.77109 6.79828 4.50373 6.72652 4.29464 6.84717C4.08554 6.96781 4.01379 7.23517 4.13444 7.44426L6.03831 10.7416C2.63935 12.6075 0.354181 16.166 0.0546875 20.315H23.9458C23.6463 16.166 21.3612 12.6075 17.9622 10.7416Z" /></svg>
);
const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.72.845-1.391 2.275-1.222 3.637 1.35.104 2.623-.624 3.51-1.625z" /></svg>
);
const WindowsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#00A4EF]"><path d="M0 3.448l9.143-1.25v8.714H0V3.448zm10.286-1.411L24 0v10.793H10.286V2.037zM0 12.828h9.143v8.714L0 20.294V12.828zm10.286 0H24V24l-13.714-1.931v-9.241z"/></svg>
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

// 🔥 FIX: Kabhi kabhi offer object me `_id` aur `id` dono hi missing hote hain.
// Pehle wala code `selectedOffer._id === item._id` compare karta tha — jab dono
// undefined hote hain toh JS me undefined === undefined => true ho jaata hai,
// isliye SAARE cards "selected" dikhne lagte the (sab bade ho jaate, blur wale
// effect ke bajaye sab highlight ho jaate, aur layout screen se bahar chala jaata).
// Ab hum offerId/_id/id/offerName ko milaakar ek stable string key banate hain,
// aur agar dono taraf key khaali ho toh unhe kabhi match nahi maante.
function getOfferKey(item: any): string {
  const raw = item?.offerId ?? item?._id ?? item?.id;
  if (raw !== undefined && raw !== null && raw !== '') return String(raw);
  return '';
}

function isSameOffer(a: any, b: any): boolean {
  const keyA = getOfferKey(a);
  const keyB = getOfferKey(b);
  if (!keyA || !keyB) return false; // empty/undefined keys never match each other
  return keyA === keyB;
}

// 🔥 FIX: Pehle sirf 4 field names check ho rahe the (browsers/platform/os/device_type).
// Agar backend kisi aur key se bhejta hai (jaise deviceType, os_type, supported_os,
// target_os, devices[], operating_system) toh targetPlatforms khaali reh jaata tha,
// isUniversal true ban jaata, aur Android-only offer bhi "universal" maan liya jaata —
// isliye Desktop pe QR ki jagah seedha link khul raha tha.
// Ye helper bahut saari possible keys (string ya array dono) check karta hai.
function resolveTargetPlatformsString(data: any): string {
  if (!data) return '';
  const candidateKeys = [
    'browsers', 'platform', 'platforms', 'os', 'device_type', 'deviceType',
    'devices', 'device', 'supported_os', 'supportedOS', 'target_os', 'targetOS',
    'operating_system', 'operatingSystem', 'os_type', 'osType', 'os_name', 'osName'
  ];
  const parts: string[] = [];
  for (const key of candidateKeys) {
    const val = data?.[key];
    if (val === undefined || val === null) continue;
    if (Array.isArray(val)) parts.push(val.join(' '));
    else parts.push(String(val));
  }
  return parts.join(' ').toLowerCase();
}

export default function MyOffersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'started' | 'completed'>('started');
  
  const [startedOffers, setStartedOffers] = useState<any[]>([]);
  const [completedOffers, setCompletedOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected Offer details state
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [offerDetails, setOfferDetails] = useState<any>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  // Click Action States
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
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const startedRes = await fetch('https://apitest.binnycash.com/api/user/tracking/userStartedData', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const startedData = await startedRes.json();
        const startedList = startedData?.data?.list || startedData?.data || [];
        setStartedOffers(Array.isArray(startedList) ? startedList : []);

        const completedRes = await fetch('https://apitest.binnycash.com/api/user/tracking/getUserCompleteData', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const completedData = await completedRes.json();
        const completedList = completedData?.data?.list || completedData?.data || [];
        setCompletedOffers(Array.isArray(completedList) ? completedList : []);

        // Remove auto selection so dashboard is hidden on load
        setSelectedOffer(null);
        setOfferDetails(null);
      } catch (err) {
        console.error("Failed to fetch tracking data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSelectOffer = async (offer: any) => {
    if (selectedOffer && isSameOffer(selectedOffer, offer)) {
      setSelectedOffer(null);
      setOfferDetails(null);
      setQrCodeUrl(null);
      setApiError(null);
      return;
    }

    setSelectedOffer(offer);
    setQrCodeUrl(null);
    setApiError(null);
    setIsDetailsLoading(true);
    
    const token = localStorage.getItem('token') || '';
    const targetId = offer.offerId || offer._id || offer.id;

    try {
      let res = await fetch(`https://apitest.binnycash.com/api/user/tracking/getSingleClickOffer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ offerId: targetId }) 
      });

      if (res.status === 404 || res.status === 405) {
        res = await fetch(`https://apitest.binnycash.com/api/user/tracking/getSingleClickOffer?offerId=${targetId}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      const resData = await res.json();
      setOfferDetails(resData?.data || null);
    } catch (err) {
      console.error("Failed to fetch offer status:", err);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handlePlayClick = async () => {
    setIsProcessingClick(true);
    setApiError(null);

    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(ua);
    const isMobile = isIOS || isAndroid || /Mobi|Tablet/i.test(ua);
    const isDesktop = !isMobile;

    const currentData = { ...selectedOffer, ...offerDetails };
    const targetPlatforms = resolveTargetPlatformsString(currentData);
    // 🔥 DEBUG: Isse dev console (F12) me dekh ki asli API offer object me device/os
    // wala field kaunse naam se aa raha hai — agar targetPlatforms yaha bhi khaali
    // aaye, matlab backend field ka naam upar wali candidateKeys list me nahi hai.
    console.log('[Offer Device Debug]', { currentData, resolvedTargetPlatforms: targetPlatforms });
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

    const targetId = offerDetails?.id ?? selectedOffer?.id ?? selectedOffer?.offerId ?? selectedOffer?._id;
    const userId = getUserId();

    if (!userId) {
      setApiError('Could not identify your account. Please log in again and retry.');
      setIsProcessingClick(false);
      return;
    }

    // 🔥 API Tracking URL Logic 🔥
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
        finalRedirectUrl = selectedOffer?.click_url || selectedOffer?.link || selectedOffer?.url;
      }

      if (newTab) {
        newTab.location.href = finalRedirectUrl;
      } else {
        window.open(finalRedirectUrl, '_blank');
      }

    } catch (err) {
      console.error("Error processing click URL:", err);
      if (newTab) {
         newTab.location.href = selectedOffer?.click_url || selectedOffer?.link || selectedOffer?.url || 'https://binnycash.com';
      }
    } finally {
      setIsProcessingClick(false);
    }
  };

  const currentList = activeTab === 'started' ? startedOffers : completedOffers;
  
  const currentData = { ...selectedOffer, ...offerDetails };
  const name = currentData?.offerName || currentData?.offer_name || currentData?.title || 'Offer Details';
  const rewardAmount = currentData?.userCredits ?? currentData?.reward ?? currentData?.payout ?? 0;
  
  let rawImage = currentData?.image_url || currentData?.offerImage || currentData?.logo || currentData?.preview || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=A855F7&color=fff`;
  if (rawImage && !rawImage.startsWith('http')) rawImage = `https://apitest.binnycash.com${rawImage}`;

  const requirements = currentData?.offer_requirements || currentData?.requirements || "Install and Launch to earn reward";
  const description = currentData?.description || "Complete the task as instructed to receive your reward.";
  const targetPlatforms = resolveTargetPlatformsString(currentData);
  const isIos = targetPlatforms.includes('ios') || targetPlatforms.includes('iphone') || targetPlatforms.includes('ipad');
  const isAndroidOffer = targetPlatforms.includes('android');
  const isWindowsOffer = targetPlatforms.includes('windows') || targetPlatforms.includes('desktop') || targetPlatforms.includes('pc') || targetPlatforms.includes('win');

  return (
    <div className="flex flex-col bg-[#0B0D14] min-h-screen text-white relative">
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* TOP TABS */}
        <div className="flex items-center gap-2 mb-4">
          <button 
            onClick={() => { 
              setActiveTab('started'); 
              setSelectedOffer(null); 
              setOfferDetails(null); 
              setQrCodeUrl(null); 
              setApiError(null); 
            }}
            className={`px-5 py-2.5 rounded-[14px] text-sm font-bold transition-all cursor-pointer ${activeTab === 'started' ? 'bg-[#A855F7] text-white shadow-lg' : 'bg-[#1A1C24] text-[#8F95A3] hover:text-white'}`}
          >
            Started Offer
          </button>
          <button 
            onClick={() => { 
              setActiveTab('completed'); 
              setSelectedOffer(null); 
              setOfferDetails(null); 
              setQrCodeUrl(null); 
              setApiError(null); 
            }}
            className={`px-5 py-2.5 rounded-[14px] text-sm font-bold transition-all cursor-pointer ${activeTab === 'completed' ? 'bg-[#A855F7] text-white shadow-lg' : 'bg-[#1A1C24] text-[#8F95A3] hover:text-white'}`}
          >
            Completed Offer
          </button>
        </div>

        <p className="text-[13px] text-[#8F95A3] flex items-center gap-1.5 mb-8">
          <Info className="w-4 h-4 text-white/50" /> 
          Your {activeTab} offers from <span className="text-white font-bold">Featured Offers</span> will appear here.
        </p>

        {/* HORIZONTAL MINI CARDS LIST */}
        <div className="flex items-start gap-3 overflow-x-auto no-scrollbar pb-6 mb-8 border-b border-white/5">
          {isLoading ? (
            <div className="text-[#8F95A3] text-sm animate-pulse">Loading offers...</div>
          ) : currentList.length === 0 ? (
            <div className="text-[#8F95A3] text-sm">No {activeTab} offers found.</div>
          ) : (
            currentList.map((item, idx) => {
              const hasSelection = selectedOffer !== null;
              const isSelected = hasSelection && isSameOffer(selectedOffer, item);
              
              let iconImg = item.image_url || item.offerImage || item.logo || item.preview || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.offerName || 'O')}&background=A855F7&color=fff`;
              if (iconImg && !iconImg.startsWith('http')) iconImg = `https://apitest.binnycash.com${iconImg}`;
              
              return (
                <div 
                  key={idx} 
                  onClick={() => handleSelectOffer(item)}
                  // 🔥 Exact Blur & Focus Selection Design Match 🔥
                  className={`flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 w-24 shrink-0 ${
                    hasSelection 
                      ? isSelected 
                        ? 'opacity-100 scale-105' 
                        : 'opacity-40 blur-[2px] hover:opacity-70 hover:blur-none hover:scale-100'
                      : 'opacity-100 hover:scale-105'
                  }`}
                >
                  <div className={`w-24 h-24 bg-[#161821] rounded-2xl overflow-hidden transition-all border ${isSelected ? 'border-[3px] border-[#A855F7] shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'border-white/10'}`}>
                    <img src={iconImg} alt="icon" className="w-full h-full object-cover" />
                  </div>
                  <span className={`text-xs font-semibold truncate w-full text-center px-1 ${isSelected ? 'text-[#A855F7]' : 'text-white'}`}>
                    {item.offerName || item.offer_name || 'Offer'}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* DETAILS DASHBOARD BELOW LIST */}
        {selectedOffer && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          >
            {isDetailsLoading ? (
               <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-[#A855F7]/30 border-t-[#A855F7] rounded-full animate-spin"></div>
               </div>
            ) : (
              // ================== SPLIT LAYOUT DASHBOARD ==================
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                
                {/* LEFT COLUMN: Image Card */}
                <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4">
                  <div className="w-full aspect-[4/5] bg-[#161821] rounded-[28px] border border-white/5 relative overflow-hidden flex flex-col justify-end p-6 shadow-2xl group">
                    <div className="absolute inset-0 z-0">
                      <img src={rawImage} alt="bg-blur" className="w-full h-full object-cover opacity-20 blur-2xl group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    
                    {/* Centered Large Icon */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-32 h-32 bg-white rounded-[32px] p-2 shadow-2xl">
                      <img src={rawImage} alt={name} className="w-full h-full object-contain rounded-[24px]" />
                    </div>

                    {/* Top Right Device Icon */}
                    <div className="absolute top-4 right-4 z-10">
                       {isIos ? <AppleIcon /> : isWindowsOffer ? <WindowsIcon /> : isAndroidOffer ? <AndroidIcon /> : null}
                    </div>

                    <div className="relative z-20 flex items-end justify-between w-full mt-auto">
                      <div className="flex flex-col w-[70%]">
                        <span className="text-white font-bold text-sm mb-1">Offer Details</span>
                        <h1 className="text-3xl font-black text-white leading-none">${parseFloat(String(rewardAmount)).toFixed(2)}</h1>
                      </div>

                      {activeTab !== 'completed' && (
                        <button 
                          onClick={handlePlayClick} 
                          disabled={isProcessingClick}
                          className="w-14 h-14 rounded-full bg-[#A855F7] hover:bg-[#9333EA] flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer hover:scale-105 transition-all shrink-0"
                        >
                          {isProcessingClick ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Play className="w-5 h-5 text-white fill-white ml-0.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status Pills */}
                  <div className="flex items-center gap-3">
                     <div className="flex-1 bg-[#161821] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                       <span className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-wider mb-1">Status</span>
                       <span className={`text-sm font-black flex items-center gap-1.5 ${currentData?.status === 'COMPLETE' ? 'text-[#00E57A]' : 'text-amber-400'}`}>
                         {currentData?.status === 'COMPLETE' ? <CheckCircle2 className="w-4 h-4"/> : <RotateCcw className="w-4 h-4"/>} 
                         {currentData?.status || 'PENDING'}
                       </span>
                     </div>
                     <div className="flex-1 bg-[#161821] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                       <span className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-wider mb-1">Retries</span>
                       <span className="text-sm font-black text-white">
                         {offerDetails?.retryAllow || 0} Left
                       </span>
                     </div>
                  </div>

                  {/* API Error Box */}
                  {apiError && (
                    <div className="w-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold p-4 rounded-2xl text-center animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                      {apiError}
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: Details & Requirements */}
                <div className="w-full flex-1 flex flex-col gap-6 pt-2 pb-6">
                  
                  {/* Requirements Block */}
                  <div className="flex flex-col">
                    <h3 className="text-white font-black text-lg mb-3 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#8B5CF6]" /> Requirements
                    </h3>
                    <div className="bg-[#161821] border border-white/5 rounded-2xl p-5 shadow-inner">
                      <p className="text-[#8F95A3] text-[15px] leading-relaxed font-medium">{requirements}</p>
                    </div>
                  </div>

                  {/* Title and Description */}
                  <div className="flex flex-col mt-2">
                    <div className="border-b-2 border-[#8B5CF6] pb-2 mb-4 w-fit">
                      <h3 className="text-[#8B5CF6] font-bold text-sm tracking-wide">Details</h3>
                    </div>
                    
                    {/* Description Box */}
                    <div className="bg-[#161821] border border-white/5 rounded-2xl p-6 shadow-inner mb-4">
                      <h4 className="text-white font-bold text-base mb-3">Description</h4>
                      <p className="text-[#8F95A3] text-sm leading-relaxed whitespace-pre-wrap">{description}</p>
                    </div>

                    {/* Info Blocks (Task Order, New Users) */}
                    <div className="flex flex-col gap-3 mt-2">
                      <div className="bg-[#161821] border border-white/5 rounded-2xl p-5 flex items-center gap-5">
                        <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                          <RotateCcw className="w-5 h-5 text-[#8B5CF6]" />
                        </div>
                        <div className="flex flex-col">
                          <h4 className="text-white font-bold text-[15px]">Task Order Flexibility</h4>
                          <p className="text-[#8F95A3] text-sm mt-0.5">Tasks can be completed in any order. There is no fixed sequence.</p>
                        </div>
                      </div>

                      <div className="bg-[#161821] border border-white/5 rounded-2xl p-5 flex items-center gap-5">
                        <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8B5CF6]"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </div>
                        <div className="flex flex-col">
                          <h4 className="text-white font-bold text-[15px]">New Users Only</h4>
                          <p className="text-[#8F95A3] text-sm mt-0.5">This offer is valid only for users who have not installed the app before.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )
          }
          </motion.div>
        )}
      </main>

      {/* ================== QR CODE CENTERED MODAL ================== */}
      <AnimatePresence>
        {qrCodeUrl && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setQrCodeUrl(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.3 }}
              className="relative w-full max-w-md p-8 pt-10 flex flex-col items-center text-center bg-[#111319] border border-white/10 rounded-[28px] shadow-2xl z-10 overflow-hidden"
            >
              <button
                onClick={() => setQrCodeUrl(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-[#8F95A3] hover:text-white transition-colors border border-white/5 cursor-pointer z-50"
              >
                <span className="text-lg leading-none">&times;</span>
              </button>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#8B5CF6]/20 blur-[100px] rounded-full pointer-events-none" />

              <div className="relative w-14 h-14 rounded-full border border-[#8B5CF6]/30 bg-black/40 flex items-center justify-center mb-4 shadow-lg backdrop-blur-md z-10">
                {targetDeviceName.toLowerCase().includes('android') ? <AndroidIcon /> : targetDeviceName.toLowerCase().includes('windows') ? <WindowsIcon /> : <AppleIcon />}
              </div>

              <h2 className="text-2xl font-black text-white mb-2 relative z-10">Open on {targetDeviceName}</h2>
              <p className="text-[#8F95A3] text-sm mb-8 relative z-10 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                Scan this QR code on a supported {targetDeviceName} device to continue.
                <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
              </p>

              <div className="relative z-10 p-1 rounded-[24px] bg-gradient-to-b from-[#A855F7] to-[#8B5CF6]/10 shadow-[0_0_50px_rgba(139,92,246,0.4)] mb-6">
                <div className="bg-white p-3 rounded-[22px]">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrCodeUrl)}&margin=10`} alt="Scan" className="w-[220px] h-[220px] object-contain rounded-xl" />
                </div>
              </div>

              <button onClick={() => setQrCodeUrl(null)} className="relative z-10 text-[#8F95A3] hover:text-white underline text-sm cursor-pointer">
                Back to Offer Details
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}