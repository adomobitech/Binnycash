'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { 
  Bell, Rocket, Trophy, Wallet, ChevronDown, User, 
  LogOut, MessageSquare, HelpCircle, Gift, 
  BarChart3, Users, X, CheckCheck, Loader2, Globe, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import "flag-icons/css/flag-icons.min.css";
import ChatDrawer from '@/components/chat/ChatDrawer';

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

// --- UTILITY: Get User ID securely ---
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
    const directKeys = ['userId', 'user_id', 'uid', 'sid', 'numericUserId'];
    for (const key of directKeys) {
      const val = localStorage.getItem(key);
      if (isNumeric(val)) return String(val);
    }
  } catch (err) {}
  return '';
}

const LANGUAGES = [
  { code: 'en', name: 'English', tag: 'us' },
  { code: 'hi', name: 'Hindi', tag: 'in' },
  { code: 'es', name: 'Spanish', tag: 'es' },
  { code: 'fr', name: 'French', tag: 'fr' },
  { code: 'de', name: 'German', tag: 'de' },
  { code: 'pt', name: 'Portuguese', tag: 'pt' },
  { code: 'ru', name: 'Russian', tag: 'ru' },
  { code: 'zh-CN', name: 'Chinese', tag: 'cn' },
  { code: 'ja', name: 'Japanese', tag: 'jp' },
  { code: 'ko', name: 'Korean', tag: 'kr' },
  { code: 'it', name: 'Italian', tag: 'it' },
  { code: 'tr', name: 'Turkish', tag: 'tr' },
  { code: 'vi', name: 'Vietnamese', tag: 'vn' },
  { code: 'th', name: 'Thai', tag: 'th' },
  { code: 'id', name: 'Indonesian', tag: 'id' },
  { code: 'ar', name: 'Arabic', tag: 'sa' },
  { code: 'bn', name: 'Bengali', tag: 'bd' },
  { code: 'ur', name: 'Urdu', tag: 'pk' }
];

const MAIN_LINKS = [
  { name: 'Earn', href: '/dashboard' },
  { name: 'My Offers', href: '/myoffers' },
  { name: 'Affiliate', href: '/affiliate' },
  { name: 'Leaderboard', href: '/leaderboard' },
  { name: 'Cashout', href: '/cashout' },
  { name: 'Rewards', href: '/rewards' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { openLogin, openRegister } = useAuth();
  
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [balance, setBalance] = useState('0.00');
  
  const [userName, setUserName] = useState('Profile');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  
  const [trueUserId, setTrueUserId] = useState<string>('');

  const [currency, setCurrency] = useState('Usd');
  const [isCurrencySwitching, setIsCurrencySwitching] = useState(false);

  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isInboxLoading, setIsInboxLoading] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const navRef = useRef<HTMLElement>(null);

  // Translation & Currency Initial Load
  useEffect(() => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'googtrans' && value) {
        const langCode = value.split('/')[2];
        const found = LANGUAGES.find(l => l.code === langCode);
        if (found) setSelectedLang(found);
      }
    }
    
    if (typeof window !== 'undefined') {
      const savedCurrency = localStorage.getItem('currency');
      if (savedCurrency === 'Coin' || savedCurrency === 'COIN') {
         setCurrency('Coin');
         window.dispatchEvent(new CustomEvent('currencyChanged', { detail: 'Coin' }));
      } else {
         setCurrency('Usd');
         localStorage.setItem('currency', 'Usd');
         window.dispatchEvent(new CustomEvent('currencyChanged', { detail: 'Usd' }));
      }
    }
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsLoggedIn(true);
        fetch('https://apitest.binnycash.com/api/user/wallet/total-earning', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => { if (data && data.data !== undefined) setBalance(data.data); })
          .catch(err => console.error("Wallet fetch error:", err));
      } else {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    const interval = setInterval(checkAuth, 1000);
    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
  }, []);

  const resolveImage = (imgSrc: string) => {
    if (!imgSrc) return null;
    if (imgSrc.startsWith('http')) return imgSrc;
    return `https://apitest.binnycash.com${imgSrc}`;
  };

  useEffect(() => {
    if (isLoggedIn) {
      const token = localStorage.getItem('token');
      fetch('https://apitest.binnycash.com/api/user/viewData', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
         const user = data?.data?.user || data?.data;
         if (user) {
            if (user.id) setTrueUserId(String(user.id));
            let display = user.userName || user.firstName;
            if (!display && user.email) {
              display = user.email.split('@')[0];
            }
            if (display) setUserName(display);
            
            const rawPic = user.image || user.profilePic;
            if (rawPic) setUserAvatar(resolveImage(rawPic));
         }
      })
      .catch(err => console.error("Profile fetch error:", err));
    }
  }, [isLoggedIn]);

  const toggleCurrency = async () => {
    if (isCurrencySwitching) return;
    
    const newCurrency = currency === 'Usd' ? 'Coin' : 'Usd';
    setIsCurrencySwitching(true);

    try {
      const token = localStorage.getItem('token');
      const currentUserId = trueUserId || getUserId() || localStorage.getItem('userId'); 
      
      if (!currentUserId) {
        setIsCurrencySwitching(false);
        return;
      }

      const bodyParams = new URLSearchParams();
      bodyParams.append('currency', newCurrency);
      bodyParams.append('userId', currentUserId); 

      const res = await fetch(`https://apitest.binnycash.com/api/user/updateCurrencyValue?userId=${currentUserId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: bodyParams
      });

      const json = await res.json();

      if (res.ok || json.code === 200) {
        setCurrency(newCurrency);
        localStorage.setItem('currency', newCurrency);
        window.dispatchEvent(new CustomEvent('currencyChanged', { detail: newCurrency }));
      }
    } catch (error) {
      console.error("Error updating currency:", error);
    } finally {
      setIsCurrencySwitching(false);
    }
  };

  const fetchInboxMessages = async () => {
    setIsInboxLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://apitest.binnycash.com/api/user/notificationList', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      const notificationsList = data?.data?.notifications || data?.notifications || [];
      setInboxMessages(Array.isArray(notificationsList) ? notificationsList : []);
      if (data?.data?.unreadCount !== undefined) {
        setUnreadCount(data.data.unreadCount);
      }
    } catch (err) {
      console.error("Notifications fetch error:", err);
    } finally { 
      setIsInboxLoading(false); 
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = trueUserId || getUserId();
      
      const res = await fetch(`https://apitest.binnycash.com/api/user/markAllRead?userId=${userId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        setUnreadCount(0);
        setInboxMessages(prev => prev.map(item => ({ ...item, isRead: true })));
      }
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  useEffect(() => { 
    if (isInboxOpen) fetchInboxMessages(); 
  }, [isInboxOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
        setIsLangModalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!document.getElementById('google-translate-overrides')) {
      const style = document.createElement('style');
      style.id = 'google-translate-overrides';
      style.innerHTML = `
        .goog-te-banner-frame.skiptranslate, iframe.goog-te-banner-frame, .goog-te-banner-frame { display: none !important; visibility: hidden !important; height: 0 !important; width: 0 !important; }
        body { top: 0px !important; position: static !important; }
        .goog-te-balloon-frame, #goog-gt-tt { display: none !important; }
        .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
        .skiptranslate { display: none !important; }
      `;
      document.head.appendChild(style);
    }
    
    if (window.google && window.google.translate) return;
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en', autoDisplay: false, includedLanguages: LANGUAGES.map(l => l.code).join(',') },
        'google_translate_element'
      );
    };
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleLanguageChange = (lang: any) => {
    setSelectedLang(lang);
    setIsLangModalOpen(false);
    if (lang.code === 'en') {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
    } else {
      document.cookie = `googtrans=/en/${lang.code}; path=/;`;
    }
    window.location.reload();
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false);
    setIsTransitioning(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('https://apitest.binnycash.com/api/user/logout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userId'); 
      setIsLoggedIn(false);
      setTimeout(() => {
        setIsTransitioning(false);
        router.replace('/');
      }, 1000);
    }
  };

  const isCoin = currency === 'Coin' || currency === 'COIN';

  return (
    <>
      <AnimatePresence>
        {isTransitioning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B0E14]">
            <div className="w-24 h-24 mb-6 rounded-full border border-[#8B5CF6]/30 bg-[#1A1C23] flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)]">
              <motion.img animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1 }} src="/logo.png" alt="BinnyCash" className="w-14 h-14 object-contain" />
            </div>
            <h2 className="text-white text-xl font-black tracking-wide animate-pulse">Logging out securely...</h2>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[#111315] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
              <h3 className="text-white text-lg font-black mb-2 mt-4">Are you sure?</h3>
              <p className="text-[#8F95A3] text-sm mb-6">You will be logged out of your session.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors">Cancel</button>
                <button onClick={handleLogoutConfirm} className="flex-1 py-3 rounded-xl bg-[#8B5CF6] hover:bg-[#7c3aed] text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-colors">Yes, Logout</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RIGHT-SIDE SLIDING NOTIFICATIONS DRAWER */}
      <AnimatePresence>
        {isInboxOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setIsInboxOpen(false)}
              className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm" 
            />
            
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0E1015] border-l border-white/10 z-[160] flex flex-col shadow-[-10px_0_40px_rgba(0,0,0,0.8)]"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#12151C]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
                    <Bell className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg">Notifications</h3>
                    <p className="text-xs text-[#8F95A3]">System updates & alerts</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleMarkAllAsRead} 
                    className="text-[11px] font-bold text-[#8B5CF6] bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark read
                  </button>
                  <button 
                    onClick={() => setIsInboxOpen(false)} 
                    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8F95A3] hover:text-white transition-all cursor-pointer border border-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
                {isInboxLoading ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-3">
                    <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-[#8F95A3] font-medium">Loading notifications...</span>
                  </div>
                ) : inboxMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center text-[#8F95A3]">
                    <Bell className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-sm font-medium">No notifications yet.</p>
                  </div>
                ) : (
                  inboxMessages.map((item, idx) => {
                    const title = item.title || 'Notification';
                    const message = item.message || '';
                    const amount = item.amount ? `+$${item.amount}` : '';
                    const timeAgo = new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div key={item._id || idx} className={`bg-[#12151C] border rounded-2xl p-4 flex flex-col gap-2 transition-all ${item.isRead ? 'border-white/5 opacity-75' : 'border-[#8B5CF6]/40 bg-[#161922]'}`}>
                        <div className="flex items-center justify-between">
                          <h4 className="text-white text-sm font-black">{title}</h4>
                          <span className="text-[10px] text-[#8F95A3]">{timeAgo}</span>
                        </div>
                        <p className="text-[#8F95A3] text-xs leading-relaxed">{message}</p>
                        
                        {(amount || item.method) && (
                          <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-[#8B5CF6] bg-[#8B5CF6]/10 px-2 py-0.5 rounded-md">{item.method || 'SYSTEM'}</span>
                            {amount && <span className="text-xs font-black text-[#00E57A]">{amount}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* NAVBAR */}
      <nav ref={navRef} className="w-full bg-[#0E1015]/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5 h-[80px] flex items-center shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="w-full px-4 lg:px-10 flex justify-between items-center relative">
          
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center gap-3 cursor-pointer group">
              <img src="/logo.png" alt="BinnyCash" className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" />
              <div className="flex flex-col justify-center">
                <span className="font-black text-xl md:text-2xl tracking-wide text-white leading-none">Binny<span className="text-[#8B5CF6]">Cash</span></span>
                <span className="text-[8px] md:text-[9px] text-[#00E57A] font-bold tracking-[0.2em] uppercase mt-1 drop-shadow-[0_0_5px_rgba(0,229,122,0.4)]">Play. Earn. Dominate.</span>
              </div>
            </Link>
          </div>

          {/* CENTER: Navigation Links */}
          {isLoggedIn && (
            <div className="hidden lg:flex items-center gap-6 xl:gap-8 mx-auto">
              {MAIN_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link key={link.name} href={link.href} className="relative group px-2 py-1">
                    <span className={`text-sm font-bold transition-colors duration-300 ${isActive ? 'text-white' : 'text-[#8F95A3] group-hover:text-white'}`}>
                      {link.name}
                    </span>
                    {isActive && (
                      <motion.div layoutId="nav-underline" className="absolute left-0 bottom-[-4px] w-full h-[3px] bg-gradient-to-r from-[#8B5CF6] to-[#00E57A] rounded-full shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <div id="google_translate_element" style={{ display: 'none' }}></div>
            
            <div className="relative">
              <button 
                onClick={() => setIsLangModalOpen(!isLangModalOpen)} 
                className="flex items-center gap-2 bg-[#1A1C24] hover:bg-[#252836] border border-white/5 px-3 py-2 md:py-2.5 rounded-xl transition-all cursor-pointer shadow-sm group"
              >
                <Globe className="w-4 h-4 text-[#8B5CF6] group-hover:animate-spin-slow" />
                <span className="hidden sm:inline text-white text-xs font-bold uppercase tracking-wider">{selectedLang.code.split('-')[0]}</span>
                <ChevronDown className={`w-3 h-3 text-[#8F95A3] transition-transform ${isLangModalOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isLangModalOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: 10, scale: 0.95 }} 
                    transition={{ duration: 0.2 }} 
                    className="absolute right-0 mt-3 w-[300px] md:w-[340px] bg-[#12151C]/95 backdrop-blur-xl border border-[#8B5CF6]/20 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-white/5 mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#8B5CF6]" />
                      <span className="text-white text-xs font-bold uppercase tracking-wider">Select Region</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 px-2 max-h-[300px] overflow-y-auto custom-scrollbar pb-2">
                      {LANGUAGES.map((lang) => (
                        <button 
                          key={lang.code} 
                          onClick={() => handleLanguageChange(lang)} 
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            selectedLang.code === lang.code 
                              ? 'bg-[#8B5CF6]/15 text-[#A855F7] border border-[#8B5CF6]/30' 
                              : 'text-[#8F95A3] hover:text-white hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <span className={`fi fi-${lang.tag} w-4 h-3 rounded-[2px] shadow-sm`}></span>
                          <span className="truncate">{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isLoggedIn ? (
              <div className="flex items-center gap-2 md:gap-3">
                
                {/* 1. BALANCE */}
                <div className="hidden lg:flex items-center justify-center gap-1.5 bg-[#2B164D] px-3.5 py-2 rounded-xl border border-[#A855F7]/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                  <span className="text-[#A855F7] font-black text-[17px] leading-none">
                    {isCoin ? 'C' : '$'}
                  </span>
                  <span className="text-white font-black text-[17px] leading-none tracking-tight">
                    {isCoin ? Number(balance) * 1000 : balance}
                  </span>
                </div>

                {/* 2. NOTIFICATION (Bell) */}
                <button 
                  onClick={() => setIsInboxOpen(true)}
                  className="relative w-10 h-10 rounded-xl bg-[#1A1C24] hover:bg-[#252836] flex items-center justify-center transition-colors cursor-pointer border border-white/5"
                >
                  <Bell className="w-[18px] h-[18px] text-[#8F95A3] fill-current" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#00E57A] rounded-full shadow-[0_0_10px_rgba(0,229,122,1)] animate-pulse"></span>
                  )}
                </button>

                {/* 3. CHAT (Green Dot) */}
                <button 
                  onClick={() => { setIsChatOpen(true); setUnreadChatCount(0); }}
                  className="relative w-10 h-10 rounded-xl bg-[#1A1C24] hover:bg-[#252836] flex items-center justify-center transition-colors cursor-pointer border border-white/5"
                >
                  <MessageSquare className="w-[18px] h-[18px] text-[#8F95A3] fill-current" />
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#00E57A] border-2 border-[#0E1015] rounded-full shadow-[0_0_8px_rgba(0,229,122,0.8)]"></span>
                </button>

                {/* 4. PROFILE (Premium UI Dropdown) */}
                <div className="relative">
                  <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2.5 bg-[#1A1C24] hover:bg-[#252836] pl-1.5 pr-3 py-1.5 rounded-xl transition-all cursor-pointer border border-white/5">
                    {userAvatar ? (
                      <img src={userAvatar} alt="Profile" className="w-8 h-8 rounded-full object-cover shadow-sm" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-black shadow-sm uppercase">
                        {userName.charAt(0)}
                      </div>
                    )}
                    <span className="text-[#8F95A3] text-sm font-bold max-w-[100px] truncate hidden md:block">
                      {userName}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#A855F7] font-bold" strokeWidth={3} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        exit={{ opacity: 0, y: 10, scale: 0.95 }} 
                        transition={{ duration: 0.2 }} 
                        className="absolute right-0 mt-4 w-[280px] bg-[#0E1015]/95 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-[0_15px_50px_rgba(139,92,246,0.15)] p-3 z-50 flex flex-col gap-2"
                      >
                        {/* Triangle Pointer */}
                        <div className="absolute -top-2 right-6 w-4 h-4 bg-[#0E1015] border-t border-l border-white/10 rotate-45" />

                        {/* Profile Item */}
                        <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="relative group flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-[#8B5CF6]/30 rounded-2xl p-3.5 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center border border-white/5 group-hover:border-[#8B5CF6]/50 transition-colors shadow-inner">
                              <User className="w-4 h-4 text-[#8F95A3] group-hover:text-[#A855F7] transition-colors" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-white text-[13px] font-bold">Profile</span>
                              <span className="text-[#8F95A3] text-[10px]">Manage your account</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#8F95A3] group-hover:text-white transition-colors" />
                        </Link>

                        {/* Help Item */}
                        <Link href="/support" onClick={() => setIsProfileOpen(false)} className="relative group flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-[#8B5CF6]/30 rounded-2xl p-3.5 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center border border-white/5 group-hover:border-[#8B5CF6]/50 transition-colors shadow-inner">
                              <HelpCircle className="w-4 h-4 text-[#8F95A3] group-hover:text-[#A855F7] transition-colors" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-white text-[13px] font-bold">Help</span>
                              <span className="text-[#8F95A3] text-[10px]">Get help & support</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#8F95A3] group-hover:text-white transition-colors" />
                        </Link>

                        {/* Custom Separator Line with Diamond */}
                        <div className="flex items-center justify-center py-1.5">
                          <div className="h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/40 to-transparent flex-1" />
                          <div className="w-1.5 h-1.5 rotate-45 bg-[#8B5CF6] mx-3 shadow-[0_0_8px_#8B5CF6]" />
                          <div className="h-px bg-gradient-to-r from-[#8B5CF6]/40 via-[#8B5CF6]/40 to-transparent flex-1" />
                        </div>

                        {/* 🔥 CUSTOM CURRENCY SWITCHER (ABOVE LOGOUT) 🔥 */}
                        <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 mb-1 transition-all hover:bg-white/[0.04]">
                          <span className="text-[14px] font-black text-white tracking-wide pl-2">
                            {currency.toUpperCase()}
                          </span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleCurrency(); }}
                            disabled={isCurrencySwitching}
                            className={`relative w-12 h-6 rounded-full border-2 transition-colors duration-300 ease-in-out flex items-center p-0.5 cursor-pointer bg-transparent ${isCoin ? 'border-[#8B5CF6]' : 'border-[#8B5CF6]/50'}`}
                          >
                            <motion.div 
                              layout
                              initial={false}
                              animate={{ x: isCoin ? 24 : 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className={`w-4 h-4 rounded-full flex items-center justify-center shadow-sm ${isCoin ? 'bg-[#8B5CF6]' : 'bg-[#8B5CF6]/50'}`}
                            >
                              {isCurrencySwitching && <Loader2 className="w-3 h-3 text-white animate-spin" />}
                            </motion.div>
                          </button>
                        </div>

                        {/* Logout Item (Red Theme) */}
                        <button onClick={() => { setIsProfileOpen(false); setShowLogoutConfirm(true); }} className="relative w-full group flex items-center justify-between bg-[#FF5D73]/5 hover:bg-[#FF5D73]/10 border border-[#FF5D73]/20 hover:border-[#FF5D73]/40 rounded-2xl p-3.5 transition-all text-left">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center border border-[#FF5D73]/20 group-hover:border-[#FF5D73]/50 transition-colors shadow-inner">
                              <LogOut className="w-4 h-4 text-[#FF5D73]" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[#FF5D73] text-[13px] font-bold">Logout</span>
                              <span className="text-[#8F95A3] text-[10px]">Sign out from your account</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#FF5D73] opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </button>
                        
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 md:gap-3">
                <button onClick={openLogin} className="text-xs md:text-sm font-bold text-white hover:text-[#8B5CF6] transition-colors cursor-pointer">Login</button>
                <button onClick={openRegister} className="text-xs md:text-sm font-bold text-white bg-[#8B5CF6] hover:bg-[#7c3aed] px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer">Sign Up</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* THE CHAT DRAWER */}
      {isLoggedIn && (
        <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      {isLoggedIn && (
        <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[#111319]/90 backdrop-blur-xl border-t border-white/5 z-50 flex items-center justify-between px-2 pb-safe pt-2 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <Link href="/dashboard" className="flex flex-col items-center w-[16.6%] h-14">
            <Rocket className={`w-5 h-5 mb-1 ${pathname === '/dashboard' ? 'text-[#8B5CF6]' : 'text-[#8F95A3]'}`} />
            <span className={`text-[10px] font-bold ${pathname === '/dashboard' ? 'text-white' : 'text-[#8F95A3]'}`}>Earn</span>
          </Link>
          <Link href="/myoffers" className="flex flex-col items-center w-[16.6%] h-14">
            <Trophy className={`w-5 h-5 mb-1 ${pathname === '/myoffers' ? 'text-[#8B5CF6]' : 'text-[#8F95A3]'}`} />
            <span className={`text-[10px] font-bold ${pathname === '/myoffers' ? 'text-white' : 'text-[#8F95A3]'}`}>Offers</span>
          </Link>
          <Link href="/affiliate" className="flex flex-col items-center w-[16.6%] h-14">
            <Users className={`w-5 h-5 mb-1 ${pathname === '/affiliate' ? 'text-[#8B5CF6]' : 'text-[#8F95A3]'}`} />
            <span className={`text-[10px] font-bold ${pathname === '/affiliate' ? 'text-white' : 'text-[#8F95A3]'}`}>Affiliate</span>
          </Link>
          <Link href="/leaderboard" className="flex flex-col items-center w-[16.6%] h-14">
            <BarChart3 className={`w-5 h-5 mb-1 ${pathname === '/leaderboard' ? 'text-[#8B5CF6]' : 'text-[#8F95A3]'}`} />
            <span className={`text-[10px] font-bold ${pathname === '/leaderboard' ? 'text-white' : 'text-[#8F95A3]'}`}>Leaders</span>
          </Link>
          <Link href="/cashout" className="flex flex-col items-center w-[16.6%] h-14">
            <Wallet className={`w-5 h-5 mb-1 ${pathname === '/cashout' ? 'text-[#8B5CF6]' : 'text-[#8F95A3]'}`} />
            <span className={`text-[10px] font-bold ${pathname === '/cashout' ? 'text-white' : 'text-[#8F95A3]'}`}>Cashout</span>
          </Link>
          <Link href="/rewards" className="flex flex-col items-center w-[16.6%] h-14">
            <Gift className={`w-5 h-5 mb-1 ${pathname === '/rewards' ? 'text-[#8B5CF6]' : 'text-[#8F95A3]'}`} />
            <span className={`text-[10px] font-bold ${pathname === '/rewards' ? 'text-white' : 'text-[#8F95A3]'}`}>Rewards</span>
          </Link>
        </div>
      )}
    </>
  );
}