import HeroSection from '@/components/HeroSection';
import LowerHero from '@/components/LowerHero';
import LootVault from '@/components/LootVault'; // Import LootVault

export default function Home() {
  return (
    <main className="min-h-screen relative bg-[#030308] text-white font-sans overflow-x-hidden selection:bg-fuchsia-500/30">
      
      {/* 🌍 Global Page Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px] -z-30"></div>
      
      {/* 1. Hero Section (Top) */}
      <HeroSection />

      {/* 2. Lower Hero Section (Trending Games + Character) */}
      <section className="relative z-20">
        <LowerHero />
      </section>

      {/* 3. Loot Vault Section (The New Section) */}
      <section className="relative z-20">
        <LootVault />
      </section>

      {/* Aage ke sections yahan add honge */}

    </main>
  );
}