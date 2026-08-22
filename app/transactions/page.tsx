'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, Clock, ShieldCheck, ChevronRight, 
  CircleDollarSign, ChevronLeft, Landmark
} from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

// --- SAFE JSON PARSER ---
const safeJsonParse = async (res: Response) => {
  try {
    const text = await res.text();
    if (text && !text.trim().startsWith('<')) {
      return JSON.parse(text);
    }
    return { code: 500, data: null, message: "HTML returned instead of JSON" };
  } catch (error) {
    return { code: 500, data: null, message: "Parse Failed" };
  }
};

// --- CUSTOM SVG ICONS ---
const UPIIcon = () => (
  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.5 4.5L19.5 9.5L14.5 14.5" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.5 19.5L4.5 14.5L9.5 9.5" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19.5 9.5H4.5" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  </div>
);

const PhonePeIcon = () => (
  <div className="w-12 h-12 rounded-full bg-[#5E17EB] flex items-center justify-center shadow-[0_0_15px_rgba(94,23,235,0.3)]">
    <span className="text-white font-black text-xl mb-1">पे</span>
  </div>
);

const BankIcon = () => (
  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
    <Landmark className="w-6 h-6 text-[#F59E0B]" fill="#F59E0B" />
  </div>
);

const PaytmIcon = () => (
  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
    <span className="text-[#002970] font-black text-[13px] tracking-tight">Pay<span className="text-[#00BAF2]">tm</span></span>
  </div>
);

const PayPalIcon = () => (
  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
    <span className="text-[#003087] font-black text-xl italic tracking-tighter">P</span><span className="text-[#009CDE] font-black text-xl italic tracking-tighter">P</span>
  </div>
);

// --- MAIN PAGE ---
export default function TransactionsPage() {
  const currency = useCurrency();
  const isCoin = currency === 'Coin' || currency === 'COIN';

  // Stats State
  const [totalEarning, setTotalEarning] = useState('0.00');
  const [pendingAmount, setPendingAmount] = useState('0.00');
  const [loading, setLoading] = useState(true);
  
  // Withdrawals & Pagination State
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Wallet Data (For top 4 blocks)
  const fetchWalletStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

      // 🔥 FIX: Sirf ek API se saara data fetch ho raha hai ab 🔥
      const resView = await fetch('https://api.binnycash.com/api/user/balance/view', { method: 'GET', headers });
      const jsonView = await safeJsonParse(resView);

      if (jsonView.code === 200 && jsonView.data) {
        setTotalEarning(jsonView.data.availableBalance ?? '0.00');
        setPendingAmount(jsonView.data.pendingHoldAmount ?? jsonView.data.totalPendingBalance ?? '0.00');
      }
      
    } catch (err) {
      console.error('Failed to fetch stats data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Withdraw History with Pagination
  const fetchWithdrawals = async (page = 1) => {
    setWithdrawalsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://api.binnycash.com/api/user/withdrawHistory?page=${page}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      
      const json = await safeJsonParse(res);
      if (json.code === 200 && json.data) {
        setWithdrawals(json.data.data || []);
        setCurrentPage(json.data.currentPage || 1);
        setTotalPages(json.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch withdrawal history:', err);
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  useEffect(() => { 
    fetchWalletStats(); 
    fetchWithdrawals(1); 
  }, []);

  // UI Helpers
  const getMethodIcon = (method: string | null) => {
    switch ((method || '').toLowerCase()) {
      case 'upi': return <UPIIcon />;
      case 'phonepe': return <PhonePeIcon />;
      case 'bank': return <BankIcon />;
      case 'paytm': return <PaytmIcon />;
      case 'paypal': return <PayPalIcon />;
      default: return <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"><Wallet className="w-5 h-5 text-[#8F95A3]" /></div>;
    }
  };

  const getStatusStyle = (status: string) => {
    switch ((status || '').toUpperCase()) {
      case 'PENDING': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'COMPLETED': case 'APPROVED': case 'SUCCESS': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'REJECTED': case 'FAILED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-white/5 text-white/60 border-white/10';
    }
  };

  // Calculations for blocks
  const totalWithdrawnAmount = withdrawals.reduce((sum, w) => {
    const s = String(w.status || '').toUpperCase();
    return (s === 'COMPLETED' || s === 'APPROVED' || s === 'SUCCESS') ? sum + Number(w.amount || 0) : sum;
  }, 0);
  const totalWithdrawalsCount = withdrawals.length;

  return (
    <div className="flex flex-col bg-[#0B0D19] min-h-[calc(100vh-80px)] text-white relative font-sans overflow-x-hidden">
      {/* Background Glow Elements */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#8B5CF6]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-10 w-[350px] h-[350px] bg-[#EC4899]/5 blur-[110px] rounded-full pointer-events-none" />

      <main className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Transactions</h1>
          <p className="text-[#8F95A3] text-[15px] font-medium">View your complete cashout and earning history</p>
        </div>

        {/* --- TOP 4 STAT BLOCKS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="bg-[#111319] border border-white/5 rounded-[20px] p-6">
            <div className="w-11 h-11 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center mb-4 border border-[#8B5CF6]/20">
              <Wallet className="w-5 h-5 text-[#A78BFA]" />
            </div>
            <h3 className="text-[#8F95A3] font-bold text-xs uppercase tracking-wide mb-1.5">Available Balance</h3>
            <span className="text-2xl font-black text-emerald-400 block">{loading ? '...' : formatPrice(Number(totalEarning), currency)}</span>
            <p className="text-[#8F95A3] text-[11px] mt-1.5">Minimum withdrawal: {isCoin ? '5000 Coins' : '$5.00'}</p>
          </div>

          <div className="bg-[#111319] border border-white/5 rounded-[20px] p-6">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 border border-amber-500/20">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-[#8F95A3] font-bold text-xs uppercase tracking-wide mb-1.5">Pending Amount</h3>
            <span className="text-2xl font-black text-amber-400 block">{loading ? '...' : formatPrice(Number(pendingAmount), currency)}</span>
            <p className="text-[#8F95A3] text-[11px] mt-1.5">In process</p>
          </div>

          <div className="bg-[#111319] border border-white/5 rounded-[20px] p-6">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
              <CircleDollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-[#8F95A3] font-bold text-xs uppercase tracking-wide mb-1.5">Total Withdrawn</h3>
            <span className="text-2xl font-black text-white block">{withdrawalsLoading ? '...' : formatPrice(totalWithdrawnAmount, currency)}</span>
            <p className="text-[#8F95A3] text-[11px] mt-1.5">All time</p>
          </div>

          <div className="bg-[#111319] border border-white/5 rounded-[20px] p-6">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-[#8F95A3] font-bold text-xs uppercase tracking-wide mb-1.5">Total Withdrawals</h3>
            <span className="text-2xl font-black text-white block">{withdrawalsLoading ? '...' : totalWithdrawalsCount}</span>
            <p className="text-[#8F95A3] text-[11px] mt-1.5">All time</p>
          </div>
        </div>

        {/* --- TRANSACTIONS HISTORY LIST --- */}
        <AnimatePresence mode="wait">
          <motion.div key="history" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mb-10">
            {withdrawalsLoading ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 rounded-[18px] bg-[#111319] border border-white/5 animate-pulse" />)}
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="py-20 text-center bg-[#111319] border border-white/5 rounded-[20px]">
                <Clock className="w-12 h-12 text-[#8F95A3] mx-auto mb-4 opacity-50" />
                <h3 className="text-white font-bold text-lg mb-1">No transaction history found</h3>
                <p className="text-[#8F95A3] text-sm">Your cashout requests will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((w) => (
                  <div key={w._id || w.id} className="bg-[#111319] border border-white/5 rounded-[18px] p-4 sm:p-5 flex items-center gap-4 transition-colors hover:border-white/10">
                    <div className="shrink-0">{getMethodIcon(w.method)}</div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-white font-bold text-sm">{w.method ? w.method.toUpperCase() : 'Method Not Selected'}</h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(w.status)}`}>{w.status}</span>
                      </div>
                      <p className="text-[#8F95A3] text-xs mt-1 truncate">Txn #{w.transactionId} &middot; {w.transactionTime ? new Date(w.transactionTime).toLocaleString() : ''}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-lg font-black text-white">{formatPrice(Number(w.amount), currency)}</span>
                    </div>
                  </div>
                ))}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6 px-2">
                    <button 
                      onClick={() => fetchWithdrawals(currentPage - 1)} 
                      disabled={currentPage <= 1}
                      className="px-4 py-2.5 rounded-xl bg-[#15192C] hover:bg-[#1E233B] text-xs font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer border border-white/5 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <span className="text-xs text-[#8F95A3] font-medium bg-white/5 px-4 py-2 rounded-xl">Page {currentPage} of {totalPages}</span>
                    <button 
                      onClick={() => fetchWithdrawals(currentPage + 1)} 
                      disabled={currentPage >= totalPages}
                      className="px-4 py-2.5 rounded-xl bg-[#15192C] hover:bg-[#1E233B] text-xs font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer border border-white/5 transition-all"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </main>
    </div>
  );
}