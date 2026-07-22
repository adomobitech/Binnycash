'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import OfferCard from '@/components/offers/OfferCard';
import { ListChecks, List, Star, Zap, ChevronDown } from "lucide-react";

export default function AllSurveywallsPage() {
  const [surveywalls, setSurveywalls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
    const fetchSurveywalls = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

      try {
        // 🔥 TODO: Change this URL to your actual surveywall API endpoint when ready 🔥
        const res = await fetch(`https://apitest.binnycash.com/api/user/surveywall_list_placeholder`, {
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
        else if (Array.isArray(resData?.data?.data?.surveywall)) list = resData.data.data.surveywall; 
        else if (Array.isArray(resData?.data?.surveywall)) list = resData.data.surveywall; 
        else if (Array.isArray(resData?.surveywall)) list = resData.surveywall; 
        else if (Array.isArray(resData?.data?.list)) list = resData.data.list; 
        else if (Array.isArray(resData?.data)) list = resData.data;

        setSurveywalls(list);
      } catch (err) {
        console.error("Error fetching surveywalls:", err);
      } finally { setIsLoading(false); }
    };
    fetchSurveywalls();
  }, []);

  let processedItems = [...surveywalls];

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
    <div className="min-h-screen bg-[#0E1015] p-4 md:p-6 text-white pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-[#1A1C24] border border-white/5 flex items-center justify-center text-[#8F95A3] hover:text-white hover:bg-[#232630] transition-all shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-emerald-400" /> All Survey Walls
          </h1>
          <p className="text-xs text-[#8F95A3] mt-0.5">Explore premium surveywalls to boost your earnings.</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-[#14171F] p-4 rounded-2xl border border-white/5 mb-6">
        <div className="relative w-full xl:w-[320px] shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-[#8F95A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input type="text" placeholder="Search surveywalls..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#1A1C24] border border-white/5 text-white text-sm rounded-xl focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6]/50 block pl-10 p-2.5 placeholder-[#8F95A3] outline-none transition-all" />
        </div>
        
        {/* CUSTOM DROPDOWN */}
        <div className="relative shrink-0 w-full sm:w-auto z-10" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
            className="w-full sm:w-auto flex items-center justify-between gap-2 bg-[#1A1C24] border border-white/5 rounded-xl px-4 py-2.5 text-sm font-medium text-white hover:bg-[#232630] transition-colors"
          >
            <div className="flex items-center gap-2">
              {getFilterIcon(filterType)}
              <span>{filterType}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[#8F95A3] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-full sm:w-44 bg-[#1A1C24] border border-white/5 rounded-xl shadow-xl overflow-hidden z-50">
              <button onClick={() => {setFilterType('All'); setIsDropdownOpen(false)}} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#8F95A3] hover:text-white hover:bg-white/5 transition-colors">
                 <List className="w-4 h-4" /> All
              </button>
              <button onClick={() => {setFilterType('Featured'); setIsDropdownOpen(false)}} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#8F95A3] hover:text-white hover:bg-white/5 transition-colors">
                 <Star className="w-4 h-4" /> Featured
              </button>
              <button onClick={() => {setFilterType('High Paying'); setIsDropdownOpen(false)}} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#8F95A3] hover:text-white hover:bg-white/5 transition-colors">
                 <Zap className="w-4 h-4" /> High Paying
              </button>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (<div key={i} className="h-44 bg-white/5 animate-pulse rounded-2xl"></div>))}
        </div>
      ) : processedItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {processedItems.map((item, index) => {
            const fixedItem = {
              ...item,
              image: item.image && !item.image.startsWith('http') 
                ? `https://apitest.binnycash.com${item.image}` 
                : item.image
            };
            return (
              <OfferCard key={item._id || item.id || index} offer={fixedItem} />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 bg-[#1A1C24] border border-white/5 rounded-2xl text-[#8F95A3]">No matching surveywalls found</div>
      )}
    </div>
  );
}