'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Lock, BadgePercent, Loader2, X, ExternalLink } from "lucide-react";

// --- PRESET GRADIENTS FOR CARDS (Matching Screenshot Theme) ---
const COLOR_PRESETS = [
  "from-[#2A2346] to-[#1B162C]", // Purple (TheoremReach style)
  "from-[#1A3028] to-[#12211B]", // Green (CPX style)
  "from-[#1B2A47] to-[#121D33]", // Blue (BitLabs style)
  "from-[#2B1B1B] to-[#1F1212]", // Red/Orange tint
  "from-[#1F2937] to-[#111827]"  // Standard Dark Gray
];

export default function SurveywallSlider({ surveywalls = [], isLoading = false }: any) {
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Arrow & UI States
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  // Modal & API Click States
  const [selectedSurveywall, setSelectedSurveywall] = useState<any>(null);

  // 🚀 SLIDER LOGIC
  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 5); 
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5); 
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [surveywalls]);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -180, behavior: 'smooth' }); 
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 180, behavior: 'smooth' });
    }
  };

  // 🔥 DIRECT URL MAKER 🔥
  const getAttachmentUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `https://api.binnycash.com${cleanPath}`;
  };

  // 🔥 SURVEY CLICK HANDLER 🔥
  const handleSurveyClick = (survey: any) => {
    if (survey.status === false) return; // Ignore if locked
    setSelectedSurveywall(survey); // Opens the modal
  };

  return (
    <div className="w-full flex flex-col gap-5 mt-6">
      
      {/* 🚀 Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BadgePercent className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">Survey Walls</h2>
        </div>

        {/* Dynamic Arrows */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {canScrollLeft && (
            <button 
              onClick={scrollLeft} 
              className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
            </button>
          )}
          {canScrollRight && (
            <button 
              onClick={scrollRight} 
              className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>
      </div>

      {/* 🚀 Slider Section */}
      <div className="relative group">
        {isLoading ? (
          // Loading Skeletons
          <div className="flex gap-4 overflow-hidden py-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-[210px] w-[150px] sm:w-[160px] bg-white/5 animate-pulse rounded-[24px] shrink-0 border border-white/5"></div>
            ))}
          </div>
        ) : surveywalls.length > 0 ? (
          <div 
            ref={sliderRef} 
            onScroll={checkScroll} 
            className="flex overflow-x-auto no-scrollbar gap-4 pb-4 snap-x scroll-smooth" 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {surveywalls.map((s: any, index: number) => {
              const bgClass = COLOR_PRESETS[index % COLOR_PRESETS.length];
              
              // Status false means Locked
              const isLocked = s.status === false; 
              const rating = s.rating || 0;
              
              // Getting exact Image URL from poster or image key
              const imagePath = s.poster || s.image;
              const imageUrl = getAttachmentUrl(imagePath);

              return (
                <div key={s._id || index} className="snap-start shrink-0 w-[150px] sm:w-[160px]">
                  <div 
                    onClick={() => handleSurveyClick(s)}
                    className={`relative flex flex-col items-center p-4 h-[210px] rounded-[24px] bg-gradient-to-b ${bgClass} border border-white/5 transition-all ${
                      isLocked 
                        ? 'opacity-75 grayscale-[40%] cursor-not-allowed' 
                        : 'hover:scale-[1.03] hover:shadow-xl cursor-pointer hover:border-white/10'
                    }`}
                  >
                    
                    {/* SEEDHA IMAGE TAG - WITH REFERRER POLICY FIX */}
                    <div className="h-20 flex items-center justify-center mt-2 w-full px-2">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={s.name} 
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          className="max-h-full max-w-full object-contain drop-shadow-md rounded" 
                        />
                      ) : (
                        <span className="text-white font-black text-4xl">{s.name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    
                    {/* Text & Footer Area */}
                    <div className="flex flex-col items-center w-full mt-auto mb-2">
                      <h3 className="text-white font-bold text-sm text-center mb-3 leading-tight line-clamp-2">
                        {s.name}
                      </h3>
                      
                      {isLocked ? (
                        <div className="flex flex-col items-center gap-1.5 mt-1">
                          <Lock className="w-4 h-4 text-gray-400" />
                          <span className="text-[10px] text-gray-400 font-medium">Level up to unlock</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${
                                i < rating 
                                  ? 'fill-amber-400 text-amber-400' 
                                  : 'fill-gray-600/50 text-gray-600/50'
                              }`} 
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Subtle Overlay if Locked */}
                    {isLocked && <div className="absolute inset-0 bg-black/20 rounded-[24px] pointer-events-none" />}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/5 border border-white/5 rounded-3xl text-gray-400 text-sm">
            No survey walls available right now. Check back later!
          </div>
        )}
      </div>

      {/* 🚀 INTERNAL SURVEYWALL MODAL (Iframe Popup) 🚀 */}
      <SurveywallModal 
        isOpen={!!selectedSurveywall} 
        onClose={() => setSelectedSurveywall(null)} 
        surveywall={selectedSurveywall} 
      />

    </div>
  );
}

// =========================================================================
// 🔥 INTEGRATED SURVEYWALL MODAL COMPONENT 
// =========================================================================
function SurveywallModal({ isOpen, onClose, surveywall }: any) {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !surveywall) {
      setIframeUrl(null);
      setApiError(null);
      return;
    }

    const fetchTrackingUrl = async () => {
      setIsLoading(true);
      setApiError(null);
      
      const token = localStorage.getItem('token') || '';
      const targetId = surveywall._id || surveywall.id;

      try {
        const res = await fetch(`https://api.binnycash.com/api/user/track_offerwall`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ offerwallId: targetId }) 
        });

        const text = await res.text();
        let jsonRes: any = null;
        if (text && !text.trim().startsWith('<')) {
          try { jsonRes = JSON.parse(text); } catch(e) {}
        }

        if (jsonRes && (jsonRes.code === 200 || jsonRes.type === 'success' || jsonRes.data?.offerwallUrl)) {
          const finalUrl = jsonRes.data?.offerwallUrl || jsonRes.url || jsonRes.data?.url || jsonRes.offerwallUrl || null;
          
          if (finalUrl && finalUrl !== '#') {
            setIframeUrl(finalUrl);
          } else {
            setApiError("Survey tracking URL not found.");
          }
        } else {
          setApiError(jsonRes?.message || "Failed to load survey link from server.");
        }
      } catch (err) {
        console.error("Failed to fetch survey tracking URL:", err);
        setApiError("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrackingUrl();
  }, [isOpen, surveywall]);

  if (!isOpen) return null;

  const name = surveywall?.title || surveywall?.name || 'Survey Wall';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-8">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0B0D19]/80 backdrop-blur-sm cursor-pointer"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.3 }}
          className="w-full max-w-6xl h-[82vh] sm:h-[80vh] mt-16 sm:mt-20 bg-[#111319] border border-white/10 rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.8)] relative overflow-hidden z-10 flex flex-col"
        >
          <div className="h-[60px] bg-[#1A1C24] border-b border-white/5 flex items-center justify-between px-6 shrink-0">
            <h3 className="text-white font-bold text-lg">{name}</h3>
            
            <div className="flex items-center gap-3">
              {iframeUrl && !isLoading && !apiError && (
                <a 
                  href={iframeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-white transition-colors"
                >
                  <span className="hidden sm:inline">Open in Browser</span> <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-[#8F95A3] hover:text-white transition-colors border border-white/5 cursor-pointer ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 w-full relative bg-white flex items-center justify-center overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                <span className="text-[#111319] font-bold text-sm">Generating your survey link...</span>
              </div>
            ) : apiError ? (
              <div className="text-[#8F95A3] font-medium text-sm flex flex-col items-center gap-2 bg-[#1A1C24] p-6 rounded-xl border border-white/10">
                <span className="text-red-400 font-bold mb-1">Error Loading Survey Wall</span>
                <span>{apiError}</span>
                <button onClick={onClose} className="mt-3 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors cursor-pointer border border-white/5">Close Window</button>
              </div>
            ) : iframeUrl ? (
              <iframe 
                src={iframeUrl}
                className="absolute inset-0 w-full h-full border-none"
                allow="autoplay; camera; microphone; clipboard-read; clipboard-write;"
                title={`${name} Surveywall`}
              />
            ) : null}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}