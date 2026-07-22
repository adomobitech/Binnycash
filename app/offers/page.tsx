'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import OfferCard from '@/components/offers/OfferCard';
import OfferFilters from '@/components/offers/OfferFilters';
import { filterOffersByDevice } from '@/components/offers/OfferSlider';
import { Sparkles } from "lucide-react";

export default function AllOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default'); 
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24; 

  useEffect(() => {
    const fetchAllOffers = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      let allFetchedOffers: any[] = [];
      let pageNum = 1;
      let hasMoreData = true;
      let maxPages = 20;

      try {
        while (hasMoreData && pageNum <= maxPages) {
          const res = await fetch(`https://apitest.binnycash.com/api/user/offerlist?page=${pageNum}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'token': token || '',
              'x-access-token': token || ''
            }
          });
          
          const text = await res.text();
          let resData;
          try { resData = JSON.parse(text); } catch (e) { resData = {}; }

          let list: any[] = [];
          if (Array.isArray(resData)) { list = resData; } 
          else if (Array.isArray(resData?.data?.list)) { list = resData.data.list; } 
          else if (Array.isArray(resData?.data)) { list = resData.data; } 
          else if (Array.isArray(resData?.offers)) { list = resData.offers; } 
          else if (Array.isArray(resData?.data?.offers)) { list = resData.data.offers; } 
          else if (Array.isArray(resData?.list)) { list = resData.list; }

          if (list.length > 0) {
            allFetchedOffers = [...allFetchedOffers, ...list];
            pageNum++;
            if (list.length < 20) { hasMoreData = false; }
          } else { hasMoreData = false; }
        }

        const uniqueOffers = Array.from(
          new Map(allFetchedOffers.map(item => [item._id || item.id, item])).values()
        );
        setOffers(uniqueOffers);
      } catch (err) {
        console.error("Error fetching all pages:", err);
        setOffers(allFetchedOffers);
      } finally { setIsLoading(false); }
    };
    fetchAllOffers();
  }, []);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedDevices, sortBy]);

  const handleSelectDevice = (device: string) => {
    setSelectedDevices((prev) => {
      if (prev.includes(device)) return prev.filter((d) => d !== device);
      return [...prev, device];
    });
  };

  let processedOffers = filterOffersByDevice(offers, selectedDevices);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    processedOffers = processedOffers.filter(offer => {
      const title = (offer.offerName || offer.title || offer.name || '').toLowerCase();
      const sub = (offer.categories || offer.sub || offer.category || '').toLowerCase();
      return title.includes(q) || sub.includes(q);
    });
  }

  if (sortBy === 'reward-high') {
    processedOffers.sort((a, b) => {
      const valA = parseFloat(a.userCredits ?? a.reward ?? a.payout ?? 0);
      const valB = parseFloat(b.userCredits ?? b.reward ?? b.payout ?? 0);
      return valB - valA;
    });
  } else if (sortBy === 'reward-low') {
    processedOffers.sort((a, b) => {
      const valA = parseFloat(a.userCredits ?? a.reward ?? a.payout ?? 0);
      const valB = parseFloat(b.userCredits ?? b.reward ?? b.payout ?? 0);
      return valA - valB;
    });
  }

  const totalPages = Math.ceil(processedOffers.length / itemsPerPage);
  const paginatedOffers = processedOffers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#0E1015] p-4 md:p-6 text-white pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-[#1A1C24] border border-white/5 flex items-center justify-center text-[#8F95A3] hover:text-white hover:bg-[#232630] hover:border-[#8B5CF6]/40 transition-all shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-violet-400" /> All Offers
          </h1>
          <p className="text-xs text-[#8F95A3] mt-0.5">Total Available: <span className="text-white font-bold">{offers.length}</span></p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-[#14171F] p-4 rounded-2xl border border-white/5 mb-6">
        <div className="relative w-full xl:w-[320px] shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-[#8F95A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input type="text" placeholder="Search all offers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#1A1C24] border border-white/5 text-white text-sm rounded-xl focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6]/50 block pl-10 p-2.5 placeholder-[#8F95A3] outline-none transition-all" />
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full xl:w-auto overflow-hidden">
          <div className="overflow-x-auto no-scrollbar w-full sm:w-auto">
            <OfferFilters selectedDevices={selectedDevices} onSelectDevice={handleSelectDevice} />
          </div>
          <div className="shrink-0 w-full sm:w-auto">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full bg-[#1A1C24] border border-white/5 text-[#8F95A3] text-sm rounded-xl focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6]/50 block p-2.5 outline-none transition-all cursor-pointer appearance-none pr-8 relative">
              <option value="default">Sort by: Default</option>
              <option value="reward-high">Reward: High to Low</option>
              <option value="reward-low">Reward: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (<div key={i} className="h-44 bg-white/5 animate-pulse rounded-2xl"></div>))}
        </div>
      ) : paginatedOffers.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {paginatedOffers.map((offer, index) => (
              <OfferCard key={offer._id || offer.id || index} offer={offer} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 bg-[#14171F] p-3 px-5 rounded-2xl border border-white/5">
              <p className="text-[#8F95A3] text-sm">Showing <span className="text-white font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-white font-medium">{Math.min(currentPage * itemsPerPage, processedOffers.length)}</span> of <span className="text-white font-medium">{processedOffers.length}</span></p>
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
        <div className="text-center py-24 bg-[#1A1C24] border border-white/5 rounded-2xl text-[#8F95A3]">No matching offers found</div>
      )}
    </div>
  );
}