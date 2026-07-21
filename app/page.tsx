import HeroSection from '@/components/HeroSection';
import LootVault from '@/components/TrustedFeatures';
import LowerHero from '@/components/LowerHero';
import FeaturedGames from '@/components/TrustedFeatures';
import TrustedFeatures from '@/components/TrustedFeatures';
import LiveCashouts from '@/components/LiveCashout';
import FAQSection from '@/components/FAQSection';
import TestimonialSection from '@/components/TestimonialSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
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