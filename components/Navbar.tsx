'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { useTranslation } from './LanguageContext';
import { 
  Bell, Rocket, Trophy, Wallet, ChevronDown, User, 
  LogOut, MessageSquare, HelpCircle, Gift, 
  Users, X, Loader2, Globe, ChevronRight,
  ShieldCheck, Menu, ClipboardCheck, Flame, PlaySquare,
  History, Settings, Lock
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import "flag-icons/css/flag-icons.min.css";
import ChatDrawer from '@/components/chat/ChatDrawer';

const getDynamicColor = (name: string) => {
  const colors = [
    'bg-[#8B5CF6]', 'bg-[#3B82F6]', 'bg-[#EC4899]', 
    'bg-[#10B981]', 'bg-[#F59E0B]', 'bg-[#EF4444]', 'bg-[#6366F1]'
  ];
  if (!name || name === 'Profile') return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

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
  { code: 'ko', name: 'Korean', tag: 'kr' }
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { openLogin, openRegister } = useAuth();
  
  const { locale, t, changeLanguage } = useTranslation();
  
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  
  const [balance, setBalance] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('cached_balance') || '0.00';
    return '0.00';
  });
  
  const [userName, setUserName] = useState('Profile');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [trueUserId, setTrueUserId] = useState<string>('');

  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isInboxLoading, setIsInboxLoading] = useState(false);
  const [hasFetchedAlerts, setHasFetchedAlerts] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // 🔥 FIXED: Added the unreadChatCount state back to fix the compilation error 🔥
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const isProfileFetching = useRef<boolean>(false);
  const lastProfileFetchRef = useRef<number>(0);

  const MAIN_LINKS = [
    { name: t.Navbar?.links?.earn || 'Earn', href: '/dashboard', icon: Rocket },
    { name: t.Navbar?.links?.myOffers || 'My Offers', href: '/myoffers', icon: PlaySquare },
    { name: t.Navbar?.links?.affiliate || 'Affiliate', href: '/affiliate', icon: Users },
    { name: t.Navbar?.links?.leaderboard || 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: t.Navbar?.links?.rewards || 'Rewards', href: '/rewards', icon: Gift },
  ];

  useEffect(() => {
    const syncAuthState = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(token && token !== 'undefined' && !token.includes('[object Object]') ? true : false);
    };
    syncAuthState();
    window.addEventListener('storage', syncAuthState);
    window.addEventListener('profileUpdated', syncAuthState);
    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('profileUpdated', syncAuthState);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && pathname === '/') {
      setIsRouting(true);
      router.replace('/dashboard'); 
    } else {
      setIsRouting(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    const currentLangObj = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0];
    setSelectedLang(currentLangObj);
    setIsMobileMenuOpen(false);
  }, [locale]);

  const handleLanguageChange = (lang: any) => {
    setSelectedLang(lang);
    setIsLangModalOpen(false);
    changeLanguage(lang.code);
  };

  const handleForceLogout = () => {
    if (pathname?.startsWith('/v9') || pathname?.startsWith('/admin')) return; 
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userDetails');
    localStorage.removeItem('cached_balance');
    setIsLoggedIn(false);
    if (pathname !== '/') router.replace('/');
  };

  useEffect(() => {
    let isMounted = true;
    let isFetching = false;
    const fetchWalletBalance = async () => {
      if (typeof window === 'undefined' || window.location.pathname.startsWith('/v9')) return;
      const token = localStorage.getItem('token');
      if (!token || token === 'undefined' || token.includes('[object Object]')) {
        if (isMounted) setIsLoggedIn(false);
        return;
      }
      if (isMounted) setIsLoggedIn(true);
      if (isFetching) return;
      isFetching = true;

      try {
        const res = await fetch(`https://api.binnycash.com/api/user/balance/total-amount?t=${Date.now()}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-store' 
        });
        if (!res.ok) throw new Error();
        const text = await res.text();
        if (!text || text.trim().startsWith('<')) throw new Error();
        const data = JSON.parse(text);
        if (isMounted && data && data.data !== undefined) {
          const liveBalance = Number(data.data).toFixed(2);
          setBalance(liveBalance);
          localStorage.setItem('cached_balance', liveBalance);
        }
      } catch (err) {
         if (isMounted) { setBalance('0.00'); localStorage.setItem('cached_balance', '0.00'); }
      } finally { isFetching = false; }
    };

    if (isLoggedIn) {
      fetchWalletBalance();
      window.addEventListener('walletUpdated', fetchWalletBalance);
      window.addEventListener('focus', fetchWalletBalance);
      return () => {
        isMounted = false;
        window.removeEventListener('walletUpdated', fetchWalletBalance);
        window.removeEventListener('focus', fetchWalletBalance);
      };
    }
  }, [isLoggedIn]);

  const resolveImage = (imgSrc: string | null | undefined) => {
    if (!imgSrc || imgSrc === 'null' || imgSrc === 'undefined' || imgSrc.trim() === '') return null;
    if (imgSrc.startsWith('http')) return imgSrc;
    return `https://api.binnycash.com${imgSrc.startsWith('/') ? imgSrc : `/${imgSrc}`}`;
  };

  const fetchUserData = async (forceFetch = false) => {
    if (pathname?.startsWith('/v9') || pathname?.startsWith('/admin')) return;
    const token = localStorage.getItem('token');
    if (!token || token.includes('[object Object]')) return;

    const processUser = (user: any) => {
       if (!user) return false;
       if (user.id || user._id) setTrueUserId(String(user.id || user._id));
       let display = user.userName || user.username || user.firstName;
       if (!display && user.email) display = user.email.split('@')[0];
       if (display) setUserName(display);
       const rawPic = user.image || user.profilePic || user.picture || user.avatar;
       if (rawPic) { setUserAvatar(resolveImage(rawPic)); setImageError(false); } 
       else { setUserAvatar(null); }
       return true;
    };

    if (!forceFetch) {
       try {
          const raw = localStorage.getItem('userDetails') || localStorage.getItem('loginResponse') || localStorage.getItem('user');
          if (raw) {
             const parsed = JSON.parse(raw);
             const user = parsed?.data?.user || parsed?.data?.userDetails || parsed?.data || parsed?.userDetails || parsed;
             if (user && (user.userName || user.email || user.firstName)) { processUser(user); return; }
          }
       } catch(e) {}
    }

    const now = Date.now();
    if (isProfileFetching.current || (now - lastProfileFetchRef.current < 2000)) return;
    isProfileFetching.current = true;
    lastProfileFetchRef.current = now;

    try {
      const res = await fetch('https://api.binnycash.com/api/user/userDetails', { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) return;
      const text = await res.text();
      if (!text || text.trim().startsWith('<')) return;
      const data = JSON.parse(text);
      if (data) {
         const user = data?.data?.user || data?.data || data?.userDetails || data;
         if (user) { processUser(user); localStorage.setItem('userDetails', JSON.stringify(data)); }
      }
    } catch (err) {} finally { isProfileFetching.current = false; }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserData(false);
      const handleProfileUpdate = () => fetchUserData(true);
      window.addEventListener('profileUpdated', handleProfileUpdate);
      return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
    }
  }, [isLoggedIn]);

  const fetchInboxMessages = async () => {
    if (pathname?.startsWith('/v9') || pathname?.startsWith('/admin')) return;
    setIsInboxLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token || token.includes('[object Object]')) return;
      const res = await fetch('https://api.binnycash.com/api/user/userAlertList', { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) { setIsInboxLoading(false); return; }
      const text = await res.text();
      let data: any = {};
      if (text && !text.trim().startsWith('<')) try { data = JSON.parse(text); } catch (e) {}
      let alertsList = data?.data?.userAlerts || [];
      if (!Array.isArray(alertsList)) alertsList = [];
      setInboxMessages(alertsList);
      if (data?.data?.unreadCount !== undefined) setUnreadCount(data.data.unreadCount);
    } catch (err) {} finally { setIsInboxLoading(false); }
  };

  const handleToggleInbox = () => {
    if (!isInboxOpen) { fetchInboxMessages(); setIsInboxOpen(true); } 
    else setIsInboxOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = trueUserId || getUserId();
      const res = await fetch(`https://api.binnycash.com/api/user/markAllRead?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        setUnreadCount(0);
        setInboxMessages(prev => prev.map(item => ({ ...item, isRead: true })));
      }
    } catch (err) {}
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false); setIsLangModalOpen(false); setIsInboxOpen(false); 
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false); setIsTransitioning(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('https://api.binnycash.com/api/user/logout', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {} 
    finally { handleForceLogout(); setTimeout(() => setIsTransitioning(false), 1000); }
  };

  if (pathname && (pathname.startsWith('/v9') || pathname.startsWith('/admin'))) return null;

  return (
    <>
      <AnimatePresence>
        {isTransitioning && (
          <motion.div key="transitioning-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#070913] overflow-hidden font-sans">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#8B5CF6]/15 blur-[120px] rounded-full pointer-events-none" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative flex flex-col items-center z-10">
               <div className="relative flex items-center justify-center mb-10 mt-[-50px]">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute w-32 h-32 rounded-full border-2 border-transparent border-t-[#8B5CF6] border-r-[#8B5CF6] opacity-80" />
                  <div className="w-20 h-20 bg-[#120F1A] border border-[#8B5CF6]/30 rounded-[20px] flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.2)] z-10 relative overflow-hidden backdrop-blur-xl">
                     <img src="/logo.png" alt="BinnyCash Logo" className="w-10 h-10 object-contain z-10" />
                  </div>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring", stiffness: 200 }} className="absolute -bottom-2 -right-2 bg-[#00E57A] w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#070913] z-20 shadow-[0_0_15px_rgba(0,229,122,0.4)]">
                    <Lock className="w-3.5 h-3.5 text-black" strokeWidth={3} />
                  </motion.div>
               </div>
               <motion.h2 animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="text-2xl font-black text-white tracking-wide mb-3">
                 Logging out securely...
               </motion.h2>
               <p className="text-[#8F95A3] text-sm font-medium flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-[#00E57A]" /> Clearing your session data
               </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRouting && (
          <motion.div key="routing-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#070913] overflow-hidden font-sans">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#8B5CF6]/15 blur-[120px] rounded-full pointer-events-none" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative flex flex-col items-center z-10">
               <div className="relative flex items-center justify-center mb-10 mt-[-50px]">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute w-32 h-32 rounded-full border-2 border-transparent border-t-[#8B5CF6] border-r-[#8B5CF6] opacity-80" />
                  <motion.div animate={{ rotate: -360 }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} className="absolute w-36 h-36 rounded-full border border-dashed border-white/10" />
                  <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="absolute w-24 h-24 rounded-full bg-[#00E57A]/30 blur-md" />
                  <div className="w-20 h-20 bg-[#120F1A] border border-[#8B5CF6]/30 rounded-[20px] flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.2)] z-10 relative overflow-hidden backdrop-blur-xl">
                     <img src="/logo.png" alt="BinnyCash Logo" className="w-10 h-10 object-contain z-10" />
                     <motion.div animate={{ x: ['-150%', '250%'] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }} className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
                  </div>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring", stiffness: 200 }} className="absolute -bottom-2 -right-2 bg-[#8B5CF6] w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#070913] z-20 shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                    <Rocket className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </motion.div>
               </div>
               <motion.h2 animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="text-2xl font-black text-white tracking-wide mb-3">
                 Entering Dashboard...
               </motion.h2>
               <p className="text-[#8F95A3] text-sm font-medium flex items-center gap-2">
                 <Loader2 className="w-4 h-4 text-[#8B5CF6] animate-spin" /> Preparing your workspace
               </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div key="logout-confirm-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[#111315] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
              <h3 className="text-white text-lg font-black mb-2 mt-4">Are you sure?</h3>
              <p className="text-[#8F95A3] text-sm mb-6">You will be logged out of your session.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors">Cancel</button>
                <button onClick={handleLogoutConfirm} className="flex-1 py-3 rounded-xl bg-[#FF5D73] hover:bg-[#ff405b] text-white font-bold shadow-[0_0_15px_rgba(255,93,115,0.3)] transition-colors">Yes, Logout</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR (Visible on lg and above) */}
      {/* ========================================================================= */}
      {isLoggedIn && (
        <aside ref={navRef} className="hidden lg:flex fixed top-0 left-0 w-[260px] h-screen bg-[#0E1015]/95 backdrop-blur-3xl border-r border-white/5 flex-col z-[50] shadow-[10px_0_30px_rgba(0,0,0,0.3)]">
          
          {/* Logo Area */}
          <div className="h-[90px] px-8 flex items-center shrink-0 border-b border-white/[0.02]">
            <Link href="/" className="flex items-center gap-3 cursor-pointer group">
              <img src="/logo.png" alt="BinnyCash" className="h-10 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]" />
              <div className="flex flex-col justify-center">
                <span className="font-black text-2xl tracking-wide text-white leading-none">Binny<span className="text-[#8B5CF6]">Cash</span></span>
                <span className="text-[8px] text-[#00E57A] font-bold tracking-[0.2em] uppercase mt-1 drop-shadow-[0_0_5px_rgba(0,229,122,0.4)]">Play. Earn. Dominate.</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
            {MAIN_LINKS.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link key={link.name} href={link.href} className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative overflow-hidden ${isActive ? 'bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 shadow-[0_4px_20px_rgba(139,92,246,0.1)]' : 'hover:bg-white/5 border border-transparent'}`}>
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8B5CF6] rounded-r-full shadow-[0_0_10px_#8B5CF6]" />}
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#A855F7]' : 'text-[#8F95A3] group-hover:text-white'}`} />
                  <span className={`text-[14px] font-bold tracking-wide transition-colors ${isActive ? 'text-white' : 'text-[#8F95A3] group-hover:text-white'}`}>
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Bottom Section: Balance & Profile */}
          <div className="p-5 mt-auto flex flex-col gap-4 border-t border-white/5 relative bg-gradient-to-t from-black/40 to-transparent">
            
            {/* Balance Widget */}
            <div className="bg-gradient-to-br from-[#1A1C24] to-[#12141A] border border-white/5 rounded-2xl p-4 flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors">
               <div className="absolute -right-6 -top-6 w-20 h-20 bg-[#00E57A]/10 rounded-full blur-[20px] pointer-events-none" />
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Balance</span>
               <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 flex items-center gap-1 mb-3">
                 <span className="text-[#00E57A]">$</span>{balance}
               </span>
               <Link href="/cashout" className="w-full bg-[#00E57A]/10 hover:bg-[#00E57A]/20 text-[#00E57A] border border-[#00E57A]/30 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,229,122,0.1)] hover:shadow-[0_0_20px_rgba(0,229,122,0.2)]">
                 <Wallet className="w-4 h-4" /> Withdraw Funds
               </Link>
            </div>

            {/* Notifications Row */}
            <div className="relative">
               <button onClick={handleToggleInbox} className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors border ${isInboxOpen ? 'bg-white/10 border-white/10' : 'hover:bg-white/5 border-transparent text-[#8F95A3] hover:text-white'}`}>
                 <div className="flex items-center gap-3">
                   <div className="relative">
                     <Bell className={`w-5 h-5 ${isInboxOpen ? 'text-white' : 'text-[#8F95A3]'}`} />
                     {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#00E57A] rounded-full shadow-[0_0_10px_rgba(0,229,122,1)] animate-pulse" />}
                   </div>
                   <span className={`text-sm font-bold ${isInboxOpen ? 'text-white' : ''}`}>Notifications</span>
                 </div>
                 {unreadCount > 0 && <span className="bg-[#00E57A]/20 text-[#00E57A] text-[10px] font-black px-2 py-0.5 rounded-md border border-[#00E57A]/30">{unreadCount} New</span>}
               </button>

               <AnimatePresence>
                 {isInboxOpen && (
                   <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="absolute left-[105%] bottom-0 w-[340px] bg-[#0E1015]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[20px_20px_60px_rgba(0,0,0,0.8)] z-50 overflow-hidden flex flex-col">
                     <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                       <h3 className="text-white font-bold text-[15px]">Notifications</h3>
                       <div className="flex items-center gap-3">
                          {inboxMessages.length > 0 && <button onClick={handleMarkAllAsRead} className="text-[#8F95A3] hover:text-white text-[11px] font-bold transition-colors">Mark all read</button>}
                          <button onClick={() => setIsInboxOpen(false)} className="text-[#8F95A3] hover:text-white"><X className="w-4 h-4" /></button>
                       </div>
                     </div>
                     <div className="p-3 max-h-[380px] overflow-y-auto custom-scrollbar">
                       {isInboxLoading ? (
                         <div className="py-10 flex justify-center"><Loader2 className="w-5 h-5 text-white/50 animate-spin" /></div>
                       ) : inboxMessages.length === 0 ? (
                         <div className="py-10 text-center text-[#8F95A3] text-xs font-medium">No new notifications</div>
                       ) : (
                         <div className="space-y-2">
                           {inboxMessages.map((item, idx) => (
                             <div key={item._id || idx} className={`border rounded-xl p-3 flex flex-col gap-1.5 ${item.isRead ? 'bg-white/5 border-transparent' : 'bg-[#8B5CF6]/10 border-[#8B5CF6]/20'}`}>
                               <div className="flex justify-between items-start">
                                 <h4 className={`text-[13px] font-bold ${item.isRead ? 'text-gray-300' : 'text-[#A855F7]'}`}>{item.title || 'Alert'}</h4>
                                 <span className="text-gray-500 text-[10px] whitespace-nowrap ml-2">{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                               </div>
                               <p className="text-gray-400 text-[11px] leading-relaxed">{item.message}</p>
                             </div>
                           ))}
                         </div>
                       )}
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            {/* Profile Dropdown Row */}
            <div className="relative group">
               <button onClick={() => setIsProfileOpen(!isProfileOpen)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors border ${isProfileOpen ? 'bg-white/10 border-white/10' : 'hover:bg-white/5 border-transparent'}`}>
                  {userAvatar && !imageError ? (
                    <img src={userAvatar} alt="Profile" referrerPolicy="no-referrer" crossOrigin="anonymous" className="w-10 h-10 rounded-xl object-cover shadow-sm border border-white/10" onError={() => setImageError(true)} />
                  ) : (
                    <div className={`w-10 h-10 rounded-xl ${getDynamicColor(userName)} flex items-center justify-center text-white text-[15px] font-black shadow-sm uppercase border border-white/10`}>
                      {userName ? userName.charAt(0) : '?'}
                    </div>
                  )}
                  <div className="flex flex-col text-left flex-1 overflow-hidden">
                    <span className="text-sm font-bold text-white truncate">{userName}</span>
                    <span className="text-[10px] text-[#8F95A3] font-mono truncate">ID: {trueUserId || getUserId()}</span>
                  </div>
                  <Settings className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-90 text-white' : 'text-[#8F95A3]'}`} />
               </button>

               <AnimatePresence>
                 {isProfileOpen && (
                   <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="absolute left-[105%] bottom-0 w-[260px] bg-[#0E1015]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[20px_20px_60px_rgba(0,0,0,0.8)] z-50 p-2 flex flex-col gap-1">
                     <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors group">
                       <User className="w-4 h-4 text-[#8F95A3] group-hover:text-white" />
                       <span className="text-sm font-medium text-gray-300 group-hover:text-white">Profile Details</span>
                     </Link>
                     <Link href="/transactions" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors group">
                       <History className="w-4 h-4 text-[#8F95A3] group-hover:text-white" />
                       <span className="text-sm font-medium text-gray-300 group-hover:text-white">Transactions</span>
                     </Link>
                     <Link href="/support" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors group">
                       <HelpCircle className="w-4 h-4 text-[#8F95A3] group-hover:text-white" />
                       <span className="text-sm font-medium text-gray-300 group-hover:text-white">Help & Support</span>
                     </Link>
                     <div className="h-px bg-white/5 my-1 mx-2" />
                     <button onClick={() => { setIsProfileOpen(false); setShowLogoutConfirm(true); }} className="flex items-center gap-3 p-3 hover:bg-[#FF5D73]/10 rounded-xl transition-colors group w-full text-left">
                       <LogOut className="w-4 h-4 text-[#FF5D73]" />
                       <span className="text-sm font-bold text-[#FF5D73]">Sign Out</span>
                     </button>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </div>
        </aside>
      )}

      {/* ========================================================================= */}
      {/* PUBLIC TOP NAVIGATION (Visible only when logged out or on mobile) */}
      {/* ========================================================================= */}
      {(!isLoggedIn || pathname === '/') && (
        <nav className="w-full bg-[#0E1015]/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5 h-[70px] md:h-[80px] flex items-center shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="w-full px-4 lg:px-10 h-full flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 md:gap-3 cursor-pointer group">
              <img src="/logo.png" alt="BinnyCash" className="h-8 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" />
              <div className="flex flex-col justify-center">
                <span className="font-black text-lg md:text-2xl tracking-wide text-white leading-none">Binny<span className="text-[#8B5CF6]">Cash</span></span>
                <span className="text-[7px] md:text-[9px] text-[#00E57A] font-bold tracking-[0.2em] uppercase mt-1 drop-shadow-[0_0_5px_rgba(0,229,122,0.4)] hidden md:block">Play. Earn. Dominate.</span>
              </div>
            </Link>

            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              <div className="relative">
                <button onClick={() => setIsLangModalOpen(!isLangModalOpen)} className="flex items-center gap-2 bg-[#1A1C24] hover:bg-[#252836] border border-white/5 px-2 md:px-3 py-1.5 md:py-2.5 rounded-xl transition-all cursor-pointer shadow-sm group">
                  <Globe className="w-4 h-4 text-[#8B5CF6] group-hover:animate-spin-slow" />
                  <span className="hidden sm:inline text-white text-[11px] md:text-xs font-bold uppercase tracking-wider">{selectedLang.code.split('-')[0]}</span>
                  <ChevronDown className={`w-3 h-3 text-[#8F95A3] transition-transform hidden sm:block ${isLangModalOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isLangModalOpen && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-3 w-[260px] md:w-[340px] bg-[#12151C]/95 backdrop-blur-xl border border-[#8B5CF6]/20 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] py-2 z-50 overflow-hidden">
                      <div className="px-4 py-2 border-b border-white/5 mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#8B5CF6]" />
                        <span className="text-white text-xs font-bold uppercase tracking-wider">{t.Navbar?.selectRegion || 'SELECT REGION'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 px-2 max-h-[300px] overflow-y-auto custom-scrollbar pb-2">
                        {LANGUAGES.map((lang) => (
                          <button key={lang.code} onClick={() => handleLanguageChange(lang)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${selectedLang.code === lang.code ? 'bg-[#8B5CF6]/15 text-[#A855F7] border border-[#8B5CF6]/30' : 'text-[#8F95A3] hover:text-white hover:bg-white/5 border border-transparent'}`}>
                            <span className={`fi fi-${lang.tag} w-4 h-3 rounded-[2px] shadow-sm`}></span>
                            <span className="truncate">{lang.name}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <button onClick={openLogin} className="text-xs md:text-sm font-bold text-white hover:text-[#8B5CF6] transition-colors cursor-pointer">{t.Navbar?.login || 'Login'}</button>
                <button onClick={openRegister} className="text-xs md:text-sm font-bold text-white bg-[#8B5CF6] hover:bg-[#7c3aed] px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer">{t.Navbar?.signup || 'Sign Up'}</button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* ========================================================================= */}
      {/* MOBILE TOP NAV (Visible only on Mobile when logged in) */}
      {/* ========================================================================= */}
      {isLoggedIn && pathname !== '/' && (
        <nav className="lg:hidden w-full bg-[#0E1015]/90 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5 h-[70px] flex items-center shadow-[0_4px_30px_rgba(0,0,0,0.5)] px-4 justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="BinnyCash" className="h-8 w-auto object-contain" />
            <span className="font-black text-lg text-white leading-none">Binny<span className="text-[#8B5CF6]">Cash</span></span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center gap-1 bg-[#2B164D] px-2.5 py-1.5 rounded-lg border border-[#A855F7]/20">
              <span className="text-[#A855F7] font-black text-xs">$</span>
              <span className="text-white font-black text-xs">{balance}</span>
            </div>
            
            <button onClick={() => setIsMobileMenuOpen(true)} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              {userAvatar && !imageError ? (
                <img src={userAvatar} alt="Profile" className="w-full h-full rounded-xl object-cover" onError={() => setImageError(true)} />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </nav>
      )}

      {/* CHAT FLOATING BUTTON */}
      {isLoggedIn && pathname && !pathname.startsWith('/admin') && (
        <div className="fixed bottom-[85px] lg:bottom-8 right-4 lg:right-8 z-[90]">
          <button 
            onClick={() => { setIsChatOpen(true); setUnreadChatCount(0); }}
            className="relative w-[50px] h-[50px] lg:w-[60px] lg:h-[60px] rounded-full bg-[#A855F7] flex items-center justify-center shadow-[0_10px_30px_rgba(168,85,247,0.3)] hover:scale-105 transition-all cursor-pointer"
          >
            <MessageSquare className="w-6 h-6 lg:w-7 lg:h-7 text-white" strokeWidth={2.2} />
            {unreadChatCount > 0 && (
              <span className="absolute top-[2px] right-[2px] w-4 h-4 bg-[#00E57A] border-[3px] border-[#0E1015] rounded-full"></span>
            )}
          </button>
        </div>
      )}

      {isLoggedIn && <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />}

      {/* 🔥 5-ITEM MOBILE BOTTOM NAVIGATION 🔥 */}
      {isLoggedIn && (
        <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[#0E111E]/95 backdrop-blur-xl border-t border-white/10 z-50 flex items-center justify-around px-1 py-2 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)] h-[65px]">
          <Link href="/myoffers" className="flex flex-col items-center gap-1 p-2 w-[20%]">
            <PlaySquare className={`w-5 h-5 ${pathname === '/myoffers' ? 'text-[#A66CFF]' : 'text-[#8D89A8]'}`} />
            <span className={`text-[9px] font-bold ${pathname === '/myoffers' ? 'text-[#A66CFF]' : 'text-[#8D89A8]'}`}>Offers</span>
          </Link>
          
          <Link href="/cashout" className="flex flex-col items-center gap-1 p-2 w-[20%]">
            <Wallet className={`w-5 h-5 ${pathname === '/cashout' ? 'text-[#A66CFF]' : 'text-[#8D89A8]'}`} />
            <span className={`text-[9px] font-bold ${pathname === '/cashout' ? 'text-[#A66CFF]' : 'text-[#8D89A8]'}`}>Cashout</span>
          </Link>

          <Link href="/dashboard" className="flex flex-col items-center -mt-6 p-2 w-[20%] relative group">
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#A66CFF] to-[#EC4899] p-[3px] shadow-[0_4px_20px_rgba(166,108,255,0.4)] relative z-10">
              <div className="w-full h-full rounded-full bg-[#0E111E] flex items-center justify-center">
                <Rocket className={`w-6 h-6 ${pathname === '/dashboard' ? 'text-white' : 'text-[#A66CFF]'}`} />
              </div>
            </div>
            <span className={`text-[9px] font-bold mt-1 ${pathname === '/dashboard' ? 'text-[#A66CFF]' : 'text-[#8D89A8]'}`}>Earn</span>
          </Link>

          <Link href="/leaderboard" className="flex flex-col items-center gap-1 p-2 w-[20%]">
            <Trophy className={`w-5 h-5 ${pathname === '/leaderboard' ? 'text-[#A66CFF]' : 'text-[#8D89A8]'}`} />
            <span className={`text-[9px] font-bold ${pathname === '/leaderboard' ? 'text-[#A66CFF]' : 'text-[#8D89A8]'}`}>Leaders</span>
          </Link>

          <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center gap-1 p-2 w-[20%] cursor-pointer">
            <Menu className="w-5 h-5 text-[#8D89A8]" />
            <span className="text-[9px] font-bold text-[#8D89A8]">More</span>
          </button>
        </div>
      )}

      {/* MOBILE SIDE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] cursor-pointer" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="lg:hidden fixed top-0 left-0 h-full w-[280px] bg-[#111319] border-r border-white/10 z-[70] flex flex-col shadow-2xl">
              <div className="h-24 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-gradient-to-b from-white/[0.02] to-transparent">
                <div className="flex items-center gap-3">
                   <img src="/logo.png" alt="BinnyCash" className="h-10 w-auto object-contain" />
                   <div className="flex flex-col justify-center">
                     <span className="font-black text-xl tracking-wide text-white leading-none">Binny<span className="text-[#8B5CF6]">Cash</span></span>
                   </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-[#8F95A3] transition-all cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col py-6 px-4 gap-2 overflow-y-auto">
                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-white/5 text-[#8D89A8] hover:text-white transition-all">
                  <User className="w-5 h-5" />
                  <span className="text-sm font-bold">My Profile</span>
                </Link>
                <Link href="/rewards" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-white/5 text-[#8D89A8] hover:text-white transition-all">
                  <Gift className="w-5 h-5" />
                  <span className="text-sm font-bold">Rewards</span>
                </Link>
                <Link href="/affiliate" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-white/5 text-[#8D89A8] hover:text-white transition-all">
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-bold">Affiliates</span>
                </Link>
                <Link href="/transactions" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-white/5 text-[#8D89A8] hover:text-white transition-all">
                  <History className="w-5 h-5" />
                  <span className="text-sm font-bold">Transactions</span>
                </Link>
                <Link href="/support" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-white/5 text-[#8D89A8] hover:text-white transition-all">
                  <HelpCircle className="w-5 h-5" />
                  <span className="text-sm font-bold">Support</span>
                </Link>
                
                <div className="h-px bg-white/10 my-2" />
                
                <button onClick={() => { setIsMobileMenuOpen(false); setShowLogoutConfirm(true); }} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[#FF5D73] hover:bg-[#FF5D73]/10 transition-all text-left">
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-bold">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}