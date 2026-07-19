'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  // Authentication state (Abhi ke liye false rakha h taaki Login/Get Started dikhe)
  // Jab tu backend jodeyga, tab isko apne context ya session se replace kar lena.
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <nav className="w-full bg-[#05050A]/80 backdrop-blur-2xl sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex justify-between items-center">
        
        {/* 1. LOGO SECTION (NEXUS Style) */}
        <Link href="/" className="flex flex-col cursor-pointer group">
          <span className="font-black text-2xl tracking-wide text-white flex items-center">
            BINNY<span className="text-fuchsia-500">CASH</span>
          </span>
          <span className="text-[8px] text-fuchsia-500 font-bold tracking-[0.2em] uppercase mt-[-2px] group-hover:text-white transition-colors">
            Play. Earn. Dominate.
          </span>
        </Link>

        {/* 2. MIDDLE NAVIGATION LINKS */}
        <div className="hidden lg:flex items-center gap-10 text-sm font-semibold text-gray-400">
          <div className="relative text-fuchsia-500 flex flex-col items-center cursor-pointer">
            <span>Home</span>
            <div className="absolute -bottom-[22px] w-6 h-[2px] bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,1)]"></div>
          </div>
          
          <Link href="#quests" className="hover:text-white transition-colors">Quests</Link>
          <Link href="#games" className="hover:text-white transition-colors">Games</Link>
          <Link href="#leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
        </div>

        {/* 3. RIGHT SECTION: CONDITIONAL RENDERING (Auth vs Profile) */}
        <div className="flex items-center gap-6">
          
          {isLoggedIn ? (
            /* ================= LOGGED IN VIEW ================= */
            <>
              {/* Coins Display */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-orange-500 text-xl animate-[pulse_2s_ease-in-out_infinite]">⚡</span>
                <div className="flex flex-col items-start">
                  <span className="text-emerald-400 font-black text-sm leading-none drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                    12,450
                  </span>
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                    Binny Coins
                  </span>
                </div>
              </div>

              {/* Profile Pill */}
              <div className="flex items-center gap-3 bg-[#0a0a14] border border-orange-500/30 hover:border-orange-500/70 transition-all duration-300 rounded-full p-1 pr-4 cursor-pointer shadow-[0_0_20px_rgba(249,115,22,0.1)] hover:shadow-[0_0_25px_rgba(249,115,22,0.2)]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-fuchsia-600 to-orange-500 p-[2px]">
                  <div className="w-full h-full rounded-full bg-[#131320] flex items-center justify-center overflow-hidden relative">
                    <span className="text-lg relative z-10">🧑‍💻</span>
                    <div className="absolute inset-0 bg-fuchsia-500/20 mix-blend-overlay"></div>
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-white text-xs font-bold leading-none">RohitM</span>
                  <span className="text-gray-400 text-[10px] font-medium mt-1">Level 50</span>
                </div>
                <span className="text-gray-500 text-[10px] ml-1">▼</span>
              </div>
            </>
          ) : (
            /* ================= GUEST VIEW (Not Logged In) ================= */
            <div className="flex items-center gap-5">
              <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
                Login
              </Link>
              
              <Link href="/register" className="relative group px-6 py-2 rounded-xl bg-[#0a0a14] border border-fuchsia-500/50 overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(217,70,239,0.4)]">
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 text-sm font-black text-white tracking-wide flex items-center gap-2">
                  GET STARTED <span className="text-fuchsia-400 group-hover:text-white transition-colors">⚡</span>
                </span>
              </Link>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}