'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, AlertCircle, CheckCircle2, RotateCcw, Smartphone, ShieldCheck, Sparkles } from 'lucide-react';
// Hook imported securely
import { useCurrency, formatPrice } from '@/hooks/useCurrency'; 

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
  // 🔥 HOOK REMOVED FROM HERE TO PREVENT CRASH
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

export default function MyOfferModal({ isOpen, onClose, offer }: any) {
  // 🔥 HOOK PLACED SAFELY INSIDE THE COMPONENT
  const currency = useCurrency(); 

  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
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
      return;
    }
    if (!offer) return;

    const fetchOfferStatus = async () => {
      setIsLoading(true);
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
        setDetails(resData?.data || null);
      } catch (err) {
        console.error("Failed to fetch offer status:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOfferStatus();
  }, [isOpen, offer]);

  const handleContinueClick = async () => {
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

    const targetId = offer.id ?? offer.offerId ?? offer._id;
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

  if (!isOpen) return null;

  const name = offer?.offerName || offer?.offer_name || details?.offername || 'Offer Details';
  const clickAllowed = details ? details.clickAllowed : false;
  const retries = details?.retryAllow || 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.3 }}
          className={`w-full max-w-md ${qrCodeUrl ? 'bg-[#0B0D15]' : 'bg-[#111319]'} border border-white/10 rounded-[28px] shadow-2xl relative overflow-hidden z-10 flex flex-col`}
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
                  {currentOS === 'Windows' ? <WindowsIcon /> : currentOS === 'Android' ? <AndroidIcon /> : <AppleIcon />}
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
              {!isLoading && (
                <div className="h-[60px] bg-[#1A1C24] border-b border-white/5 flex items-center justify-between px-6 shrink-0">
                  <h3 className="text-white font-black text-base truncate pr-4">{name}</h3>
                </div>
              )}
              <div className="p-6 md:p-8 flex flex-col items-center text-center">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <div className="w-12 h-12 border-4 border-[#8B5CF6]/30 border-t-[#8B5CF6] rounded-full animate-spin" />
                    <p className="text-[#8F95A3] text-sm font-medium">Checking offer status...</p>
                  </div>
                ) : (
                  <>
                    {clickAllowed ? (
                      <div className="w-20 h-20 rounded-full bg-[#00E57A]/10 border border-[#00E57A]/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,229,122,0.2)]">
                        <CheckCircle2 className="w-10 h-10 text-[#00E57A]" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                      </div>
                    )}

                    <h2 className="text-2xl font-black text-white mb-2">{clickAllowed ? 'Offer is Active' : 'Action Not Allowed'}</h2>
                    <p className="text-[#8F95A3] text-sm font-medium mb-6 leading-relaxed">
                      {clickAllowed ? 'You are eligible to continue this offer. Click below to proceed.' : 'You cannot retry or continue this offer at the moment.'}
                    </p>

                    {details && (
                      <div className="w-full bg-[#1A1C24] border border-white/5 rounded-2xl p-4 flex justify-between items-center mb-6">
                        <div className="flex flex-col items-center w-1/2 border-r border-white/5">
                          <span className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-wider mb-1">Status</span>
                          <span className={`text-sm font-black ${clickAllowed ? 'text-[#00E57A]' : 'text-red-500'}`}>{clickAllowed ? 'Allowed' : 'Blocked'}</span>
                        </div>
                        <div className="flex flex-col items-center w-1/2">
                          <span className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-wider mb-1">Retries Left</span>
                          <span className="text-sm font-black text-amber-400 flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> {retries}</span>
                        </div>
                      </div>
                    )}

                    {apiError && (
                      <div className="w-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold p-3 rounded-xl mb-6 text-center animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                        {apiError}
                      </div>
                    )}

                    {clickAllowed ? (
                      <button 
                        onClick={handleContinueClick} disabled={isProcessingClick}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7c3aed] text-white font-black text-[15px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(139,92,246,0.4)] hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isProcessingClick ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Continue Offer <ExternalLink className="w-4 h-4" /></>}
                      </button>
                    ) : (
                      <button onClick={onClose} className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-[15px] transition-all cursor-pointer border border-white/10">Close</button>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}