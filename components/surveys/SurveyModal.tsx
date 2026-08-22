'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency'; 

export default function SurveyModal({ isOpen, onClose, survey }: any) {
  const currency = useCurrency(); 
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !survey) return null;

  // 🔥 TITLE & DYNAMIC REWARD FIX 🔥
  const title = survey?.offerName || survey?.title || survey?.name || survey?.offer_name || 'Featured Survey';
  const rewardVal = survey?.userCredits ?? survey?.reward ?? survey?.payout ?? 0;
  
  // Yahan par ab formatPrice function use hoga taaki Coins/USD dono chale
  const reward = formatPrice(rewardVal, currency);

  const handleStartSurvey = async () => {
    setIsProcessing(true);
    const token = localStorage.getItem('token') || '';
    const targetId = survey._id || survey.id || survey.offer_id;

    try {
      const res = await fetch(`https://api.binnycash.com/api/user/tracking/user_click`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ offerId: targetId }) 
      });
      const responseText = await res.text();
      let finalUrl = survey?.click_url || survey?.link || '';
      
      const urlMatch = responseText.match(/location\.replace\("([^"]+)"\)/i) || responseText.match(/url=([^"]+)/i);
      if (urlMatch) finalUrl = urlMatch[1];
      
      if (finalUrl) window.open(finalUrl, '_blank');
    } catch (err) {
      console.error(err);
      if (survey?.click_url) window.open(survey.click_url, '_blank');
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0, scale: 0.95 }} 
          className="w-full max-w-[420px] bg-[#111319] border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
                <Play className="w-4 h-4 text-black ml-0.5" fill="currentColor" />
              </div>
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                Survey Check
                <span className="bg-[#8B5CF6]/20 text-[#8B5CF6] text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-[#8B5CF6]/30">
                  Important
                </span>
              </h2>
            </div>
            <button onClick={onClose} className="text-[#8F95A3] hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 flex flex-col gap-4">
            {/* VPN Warning Box */}
            <div className="bg-[#3A1C24] border border-[#EF4444]/30 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <p className="text-white text-[13px] font-bold">Using VPN or proxy is strictly prohibited.</p>
                <p className="text-[#8F95A3] text-[12px] font-medium">Your account may be suspended if detected.</p>
              </div>
            </div>

            {/* Survey Details Box */}
            <div className="bg-[#1A1C24] border border-white/5 rounded-xl p-4 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-[#8F95A3] text-[12px] font-medium">Survey</span>
                <span className="text-white font-black text-base truncate max-w-[200px]">{title}</span>
              </div>
              {/* 🔥 REWARD WILL BE DISPLAYED DYNAMICALLY 🔥 */}
              <div className="bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] font-black text-sm px-3 py-1.5 rounded-lg">
                {reward}
              </div>
            </div>

            {/* Instructions */}
            <div className="flex flex-col gap-2 mt-2">
              <h3 className="text-[#8F95A3] text-[12px] font-bold mb-1">Instructions</h3>
              <div className="bg-[#1A1C24] border border-white/5 rounded-lg p-3 flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#10B981]/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                </div>
                <span className="text-white text-[13px] font-medium">Provide accurate and honest information.</span>
              </div>
              <div className="bg-[#1A1C24] border border-white/5 rounded-lg p-3 flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#10B981]/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                </div>
                <span className="text-white text-[13px] font-medium">Complete the survey without interruption.</span>
              </div>
              <div className="bg-[#1A1C24] border border-white/5 rounded-lg p-3 flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#10B981]/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                </div>
                <span className="text-white text-[13px] font-medium">Do not use VPN or proxy services.</span>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="p-5 flex items-center justify-end gap-3 pt-2">
            <button 
              onClick={onClose} 
              className="px-5 py-2.5 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleStartSurvey} disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl bg-[#A855F7] hover:bg-[#9333EA] shadow-[0_0_15px_rgba(168,85,247,0.4)] text-white font-bold text-sm transition-all disabled:opacity-70 flex items-center justify-center min-w-[120px]"
            >
              {isProcessing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Start Survey'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}