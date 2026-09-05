'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import DashboardHero from '@/components/dashboard/DashboardHero';
import CategoryTabs from '@/components/dashboard/CategoryTabs';
import OfferSlider from '@/components/offers/OfferSlider';
import OfferwallSlider from '@/components/offerwalls/OfferwallSlider';
import SurveywallSlider from '@/components/surveywalls/SurveywallSlider'; 

export default function DashboardPage() {
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 1. OFFERS STATE
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  // 2. OFFERWALLS STATE
  const [offerwalls, setOfferwalls] = useState<any[]>([]);
  const [isLoadingOfferwalls, setIsLoadingOfferwalls] = useState(true);

  // 3. SURVEYWALLS STATE
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

  // --- FETCH OFFERS ---
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchAllOffers = async () => {
      const token = localStorage.getItem('token') || '';
      try {
        const res = await fetch(`https://api.binnycash.com/api/user/offerlist?page=1`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const resData = await res.json();
        setOffers(resData?.data?.list || resData?.data || resData || []);
      } catch (err) {
        console.error(err);
      } finally { 
        setIsLoadingOffers(false); 
      }
    };
    fetchAllOffers();
  }, [isAuthenticated]);

  // --- FETCH BOTH OFFERWALLS & SURVEYWALLS IN A SINGLE API CALL ---
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchWallsData = async () => {
      const token = localStorage.getItem('token') || '';
      try {
        const res = await fetch(`https://api.binnycash.com/api/user/user_offerwall_list`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
          }
        });
        const json = await res.json();

        // Safe extraction format strictly based on your JSON structure
        const wallsData = json?.data?.data || {};
        
        // Setting both states from the same API response
        setOfferwalls(wallsData?.offerwall || []);
        setSurveywalls(wallsData?.survey || []);

      } catch (err) { 
        console.error("Failed to fetch walls:", err); 
      } finally { 
        setIsLoadingOfferwalls(false); 
        setIsLoadingSurveywalls(false); 
      }
    };
    
    fetchWallsData();
  }, [isAuthenticated]);

  if (!isMounted || !isAuthenticated) {
    return <div className="min-h-screen bg-[#0B0D19]" />;
  }

  return (
    <div className="flex flex-col bg-[#0B0D19] min-h-screen text-white relative">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#8B5CF6]/5 blur-[120px] rounded-full pointer-events-none" />

      <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 custom-scrollbar pb-24 sm:pb-8">
        
        <div className="w-full mb-4">
          <DashboardHero />
        </div>

        <CategoryTabs />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-8 mt-2" 
        >
          {(isLoadingOffers || offers.length > 0) && (
            <div id="featured-offers">
              <OfferSlider 
                offers={offers} 
                isLoading={isLoadingOffers} 
                selectedDevices={selectedDevices} 
                onSelectDevice={handleSelectDevice} 
              />
            </div>
          )}
          
          {(isLoadingOfferwalls || offerwalls.length > 0) && (
            <OfferwallSlider 
              offerwalls={offerwalls} 
              isLoading={isLoadingOfferwalls} 
            />
          )}

          {(isLoadingSurveywalls || surveywalls.length > 0) && (
            <SurveywallSlider 
              surveywalls={surveywalls} 
              isLoading={isLoadingSurveywalls} 
            />
          )}
        </motion.div>
      </main>
    </div>
  );
}