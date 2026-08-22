'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, Clock, ShieldCheck, ChevronRight,
  CircleDollarSign, ChevronLeft, ArrowRightLeft, Loader2,
  Copy, Check, TrendingUp
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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch Wallet Data (For top 4 blocks)
  const fetchWalletStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

      const resView = await fetch('https://api.binnycash.com/api/user/balance/view', { method: 'GET', headers });
      const jsonView = await safeJsonParse(resView);

      if ((jsonView.code === 200 || jsonView.type === 'success') && jsonView.data) {
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

      // 🔥 FIX: API now nests the array as data.data, with pagination inside data too 🔥
      if (json.code === 200 || json.type === 'success') {
        const payload = json.data;
        const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
        setWithdrawals(list);
        setCurrentPage(payload?.currentPage || json.currentPage || 1);
        setTotalPages(payload?.totalPages || json.totalPages || 1);
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

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getStatusStyle = (status: string) => {
    switch ((status || '').toUpperCase()) {
      case 'PENDING': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'COMPLETED': case 'APPROVED': case 'SUCCESS': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'REJECTED': case 'FAILED': case 'DECLINED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'PROCESSING': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-white/5 text-white/60 border-white/10';
    }
  };

  const getStatusDot = (status: string) => {
    switch ((status || '').toUpperCase()) {
      case 'PENDING': return 'bg-amber-400';
      case 'COMPLETED': case 'APPROVED': case 'SUCCESS': return 'bg-emerald-400';
      case 'REJECTED': case 'FAILED': case 'DECLINED': return 'bg-rose-400';
      case 'PROCESSING': return 'bg-blue-400';
      default: return 'bg-white/40';
    }
  };

  // Calculations for blocks
  const totalWithdrawnAmount = withdrawals.reduce((sum, w) => {
    const s = String(w.status || '').toUpperCase();
    return (s === 'COMPLETED' || s === 'APPROVED' || s === 'SUCCESS') ? sum + Number(w.withdrawAmount || w.amount || 0) : sum;
  }, 0);
  const totalWithdrawalsCount = withdrawals.length;

  const statCards = [
    {
      key: 'available',
      icon: Wallet,
      label: 'Available Balance',
      value: loading ? null : formatPrice(Number(totalEarning), currency),
      valueClass: 'text-emerald-400',
      hint: `Minimum withdrawal: ${isCoin ? '5000 Coins' : '$5.00'}`,
      iconBg: 'bg-[#8B5CF6]/10 border-[#8B5CF6]/20',
      iconColor: 'text-[#A78BFA]',
      glow: 'group-hover:shadow-[0_0_0_1px_rgba(139,92,246,0.3),0_16px_40px_-12px_rgba(139,92,246,0.35)]',
    },
    {
      key: 'pending',
      icon: Clock,
      label: 'Pending Amount',
      value: loading ? null : formatPrice(Number(pendingAmount), currency),
      valueClass: 'text-amber-400',
      hint: 'In process',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      iconColor: 'text-amber-400',
      glow: 'group-hover:shadow-[0_0_0_1px_rgba(245,158,11,0.3),0_16px_40px_-12px_rgba(245,158,11,0.35)]',
    },
    {
      key: 'withdrawn',
      icon: CircleDollarSign,
      label: 'Total Withdrawn',
      value: withdrawalsLoading ? null : formatPrice(totalWithdrawnAmount, currency),
      valueClass: 'text-white',
      hint: 'All time',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      iconColor: 'text-emerald-400',
      glow: 'group-hover:shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_16px_40px_-12px_rgba(16,185,129,0.35)]',
    },
    {
      key: 'count',
      icon: ShieldCheck,
      label: 'Total Withdrawals',
      value: withdrawalsLoading ? null : String(totalWithdrawalsCount),
      valueClass: 'text-white',
      hint: 'All time',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      iconColor: 'text-blue-400',
      glow: 'group-hover:shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_16px_40px_-12px_rgba(59,130,246,0.35)]',
    },
  ];

  return (
    <div className="flex flex-col bg-[#0B0D19] min-h-[calc(100vh-80px)] text-white relative font-sans overflow-x-hidden">
      {/* Background Glow Elements */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#8B5CF6]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-10 w-[350px] h-[350px] bg-[#EC4899]/5 blur-[110px] rounded-full pointer-events-none" />
      <div className="fixed top-1/3 right-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <main className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex items-end justify-between gap-4 flex-wrap"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-bold text-[#A78BFA] uppercase tracking-wider mb-3">
              <TrendingUp className="w-3 h-3" /> Wallet
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Transactions</h1>
            <p className="text-[#8F95A3] text-[15px] font-medium">View your complete cashout and earning history</p>
          </div>
        </motion.div>

        {/* --- TOP 4 STAT BLOCKS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {statCards.map((card, i) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={`group bg-[#111319] border border-white/5 rounded-[20px] p-6 shadow-sm transition-shadow duration-300 ${card.glow}`}
            >
              <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center mb-4 border`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <h3 className="text-[#8F95A3] font-bold text-xs uppercase tracking-wide mb-1.5">{card.label}</h3>
              {card.value === null ? (
                <div className="h-8 w-24 rounded-md bg-white/5 animate-pulse" />
              ) : (
                <span className={`text-2xl font-black block ${card.valueClass}`}>{card.value}</span>
              )}
              <p className="text-[#8F95A3] text-[11px] mt-1.5">{card.hint}</p>
            </motion.div>
          ))}
        </div>

        {/* --- TRANSACTIONS HISTORY --- */}
        <AnimatePresence mode="wait">
          <motion.div key="history" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mb-10">

            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-base font-bold text-white">Withdrawal History</h2>
              {!withdrawalsLoading && withdrawals.length > 0 && (
                <span className="text-[11px] text-[#8F95A3] font-medium">{withdrawals.length} record{withdrawals.length !== 1 ? 's' : ''} on this page</span>
              )}
            </div>

            <div className="bg-[#111319] border border-white/5 rounded-[20px] overflow-hidden shadow-sm">

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-white/5 text-[#8F95A3] text-[11px] font-bold uppercase tracking-wider bg-[#15171E]">
                      <th className="py-4 px-6">Date & Time</th>
                      <th className="py-4 px-6">Transaction ID</th>
                      <th className="py-4 px-6 text-right">Deduction Fees</th>
                      <th className="py-4 px-6 text-right">Withdraw Amount</th>
                      <th className="py-4 px-6 text-center">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5 text-sm">
                    {withdrawalsLoading ? (
                      Array.from({ length: 5 }).map((_, idx) => (
                        <tr key={idx}>
                          {Array.from({ length: 5 }).map((__, c) => (
                            <td key={c} className="py-4 px-6">
                              <div className="h-4 w-full max-w-[120px] rounded bg-white/5 animate-pulse mx-auto" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : withdrawals.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-4">
                            <ArrowRightLeft className="w-7 h-7 text-[#8F95A3] opacity-50" />
                          </div>
                          <h3 className="text-white font-bold text-base mb-1">No transaction history found</h3>
                          <p className="text-[#8F95A3] text-xs">Your cashout requests will appear here.</p>
                        </td>
                      </tr>
                    ) : (
                      withdrawals.map((w, idx) => {
                        const txId = w.transactionId || 'N/A';
                        return (
                          <tr key={txId !== 'N/A' ? txId : idx} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 px-6 text-xs text-gray-400">
                              {w.date ? new Date(w.date).toLocaleString() : 'N/A'}
                            </td>
                            <td className="py-4 px-6">
                              <button
                                onClick={() => handleCopy(txId)}
                                className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-300 hover:text-white transition-colors group/copy"
                                title="Copy transaction ID"
                              >
                                #{txId}
                                {copiedId === txId ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3 opacity-0 group-hover/copy:opacity-60 transition-opacity" />
                                )}
                              </button>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className="text-xs font-medium text-rose-400 bg-rose-400/10 px-2 py-1 rounded">
                                - {formatPrice(Number(w.deductionFees || 0), currency)}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className="text-sm font-black text-[#00E57A]">
                                {formatPrice(Number(w.withdrawAmount || w.amount || 0), currency)}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(w.status)}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(w.status)}`} />
                                {w.status || 'UNKNOWN'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-white/5">
                {withdrawalsLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="p-4 space-y-3">
                      <div className="h-3 w-1/2 rounded bg-white/5 animate-pulse" />
                      <div className="h-5 w-1/3 rounded bg-white/5 animate-pulse" />
                    </div>
                  ))
                ) : withdrawals.length === 0 ? (
                  <div className="py-16 text-center px-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-4">
                      <ArrowRightLeft className="w-6 h-6 text-[#8F95A3] opacity-50" />
                    </div>
                    <h3 className="text-white font-bold text-sm mb-1">No transaction history found</h3>
                    <p className="text-[#8F95A3] text-xs">Your cashout requests will appear here.</p>
                  </div>
                ) : (
                  withdrawals.map((w, idx) => {
                    const txId = w.transactionId || 'N/A';
                    return (
                      <div key={txId !== 'N/A' ? txId : idx} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <button
                            onClick={() => handleCopy(txId)}
                            className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-300"
                          >
                            #{txId}
                            {copiedId === txId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-50" />}
                          </button>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(w.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(w.status)}`} />
                            {w.status || 'UNKNOWN'}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mb-3">
                          {w.date ? new Date(w.date).toLocaleString() : 'N/A'}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-rose-400 bg-rose-400/10 px-2 py-1 rounded">
                            - {formatPrice(Number(w.deductionFees || 0), currency)}
                          </span>
                          <span className="text-base font-black text-[#00E57A]">
                            {formatPrice(Number(w.withdrawAmount || w.amount || 0), currency)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination Controls */}
              {!withdrawalsLoading && totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-white/5 bg-[#15171E]">
                  <button
                    onClick={() => fetchWithdrawals(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <span className="text-xs text-[#8F95A3] font-medium">Page {currentPage} of {totalPages}</span>
                  <button
                    onClick={() => fetchWithdrawals(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

          </motion.div>
        </AnimatePresence>

      </main>
    </div>
  );
}