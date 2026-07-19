'use client';

export default function LootVault() {
  const leftRewards = [
    { title: "EXCLUSIVE LOOTS", desc: "Rare skins, crates, and legendary bundles just for you.", icon: "🎁" },
    { title: "DAILY EVENTS", desc: "Join daily events and tournaments to win big rewards.", icon: "🏆" },
    { title: "REAL CASH PRIZES", desc: "Compete and win exciting real cash rewards.", icon: "🪙" },
    { title: "100% SECURE", desc: "Safe transactions and secure rewards delivery.", icon: "🛡️" },
  ];

  const rightRewards = [
    { title: "EASY SIGNUP", desc: "Quick and easy registration in just a minute.", icon: "👤" },
    { title: "INSTANT REWARDS", desc: "Get your rewards instantly after completing tasks.", icon: "⚡" },
    { title: "EXCITING OFFERS", desc: "Grab limited-time offers and bonus rewards.", icon: "🏷️" },
    { title: "COMMUNITY", desc: "Be a part of our gaming community and grow together.", icon: "👥" },
  ];

  return (
    <div className="w-full relative overflow-hidden font-sans flex items-center justify-center min-h-[700px] lg:min-h-[900px] bg-[#030308]">
      
      {/* ================= BACKGROUND IMAGE ================= */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/lootvault.png')" }} 
      ></div>

      {/* ================= EDGE SHADOWS (The Fix for Readability) ================= */}
      {/* Left dark fade - masks the left vault hinges */}
      <div className="absolute inset-y-0 left-0 w-full lg:w-[45%] bg-gradient-to-r from-[#030308] via-[#030308]/70 to-transparent z-10 pointer-events-none"></div>
      
      {/* Right dark fade - masks the right vault door */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-[45%] bg-gradient-to-l from-[#030308] via-[#030308]/70 to-transparent z-10 pointer-events-none"></div>

      {/* Center ambient dim (Optional, keeps the very bright center slightly tame) */}
      <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none"></div>

      {/* ================= MAIN CONTENT FLEXBOX ================= */}
      {/* Changed to max-w-[1920px] and flex justify-between to push to extreme edges */}
      <div className="max-w-[1920px] w-full mx-auto flex flex-col lg:flex-row justify-between items-center px-6 lg:px-12 xl:px-24 relative z-20 py-24 gap-20 lg:gap-0">
        
        {/* ================= LEFT SIDE ================= */}
        <div className="w-full lg:w-[380px] flex flex-col gap-10 mt-20 lg:mt-0">
          {leftRewards.map((item, i) => (
            <div key={i} className="flex items-center gap-5 group cursor-pointer relative">
              {/* Neon Circle Icon */}
              <div className="w-14 h-14 rounded-full border border-fuchsia-500 flex items-center justify-center text-xl text-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.3)] group-hover:shadow-[0_0_25px_rgba(217,70,239,0.8)] group-hover:scale-110 group-hover:border-white transition-all duration-300 shrink-0 bg-[#030308]/80 backdrop-blur-sm z-10">
                {item.icon}
              </div>
              
              {/* Text */}
              <div className="flex flex-col z-10">
                <h4 className="text-white text-xs md:text-sm font-bold tracking-widest uppercase group-hover:text-fuchsia-400 transition-colors">
                  {item.title}
                </h4>
                <p className="text-gray-300 text-[10px] md:text-xs leading-relaxed mt-1 max-w-[240px]">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="w-full lg:w-[380px] flex flex-col gap-10">
          {rightRewards.map((item, i) => (
            <div key={i} className="flex items-center gap-5 group cursor-pointer relative">
              {/* Neon Circle Icon */}
              <div className="w-14 h-14 rounded-full border border-fuchsia-500 flex items-center justify-center text-xl text-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.3)] group-hover:shadow-[0_0_25px_rgba(217,70,239,0.8)] group-hover:scale-110 group-hover:border-white transition-all duration-300 shrink-0 bg-[#030308]/80 backdrop-blur-sm z-10">
                {item.icon}
              </div>
              
              {/* Text */}
              <div className="flex flex-col z-10">
                <h4 className="text-white text-xs md:text-sm font-bold tracking-widest uppercase group-hover:text-fuchsia-400 transition-colors">
                  {item.title}
                </h4>
                <p className="text-gray-300 text-[10px] md:text-xs leading-relaxed mt-1 max-w-[240px]">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ================= BOTTOM TIMER PILL ================= */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 w-[90%] md:w-auto flex justify-center">
        <div className="bg-[#030308]/90 backdrop-blur-md border border-white/10 rounded-full py-2 px-4 md:px-6 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,0,0,0.8)] cursor-default">
          <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-[10px]">⏱️</span>
          </div>
         </div>
      </div>

    </div>
  );
}