'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from './LanguageContext';

interface PayoutData {
  _id?: string;
  userId?: number;
  userName?: string;
  image?: string;
  rewardValue?: string;
  totalUsdValue?: number;
  totalCoinsValue?: number;
  status?: string;
  method?: string;
  createdAt?: string;
  [key: string]: any;
}

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

export default function CashoutSection() {
  const { t } = useTranslation();
  const [payouts, setPayouts] = useState<PayoutData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const res = await fetch('https://apitest.binnycash.com/api/latestWithdraw');
        const resData = await safeJsonParse(res);
        const list = resData?.data?.list || resData?.data || [];
        setPayouts(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Error fetching latest withdrawals:", err);
        setPayouts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayouts();
  }, []);

  const getPaymentBadge = (method?: string) => {
    const m = (method || '').toLowerCase();
    if (m.includes('paytm')) {
      return { name: 'Paytm', bg: 'bg-[#002e6e]/20', text: 'text-[#38bdf8]', icon: '₹' };
    }
    if (m.includes('phone') || m.includes('upi')) {
      return { name: 'PhonePe/UPI', bg: 'bg-[#5f259f]/20', text: 'text-[#d8b4fe]', icon: 'पे' };
    }
    if (m.includes('bank')) {
      return { name: 'Bank', bg: 'bg-gray-800/50', text: 'text-gray-300', icon: '🏦' };
    }
    return { name: 'G Pay', bg: 'bg-[#18181b]', text: 'text-gray-100', icon: <span className="text-blue-500 font-bold">G</span> };
  };

  return (
    <div className="w-full bg-[#050208] py-16 font-sans flex justify-center relative overflow-hidden">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(126,34,206,0.3); border-radius: 10px; }
      `}</style>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2e1065]/10 via-[#050208]/80 to-[#050208] z-0 pointer-events-none"></div>

      <div className="max-w-[1250px] w-full px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-5 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#7e22ce] to-[#3b0764] rounded-[32px] blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
          
          <div className="bg-[#0b0615]/90 backdrop-blur-2xl border border-[#3b0764] rounded-[30px] p-6 lg:p-8 h-full flex flex-col justify-between relative shadow-[inset_0_0_40px_rgba(88,28,135,0.15)]">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4c1d95] to-[#1e1b4b] border border-[#7e22ce]/50 flex items-center justify-center text-[#d8b4fe] mb-3 text-xl shadow-[0_0_20px_rgba(126,34,206,0.4)]">
                ⚡
              </div>
              <h3 className="text-[#8F95A3] font-bold text-[10px] tracking-[0.25em] uppercase mb-2">{t.Cashout?.supported || 'Supported Payouts'}</h3>
              <h2 className="text-white font-black text-3xl tracking-tight mb-3 drop-shadow-md">{t.Cashout?.title || 'Instant Withdrawals'}</h2>
              
              <div className="bg-[#00E57A]/10 border border-[#00E57A]/30 text-[#00E57A] text-xs font-black px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(0,229,122,0.15)]">
                {t.Cashout?.avgTime || 'Avg. Time < 60 Seconds'}
              </div>
            </div>

            <div className="flex justify-center gap-4 my-6 z-10">
              {['GPay', 'PhonePe', 'Bank', 'Crypto'].map((method, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 cursor-default hover:-translate-y-1 transition-transform">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#a855f7]/50 hover:bg-[#2e1065]/40 flex items-center justify-center text-white transition-all shadow-lg backdrop-blur-md text-sm">
                    {i === 0 ? 'G' : i === 1 ? 'पे' : i === 2 ? '🏦' : '₿'}
                  </div>
                  <span className="text-[#8F95A3] text-[9px] uppercase font-bold tracking-widest">{method}</span>
                </div>
              ))}
            </div>

            <div className="relative w-full h-40 flex items-center justify-center my-2">
              <div className="absolute bottom-2 w-56 h-12 bg-[#7e22ce]/20 rounded-[50%] blur-xl pointer-events-none"></div>
              <div className="absolute bottom-6 w-48 h-10 bg-gradient-to-r from-[#9333ea] via-[#c084fc] to-[#9333ea] rounded-[50%] border-t-2 border-white/40 shadow-[0_0_30px_#9333ea] pointer-events-none"></div>
              <div className="absolute bottom-8 w-36 h-6 bg-[#2e1065] rounded-[50%] pointer-events-none shadow-inner"></div>
              
              <div className="text-6xl z-10 drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)] animate-[bounce_5s_infinite]">💰</div>
              <div className="absolute left-[15%] top-[30%] text-2xl drop-shadow-[0_0_15px_rgba(234,179,8,0.6)] animate-[bounce_3s_infinite]">🪙</div>
              <div className="absolute right-[15%] bottom-[20%] text-3xl drop-shadow-[0_0_15px_rgba(234,179,8,0.6)] animate-[bounce_4s_infinite]">🪙</div>
            </div>

            <div className="mt-4 bg-[#180a2b] border border-[#3b0764] rounded-2xl p-3.5 flex items-center gap-3 relative overflow-hidden">
              <div className="absolute left-0 top-0 w-1 h-full bg-[#00E57A]"></div>
              <div className="w-9 h-9 rounded-xl bg-[#00E57A]/10 flex items-center justify-center text-[#00E57A] text-sm">🛡️</div>
              <div className="flex flex-col">
                <span className="text-white font-black text-xs tracking-wide">{t.Cashout?.trusted || 'Verified & Trusted'}</span>
                <span className="text-[#8F95A3] text-[10px] font-medium">{t.Cashout?.trustedDesc || '100% secure platform algorithms'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (LATEST WITHDRAWALS - SCROLLABLE) */}
        <div className="lg:col-span-7 bg-[#0b0615]/90 backdrop-blur-2xl border border-[#3b0764] rounded-[30px] p-6 lg:p-8 flex flex-col justify-between shadow-[inset_0_0_40px_rgba(88,28,135,0.1)]">
          
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <h3 className="text-white font-black text-base md:text-lg flex items-center gap-2.5 tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-[#00E57A] shadow-[0_0_10px_#00E57A]"></span> {t.Cashout?.latest || 'LATEST WITHDRAWALS'}
              </h3>
              <div className="flex items-center gap-2 bg-[#00E57A]/10 border border-[#00E57A]/30 px-3.5 py-1 rounded-full shadow-[0_0_15px_rgba(0,229,122,0.1)]">
                <span className="text-[#00E57A] text-[10px]">⚡</span>
                <span className="text-[10px] text-[#00E57A] font-black uppercase tracking-widest">{t.Cashout?.live || 'Live Network'}</span>
              </div>
            </div>

            {/* SCROLLABLE LIST CONTAINER */}
            <div className="flex flex-col gap-2.5 max-h-[340px] overflow-y-auto custom-scrollbar pr-1.5">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-[#130822] animate-pulse rounded-xl w-full border border-[#2e1065]"></div>
                ))
              ) : payouts.length > 0 ? (
                payouts.map((user, idx) => {
                  const name = user.userName || `User_${idx + 1}`;
                  const usdValue = user.totalUsdValue || 0;
                  const paymentBadge = getPaymentBadge(user.method);

                  return (
                    <div key={user._id || idx} className="bg-[#10071e] hover:bg-[#180a2b] border border-[#2e1065] hover:border-[#581c87] rounded-xl px-4 py-3.5 flex items-center justify-between transition-all duration-300 group">
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4c1d95] to-[#2e1065] flex items-center justify-center text-white font-black text-base uppercase overflow-hidden shadow-[inset_0_2px_8px_rgba(255,255,255,0.2)]">
                            {user.image ? (
                              <img src={user.image.startsWith('http') ? user.image : `https://apitest.binnycash.com${user.image}`} alt={name} className="w-full h-full object-cover" />
                            ) : (
                              name.charAt(0)
                            )}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#00E57A] border-[2px] border-[#10071e] rounded-full group-hover:border-[#180a2b] transition-colors"></div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-bold text-sm tracking-wide">{name}</span>
                          <span className="text-[#8F95A3] text-[11px] font-medium">{idx === 0 ? 'Just now' : `${(idx + 1) * 3} min ago`}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-[#00E57A] font-black text-base md:text-lg drop-shadow-[0_0_10px_rgba(0,229,122,0.3)]">
                          ${Number(usdValue).toFixed(2)}
                        </span>
                        
                        <div className={`hidden md:flex items-center gap-1.5 ${paymentBadge.bg} border border-[#3b0764] px-3 py-1.5 rounded-lg`}>
                          <span className="text-[11px]">{paymentBadge.icon}</span>
                          <span className={`${paymentBadge.text} font-bold text-[10px] tracking-widest`}>{paymentBadge.name}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-16 w-full">
                  <div className="relative flex items-center justify-center w-24 h-24 mb-4">
                    <div className="absolute w-full h-full border border-[#7e22ce]/30 rounded-full animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                    <div className="w-10 h-10 bg-[#6d28d9] rounded-full flex items-center justify-center shadow-[0_0_20px_#9333ea]">
                      <span className="text-white text-lg animate-pulse">📡</span>
                    </div>
                  </div>
                  
                  <h4 className="text-white font-black text-base uppercase tracking-widest mb-1">{t.Cashout?.scanning || 'Scanning Network'}</h4>
                  <p className="text-[#8F95A3] text-xs font-medium tracking-wide text-center max-w-xs">
                    {t.Cashout?.scanDesc || 'No recent withdrawals detected in the live pool. Awaiting next cashout...'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-[#00E57A]/10 flex items-center justify-center text-[#00E57A] text-xs">🔒</div>
              <div className="flex flex-col">
                <span className="text-white font-black text-[11px] uppercase tracking-wide">{t.Cashout?.encrypted || 'Encrypted Payouts'}</span>
                <span className="text-[#8F95A3] text-[9px]">{t.Cashout?.encryptedDesc || 'Bank-grade API security'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/10 flex items-center justify-center text-[#38bdf8] text-xs">🚀</div>
              <div className="flex flex-col">
                <span className="text-white font-black text-[11px] uppercase tracking-wide">{t.Cashout?.automated || 'Automated System'}</span>
                <span className="text-[#8F95A3] text-[9px]">{t.Cashout?.automatedDesc || 'No manual processing holds'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}