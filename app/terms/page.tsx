'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, FileText } from 'lucide-react';

export default function TermsPage() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "These Terms constitute a legally binding agreement between you and AdoMobi Technology Pvt. Ltd. (BinnyCash). By using our services, you agree to these Terms and our Privacy Policy."
    },
    {
      title: "2. Eligibility",
      list: [
        "Minimum age: 16 years",
        "One account per person",
        "Provide accurate information",
        "We may request identity verification"
      ]
    },
    {
      title: "3. Account Registration",
      list: [
        "Maintain login confidentiality",
        "Responsible for all activity",
        "Provide truthful data"
      ]
    },
    {
      title: "4. Rewards Program",
      content: "Rewards are promotional, subject to validation, and may be reversed if fraud is detected."
    },
    {
      title: "5. Offer Validation",
      content: "BinnyCash does not control third-party offer approvals."
    },
    {
      title: "6. Redemption & Payout",
      content: "Payouts are subject to minimum withdrawal thresholds and internal security checks before processing."
    },
    {
      title: "7. Prohibited Activities",
      list: [
        "No VPN or proxy",
        "No multiple accounts",
        "No fake info",
        "No system abuse",
        "No chargebacks"
      ]
    },
    {
      title: "8. Account Suspension",
      content: "Accounts may be suspended for violations or fraud."
    },
    {
      title: "9. Taxes",
      content: "Users are responsible for their taxes."
    },
    {
      title: "10. Intellectual Property",
      content: "All content belongs to BinnyCash and AdoMobi Technology Pvt. Ltd."
    },
    {
      title: "11. Disclaimer",
      content: "Service provided as-is without guarantees."
    },
    {
      title: "12. Limitation of Liability",
      content: "We are not liable for indirect damages."
    },
    {
      title: "13. Indemnification",
      content: "You agree to indemnify BinnyCash from misuse."
    },
    {
      title: "14. Force Majeure",
      content: "We are not liable for events beyond control."
    },
    {
      title: "15. Changes to Terms",
      content: "We may update Terms anytime."
    },
    {
      title: "16. Contact",
      content: "support@binnycash.com - AdoMobi Technology Pvt. Ltd., New Delhi, India"
    }
  ];

  return (
    <div className="min-h-screen bg-[#08070D] text-[#F5F3FF] relative overflow-x-hidden py-12 font-sans">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#3B82F6]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#A66CFF]/[0.05] blur-[120px] rounded-full" />
      </div>

      <main className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[#8D89A8] hover:text-white transition-colors mb-6 font-medium text-sm">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-[#3B82F6]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Terms & Conditions</h1>
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
              <div key={idx} className="flex flex-col gap-2.5">
                <h2 className="text-lg font-bold text-white tracking-wide">{section.title}</h2>
                {section.content && <p className="text-[#8F95A3] text-sm leading-relaxed bg-[#1A1725] p-4 rounded-xl border border-white/5">{section.content}</p>}
                
                {section.list && (
                  <div className="bg-[#1A1725] p-5 rounded-xl border border-white/5">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {section.list.map((item, i) => (
                        <li key={i} className="text-[#8F95A3] text-sm flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] shrink-0 mt-1.5"></div> {item}
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
