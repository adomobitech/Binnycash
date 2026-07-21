'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API request for support ticket creation
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="w-full min-h-screen bg-[#050208] py-20 px-6 font-sans relative overflow-hidden flex flex-col justify-between">
      
      {/* Background Ambience Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7e22ce]/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-[1100px] mx-auto w-full relative z-10 my-auto">
        
        {/* Header */}
        <div className="text-center mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-[#00E57A] text-xs font-black uppercase tracking-[0.25em] mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E57A] animate-pulse"></span>
            HELP DESK
          </div>
          <h1 className="text-white font-black text-4xl md:text-5xl tracking-tight uppercase mb-4">
            CONTACT <span className="text-[#a855f7] drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">SUPPORT</span>
          </h1>
          <p className="text-[#8F95A3] text-sm md:text-base font-medium max-w-md">
            Facing issues with cashouts, survey tracking, or offers? Drop a message and our intel team will assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Info Cards */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            <div className="bg-[#0b0615] border border-[#2e1065] rounded-3xl p-6 shadow-[0_0_30px_rgba(46,16,101,0.2)]">
              <div className="w-12 h-12 rounded-xl bg-[#7e22ce]/20 border border-[#7e22ce]/40 flex items-center justify-center text-xl mb-4">
                ⚡
              </div>
              <h3 className="text-white font-bold text-base mb-1">Fast Response</h3>
              <p className="text-[#8F95A3] text-xs">Our average ticket resolution time is under 24 hours.</p>
            </div>

            <div className="bg-[#0b0615] border border-[#2e1065] rounded-3xl p-6 shadow-[0_0_30px_rgba(46,16,101,0.2)]">
              <div className="w-12 h-12 rounded-xl bg-[#00E57A]/10 border border-[#00E57A]/30 flex items-center justify-center text-xl mb-4">
                💬
              </div>
              <h3 className="text-white font-bold text-base mb-1">Community Discord</h3>
              <p className="text-[#8F95A3] text-xs mb-4">Get instant help from mods and fellow grinders on Discord.</p>
              <a 
                href="https://discord.gg/binnycash" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-[#00E57A] font-black text-xs uppercase tracking-wider hover:underline"
              >
                Join Server <span>↗</span>
              </a>
            </div>

            <div className="bg-[#0b0615] border border-[#2e1065] rounded-3xl p-6 shadow-[0_0_30px_rgba(46,16,101,0.2)]">
              <div className="w-12 h-12 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex items-center justify-center text-xl mb-4">
                📧
              </div>
              <h3 className="text-white font-bold text-base mb-1">Direct Email</h3>
              <p className="text-[#8F95A3] text-xs">support@binnycash.com</p>
            </div>

          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-8 bg-[#0b0615] border border-[#3b0764] rounded-3xl p-8 md:p-10 shadow-[0_0_40px_rgba(126,34,206,0.15)] relative overflow-hidden">
            
            {isSubmitted ? (
              <div className="py-16 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-[#00E57A]/20 border border-[#00E57A]/50 flex items-center justify-center text-4xl text-[#00E57A] mb-6 shadow-[0_0_30px_rgba(0,229,122,0.3)]">
                  ✓
                </div>
                <h3 className="text-white font-black text-2xl mb-2">Message Transmitted!</h3>
                <p className="text-[#8F95A3] text-sm max-w-sm mb-8">
                  Your ticket has been logged into our support queue. We'll get back to your registered email shortly.
                </p>
                <button 
                  onClick={() => { setIsSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}
                  className="bg-[#120a22] hover:bg-[#1a0f30] border border-[#7e22ce]/50 text-white font-black text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl transition-all"
                >
                  Send Another Ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-white font-bold text-xs uppercase tracking-wider">Your Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Rohit Munjal"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="bg-[#120a22] border border-[#2e1065] focus:border-[#a855f7] rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-white font-bold text-xs uppercase tracking-wider">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="rohit@binnycash.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="bg-[#120a22] border border-[#2e1065] focus:border-[#a855f7] rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-white font-bold text-xs uppercase tracking-wider">Subject / Issue Type</label>
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="bg-[#120a22] border border-[#2e1065] focus:border-[#a855f7] rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-colors cursor-pointer"
                  >
                    <option value="payout">Cashout / Payout Delay</option>
                    <option value="survey">Survey / Offer Not Credited</option>
                    <option value="account">Account Access / Login Issue</option>
                    <option value="other">Other Inquiry</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-white font-bold text-xs uppercase tracking-wider">Message Details</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Describe your issue clearly (include transaction ID if related to payout)..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="bg-[#120a22] border border-[#2e1065] focus:border-[#a855f7] rounded-xl p-4 text-white text-sm outline-none transition-colors resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 bg-gradient-to-r from-[#7e22ce] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'TRANSMITTING...' : 'SUBMIT SUPPORT TICKET'}
                  {!isLoading && <span>→</span>}
                </button>
              </form>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}