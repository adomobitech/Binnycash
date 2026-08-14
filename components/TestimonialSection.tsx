'use client';

import { useTranslation } from './LanguageContext';

export default function TestimonialSection() {
  const { t } = useTranslation();

  const testimonials = [
    {
      quote: "Clean UI and no fake numbers. I literally downloaded a game, played it for 20 mins, and my UPI payout was instant.",
      author: "Rohit M.",
      role: "User",
      initial: "R",
      borderColor: "border-[#00E57A]/50 hover:border-[#00E57A] shadow-[0_0_30px_rgba(0,229,122,0.1)]",
      badgeColor: "text-[#00E57A]",
      starColor: "text-[#00E57A]"
    },
    {
      quote: "Surveys here actually pay out without glitching at the last second. Easiest ₹500 I made while waiting in a matchmaking queue.",
      author: "Pro_Sniper",
      role: "User",
      initial: "P",
      borderColor: "border-[#a855f7]/60 hover:border-[#a855f7] shadow-[0_0_30px_rgba(168,85,247,0.15)]",
      badgeColor: "text-[#a855f7]",
      starColor: "text-[#a855f7]"
    },
    {
      quote: "Love the dark theme! Finally a rewards site that doesn't look like a 2010 scam. The instant cashout is legit.",
      author: "Anjali K.",
      role: "User",
      initial: "A",
      borderColor: "border-[#00E57A]/50 hover:border-[#00E57A] shadow-[0_0_30px_rgba(0,229,122,0.1)]",
      badgeColor: "text-[#00E57A]",
      starColor: "text-[#00E57A]"
    },
    {
      quote: "Withdrawals hit my Paytm wallet in under 30 seconds. The speed on this platform is completely insane!",
      author: "Gamer_X",
      role: "User",
      initial: "G",
      borderColor: "border-[#38bdf8]/50 hover:border-[#38bdf8] shadow-[0_0_30px_rgba(56,189,248,0.1)]",
      badgeColor: "text-[#38bdf8]",
      starColor: "text-[#38bdf8]"
    },
    {
      quote: "Completed 2 game offerwalls and cashed out ₹1,000 straight to my bank. 100% legit stuff, highly recommended.",
      author: "Karan_99",
      role: "User",
      initial: "K",
      borderColor: "border-[#00E57A]/50 hover:border-[#00E57A] shadow-[0_0_30px_rgba(0,229,122,0.1)]",
      badgeColor: "text-[#00E57A]",
      starColor: "text-[#00E57A]"
    },
    {
      quote: "Best rewards platform so far. No endless looping surveys that kick you out at the 99% mark. Clean experience.",
      author: "Priya_S",
      role: "User",
      initial: "P",
      borderColor: "border-[#a855f7]/60 hover:border-[#a855f7] shadow-[0_0_30px_rgba(168,85,247,0.15)]",
      badgeColor: "text-[#a855f7]",
      starColor: "text-[#a855f7]"
    }
  ];

  // Seamless infinite loop ke liye array ko 3 baar repeat kar rahe hain
  const endlessReviews = [...testimonials, ...testimonials, ...testimonials];

  return (
    <div className="w-full bg-[#050208] py-24 overflow-hidden relative z-10 font-sans">
      <div className="max-w-[1200px] mx-auto px-6 mb-16">
        
        {/* Header Section */}
        <div className="text-center flex flex-col items-center">
          <h2 className="text-white font-black text-3xl md:text-5xl tracking-tight uppercase mb-3 flex items-center gap-3">
            <span className="text-[#00E57A] text-2xl">✨</span> 
            {t.Testimonials?.title1 || 'VOICES FROM THE'} <span className="text-[#00E57A] drop-shadow-[0_0_20px_rgba(0,229,122,0.4)] underline decoration-[#00E57A]/40 decoration-wavy underline-offset-8">{t.Testimonials?.title2 || 'GRIND'}</span>
            <span className="text-[#00E57A] text-2xl">✨</span>
          </h2>
          
          <p className="text-[#8F95A3] text-sm md:text-base font-medium">
            {t.Testimonials?.subtitle || 'Real feedback from our initial closed alpha cohort.'}
          </p>
        </div>

      </div>

      {/* 🔄 INFINITE AUTO-SCROLLING TICKER CONTAINER 🔄 */}
      <div className="relative w-full flex overflow-x-hidden group">
        {/* Left & Right Smooth Gradient Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050208] to-transparent z-20 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050208] to-transparent z-20 pointer-events-none"></div>

        <div className="flex gap-6 animate-[marquee_45s_linear_infinite] group-hover:[animation-play-state:paused] py-4 px-3">
          {endlessReviews.map((item, idx) => (
            <div 
              key={idx} 
              className={`bg-[#0b0615] border rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative overflow-hidden shrink-0 w-[350px] md:w-[380px] ${item.borderColor}`}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-[#a855f7] font-black text-xl shadow-inner">“</div>
                  <div className={`flex items-center gap-1 text-sm ${item.starColor}`}>
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                </div>
                <p className="text-[#D1D5DB] text-sm md:text-base font-medium leading-relaxed mb-8">{item.quote}</p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-white/[0.06]">
                <div className="w-11 h-11 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white font-black text-base shadow-sm">{item.initial}</div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm tracking-wide">{item.author}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" style={{ color: item.badgeColor === 'text-[#00E57A]' ? '#00E57A' : '#a855f7' }}></span>
                    <span className={`text-[10px] font-black tracking-widest uppercase ${item.badgeColor}`}>{item.role}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}