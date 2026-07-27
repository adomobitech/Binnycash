'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { 
  Bell, Rocket, Trophy, Wallet, ChevronDown, User, 
  LogOut, MessageSquare, ShieldCheck, HelpCircle, Gift, BarChart3, Users, X, CheckCheck, Loader2
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
  { code: 'en', name: 'English', tag: 'us', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', tag: 'in', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', tag: 'bd', flag: '🇧🇩' },
  { code: 'es', name: 'Spanish', tag: 'es', flag: '🇪🇸' },
  { code: 'fr', name: 'French', tag: 'fr', flag: '🇫🇷' },
  { code: 'de', name: 'German', tag: 'de', flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic', tag: 'sa', flag: '🇸🇦' }
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

  // Currency Switch States
  const [currency, setCurrency] = useState('Usd');
  const [isCurrencySwitching, setIsCurrencySwitching] = useState(false);

  // Inbox & Notification States
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isInboxLoading, setIsInboxLoading] = useState(false);

  // Chat Drawer State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const navRef = useRef<HTMLElement>(null);

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
    
    // Set initial currency from localStorage on mount so UI doesn't lag
    if (typeof window !== 'undefined') {
      const savedCurrency = localStorage.getItem('currency');
      if (savedCurrency) setCurrency(savedCurrency);
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

        fetch('https://apitest.binnycash.com/api/user/notificationList', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data?.data?.unreadCount !== undefined) {
              setUnreadCount(data.data.unreadCount);
            }
          })
          .catch(err => console.error("Notification count error:", err));

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
            if (display) {
              setUserName(display);
            }
            const rawPic = user.image || user.profilePic;
            if (rawPic) {
              setUserAvatar(resolveImage(rawPic));
            }
            // 🔥 Setup Currency Globally on Load
            if (user.currency) {
              const apiCurrency = user.currency.toLowerCase() === 'coin' ? 'Coin' : 'Usd';
              setCurrency(apiCurrency);
              localStorage.setItem('currency', apiCurrency);
              window.dispatchEvent(new CustomEvent('currencyChanged', { detail: apiCurrency }));
            }
         }
      })
      .catch(err => console.error("Profile fetch error:", err));
    }
  }, [isLoggedIn]);

  // 🔥 GLOBAL CURRENCY TOGGLE API LOGIC
  const toggleCurrency = async () => {
    if (isCurrencySwitching) return;
    
    const newCurrency = currency === 'Usd' ? 'Coin' : 'Usd';
    setIsCurrencySwitching(true);

    try {
      const token = localStorage.getItem('token');
      const currentUserId = trueUserId || getUserId() || localStorage.getItem('userId'); 
      
      if (!currentUserId) {
        console.error("User ID is missing! Cannot update currency.");
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
        // 🔥 UPDATE GLOBALLY ON SUCCESS
        setCurrency(newCurrency);
        localStorage.setItem('currency', newCurrency);
        window.dispatchEvent(new CustomEvent('currencyChanged', { detail: newCurrency }));
      } else {
        console.error("Failed to update currency:", json.message);
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
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsInboxOpen(false)}
              className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm" 
            />
            
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }} 
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
              <button onClick={() => setIsLangModalOpen(!isLangModalOpen)} className="flex items-center gap-1.5 md:gap-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-all px-2.5 md:px-3 py-2 rounded-xl text-white text-xs font-bold backdrop-blur-md cursor-pointer">
                <span className={`fi fi-${selectedLang.tag} w-4 h-3 rounded-[2px] shadow-sm`}></span>
                <span className="hidden sm:inline uppercase">{selectedLang.code}</span>
                <ChevronDown className="w-3 h-3 text-[#8F95A3]" />
              </button>

              <AnimatePresence>
                {isLangModalOpen && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute right-0 mt-3 w-48 bg-[#1A1C24]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                    {LANGUAGES.map((lang) => (
                      <button key={lang.code} onClick={() => handleLanguageChange(lang)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-[#8F95A3] hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer">
                        <span className={`fi fi-${lang.tag} w-5 h-3.5 rounded-[2px] shadow-sm`}></span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isLoggedIn ? (
              <div className="flex items-center gap-2 md:gap-4">
                
                <button 
                  onClick={() => {
                    setIsChatOpen(true);
                    setUnreadChatCount(0);
                  }}
                  className="relative w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors group cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-[#8F95A3] group-hover:text-white transition-colors" />
                  {unreadChatCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#00E57A] rounded-full shadow-[0_0_10px_rgba(0,229,122,1)] animate-pulse"></span>
                  )}
                </button>

                <button 
                  onClick={() => setIsInboxOpen(true)}
                  className="relative w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors group cursor-pointer"
                >
                  <motion.div animate={{ rotate: [0, -15, 15, -15, 15, 0] }} transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.5 }}>
                    <Bell className="w-4 h-4 md:w-5 md:h-5 text-[#8F95A3] group-hover:text-white transition-colors" />
                  </motion.div>
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#00E57A] rounded-full shadow-[0_0_10px_rgba(0,229,122,1)] animate-pulse"></span>
                  )}
                </button>

                <div className="hidden lg:flex items-center gap-3 bg-gradient-to-r from-white/5 to-white/10 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md shadow-inner">
                  <Wallet className="w-4 h-4 text-[#8B5CF6]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#8F95A3] font-bold uppercase leading-tight">Balance</span>
                    <span className="text-sm font-black text-white leading-tight">${balance}</span>
                  </div>
                </div>

                <div className="relative">
                  <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 bg-gradient-to-br from-[#8B5CF6] to-[#7c3aed] p-1 pr-2 md:pr-3 rounded-full hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all cursor-pointer">
                    {userAvatar ? (
                      <img src={userAvatar} alt="Profile" className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover border-2 border-[#8B5CF6] shadow-sm" />
                    ) : (
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs md:text-sm font-black shadow-sm uppercase">
                        {userName.charAt(0)}
                      </div>
                    )}
                    <span className="text-white text-xs font-bold max-w-[90px] truncate hidden md:block">
                      {userName}
                    </span>
                    <ChevronDown className="w-3 h-3 text-white/70" />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute right-0 mt-4 w-52 bg-[#1A1C24]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] py-3 z-50">
                        <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="w-full flex items-center gap-3 px-5 py-2.5 text-[15px] font-bold text-[#8F95A3] hover:text-white transition-colors">
                          <User className="w-5 h-5" /> Profile
                        </Link>
                        
                        {/* 🔥 LINK CHANGED TO /account 🔥 */}
                        <Link href="/account" onClick={() => setIsProfileOpen(false)} className="w-full flex items-center gap-3 px-5 py-2.5 text-[15px] font-bold text-[#8F95A3] hover:text-white transition-colors">
                          <ShieldCheck className="w-5 h-5" /> Account Status
                        </Link>
                        
                        <Link href="/support" onClick={() => setIsProfileOpen(false)} className="w-full flex items-center gap-3 px-5 py-2.5 text-[15px] font-bold text-[#8F95A3] hover:text-white transition-colors">
                          <HelpCircle className="w-5 h-5" /> Help
                        </Link>

                        <button onClick={() => { setIsProfileOpen(false); setShowLogoutConfirm(true); }} className="w-full flex items-center gap-3 px-5 py-2.5 text-[15px] font-bold text-[#8F95A3] hover:text-white transition-colors cursor-pointer">
                          <LogOut className="w-5 h-5" /> Logout
                        </button>

                        <div className="my-2 mx-5 border-t-2 border-[#a855f7]"></div>

                        <div className="w-full flex items-center justify-center gap-4 px-5 py-2">
                          <span className="text-base font-black text-white tracking-wide">
                            {currency.toUpperCase()}
                          </span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleCurrency(); }}
                            disabled={isCurrencySwitching}
                            className="relative w-12 h-6 rounded-full border-2 border-[#a855f7] flex items-center p-0.5 cursor-pointer bg-transparent"
                          >
                            <motion.div 
                              layout
                              initial={false}
                              animate={{
                                x: currency === 'Coin' || currency === 'COIN' ? 24 : 0,
                              }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="w-4 h-4 rounded-full bg-[#a855f7] flex items-center justify-center"
                            >
                              {isCurrencySwitching && <Loader2 className="w-3 h-3 text-white animate-spin" />}
                            </motion.div>
                          </button>
                        </div>
                        
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