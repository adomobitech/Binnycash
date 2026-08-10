'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "1. Introduction",
      content: "Welcome to BinnyCash, operated by Weeo Media LLC, located in the United States. We are committed to protecting your personal data and respecting your privacy to the highest standards.\n\nWe strictly protect your information and do not knowingly collect personal data from individuals under 16 years of age. If you believe a minor has provided us data, please contact us immediately at: support@binnycash.com."
    },
    {
      title: "2. Company Information",
      content: "Company Name: Weeo Media LLC\nHQ Address: 5900 Balcones Drive STE 100 Austin, TX 78731 USA\nEmail: support@binnycash.com\nPrivacy Contact: privacy@binnycash.com"
    },
    {
      title: "3. Commitment to Privacy & No Data Selling",
      content: "We take your privacy seriously. We absolutely DO NOT sell, rent, or trade your personal data to any third parties for their independent marketing or business purposes. Your data remains strictly confidential and is used solely to provide and improve the services on BinnyCash."
    },
    {
      title: "4. Data We Collect",
      list: [
        "Identity Data: name, username, profile photo, gender, and necessary identification documents.",
        "Contact Data: email, phone number, address.",
        "Transaction Data: rewards earned, withdrawal history.",
        "Payment Data: UPI, PayPal, or specific bank details required for payouts.",
        "Technical Data: IP address, browser type, device information.",
        "Usage Data: activity logs, completed offers, and platform interaction.",
        "Marketing Data: your preferences in receiving communications from us (with consent)."
      ]
    },
    {
      title: "5. How We Collect Data",
      list: [
        "Directly from you when you register and interact with our platform.",
        "Through automated tracking technologies (like cookies) for platform functionality.",
        "From our verified third-party partners (e.g., offerwalls or survey providers) regarding your completion status."
      ]
    },
    {
      title: "6. How We Use Your Data",
      list: [
        "To create and securely manage your account.",
        "To track your rewards and ensure accurate payouts.",
        "To verify withdrawal requests and prevent fraudulent activities.",
        "To provide reliable customer support.",
        "To monitor, maintain, and improve platform performance.",
        "To comply with applicable laws and legal obligations."
      ]
    },
    {
      title: "7. Data Sharing (Strictly Limited)",
      content: "As stated, we do not sell your data. We only share necessary information with trusted, compliant third parties required to operate our service. This includes secure hosting providers, verified payment processors, necessary analytics providers, and legal authorities if strictly required by law."
    },
    {
      title: "8. Legal Basis & International Transfers",
      content: "We process your data in compliance with applicable global privacy laws, including the GDPR (for European users) and US privacy regulations. Given our global operations and US headquarters, data may be securely transferred and stored outside your resident country with strict encryption and safeguards in place."
    },
    {
      title: "9. Data Security",
      list: [
        "Industry-standard SSL encryption for data transmission.",
        "Secure, restricted-access servers.",
        "Advanced fraud detection and prevention systems.",
        "Regular security audits to ensure data integrity."
      ]
    },
    {
      title: "10. Your Rights",
      content: "You maintain full control over your data. You may request access to, correction of, deletion of, or portability of your personal data at any time by contacting our privacy team at privacy@binnycash.com."
    },
    {
      title: "11. Cookies",
      content: "We use strictly necessary cookies to keep you logged in, improve your experience, and actively prevent fraud on our platform. Detailed information can be found in our Cookie Policy."
    },
    {
      title: "12. Children's Privacy",
      content: "BinnyCash is not intended for or directed at users under the age of 16. We do not knowingly collect information from minors."
    },
    {
      title: "13. Policy Updates",
      content: "We may update this policy periodically to reflect changes in our practices or relevant laws. Continued use of BinnyCash constitutes acceptance of these updates."
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