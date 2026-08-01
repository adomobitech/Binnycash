'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import OfferCard from '@/components/offers/OfferCard'; 
import { ClipboardList, ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";

export default function SurveySlider({ surveys = [], isLoading = false }: any) {
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
  }, [surveys]);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 mt-6">
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-4">
        
        <div className="flex flex-col shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="w-5 h-5 text-[#8B5CF6]" />
            <h2 className="text-xl font-black text-white tracking-widest uppercase">TOP SURVEYS</h2>
          </div>
          <p className="text-[#8F95A3] text-xs font-medium">Share your opinion and earn exciting rewards.</p>
        </div>

        <div className="hidden lg:flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5">
            {canScrollLeft && (
              <button 
                onClick={scrollLeft} 
                className="w-9 h-9 rounded-[10px] bg-[#111319] border border-white/10 flex items-center justify-center text-[#8F95A3] hover:text-white hover:bg-white/5 transition-all cursor-pointer shadow-sm"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
            {canScrollRight && (
              <button 
                onClick={scrollRight} 
                className="w-9 h-9 rounded-[10px] bg-[#111319] border border-white/10 flex items-center justify-center text-[#8F95A3] hover:text-white hover:bg-white/5 transition-all cursor-pointer shadow-sm"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
          <Link href="/surveys" className="flex items-center gap-1.5 text-sm text-[#8B5CF6] font-bold hover:text-[#A855F7] transition-colors cursor-pointer pl-2 border-l border-white/10">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      <div className="relative group">
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden py-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[210px] w-[140px] sm:w-[155px] bg-[#161821] animate-pulse rounded-[16px] shrink-0 border border-white/5"></div>
            ))}
          </div>
        ) : surveys.length > 0 ? (
          <div 
            ref={sliderRef} 
            onScroll={checkScroll} 
            className="flex overflow-x-auto no-scrollbar gap-4 pb-2 snap-x scroll-smooth" 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {surveys.map((survey: any, index: number) => (
              <div key={survey._id || survey.id || index} className="snap-start shrink-0 w-[140px] sm:w-[155px]">
                <OfferCard offer={survey} isSurveyCard={true} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#120F1A] border border-white/5 rounded-2xl text-[#8F95A3] text-sm">
            No surveys available right now. Check back later!
          </div>
        )}
      </div>
    </div>
  );
}