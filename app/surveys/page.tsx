'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import OfferCard from '@/components/offers/OfferCard';
import { ClipboardList, List, Star, Clock, Zap, ChevronDown, ChevronLeft, Search } from "lucide-react";

export default function AllSurveysPage() {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All'); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24; 

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
    const fetchAllSurveys = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      let allFetchedSurveys: any[] = [];
      let pageNum = 1;
      let hasMoreData = true;

      try {
        while (hasMoreData && pageNum <= 20) {
          const res = await fetch(`https://apitest.binnycash.com/api/user/surveyList?page=${pageNum}`, {
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
          else if (Array.isArray(resData?.data?.list)) list = resData.data.list; 
          else if (Array.isArray(resData?.surveys)) list = resData.surveys; 
          else if (Array.isArray(resData?.data)) list = resData.data;

          if (list.length > 0) {
            allFetchedSurveys = [...allFetchedSurveys, ...list];
            pageNum++;
            if (list.length < 20) hasMoreData = false;
          } else { hasMoreData = false; }
        }
        const uniqueSurveys = Array.from(new Map(allFetchedSurveys.map(item => [item._id || item.id, item])).values());
        setSurveys(uniqueSurveys);
      } catch (err) {
        console.error("Error fetching surveys:", err);
      } finally { setIsLoading(false); }
    };
    fetchAllSurveys();
  }, []);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterType]);

  let processedSurveys = [...surveys];

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    processedSurveys = processedSurveys.filter(survey => {
      const title = (survey.offerName || survey.title || survey.name || '').toLowerCase();
      const sub = (survey.categories || survey.sub || survey.category || '').toLowerCase();
      return title.includes(q) || sub.includes(q);
    });
  }

  if (filterType === 'Featured Survey') {
    processedSurveys = processedSurveys.filter(s => s.is_featured || s.featured);
  } else if (filterType === 'High Paying Survey') {
    processedSurveys.sort((a, b) => parseFloat(b.userCredits ?? b.reward ?? 0) - parseFloat(a.userCredits ?? a.reward ?? 0));
  } else if (filterType === 'Short Survey') {
    processedSurveys.sort((a, b) => parseFloat(a.userCredits ?? a.reward ?? 0) - parseFloat(b.userCredits ?? b.reward ?? 0));
  }

  const totalPages = Math.ceil(processedSurveys.length / itemsPerPage);
  const paginatedSurveys = processedSurveys.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getFilterIcon = (type: string) => {
    switch (type) {
      case 'Featured Survey': return <Star className="w-4 h-4 text-white" />;
      case 'Short Survey': return <Clock className="w-4 h-4 text-white" />;
      case 'High Paying Survey': return <Zap className="w-4 h-4 text-white" />;
      default: return <List className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className="flex bg-[#0E1015] min-h-screen text-white">
      {/* 👈 LEFT SIDEBAR */}
      <Sidebar />

      {/* 👉 MAIN CONTENT AREA */}
      <div className="flex-1 overflow-x-hidden pt-20 md:pt-24 pb-20 px-4 md:px-8 custom-scrollbar">
        
        {/* 🔥 HERO BANNER 🔥 */}
        <div className="relative w-full bg-[#111319] border border-white/5 rounded-[24px] mb-6 overflow-hidden flex flex-col justify-center px-6 md:px-10 py-8 shadow-lg">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#3B82F6]/5 blur-[80px] rounded-full -translate-x-1/3 translate-y-1/3"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8F95A3] hover:text-white transition-all backdrop-blur-md border border-white/5 shadow-sm">
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
                <ClipboardList className="w-8 h-8 text-amber-400" /> All Surveys
              </h1>
            </div>
            
            <div className="pl-14">
              <p className="text-[13px] md:text-sm text-[#8F95A3] font-medium mb-1">Explore a diverse collection of surveys from verified providers.</p>
              <p className="text-[13px] md:text-sm text-[#8F95A3] font-medium">
                Total Available: <span className="text-amber-400 font-bold">{surveys.length} Surveys</span>
              </p>
            </div>
          </div>
        </div>

        {/* 🔥 MAIN FILTERS BAR 🔥 */}
        <div className="flex flex-col xl:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full xl:w-[320px] shrink-0">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-[#8F95A3]" />
            </div>
            <input 
              type="text" 
              placeholder="Search surveys..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-[#111319] border border-white/5 text-white text-[13px] font-medium rounded-[14px] focus:ring-1 focus:ring-amber-400/50 focus:border-amber-400/50 block pl-11 p-3.5 placeholder-[#8F95A3] outline-none transition-all shadow-sm" 
            />
          </div>

          {/* CUSTOM DROPDOWN */}
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
                <button onClick={() => {setFilterType('Featured Survey'); setIsDropdownOpen(false)}} className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-[#8F95A3] hover:text-white hover:bg-white/5 transition-colors">
                   <Star className="w-4 h-4" /> Featured Survey
                </button>
                <button onClick={() => {setFilterType('Short Survey'); setIsDropdownOpen(false)}} className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-[#8F95A3] hover:text-white hover:bg-white/5 transition-colors">
                   <Clock className="w-4 h-4" /> Short Survey
                </button>
                <button onClick={() => {setFilterType('High Paying Survey'); setIsDropdownOpen(false)}} className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-[#8F95A3] hover:text-white hover:bg-white/5 transition-colors">
                   <Zap className="w-4 h-4" /> High Paying Survey
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 🔥 GRID CONTENT 🔥 */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div key={i} className="h-44 bg-[#111319] border border-white/5 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : paginatedSurveys.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-6 gap-4 lg:gap-5">
              {paginatedSurveys.map((survey, index) => (
                <OfferCard key={survey._id || survey.id || index} offer={survey} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 bg-[#111319] p-4 px-6 rounded-2xl border border-white/5">
                <p className="text-[#8F95A3] text-[13px] font-medium">
                  Showing <span className="text-white font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-white font-bold">{Math.min(currentPage * itemsPerPage, processedSurveys.length)}</span> of <span className="text-white font-bold">{processedSurveys.length}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-xl bg-[#1A1C24] border border-white/5 text-white disabled:opacity-30 hover:bg-white/5 transition-all text-sm font-bold">Prev</button>
                  <div className="flex items-center gap-1 px-2 hidden sm:flex">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                      <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${currentPage === pageNum ? 'bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'text-[#8F95A3] hover:text-white hover:bg-[#1A1C24]'}`}>{pageNum}</button>
                    ))}
                  </div>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-xl bg-[#1A1C24] border border-white/5 text-white disabled:opacity-30 hover:bg-white/5 transition-all text-sm font-bold">Next</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 bg-[#111319] border border-white/5 rounded-2xl flex flex-col items-center justify-center mt-4">
            <Search className="w-12 h-12 text-[#8F95A3] mb-4 opacity-50" />
            <p className="text-white font-bold text-lg mb-1">No matching surveys found</p>
            <p className="text-[#8F95A3] text-sm">Try adjusting your filters or search query.</p>
          </div>
        )}

        <style dangerouslySetInnerHTML={{__html: `
          .custom-scrollbar::-webkit-scrollbar { height: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(245, 158, 11, 0.5); }
        `}} />
      </div>
    </div>
  );
}