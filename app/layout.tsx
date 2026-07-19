import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "BinnyCash - Earn Real Money",
  description: "Global earning platform for gamers and hustlers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#05050A] text-white font-sans overflow-x-hidden selection:bg-purple-500/30">
        <Navbar />
        {children}
      </body>
    </html>
  );
}