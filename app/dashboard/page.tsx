'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar'; 
import OfferSlider from '@/components/offers/OfferSlider';
import SurveySlider from '@/components/surveys/SurveySlider';
import OfferwallSlider from '@/components/offerwalls/OfferwallSlider';
import SurveywallSlider from '@/components/surveywalls/SurveywallSlider'; 

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [liveFeeds, setLiveFeeds] = useState<any[]>([]);
  const [isLoadingFeeds, setIsLoadingFeeds] = useState(true);

  const [offers, setOffers] = useState<any[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  const [surveys, setSurveys] = useState<any[]>([]);
  const [isLoadingSurveys, setIsLoadingSurveys] = useState(true);

  const [offerwalls, setOfferwalls] = useState<any[]>([]);
  const [isLoadingOfferwalls, setIsLoadingOfferwalls] = useState(true);

  const [surveywalls, setSurveywalls] = useState<any[]>([]);
  const [isLoadingSurveywalls, setIsLoadingSurveywalls] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) { setIsAuthenticated(false); router.push('/'); } 
      else { setIsAuthenticated(true); }
    };
    checkAuth();
  }, [router]);

  const handleSelectDevice = (device: string) => {
    setSelectedDevices(prev => prev.includes(device) ? prev.filter(d => d !== device) : [...prev, device]);
  };

  // FETCH: LIVE FEEDS
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchLiveFeeds = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      try {
        const res = await fetch(`https://apitest.binnycash.com/api/user/inbox/inbox`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const resData = await res.json();
        setLiveFeeds(resData?.data || resData || []);
      } catch (err) { 
        console.error("Feed error:", err);
      } finally { 
        setIsLoadingFeeds(false); 
      }
    };
    fetchLiveFeeds();
  }, [isAuthenticated]);

  // FETCH: OFFERS
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchAllOffers = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      try {
        const res = await fetch(`https://apitest.binnycash.com/api/user/offerlist?page=1`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const resData = await res.json();
        setOffers(resData?.data?.list || resData?.data || resData || []);
      } catch (err) {} finally { setIsLoadingOffers(false); }
    };
    fetchAllOffers();
  }, [isAuthenticated]);

  // FETCH: SURVEYS
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchAllSurveys = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      try {
        const res = await fetch(`https://apitest.binnycash.com/api/user/surveyList`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const resData = await res.json();
        setSurveys(resData?.data?.list || resData?.data || resData?.surveys || resData || []);
      } catch (err) {} finally { setIsLoadingSurveys(false); }
    };
    fetchAllSurveys();
  }, [isAuthenticated]);

  // FETCH: OFFERWALLS
  useEffect(() => {
    if (!isAuthenticated) return;
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
        console.error("Offerwall fetch error:", err);
      } finally { 
        setIsLoadingOfferwalls(false); 
      }
    };
    fetchOfferwalls();
  }, [isAuthenticated]);

  // FETCH: SURVEYWALLS
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchSurveywalls = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      try {
        const res = await fetch(`https://apitest.binnycash.com/api/user/user_surveywall_list`, {
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
        console.error("Surveywall fetch error:", err);
      } finally { 
        setIsLoadingSurveywalls(false); 
      }
    };
    fetchSurveywalls();
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const themeColors = [
    { bg: 'bg-[#150E28]', border: 'border-[#8B5CF6]/30', text: 'text-[#8B5CF6]', pillBg: 'bg-[#8B5CF6]/10', hover: 'hover:border-[#8B5CF6]/60 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]' },
    { bg: 'bg-[#0A1A16]', border: 'border-[#00E57A]/30', text: 'text-[#00E57A]', pillBg: 'bg-[#00E57A]/10', hover: 'hover:border-[#00E57A]/60 hover:shadow-[0_0_20px_rgba(0,229,122,0.15)]' },
    { bg: 'bg-[#0B1224]', border: 'border-[#3B82F6]/30', text: 'text-[#3B82F6]', pillBg: 'bg-[#3B82F6]/10', hover: 'hover:border-[#3B82F6]/60 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]' },
    { bg: 'bg-[#1F150A]', border: 'border-[#F59E0B]/30', text: 'text-[#F59E0B]', pillBg: 'bg-[#F59E0B]/10', hover: 'hover:border-[#F59E0B]/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]' },
  ];

  return (
    <div className="flex bg-[#0E1015] min-h-screen text-white">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Dashboard Content Area */}
      <main className="flex-1 min-w-0 pt-[80px] pb-12">
        
        {/* LIVE FEEDS */}
        <div className="w-full px-4 md:px-8 mb-8">
          <div className="flex items-center gap-4 overflow-x-auto hide-scrollbar pb-2">
            {isLoadingFeeds ? (
              [1, 2, 3, 4].map(n => (
                <div key={n} className="w-[300px] h-[110px] shrink-0 bg-[#1A1C24] border border-white/5 rounded-2xl animate-pulse"></div>
              ))
            ) : liveFeeds.length > 0 ? (
              liveFeeds.map((feed, i) => {
                const theme = themeColors[i % 4];
                const userName = feed.userName || 'Awesome User';
                const offerName = feed.offer || 'Offer Completed';
                const rewardAmount = feed.totalUsdValue ? `+$${feed.totalUsdValue}` : '+$0.00';
                
                let imageUrl = 'https://ui-avatars.com/api/?name=User&background=random';
                if (feed.image) {
                  imageUrl = feed.image.startsWith('http') ? feed.image : `https://apitest.binnycash.com${feed.image}`;
                }

                return (
                  <div key={feed._id || i} className={`w-[300px] h-[110px] shrink-0 rounded-2xl border ${theme.bg} ${theme.border} ${theme.hover} transition-all duration-300 p-4 flex flex-col justify-between cursor-pointer group relative overflow-hidden`}>
                    <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-[40px] opacity-20 ${theme.pillBg}`}></div>

                    <div className="flex justify-between items-center z-10">
                      <div className="flex items-center gap-2">
                        <img 
                          src={imageUrl} 
                          alt="provider"
                          className="w-5 h-5 rounded-md object-contain bg-white/10"
                          onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${userName.replace(/\s+/g, '+')}&background=random&color=fff`; }}
                        />
                        <span className="text-[11px] font-bold text-[#8F95A3] truncate max-w-[110px]">{offerName}</span>
                      </div>
                      <div className={`px-2.5 py-1 rounded-lg ${theme.pillBg} ${theme.text} border ${theme.border} text-[11px] font-black tracking-wide`}>
                        {rewardAmount}
                      </div>
                    </div>

                    <div className="z-10">
                      <h3 className="text-white text-[15px] font-black truncate">{userName}</h3>
                    </div>

                    <div className="flex justify-between items-center z-10">
                      <span className="text-[10px] font-medium text-[#8F95A3]">Completed offer & earn</span>
                    </div>
                  </div>
                )
              })
            ) : (
               <div className="text-[12px] text-[#8F95A3] font-medium py-2">No live activity right now.</div>
            )}
          </div>
        </div>

        {/* DASHBOARD SLIDERS */}
        <div className="w-full px-4 md:px-8 flex flex-col gap-10">
          <OfferSlider offers={offers} isLoading={isLoadingOffers} selectedDevices={selectedDevices} onSelectDevice={handleSelectDevice} />
          <SurveySlider surveys={surveys} isLoading={isLoadingSurveys} />
          <OfferwallSlider offerwalls={offerwalls} isLoading={isLoadingOfferwalls} />
          <SurveywallSlider surveywalls={surveywalls} isLoading={isLoadingSurveywalls} />
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}