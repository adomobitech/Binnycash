'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import OfferwallCard from '@/components/offerwalls/OfferwallCard';
import OfferwallModal from '@/components/offerwalls/OfferwallModal'; 
import { Boxes, List, Star, Zap, ChevronDown, ChevronLeft, Search } from "lucide-react";

export default function AllOfferwallsPage() {
  const [offerwalls, setOfferwalls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [selectedOfferwall, setSelectedOfferwall] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchOfferwalls = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

      try {
        const res = await fetch(`https://apitest.binnycash.com/api/user/user_offerwall_list`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'token': token || ''
          }
        });
        const text = await res.text();
        let resData;
        try { resData = JSON.parse(text); } catch (e) { resData = {}; }

        let list: any[] = [];
        if (Array.isArray(resData)) list = resData; 
        else if (Array.isArray(resData?.data?.data?.offerwall)) list = resData.data.data.offerwall; 
        else if (Array.isArray(resData?.data?.offerwall)) list = resData.data.offerwall; 
        else if (Array.isArray(resData?.offerwall)) list = resData.offerwall; 
        else if (Array.isArray(resData?.data?.list)) list = resData.data.list; 
        else if (Array.isArray(resData?.data)) list = resData.data;

        setOfferwalls(list);
      } catch (err) {
        console.error("Error fetching offerwalls:", err);
      } finally { setIsLoading(false); }
    };
    fetchOfferwalls();
  }, []);

  let processedItems = [...offerwalls];

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    processedItems = processedItems.filter(item => {
      const title = (item.offerName || item.title || item.name || '').toLowerCase();
      const sub = (item.categories || item.sub || item.category || '').toLowerCase();
      return title.includes(q) || sub.includes(q);
    });
  }

  if (filterType === 'Featured') {
    processedItems = processedItems.filter(s => s.is_featured || s.featured);
  } else if (filterType === 'High Paying') {
    processedItems.sort((a, b) => parseFloat(b.userCredits ?? b.reward ?? 0) - parseFloat(a.userCredits ?? a.reward ?? 0));
  }

  const getFilterIcon = (type: string) => {
    switch (type) {
      case 'Featured': return <Star className="w-4 h-4 text-white" />;
      case 'High Paying': return <Zap className="w-4 h-4 text-white" />;
      default: return <List className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className="flex flex-col bg-[#0B0D19] min-h-[calc(100vh-80px)] text-white relative">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#10B981]/5 blur-[120px] rounded-full pointer-events-none" />

      <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 custom-scrollbar">
        
        <div className="relative w-full bg-[#111319] border border-white/5 rounded-[24px] mb-6 overflow-hidden flex flex-col justify-center px-6 md:px-10 py-8 shadow-lg">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#10B981]/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#3B82F6]/5 blur-[80px] rounded-full -translate-x-1/3 translate-y-1/3"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8F95A3] hover:text-white transition-all backdrop-blur-md border border-white/5 shadow-sm">
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
                <Boxes className="w-8 h-8 text-emerald-400" /> All Offer Walls
              </h1>
            </div>
            
            <div className="pl-14">
              <p className="text-[13px] md:text-sm text-[#8F95A3] font-medium mb-1">Explore premium offerwalls to boost your earnings.</p>
              <p className="text-[13px] md:text-sm text-[#8F95A3] font-medium">
                Total Available: <span className="text-emerald-400 font-bold">{processedItems.length} Offerwalls</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full xl:w-[320px] shrink-0">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-[#8F95A3]" />
            </div>
            <input 
              type="text" 
              placeholder="Search offerwalls..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-[#111319] border border-white/5 text-white text-[13px] font-medium rounded-[14px] focus:ring-1 focus:ring-emerald-400/50 focus:border-emerald-400/50 block pl-11 p-3.5 placeholder-[#8F95A3] outline-none transition-all shadow-sm" 
            />
          </div>

          <div className="relative shrink-0 w-full sm:w-[220px] z-10" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
              className="w-full flex items-center justify-between gap-2 bg-[#111319] border border-white/5 rounded-[14px] px-4 py-3.5 text-[13px] font-medium text-white hover:bg-[#1A1C24] transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2">
                {getFilterIcon(filterType)}
                <span>{filterType}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#8F95A3] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-full bg-[#111319] border border-white/5 rounded-xl shadow-xl overflow-hidden z-50">
                <button onClick={() => {setFilterType('All'); setIsDropdownOpen(false)}} className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-[#8F95A3] hover:text-white hover:bg-white/5 transition-colors">
                   <List className="w-4 h-4" /> All
                </button>
                <button onClick={() => {setFilterType('Featured'); setIsDropdownOpen(false)}} className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-[#8F95A3] hover:text-white hover:bg-white/5 transition-colors">
                   <Star className="w-4 h-4" /> Featured
                </button>
                <button onClick={() => {setFilterType('High Paying'); setIsDropdownOpen(false)}} className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-[#8F95A3] hover:text-white hover:bg-white/5 transition-colors">
                   <Zap className="w-4 h-4" /> High Paying
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 🔥 NO PAGINATION: STRAIGHT RENDER TO GRID FOR UP-DOWN SCROLLING 🔥 */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div key={i} className="h-44 bg-[#111319] border border-white/5 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : processedItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-6 gap-4 lg:gap-5 pb-8">
            {processedItems.map((item, index) => {
              const fixedItem = {
                ...item,
                image: item.image && !item.image.startsWith('http') 
                  ? `https://apitest.binnycash.com${item.image}` 
                  : item.image
              };
              return (
                <OfferwallCard key={item._id || item.id || index} offerwall={fixedItem} onClick={setSelectedOfferwall} />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-[#111319] border border-white/5 rounded-2xl flex flex-col items-center justify-center mt-4">
            <Search className="w-12 h-12 text-[#8F95A3] mb-4 opacity-50" />
            <p className="text-white font-bold text-lg mb-1">No matching offerwalls found</p>
            <p className="text-[#8F95A3] text-sm">Try adjusting your filters or search query.</p>
          </div>
        )}

        <style dangerouslySetInnerHTML={{__html: `
          .custom-scrollbar::-webkit-scrollbar { height: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.5); }
        `}} />
      </main>

      <OfferwallModal 
        isOpen={!!selectedOfferwall} 
        onClose={() => setSelectedOfferwall(null)} 
        offerwall={selectedOfferwall} 
      />
    </div>
  );
}