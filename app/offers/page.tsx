'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar'; // 🔥 SIDEBAR IMPORT KAR LIYA
import OfferCard from '@/components/offers/OfferCard';
import OfferFilters from '@/components/offers/OfferFilters';
import { filterOffersByDevice } from '@/components/offers/OfferSlider';
import { Sparkles, Search, X, ChevronLeft } from "lucide-react"; // ChevronLeft for Back Button

const CATEGORIES = [
  { id: 'All', label: 'All', icon: '' },
  { id: 'Top Paying', label: 'Top Paying', icon: '🔥' },
  { id: 'Popular', label: 'Popular', icon: '⭐' },
  { id: 'Games', label: 'Games', icon: '🎮' },
  { id: 'Surveys', label: 'Surveys', icon: '📋' },
  { id: 'Apps', label: 'Apps', icon: '📱' },
  { id: 'Web', label: 'Web', icon: '🌐' },
  { id: 'Quizzes', label: 'Quizzes', icon: '❓' },
  { id: 'Finance', label: 'Finance', icon: '💰' }
];

export default function AllOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default'); 
  const [selectedCategory, setSelectedCategory] = useState('All');
  
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

  // Reset page to 1 on any filter change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedDevices, sortBy, selectedCategory]);

  const handleSelectDevice = (device: string) => {
    setSelectedDevices((prev) => {
      if (prev.includes(device)) return prev.filter((d) => d !== device);
      return [...prev, device];
    });
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedDevices([]);
    setSortBy('default');
    setSelectedCategory('All');
  };

  // 1. Filter by Device
  let processedOffers = filterOffersByDevice(offers, selectedDevices);

  // 2. Filter by Search Query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    processedOffers = processedOffers.filter(offer => {
      const title = (offer.offerName || offer.title || offer.name || '').toLowerCase();
      const sub = (offer.categories || offer.sub || offer.category || '').toLowerCase();
      return title.includes(q) || sub.includes(q);
    });
  }

  // 3. Filter by Category (Smart Match)
  if (selectedCategory !== 'All') {
    const q = selectedCategory.toLowerCase();
    processedOffers = processedOffers.filter(offer => {
      const cat = (offer.categories || offer.category || offer.tags || offer.offerName || '').toLowerCase();
      
      if (q === 'top paying') return parseFloat(offer.userCredits ?? offer.reward ?? offer.payout ?? 0) >= 1.0;
      if (q === 'popular') return true; 
      if (q === 'games') return cat.includes('game') || cat.includes('play');
      if (q === 'surveys') return cat.includes('survey') || cat.includes('opinion');
      if (q === 'apps') return cat.includes('app') || cat.includes('install');
      if (q === 'web') return cat.includes('web') || cat.includes('register');
      if (q === 'quizzes') return cat.includes('quiz') || cat.includes('trivia');
      if (q === 'finance') return cat.includes('finance') || cat.includes('crypto') || cat.includes('bank');
      
      return cat.includes(q);
    });
  }

  // 4. Sorting
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
    // 🔥 WRAPPED IN FLEX TO SHOW SIDEBAR 🔥
    <div className="flex bg-[#0E1015] min-h-screen text-white">
      
      {/* 👈 LEFT SIDEBAR */}
      <Sidebar />

      {/* 👉 MAIN CONTENT AREA */}
      <div className="flex-1 overflow-x-hidden pt-6 pb-20 px-4 md:px-8 custom-scrollbar">
        
        {/* 🔥 PREMIUM HERO BANNER WITH BACK BUTTON 🔥 */}
        <div className="relative w-full bg-[#111319] border border-white/5 rounded-[24px] mb-6 overflow-hidden flex flex-col justify-center px-6 md:px-10 py-8 shadow-lg">
          {/* Glow Effects */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8B5CF6]/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#3B82F6]/5 blur-[80px] rounded-full -translate-x-1/3 translate-y-1/3"></div>
          
          <div className="relative z-10">
            {/* Back Button and Title Row */}
            <div className="flex items-center gap-4 mb-3">
              <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8F95A3] hover:text-white transition-all backdrop-blur-md border border-white/5 shadow-sm">
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-[#8B5CF6]" /> All Offers
              </h1>
            </div>
            
            {/* Subtitles (Aligned properly) */}
            <div className="pl-14">
              <p className="text-[13px] md:text-sm text-[#8F95A3] font-medium mb-1">Complete offers and earn real rewards</p>
              <p className="text-[13px] md:text-sm text-[#8F95A3] font-medium">
                Total Available: <span className="text-[#8B5CF6] font-bold">{offers.length} Offers</span>
              </p>
            </div>
          </div>

          {/* Right Side Treasure Graphic (Placeholder) */}
          <div className="absolute right-0 bottom-0 h-full w-[400px] hidden md:block pointer-events-none">
            <img 
              src="/treasure-chest.png" // Apni image daal lena idhar
              alt="Rewards" 
              className="absolute -bottom-6 -right-6 w-[120%] h-[120%] object-contain drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]"
              onError={(e) => e.currentTarget.style.display = 'none'} 
            />
          </div>
        </div>

        {/* 🔥 MAIN FILTERS BAR (Search & Devices Left, Sort Right) 🔥 */}
        <div className="flex flex-col xl:flex-row justify-between items-center gap-4 mb-6">
          
          {/* Left Side: Search Bar + Device Icons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-[320px] shrink-0">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-[#8F95A3]" />
              </div>
              <input 
                type="text" 
                placeholder="Search offers by name or keyword..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-[#111319] border border-white/5 text-white text-[13px] font-medium rounded-[14px] focus:ring-1 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6]/50 block pl-11 p-3.5 placeholder-[#8F95A3] outline-none transition-all shadow-sm" 
              />
            </div>

            {/* Device Filters (Ab Search ke theek sath mein hain) */}
            <div className="flex items-center shrink-0 overflow-x-auto no-scrollbar w-full sm:w-auto">
              <OfferFilters selectedDevices={selectedDevices} onSelectDevice={handleSelectDevice} />
            </div>
          </div>

          {/* Right Side: Sort */}
          <div className="w-full xl:w-[220px] shrink-0">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)} 
              className="w-full bg-[#111319] border border-white/5 text-[#8F95A3] text-[13px] font-medium rounded-[14px] focus:ring-1 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6]/50 block p-3.5 outline-none transition-all cursor-pointer appearance-none px-4 shadow-sm"
            >
              <option value="default">Sort by: Default</option>
              <option value="reward-high">Reward: High to Low</option>
              <option value="reward-low">Reward: Low to High</option>
            </select>
          </div>
        </div>

        {/* 🔥 CATEGORIES BAR 🔥 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 w-full sm:flex-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all shrink-0 border ${
                  selectedCategory === cat.id 
                    ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                    : 'bg-[#111319] text-[#8F95A3] border-white/5 hover:text-white hover:bg-[#1A1C24]'
                }`}
              >
                {cat.icon && <span>{cat.icon}</span>}
                {cat.label}
              </button>
            ))}
          </div>
          
          {/* Clear Filters */}
          <button 
            onClick={clearAllFilters}
            className="flex items-center gap-2 px-4 py-2 text-[12px] font-bold text-[#8F95A3] hover:text-white transition-colors shrink-0 whitespace-nowrap"
          >
            <X className="w-4 h-4" /> Clear Filters
          </button>
        </div>

        {/* 🔥 OFFERS GRID 🔥 */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div key={i} className="h-44 bg-[#111319] border border-white/5 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : paginatedOffers.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-6 gap-4 lg:gap-5">
              {paginatedOffers.map((offer, index) => (
                <OfferCard key={offer._id || offer.id || index} offer={offer} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 bg-[#111319] p-4 px-6 rounded-2xl border border-white/5">
                <p className="text-[#8F95A3] text-[13px] font-medium">
                  Showing <span className="text-white font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-white font-bold">{Math.min(currentPage * itemsPerPage, processedOffers.length)}</span> of <span className="text-white font-bold">{processedOffers.length}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-xl bg-[#1A1C24] border border-white/5 text-white disabled:opacity-30 hover:bg-white/5 transition-all text-sm font-bold">Prev</button>
                  <div className="flex items-center gap-1 px-2 hidden sm:flex">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                      <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${currentPage === pageNum ? 'bg-[#8B5CF6] text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]' : 'text-[#8F95A3] hover:text-white hover:bg-[#1A1C24]'}`}>{pageNum}</button>
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
            <p className="text-white font-bold text-lg mb-1">No matching offers found</p>
            <p className="text-[#8F95A3] text-sm">Try adjusting your filters or search query.</p>
            <button onClick={clearAllFilters} className="mt-4 px-6 py-2 bg-[#8B5CF6]/20 text-[#8B5CF6] rounded-xl font-bold hover:bg-[#8B5CF6] hover:text-white transition-all">Clear Filters</button>
          </div>
        )}

        {/* Hide scrollbar CSS */}
        <style dangerouslySetInnerHTML={{__html: `
          .custom-scrollbar::-webkit-scrollbar { height: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.5); }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />
      </div>
    </div>
  );
}