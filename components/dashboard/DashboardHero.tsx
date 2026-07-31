'use client';

import { motion } from 'framer-motion';
import HeroWallet from './HeroWallet'; 
import { Sparkles, ArrowRight } from 'lucide-react';

export default function DashboardHero() {
  
  const scrollToOffers = () => {
    const section = document.getElementById('featured-offers');
    if (section) {
      const yOffset = -100; 
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full relative flex flex-col pb-1">
      
      {/* Subtle Background Glow blended with the main screen */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#00E57A]/10 to-transparent pointer-events-none -z-10" />
      
      {/* Super reduced padding to make it very compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 items-center py-2 md:py-3 relative z-10">
        
        {/* Left Content Area */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          className="flex flex-col gap-3 justify-center"
        >
          {/* Welcome Back Badge */}
          <div className="flex items-center gap-1.5 text-[#00E57A] font-bold tracking-widest uppercase text-[9px] border border-[#00E57A]/30 bg-[#00E57A]/5 w-fit px-3 py-1 rounded-full">
            <Sparkles className="w-3 h-3" /> WELCOME BACK
          </div>
          
          {/* Main Heading - Smaller text size */}
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
            Earn More, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E57A] to-[#00b359] relative inline-block">
              Cash Out More!
            </span>
          </h1>
          
          {/* Subtitle - Smaller text size */}
          <p className="text-[#8F95A3] text-xs max-w-md font-medium leading-relaxed">
            Complete premium offers, take top-tier surveys, and climb the leaderboard to maximize your crypto and cash rewards.
          </p>
          
          {/* Button Container */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
            
            {/* Call to Action Button - Smaller padding and text */}
            <button 
              onClick={scrollToOffers}
              className="px-5 py-2.5 text-xs bg-gradient-to-r from-[#00E57A] to-[#00b359] text-black font-black rounded-full shadow-[0_0_15px_rgba(0,229,122,0.4)] hover:shadow-[0_0_25px_rgba(0,229,122,0.6)] transition-all hover:scale-105 flex items-center gap-2 group cursor-pointer"
            >
              Start Earning 
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
            </button>

          </div>
        </motion.div>

        {/* Right Content Area - Hero Wallet 3D Graphic */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center items-center h-full min-h-[150px] relative mt-2 lg:mt-0"
        >
          {/* Deep Purple Glow behind the wallet - Reduced size */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-[#8B5CF6]/20 blur-[60px] rounded-full pointer-events-none" />
          <HeroWallet />
        </motion.div>
      </div>
    </div>
  );
}