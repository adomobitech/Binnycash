'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <nav className="w-full bg-[#08080C]/90 backdrop-blur-2xl sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-[1450px] mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* 1. LOGO SECTION (Image + Name combined) */}
        <Link href="/" className="flex items-center gap-3 cursor-pointer group">
          <img 
            src="/logo.png" 
            alt="BinnyCash Logo" 
            className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
          />
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-wide text-white flex items-center">
              Binny<span className="text-[#00E57A]">Cash</span>
            </span>
            <span className="text-[8px] text-[#8B5CF6] font-bold tracking-[0.2em] uppercase mt-[-4px] group-hover:text-[#00E57A] transition-colors">
              Play. Earn. Dominate.
            </span>
          </div>
        </Link>

        {/* 2. MIDDLE NAVIGATION LINKS (New Theme Colors) */}
        <div className="hidden lg:flex items-center gap-10 text-sm font-semibold text-[#8F95A3]">
          <div className="relative text-[#00E57A] flex flex-col items-center cursor-pointer">
            <span>Home</span>
            {/* Active underline indicator */}
            <div className="absolute -bottom-[26px] w-6 h-[2px] bg-[#00E57A] shadow-[0_0_10px_rgba(0,229,122,0.8)]"></div>
          </div>
          
          <Link href="#quests" className="hover:text-white transition-colors">Quests</Link>
          <Link href="#games" className="hover:text-white transition-colors">Games</Link>
          <Link href="#leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
        </div>

        {/* 3. RIGHT SECTION: CONDITIONAL RENDERING */}
        <div className="flex items-center gap-4">
          
          {isLoggedIn ? (
            /* ================= LOGGED IN VIEW (Updated to new theme) ================= */
            <>
              {/* Coins Display */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[#00E57A] text-xl animate-[pulse_2s_ease-in-out_infinite]">⚡</span>
                <div className="flex flex-col items-start">
                  <span className="text-[#00E57A] font-black text-sm leading-none drop-shadow-[0_0_8px_rgba(0,229,122,0.3)]">
                    12,450
                  </span>
                  <span className="text-[9px] text-[#8F95A3] font-bold uppercase tracking-widest mt-0.5">
                    Binny Coins
                  </span>
                </div>
              </div>

              {/* Profile Pill */}
              <div className="flex items-center gap-3 bg-[#12121A] border border-white/5 hover:border-[#8B5CF6]/50 transition-all duration-300 rounded-full p-1 pr-4 cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.05)] hover:shadow-[0_0_25px_rgba(139,92,246,0.2)]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#00E57A] p-[2px]">
                  <div className="w-full h-full rounded-full bg-[#08080C] flex items-center justify-center overflow-hidden relative">
                    <span className="text-lg relative z-10">🧑‍💻</span>
                    <div className="absolute inset-0 bg-[#8B5CF6]/20 mix-blend-overlay"></div>
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-white text-xs font-bold leading-none">RohitM</span>
                  <span className="text-[#8F95A3] text-[10px] font-medium mt-1">Level 50</span>
                </div>
                <span className="text-gray-500 text-[10px] ml-1">▼</span>
              </div>
            </>
          ) : (
            /* ================= GUEST VIEW (Matched exactly with image_b01329.png) ================= */
            <div className="flex items-center gap-3 md:gap-4">
              
              {/* Globe Icon */}
              <button className="hidden sm:flex w-10 h-10 rounded-full bg-[#12121A] hover:bg-white/10 items-center justify-center text-gray-400 transition-colors border border-white/5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </button>

              {/* Login Button (Dark with slight border) */}
              <Link href="/login" className="text-sm font-semibold text-white bg-[#12121A] hover:bg-white/10 px-6 py-2.5 rounded-xl transition-colors border border-white/5">
                Login
              </Link>
              
              {/* Sign Up Button (Solid Purple with glow) */}
              <Link href="/register" className="text-sm font-bold text-white bg-[#8B5CF6] hover:bg-[#7c3aed] px-6 py-2.5 rounded-xl transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                Sign Up
              </Link>

            </div>
          )}

        </div>
      </div>
    </nav>
  );
}