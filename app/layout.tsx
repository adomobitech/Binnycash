import type { Metadata, Viewport } from 'next';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/components/AuthContext'; // ✨ Context provider
import './globals.css';

// 👇 YEH NAYA CODE ADD KIYA HAI MOBILE FIX KE LIYE 👇
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Isse input click karne par zoom nahi hoga
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
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}