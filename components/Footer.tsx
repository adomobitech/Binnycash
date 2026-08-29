'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { useTranslation } from './LanguageContext';

// --- GOOGLE PLAY STORE SVG ICON ---
const GooglePlayIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M49.49 48.71C48.51 51.52 48 55.45 48 60.19V451.81C48 456.55 48.51 460.48 49.49 463.29L262.15 256.02L49.49 48.71Z" fill="#00E676"/>
    <path d="M331.42 323.51L262.15 256.02L49.49 463.29C54.49 468.15 62.46 469.75 72.33 464.08L331.42 323.51Z" fill="#FF3D00"/>
    <path d="M331.42 188.49L72.33 47.92C62.46 42.25 54.49 43.85 49.49 48.71L262.15 256.02L331.42 188.49Z" fill="#00B0FF"/>
    <path d="M451.15 253.25L331.42 188.49L262.15 256.02L331.42 323.51L451.15 258.79C465.64 250.94 465.64 261.1 451.15 253.25Z" fill="#FFC400"/>
  </svg>
);

export default function Footer() {
  const { openRegister } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const handleAuthNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string, targetId?: string) => {
    e.preventDefault();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      openRegister();
    } else {
      if (targetId) {
        router.push(path);
        setTimeout(() => {
          const section = document.getElementById(targetId);
          if (section) {
            const yOffset = -100;
            const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 500);
      } else {
        router.push(path);
      }
    }
  };

  const socialLinks = [
    {
      name: 'Discord',
      url: 'https://discord.gg/binnycash',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      )
    },
    {
      name: 'Telegram',
      url: 'https://t.me/binnycash',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      )
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/binnycash',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/binnycash',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    }
  ];

  return (
    <footer className="w-full bg-[#050208] pt-16 pb-12 px-6 relative overflow-hidden font-sans border-t border-white/[0.04]">
      <div className="max-w-[1250px] mx-auto relative z-10">
        
        <div className="w-full bg-[#080512] border border-[#2e1065] rounded-3xl p-8 md:p-10 flex flex-col lg:flex-row items-center justify-between mb-16 shadow-[0_0_50px_rgba(126,34,206,0.15)] relative overflow-hidden">
          
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left mb-6 lg:mb-0 z-10">
            <h3 className="text-white font-black text-2xl md:text-3xl tracking-tight mb-2">
              {t.Footer?.title1 || 'Ready to start'} <span className="text-[#a855f7]">{t.Footer?.title2 || 'grinding?'}</span>
            </h3>
            <p className="text-[#8F95A3] text-xs md:text-sm font-medium mb-6">
              {t.Footer?.subtitle || 'Join BinnyCash today and get your first payout in minutes.'}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-bold text-[#8F95A3]">
              <div className="flex items-center gap-2"><span className="text-[#a855f7]">👤</span> {t.Footer?.p1 || 'Quick Signup'}</div>
              <div className="flex items-center gap-2"><span className="text-[#00E57A]">📋</span> {t.Footer?.p2 || 'Complete Tasks'}</div>
              <div className="flex items-center gap-2"><span className="text-yellow-400">💳</span> {t.Footer?.p3 || 'Get Paid'}</div>
            </div>
          </div>

          <div className="flex flex-col items-center lg:items-end z-10">
            <button 
              onClick={openRegister}
              className="bg-gradient-to-r from-[#7e22ce] to-[#9333ea] hover:from-[#6d28d9] hover:to-[#7e22ce] text-white font-black text-xs uppercase tracking-widest px-8 py-4 rounded-xl transition-all shadow-[0_0_25px_rgba(168,85,247,0.4)] cursor-pointer flex items-center gap-2"
            >
              <span>👤+</span> {t.Footer?.btnCreate || 'CREATE FREE ACCOUNT'}
            </button>
            <span className="text-[11px] text-[#8F95A3] mt-2 font-medium">{t.Footer?.freeNote || "It's free & only takes a minute!"}</span>
          </div>
        </div>

        <div className="bg-[#070310] border border-[#1a102f] rounded-3xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-12 gap-10 mb-12 shadow-inner">
          <div className="col-span-1 md:col-span-5 flex flex-col items-start">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <img src="/logo.png" alt="BinnyCash Logo" className="h-9 w-auto object-contain group-hover:scale-105 transition-transform" />
              <span className="text-white font-black text-xl tracking-wider">BINNYCASH</span>
            </Link>

            <p className="text-[#8F95A3] text-xs md:text-sm leading-relaxed mb-6 max-w-sm">
              {t.Footer?.desc || 'The premier platform for gamers and hustlers to earn real cash by completing offers, premium surveys, and leveling the leaderboard.'}
            </p>

            {/* 🔥 GOOGLE PLAY BUTTON (FOOTER) 🔥 */}
            <a 
              href="https://play.google.com/store/apps/details?id=com.binnycash"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 bg-[#0F0D14] hover:bg-[#15121c] border border-white/10 hover:border-[#a855f7]/50 px-4 py-2.5 rounded-2xl transition-all shadow-md group cursor-pointer w-fit mb-6"
            >
              <GooglePlayIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col items-start justify-center">
                <span className="text-[9px] text-gray-400 uppercase tracking-wider leading-none mb-0.5">Get it on</span>
                <span className="text-white font-bold text-[15px] leading-none tracking-tight">Google Play</span>
              </div>
            </a>

            <div className="flex items-center gap-3">
              {socialLinks.map((social, i) => (
                <a key={i} href={social.url} target="_blank" rel="noreferrer" title={social.name} className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-[#8F95A3] hover:text-white hover:border-[#a855f7] hover:bg-[#a855f7]/20 transition-all duration-300">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="col-span-1 md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-white font-bold text-xs tracking-[0.2em] uppercase mb-5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]"></span> {t.Footer?.platform || 'Platform'}
              </h4>
              <ul className="space-y-3 text-[#8F95A3] text-xs font-medium">
                <li><a href="/dashboard" onClick={(e) => handleAuthNavigation(e, '/dashboard', 'offerwalls')} className="hover:text-white transition-colors flex items-center gap-2 cursor-pointer"><span className="text-[#a855f7]">›</span> Offerwalls</a></li>
                <li><a href="/dashboard" onClick={(e) => handleAuthNavigation(e, '/dashboard', 'surveys')} className="hover:text-white transition-colors flex items-center gap-2 cursor-pointer"><span className="text-[#a855f7]">›</span> Premium Surveys</a></li>
                <li><a href="/leaderboard" onClick={(e) => handleAuthNavigation(e, '/leaderboard')} className="hover:text-white transition-colors flex items-center gap-2 cursor-pointer"><span className="text-[#a855f7]">›</span> Live Leaderboard</a></li>
                <li><a href="/cashout" onClick={(e) => handleAuthNavigation(e, '/cashout')} className="hover:text-white transition-colors flex items-center gap-2 cursor-pointer"><span className="text-[#a855f7]">›</span> Cashout Options</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs tracking-[0.2em] uppercase mb-5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E57A]"></span> {t.Footer?.support || 'Support'}
              </h4>
              <ul className="space-y-3 text-[#8F95A3] text-xs font-medium">
                <li><a href="/support" onClick={(e) => handleAuthNavigation(e, '/support')} className="hover:text-white transition-colors flex items-center gap-2 cursor-pointer"><span className="text-[#00E57A]">›</span> Help Center / FAQ</a></li>
                <li><a href="https://discord.gg/binnycash" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-[#00E57A]">›</span> Community Discord</a></li>
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h4 className="text-white font-bold text-xs tracking-[0.2em] uppercase mb-5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span> {t.Footer?.legal || 'Legal'}
              </h4>
              <ul className="space-y-3 text-[#8F95A3] text-xs font-medium">
                <li><Link href="/terms" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">›</span> Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">›</span> Privacy Policy</Link></li>
                <li><Link href="/cookie-policy" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">›</span> Cookie Policy</Link></li>
                 <li><Link href="/affiliate-policy" className="hover:text-white transition-colors flex items-center gap-2"><span className="text-sky-400">›</span> Affiliate & Offer Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.04] pt-8 flex flex-col md:flex-row items-center justify-between text-[#8F95A3] text-xs font-medium gap-4">
          <p>© {new Date().getFullYear()} BinnyCash. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-xs">
            <span>{t.Footer?.copyright || 'Built for hustlers. Backed by you.'}</span>
          </div>
         </div>
      </div>
    </footer>
  );
}