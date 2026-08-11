'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';

export default function OfferwallModal({ isOpen, onClose, offerwall }: any) {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [userId, setUserId] = useState('');

  // Fetch UserId from LocalStorage on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem('numericUserId') || localStorage.getItem('userId') || '';
    setUserId(savedUserId);
  }, []);

  useEffect(() => {
    if (!isOpen || !offerwall) {
      setIframeUrl(null);
      setApiError(null);
      return;
    }

    const fetchTrackingUrl = async () => {
      setIsLoading(true);
      setApiError(null);
      
      const token = localStorage.getItem('token') || '';
      const targetId = offerwall._id || offerwall.id || offerwall.offerwallId || offerwall.offerwall_id;

      try {
        // 🔥 NEW API INTEGRATION: track_offerwall 🔥
        const res = await fetch(`https://apitest.binnycash.com/api/user/track_offerwall`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
          },
          // Format based on your Swagger screenshot
          body: JSON.stringify({ offerwallId: targetId, type: "Offerwall" }) 
        });

        // 🛡️ Safe HTML/JSON Parse (Crash Prevention) 🛡️
        const text = await res.text();
        let jsonRes: any = null;
        if (text && !text.trim().startsWith('<')) {
          try { jsonRes = JSON.parse(text); } catch(e) {}
        }

        if (jsonRes && (jsonRes.code === 200 || jsonRes.type === 'success' || jsonRes.url || jsonRes.data?.url)) {
          // Extract the URL dynamically based on standard API responses
          let finalUrl = jsonRes.url || jsonRes.data?.url || jsonRes.offerwallUrl || jsonRes.data?.offerwallUrl || null;
          
          // Fallback manual replacement just in case API returns raw template
          if (finalUrl && finalUrl.includes('{user_id}')) {
            finalUrl = finalUrl.replace('{user_id}', userId);
          }
          
          // Fallback if API didn't return URL but it exists in card props
          if (!finalUrl && offerwall.offerwallUrl) {
            finalUrl = offerwall.offerwallUrl.replace('{user_id}', userId);
          }

          if (finalUrl && finalUrl !== '#') {
            setIframeUrl(finalUrl);
          } else {
            setApiError("Offerwall tracking URL not found.");
          }
        } else {
          setApiError(jsonRes?.message || "Failed to load offerwall link from server.");
        }
      } catch (err) {
        console.error("Failed to fetch offerwall tracking URL:", err);
        // Fallback directly to the local offerwall URL if the API network fails
        if (offerwall.offerwallUrl) {
           setIframeUrl(offerwall.offerwallUrl.replace('{user_id}', userId));
        } else {
           setApiError("Network error. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrackingUrl();
  }, [isOpen, offerwall, userId]);

  if (!isOpen) return null;

  const name = offerwall?.title || offerwall?.offerwall_name || offerwall?.name || 'Offerwall';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-8">
        {/* Dark Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0B0D19]/80 backdrop-blur-sm cursor-pointer"
        />

        {/* 🚀 Centered Popup Box */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.3 }}
          className="w-full max-w-6xl h-[82vh] sm:h-[80vh] mt-16 sm:mt-20 bg-[#111319] border border-white/10 rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.8)] relative overflow-hidden z-10 flex flex-col"
        >
          
          {/* Header Bar */}
          <div className="h-[60px] bg-[#1A1C24] border-b border-white/5 flex items-center justify-between px-6 shrink-0">
            <h3 className="text-white font-bold text-lg">{name}</h3>
            
            <div className="flex items-center gap-3">
              {/* Fallback button if iframe gets blocked by provider */}
              {iframeUrl && !isLoading && !apiError && (
                <a 
                  href={iframeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-[#8B5CF6] hover:text-white transition-colors"
                >
                  <span className="hidden sm:inline">Open in Browser</span> <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-[#8F95A3] hover:text-white transition-colors border border-white/5 cursor-pointer ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Iframe / Loading Container */}
          <div className="flex-1 w-full relative bg-white flex items-center justify-center overflow-hidden">
            {isLoading ? (
              // Loading Spinner
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                <span className="text-[#111319] font-bold text-sm">Generating your link...</span>
              </div>
            ) : apiError ? (
              // Error State
              <div className="text-[#8F95A3] font-medium text-sm flex flex-col items-center gap-2 bg-[#1A1C24] p-6 rounded-xl border border-white/10">
                <span className="text-red-400 font-bold mb-1">Error Loading Offerwall</span>
                <span>{apiError}</span>
                <button onClick={onClose} className="mt-3 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors cursor-pointer border border-white/5">Close Window</button>
              </div>
            ) : iframeUrl ? (
              // The Actual Offerwall Iframe
              <iframe 
                src={iframeUrl}
                className="absolute inset-0 w-full h-full border-none"
                allow="autoplay; camera; microphone; clipboard-read; clipboard-write;"
                title={`${name} Offerwall`}
              />
            ) : null}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}