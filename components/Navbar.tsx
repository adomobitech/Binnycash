'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { Rocket, Trophy, Wallet } from "lucide-react";
import "flag-icons/css/flag-icons.min.css";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

const LANGUAGES = [
  { code: 'en', name: 'English', tag: 'US', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', tag: 'IN', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', tag: 'BD', flag: '🇧🇩' },
  { code: 'es', name: 'Spanish', tag: 'ES', flag: '🇪🇸' },
  { code: 'fr', name: 'French', tag: 'FR', flag: '🇫🇷' },
  { code: 'de', name: 'German', tag: 'DE', flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic', tag: 'SA', flag: '🇸🇦' }
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
  const [usdToggle, setUsdToggle] = useState(true);

  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    const interval = setInterval(checkAuth, 1000);
    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
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
      `;
      document.head.appendChild(style);
    }

    if (document.getElementById('google-translate-script')) return;
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en', autoDisplay: false, includedLanguages: LANGUAGES.map(l => l.code).join(','), layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE },
        'google_translate_element'
      );
    };
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = langCode;
      selectElement.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      document.cookie = `googtrans=/en/${langCode}; path=/`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`;
      window.location.reload();
    }
    setIsLangModalOpen(false);
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
          'Authorization': `Bearer ${token}`,
          'token': token || ''
        }
      });
    } catch (error) {
      console.error("Logout API failed:", error);
    } 
    setTimeout(() => {
      router.push('/');
      setTimeout(() => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setIsTransitioning(false);
      }, 600); 
    }, 1500); 
  };

  const ProfileDropdown = ({ isMobile = false }) => (
    <div className={`absolute ${isMobile ? 'left-0' : 'right-0'} mt-3 w-56 bg-[#1A1C24] border border-white/5 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200`}>
      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#8F95A3] hover:text-white hover:bg-white/5 transition-colors">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
        Profile
      </button>
      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#8F95A3] hover:text-white hover:bg-white/5 transition-colors">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
        Account Status
      </button>
      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#8F95A3] hover:text-white hover:bg-white/5 transition-colors">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
        Help
      </button>
      <button onClick={() => { setIsProfileOpen(false); setShowLogoutConfirm(true); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#8F95A3] hover:text-red-400 hover:bg-white/5 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        Logout
      </button>

      <div className="my-2 border-t border-white/5"></div>
      
      <div className="px-4 py-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-white">Show USD</span>
        <button onClick={() => setUsdToggle(!usdToggle)} className={`w-10 h-5 rounded-full relative transition-colors ${usdToggle ? 'bg-[#8B5CF6]' : 'bg-gray-600'}`}>
          <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${usdToggle ? 'left-[22px]' : 'left-1'}`}></div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {isTransitioning && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B0E14] transition-opacity duration-300">
          <div className="w-24 h-24 mb-6 rounded-full border border-[#00E57A]/30 bg-[#1A1C23] flex items-center justify-center shadow-[0_0_30px_rgba(0,229,122,0.2)]">
            <img src="/logo.png" alt="BinnyCash" className="w-14 h-14 object-contain animate-bounce" />
          </div>
          <h2 className="text-white text-xl font-black tracking-wide animate-pulse">Logging out securely...</h2>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#111315] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <h3 className="text-white text-lg font-black mb-2 mt-4">Are you sure?</h3>
            <p className="text-[#8F95A3] text-sm mb-6">You will be logged out of your session.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors">Cancel</button>
              <button onClick={handleLogoutConfirm} className="flex-1 py-3 rounded-xl bg-[#8B5CF6] hover:bg-[#7c3aed] text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-colors">Yes, Logout</button>
            </div>
          </div>
        </div>
      )}

      <nav ref={navRef} className="w-full bg-[#111319] sticky top-0 z-40 border-b border-white/5 h-[70px] md:h-[80px] flex items-center">
        <div className="w-full px-4 md:px-6 flex justify-between items-center relative">
          
          <div className="flex items-center shrink-0">
            {isLoggedIn ? (
              <>
                <div className="md:hidden relative">
                  <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-10 h-10 rounded-full bg-[#1A56DB] flex items-center justify-center text-white font-black text-xl shadow-md">
                    m
                  </button>
                  {isProfileOpen && <ProfileDropdown isMobile={true} />}
                </div>

                <Link href="/" className="hidden md:flex items-center gap-3 cursor-pointer group">
                  <img src="/logo.png" alt="BinnyCash" className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
                  <div className="flex flex-col justify-center">
                    <span className="font-black text-2xl tracking-wide text-white leading-none">Binny<span className="text-[#8B5CF6]">Cash</span></span>
                    <span className="text-[9px] text-[#00E57A] font-bold tracking-[0.2em] uppercase mt-1 drop-shadow-[0_0_5px_rgba(0,229,122,0.4)]">Play. Earn. Dominate.</span>
                  </div>
                </Link>
              </>
            ) : (
              <Link href="/" className="flex items-center gap-2 md:gap-3 cursor-pointer group">
                <img src="/logo.png" alt="BinnyCash" className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" />
                <div className="flex flex-col justify-center">
                  <span className="font-black text-xl md:text-2xl tracking-wide text-white leading-none">Binny<span className="text-[#8B5CF6]">Cash</span></span>
                  <span className="text-[8px] md:text-[9px] text-[#00E57A] font-bold tracking-[0.2em] uppercase mt-1 drop-shadow-[0_0_5px_rgba(0,229,122,0.4)]">Play. Earn. Dominate.</span>
                </div>
              </Link>
            )}
          </div>

          {/* 🔥 🚀 UPDATED DESKTOP NAVIGATION WITH LUCIDE ICONS 🔥 */}
          {isLoggedIn && (
            <div className="hidden lg:flex items-center gap-1 bg-[#1A1C24] p-1 rounded-xl border border-white/5 absolute left-1/2 -translate-x-1/2">
              <Link href="/dashboard" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${pathname === '/earn' || pathname === '/dashboard' ? 'bg-[#252836] text-white shadow-sm' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'}`}>
                <Rocket className={`w-4 h-4 ${pathname === '/earn' || pathname === '/dashboard' ? 'text-violet-400' : ''}`} /> Earn
              </Link>
              <Link href="/myoffers" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${pathname === '/myoffers' ? 'bg-[#252836] text-white shadow-sm' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'}`}>
                <Trophy className={`w-4 h-4 ${pathname === '/myoffers' ? 'text-amber-400' : ''}`} /> Started
              </Link>
              <Link href="/cashout" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${pathname === '/cashout' ? 'bg-[#252836] text-white shadow-sm' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'}`}>
                <Wallet className={`w-4 h-4 ${pathname === '/cashout' ? 'text-emerald-400' : ''}`} /> Cashout
              </Link>
            </div>
          )}

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <div id="google_translate_element" className="hidden"></div>
            
            {isLoggedIn ? (
              <>
                <div className="flex items-center bg-[#3D1466] border border-[#8B5CF6]/40 px-3 py-1.5 md:py-2 rounded-lg cursor-pointer hover:bg-[#4c1d7a] transition-colors">
                  <span className="text-[#C4B5FD] mr-1 text-sm">$</span>
                  <span className="text-white font-black text-sm">0.10</span>
                </div>

                <button className="w-10 h-10 rounded-xl bg-[#1A1C24] border border-white/5 flex items-center justify-center text-[#8F95A3] hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
                </button>
                <button className="w-10 h-10 rounded-xl bg-[#1A1C24] border border-white/5 flex items-center justify-center text-[#8F95A3] hover:text-white transition-colors relative">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#00E57A] rounded-full border-2 border-[#1A1C24]"></span>
                </button>

                <div className="hidden md:block relative">
                  <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 bg-[#1A1C24] border border-white/5 hover:bg-[#252836] transition-all rounded-lg pl-1.5 pr-3 py-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center text-xs font-black">W</div>
                    <span className="text-white text-xs font-bold max-w-[80px] truncate">wranglerl...</span>
                    <span className="text-[#8F95A3] text-[10px] ml-1">▼</span>
                  </button>
                  {isProfileOpen && <ProfileDropdown isMobile={false} />}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={openLogin} className="text-sm font-bold text-white hover:text-[#8B5CF6] transition-colors">Login</button>
                <button onClick={openRegister} className="text-sm font-bold text-white bg-[#8B5CF6] hover:bg-[#7c3aed] px-4 py-2 rounded-lg transition-colors">Sign Up</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAVIGATION */}
      {isLoggedIn && (
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#111319] border-t border-white/5 z-50 flex items-center justify-between px-2 pb-safe pt-2 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <Link href="/myoffers" className="relative flex flex-col items-center justify-center w-[20%] h-14 group">
            {pathname === '/myoffers' && <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#8B5CF6] rounded-b-full shadow-[0_2px_8px_rgba(139,92,246,0.8)]"></div>}
            <Trophy className={`w-5 h-5 mb-1 ${pathname === '/myoffers' ? 'text-white' : 'text-[#8F95A3]'}`} />
            <span className={`text-[10px] font-bold ${pathname === '/myoffers' ? 'text-white' : 'text-[#8F95A3]'}`}>Started</span>
          </Link>

          <Link href="/cashout" className="relative flex flex-col items-center justify-center w-[20%] h-14 group">
            {pathname === '/cashout' && <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#8B5CF6] rounded-b-full shadow-[0_2px_8px_rgba(139,92,246,0.8)]"></div>}
            <Wallet className={`w-5 h-5 mb-1 ${pathname === '/cashout' ? 'text-white' : 'text-[#8F95A3]'}`} />
            <span className={`text-[10px] font-bold ${pathname === '/cashout' ? 'text-white' : 'text-[#8F95A3]'}`}>Cashout</span>
          </Link>

          <Link href="/dashboard" className="relative flex flex-col items-center justify-center w-[20%] h-14 group">
            {(pathname === '/earn' || pathname === '/dashboard' || pathname === '/') && <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#8B5CF6] rounded-b-full shadow-[0_2px_8px_rgba(139,92,246,0.8)]"></div>}
            <Rocket className={`w-6 h-6 mb-1 ${pathname === '/earn' || pathname === '/dashboard' || pathname === '/' ? 'text-[#8B5CF6]' : 'text-[#8F95A3]'}`} />
            <span className={`text-[10px] font-bold ${pathname === '/earn' || pathname === '/dashboard' || pathname === '/' ? 'text-white' : 'text-[#8F95A3]'}`}>Earn</span>
          </Link>

          <Link href="/rewards" className="relative flex flex-col items-center justify-center w-[20%] h-14 group">
            {pathname === '/rewards' && <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#8B5CF6] rounded-b-full shadow-[0_2px_8px_rgba(139,92,246,0.8)]"></div>}
            <svg className={`w-5 h-5 mb-1 ${pathname === '/rewards' ? 'text-white' : 'text-[#8F95A3]'}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 11a1 1 0 112 0v2a1 1 0 11-2 0v-2zm1-7a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
            <span className={`text-[10px] font-bold ${pathname === '/rewards' ? 'text-white' : 'text-[#8F95A3]'}`}>Rewards</span>
          </Link>

          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="relative flex flex-col items-center justify-center w-[20%] h-14 group">
            {isProfileOpen && <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#8B5CF6] rounded-b-full shadow-[0_2px_8px_rgba(139,92,246,0.8)]"></div>}
            <svg className={`w-5 h-5 mb-1 ${isProfileOpen ? 'text-white' : 'text-[#8F95A3]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7"/></svg>
            <span className={`text-[10px] font-bold ${isProfileOpen ? 'text-white' : 'text-[#8F95A3]'}`}>More</span>
          </button>
        </div>
      )}
    </>
  );
}