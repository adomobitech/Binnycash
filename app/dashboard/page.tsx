'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import LiveTicker from '@/components/dashboard/LiveTicker';
import DashboardHero from '@/components/dashboard/DashboardHero';
import CategoryTabs from '@/components/dashboard/CategoryTabs';
import OfferSlider from '@/components/offers/OfferSlider';
import SurveySlider from '@/components/surveys/SurveySlider';
import OfferwallSlider from '@/components/offerwalls/OfferwallSlider';
import SurveywallSlider from '@/components/surveywalls/SurveywallSlider'; 

export default function DashboardPage() {
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
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
    setIsMounted(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      router.push('/');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleSelectDevice = (device: string) => {
    setSelectedDevices(prev => prev.includes(device) ? prev.filter(d => d !== device) : [...prev, device]);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchLiveFeeds = async () => {
      const token = localStorage.getItem('token') || '';
      try {
        // 🔥 CHANGED API TO userActivity 🔥
        const res = await fetch(`https://apitest.binnycash.com/api/user/inbox/userActivity`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const text = await res.text();
        let resData; 
        try { resData = JSON.parse(text); } catch (e) { resData = {}; }
        
        let feeds: any[] = [];

        // 🔥 Safely handle the specific error structure you mentioned 🔥
        if (resData?.type === 'error' || resData?.code === 404) {
           feeds = Array.isArray(resData?.data) ? resData.data : [];
        } 
        else if (Array.isArray(resData)) feeds = resData; 
        else if (Array.isArray(resData?.data)) feeds = resData.data;
        else if (Array.isArray(resData?.data?.data)) feeds = resData.data.data;
        else if (Array.isArray(resData?.data?.inbox)) feeds = resData.data.inbox; 
        else if (Array.isArray(resData?.data?.data?.inbox)) feeds = resData.data.data.inbox; 
        else if (Array.isArray(resData?.data?.list)) feeds = resData.data.list; 
        else if (Array.isArray(resData?.inbox)) feeds = resData.inbox;
        
        setLiveFeeds(feeds);
      } catch (err) { 
        console.error("Error fetching live feeds:", err); 
        setLiveFeeds([]);
      } finally { 
        setIsLoadingFeeds(false); 
      }
    };
    fetchLiveFeeds();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchAllOffers = async () => {
      const token = localStorage.getItem('token') || '';
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

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchAllSurveys = async () => {
      const token = localStorage.getItem('token') || '';
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

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchOfferwalls = async () => {
      const token = localStorage.getItem('token') || '';
      try {
        const res = await fetch(`https://apitest.binnycash.com/api/user/user_offerwall_list`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        const text = await res.text();
        let resData; try { resData = JSON.parse(text); } catch (e) { resData = {}; }
        let list: any[] = [];
        if (Array.isArray(resData)) list = resData; 
        else if (Array.isArray(resData?.data?.data?.offerwall)) list = resData.data.data.offerwall; 
        else if (Array.isArray(resData?.data?.offerwall)) list = resData.data.offerwall; 
        else if (Array.isArray(resData?.offerwall)) list = resData.offerwall; 
        else if (Array.isArray(resData?.data?.list)) list = resData.data.list; 
        else if (Array.isArray(resData?.data)) list = resData.data;
        setOfferwalls(list);
      } catch (err) { console.error(err); } finally { setIsLoadingOfferwalls(false); }
    };
    fetchOfferwalls();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchSurveywalls = async () => {
      const token = localStorage.getItem('token') || '';
      try {
        const res = await fetch(`https://apitest.binnycash.com/api/user/user_surveywall_list`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        const text = await res.text();
        let resData; try { resData = JSON.parse(text); } catch (e) { resData = {}; }
        let list: any[] = [];
        if (Array.isArray(resData)) list = resData; 
        else if (Array.isArray(resData?.data?.data?.surveywall)) list = resData.data.data.surveywall; 
        else if (Array.isArray(resData?.data?.surveywall)) list = resData.data.surveywall; 
        else if (Array.isArray(resData?.surveywall)) list = resData.surveywall; 
        else if (Array.isArray(resData?.data?.list)) list = resData.data.list; 
        else if (Array.isArray(resData?.data)) list = resData.data;
        setSurveywalls(list);
      } catch (err) { console.error(err); } finally { setIsLoadingSurveywalls(false); }
    };
    fetchSurveywalls();
  }, [isAuthenticated]);

  if (!isMounted || !isAuthenticated) {
    return <div className="min-h-screen bg-[#0B0D19]" />;
  }

  return (
    <div className="flex flex-col bg-[#0B0D19] min-h-screen text-white relative">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#8B5CF6]/5 blur-[120px] rounded-full pointer-events-none" />

      {!isLoadingFeeds && liveFeeds.length > 0 && (
        <LiveTicker feeds={liveFeeds} />
      )}

      {/* 噫 Page padding top/bottom reduced */}
      <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 custom-scrollbar pb-24 sm:pb-8">
        
        {/* 噫 Margin Bottom reduced */}
        <div className="w-full mb-4">
          <DashboardHero />
        </div>

        <CategoryTabs />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-8" /* 噫 Gap between sliders reduced from 12 to 8 */
        >
          {/* 櫨 CONDITIONAL RENDERING ADDED 櫨 */}
          {(isLoadingOffers || offers.length > 0) && (
            <div id="featured-offers">
              <OfferSlider offers={offers} isLoading={isLoadingOffers} selectedDevices={selectedDevices} onSelectDevice={handleSelectDevice} />
            </div>
          )}
          
          {(isLoadingSurveys || surveys.length > 0) && (
            <SurveySlider surveys={surveys} isLoading={isLoadingSurveys} />
          )}

          {(isLoadingOfferwalls || offerwalls.length > 0) && (
            <OfferwallSlider offerwalls={offerwalls} isLoading={isLoadingOfferwalls} />
          )}

          {(isLoadingSurveywalls || surveywalls.length > 0) && (
            <SurveywallSlider surveywalls={surveywalls} isLoading={isLoadingSurveywalls} />
          )}
        </motion.div>
      </main>
    </div>
  );
}