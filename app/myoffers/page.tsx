'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Rocket, CheckCircle2, AlertCircle, ExternalLink, Clock, Sparkles, Trophy, Check } from 'lucide-react';

export default function MyOffersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'started' | 'completed'>('started');
  
  const [startedOffers, setStartedOffers] = useState<any[]>([]);
  const [completedOffers, setCompletedOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Unique ID based Deterministic Progress Generator
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
    <div className="flex bg-[#0E1015] min-h-screen text-white">
      <Sidebar />

      <div className="flex-1 overflow-x-hidden pt-6 px-4 md:px-8 pb-20 custom-scrollbar flex flex-col justify-between">
        
        <div>
          {/* TOP TABS HEADER */}
          <div className="flex items-center gap-3 mb-6 bg-[#111319] p-2 rounded-2xl border border-white/5 w-fit">
            <button 
              onClick={() => setActiveTab('started')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'started' 
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7c3aed] text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]' 
                  : 'text-[#8F95A3] hover:text-white hover:bg-white/5'
              }`}
            >
              <Rocket className="w-4 h-4" /> Started Offer
            </button>
            
            <button 
              onClick={() => setActiveTab('completed')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'completed' 
                  ? 'bg-gradient-to-r from-[#00E57A] to-[#00b359] text-[#0E1015] font-black shadow-[0_0_20px_rgba(0,229,122,0.4)]' 
                  : 'text-[#8F95A3] hover:text-white hover:bg-white/5'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" /> Completed Offer
            </button>
          </div>

          {/* INFO BANNER */}
          <div className="bg-[#111319] border border-[#8B5CF6]/20 rounded-2xl p-4 md:p-5 mb-8 flex items-start gap-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/10 blur-3xl rounded-full"></div>
            <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6] shrink-0 mt-0.5 border border-[#8B5CF6]/20">
              <AlertCircle className="w-4 h-4" />
            </div>
            <p className="text-[13px] text-[#8F95A3] leading-relaxed font-medium">
              Your started offers from <span className="text-white font-bold">Featured Offers</span> will appear here. Offers started from an offerwall will appear inside that specific offerwall's started offer list.
            </p>
          </div>

          {/* CONTENT AREA */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : activeTab === 'started' ? (
            startedOffers.length === 0 ? (
              <div className="bg-[#111319] border border-[#8B5CF6]/30 rounded-[32px] p-8 md:p-16 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.1)] mb-12">
                <div className="absolute inset-0 bg-gradient-to-b from-[#8B5CF6]/5 via-transparent to-transparent pointer-events-none"></div>
                
                <div className="w-24 h-24 rounded-3xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] mb-6 shadow-[0_0_30px_rgba(139,92,246,0.2)] animate-pulse">
                  <Rocket className="w-12 h-12" />
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                  No Started Offers <span className="text-[#8B5CF6]">Yet</span>
                </h2>
                <p className="text-[#8F95A3] text-sm max-w-md mb-8 font-medium">
                  You haven't started any offers in the last 30 days. Start an offer and track your progress here.
                </p>

                <button 
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#7c3aed] text-white font-bold text-sm shadow-[0_4px_20px_rgba(139,92,246,0.5)] hover:scale-105 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Browse Offers
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {startedOffers.map((item, idx) => {
                  const progressPercentage = getOfferProgress(item);
                  const formattedDate = item.createdAt 
                    ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Recently';

                  return (
                    <div key={item._id || idx} className="bg-[#111319] border border-white/5 rounded-2xl p-6 flex flex-col justify-between gap-6 shadow-xl hover:border-[#8B5CF6]/40 transition-all">
                      
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <img 
                            src={item.image_url || 'https://ui-avatars.com/api/?name=Offer'} 
                            alt={item.offerName}
                            className="w-14 h-14 rounded-2xl object-cover bg-white/5 border border-white/10 shrink-0"
                            onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=Offer'; }}
                          />
                          <div className="flex flex-col">
                            <span className="w-fit text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 mb-1.5">
                              {item.network || 'GEMIAD'}
                            </span>
                            <h3 className="text-white font-black text-[15px] leading-tight line-clamp-1">{item.offerName || 'Offer'}</h3>
                            <p className="text-[#8F95A3] text-xs line-clamp-1 mt-1 font-medium">{item.description || 'Complete Levels'}</p>
                            <span className="text-[11px] text-[#8F95A3] font-medium mt-2">Start Date: {formattedDate}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F95A3] block">EARN</span>
                          <span className="text-base font-black text-[#00E57A]">+${item.userCredits || '0.00'}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-[#8F95A3]">Progress</span>
                          <span className="text-white">{progressPercentage}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#0E1015] overflow-hidden border border-white/5">
                          <div 
                            className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#00E57A] rounded-full transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span className="text-xs text-[#8F95A3] font-medium">Status: <strong className="text-amber-400 uppercase tracking-wide">{item.status || 'PENDING'}</strong></span>
                        </div>
                        {item.click_url && (
                          <a 
                            href={item.click_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B5CF6]/10 hover:bg-[#8B5CF6] text-[#8B5CF6] hover:text-white border border-[#8B5CF6]/30 text-xs font-bold transition-all"
                          >
                            Continue <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )
          ) : (
            completedOffers.length === 0 ? (
              <div className="bg-[#111319] border border-white/5 rounded-[32px] p-12 text-center text-[#8F95A3] mb-12">
                No completed offers found yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {completedOffers.map((item, idx) => {
                  // Fixed Image URL parsing for Completed Offers
                  const rawImg = item.offerImage || item.logo;
                  let completedImg = 'https://ui-avatars.com/api/?name=Completed&background=00E57A&color=fff';
                  if (rawImg) {
                    completedImg = rawImg.startsWith('http') ? rawImg : `https://apitest.binnycash.com${rawImg}`;
                  }

                  const formattedDate = item.createdAt 
                    ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Recently';

                  return (
                    <div key={item._id || idx} className="bg-[#111319] border border-[#00E57A]/20 rounded-2xl p-6 flex flex-col justify-between gap-5 shadow-xl hover:border-[#00E57A]/50 transition-all relative overflow-hidden">
                      <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#00E57A]/10 blur-3xl rounded-full pointer-events-none"></div>

                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <img 
                            src={completedImg} 
                            alt={item.offer_name}
                            className="w-14 h-14 rounded-2xl object-cover bg-white/5 border border-white/10 shrink-0 shadow-md"
                            onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=Completed&background=00E57A&color=fff'; }}
                          />
                          <div className="flex flex-col">
                            <span className="w-fit text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#00E57A]/10 text-[#00E57A] border border-[#00E57A]/20 mb-1.5 flex items-center gap-1">
                              <Check className="w-3 h-3" /> {item.status || 'COMPLETE'}
                            </span>
                            <h3 className="text-white font-black text-[15px] leading-tight truncate max-w-[200px] md:max-w-[240px]">{item.offer_name || 'Completed Offer'}</h3>
                            <p className="text-[#8F95A3] text-xs mt-1 font-medium">Network: <strong className="text-white">{item.network || item.partnerName || 'Gemiad'}</strong></p>
                            <span className="text-[11px] text-[#8F95A3] font-medium mt-1">Completed: {formattedDate}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F95A3] block">REWARD</span>
                          <span className="text-lg font-black text-[#00E57A]">+${item.userCredits || '0.00'}</span>
                        </div>
                      </div>

                      {/* Success Bottom Bar */}
                      <div className="bg-[#0E1015] rounded-xl p-3 border border-[#00E57A]/10 flex items-center justify-between text-xs font-medium">
                        <span className="text-[#8F95A3] flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-[#00E57A]" /> Time Taken: <strong className="text-white">{item.timeTaken ? `${item.timeTaken}s` : 'Instant'}</strong>
                        </span>
                        <span className="text-[#00E57A] font-bold bg-[#00E57A]/10 px-2.5 py-1 rounded-lg border border-[#00E57A]/20">
                          Credited Successfully
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>

        {/* BOTTOM BANNER */}
        <div className="w-full bg-[#111319] border border-[#8B5CF6]/30 rounded-2xl p-6 relative overflow-hidden shadow-xl flex items-center justify-between mt-auto">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B5CF6]/10 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-white text-sm md:text-base font-black tracking-wide">
                Complete offers to earn rewards. Keep tracking your progress and maximize your earnings!
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 relative z-10 shrink-0">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-xs font-black text-[#8B5CF6]">💰</div>
              <div className="w-10 h-10 rounded-full bg-[#00E57A]/20 border border-[#00E57A]/40 flex items-center justify-center text-xs font-black text-[#00E57A]">💎</div>
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs font-black text-amber-400">🚀</div>
            </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.3); }
      `}} />
    </div>
  );
}