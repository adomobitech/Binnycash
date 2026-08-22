import type { Metadata, Viewport } from 'next';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/components/AuthContext';
import { LanguageProvider } from '@/components/LanguageContext'; 
import ConditionalTicker from '@/components/ConditionalTicker'; // 🔥 IMPORT YAHAN KARNA HAI
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'BinnyCash',
  description: 'Play. Earn. Dominate.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#08080C] text-white font-sans">
        <AuthProvider>
          <LanguageProvider>
            
            {/* 🔥 NAVBAR KO WRAPPER MEIN DAAL DIYA 🔥 */}
            <div id="main-navbar-wrapper">
              <Navbar />
            </div>
            
            {/* 🔥 YE LAG GAYA GLOBAL TICKER. AB YE HAR PAGE PAR AAYEGA */}
            <ConditionalTicker />
            
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}