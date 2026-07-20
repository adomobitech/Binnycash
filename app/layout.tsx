import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/components/AuthContext'; // ✨ Context provider
import './globals.css';

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