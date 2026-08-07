'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "1. Introduction",
      content: "Welcome to BinnyCash, operated by AdoMobi Technology Pvt. Ltd., India. We are committed to protecting your personal data and respecting your privacy.\n\nWe do not knowingly collect personal data from individuals under 16 years of age. If you believe a minor has provided us data, contact us at: support@binnycash.com"
    },
    {
      title: "2. Company Information",
      content: "Company Name: AdoMobi Technology Pvt. Ltd.\nRegistered Address: 5th Floor, DLF Two Horizon Centre, DLF Phase 5, Gurugram, 122002, India\nEmail: support@binnycash.com\nPrivacy Contact: privacy@binnycash.com"
    },
    {
      title: "3. Data We Collect",
      list: [
        "Identity Data: name, username, profile photo, gender, government ID.",
        "Contact Data: email, phone number, address.",
        "Transaction Data: rewards and withdrawals.",
        "Payment Data: UPI, PayPal, bank details.",
        "Technical Data: IP, browser, device info.",
        "Usage Data: activity logs and offers.",
        "Marketing Data: preferences and campaigns.",
        "Special category data with consent."
      ]
    },
    {
      title: "4. How We Collect Data",
      list: [
        "Directly from you",
        "Automated tracking technologies",
        "From third-party partners"
      ]
    },
    {
      title: "5. How We Use Your Data",
      list: [
        "Create and manage account",
        "Track rewards",
        "Verify withdrawals",
        "Customer support",
        "Improve platform",
        "Prevent fraud",
        "Legal compliance",
        "Marketing with consent"
      ]
    },
    {
      title: "6. Legal Basis",
      content: "Processing is done under GDPR where applicable and India's DPDP Act 2023."
    },
    {
      title: "7. Data Sharing",
      content: "We may share data with hosting providers, payment processors, offer partners, analytics providers, and legal authorities. We do not sell data."
    },
    {
      title: "8. International Transfers",
      content: "Data may be transferred outside India/EEA with safeguards."
    },
    {
      title: "9. Data Security",
      list: [
        "SSL encryption",
        "Secure servers",
        "Access restrictions",
        "Fraud detection systems"
      ]
    },
    {
      title: "10. Your Rights",
      content: "You may request access, correction, deletion, or portability of your data by contacting privacy@binnycash.com"
    },
    {
      title: "11. Cookies",
      content: "We use cookies to improve experience and prevent fraud."
    },
    {
      title: "12. Children's Privacy",
      content: "Not intended for users under 16."
    },
    {
      title: "13. Changes",
      content: "We may update this policy periodically."
    }
  ];

  return (
    <div className="min-h-screen bg-[#08070D] text-[#F5F3FF] relative overflow-x-hidden py-12 font-sans">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-[#3DE8A0]/10 blur-[150px] rounded-full" />
      </div>

      <main className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[#8D89A8] hover:text-white transition-colors mb-6 font-medium text-sm">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-[#3DE8A0]/10 border border-[#3DE8A0]/20 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-6 h-6 text-[#3DE8A0]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Privacy Policy</h1>
          </div>
          <p className="text-sm text-[#8D89A8] font-medium ml-1">Last Updated: 11 February 2026</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#120F1A] border border-white/[0.06] rounded-3xl p-6 sm:p-10 shadow-2xl"
        >
          <div className="space-y-8">
            {sections.map((section, idx) => (
              <div key={idx} className="flex flex-col gap-3">
                <h2 className="text-xl font-bold text-white tracking-wide">{section.title}</h2>
                
                {section.content && (
                  <div className="text-[#8F95A3] text-sm leading-relaxed whitespace-pre-wrap bg-[#1A1725] p-5 rounded-xl border border-white/5">
                    {section.content}
                  </div>
                )}
                
                {section.list && (
                  <div className="bg-[#1A1725] p-5 rounded-xl border border-white/5">
                    <ul className="space-y-3">
                      {section.list.map((item, i) => (
                        <li key={i} className="text-[#8F95A3] text-sm flex items-start gap-3">
                          <ShieldCheck className="w-4 h-4 text-[#3DE8A0] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}