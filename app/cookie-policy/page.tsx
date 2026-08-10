'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Cookie } from 'lucide-react';

export default function CookiePolicyPage() {
  const sections = [
    {
      title: "1. Introduction",
      content: "This Cookie Policy explains how Weeo Media LLC (operating as BinnyCash) uses cookies and similar tracking technologies on our platform."
    },
    {
      title: "2. What Are Cookies?",
      content: "Cookies are small text files stored on your device. They help us:",
      list: [
        "Recognize your device securely",
        "Improve and personalize user experience",
        "Track reward offers accurately",
        "Prevent fraudulent activities",
        "Analyze platform performance"
      ]
    },
    {
      title: "3. Types of Cookies",
      subsections: [
        {
          subtitle: "3.1 Essential Cookies",
          items: ["Login authentication", "Session management", "Security and fraud detection"]
        },
        {
          subtitle: "3.2 Analytics Cookies",
          items: ["User interaction tracking", "Page visits", "Error tracking", "Google Analytics"]
        },
        {
          subtitle: "3.3 Functional Cookies",
          items: ["Dashboard customization", "Preference saving"]
        },
        {
          subtitle: "3.4 Advertising & Tracking Cookies",
          items: ["Measure ad effectiveness", "Track third-party offers", "Prevent duplicate rewards", "Personalized content"]
        }
      ]
    },
    {
      title: "4. Third-Party Cookies",
      content: "Some cookies are placed by trusted third-party partners (e.g., offerwalls, payment gateways, analytics providers). We do not control these cookies, but we strictly vet our partners to ensure they align with our privacy standards."
    },
    {
      title: "5. Why We Use Cookies",
      list: [
        "Secure accounts from unauthorized access",
        "Actively detect and prevent fraud",
        "Accurately track your rewards and completions",
        "Improve platform speed and performance",
        "Deliver targeted offers relevant to you"
      ]
    },
    {
      title: "6. Managing Cookies",
      content: "You have the right to disable cookies via your browser settings. However, please note:",
      list: [
        "Login issues or session timeouts may occur",
        "Offer tracking may fail",
        "Rewards may not be credited if tracking is blocked"
      ]
    },
    {
      title: "7. Data Protection Compliance",
      content: "Weeo Media LLC complies with applicable global data protection regulations, including GDPR, US privacy laws, and India's DPDP Act."
    },
    {
      title: "8. Updates to this Policy",
      content: "We may update this policy periodically to reflect changes in our technology, practices, or applicable laws. Continued use implies acceptance."
    },
    {
      title: "9. Contact Information",
      content: "Company: Weeo Media LLC\nHQ Address: 5900 Balcones Drive STE 100 Austin, TX 78731 USA\nEmail: privacy@binnycash.com"
    }
  ];

  return (
    <div className="min-h-screen bg-[#08070D] text-[#F5F3FF] relative overflow-x-hidden py-12 font-sans">
      {/* Ambient Background Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#A66CFF]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-[#FFC94A]/[0.05] blur-[120px] rounded-full" />
      </div>

      <main className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header & Back Button */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[#8D89A8] hover:text-white transition-colors mb-6 font-medium text-sm">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-[#A66CFF]/10 border border-[#A66CFF]/20 flex items-center justify-center shadow-lg">
              <Cookie className="w-6 h-6 text-[#A66CFF]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Cookie Policy</h1>
          </div>
          <p className="text-sm text-[#8D89A8] font-medium ml-1">Last Updated: 11 February 2026</p>
        </div>

        {/* Content Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#120F1A] border border-white/[0.06] rounded-3xl p-6 sm:p-10 shadow-2xl"
        >
          <div className="space-y-10">
            {sections.map((section, idx) => (
              <div key={idx} className="flex flex-col gap-3">
                <h2 className="text-xl font-bold text-white border-b border-white/5 pb-2 inline-block w-full">{section.title}</h2>
                {/* Added whitespace-pre-wrap for proper address formatting */}
                {section.content && <p className="text-[#8F95A3] text-sm leading-relaxed whitespace-pre-wrap">{section.content}</p>}
                
                {section.list && (
                  <ul className="list-none space-y-2 mt-2">
                    {section.list.map((item, i) => (
                      <li key={i} className="text-[#8F95A3] text-sm flex items-start gap-2">
                        <span className="text-[#A66CFF] font-bold mt-0.5">•</span> {item}
                      </li>
                    ))}
                  </ul>
                )}

                {section.subsections && (
                  <div className="flex flex-col gap-6 mt-4">
                    {section.subsections.map((sub, i) => (
                      <div key={i} className="bg-[#1A1725] p-5 rounded-2xl border border-white/5">
                        <h3 className="text-white font-bold text-sm mb-3">{sub.subtitle}</h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {sub.items.map((item, j) => (
                            <li key={j} className="text-[#8F95A3] text-sm flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-[#3DE8A0]"></div> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
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