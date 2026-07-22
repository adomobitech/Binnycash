'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
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
  { code: 'ar', name: 'Arabic', tag: 'SA', flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese', tag: 'PT', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', tag: 'RU', flag: '🇷🇺' },
  { code: 'zh-CN', name: 'Chinese', tag: 'CN', flag: '🇨🇳' },
  { code: 'th', name: 'Thai', tag: 'TH', flag: '🇹🇭' },
  { code: 'id', name: 'Indonesian', tag: 'ID', flag: '🇮🇩' },
  { code: 'tr', name: 'Turkish', tag: 'TR', flag: '🇹🇷' },
  { code: 'vi', name: 'Vietnamese', tag: 'VN', flag: '🇻🇳' },
  { code: 'it', name: 'Italian', tag: 'IT', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', tag: 'JP', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', tag: 'KR', flag: '🇰🇷' },
  { code: 'nl', name: 'Dutch', tag: 'NL', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', tag: 'PL', flag: '🇵🇱' },
  { code: 'fa', name: 'Persian', tag: 'IR', flag: '🇮🇷' },
  { code: 'uk', name: 'Ukrainian', tag: 'UA', flag: '🇺🇦' },
  { code: 'ms', name: 'Malay', tag: 'MY', flag: '🇲🇾' }
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { openLogin, openRegister } = useAuth();
  
  // UI States
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [usdToggle, setUsdToggle] = useState(true);

  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check Auth Status
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

  // Google Translate Killer Script
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

    const observer = new MutationObserver(() => {
      const bannerFrame = document.querySelector('.goog-te-banner-frame') as HTMLElement;
      if (bannerFrame) {
        bannerFrame.style.display = 'none';
        bannerFrame.style.visibility = 'hidden';
      }
      if (document.body.style.top && document.body.style.top !== '0px') {
        document.body.style.top = '0px';
      }
    });

    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

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

    return () => observer.disconnect();
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
    setIsTransitioning(true); // Overlay on
    
    try {
      const token = localStorage.getItem('token'); // 🔑 Token uthaya

      await fetch('https://apitest.binnycash.com/api/user/logout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}`, // 🔑 Headers me token pass kiya
          'token': token || ''
        }
      });
    } catch (error) {
      console.error("Logout API failed:", error);
    } 
    
    // Smooth transition sequence
    setTimeout(() => {
      router.push('/'); // Pehle page redirect hone do
      
      setTimeout(() => {
        // UI redirect hone ke baad token clean karo
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setIsTransitioning(false); // Ab overlay hatao
      }, 600); 
      
    }, 1500); // 1.5s tak logo jump karega
  };
  return (
    <>
      {/* SOLID TRANSITION OVERLAY (JUMPING LOGO) */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B0E14] transition-opacity duration-300">
          <div className="w-24 h-24 mb-6 rounded-full border border-[#00E57A]/30 bg-[#1A1C23] flex items-center justify-center shadow-[0_0_30px_rgba(0,229,122,0.2)]">
            <img src="/logo.png" alt="BinnyCash Logo" className="w-14 h-14 object-contain animate-bounce" />
          </div>
          <h2 className="text-white text-xl font-black tracking-wide animate-pulse">Logging out securely...</h2>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#111315] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-red-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </div>
            <h3 className="text-white text-lg font-black mb-2">Are you sure?</h3>
            <p className="text-[#8F95A3] text-sm mb-6">You will be logged out of your session.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleLogoutConfirm} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-colors cursor-pointer">Yes, Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* INCREASED HEIGHT TO ACCOMMODATE BIGGER LOGO & TAGLINE */}
      <nav className="w-full bg-[#111319] sticky top-0 z-40 border-b border-white/5 h-[80px] flex items-center">
        <div className="w-full px-4 md:px-6 flex justify-between items-center relative">
          
          {/* 🔥 LEFT: BIGGER LOGO & GREEN TAGLINE RESTORED 🔥 */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 cursor-pointer group shrink-0">
            <img src="/logo.png" alt="BinnyCash" className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" />
            <div className="flex flex-col justify-center">
              <span className="font-black text-xl md:text-2xl tracking-wide text-white leading-none">
                Binny<span className="text-[#8B5CF6]">Cash</span>
              </span>
              <span className="text-[8px] md:text-[9px] text-[#00E57A] font-bold tracking-[0.2em] uppercase mt-1 drop-shadow-[0_0_5px_rgba(0,229,122,0.4)] group-hover:brightness-125 transition-all">
                Play. Earn. Dominate.
              </span>
            </div>
          </Link>

          {/* MIDDLE: MAIN NAVIGATION (ONLY SHOWS IF LOGGED IN) */}
          {isLoggedIn && (
            <div className="hidden lg:flex items-center gap-1 bg-[#1A1C24] p-1 rounded-xl border border-white/5 absolute left-1/2 -translate-x-1/2">
              <Link href="/dashboard" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${pathname === '/earn' ? 'bg-[#252836] text-white shadow-sm' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'}`}>
                <span className={pathname === '/earn' ? 'text-[#8B5CF6]' : ''}>🚀</span> Earn
              </Link>
              <Link href="/myoffers" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${pathname === '/myoffers' ? 'bg-[#252836] text-white shadow-sm' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'}`}>
                <span className={pathname === '/myoffers' ? 'text-yellow-400' : ''}>⭐</span> MyOffer
              </Link>
              <Link href="/cashout" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${pathname === '/cashout' ? 'bg-[#252836] text-white shadow-sm' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'}`}>
                <span className={pathname === '/cashout' ? 'text-blue-400' : ''}>💳</span> Cashout
              </Link>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-[#8F95A3] hover:text-white hover:bg-white/5 transition-all cursor-pointer">
                <span>🎁</span> Rewards <span className="text-[10px]">▼</span>
              </button>
            </div>
          )}

          {/* RIGHT: CONTROLS */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <div id="google_translate_element" className="hidden"></div>
            
            {/* GLOBE LANGUAGE BUTTON */}
            <button 
              onClick={() => setIsLangModalOpen(true)}
              className="w-10 h-10 rounded-full bg-[#1A1C24] border border-white/5 hover:border-[#8B5CF6]/50 hover:bg-[#252836] flex items-center justify-center transition-all group cursor-pointer"
              title="Change Language"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#8F95A3] group-hover:text-white transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </button>

            {isLoggedIn ? (
              <>
                {/* Purple Balance Badge */}
                <div className="hidden sm:flex items-center bg-[#8B5CF6] px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.2)] cursor-pointer hover:bg-[#7c3aed] transition-colors">
                  <span className="text-white font-black text-sm">$ 0.10</span>
                </div>

                {/* Notifications & Chat */}
                <button className="w-9 h-9 rounded-lg bg-[#1A1C24] border border-white/5 flex items-center justify-center text-[#8F95A3] hover:text-white transition-colors cursor-pointer">
                  🔔
                </button>
                <button className="w-9 h-9 rounded-lg bg-[#1A1C24] border border-white/5 flex items-center justify-center text-[#8F95A3] hover:text-white transition-colors relative cursor-pointer">
                  💬
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#00E57A] rounded-full"></span>
                </button>

                {/* PROFILE DROPDOWN */}
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 bg-[#1A1C24] border border-white/5 hover:bg-[#252836] transition-all rounded-lg pl-1.5 pr-3 py-1.5 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-md bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center text-xs font-black">
                      W
                    </div>
                    <span className="text-white text-xs font-bold max-w-[80px] truncate">wranglerl...</span>
                    <span className="text-[#8F95A3] text-[10px] ml-1">▼</span>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-[#1A1C24] border border-white/5 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#8F95A3] hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
                        👤 Profile
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#8F95A3] hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
                        🛡️ Account Status
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#8F95A3] hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
                        ❓ Help
                      </button>
                      <button 
                        onClick={() => { setIsProfileOpen(false); setShowLogoutConfirm(true); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#8F95A3] hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        ↪️ Logout
                      </button>

                      <div className="my-2 border-t border-white/5"></div>
                      
                      {/* USD/Coins Toggle */}
                      <div className="px-4 py-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">USD</span>
                        <button 
                          onClick={() => setUsdToggle(!usdToggle)}
                          className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${usdToggle ? 'bg-[#8B5CF6]' : 'bg-gray-600'}`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${usdToggle ? 'left-[22px]' : 'left-1'}`}></div>
                        </button>
                      </div>
                    </div>
                  )}
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

      {/* LANGUAGE SELECTION MODAL */}
      {isLangModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#0D0D12] border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_0_40px_rgba(0,0,0,0.9)] overflow-hidden">
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-white text-2xl font-black tracking-wide">Choose your language</h2>
                <p className="text-[#8F95A3] text-xs font-medium mt-1">Popular languages</p>
              </div>
              <button 
                onClick={() => setIsLangModalOpen(false)}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#14141E] hover:bg-[#1C1C2B] border border-white/5 hover:border-[#00E57A]/40 transition-all group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className={`fi fi-${lang.tag.toLowerCase()} rounded-sm w-6 h-4`}></span>
                    <span className="w-7 h-7 rounded-lg bg-[#1E1E2C] border border-white/5 flex items-center justify-center text-[10px] font-black text-[#8F95A3] group-hover:text-[#00E57A] group-hover:border-[#00E57A]/30 transition-colors">
                      {lang.tag}
                    </span>
                  </div>
                  <span className="text-white font-semibold text-sm group-hover:text-[#00E57A] transition-colors truncate">
                    {lang.name}
                  </span>
                </button>
              ))}
            </div>

          </div>
        </div>
      )}
    </>
  );
}