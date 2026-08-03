'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HeroSection from '@/components/HeroSection';
import LowerHero from '@/components/LowerHero';
import TrustedFeatures from '@/components/TrustedFeatures';
import LiveCashouts from '@/components/LiveCashout';
import FAQSection from '@/components/FAQSection';
import TestimonialSection from '@/components/TestimonialSection';
import Footer from '@/components/Footer';

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.replace('/dashboard');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  // Jab tak token check ho raha hai, tab tak blank ya loader dikha sakte hain taaki page flash na ho
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#111319] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    // 👇 overflow-x-hidden aur w-full add kiya h fail-safe ke lie 👇
    <main className="bg-[#111319] min-h-screen text-white overflow-x-hidden w-full">
      <HeroSection />
      <LowerHero />
      <TrustedFeatures />
      <LiveCashouts />
      <FAQSection />
      <TestimonialSection />
      <Footer />
    </main>
  );
}