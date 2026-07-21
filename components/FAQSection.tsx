'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(1); // Default 2nd item open like image

  const faqs = [
    {
      num: "01",
      question: "How do I start earning?",
      answer: "Sign up, explore tasks, complete offers and surveys, and earn exciting rewards.",
      icon: "👤",
      color: "border-[#a855f7]/40 hover:border-[#a855f7]",
      numBg: "text-[#a855f7]"
    },
    {
      num: "02",
      question: "Is there any investment required?",
      answer: "No, BinnyCash is 100% free to join and start earning.",
      icon: "💳",
      color: "border-[#38bdf8]/60 shadow-[0_0_30px_rgba(56,189,248,0.1)]",
      numBg: "text-[#38bdf8]",
      hasExtra: true
    },
    {
      num: "03",
      question: "How fast are the cashouts?",
      answer: "Cashouts are processed instantly. You'll receive your money in minutes.",
      icon: "⏱️",
      color: "border-[#00E57A]/40 hover:border-[#00E57A]",
      numBg: "text-[#00E57A]"
    },
    {
      num: "04",
      question: "Why do some surveys get rejected?",
      answer: "Surveys may be rejected if attention checks fail or answers are inconsistent.",
      icon: "📄",
      color: "border-[#a855f7]/40 hover:border-[#a855f7]",
      numBg: "text-[#a855f7]"
    }
  ];

  return (
    <div className="w-full bg-[#050208] py-24 px-6 relative z-10 font-sans">
      <div className="max-w-[1000px] mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-[#a855f7] text-xs font-black uppercase tracking-[0.25em] mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-pulse"></span>
            INTEL CENTER
          </div>
          <h2 className="text-white font-black text-3xl md:text-5xl tracking-tight uppercase mb-3">
            MISSION <span className="text-[#a855f7] drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">BRIEFING</span> (FAQ)
          </h2>
          <p className="text-[#8F95A3] text-sm md:text-base font-medium">
            Everything you need to know about BinnyCash
          </p>
        </div>

        {/* FAQ List */}
        <div className="flex flex-col gap-4 mb-8">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx} 
                className={`bg-[#0b0615] border rounded-2xl transition-all duration-300 overflow-hidden ${faq.color}`}
              >
                {/* Main Question Bar */}
                <button 
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-6">
                    <span className={`font-black text-xl tracking-wider ${faq.numBg}`}>{faq.num}</span>
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-lg shadow-inner">
                      {faq.icon}
                    </div>
                    <span className="text-white font-bold text-base md:text-lg tracking-wide">{faq.question}</span>
                  </div>

                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg transition-transform duration-300 ${isOpen ? 'bg-[#38bdf8] text-black shadow-[0_0_15px_rgba(56,189,248,0.5)]' : 'bg-white/5 text-[#8F95A3] border border-white/10'}`}>
                    {isOpen ? '−' : '+'}
                  </div>
                </button>

                {/* Expanded Content */}
                {isOpen && (
                  <div className="px-6 pb-6 pt-2 border-t border-white/5">
                    <p className="text-[#8F95A3] text-sm md:text-base pl-[72px] mb-6">
                      {faq.answer}
                    </p>

                    {/* Extra Badges Row (Specifically shown when 2nd item is open, matching image) */}
                    {faq.hasExtra && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ml-0 md:ml-[72px] pt-2">
                        <div className="bg-[#120a22] border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-[#38bdf8] font-bold text-xs">
                            <span>🛡️</span> 100% Free
                          </div>
                          <span className="text-[#8F95A3] text-[10px]">No hidden charges</span>
                        </div>
                        <div className="bg-[#120a22] border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-[#00E57A] font-bold text-xs">
                            <span>🔒</span> Safe & Secure
                          </div>
                          <span className="text-[#8F95A3] text-[10px]">Your data is protected</span>
                        </div>
                        <div className="bg-[#120a22] border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-[#a855f7] font-bold text-xs">
                            <span>👥</span> Trusted Platform
                          </div>
                          <span className="text-[#8F95A3] text-[10px]">Loved by thousands</span>
                        </div>
                        <div className="bg-[#120a22] border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs">
                            <span>⚡</span> Instant Payouts
                          </div>
                          <span className="text-[#8F95A3] text-[10px]">Withdraw in minutes</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Support Banner (Exact match to image) */}
        <div className="bg-[#0b0615] border border-[#2e1065] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between shadow-[0_0_30px_rgba(46,16,101,0.2)]">
          <div className="flex items-center gap-5 mb-6 md:mb-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4c1d95] to-[#1e1b4b] border border-[#7e22ce]/50 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(126,34,206,0.3)]">
              🎧
            </div>
            <div className="flex flex-col">
              <h4 className="text-white font-black text-lg md:text-xl tracking-wide mb-1">Still have questions?</h4>
              <p className="text-[#8F95A3] text-xs md:text-sm">Our support team is always here to help you.</p>
            </div>
          </div>

          <Link href="/contact">
            <button className="bg-[#120a22] hover:bg-[#1a0f30] border border-[#7e22ce]/50 text-white font-black text-xs uppercase tracking-widest px-6 py-4 rounded-xl flex items-center gap-3 transition-all shadow-[0_0_15px_rgba(126,34,206,0.2)] cursor-pointer">
              CONTACT SUPPORT
              <span className="w-7 h-7 rounded-lg bg-[#7e22ce] text-white flex items-center justify-center text-sm">↗</span>
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}