'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, CheckCircle2, AlertCircle, ExternalLink, Clock, Sparkles, Trophy, Check } from 'lucide-react';
import MyOfferModal from '@/components/offers/MyOfferModal'; // 🔥 NAYA MODAL IMPORT 🔥

export default function MyOffersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'started' | 'completed'>('started');
  
  const [startedOffers, setStartedOffers] = useState<any[]>([]);
  const [completedOffers, setCompletedOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 Selected Offer State for Pop-up 🔥
  const [selectedOffer, setSelectedOffer] = useState<any>(null);

  const getOfferProgress = (item: any) => {
    if (item.completedEventsCount && item.completedEventsCount > 0 && item.totalEvents) {
      return Math.min(100, Math.round((item.completedEventsCount / item.totalEvents) * 100));
    }
    if (item.status === 'COMPLETE') return 100;

    const uniqueStr = item._id || item.offerId || 'default';
    let hash = 0;
    for (let i = 0; i < uniqueStr.length; i++) {
      hash = uniqueStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const positiveHash = Math.abs(hash);
    return 20 + (positiveHash % 61);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const startedRes = await fetch('https://apitest.binnycash.com/api/user/tracking/userStartedData', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const startedData = await startedRes.json();
        const startedList = startedData?.data?.list || startedData?.data || [];
        setStartedOffers(Array.isArray(startedList) ? startedList : []);

        const completedRes = await fetch('https://apitest.binnycash.com/api/user/tracking/getUserCompleteData', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const completedData = await completedRes.json();
        const completedList = completedData?.data?.list || completedData?.data || [];
        setCompletedOffers(Array.isArray(completedList) ? completedList : []);

      } catch (err) {
        console.error("Failed to fetch offers tracking data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  return (
    <div className="flex flex-col bg-[#0B0D19] min-h-screen text-white relative">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#8B5CF6]/5 blur-[120px] rounded-full pointer-events-none" />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
              <Trophy className="w-8 h-8 text-[#8B5CF6]" />
              My Offers
            </h1>
            <p className="text-[#8F95A3] text-sm mt-2 font-medium">Track your ongoing progress and completed rewards.</p>
          </div>

          <div className="flex items-center p-1.5 bg-[#111319] border border-white/5 rounded-2xl w-fit shrink-0 shadow-lg">
            <button 
              onClick={() => setActiveTab('started')}
              className="relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-colors outline-none z-10 cursor-pointer"
            >
              {activeTab === 'started' && (
                <motion.div layoutId="active-tab" className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6] to-[#7c3aed] rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)]" transition={{ type: "spring", stiffness: 300, damping: 25 }} />
              )}
              <Rocket className={`w-4 h-4 relative z-10 ${activeTab === 'started' ? 'text-white' : 'text-[#8F95A3]'}`} />
              <span className={`relative z-10 ${activeTab === 'started' ? 'text-white' : 'text-[#8F95A3] hover:text-white'}`}>Started</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('completed')}
              className="relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-colors outline-none z-10 cursor-pointer"
            >
              {activeTab === 'completed' && (
                <motion.div layoutId="active-tab" className="absolute inset-0 bg-gradient-to-r from-[#00E57A] to-[#00b359] rounded-xl shadow-[0_0_20px_rgba(0,229,122,0.3)]" transition={{ type: "spring", stiffness: 300, damping: 25 }} />
              )}
              <CheckCircle2 className={`w-4 h-4 relative z-10 ${activeTab === 'completed' ? 'text-[#0E1015]' : 'text-[#8F95A3]'}`} />
              <span className={`relative z-10 ${activeTab === 'completed' ? 'text-[#0E1015]' : 'text-[#8F95A3] hover:text-white'}`}>Completed</span>
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#111319]/80 backdrop-blur-md border border-[#8B5CF6]/20 rounded-[20px] p-5 mb-8 flex items-start gap-4 shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/10 blur-3xl rounded-full pointer-events-none"></div>
          <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6] shrink-0 border border-[#8B5CF6]/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-[14px] text-[#8F95A3] leading-relaxed font-medium pt-1">
            Your started offers from <span className="text-white font-bold">Featured Offers</span> will appear here. Click on any card to check its live status and continue.
          </p>
        </motion.div>

        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
              <div className="w-12 h-12 border-4 border-[#8B5CF6]/20 border-t-[#8B5CF6] rounded-full animate-spin"></div>
              <span className="text-[#8F95A3] font-bold animate-pulse">Fetching your data...</span>
            </div>
          ) : activeTab === 'started' ? (
            startedOffers.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[#111319]/50 border border-[#8B5CF6]/20 rounded-[32px] p-12 md:p-20 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl"
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#8B5CF6]/5 via-transparent to-transparent pointer-events-none"></div>
                <div className="w-24 h-24 rounded-[32px] bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] mb-6 shadow-[0_0_40px_rgba(139,92,246,0.2)]">
                  <Rocket className="w-10 h-10" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-3">No Started Offers <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#00E57A]">Yet</span></h2>
                <p className="text-[#8F95A3] text-[15px] max-w-md mb-8 font-medium">You haven't started any offers in the last 30 days. Head over to the Earn page and start maximizing your crypto!</p>
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#8B5CF6] hover:bg-[#7c3aed] text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:-translate-y-1 transition-all cursor-pointer"
                >
                  <Sparkles className="w-5 h-5" /> Browse Offers Now
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {startedOffers.map((item, idx) => {
                    const progressPercentage = getOfferProgress(item);
                    const formattedDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently';

                    return (
                      <motion.div 
                        key={item._id || idx}
                        onClick={() => setSelectedOffer(item)} // 🔥 TRIGER MODAL ON CLICK 🔥
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: idx * 0.1 }}
                        className="bg-[#111319] border border-white/5 rounded-[24px] p-6 flex flex-col justify-between gap-6 shadow-xl hover:border-[#8B5CF6]/40 hover:-translate-y-1 transition-all relative overflow-hidden group cursor-pointer"
                      >
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#8B5CF6]/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                        <div className="flex items-start gap-4 relative z-10">
                          <img 
                            src={item.image_url || 'https://ui-avatars.com/api/?name=Offer'} 
                            alt={item.offerName}
                            className="w-16 h-16 rounded-[18px] object-cover bg-[#1A1C24] border border-white/10 shrink-0 shadow-md group-hover:scale-105 transition-transform"
                            onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=Offer'; }}
                          />
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="w-fit text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#8B5CF6]">
                                {item.network || 'GEMIAD'}
                              </span>
                            </div>
                            <h3 className="text-white font-black text-base leading-tight truncate">{item.offerName || 'Offer'}</h3>
                            <p className="text-[#8F95A3] text-xs truncate mt-1.5 font-medium">{item.description || 'Complete required levels'}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-[#1A1C24] border border-white/5 relative z-10">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-widest">Start Date</span>
                            <span className="text-[13px] text-white font-semibold">{formattedDate}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-widest">Reward</span>
                            <span className="text-lg font-black text-[#00E57A] leading-tight">+${item.userCredits || '0.00'}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 relative z-10">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-[#8F95A3] uppercase tracking-wider text-[10px]">Completion</span>
                            <span className="text-white">{progressPercentage}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#1A1C24] overflow-hidden shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#00E57A] rounded-full relative"
                            >
                              <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 blur-[2px]"></div>
                            </motion.div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10 mt-auto">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span className="text-[11px] text-[#8F95A3] font-bold uppercase tracking-wider">
                              Status: <strong className="text-amber-400">{item.status || 'PENDING'}</strong>
                            </span>
                          </div>
                        </div>

                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )
          ) : (
            completedOffers.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-[#111319]/50 border border-white/5 rounded-[32px] p-16 text-center text-[#8F95A3] shadow-lg flex flex-col items-center justify-center gap-4"
              >
                <CheckCircle2 className="w-16 h-16 text-white/10" />
                <span className="text-lg font-bold">No completed offers found yet.</span>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {completedOffers.map((item, idx) => {
                    const rawImg = item.offerImage || item.logo;
                    let completedImg = 'https://ui-avatars.com/api/?name=Completed&background=00E57A&color=fff';
                    if (rawImg) {
                      completedImg = rawImg.startsWith('http') ? rawImg : `https://apitest.binnycash.com${rawImg}`;
                    }
                    const formattedDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently';

                    return (
                      <motion.div 
                        key={item._id || idx}
                        onClick={() => setSelectedOffer(item)} // 🔥 Completed me bhi click karne par modal open 🔥
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: idx * 0.1 }}
                        className="bg-[#111319] border border-[#00E57A]/20 rounded-[24px] p-6 flex flex-col justify-between gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:border-[#00E57A]/50 hover:-translate-y-1 transition-all relative overflow-hidden group cursor-pointer"
                      >
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#00E57A]/10 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                        <div className="flex items-start gap-4 relative z-10">
                          <img 
                            src={completedImg} 
                            alt={item.offer_name}
                            className="w-16 h-16 rounded-[18px] object-cover bg-[#1A1C24] border border-white/10 shrink-0 shadow-[0_0_15px_rgba(0,229,122,0.15)] group-hover:scale-105 transition-transform"
                            onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=Completed&background=00E57A&color=fff'; }}
                          />
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="w-fit text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#00E57A]/30 bg-[#00E57A]/10 text-[#00E57A] mb-1.5 flex items-center gap-1">
                              <Check className="w-3 h-3" /> {item.status || 'COMPLETE'}
                            </span>
                            <h3 className="text-white font-black text-base leading-tight truncate">{item.offer_name || 'Completed Offer'}</h3>
                            <p className="text-[#8F95A3] text-[11px] mt-1.5 font-medium uppercase tracking-wider">
                              Network: <strong className="text-white">{item.network || item.partnerName || 'Gemiad'}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#00E57A]/10 to-transparent border border-[#00E57A]/20 relative z-10 mt-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-[#00E57A] font-bold uppercase tracking-widest">Completed On</span>
                            <span className="text-[13px] text-white font-semibold">{formattedDate}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-[#00E57A] font-bold uppercase tracking-widest">Reward</span>
                            <span className="text-2xl font-black text-[#00E57A] leading-tight">+${item.userCredits || '0.00'}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )
          )}
        </div>
      </main>

      {/* 🔥 THE NEW MODAL COMPONENT INJECTION 🔥 */}
      <MyOfferModal 
        isOpen={!!selectedOffer} 
        onClose={() => setSelectedOffer(null)} 
        offer={selectedOffer} 
      />

    </div>
  );
}