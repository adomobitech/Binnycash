'use client';

import { useTranslation } from './LanguageContext';

export default function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    {
      title: t.Features?.f1?.title || 'Free To Play',
      desc: t.Features?.f1?.desc || 'No investment required',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white drop-shadow-md">
          <rect x="2" y="6" width="20" height="12" rx="2"/>
          <path d="M6 12h4"/><path d="M8 10v4"/>
          <circle cx="15" cy="13" r="1"/><circle cx="18" cy="11" r="1"/>
        </svg>
      )
    },
    {
      title: t.Features?.f2?.title || 'Premium Surveys',
      desc: t.Features?.f2?.desc || 'Get paid for your opinions',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white drop-shadow-md">
          <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          <path d="m9 14 2 2 4-4"/>
        </svg>
      )
    },
    {
      title: t.Features?.f3?.title || 'Epic Offers',
      desc: t.Features?.f3?.desc || 'Play games & test apps',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white drop-shadow-md">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      )
    },
    {
      title: t.Features?.f4?.title || 'Instant Cashouts',
      desc: t.Features?.f4?.desc || 'Withdraw your loot fast',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white drop-shadow-md">
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
        </svg>
      )
    },
    {
      title: t.Features?.f5?.title || '100% Secure',
      desc: t.Features?.f5?.desc || 'Safe, verified platform',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-white drop-shadow-md">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
        </svg>
      )
    }
  ];

  return (
    <div className="w-full bg-[#050208] py-24 font-sans relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#a855f7]/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <div className="max-w-[1300px] mx-auto px-6 relative z-10 flex flex-col items-center">
        <div className="text-center mb-20 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/30 text-[#a855f7] text-xs font-black uppercase tracking-widest mb-6 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-pulse"></span>
            {t.Features?.tagline || 'Level Up Your Earnings'}
          </div>

          <h2 className="text-white font-black text-4xl md:text-5xl tracking-tight mb-5 uppercase">
            {t.Features?.title1 || 'Built For The'} <span className="text-[#a855f7] drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">{t.Features?.title2 || 'Grind'}</span>
          </h2>
          
          <p className="text-[#8F95A3] text-sm md:text-base font-medium tracking-wide max-w-lg">
            {t.Features?.subtitle || 'Complete high-paying surveys & epic offers. For Gamers, Hustlers & Dreamers.'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6 w-full max-w-6xl">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center group cursor-default">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-b from-[#b66df8] to-[#7e22ce] flex items-center justify-center shadow-[0_10px_40px_rgba(168,85,247,0.35)] group-hover:shadow-[0_15px_50px_rgba(168,85,247,0.5)] group-hover:-translate-y-2 transition-all duration-300 mb-6">
                {feature.icon}
              </div>
              <h3 className="text-white font-bold text-sm md:text-base mb-1.5 tracking-wide">
                {feature.title}
              </h3>
              <p className="text-[#8F95A3] text-xs md:text-sm">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}