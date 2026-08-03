'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import OfferCard from '@/components/offers/OfferCard';
import { filterOffersByDevice } from '@/components/offers/OfferSlider';
import { 
  Search, ChevronLeft, ChevronDown, Filter, Flame, ArrowUp, ArrowDown, 
  Settings2, Smartphone, Diamond, Bitcoin, Gamepad2, ShoppingBag, 
  CreditCard, LogIn, ClipboardList, Hexagon, LayoutGrid
} from "lucide-react"; 

const CATEGORIES = [
  { id: 'All', label: 'All Categories', icon: <Filter className="w-4 h-4" /> },
  { id: 'Apps', label: 'App', icon: <Smartphone className="w-4 h-4" /> },
  { id: 'Casino', label: 'Casino', icon: <Diamond className="w-4 h-4" /> },
  { id: 'Crypto', label: 'Cripto', icon: <Bitcoin className="w-4 h-4" /> },
  { id: 'Games', label: 'Game', icon: <Gamepad2 className="w-4 h-4" /> },
  { id: 'Purchase', label: 'Purchase', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'Freetrial', label: 'Freetrial', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'Signup', label: 'Signup', icon: <LogIn className="w-4 h-4" /> },
  { id: 'Quizzes', label: 'Quiz', icon: <ClipboardList className="w-4 h-4" /> },
  { id: 'Other', label: 'Other', icon: <Hexagon className="w-4 h-4" /> }
];

export default function AllOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Logic still present but hidden from UI
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [apiNetworks, setApiNetworks] = useState<{name: string, count: number}[]>([]);

  const [sortBy, setSortBy] = useState('Sort By'); 
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedNetwork, setSelectedNetwork] = useState('All Networks'); 
  
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isNetOpen, setIsNetOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const catRef = useRef<HTMLDivElement>(null);
  const netRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(event.target as Node)) setIsCatOpen(false);
      if (netRef.current && !netRef.current.contains(event.target as Node)) setIsNetOpen(false);
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) setIsSortOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
        const res = await fetch('https://apitest.binnycash.com/api/user/network_Offer_Count', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'token': token || ''
          }
        });
        
        const text = await res.text();
        let json;
        try { json = JSON.parse(text); } catch(e) { json = {}; }
        
        let networkArr: any[] = [];
        const sourceData = json?.data || [];

        if (Array.isArray(sourceData)) {
           networkArr = sourceData.map((item: any) => ({
             name: item.network || item.name || 'Unknown',
             count: Number(item.count || 0)
           }));
        } else if (typeof sourceData === 'object') {
           networkArr = Object.entries(sourceData).map(([name, count]) => ({ name, count: Number(count) }));
        }

        networkArr.sort((a, b) => (b.count || 0) - (a.count || 0));
        setApiNetworks(networkArr);
      } catch (e) {
        console.error("Failed to fetch networks", e);
      }
    };
    fetchNetworks();
  }, []);

  useEffect(() => {
    const fetchAllOffers = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      let allFetchedOffers: any[] = [];
      let pageNum = 1;
      let hasMoreData = true;

      try {
        while (hasMoreData && pageNum <= 20) {
          const res = await fetch(`https://apitest.binnycash.com/api/user/offerlist?page=${pageNum}`, {
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
          else if (Array.isArray(resData?.data)) list = resData.data; 
          else if (Array.isArray(resData?.offers)) list = resData.offers; 

          if (list.length > 0) {
            allFetchedOffers = [...allFetchedOffers, ...list];
            pageNum++;
            if (list.length < 20) hasMoreData = false;
          } else { hasMoreData = false; }
        }

        const uniqueOffers = Array.from(new Map(allFetchedOffers.map(item => [item._id || item.id, item])).values());
        setOffers(uniqueOffers);
      } catch (err) {
        console.error(err);
      } finally { setIsLoading(false); }
    };
    fetchAllOffers();
  }, []);

  let processedOffers = filterOffersByDevice(offers, selectedDevices);

  const parseCategoryString = (val: any) => {
    if (!val) return '';
    if (Array.isArray(val)) return val.join(' ').toLowerCase();
    return String(val).toLowerCase();
  };

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    processedOffers = processedOffers.filter(offer => {
      const title = (offer.offerName || offer.title || offer.name || '').toLowerCase();
      const sub = parseCategoryString(offer.categories || offer.sub || offer.category);
      return title.includes(q) || sub.includes(q);
    });
  }

  if (selectedCategory !== 'All Categories') {
    const catMatch = CATEGORIES.find(c => c.label === selectedCategory)?.id.toLowerCase();
    if (catMatch && catMatch !== 'all') {
      processedOffers = processedOffers.filter(offer => {
        const cat = parseCategoryString(offer.categories || offer.category || offer.tags || offer.offerName);
        
        if (catMatch === 'games') return cat.includes('game') || cat.includes('play');
        if (catMatch === 'surveys') return cat.includes('survey') || cat.includes('opinion');
        if (catMatch === 'apps') return cat.includes('app') || cat.includes('install');
        if (catMatch === 'quizzes') return cat.includes('quiz') || cat.includes('trivia');
        if (catMatch === 'crypto') return cat.includes('crypto') || cat.includes('bitcoin') || cat.includes('cripto');
        if (catMatch === 'casino') return cat.includes('casino') || cat.includes('slot');
        if (catMatch === 'freetrial') return cat.includes('trial') || cat.includes('free');
        if (catMatch === 'signup') return cat.includes('sign') || cat.includes('register');
        if (catMatch === 'purchase') return cat.includes('purchase') || cat.includes('buy');
        
        return cat.includes(catMatch);
      });
    }
  }

  if (selectedNetwork !== 'All Networks') {
    processedOffers = processedOffers.filter(offer => {
      const prov = offer.network || offer.provider || '';
      return prov.toLowerCase() === selectedNetwork.toLowerCase();
    });
  }

  if (sortBy === 'High Reward') {
    processedOffers.sort((a, b) => parseFloat(b.userCredits ?? b.reward ?? b.payout ?? 0) - parseFloat(a.userCredits ?? a.reward ?? a.payout ?? 0));
  } else if (sortBy === 'Low Reward') {
    processedOffers.sort((a, b) => parseFloat(a.userCredits ?? a.reward ?? a.payout ?? 0) - parseFloat(b.userCredits ?? b.reward ?? b.payout ?? 0));
  }

  const getSortIcon = () => {
    if (sortBy === 'High Reward') return <ArrowUp className="w-4 h-4" />;
    if (sortBy === 'Low Reward') return <ArrowDown className="w-4 h-4" />;
    return <Flame className="w-4 h-4" />;
  };

  const getCatIcon = () => {
    const cat = CATEGORIES.find(c => c.label === selectedCategory);
    return cat ? cat.icon : <Filter className="w-4 h-4" />;
  };

  return (
    <div className="flex flex-col bg-[#0B0D19] min-h-[calc(100vh-80px)] text-white relative">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#8B5CF6]/5 blur-[120px] rounded-full pointer-events-none" />

      <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10 custom-scrollbar pb-24 sm:pb-8">
        
        {/* HERO BANNER - MOBILE OPTIMIZED */}
        <div className="relative w-full bg-[#111319] border border-white/5 rounded-[20px] sm:rounded-[24px] mb-4 sm:mb-6 overflow-hidden flex flex-col justify-center px-4 sm:px-6 md:px-10 py-6 sm:py-8 shadow-lg">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8B5CF6]/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#3B82F6]/5 blur-[80px] rounded-full -translate-x-1/3 translate-y-1/3"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
              <Link href="/dashboard" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8F95A3] hover:text-white transition-all backdrop-blur-md border border-white/5 shadow-sm">
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white flex items-center gap-2 sm:gap-3">
                <LayoutGrid className="w-6 h-6 sm:w-8 sm:h-8 text-[#8B5CF6]" /> All Offers
              </h1>
            </div>
            
            <div className="pl-11 sm:pl-14">
              <p className="text-[12px] sm:text-[13px] md:text-sm text-[#8F95A3] font-medium mb-0.5 sm:mb-1">Explore a diverse collection of offers from verified networks.</p>
              <p className="text-[12px] sm:text-[13px] md:text-sm text-[#8F95A3] font-medium">
                Total Available: <span className="text-[#8B5CF6] font-bold">{processedOffers.length} Offers</span>
              </p>
            </div>
          </div>
        </div>

        {/* FILTERS BAR - MOBILE OPTIMIZED (DEVICE TABS REMOVED) */}
        <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-3 sm:gap-4 mb-6 bg-[#111319]/80 backdrop-blur-md p-3 sm:p-4 rounded-[20px] border border-white/5 shadow-lg relative z-20">
          
          {/* Search Bar */}
          <div className="relative w-full xl:w-[320px] shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-[#8F95A3]" />
            </div>
            <input 
              type="text" 
              placeholder="Search offers..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-[#1A1C24] border border-white/5 text-white text-[13px] font-medium rounded-[14px] focus:ring-1 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6]/50 block pl-10 p-3 sm:p-3.5 placeholder-[#8F95A3] outline-none transition-all shadow-inner" 
            />
          </div>

          {/* Filters (Categories, Network, Sort) */}
          <div className="grid grid-cols-2 md:flex flex-wrap items-center gap-2 sm:gap-3 w-full xl:w-auto relative z-30">
            
            {/* 1. Category Dropdown */}
            <div className="relative w-full md:w-auto" ref={catRef}>
              <button 
                onClick={() => setIsCatOpen(!isCatOpen)}
                className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 bg-[#1A1C24] hover:bg-[#252836] border border-white/5 rounded-[14px] px-3 sm:px-4 py-2.5 text-[12px] sm:text-[14px] font-medium text-white transition-colors h-10 sm:h-11"
              >
                <div className="flex items-center gap-2 truncate">
                  {getCatIcon()}
                  <span className="truncate">{selectedCategory}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#A855F7] transition-transform ml-1 shrink-0 ${isCatOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCatOpen && (
                <div className="absolute left-0 top-full mt-2 w-[220px] bg-[#111319] border border-white/5 rounded-xl shadow-2xl overflow-hidden flex flex-col py-2 z-[100]">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat.id} 
                      onClick={() => {setSelectedCategory(cat.label); setIsCatOpen(false);}} 
                      className={`flex items-center gap-3 px-4 py-3 text-[13px] sm:text-[14px] font-medium transition-colors ${selectedCategory === cat.label ? 'bg-white/5 text-white' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'}`}
                    >
                      <span className="w-5 flex justify-center text-white">{cat.icon}</span> {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Network Dropdown */}
            <div className="relative w-full md:w-auto" ref={netRef}>
              <button 
                onClick={() => setIsNetOpen(!isNetOpen)}
                className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 bg-[#1A1C24] hover:bg-[#252836] border border-white/5 rounded-[14px] px-3 sm:px-4 py-2.5 text-[12px] sm:text-[14px] font-medium text-white transition-colors h-10 sm:h-11"
              >
                <div className="flex items-center gap-2 truncate">
                  <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" /> 
                  <span className="truncate">{selectedNetwork}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#A855F7] transition-transform ml-1 shrink-0 ${isNetOpen ? 'rotate-180' : ''}`} />
              </button>
              {isNetOpen && (
                <div className="absolute left-0 md:right-0 md:left-auto top-full mt-2 w-[240px] max-h-[300px] sm:max-h-[350px] overflow-y-auto custom-scrollbar bg-[#111319] border border-white/5 rounded-xl shadow-2xl flex flex-col py-2 z-[100]">
                  <button 
                    onClick={() => {setSelectedNetwork('All Networks'); setIsNetOpen(false);}} 
                    className={`flex items-center justify-between px-4 py-3 text-[13px] sm:text-[14px] font-medium transition-colors ${selectedNetwork === 'All Networks' ? 'bg-white/5 text-white' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'}`}
                  >
                    All Networks
                  </button>
                  {apiNetworks.map(net => (
                    <button 
                      key={net.name} 
                      onClick={() => {setSelectedNetwork(net.name); setIsNetOpen(false);}} 
                      className={`flex items-center justify-between px-4 py-3 text-[13px] sm:text-[14px] font-medium transition-colors ${selectedNetwork === net.name ? 'bg-white/5 text-white' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'}`}
                    >
                      <span className="truncate pr-2 capitalize">{net.name}</span>
                      {net.count > 0 && <span className="bg-[#A855F7] text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full">{net.count}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Sort By Dropdown */}
            <div className="relative w-full md:w-auto col-span-2 md:col-span-1" ref={sortRef}>
              <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 bg-[#1A1C24] hover:bg-[#252836] border border-white/5 rounded-[14px] px-3 sm:px-4 py-2.5 text-[12px] sm:text-[14px] font-medium text-white transition-colors h-10 sm:h-11"
              >
                <div className="flex items-center gap-2 truncate">
                  {getSortIcon()}
                  <span className="truncate">{sortBy}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#A855F7] transition-transform ml-1 shrink-0 ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>
              {isSortOpen && (
                <div className="absolute left-0 md:right-0 md:left-auto top-full mt-2 w-full md:w-[180px] bg-[#111319] border border-white/5 rounded-xl shadow-2xl overflow-hidden flex flex-col py-2 z-[100]">
                  <button onClick={() => {setSortBy('Most Popular'); setIsSortOpen(false);}} className={`flex items-center gap-3 px-4 py-3 text-[13px] sm:text-[14px] font-medium transition-colors ${sortBy === 'Most Popular' ? 'bg-white/5 text-white' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'}`}>
                    <Flame className="w-4 h-4 text-white" /> Most Popular
                  </button>
                  <button onClick={() => {setSortBy('High Reward'); setIsSortOpen(false);}} className={`flex items-center gap-3 px-4 py-3 text-[13px] sm:text-[14px] font-medium transition-colors ${sortBy === 'High Reward' ? 'bg-white/5 text-white' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'}`}>
                    <ArrowUp className="w-4 h-4 text-white" /> High Reward
                  </button>
                  <button onClick={() => {setSortBy('Low Reward'); setIsSortOpen(false);}} className={`flex items-center gap-3 px-4 py-3 text-[13px] sm:text-[14px] font-medium transition-colors ${sortBy === 'Low Reward' ? 'bg-white/5 text-white' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'}`}>
                    <ArrowDown className="w-4 h-4 text-white" /> Low Reward
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* OFFERS GRID */}
        {isLoading ? (
          <div className="grid grid-cols-2 min-[450px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4 lg:gap-5">
            {[...Array(14)].map((_, i) => (
              <div key={i} className="h-[200px] bg-[#111319] border border-white/5 animate-pulse rounded-[16px]"></div>
            ))}
          </div>
        ) : processedOffers.length > 0 ? (
          <div className="grid grid-cols-2 min-[450px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4 lg:gap-5">
            {processedOffers.map((offer, index) => (
              <OfferCard key={offer._id || offer.id || index} offer={offer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-[#111319] border border-white/5 rounded-[20px] flex flex-col items-center justify-center mt-4">
            <Settings2 className="w-12 h-12 text-[#8F95A3] mb-4 opacity-50" />
            <p className="text-white font-bold text-base sm:text-lg mb-1">No matching offers found</p>
            <p className="text-[#8F95A3] text-xs sm:text-sm">Try adjusting your filters or clearing the search query.</p>
            <button onClick={() => {setSearchQuery(''); setSelectedCategory('All Categories'); setSelectedNetwork('All Networks');}} className="mt-4 px-6 py-2.5 bg-[#8B5CF6]/20 text-[#8B5CF6] text-sm rounded-xl font-bold hover:bg-[#8B5CF6] hover:text-white transition-all">Clear All Filters</button>
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