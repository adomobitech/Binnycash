'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import OfferCard from '@/components/offers/OfferCard';
import OfferFilters from '@/components/offers/OfferFilters';
import { filterOffersByDevice } from '@/components/offers/OfferSlider';
import { Search, ChevronLeft, ChevronDown, Filter, LayoutGrid, Flame, ArrowUpCircle, ArrowDownCircle, Settings2 } from "lucide-react"; 

// 🔥 Dropdown Options as per your screenshot requirement 🔥
const CATEGORIES = [
  { id: 'All', label: 'All Categories', icon: '✨' },
  { id: 'Games', label: 'Game', icon: '🎮' },
  { id: 'Surveys', label: 'Survey', icon: '📋' },
  { id: 'Apps', label: 'App', icon: '📱' },
  { id: 'Casino', label: 'Casino', icon: '🎲' },
  { id: 'Crypto', label: 'Crypto', icon: '₿' },
  { id: 'Purchase', label: 'Purchase', icon: '🛍️' },
  { id: 'Freetrial', label: 'Free Trial', icon: '💳' },
  { id: 'Signup', label: 'Sign Up', icon: '✍️' },
  { id: 'Quizzes', label: 'Quiz', icon: '❓' },
  { id: 'Other', label: 'Other', icon: '📦' }
];

export default function AllOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // States for new Dropdowns
  const [sortBy, setSortBy] = useState('popular'); 
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProvider, setSelectedProvider] = useState('All');
  
  // Dropdown Toggle States
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isProvOpen, setIsProvOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24; 

  // Refs for closing dropdowns on outside click
  const catRef = useRef<HTMLDivElement>(null);
  const provRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(event.target as Node)) setIsCatOpen(false);
      if (provRef.current && !provRef.current.contains(event.target as Node)) setIsProvOpen(false);
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) setIsSortOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedDevices, sortBy, selectedCategory, selectedProvider]);

  const handleSelectDevice = (device: string) => {
    setSelectedDevices((prev) => {
      if (prev.includes(device)) return prev.filter((d) => d !== device);
      return [...prev, device];
    });
  };

  // Generate unique Providers list for the dropdown
  const uniqueProviders = Array.from(new Set(offers.map(o => o.network || o.provider || 'Gemiad').filter(Boolean)));

  // --- FILTERING LOGIC ---
  let processedOffers = filterOffersByDevice(offers, selectedDevices);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    processedOffers = processedOffers.filter(offer => {
      const title = (offer.offerName || offer.title || offer.name || '').toLowerCase();
      const sub = (offer.categories || offer.sub || offer.category || '').toLowerCase();
      return title.includes(q) || sub.includes(q);
    });
  }

  // Category Filter
  if (selectedCategory !== 'All') {
    const q = selectedCategory.toLowerCase();
    processedOffers = processedOffers.filter(offer => {
      const cat = (offer.categories || offer.category || offer.tags || offer.offerName || '').toLowerCase();
      if (q === 'games') return cat.includes('game') || cat.includes('play');
      if (q === 'surveys') return cat.includes('survey') || cat.includes('opinion');
      if (q === 'apps') return cat.includes('app') || cat.includes('install');
      if (q === 'quizzes') return cat.includes('quiz') || cat.includes('trivia');
      if (q === 'crypto') return cat.includes('crypto') || cat.includes('bitcoin');
      if (q === 'casino') return cat.includes('casino') || cat.includes('slot');
      if (q === 'freetrial') return cat.includes('trial') || cat.includes('free');
      if (q === 'signup') return cat.includes('sign') || cat.includes('register');
      if (q === 'purchase') return cat.includes('purchase') || cat.includes('buy');
      return cat.includes(q);
    });
  }

  // Provider Filter
  if (selectedProvider !== 'All') {
    processedOffers = processedOffers.filter(offer => {
      const prov = offer.network || offer.provider || 'Gemiad';
      return prov.toLowerCase() === selectedProvider.toLowerCase();
    });
  }

  // Sorting
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
  } else if (sortBy === 'popular') {
    // Default or Popular sorting logic here (e.g. by rating or predefined order if exists)
  }

  const totalPages = Math.ceil(processedOffers.length / itemsPerPage);
  const paginatedOffers = processedOffers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col bg-[#0B0D19] min-h-[calc(100vh-80px)] text-white relative">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#8B5CF6]/5 blur-[120px] rounded-full pointer-events-none" />

      <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 custom-scrollbar">
        
        {/* 🔥 Header Area 🔥 */}
        <div className="flex items-center gap-4 mb-2">
          <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8F95A3] hover:text-white transition-all backdrop-blur-md border border-white/5 shadow-sm">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-white">Offers</h1>
        </div>
        <p className="text-[#8F95A3] text-[15px] font-medium mb-8 pl-14">Choose better tasks. Earn better rewards.</p>

        {/* 🔥 MAIN FILTERS BAR (Replicating the Screenshot Layout) 🔥 */}
        <div className="flex flex-col xl:flex-row justify-between items-center gap-4 mb-8 bg-[#111319]/80 backdrop-blur-md p-3 rounded-2xl border border-white/5 shadow-lg">
          
          {/* Left Side: Search Bar */}
          <div className="relative w-full xl:w-[350px] shrink-0">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-[#8F95A3]" />
            </div>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-[#1A1C24] border border-white/5 text-white text-[13px] font-medium rounded-xl focus:ring-1 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6]/50 block pl-11 p-3 placeholder-[#8F95A3] outline-none transition-all shadow-inner" 
            />
          </div>

          {/* Right Side: Device Icons & Dropdowns */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full xl:w-auto overflow-x-auto no-scrollbar pb-1 xl:pb-0">
            
            {/* Device Filters */}
            <div className="shrink-0 flex items-center bg-[#1A1C24] p-1 rounded-xl border border-white/5">
              <OfferFilters selectedDevices={selectedDevices} onSelectDevice={handleSelectDevice} />
            </div>

            {/* 1. Category Dropdown */}
            <div className="relative shrink-0 z-30" ref={catRef}>
              <button 
                onClick={() => setIsCatOpen(!isCatOpen)}
                className="flex items-center gap-2 bg-[#1A1C24] hover:bg-[#252836] border border-white/5 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white transition-colors h-10"
              >
                <Filter className="w-4 h-4 text-[#8F95A3]" /> 
                {selectedCategory === 'All' ? 'All Categories' : selectedCategory}
                <ChevronDown className={`w-3.5 h-3.5 text-[#8F95A3] transition-transform ml-1 ${isCatOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCatOpen && (
                <div className="absolute left-0 top-full mt-2 w-[220px] bg-[#1A1C24] border border-white/5 rounded-xl shadow-2xl overflow-hidden flex flex-col py-2 border-t-[#8B5CF6]">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat.id} 
                      onClick={() => {setSelectedCategory(cat.id); setIsCatOpen(false);}} 
                      className={`flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold hover:bg-white/5 transition-colors ${selectedCategory === cat.id ? 'text-[#8B5CF6]' : 'text-[#8F95A3] hover:text-white'}`}
                    >
                      <span className="w-5 text-center">{cat.icon}</span> {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Provider Dropdown */}
            <div className="relative shrink-0 z-20" ref={provRef}>
              <button 
                onClick={() => setIsProvOpen(!isProvOpen)}
                className="flex items-center gap-2 bg-[#1A1C24] hover:bg-[#252836] border border-white/5 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white transition-colors h-10"
              >
                <LayoutGrid className="w-4 h-4 text-[#8F95A3]" /> 
                {selectedProvider === 'All' ? 'All Providers' : selectedProvider}
                <ChevronDown className={`w-3.5 h-3.5 text-[#8F95A3] transition-transform ml-1 ${isProvOpen ? 'rotate-180' : ''}`} />
              </button>
              {isProvOpen && (
                <div className="absolute left-0 top-full mt-2 w-[220px] max-h-[300px] overflow-y-auto custom-scrollbar bg-[#1A1C24] border border-white/5 rounded-xl shadow-2xl flex flex-col py-2 border-t-[#8B5CF6]">
                  <button 
                    onClick={() => {setSelectedProvider('All'); setIsProvOpen(false);}} 
                    className={`flex items-center justify-between px-4 py-2.5 text-[13px] font-semibold hover:bg-white/5 transition-colors ${selectedProvider === 'All' ? 'text-[#8B5CF6]' : 'text-[#8F95A3] hover:text-white'}`}
                  >
                    All Providers
                  </button>
                  {uniqueProviders.map(prov => (
                    <button 
                      key={prov} 
                      onClick={() => {setSelectedProvider(prov); setIsProvOpen(false);}} 
                      className={`flex items-center justify-between px-4 py-2.5 text-[13px] font-semibold hover:bg-white/5 transition-colors ${selectedProvider === prov ? 'text-[#8B5CF6]' : 'text-[#8F95A3] hover:text-white'}`}
                    >
                      <span className="truncate pr-2">{prov}</span>
                      <span className="bg-[#8B5CF6] text-white text-[9px] px-2 py-0.5 rounded-full">Offers</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Sort By Dropdown */}
            <div className="relative shrink-0 z-10" ref={sortRef}>
              <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 bg-[#1A1C24] hover:bg-[#252836] border border-white/5 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white transition-colors h-10"
              >
                {sortBy === 'popular' && <Flame className="w-4 h-4 text-[#8F95A3]" />}
                {sortBy === 'reward-high' && <ArrowUpCircle className="w-4 h-4 text-[#8F95A3]" />}
                {sortBy === 'reward-low' && <ArrowDownCircle className="w-4 h-4 text-[#8F95A3]" />}
                
                {sortBy === 'popular' && 'Most Popular'}
                {sortBy === 'reward-high' && 'High Reward'}
                {sortBy === 'reward-low' && 'Low Reward'}
                
                <ChevronDown className={`w-3.5 h-3.5 text-[#8F95A3] transition-transform ml-1 ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>
              {isSortOpen && (
                <div className="absolute right-0 top-full mt-2 w-[180px] bg-[#1A1C24] border border-white/5 rounded-xl shadow-2xl overflow-hidden flex flex-col py-2 border-t-[#8B5CF6]">
                  <button onClick={() => {setSortBy('popular'); setIsSortOpen(false);}} className={`flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold hover:bg-white/5 transition-colors ${sortBy === 'popular' ? 'text-[#8B5CF6]' : 'text-[#8F95A3] hover:text-white'}`}>
                    <Flame className="w-4 h-4" /> Most Popular
                  </button>
                  <button onClick={() => {setSortBy('reward-high'); setIsSortOpen(false);}} className={`flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold hover:bg-white/5 transition-colors ${sortBy === 'reward-high' ? 'text-[#8B5CF6]' : 'text-[#8F95A3] hover:text-white'}`}>
                    <ArrowUpCircle className="w-4 h-4" /> High Reward
                  </button>
                  <button onClick={() => {setSortBy('reward-low'); setIsSortOpen(false);}} className={`flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold hover:bg-white/5 transition-colors ${sortBy === 'reward-low' ? 'text-[#8B5CF6]' : 'text-[#8F95A3] hover:text-white'}`}>
                    <ArrowDownCircle className="w-4 h-4" /> Low Reward
                  </button>
                </div>
              )}
            </div>

          </div>
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
            <Settings2 className="w-12 h-12 text-[#8F95A3] mb-4 opacity-50" />
            <p className="text-white font-bold text-lg mb-1">No matching offers found</p>
            <p className="text-[#8F95A3] text-sm">Try adjusting your filters or clearing the search query.</p>
            <button onClick={() => {setSearchQuery(''); setSelectedCategory('All'); setSelectedProvider('All');}} className="mt-4 px-6 py-2 bg-[#8B5CF6]/20 text-[#8B5CF6] rounded-xl font-bold hover:bg-[#8B5CF6] hover:text-white transition-all">Clear All Filters</button>
          </div>
        )}

        <style dangerouslySetInnerHTML={{__html: `
          .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.5); }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />
      </main>
    </div>
  );
}