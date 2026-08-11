'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Wifi,
  RotateCcw,
  Target,
  Cpu,
  MonitorSmartphone,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { motion } from 'framer-motion';


type Tone = 'clear' | 'caution' | 'risk';

const TONE = {
  clear: { text: 'text-[#3FCB98]', dot: 'bg-[#3FCB98]', fill: '#3FCB98', bg: 'bg-[#3FCB98]/10', border: 'border-[#3FCB98]/25' },
  caution: { text: 'text-[#E7AE4E]', dot: 'bg-[#E7AE4E]', fill: '#E7AE4E', bg: 'bg-[#E7AE4E]/10', border: 'border-[#E7AE4E]/25' },
  risk: { text: 'text-[#EB5B62]', dot: 'bg-[#EB5B62]', fill: '#EB5B62', bg: 'bg-[#EB5B62]/10', border: 'border-[#EB5B62]/25' },
} as const;

const GOLD = '#CBA968';

export default function AccountStatusPage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('https://apitest.binnycash.com/api/user/viewData', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();

        if (json.code === 200 && json.data?.user) {
          setUserData(json.data.user);
        } else {
          setErr(true);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setErr(true);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080D] flex flex-col items-center justify-center gap-5">
        <GlobalStyle />
        <div className="relative w-40 h-24 rounded-2xl border border-white/10 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 w-1/3"
            style={{ background: `linear-gradient(90deg, transparent, ${GOLD}30, transparent)` }}
            animate={{ x: ['-120%', '220%'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <p className="text-[#7B7F8C] text-[11px] font-tel tracking-[0.25em] uppercase">
          Verifying account…
        </p>
      </div>
    );
  }

  if (!userData || err) {
    return (
      <div className="min-h-screen bg-[#07080D] flex items-center justify-center p-6">
        <GlobalStyle />
        <div className="max-w-sm w-full bg-[#12141C] border border-[#EB5B62]/20 rounded-2xl p-6 text-center">
          <ShieldAlert className="w-7 h-7 text-[#EB5B62] mx-auto mb-3" />
          <p className="text-[#F4F2EC] font-bold mb-1 font-display text-lg">Session expired</p>
          <p className="text-[#8A8D99] text-sm">
            We couldn't verify your account. Sign in again to reload your trust status.
          </p>
        </div>
      </div>
    );
  }

  const health = userData.account_health || {};
  const riskScore: number = userData.risk_score ?? 0;
  const riskLevel: string = (userData.risk_level || 'UNKNOWN').toUpperCase();
  const isHealthy = riskLevel === 'LOW' && userData.status === 'ACTIVE';
  const tone: Tone = riskLevel === 'LOW' ? 'clear' : riskLevel === 'MEDIUM' ? 'caution' : 'risk';
  const t = TONE[tone];

  return (
    <div className="min-h-screen bg-[#07080D] text-[#F4F2EC] p-4 sm:p-8 lg:p-12">
      <GlobalStyle />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* ── HEADER ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} />
            <p className="font-tel text-[10px] tracking-[0.3em] uppercase text-[#7B7F8C]">
              Trust Index
            </p>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${t.bg} ${t.border} border`}>
            <span className={`w-1.5 h-1.5 rounded-full ${t.dot} animate-pulse`} />
            <span className={`font-tel text-[10px] tracking-[0.15em] uppercase ${t.text}`}>
              {isHealthy ? 'In good standing' : 'Needs review'}
            </span>
          </div>
        </div>

        {/* ── SIGNATURE: TRUST CARD ─────────────────────────────── */}
        <TrustCard userData={userData} riskScore={riskScore} riskLevel={riskLevel} tone={tone} />

        {/* ── STATEMENT: SIGNAL BREAKDOWN ──────────────────────── */}
        <div className="bg-[#0E1017] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.07]">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4" style={{ color: GOLD }} />
              <h3 className="font-display text-[15px] font-semibold text-white tracking-tight">
                Signal Statement
              </h3>
            </div>
            <span className="font-tel text-[10px] tracking-[0.15em] uppercase text-[#5C6070]">
              5 checks
            </span>
          </div>

          <div className="space-y-5">
            <StatementRow icon={<Wifi className="w-3.5 h-3.5" />} label="VPN Score" score={health.vpn_score ?? 0} />
            <StatementRow icon={<RotateCcw className="w-3.5 h-3.5" />} label="Reverse Score" score={health.reverse_score ?? 0} />
            <StatementRow icon={<Target className="w-3.5 h-3.5" />} label="Offer Completion Score" score={health.offer_completion_score ?? 0} />
            <StatementRow icon={<Wand2 className="w-3.5 h-3.5" />} label="Emulator Score" score={health.emulator_score ?? 0} />
            <StatementRow icon={<MonitorSmartphone className="w-3.5 h-3.5" />} label="Device Score" score={health.device_score ?? 0} />
          </div>
        </div>

        {/* ── NOTICE PANELS ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <NoticePanel
            tone={isHealthy ? 'clear' : 'caution'}
            title={isHealthy ? 'No issues found' : 'Issues detected'}
            body={
              isHealthy
                ? 'Every check came back clean. Your account is performing well.'
                : 'Your risk level needs a look — review the signals above.'
            }
          />
          <NoticePanel
            tone="clear"
            icon={<ShieldCheck className="w-4 h-4" />}
            title="Improvement tips"
            body={
              isHealthy
                ? "Nothing to fix right now — keep doing what you're doing."
                : 'Avoid VPNs and complete more valid offers to raise your score.'
            }
            gold
          />
        </div>
      </motion.div>
    </div>
  );
}


function TrustCard({
  userData,
  riskScore,
  riskLevel,
  tone,
}: {
  userData: any;
  riskScore: number;
  riskLevel: string;
  tone: Tone;
}) {
  const t = TONE[tone];
  const pct = Math.max(0, Math.min(100, Math.round(riskScore)));
  const initials = (userData.userName || '?').slice(0, 2).toUpperCase();

  return (
    <div
      className="relative rounded-[28px] p-7 sm:p-9 overflow-hidden border border-white/[0.08]"
      style={{
        background: 'linear-gradient(155deg, #171B27 0%, #10121A 55%, #0B0C12 100%)',
      }}
    >
      {/* grain */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none mix-blend-overlay">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* sheen sweep */}
      <motion.div
        className="absolute inset-y-0 w-1/2 pointer-events-none"
        style={{ background: `linear-gradient(75deg, transparent, ${GOLD}14, ${GOLD}22, ${GOLD}14, transparent)` }}
        initial={{ x: '-140%' }}
        animate={{ x: '220%' }}
        transition={{ duration: 2.2, delay: 0.3, ease: 'easeInOut' }}
      />

      <div className="relative flex flex-col gap-9">
        {/* top row: chip + wordmark */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-7 rounded-md flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #8C7440)` }}
            >
              <div className="w-5 h-3.5 rounded-[3px] border border-black/25 grid grid-cols-3 gap-[1px] p-[1.5px]">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="bg-black/15 rounded-[1px]" />
                ))}
              </div>
            </div>
            <span className="font-display text-sm tracking-wide text-[#DCD6C6]">Binny Trust Card</span>
          </div>
          <Sparkles className="w-4 h-4" style={{ color: GOLD, opacity: 0.7 }} />
        </div>

        {/* score */}
        <div>
          <p className="font-tel text-[10px] tracking-[0.25em] uppercase text-[#6E7180] mb-2">
            Trust score
          </p>
          <div className="flex items-baseline gap-3">
            <span className="font-display italic text-6xl sm:text-7xl font-medium leading-none text-[#F7F4EC]">
              {pct}
            </span>
            <span className={`font-tel text-xs font-semibold tracking-wide uppercase ${t.text}`}>
              {riskLevel} risk
            </span>
          </div>
        </div>

        {/* bottom row: holder + status */}
        <div className="flex items-end justify-between flex-wrap gap-3 pt-4 border-t border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-tel text-[11px] font-bold text-[#0B0C12]"
              style={{ background: GOLD }}
            >
              {initials}
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-[#F4F2EC] leading-tight">
                {userData.userName}
              </p>
              <p className="font-tel text-[10px] text-[#6E7180] tracking-wide">{userData.email}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-tel text-[9px] tracking-[0.2em] uppercase text-[#6E7180] mb-0.5">
              Account state
            </p>
            <p className={`font-tel text-xs font-bold tracking-wide ${userData.status === 'ACTIVE' ? 'text-[#3FCB98]' : 'text-[#EB5B62]'}`}>
              {userData.status || 'UNKNOWN'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatementRow({ icon, label, score }: { icon: React.ReactNode; label: string; score: number }) {
  const tone: Tone = score >= 70 ? 'clear' : score >= 40 ? 'caution' : 'risk';
  const t = TONE[tone];
  const pct = Math.max(0, Math.min(100, score));

  return (
    <div className="flex items-center gap-4">
      <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${t.bg} ${t.text}`}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] font-medium text-[#DEDCD3] font-display">{label}</span>
          <span className="font-tel text-xs font-semibold text-[#DEDCD3] tabular-nums">
            {score.toString().padStart(3, '0')}
            <span className="text-[#5C6070]">/100</span>
          </span>
        </div>
        <div className="h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: t.fill }}
          />
        </div>
      </div>
    </div>
  );
}

function NoticePanel({
  tone,
  title,
  body,
  icon,
  gold,
}: {
  tone: Tone;
  title: string;
  body: string;
  icon?: React.ReactNode;
  gold?: boolean;
}) {
  const t = TONE[tone];
  return (
    <div
      className="bg-[#0E1017] border border-white/[0.06] rounded-2xl p-5 pl-6 relative"
      style={{ borderLeft: `2.5px solid ${gold ? GOLD : t.fill}` }}
    >
      <h4 className={`text-sm font-semibold flex items-center gap-2 mb-2 font-display ${gold ? 'text-[#E4CE96]' : t.text}`}>
        {icon ?? <ShieldAlert className="w-4 h-4" />}
        {title}
      </h4>
      <p className="text-[13px] font-normal text-[#8A8D99] leading-relaxed">{body}</p>
    </div>
  );
}

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
      .font-display { font-family: 'Fraunces', ui-serif, serif; }
      .font-tel { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
      body { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `}</style>
  );
}