'use client';

export default function TestimonialSection() {
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
    }
  ];

  return (
    <div className="w-full bg-[#050208] py-24 px-6 relative z-10 font-sans">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-[#00E57A] text-xs font-black uppercase tracking-[0.25em] mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E57A] animate-pulse"></span>
            EARLY FEEDBACK
          </div>
          
          <h2 className="text-white font-black text-3xl md:text-5xl tracking-tight uppercase mb-3 flex items-center gap-3">
            <span className="text-[#00E57A] text-2xl">✨</span> 
            VOICES FROM THE <span className="text-[#00E57A] drop-shadow-[0_0_20px_rgba(0,229,122,0.4)] underline decoration-[#00E57A]/40 decoration-wavy underline-offset-8">GRIND</span>
            <span className="text-[#00E57A] text-2xl">✨</span>
          </h2>
          
          <p className="text-[#8F95A3] text-sm md:text-base font-medium">
            Real feedback from our initial 5-member closed alpha cohort.
          </p>
        </div>

        {/* Testimonials Grid (All 3 visible cleanly without slider dots) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <div 
              key={idx}
              className={`bg-[#0b0615] border rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group ${item.borderColor}`}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-[#a855f7] font-black text-xl shadow-inner">
                    “
                  </div>
                  
                  {/* Stars */}
                  <div className={`flex items-center gap-1 text-sm ${item.starColor}`}>
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                </div>

                {/* Testimonial Quote */}
                <p className="text-[#D1D5DB] text-sm md:text-base font-medium leading-relaxed mb-8">
                  {item.quote}
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-4 pt-4 border-t border-white/[0.06]">
                <div className="w-11 h-11 rounded-xl bg-[#120a22] border border-white/10 flex items-center justify-center text-white font-black text-base shadow-sm">
                  {item.initial}
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm tracking-wide">{item.author}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" style={{ color: item.badgeColor === 'text-[#00E57A]' ? '#00E57A' : '#a855f7' }}></span>
                    <span className={`text-[10px] font-black tracking-widest uppercase ${item.badgeColor}`}>
                      {item.role}
                    </span>
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