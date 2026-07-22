'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import OfferCard from '@/components/offers/OfferCard';
import { ClipboardList, List, Star, Clock, Zap, ChevronDown } from "lucide-react";

export default function AllSurveysPage() {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All'); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24; 

  // Close dropdown on outside click
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

  // Handle new custom dropdown filters logic
  if (filterType === 'Featured Survey') {
    processedSurveys = processedSurveys.filter(s => s.is_featured || s.featured);
  } else if (filterType === 'High Paying Survey') {
    processedSurveys.sort((a, b) => parseFloat(b.userCredits ?? b.reward ?? 0) - parseFloat(a.userCredits ?? a.reward ?? 0));
  } else if (filterType === 'Short Survey') {
    // Demo sort logic for shortest time or lowest payout if time not present
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
    <div className="min-h-screen bg-[#0E1015] p-4 md:p-6 text-white pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-[#1A1C24] border border-white/5 flex items-center justify-center text-[#8F95A3] hover:text-white hover:bg-[#232630] transition-all shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-amber-400" /> All Surveys
          </h1>
          <p className="text-xs text-[#8F95A3] mt-0.5">Explore a diverse collection of surveys from verified providers.</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-[#14171F] p-4 rounded-2xl border border-white/5 mb-6">
        <div className="relative w-full xl:w-[320px] shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-[#8F95A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input type="text" placeholder="Search surveys..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#1A1C24] border border-white/5 text-white text-sm rounded-xl focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6]/50 block pl-10 p-2.5 placeholder-[#8F95A3] outline-none transition-all" />
        </div>
        
        {/* CUSTOM DROPDOWN FROM SCREENSHOT */}
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
            <div className="absolute right-0 top-full mt-2 w-full sm:w-48 bg-[#1A1C24] border border-white/5 rounded-xl shadow-xl overflow-hidden z-50">
              <button onClick={() => {setFilterType('All'); setIsDropdownOpen(false)}} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#8F95A3] hover:text-white hover:bg-white/5 transition-colors">
                 <List className="w-4 h-4" /> All
              </button>
              <button onClick={() => {setFilterType('Featured Survey'); setIsDropdownOpen(false)}} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#8F95A3] hover:text-white hover:bg-white/5 transition-colors">
                 <Star className="w-4 h-4" /> Featured Survey
              </button>
              <button onClick={() => {setFilterType('Short Survey'); setIsDropdownOpen(false)}} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#8F95A3] hover:text-white hover:bg-white/5 transition-colors">
                 <Clock className="w-4 h-4" /> Short Survey
              </button>
              <button onClick={() => {setFilterType('High Paying Survey'); setIsDropdownOpen(false)}} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#8F95A3] hover:text-white hover:bg-white/5 transition-colors">
                 <Zap className="w-4 h-4" /> High Paying Survey
              </button>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (<div key={i} className="h-44 bg-white/5 animate-pulse rounded-2xl"></div>))}
        </div>
      ) : paginatedSurveys.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {paginatedSurveys.map((survey, index) => (
              <OfferCard key={survey._id || survey.id || index} offer={survey} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 bg-[#14171F] p-3 px-5 rounded-2xl border border-white/5">
              <p className="text-[#8F95A3] text-sm">Showing <span className="text-white font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-white font-medium">{Math.min(currentPage * itemsPerPage, processedSurveys.length)}</span> of <span className="text-white font-medium">{processedSurveys.length}</span></p>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-xl bg-[#1A1C24] border border-white/5 text-white disabled:opacity-30 hover:bg-[#232630] transition-all text-sm font-medium">Prev</button>
                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${currentPage === pageNum ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'}`}>{pageNum}</button>
                  ))}
                </div>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-xl bg-[#1A1C24] border border-white/5 text-white disabled:opacity-30 hover:bg-[#232630] transition-all text-sm font-medium">Next</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-24 bg-[#1A1C24] border border-white/5 rounded-2xl text-[#8F95A3]">No matching surveys found</div>
      )}
    </div>
  );
}