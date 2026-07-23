'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { Rocket, Trophy, Wallet, Globe, ChevronDown, User } from "lucide-react";
import "flag-icons/css/flag-icons.min.css";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
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
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);

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
  }, []);

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
      // 🔥 CLEAR TOKENS & STATE FIRST BEFORE REDIRECTING 🔥
      localStorage.removeItem('token');
      localStorage.removeItem('userId'); 
      setIsLoggedIn(false);

      setTimeout(() => {
        setIsTransitioning(false);
        router.replace('/');
      }, 1000);
    }
  };

  const ProfileDropdown = ({ isMobile = false }) => (
    <div className={`absolute ${isMobile ? 'left-0' : 'right-0'} mt-3 w-56 bg-[#1A1C24] border border-white/5 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200`}>
      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#8F95A3] hover:text-white hover:bg-white/5 transition-colors">
        <User className="w-4 h-4" /> Profile
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

      <nav ref={navRef} className="w-full bg-[#111319] sticky top-0 z-40 border-b border-white/5 h-[80px] flex items-center">
        <div className="w-full px-4 md:px-6 flex justify-between items-center relative">
          
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center gap-3 cursor-pointer group">
              <img src="/logo.png" alt="BinnyCash" className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
              <div className="flex flex-col justify-center">
                <span className="font-black text-2xl tracking-wide text-white leading-none">Binny<span className="text-[#8B5CF6]">Cash</span></span>
                <span className="text-[9px] text-[#00E57A] font-bold tracking-[0.2em] uppercase mt-1 drop-shadow-[0_0_5px_rgba(0,229,122,0.4)]">Play. Earn. Dominate.</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <div id="google_translate_element" style={{ display: 'none' }}></div>
            
            <div className="relative">
              <button 
                onClick={() => setIsLangModalOpen(!isLangModalOpen)}
                className="flex items-center gap-2 bg-[#1A1C24] border border-white/5 hover:bg-[#252836] transition-all px-3 py-2 rounded-xl text-white text-xs font-bold cursor-pointer"
              >
                <span className={`fi fi-${selectedLang.tag} w-4 h-3 rounded-[2px] shadow-sm`}></span>
                <span className="hidden sm:inline uppercase">{selectedLang.code}</span>
                <ChevronDown className="w-3 h-3 text-[#8F95A3]" />
              </button>

              {isLangModalOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-[#1A1C24] border border-white/5 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-[#8F95A3] hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
                    >
                      <span className={`fi fi-${lang.tag} w-5 h-3.5 rounded-[2px] shadow-sm`}></span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isLoggedIn ? (
              <>
                <div className="hidden md:block relative">
                  <button onClick={() => { setIsProfileOpen(!isProfileOpen); }} className="flex items-center gap-2 bg-[#1A1C24] border border-white/5 hover:bg-[#252836] transition-all rounded-lg pl-1.5 pr-3 py-1.5 cursor-pointer">
                    <div className="w-6 h-6 rounded-md bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center text-xs font-black">W</div>
                    <span className="text-white text-xs font-bold max-w-[80px] truncate">wranglerl...</span>
                    <span className="text-[#8F95A3] text-[10px] ml-1">▼</span>
                  </button>
                  {isProfileOpen && <ProfileDropdown />}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={openLogin} className="text-sm font-bold text-white hover:text-[#8B5CF6] transition-colors cursor-pointer">Login</button>
                <button onClick={openRegister} className="text-sm font-bold text-white bg-[#8B5CF6] hover:bg-[#7c3aed] px-4 py-2 rounded-lg transition-colors cursor-pointer">Sign Up</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAVIGATION */}
      {isLoggedIn && (
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#111319] border-t border-white/5 z-50 flex items-center justify-between px-2 pb-safe pt-2">
          <Link href="/myoffers" className="flex flex-col items-center w-[33%] h-14"><Trophy className="w-5 h-5 mb-1 text-[#8F95A3]" /><span className="text-[10px] font-bold text-[#8F95A3]">My Offer</span></Link>
          <Link href="/dashboard" className="flex flex-col items-center w-[33%] h-14"><Rocket className="w-6 h-6 mb-1 text-[#8B5CF6]" /><span className="text-[10px] font-bold text-white">Earn</span></Link>
          <Link href="/cashout" className="flex flex-col items-center w-[33%] h-14"><Wallet className="w-5 h-5 mb-1 text-[#8F95A3]" /><span className="text-[10px] font-bold text-[#8F95A3]">Cashout</span></Link>
        </div>
      )}
    </>
  );
}