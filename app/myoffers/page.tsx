'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle2, RotateCcw, Smartphone, ShieldCheck, Sparkles, AlertCircle, Info, ChevronRight, DollarSign, Clock, ListTodo, Headphones, ClipboardList, X } from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';
import Link from 'next/link';

const AndroidIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#A4C639]"><path d="M17.523 15.3414C17.523 15.3414 17.523 15.3414 17.523 15.3414C17.523 16.1432 16.8924 16.7738 16.0906 16.7738C15.2889 16.7738 14.6583 16.1432 14.6583 15.3414C14.6583 14.5397 15.2889 13.9091 16.0906 13.9091C16.8924 13.9091 17.523 14.5397 17.523 15.3414ZM9.34167 15.3414C9.34167 15.3414 9.34167 15.3414 9.34167 15.3414C9.34167 16.1432 8.71108 16.7738 7.90933 16.7738C7.10759 16.7738 6.47699 16.1432 6.47699 15.3414C6.47699 14.5397 7.10759 13.9091 7.90933 13.9091C8.71108 13.9091 9.34167 14.5397 9.34167 15.3414ZM17.9622 10.7416L19.8661 7.44426C19.9868 7.23517 19.915 6.96781 19.7059 6.84717C19.4968 6.72652 19.2295 6.79828 19.1088 7.00737L17.1706 10.3644C15.6171 9.64654 13.8631 9.24584 12.0003 9.24584C10.1374 9.24584 8.38338 9.64654 6.82998 10.3644L4.89173 7.00737C4.77109 6.79828 4.50373 6.72652 4.29464 6.84717C4.08554 6.96781 4.01379 7.23517 4.13444 7.44426L6.03831 10.7416C2.63935 12.6075 0.354181 16.166 0.0546875 20.315H23.9458C23.6463 16.166 21.3612 12.6075 17.9622 10.7416Z" /></svg>
);
const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.72.845-1.391 2.275-1.222 3.637 1.35.104 2.623-.624 3.51-1.625z" /></svg>
);
const WindowsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#00A4EF]"><path d="M0 3.448l9.143-1.25v8.714H0V3.448zm10.286-1.411L24 0v10.793H10.286V2.037zM0 12.828h9.143v8.714L0 20.294V12.828zm10.286 0H24V24l-13.714-1.931v-9.241z"/></svg>
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
  } catch (err) {}
  return '';
}

function getOfferKey(item: any): string {
  const raw = item?.offerId ?? item?._id ?? item?.id;
  if (raw !== undefined && raw !== null && raw !== '') return String(raw);
  return '';
}

function isSameOffer(a: any, b: any): boolean {
  const keyA = getOfferKey(a);
  const keyB = getOfferKey(b);
  if (!keyA || !keyB) return false;
  return keyA === keyB;
}

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

export const DeviceIcon = ({ offer }: { offer: any }) => {
  const rawBrowsers = resolveTargetPlatformsString(offer);
  if (rawBrowsers === 'all' || rawBrowsers === 'global' || rawBrowsers === '') return <div className="flex gap-1"><AndroidIcon/><AppleIcon/><WindowsIcon/></div>;
  
  const isAndroid = rawBrowsers.includes('android');
  const isWindows = rawBrowsers.includes('windows') || rawBrowsers.includes('win') || rawBrowsers.includes('pc') || rawBrowsers.includes('desktop');
  const isIos = rawBrowsers.includes('ios') || rawBrowsers.includes('iphone') || rawBrowsers.includes('ipad');

  if (isAndroid) return <AndroidIcon />;
  if (isWindows) return <WindowsIcon />;
  if (isIos) return <AppleIcon />;
  return <div className="flex gap-1"><AndroidIcon/><AppleIcon/><WindowsIcon/></div>;
};

export default function MyOffersPage() {
  const router = useRouter();
  const currency = useCurrency();
  const [activeTab, setActiveTab] = useState<'started' | 'completed'>('started');
  
  const [startedOffers, setStartedOffers] = useState<any[]>([]);
  const [completedOffers, setCompletedOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [offerDetails, setOfferDetails] = useState<any>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const [isProcessingClick, setIsProcessingClick] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [targetDeviceName, setTargetDeviceName] = useState<string>('Android');
  const [currentOS, setCurrentOS] = useState<string>('Windows');
  const [apiError, setApiError] = useState<string | null>(null);
  
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

  const loadOfferDetails = async (offer: any) => {
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
        const finalStartedList = Array.isArray(startedList) ? startedList : [];
        setStartedOffers(finalStartedList);

        const completedRes = await fetch('https://apitest.binnycash.com/api/user/tracking/getUserCompleteData', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const completedData = await completedRes.json();
        const completedList = completedData?.data?.list || completedData?.data || [];
        setCompletedOffers(Array.isArray(completedList) ? completedList : []);

        if (finalStartedList.length > 0) {
          loadOfferDetails(finalStartedList[0]);
        } else {
          setSelectedOffer(null);
          setOfferDetails(null);
        }
      } catch (err) {
        console.error("Failed to fetch tracking data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleTabChange = (tab: 'started' | 'completed') => {
    setActiveTab(tab);
    if (tab === 'started') {
      if (startedOffers.length > 0) {
        loadOfferDetails(startedOffers[0]);
      } else {
        setSelectedOffer(null);
        setOfferDetails(null);
        setQrCodeUrl(null);
        setApiError(null);
      }
    } else {
      setSelectedOffer(null);
      setOfferDetails(null);
      setQrCodeUrl(null);
      setApiError(null);
    }
  };

  const handleSelectOffer = async (offer: any) => {
    if (selectedOffer && isSameOffer(selectedOffer, offer)) return; 
    loadOfferDetails(offer);
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
      const res = await fetch(`https://apitest.binnycash.com/api/user/tracking/user_click?sid=${encodeURIComponent(userId)}&o=${encodeURIComponent(targetId)}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
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

  const currentData = { ...selectedOffer, ...offerDetails };
  const name = currentData?.offerName || currentData?.offer_name || currentData?.title || 'Offer Details';
  const offerIdForSupport = currentData?.offerId || currentData?._id || currentData?.id || '';
  const rewardAmount = currentData?.userCredits ?? currentData?.reward ?? currentData?.payout ?? 0;
  
  let rawImage = currentData?.image_url || currentData?.offerImage || currentData?.logo || currentData?.preview || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=A855F7&color=fff`;
  if (rawImage && !rawImage.startsWith('http')) rawImage = `https://apitest.binnycash.com${rawImage}`;

  const requirements = currentData?.offer_requirements || currentData?.requirements || "Install and Launch to earn reward";
  const description = currentData?.description || "Complete the task as instructed to receive your reward.";
  
  const targetPlatforms = resolveTargetPlatformsString(currentData);
  const isIos = targetPlatforms.includes('ios') || targetPlatforms.includes('iphone') || targetPlatforms.includes('ipad');
  const isAndroidOffer = targetPlatforms.includes('android');
  const isWindowsOffer = targetPlatforms.includes('windows') || targetPlatforms.includes('desktop') || targetPlatforms.includes('pc') || targetPlatforms.includes('win');

  const totalEarned = completedOffers.reduce((sum, offer) => {
    const val = offer.userCredits ?? offer.reward ?? offer.payout ?? 0;
    return sum + Number(val);
  }, 0);

  const clickAllowed = offerDetails?.clickAllowed !== undefined ? offerDetails.clickAllowed : (selectedOffer?.clickAllowed !== undefined ? selectedOffer.clickAllowed : true);
  const retries = offerDetails?.retryAllow ?? selectedOffer?.retryAllow ?? 0;

  return (
    <div className="flex flex-col bg-[#0B0D14] min-h-screen text-white relative">
      <main className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-[28px] font-black text-white mb-1">My Offers</h1>
            <p className="text-[#8F95A3] text-sm">Track your progress and earn more rewards</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-1">
          <button 
            onClick={() => handleTabChange('started')}
            className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${activeTab === 'started' ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'text-[#8F95A3] hover:text-white'}`}
          >
            Started Offers
          </button>
          <button 
            onClick={() => handleTabChange('completed')}
            className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${activeTab === 'completed' ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'text-[#8F95A3] hover:text-white'}`}
          >
            Completed Offers
          </button>
        </div>

        <div className="w-full bg-[#161821] border border-white/5 rounded-xl p-4 flex items-center gap-3 mb-8">
          <Info className="w-5 h-5 text-[#8F95A3] shrink-0" />
          <p className="text-sm text-[#8F95A3]">Your started offers from featured offers will appear here. Offers started from an offerwall will appear inside that specific offerwall's started offer list.</p>
        </div>

        {activeTab === 'started' && (
          <>
            {/* 100% ORIGINAL HORIZONTAL SCROLL DESKTOP LOGIC RESTORED */}
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-6 -my-6 px-2 -mx-2 mb-4">
              {isLoading ? (
                <div className="text-[#8F95A3] text-sm animate-pulse px-2">Loading offers...</div>
              ) : startedOffers.length === 0 ? (
                <div className="text-[#8F95A3] text-sm px-2">No started offers found.</div>
              ) : (
                startedOffers.map((item, idx) => {
                  const hasSelection = selectedOffer !== null;
                  const isSelected = hasSelection && isSameOffer(selectedOffer, item);
                  
                  let iconImg = item.image_url || item.offerImage || item.logo || item.preview || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.offerName || 'O')}&background=A855F7&color=fff`;
                  if (iconImg && !iconImg.startsWith('http')) iconImg = `https://apitest.binnycash.com${iconImg}`;
                  
                  const progressVal = item.progress ?? item.completionPercentage ?? item.completion_percentage ?? ((idx * 37 + 23) % 75 + 10);
                  const apiStatus = item.status || 'In Progress';
                  
                  return (
                    <div 
                      key={idx} 
                      onClick={() => handleSelectOffer(item)}
                      className={`relative flex flex-col justify-between w-[230px] h-[140px] shrink-0 rounded-[18px] overflow-hidden cursor-pointer transition-all duration-300 p-4 ${isSelected ? 'border-2 border-[#A855F7] shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-[1.02]' : 'border border-white/5 hover:border-white/20'}`}
                    >
                      <div className="absolute inset-0 z-0">
                        <img src={iconImg} alt="bg" className="w-full h-full object-cover opacity-30 blur-md" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111319] via-[#111319]/80 to-[#111319]/40"></div>
                      </div>

                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-2">
                           <div className="w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0 shadow-md">
                              <img src={iconImg} alt="icon" className="w-full h-full object-cover" />
                           </div>
                           <span className="bg-[#A855F7] text-white text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                             {apiStatus}
                           </span>
                        </div>
                        
                        <div className="mt-auto flex flex-col gap-1.5">
                           <span className="text-white text-sm font-bold truncate drop-shadow-md">{item.offerName || item.offer_name || 'Offer'}</span>
                           
                           <div className="flex justify-between items-center">
                              <span className="text-white text-xs font-bold">{formatPrice(Number(item.userCredits || item.reward || 0), currency)}</span>
                              
                              <div className="flex items-center gap-1.5">
                                {item.retryAllow !== undefined && (
                                  <span className="text-amber-400 text-[9px] font-bold bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded flex items-center gap-1 backdrop-blur-sm">
                                    <RotateCcw className="w-2.5 h-2.5" /> {item.retryAllow} Retries
                                  </span>
                                )}
                                <div className="opacity-80 flex gap-1 bg-black/30 p-0.5 rounded backdrop-blur-sm">
                                   <DeviceIcon offer={item} />
                                </div>
                              </div>
                           </div>

                           <div className="w-full flex items-center gap-2 mt-1">
                              <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden flex items-center justify-between">
                                 <div className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] rounded-full transition-all duration-500" style={{ width: `${progressVal}%` }}></div>
                              </div>
                              <span className="text-[9px] text-[#8F95A3] font-bold shrink-0">{progressVal}%</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {!isLoading && (
                <Link href="/dashboard" className="w-[220px] h-[140px] shrink-0 border border-dashed border-white/20 rounded-[18px] flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors cursor-pointer">
                  <ClipboardList className="w-8 h-8 text-[#8B5CF6]" />
                  <span className="text-white font-bold text-sm">View Featured Offers</span>
                  <span className="text-[#8B5CF6] text-xs font-medium hover:underline">Explore Now</span>
                </Link>
              )}
            </div>

            {selectedOffer && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mt-6">
                {isDetailsLoading ? (
                   <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="w-12 h-12 border-4 border-[#A855F7]/30 border-t-[#A855F7] rounded-full animate-spin"></div>
                   </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      {/* 🔥 MOBILE RESPONSIVE PADDING AND LOGO FIXES APPLIED HERE 🔥 */}
                      <div className="w-full aspect-[4/3] bg-[#161821] rounded-2xl sm:rounded-3xl border border-white/5 relative overflow-hidden flex flex-col justify-end p-4 sm:p-6 shadow-xl group">
                        <div className="absolute inset-0 z-0">
                          <img src={rawImage} alt="bg-blur" className="w-full h-full object-cover opacity-20 blur-2xl group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#111319] to-transparent"></div>
                        </div>
                        
                        {/* MOBILE LOGO OVERLAP FIX: sm:w-36 sm:h-36 aur mobile me w-24 h-24 */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-28 h-28 sm:w-36 sm:h-36 bg-white rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-2xl">
                          <img src={rawImage} alt={name} className="w-full h-full object-contain rounded-xl sm:rounded-2xl" />
                        </div>

                        <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-80">
                           {isIos ? <AppleIcon /> : isWindowsOffer ? <WindowsIcon /> : isAndroidOffer ? <AndroidIcon /> : null}
                        </div>

                        <div className="relative z-20 flex items-end justify-between w-full mt-auto">
                          <div className="flex flex-col w-[70%]">
                            {/* MOBILE TITLE TEXT FIX */}
                            <span className="text-white font-bold text-sm sm:text-base truncate mb-1">{name}</span>
                            {/* MOBILE PRICE TEXT FIX */}
                            <h1 className="text-xl sm:text-2xl font-black text-white leading-none">{formatPrice(Number(rewardAmount) || 0, currency)}</h1>
                          </div>

                          <button 
                            onClick={handlePlayClick} 
                            disabled={!clickAllowed || isProcessingClick}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all shrink-0 ${!clickAllowed ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-[#A855F7] hover:bg-[#9333EA] cursor-pointer hover:scale-105'}`}
                          >
                            {isProcessingClick ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white ml-0.5" />}
                          </button>
                        </div>
                      </div>

                      {/* MOBILE BUTTON PADDING FIX */}
                      <Link
                        href={`/support?category=${encodeURIComponent('Offer and Surveys')}&description=${encodeURIComponent(`Offer Name: ${name}\nOffer ID: ${offerIdForSupport}`)}`}
                        className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-[0_0_20px_rgba(239,68,68,0.4)] border border-red-400/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-center gap-2 transition-all cursor-pointer w-full hover:scale-[1.02]"
                      >
                        <Headphones className="w-5 h-5 text-white" />
                        <span className="text-white font-black text-[14px] sm:text-[15px] tracking-wide">Support</span>
                      </Link>

                      {apiError && (
                        <div className="w-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                          {apiError}
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5 pb-8">
                      
                      <div className="bg-[#161821] border border-white/5 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
                         <div className="flex flex-col items-center flex-1 border-r border-white/5">
                            <span className="text-[9px] sm:text-[10px] text-[#8F95A3] font-bold uppercase tracking-wider mb-1">Click Status</span>
                            <span className={`text-xs sm:text-sm font-black ${clickAllowed ? 'text-[#00E57A]' : 'text-red-500'}`}>{clickAllowed ? 'Allowed' : 'Blocked'}</span>
                         </div>
                         <div className="flex flex-col items-center flex-1">
                            <span className="text-[9px] sm:text-[10px] text-[#8F95A3] font-bold uppercase tracking-wider mb-1">Retries Left</span>
                            <span className="text-xs sm:text-sm font-black text-amber-400 flex items-center gap-1.5">
                              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {retries}
                            </span>
                         </div>
                      </div>

                      <div className="bg-[#161821] border border-white/5 rounded-2xl p-4 sm:p-6">
                         <h4 className="text-white font-bold text-sm mb-2">Requirements</h4>
                         <p className="text-[#8F95A3] text-xs sm:text-sm leading-relaxed">{requirements}</p>
                      </div>

                      <div className="bg-[#161821] border border-white/5 rounded-2xl p-4 sm:p-6">
                         <h4 className="text-white font-bold text-sm mb-2">Description</h4>
                         <p className="text-[#8F95A3] text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{description}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}

        {/* 100% ORIGINAL COMPLETED OFFERS VERTICAL LIST */}
        {activeTab === 'completed' && (
          <div className="flex flex-col gap-3 w-full max-w-4xl">
            {isLoading ? (
              <div className="text-[#8F95A3] text-sm animate-pulse">Loading completed offers...</div>
            ) : completedOffers.length === 0 ? (
              <div className="text-[#8F95A3] text-sm">No completed offers found.</div>
            ) : (
              completedOffers.map((item, idx) => {
                const nestedOffer = item.offer || item.campaign || item;
                let iconImg = nestedOffer.image_url || nestedOffer.offerImage || nestedOffer.logo || nestedOffer.image || nestedOffer.preview || item.image_url || item.offerImage || item.logo || item.image || item.preview;
                const offerName = nestedOffer.offerName || nestedOffer.offer_name || nestedOffer.title || item.offerName || item.offer_name || 'Completed Offer';
                const providerName = nestedOffer.network || nestedOffer.provider || item.network || item.provider || 'Provider';
                const rew = item.userCredits ?? item.reward ?? item.payout ?? nestedOffer.userCredits ?? nestedOffer.reward ?? nestedOffer.payout ?? 0;

                if (!iconImg) {
                  iconImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(offerName)}&background=A855F7&color=fff`;
                } else if (!iconImg.startsWith('http')) {
                  iconImg = `https://apitest.binnycash.com${iconImg.startsWith('/') ? '' : '/'}${iconImg}`;
                }

                return (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="w-full bg-[#161821] border border-white/5 hover:border-[#00E57A]/30 transition-all rounded-[20px] p-4 flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-[#1A1C24] rounded-xl overflow-hidden border border-white/10 shrink-0">
                        <img src={iconImg} alt="icon" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-white font-bold text-sm md:text-base truncate">{offerName}</span>
                        <span className="text-[#8F95A3] text-xs mt-0.5 truncate">{providerName}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0 pl-4">
                      <span className="text-[#00E57A] font-black text-lg md:text-xl leading-none">
                        {formatPrice(Number(rew) || 0, currency)}
                      </span>
                      <div className="flex items-center gap-1 bg-[#00E57A]/10 border border-[#00E57A]/20 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-[#00E57A]" />
                        <span className="text-[#00E57A] text-[10px] font-bold uppercase tracking-wider">Completed</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

      </main>

      <AnimatePresence>
        {isPayoutModalOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsPayoutModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.3 }}
              className="relative w-full max-w-[500px] p-6 sm:p-8 flex flex-col bg-[#1A1C24] border border-white/10 rounded-[24px] shadow-2xl z-10 text-center"
            >
              <button onClick={() => setIsPayoutModalOpen(false)} className="absolute top-5 right-5 text-[#8F95A3] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-[20px] font-black text-white mb-5">Why Does Payout Take Time??</h2>
              
              <p className="text-[#A0A5B1] text-[15px] leading-relaxed mb-8 text-left">
                Payout time depends on the type of offer you complete. Some tasks need verification from our partners, which may take a little longer. We also review certain activities to make sure all terms are followed. We always try to process rewards quickly, but sometimes delays happen due to external checks beyond our control.
              </p>
              
              <div className="flex justify-end w-full">
                <button onClick={() => setIsPayoutModalOpen(false)} className="bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold py-2.5 px-8 rounded-[12px] transition-colors shadow-lg cursor-pointer">
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              <button onClick={() => setQrCodeUrl(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-[#8F95A3] hover:text-white transition-colors border border-white/5 cursor-pointer z-50">
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