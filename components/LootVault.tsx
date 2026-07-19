'use client';

export default function LootVault() {
  const rewards = [
    { title: "LEGENDARY SKINS", desc: "EPIC & RARE SKINS", icon: "🔫", delay: "0s", duration: "4s" },
    { title: "UC REWARDS", desc: "BGMI UC CASH", icon: "🪙", delay: "0.5s", duration: "5s" },
    { title: "CASH REWARDS", desc: "REAL MONEY PRIZES", icon: "💵", delay: "1s", duration: "4.5s" },
    { title: "GIFT CARDS", desc: "GOOGLE PLAY & MORE", icon: "🎁", delay: "0.2s", duration: "4.8s" },
    { title: "ROYAL PASS", desc: "ELITE PASS & RP", icon: "👑", delay: "0.8s", duration: "4.2s" },
    { title: "PREMIUM CRATES", desc: "OPEN & WIN BIG", icon: "📦", delay: "1.2s", duration: "5.5s" },
  ];

  return (
    <div className="w-full relative overflow-hidden font-sans flex items-center justify-center min-h-[700px] lg:min-h-[900px] bg-[#030308] border-y border-white/5">
      
      {/* Floating Animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-hologram {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}} />

      {/* ================= 100% CLEAR BACKGROUND ================= */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/lootvault.png')" }} 
      ></div>

      {/* Center ko bright chhod kar sirf borders pe shadow (Vignette) taaki cards pop karein */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#030308_100%)] z-10 pointer-events-none"></div>

      {/* ================= MAIN GRID ================= */}
      <div className="max-w-[1450px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center px-6 relative z-20 py-24">
        
        {/* Left Cards */}
        <div className="lg:col-span-3 flex flex-col gap-6 mt-40 lg:mt-0">
          {rewards.slice(0, 3).map((item, i) => (
            <div 
              key={i} 
              className="relative group cursor-pointer"
              style={{ animation: `float-hologram ${item.duration} ease-in-out infinite`, animationDelay: item.delay }}
            >
              {/* Extra Glow behind the card */}
              <div className="absolute inset-0 bg-fuchsia-600/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Solid Glass Card */}
              <div className="relative flex items-center gap-4 bg-[#05050a]/85 backdrop-blur-xl p-4 rounded-2xl border border-white/10 border-l-4 border-l-fuchsia-500 hover:border-fuchsia-500/50 hover:bg-[#0a0a14]/95 hover:scale-105 transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
                
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-fuchsia-900/40 to-transparent border border-fuchsia-500/30 flex items-center justify-center text-2xl group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300 shadow-inner shrink-0">
                  <span className="drop-shadow-lg">{item.icon}</span>
                </div>
                
                <div className="flex flex-col">
                  <h4 className="text-white font-black text-sm tracking-widest uppercase drop-shadow-md">{item.title}</h4>
                  <p className="text-fuchsia-400 text-[10px] uppercase font-bold tracking-wider">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Center - EMPTY (Full brightness vault) */}
        <div className="lg:col-span-6 h-[300px] lg:h-[600px] pointer-events-none"></div>

        {/* Right Cards */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {rewards.slice(3, 6).map((item, i) => (
            <div 
              key={i} 
              className="relative group cursor-pointer"
              style={{ animation: `float-hologram ${item.duration} ease-in-out infinite`, animationDelay: item.delay }}
            >
              {/* Extra Glow behind the card */}
              <div className="absolute inset-0 bg-fuchsia-600/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Solid Glass Card */}
              <div className="relative flex items-center gap-4 bg-[#05050a]/85 backdrop-blur-xl p-4 rounded-2xl border border-white/10 border-r-4 border-r-fuchsia-500 hover:border-fuchsia-500/50 hover:bg-[#0a0a14]/95 hover:scale-105 transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
                
                <div className="w-14 h-14 rounded-xl bg-gradient-to-bl from-fuchsia-900/40 to-transparent border border-fuchsia-500/30 flex items-center justify-center text-2xl group-hover:-rotate-6 group-hover:scale-110 transition-transform duration-300 shadow-inner shrink-0">
                  <span className="drop-shadow-lg">{item.icon}</span>
                </div>
                
                <div className="flex flex-col">
                  <h4 className="text-white font-black text-sm tracking-widest uppercase drop-shadow-md">{item.title}</h4>
                  <p className="text-fuchsia-400 text-[10px] uppercase font-bold tracking-wider">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Floating Timer Banner */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-[450px] z-20 px-6">
        <div className="bg-[#05050a]/90 backdrop-blur-xl border border-fuchsia-500/50 rounded-full py-4 px-6 flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(217,70,239,0.3)] hover:shadow-[0_0_60px_rgba(217,70,239,0.6)] transition-all cursor-default">
          <span className="text-fuchsia-500 text-2xl animate-spin-slow">🕒</span>
          <p className="text-white text-xs md:text-sm font-medium tracking-wide">
            NEW LOOT ADDED <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-400 font-black uppercase ml-1 animate-pulse drop-shadow-lg">Every 6 Hours</span>
          </p>
        </div>
      </div>

    </div>
  );
}