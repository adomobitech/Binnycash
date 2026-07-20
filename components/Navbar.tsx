'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from './AuthContext'; // ✨ Added Hook

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { openLogin, openRegister } = useAuth(); // ✨ Using Context

  return (
    <nav className="w-full bg-[#08080C]/90 backdrop-blur-2xl sticky top-0 z-40 border-b border-white/5">
      <div className="max-w-[1450px] mx-auto px-6 py-4 flex justify-between items-center">
        
        <Link href="/" className="flex items-center gap-3 cursor-pointer group">
          <img src="/logo.png" alt="BinnyCash Logo" className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-wide text-white flex items-center">Binny<span className="text-[#00E57A]">Cash</span></span>
            <span className="text-[8px] text-[#8B5CF6] font-bold tracking-[0.2em] uppercase mt-[-4px] group-hover:text-[#00E57A] transition-colors">Play. Earn. Dominate.</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-10 text-sm font-semibold text-[#8F95A3]">
          <div className="relative text-[#00E57A] flex flex-col items-center cursor-pointer">
            <span>Home</span>
            <div className="absolute -bottom-[26px] w-6 h-[2px] bg-[#00E57A] shadow-[0_0_10px_rgba(0,229,122,0.8)]"></div>
          </div>
          <Link href="#quests" className="hover:text-white transition-colors">Quests</Link>
          <Link href="#games" className="hover:text-white transition-colors">Games</Link>
          <Link href="#leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[#00E57A] text-xl animate-[pulse_2s_ease-in-out_infinite]">⚡</span>
                <div className="flex flex-col items-start">
                  <span className="text-[#00E57A] font-black text-sm leading-none drop-shadow-[0_0_8px_rgba(0,229,122,0.3)]">12,450</span>
                  <span className="text-[9px] text-[#8F95A3] font-bold uppercase tracking-widest mt-0.5">Binny Coins</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#12121A] border border-white/5 hover:border-[#8B5CF6]/50 transition-all duration-300 rounded-full p-1 pr-4 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#00E57A] p-[2px]">
                  <div className="w-full h-full rounded-full bg-[#08080C] flex items-center justify-center overflow-hidden relative">
                    <span className="text-lg relative z-10">🧑‍💻</span>
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-white text-xs font-bold leading-none">RohitM</span>
                  <span className="text-[#8F95A3] text-[10px] font-medium mt-1">Level 50</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 md:gap-4">
              <button onClick={openLogin} className="text-sm font-semibold text-white bg-[#12121A] hover:bg-white/10 px-6 py-2.5 rounded-xl transition-colors border border-white/5">
                Login
              </button>
              <button onClick={openRegister} className="text-sm font-bold text-white bg-[#8B5CF6] hover:bg-[#7c3aed] px-6 py-2.5 rounded-xl transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}