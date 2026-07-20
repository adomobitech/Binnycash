'use client';

import { useState } from 'react';
import { useAuth } from './AuthContext';

export default function LootVault() {
  const { openLogin, openRegister } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [prize, setPrize] = useState(0);

  const handleSpin = () => {
    if (spinning || showPopup) return;
    setSpinning(true);
    
    setTimeout(() => {
      setPrize([500, 1000, 2500, 5000, 10000][Math.floor(Math.random() * 5)]);
      setSpinning(false);
      setTimeout(() => setShowPopup(true), 400);
    }, 2000);
  };

  const MoneyBag = () => (
    <div className={`relative flex flex-col items-center justify-center transition-all duration-100 ${spinning ? 'animate-[spin-blur_0.2s_linear_infinite]' : 'animate-pulse-slow'}`}>
      <div className="w-20 h-24 sm:w-28 sm:h-32 bg-gradient-to-b from-[#6b21a8] to-[#2e1065] rounded-[40%] border-[3px] border-[#a855f7] shadow-[0_0_30px_rgba(168,85,247,0.5)] flex items-center justify-center relative z-10 overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1/2 bg-white/5 rounded-t-full"></div>
         <span className="text-4xl sm:text-6xl font-black text-[#eab308] drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]">₹</span>
      </div>
      <div className="absolute -bottom-3 flex gap-1 z-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#fde047] to-[#a16207] border-2 border-[#713f12] shadow-lg transform -rotate-12"></div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#fde047] to-[#a16207] border-2 border-[#713f12] shadow-lg -ml-4 z-10"></div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#fde047] to-[#a16207] border-2 border-[#713f12] shadow-lg -ml-4 transform rotate-12"></div>
      </div>
    </div>
  );

  return (
    <div className="w-full relative overflow-hidden font-sans flex items-center justify-center min-h-[900px] bg-[#050508] py-20">
      
      <style jsx>{`
        @keyframes spin-blur {
          0% { transform: translateY(-50px) scaleY(1.2); opacity: 0.5; filter: blur(4px); }
          50% { transform: translateY(50px) scaleY(1.2); opacity: 0.8; filter: blur(2px); }
          100% { transform: translateY(-50px) scaleY(1.2); opacity: 0.5; filter: blur(4px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(15deg); }
        }
        .float-anim { animation: float 6s ease-in-out infinite; }
        .float-anim-delayed { animation: float 7s ease-in-out infinite 2s; }
      `}</style>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#8B5CF6]/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
      
      <div className="absolute top-32 left-10 lg:left-32 w-16 h-16 rounded-full bg-gradient-to-br from-[#fde047] to-[#a16207] float-anim opacity-60 blur-[1px]"></div>
      <div className="absolute bottom-40 right-10 lg:right-32 w-20 h-20 rounded-full bg-gradient-to-br from-[#fde047] to-[#a16207] float-anim-delayed opacity-50 blur-[2px]"></div>
      <div className="absolute top-40 right-20 w-12 h-12 rounded-full bg-gradient-to-br from-[#fde047] to-[#a16207] float-anim opacity-40 blur-[3px]"></div>

      <div className="max-w-[1200px] w-full mx-auto flex flex-col items-center relative z-20 px-4 md:px-6">
        
        <div className="text-center mb-12 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#eab308] text-xl">👑</span>
            <h2 className="text-white font-black tracking-[0.2em] uppercase text-sm">BINNYCASH</h2>
          </div>
          
          <div className="flex items-center gap-4 justify-center mb-4">
            <span className="text-[#f43f5e] text-4xl animate-pulse">⚡</span>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              TEST YOUR <span className="text-[#a855f7] drop-shadow-[0_0_30px_rgba(168,85,247,0.6)]">LUCK</span>
            </h1>
            <span className="text-[#f43f5e] text-4xl animate-pulse">⚡</span>
          </div>
          
          <p className="text-gray-300 font-medium md:text-lg">
            Spin the machine and win exciting rewards up to <span className="text-[#eab308] font-bold">₹10,000</span> instantly!
          </p>
        </div>

        <div className="relative mt-8">
          
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 bg-[#0c0c16] border-[3px] border-[#7e22ce] px-8 py-2 rounded-full shadow-[0_0_20px_rgba(126,34,206,0.8)] flex items-center gap-3 whitespace-nowrap">
            <span className="text-[#a855f7] text-lg">✦</span>
            <span className="text-white font-black tracking-widest text-sm uppercase">Daily Free Spin</span>
            <span className="text-[#a855f7] text-lg">✦</span>
          </div>

          <div className="absolute -left-12 md:-left-16 top-1/2 -translate-y-1/2 z-0 hidden sm:block">
             <div className="relative w-16 h-40">
               <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-24 bg-gradient-to-r from-[#1a1a2e] to-[#2d2d44] border-y-2 border-l-2 border-[#7e22ce]/50 rounded-l-xl"></div>
               <div className={`absolute right-4 top-1/2 origin-bottom w-4 h-32 bg-gradient-to-t from-gray-700 to-gray-400 transition-all duration-700 ease-in-out ${spinning ? 'rotate-[-70deg]' : 'rotate-12'}`}>
                 <div className="absolute -top-6 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-[#d8b4fe] to-[#7e22ce] shadow-[0_0_25px_rgba(168,85,247,0.8)] border-2 border-white/20"></div>
               </div>
             </div>
          </div>

          <div className="absolute -right-6 md:-right-10 top-1/2 -translate-y-1/2 z-0 hidden sm:block">
            <div className="w-10 h-32 bg-gradient-to-r from-[#2d2d44] to-[#1a1a2e] border-y-2 border-r-2 border-[#7e22ce]/50 rounded-r-3xl flex items-center justify-center overflow-hidden">
               <div className={`w-16 h-16 border-4 border-dashed border-gray-500 rounded-full ${spinning ? 'animate-spin' : ''}`}></div>
            </div>
          </div>

          {/* MAIN BOX: Extra pb-14/pb-16 added to create space for the button */}
          <div className="relative bg-[#090910] rounded-[2rem] px-6 py-8 pb-14 sm:px-10 sm:pt-10 sm:pb-16 border-[4px] border-[#3b0764] shadow-[0_0_80px_rgba(126,34,206,0.3)] z-10 mx-auto max-w-4xl w-full">
            <div className="absolute inset-2 border-2 border-[#a855f7]/30 rounded-3xl pointer-events-none"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              {[0, 1, 2].map((slot) => (
                <div key={slot} className="h-48 sm:h-64 bg-[#0e0e1a] border-2 border-[#7e22ce] rounded-2xl flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_40px_rgba(126,34,206,0.2)]">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-1/2 bg-[#a855f7] shadow-[0_0_10px_#a855f7]"></div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-1/2 bg-[#a855f7] shadow-[0_0_10px_#a855f7]"></div>
                  <MoneyBag />
                </div>
              ))}
            </div>

            <div className="mt-8 border-t-2 border-[#7e22ce]/30 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left relative z-20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl border border-[#a855f7]/50 flex items-center justify-center bg-[#a855f7]/10 text-[#a855f7] text-xl shadow-[inset_0_0_10px_rgba(168,85,247,0.2)]">🛡️</div>
                <div>
                  <h4 className="text-white font-black text-sm uppercase tracking-wide">100% Free</h4>
                  <p className="text-gray-400 text-xs mt-0.5">No hidden charges</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl border border-[#a855f7]/50 flex items-center justify-center bg-[#a855f7]/10 text-[#a855f7] text-xl shadow-[inset_0_0_10px_rgba(168,85,247,0.2)]">🎁</div>
                <div>
                  <h4 className="text-white font-black text-sm uppercase tracking-wide">Instant Win</h4>
                  <p className="text-gray-400 text-xs mt-0.5">Exciting rewards</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl border border-[#a855f7]/50 flex items-center justify-center bg-[#a855f7]/10 text-[#a855f7] text-xl shadow-[inset_0_0_10px_rgba(168,85,247,0.2)]">⚡</div>
                <div>
                  <h4 className="text-white font-black text-sm uppercase tracking-wide">Safe & Fair</h4>
                  <p className="text-gray-400 text-xs mt-0.5">Fair play guaranteed</p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= FIXED BUTTON: Scaled down & Pushed slightly lower ================= */}
          <div className="absolute -bottom-6 sm:-bottom-7 left-1/2 -translate-x-1/2 z-40 w-[90%] sm:w-auto flex justify-center">
            <button 
              onClick={handleSpin} 
              disabled={spinning}
              className={`bg-gradient-to-r from-[#6b21a8] via-[#9333ea] to-[#6b21a8] border-[3px] border-[#d8b4fe] text-white font-black text-lg sm:text-xl py-3.5 sm:py-4 px-10 sm:px-12 rounded-full shadow-[0_0_30px_rgba(147,51,234,0.5)] flex items-center justify-center gap-3 sm:gap-4 uppercase tracking-widest whitespace-nowrap transition-all duration-300 w-auto min-w-[260px] sm:min-w-[280px] ${spinning ? 'opacity-80 scale-95 cursor-not-allowed' : 'hover:scale-105 hover:shadow-[0_0_50px_rgba(147,51,234,0.8)]'}`}
            >
              <span className="text-xl sm:text-2xl flex items-center">🎰</span>
              <span className="flex items-center mt-[1px]">{spinning ? 'SPINNING...' : 'SPIN TO WIN'}</span>
              <span className="text-lg sm:text-xl hidden sm:flex items-center font-bold">→</span>
            </button>
          </div>

        </div>
      </div>

      {/* ================= EPIC WINNER POPUP ================= */}
      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-[#050508]/95 backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#a855f7]/20 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="bg-[#0a0a14] border-[3px] border-[#a855f7] rounded-[2.5rem] p-8 md:p-12 max-w-lg w-full text-center shadow-[0_0_100px_rgba(147,51,234,0.6)] animate-in zoom-in-95 duration-500 relative overflow-hidden">
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(168,85,247,0.3)_360deg)] animate-[spin_4s_linear_infinite] opacity-50 z-0" style={{ transformOrigin: 'center 20%' }}></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#eab308] to-[#ca8a04] rounded-full flex items-center justify-center text-5xl border-4 border-[#fef08a] shadow-[0_0_30px_rgba(234,179,8,0.6)] mb-6 animate-bounce">
                💰
              </div>
              
              <h3 className="text-3xl sm:text-4xl font-black text-white uppercase italic tracking-wider mb-2 drop-shadow-md">
                Epic Win!
              </h3>
              <p className="text-gray-300 font-medium mb-6">You've unlocked a massive cash bonus.</p>
              
              <div className="bg-gradient-to-b from-[#1a1025] to-[#0c0518] border-2 border-[#7e22ce] rounded-3xl py-8 px-8 w-full mb-8 relative overflow-hidden shadow-[inset_0_0_30px_rgba(126,34,206,0.3)]">
                <span className="text-xs text-[#a855f7] font-black uppercase tracking-[0.3em] block mb-2 relative z-10">Reward Amount</span>
                <span className="text-6xl sm:text-7xl font-black text-[#00E57A] drop-shadow-[0_0_20px_rgba(0,229,122,0.4)] relative z-10 flex items-center justify-center gap-2">
                  <span className="text-4xl text-[#00E57A]/80">₹</span>
                  {prize.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex flex-col gap-4 w-full">
                <button onClick={() => { setShowPopup(false); openRegister(); }} className="w-full bg-[#00E57A] hover:bg-[#00c968] text-[#08080C] font-black text-lg uppercase tracking-wide py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(0,229,122,0.3)] hover:shadow-[0_0_40px_rgba(0,229,122,0.5)] hover:-translate-y-1">
                  Claim to Wallet ⚡
                </button>
                <button onClick={() => { setShowPopup(false); openLogin(); }} className="w-full bg-transparent hover:bg-white/5 border border-white/20 text-gray-300 hover:text-white font-bold py-4 rounded-2xl transition-all">
                  Login & Redeem
                </button>
              </div>
            </div>
            
            <button onClick={() => setShowPopup(false)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/20 transition-all z-20">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}