'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OfferSlider from '@/components/offers/OfferSlider';

const LIVE_FEEDS = [
  { id: 1, image: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=50&h=50&fit=crop', user: 'Ixtab', action: 'BitLabs Surveys', amount: '+$0.21' },
  { id: 2, image: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=50&h=50&fit=crop', user: 'Ixtab', action: 'BitLabs Surveys', amount: '+$0.27' },
  { id: 3, image: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=50&h=50&fit=crop', user: 'Ixtab', action: 'BitLabs Surveys', amount: '+$0.21' },
  { id: 4, image: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=50&h=50&fit=crop', user: 'Ixtab', action: 'Cpx Surveys', amount: '+$0.39' },
  { id: 5, image: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=50&h=50&fit=crop', user: 'Ixtab', action: 'Cpx Surveys', amount: '+$0.39' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  // 1. STRICT ROUTE PROTECTION
  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setIsAuthenticated(false);
        router.push('/'); 
      } else {
        setIsAuthenticated(true);
      }
    };

    // First check
    checkAuth();

    // Ye continuously check karega, agar navbar se token delete hua toh turant bahar phekega
    const authInterval = setInterval(checkAuth, 1000);
    window.addEventListener('storage', checkAuth);

    return () => {
      clearInterval(authInterval);
      window.removeEventListener('storage', checkAuth);
    };
  }, [router]);

  const handleSelectDevice = (device: string) => {
    setSelectedDevices((prev) => {
      if (prev.includes(device)) {
        return prev.filter((d) => d !== device);
      }
      return [...prev, device];
    });
  };

  // 2. AUTO-FETCH LOGIC FOR DASHBOARD (Saari offers lane ke liye)
  useEffect(() => {
    if (!isAuthenticated) return;

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
            
            if (list.length < 20) {
              hasMoreData = false;
            }
          } else {
            hasMoreData = false;
          }
        }

        const uniqueOffers = Array.from(
          new Map(allFetchedOffers.map(item => [item._id || item.id, item])).values()
        );
        
        setOffers(uniqueOffers);

      } catch (err) {
        console.error("Error fetching all offers for dashboard:", err);
        setOffers(allFetchedOffers); 
      } finally {
        setIsLoadingOffers(false);
      }
    };

    fetchAllOffers();
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#0E1015] text-white pb-20 pt-4">
      <div className="w-full px-4 md:px-6 mb-6">
        <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar no-scrollbar pb-2">
          {LIVE_FEEDS.map((feed, i) => (
            <div key={i} className="flex items-center gap-3 bg-[#1A1C24] border border-white/5 px-4 py-2.5 rounded-2xl shrink-0">
              <img src={feed.image} className="w-8 h-8 rounded-lg object-cover bg-white" alt="user" />
              <div className="flex flex-col pr-6">
                <span className="text-xs font-bold text-white">{feed.user}</span>
                <span className="text-[10px] text-[#8F95A3]">{feed.action}</span>
              </div>
              <div className="flex items-center gap-1 bg-[#8B5CF6]/10 px-2.5 py-1 rounded-xl border border-[#8B5CF6]/20">
                <svg className="w-3.5 h-3.5 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-black text-[#8B5CF6]">{feed.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full px-4 md:px-6 flex flex-col gap-8">
        <OfferSlider 
          offers={offers} 
          isLoading={isLoadingOffers} 
          selectedDevices={selectedDevices} 
          onSelectDevice={handleSelectDevice} 
        />
      </div>
    </div>
  );
}