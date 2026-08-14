import type { Metadata, Viewport } from 'next';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/components/AuthContext';
import { LanguageProvider } from '@/components/LanguageContext'; // 🔥 Naya LanguageProvider import kiya
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
          {/* 🔥 Yahan LanguageProvider se wrap kar diya, purana Auth aur Navbar bilkul safe hain */}
          <LanguageProvider>
            <Navbar />
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}