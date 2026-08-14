'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle2, Loader2, ChevronLeft, ChevronRight, Gamepad2, X, AlertCircle, Info, Sparkles, Smartphone, Laptop } from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

// --- DEVICE ICONS ---
const AndroidIcon = ({ className = "w-[16px] h-[16px]" }) => (
  <svg viewBox="0 0 24 24" className={`${className} fill-current`}><path d="M17.523 15.341c.551 0 .998.447.998.998s-.447.998-.998.998-.998-.447-.998-.998.447-.998.998-.998zm-11.046 0c.551 0 .998.447.998.998s-.447.998-.998.998-.998-.447-.998-.998.447-.998.998-.998zm11.38-5.343l2.05-3.551a.498.498 0 00-.182-.682.498.498 0 00-.682.182l-2.079 3.602c-1.472-.673-3.132-1.049-4.888-1.049s-3.416.376-4.888 1.049L5.341 5.767a.498.498 0 00-.682-.182.498.498 0 00-.182.682l2.05 3.551C3.518 11.458 1.5 14.869 1.5 18.828h21c0-3.959-2.018-7.37-5.023-8.83z"/></svg>
);

const AppleIcon = ({ className = "w-[16px] h-[16px]" }) => (
  <svg viewBox="0 0 24 24" className={`${className} fill-current`}><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.72.845-1.391 2.275-1.222 3.637 1.35.104 2.623-.624 3.51-1.625z" /></svg>
);

const WindowsIcon = ({ className = "w-[16px] h-[16px]" }) => (
  <svg viewBox="0 0 24 24" className={`${className} fill-current`}><path d="M0 3.448l9.143-1.25v8.714H0V3.448zm10.286-1.411L24 0v10.793H10.286V2.037zM0 12.828h9.143v8.714L0 20.294V12.828zm10.286 0H24V24l-13.714-1.931v-9.241z"/></svg>
);

// --- UTILITY FUNCTIONS ---
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

function resolveTargetPlatformsString(data: any): string {
  if (!data) return '';
  const candidateKeys = ['browsers', 'platform', 'platforms', 'os', 'devices', 'device', 'target_os', 'operating_system'];
  const parts: string[] = [];
  for (const key of candidateKeys) {
    const val = data?.[key];
    if (val === undefined || val === null) continue;
    if (Array.isArray(val)) parts.push(val.join(' '));
    else parts.push(String(val));
  }
  return parts.join(' ').toLowerCase();
}

function getCurrentDevice(): 'android' | 'ios' | 'windows' | 'mac' | 'unknown' {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return 'android';
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/mac/.test(ua)) return 'mac';
  if (/windows/.test(ua)) return 'windows';
  return 'unknown';
}

export default function MyOffersPage() {
  const router = useRouter();
  const currency = useCurrency();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  
  // API States
  const [pendingOffers, setPendingOffers] = useState<any[]>([]);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [isLoadingPending, setIsLoadingPending] = useState(true);

  const [completedOffers, setCompletedOffers] = useState<any[]>([]);
  const [completedPage, setCompletedPage] = useState(1);
  const [completedTotalPages, setCompletedTotalPages] = useState(1);
  const [isLoadingCompleted, setIsLoadingCompleted] = useState(true);

  // Modal State for Single Pending Offer
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // QR & UI State
  const [generatedQrUrl, setGeneratedQrUrl] = useState<string | null>(null);
  const [requiredDeviceForQR, setRequiredDeviceForQR] = useState<'ios' | 'android' | null>(null);
  const [userCurrentDevice, setUserCurrentDevice] = useState<'android' | 'ios' | 'windows' | 'mac' | 'unknown'>('unknown');

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
    }
    setUserCurrentDevice(getCurrentDevice());
  }, [router]);

  // Fetch Pending Offers
  useEffect(() => {
    const fetchPending = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      setIsLoadingPending(true);
      try {
        const res = await fetch(`https://apitest.binnycash.com/api/user/tracking/userPendingClick?page=${pendingPage}&limit=12`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.code === 200) {
          setPendingOffers(json.data?.list || []);
          setPendingTotalPages(json.data?.totalPages || 1);
        } else {
          setPendingOffers([]);
        }
      } catch (err) {
        console.error("Error fetching pending offers:", err);
      } finally {
        setIsLoadingPending(false);
      }
    };
    if (activeTab === 'pending') fetchPending();
  }, [pendingPage, activeTab]);

  // Fetch Completed Offers
  useEffect(() => {
    const fetchCompleted = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      setIsLoadingCompleted(true);
      try {
        const res = await fetch(`https://apitest.binnycash.com/api/user/tracking/completeUserData?page=${completedPage}&limit=12`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.code === 200) {
          setCompletedOffers(json.data?.list || []);
          setCompletedTotalPages(json.data?.totalPages || 1);
        } else {
          setCompletedOffers([]);
        }
      } catch (err) {
        console.error("Error fetching completed offers:", err);
      } finally {
        setIsLoadingCompleted(false);
      }
    };
    if (activeTab === 'completed') fetchCompleted();
  }, [completedPage, activeTab]);

  // Resolve device icons
  const getDeviceIcons = (offer: any) => {
    const targetPlatforms = resolveTargetPlatformsString(offer);
    const isIos = targetPlatforms.includes('ios') || targetPlatforms.includes('iphone') || targetPlatforms.includes('ipad') || targetPlatforms.includes('mac');
    const isAndroid = targetPlatforms.includes('android');
    const isWindows = targetPlatforms.includes('windows') || targetPlatforms.includes('desktop') || targetPlatforms.includes('pc') || targetPlatforms.includes('win');
    
    return { isIos, isAndroid, isWindows, targetPlatforms };
  };

  // Handle Initial Offer Click
  const handleOfferClick = async (offer: any) => {
    setSelectedOffer(offer);
    setIsModalOpen(true);
    setApiError(null);
    setGeneratedQrUrl(null); 
    setRequiredDeviceForQR(null);
    setIsVerifying(true);

    const token = localStorage.getItem('token');
    const offerId = offer.offerId || offer._id;

    try {
      const res = await fetch(`https://apitest.binnycash.com/api/user/tracking/userSinglePending?offerId=${offerId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      
      if (json.code !== 200) {
        setApiError(json.message || "Failed to verify offer data.");
      }
    } catch (err) {
      setApiError("Network error while verifying offer.");
    } finally {
      setIsVerifying(false);
    }
  };

  // 🔥 UPDATED LAUNCH CLICK LOGIC (Smart Device Mismatch Logic) 🔥
  const handleLaunchOffer = async () => {
    if (!selectedOffer) return;
    setIsLaunching(true);
    setApiError(null);

    const userId = getUserId();
    const targetId = selectedOffer.offerId || selectedOffer._id;
    const token = localStorage.getItem('token') || '';

    try {
      const res = await fetch(`https://apitest.binnycash.com/api/user/tracking/user_click?sid=${encodeURIComponent(userId)}&o=${encodeURIComponent(targetId)}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });

      const responseText = await res.text();
      let finalRedirectUrl = '';
      let errorMessage = '';

      try {
        const jsonRes = JSON.parse(responseText);
        if (jsonRes.type === 'error' || jsonRes.status === 'error' || jsonRes.code !== 200) {
          errorMessage = jsonRes.message || 'Offer unavailable at the moment.';
        }
        finalRedirectUrl = jsonRes?.url || jsonRes?.link || jsonRes?.data?.url || '';
      } catch (e) {
        const urlMatch = responseText.match(/location\.replace\("([^"]+)"\)/i) || responseText.match(/url=([^"]+)/i);
        if (urlMatch) finalRedirectUrl = urlMatch[1] || urlMatch[0];
      }

      if (errorMessage && !finalRedirectUrl) {
        setApiError(errorMessage);
        setIsLaunching(false);
        return;
      }

      if (!finalRedirectUrl || finalRedirectUrl === '#') {
        finalRedirectUrl = selectedOffer.image_url || 'https://binnycash.com'; 
      }

      // Check current user's device & offer requirements
      const devices = getDeviceIcons(selectedOffer);
      const isUniversalOffer = !devices.isAndroid && !devices.isIos && !devices.isWindows;
      
      let isMismatch = false;
      let targetForQR: 'ios' | 'android' | null = null;

      // Logic to trigger QR code if Devices don't match
      if (!isUniversalOffer) {
         if (devices.isIos && !devices.isAndroid && userCurrentDevice !== 'ios') {
            isMismatch = true;
            targetForQR = 'ios';
         } else if (devices.isAndroid && !devices.isIos && userCurrentDevice !== 'android') {
            isMismatch = true;
            targetForQR = 'android';
         }
      }

      // If user is on Windows/Mac and it's a mobile specific offer
      if ((devices.isIos || devices.isAndroid) && (userCurrentDevice === 'windows' || userCurrentDevice === 'mac')) {
          isMismatch = true;
          targetForQR = devices.isIos ? 'ios' : 'android';
      }

      if (isMismatch && targetForQR) {
         // Show Premium QR Modal because of mismatch
         setGeneratedQrUrl(finalRedirectUrl);
         setRequiredDeviceForQR(targetForQR);
      } else {
         // Direct Redirect logic for correct devices
         if (userCurrentDevice === 'android' || userCurrentDevice === 'ios') {
            window.location.href = finalRedirectUrl; // Seamless mobile redirect
         } else {
            window.open(finalRedirectUrl, '_blank'); // Open in new tab on PC
            setIsModalOpen(false); 
         }
      }
      
    } catch (err) {
      setApiError("Error redirecting to offer.");
    } finally {
      setIsLaunching(false);
    }
  };

  const Pagination = ({ current, total, onPageChange }: { current: number, total: number, onPageChange: (p: number) => void }) => {
    if (total <= 1) return null;
    return (
      <div className="flex justify-center items-center gap-4 mt-10">
        <button 
          disabled={current === 1}
          onClick={() => onPageChange(current - 1)}
          className="w-10 h-10 rounded-xl bg-[#1A1C24] border border-white/5 flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/10 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-[#8F95A3] font-medium text-sm">
          Page <span className="text-white font-bold">{current}</span> of {total}
        </span>
        <button 
          disabled={current === total}
          onClick={() => onPageChange(current + 1)}
          className="w-10 h-10 rounded-xl bg-[#1A1C24] border border-white/5 flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/10 transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-[#05070A] min-h-screen text-white relative font-sans">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#8B5CF6]/15 blur-[150px] rounded-full pointer-events-none z-0" />

      <main className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#8F95A3] mb-2">My Activity</h1>
            <p className="text-[#8F95A3] text-sm md:text-base">Track your in-progress and completed missions.</p>
          </div>
          
          <div className="flex items-center bg-[#111319] p-1.5 rounded-2xl border border-white/5">
            <button 
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === 'pending' ? 'bg-[#8B5CF6] text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'}`}
            >
              Pending Offers
            </button>
            <button 
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${activeTab === 'completed' ? 'bg-[#00E57A] text-[#05070A] shadow-[0_0_15px_rgba(0,229,122,0.4)]' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'}`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* PENDING OFFERS */}
        {activeTab === 'pending' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {isLoadingPending ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 text-[#8B5CF6] animate-spin" />
              </div>
            ) : pendingOffers.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-20 bg-[#111319] border border-dashed border-white/10 rounded-3xl">
                <Gamepad2 className="w-16 h-16 text-[#8F95A3] opacity-50 mb-4" />
                <h3 className="text-white text-lg font-bold">No Pending Offers</h3>
                <p className="text-[#8F95A3] text-sm mt-1">Start some offers from the dashboard to see them here.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {pendingOffers.map((offer, idx) => (
                    <motion.div 
                      whileHover={{ y: -5, scale: 1.02 }}
                      key={offer._id || idx}
                      onClick={() => handleOfferClick(offer)}
                      className="group relative bg-[#111319] border border-white/5 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:border-[#8B5CF6]/50 transition-all duration-300 flex flex-col"
                    >
                      <div className="w-full aspect-square bg-[#1A1D24] relative overflow-hidden">
                        <img src={offer.image_url || offer.offerImage} alt={offer.offerName} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111319] to-transparent"></div>
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg">
                          <span className="text-white font-black text-sm">{formatPrice(Number(offer.userCredits || 0), currency)}</span>
                        </div>
                      </div>
                      
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-white font-bold text-base leading-tight line-clamp-1 mb-1">{offer.offerName}</h3>
                        <span className="text-[#8F95A3] text-xs font-medium uppercase tracking-wider mb-4">{offer.network || 'Offer'}</span>
                        
                        <div className="mt-auto w-full bg-[#8B5CF6]/10 text-[#A66CFF] hover:bg-[#8B5CF6] hover:text-white py-2.5 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 transition-colors">
                          <Play className="w-4 h-4 fill-current" /> Resume
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Pagination current={pendingPage} total={pendingTotalPages} onPageChange={setPendingPage} />
              </>
            )}
          </motion.div>
        )}

        {/* COMPLETED OFFERS */}
        {activeTab === 'completed' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {isLoadingCompleted ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 text-[#00E57A] animate-spin" />
              </div>
            ) : completedOffers.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-20 bg-[#111319] border border-dashed border-white/10 rounded-3xl">
                <CheckCircle2 className="w-16 h-16 text-[#8F95A3] opacity-50 mb-4" />
                <h3 className="text-white text-lg font-bold">No Completed Offers</h3>
                <p className="text-[#8F95A3] text-sm mt-1">Your successful completions will appear here.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {completedOffers.map((offer, idx) => (
                    <div 
                      key={idx}
                      className="bg-[#111319] border border-white/5 rounded-[24px] p-4 flex items-center gap-4 hover:border-[#00E57A]/30 transition-colors shadow-sm"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-[#1A1D24] overflow-hidden shrink-0 border border-white/10 relative">
                        <img src={offer.image_url || offer.offerImage || offer.offer?.image_url} alt="Offer" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-[#00E57A]/10 mix-blend-overlay"></div>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <h4 className="text-white font-bold text-sm truncate mb-0.5">{offer.offerName || offer.offer?.offerName || 'Completed Offer'}</h4>
                        <span className="text-[#00E57A] font-black text-lg mb-1">{formatPrice(Number(offer.userCredits || offer.reward || 0), currency)}</span>
                        <div className="flex items-center gap-1.5 w-fit bg-[#00E57A]/10 border border-[#00E57A]/20 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3 text-[#00E57A]" />
                          <span className="text-[#00E57A] text-[9px] font-bold uppercase tracking-widest">Done</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Pagination current={completedPage} total={completedTotalPages} onPageChange={setCompletedPage} />
              </>
            )}
          </motion.div>
        )}
      </main>

      {/* 🔥 MAIN MODAL (CONDITIONAL RENDER FOR INFO VS PREMIUM QR) 🔥 */}
      <AnimatePresence>
        {isModalOpen && selectedOffer && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            />

            {!generatedQrUrl ? (
              // --- STATE 1: REGULAR OFFER INFO ---
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-[#0E1015] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl z-10 flex flex-col"
              >
                {/* Close Button */}
                <div className="absolute top-4 right-4 z-20">
                  <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Banner Image */}
                <div className="w-full h-40 relative">
                  <img src={selectedOffer.image_url || selectedOffer.offerImage} alt={selectedOffer.offerName} className="w-full h-full object-cover opacity-50" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E1015] to-transparent"></div>
                </div>

                <div className="px-6 pb-8 -mt-12 relative z-10 flex flex-col items-center text-center">
                  {/* App Icon */}
                  <div className="w-20 h-20 rounded-2xl bg-[#1A1D24] border-4 border-[#0E1015] overflow-hidden shadow-xl mb-3 shrink-0">
                    <img src={selectedOffer.image_url || selectedOffer.offerImage} alt={selectedOffer.offerName} className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Titles */}
                  <h2 className="text-xl font-black text-white mb-2">{selectedOffer.offerName}</h2>
                  
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                    <span className="text-[#8F95A3] font-bold text-xs uppercase tracking-widest">{selectedOffer.network || 'Task'}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    <span className="text-[#A66CFF] font-black text-sm drop-shadow-sm">{formatPrice(Number(selectedOffer.userCredits || 0), currency)}</span>
                  </div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col items-center">
                    {/* Device & Category Info */}
                    <div className="flex items-center gap-2 mb-5">
                       <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1.5 rounded-lg text-white">
                         {getDeviceIcons(selectedOffer).isAndroid && <AndroidIcon />}
                         {getDeviceIcons(selectedOffer).isIos && <AppleIcon />}
                         {getDeviceIcons(selectedOffer).isWindows && <WindowsIcon />}
                         {!getDeviceIcons(selectedOffer).isAndroid && !getDeviceIcons(selectedOffer).isIos && !getDeviceIcons(selectedOffer).isWindows && <span className="text-[10px] font-bold text-white uppercase">All Devices</span>}
                       </div>
                       <span className="text-[#8F95A3] text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg">
                         {selectedOffer.categories || selectedOffer.category || 'Game'}
                       </span>
                    </div>

                    {/* Requirements Block */}
                    <div className="w-full bg-[#15171E] border border-white/5 rounded-2xl p-4 mb-6 text-left">
                      <span className="text-white font-bold text-[13px] flex items-center gap-1.5 mb-2">
                        <Info className="w-4 h-4 text-[#8B5CF6]" /> Requirements
                      </span>
                      <p className="text-[#8F95A3] text-xs leading-relaxed max-h-[80px] overflow-y-auto custom-scrollbar pr-2">
                        {selectedOffer.description || selectedOffer.offer?.description || selectedOffer.offer_requirements || "Complete the task exactly as instructed by the advertiser to receive your reward."}
                      </p>
                    </div>

                    {apiError && (
                      <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold p-3 rounded-xl mb-4 flex items-center gap-2 text-left">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p>{apiError}</p>
                      </div>
                    )}

                    {/* Launch Button */}
                    <button 
                      onClick={handleLaunchOffer}
                      disabled={isVerifying || isLaunching}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#A66CFF] text-white font-black text-[15px] uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-transform shadow-[0_10px_30px_rgba(139,92,246,0.3)] disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2 cursor-pointer"
                    >
                      {isVerifying ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
                      ) : isLaunching ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Opening...</>
                      ) : (
                        <><Play className="w-5 h-5 fill-white" /> Continue Mission</>
                      )}
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              
              // --- STATE 2: PREMIUM GLOWING QR VIEW (From your screenshot) ---
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-sm bg-[#0B0D14] border border-white/5 rounded-[32px] p-8 flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10"
              >
                <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>

                {/* Floating Top Device Icon */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#1A1D24] border-2 border-[#A66CFF]/30 flex items-center justify-center shadow-[0_0_20px_rgba(166,108,255,0.4)] text-white">
                  {requiredDeviceForQR === 'ios' ? <AppleIcon className="w-5 h-5" /> : <AndroidIcon className="w-5 h-5" />}
                </div>

                <h3 className="text-2xl font-black text-white mt-4 mb-2">
                  Open on {requiredDeviceForQR === 'ios' ? 'iOS' : 'Android'}
                </h3>
                
                <div className="flex items-center gap-2 mb-8 px-4 text-center">
                  <Sparkles className="w-4 h-4 text-[#A66CFF] shrink-0" />
                  <p className="text-[#8F95A3] text-sm">
                    Scan this QR code on a supported {requiredDeviceForQR === 'ios' ? 'iOS' : 'Android'} device to start the offer.
                  </p>
                  <Sparkles className="w-4 h-4 text-[#A66CFF] shrink-0" />
                </div>

                {/* Glowing QR Box */}
                <div className="relative p-1 rounded-[28px] bg-gradient-to-br from-[#A66CFF] to-[#3B82F6] shadow-[0_0_40px_rgba(166,108,255,0.3)] mb-8">
                  <div className="bg-white p-3 rounded-[24px]">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generatedQrUrl)}`}
                      alt="Scan QR"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                </div>

                {/* Current Device Box */}
                <div className="w-full bg-[#15171E] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#8F95A3]">
                       {userCurrentDevice === 'windows' || userCurrentDevice === 'mac' ? <Laptop className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-bold text-[#8F95A3] uppercase tracking-wider">Current Device</span>
                      <span className="text-white font-bold text-sm capitalize">{userCurrentDevice}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#00E57A]">
                    {userCurrentDevice === 'windows' ? <WindowsIcon className="w-4 h-4" /> : userCurrentDevice === 'mac' ? <AppleIcon className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                  </div>
                </div>

              </motion.div>
            )}

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}