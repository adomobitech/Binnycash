'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { openLogin, openRegister } = useAuth();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
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
    const checkAuth = () => { setIsLoggedIn(!!localStorage.getItem('token')); };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    const interval = setInterval(checkAuth, 1000);
    return () => { window.removeEventListener('storage', checkAuth); clearInterval(interval); };
  }, []);

  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false);
    setIsTransitioning(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('https://apitest.binnycash.com/api/user/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {} 
    setTimeout(() => {
      router.push('/');
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId'); 
        setIsLoggedIn(false);
        setIsTransitioning(false);
      }, 600); 
    }, 1500); 
  };

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
          
          {/* LEFT: LOGO ONLY */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center gap-3 cursor-pointer group">
              <img src="/logo.png" alt="BinnyCash" className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
              <div className="flex flex-col justify-center">
                <span className="font-black text-2xl tracking-wide text-white leading-none">Binny<span className="text-[#8B5CF6]">Cash</span></span>
                <span className="text-[9px] text-[#00E57A] font-bold tracking-[0.2em] uppercase mt-1 drop-shadow-[0_0_5px_rgba(0,229,122,0.4)]">Play. Earn. Dominate.</span>
              </div>
            </Link>
          </div>

          {/* RIGHT: JUST PROFILE & LOGOUT */}
          <div className="flex items-center shrink-0">
            {isLoggedIn ? (
              <div className="relative">
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 bg-[#1A1C24] border border-white/5 hover:bg-[#252836] transition-all rounded-xl px-2 py-2 cursor-pointer shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center text-sm font-black">W</div>
                  <span className="text-white text-sm font-bold px-1 max-w-[100px] truncate">wranglerl...</span>
                  <span className="text-[#8F95A3] text-[10px] ml-1 pr-1">▼</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-[#1A1C24] border border-white/5 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button onClick={() => { setIsProfileOpen(false); setShowLogoutConfirm(true); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:text-white hover:bg-red-500/20 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Logout Session
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={openLogin} className="text-sm font-bold text-white hover:text-[#8B5CF6] transition-colors cursor-pointer">Login</button>
                <button onClick={openRegister} className="text-sm font-bold text-white bg-[#8B5CF6] hover:bg-[#7c3aed] px-4 py-2 rounded-lg transition-colors cursor-pointer">Sign Up</button>
              </div>
            )}
          </div>

        </div>
      </nav>
    </>
  );
}