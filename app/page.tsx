import HeroSection from '@/components/HeroSection';
import LootVault from '@/components/LootVault';
import LowerHero from '@/components/LowerHero';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <LowerHero />
      <LootVault />
    </main>
  );
}