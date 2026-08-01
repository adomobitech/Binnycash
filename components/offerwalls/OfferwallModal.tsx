'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';

export default function OfferwallModal({ isOpen, onClose, offerwall }: any) {
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');

  // Fetch UserId from LocalStorage on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem('numericUserId') || localStorage.getItem('userId') || '';
    setUserId(savedUserId);
  }, []);

  useEffect(() => {
    if (!isOpen || !offerwall) return;

    const fetchDetails = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token') || '';
      const targetId = offerwall._id || offerwall.id || offerwall.offerwall_id;

      try {
        let res = await fetch(`https://apitest.binnycash.com/api/user/user_view_offerwall_details`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ offerwall_id: targetId, id: targetId }) 
        });

        if (res.status === 404 || res.status === 405) {
          res = await fetch(`https://apitest.binnycash.com/api/user/user_view_offerwall_details?id=${targetId}&offerwall_id=${targetId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }

        const data = await res.json();
        const fetchedDetails = data?.data || offerwall;
        setDetails(fetchedDetails);
      } catch (err) {
        console.error("Failed to fetch offerwall details:", err);
        setDetails(offerwall); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [isOpen, offerwall]);

  if (!isOpen) return null;

  const displayData = details || offerwall || {};
  const name = displayData.title || offerwall?.title || 'Offerwall';
  
  // URL processing with User ID injection
  let rawUrl = displayData.offerwallUrl || displayData.url || offerwall?.offerwallUrl || '#';
  let finalIframeUrl = rawUrl !== '#' ? rawUrl.replace('{user_id}', userId) : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-8">
        {/* Dark Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0B0D19]/80 backdrop-blur-sm cursor-pointer"
        />

        {/* 🚀 Centered Popup Box - MT add kiya hai shift karne ke liye */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.3 }}
          className="w-full max-w-6xl h-[82vh] sm:h-[80vh] mt-16 sm:mt-20 bg-[#111319] border border-white/10 rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.8)] relative overflow-hidden z-10 flex flex-col"
        >
          
          {/* Header Bar */}
          <div className="h-[60px] bg-[#1A1C24] border-b border-white/5 flex items-center justify-between px-6 shrink-0">
            <h3 className="text-white font-bold text-lg">{name}</h3>
            
            <div className="flex items-center gap-3">
              {/* Fallback button if iframe gets blocked by provider */}
              {finalIframeUrl && !isLoading && (
                <a 
                  href={finalIframeUrl} 
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
          <div className="flex-1 w-full relative bg-white flex items-center justify-center">
            {isLoading ? (
              // Loading Spinner
              <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            ) : finalIframeUrl ? (
              // The Actual Offerwall Iframe
              <iframe 
                src={finalIframeUrl}
                className="absolute inset-0 w-full h-full border-none"
                allow="autoplay; camera; microphone; clipboard-read; clipboard-write;"
                title={`${name} Offerwall`}
              />
            ) : (
              // Error State
              <div className="text-[#8F95A3] font-medium text-sm flex flex-col items-center gap-2">
                <span>Failed to load Offerwall URL.</span>
                <button onClick={onClose} className="text-[#8B5CF6] hover:underline cursor-pointer">Close</button>
              </div>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}