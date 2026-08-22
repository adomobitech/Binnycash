'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cookie, ChevronRight, Clock, ShieldCheck, Mail, Building, MapPin } from 'lucide-react';
import Link from 'next/link';

// --- CUSTOM COMPONENTS FOR CLEAN FORMATTING ---
const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="text-[19px] sm:text-xl font-black text-white mb-4 flex items-center gap-2">
      <div className="w-2 h-6 rounded-full bg-[#A66CFF] shadow-[0_0_10px_rgba(166,108,255,0.5)]"></div>
      {title}
    </h2>
    <div className="space-y-4 text-[#8F95A3] text-[14px] leading-relaxed">
      {children}
    </div>
  </section>
);

const BulletList = ({ children }: { children: React.ReactNode }) => (
  <ul className="space-y-2.5 mt-3 mb-3 ml-2">
    {children}
  </ul>
);

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-3">
    <div className="w-1.5 h-1.5 rounded-full bg-[#A66CFF] mt-2 shrink-0 shadow-[0_0_8px_rgba(166,108,255,0.8)]" />
    <span className="text-gray-300 font-medium">{children}</span>
  </li>
);

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#0B0D14] text-[#F5F3FF] selection:bg-[#A66CFF]/30 relative overflow-x-hidden font-sans pb-20">
      
      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#A66CFF]/10 blur-[150px] rounded-full pointer-events-none z-0" />

      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 py-10 relative z-10">
        
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#8F95A3] uppercase tracking-wider mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#A66CFF]">Cookie Policy</span>
        </div>

        {/* HERO BANNER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#1A1035] to-[#111319] border border-[#A66CFF]/30 rounded-[24px] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden mb-10"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#A66CFF]/10 blur-[50px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-16 h-16 rounded-[16px] bg-[#0E1015]/80 border border-white/10 flex items-center justify-center shrink-0 shadow-inner backdrop-blur-sm">
              <Cookie className="w-8 h-8 text-[#A66CFF] drop-shadow-[0_0_10px_rgba(166,108,255,0.8)]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">Cookie Policy</h1>
              <p className="text-[#8F95A3] text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" /> Last Updated: August 22, 2026
              </p>
            </div>
          </div>
        </motion.div>

        {/* CONTENT CONTAINER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#161821] border border-white/5 rounded-[24px] p-6 sm:p-10 shadow-xl"
        >
          <p className="text-[#8F95A3] text-[15px] font-medium leading-relaxed mb-10 pb-8 border-b border-white/10">
            This Cookie Policy explains how BinnyCash, operated by Weeo Media LLC ("BinnyCash", "we", "us", or "our"), uses cookies and similar technologies when you visit or use our website, web applications, and related online services.
            <br /><br />
            This policy should be read together with our Privacy Policy and Terms & Conditions.
          </p>

          <Section title="1. What Are Cookies?">
            <p>Cookies are small text files that websites store on your browser or device when you visit them. Cookies allow a website to recognize your browser, remember certain information, maintain sessions, and provide requested functionality.</p>
            <p>BinnyCash may also use technologies that perform functions similar to cookies, including:</p>
            <BulletList>
              <Bullet>Local storage</Bullet>
              <Bullet>Session storage</Bullet>
              <Bullet>Pixels</Bullet>
              <Bullet>Web beacons</Bullet>
              <Bullet>SDKS</Bullet>
              <Bullet>Device identifiers</Bullet>
              <Bullet>Advertising identifiers</Bullet>
              <Bullet>Similar tracking technologies</Bullet>
            </BulletList>
            <p>For simplicity, this policy refers to these technologies collectively as "Cookies" unless a distinction is necessary.</p>
          </Section>

          <Section title="2. Why BinnyCash Uses Cookies">
            <p>We use Cookies for several purposes, including:</p>
            <BulletList>
              <Bullet>Keeping users signed in</Bullet>
              <Bullet>Maintaining secure sessions</Bullet>
              <Bullet>Remembering preferences</Bullet>
              <Bullet>Protecting accounts and the platform</Bullet>
              <Bullet>Preventing fraudulent activity</Bullet>
              <Bullet>Understanding how users interact with our Services</Bullet>
              <Bullet>Measuring website and campaign performance</Bullet>
              <Bullet>Improving website functionality</Bullet>
              <Bullet>Supporting affiliate and offer attribution</Bullet>
              <Bullet>Measuring advertising performance</Bullet>
              <Bullet>Providing relevant content or advertising where applicable</Bullet>
            </BulletList>
            <p>Some Cookies are essential for the website to function and cannot be disabled through our consent controls.</p>
          </Section>

          <Section title="3. Types of Cookies We Use">
            <p>BinnyCash may use the following categories of Cookies.</p>
            
            <h3 className="text-white font-bold text-base mt-6 mb-2">3.1 Strictly Necessary Cookies</h3>
            <p>These Cookies are required for essential website functionality. They may be used to:</p>
            <BulletList>
              <Bullet>Maintain your login session</Bullet>
              <Bullet>Keep your account secure</Bullet>
              <Bullet>Remember security settings</Bullet>
              <Bullet>Maintain shopping/reward or redemption sessions where applicable</Bullet>
              <Bullet>Protect against automated abuse</Bullet>
              <Bullet>Prevent fraudulent activity</Bullet>
              <Bullet>Maintain basic website functionality</Bullet>
              <Bullet>Store essential consent preferences</Bullet>
            </BulletList>
            <p>Because these Cookies are necessary for core functionality or security, disabling them may cause some parts of BinnyCash to stop working correctly.</p>
          </Section>

          <Section title="4. Functional Cookies">
            <p>Functional Cookies help BinnyCash remember choices you make when using the platform. Depending on the features available, these may remember:</p>
            <BulletList>
              <Bullet>Preferred language</Bullet>
              <Bullet>Country or region preference</Bullet>
              <Bullet>Interface settings</Bullet>
              <Bullet>Session preferences</Bullet>
              <Bullet>Previously selected options</Bullet>
              <Bullet>Other functionality preferences</Bullet>
            </BulletList>
            <p>These Cookies are designed to improve your experience and reduce the need to repeatedly enter the same information.</p>
          </Section>

          <Section title="5. Analytics Cookies">
            <p>Where enabled and permitted, BinnyCash may use analytics technologies to understand how visitors use our website. Analytics information may include:</p>
            <BulletList>
              <Bullet>Pages visited</Bullet>
              <Bullet>Features used</Bullet>
              <Bullet>Time spent on pages</Bullet>
              <Bullet>Browser and device information</Bullet>
              <Bullet>Approximate geographic information</Bullet>
              <Bullet>Referral source</Bullet>
              <Bullet>General interaction patterns</Bullet>
              <Bullet>Performance and error information</Bullet>
            </BulletList>
            <p>Analytics information helps us understand which features are useful and identify areas where the platform can be improved. Where required by applicable law, non-essential analytics technologies will only be activated after obtaining the required consent.</p>
          </Section>

          <Section title="6. Affiliate and Offer Tracking">
            <p>Because BinnyCash provides rewards through offers, promotions, surveys, and affiliate campaigns, tracking technologies may be used to attribute activity correctly. When you click an offer, a tracking system may record information such as:</p>
            <BulletList>
              <Bullet>Offer or campaign identifier</Bullet>
              <Bullet>Click identifier</Bullet>
              <Bullet>Referral information</Bullet>
              <Bullet>Timestamp</Bullet>
              <Bullet>Technical information</Bullet>
              <Bullet>Attribution information</Bullet>
              <Bullet>Partner-specific tracking parameters</Bullet>
            </BulletList>
            <p>This information helps BinnyCash and its partners determine whether an eligible action was completed through BinnyCash.</p>
            
            <div className="bg-[#1A1C24] p-4 rounded-xl border border-white/5 my-4">
              <p className="text-sm font-bold text-white mb-2">For example:</p>
              <p className="text-[#A66CFF] font-mono text-xs leading-relaxed">
                BinnyCash → Offer Partner → User completes required action → Partner reports conversion → BinnyCash credits reward
              </p>
            </div>
            
            <p>Without appropriate attribution, we may not be able to determine that an offer was completed through BinnyCash.</p>
          </Section>

          <Section title="7. Advertising Technologies">
            <p>Where applicable, BinnyCash may use advertising technologies operated by third-party advertising providers. These technologies may be used to:</p>
            <BulletList>
              <Bullet>Measure advertising campaigns</Bullet>
              <Bullet>Understand advertisement performance</Bullet>
              <Bullet>Limit repeated advertisements</Bullet>
              <Bullet>Detect invalid advertising activity</Bullet>
              <Bullet>Provide more relevant advertisements</Bullet>
              <Bullet>Measure conversions</Bullet>
              <Bullet>Support remarketing where legally permitted</Bullet>
            </BulletList>
            <p>Third-party advertising providers may use their own cookies, identifiers, pixels, or similar technologies. Where required by applicable law, BinnyCash will request consent before enabling non-essential advertising technologies.</p>
          </Section>

          <Section title="8. Fraud Prevention and Security Technologies">
            <p>BinnyCash may use Cookies and similar technologies to protect the platform against abuse. These technologies can help us detect:</p>
            <BulletList>
              <Bullet>Automated activity</Bullet>
              <Bullet>Suspicious sessions</Bullet>
              <Bullet>Account abuse</Bullet>
              <Bullet>Multiple-account patterns</Bullet>
              <Bullet>Unusual activity</Bullet>
              <Bullet>Manipulated referrals</Bullet>
              <Bullet>Invalid clicks</Bullet>
              <Bullet>Offer manipulation</Bullet>
              <Bullet>Other potentially fraudulent behavior</Bullet>
            </BulletList>
            <p>Security-related technologies may collect technical information such as device characteristics, browser information, IP address, session information, and interaction signals. This information is used for security, fraud prevention, and platform integrity.</p>
          </Section>

          <Section title="9. Third-Party Technologies">
            <p>Some features of BinnyCash may rely on third-party providers. Depending on the services currently integrated into BinnyCash, these providers may use Cookies or similar technologies for purposes such as:</p>
            <BulletList>
              <Bullet>Analytics</Bullet>
              <Bullet>Security</Bullet>
              <Bullet>Advertising</Bullet>
              <Bullet>Offer attribution</Bullet>
              <Bullet>Customer support</Bullet>
              <Bullet>Payment or reward processing</Bullet>
              <Bullet>Fraud prevention</Bullet>
              <Bullet>Performance monitoring</Bullet>
            </BulletList>
            <p>Third-party providers operate under their own privacy policies and terms. We recommend reviewing the privacy documentation of third-party services when interacting with those services.</p>
          </Section>

          <Section title="10. Cookie Consent">
            <p>Where applicable law requires consent for non-essential Cookies, BinnyCash will provide a Cookie consent mechanism. Depending on your location and the technologies used, you may be able to:</p>
            <BulletList>
              <Bullet>Accept optional Cookies</Bullet>
              <Bullet>Reject optional Cookies</Bullet>
              <Bullet>Select individual Cookie categories</Bullet>
              <Bullet>Change your preferences later</Bullet>
              <Bullet>Withdraw previously provided consent</Bullet>
            </BulletList>
            <p>Withdrawing consent does not affect processing that was lawfully carried out before consent was withdrawn.</p>
          </Section>

          <Section title="11. Managing Cookies Through Your Browser">
            <p>Most modern browsers allow you to control or delete Cookies through their settings. You can generally:</p>
            <BulletList>
              <Bullet>Block Cookies</Bullet>
              <Bullet>Delete existing Cookies</Bullet>
              <Bullet>Allow only certain Cookies</Bullet>
              <Bullet>Receive a notification before Cookies are stored</Bullet>
              <Bullet>Use private/incognito browsing modes</Bullet>
            </BulletList>
            <p>Please note that disabling necessary Cookies may prevent certain BinnyCash features from functioning correctly. Browser settings are controlled by your browser provider, so the exact steps may vary.</p>
          </Section>

          <Section title="12. Mobile Applications">
            <p>The BinnyCash mobile application may use technologies that perform functions similar to Cookies. These may include:</p>
            <BulletList>
              <Bullet>Mobile SDKS</Bullet>
              <Bullet>Device identifiers</Bullet>
              <Bullet>Advertising identifiers</Bullet>
              <Bullet>App session identifiers</Bullet>
              <Bullet>Analytics technologies</Bullet>
              <Bullet>Attribution technologies</Bullet>
              <Bullet>Fraud-prevention technologies</Bullet>
            </BulletList>
            <p>Mobile applications do not necessarily use browser Cookies in the same way as websites. The technologies used in the BinnyCash app depend on the SDKs and services integrated into the current version of the application.</p>
          </Section>

          <Section title="13. Data Collected Through Cookies">
            <p>Depending on the technology and your settings, information associated with Cookies may include:</p>
            <BulletList>
              <Bullet>IP address</Bullet>
              <Bullet>Browser type</Bullet>
              <Bullet>Device type</Bullet>
              <Bullet>Operating system</Bullet>
              <Bullet>Device identifiers</Bullet>
              <Bullet>Advertising identifiers</Bullet>
              <Bullet>Session identifiers</Bullet>
              <Bullet>Referral URLs</Bullet>
              <Bullet>Pages viewed</Bullet>
              <Bullet>Clicks and interactions</Bullet>
              <Bullet>Date and time of activity</Bullet>
              <Bullet>Offer or campaign identifiers</Bullet>
              <Bullet>General location information</Bullet>
              <Bullet>Website preferences</Bullet>
            </BulletList>
            <p>We use this information for the purposes described in this Cookie Policy and our Privacy Policy.</p>
          </Section>

          <Section title="14. Cookie Retention">
            <p>Cookies may remain on your device for different periods depending on their purpose. Some Cookies are:</p>
            <div className="bg-[#1A1C24] p-5 rounded-xl border border-white/5 my-4 space-y-4">
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Session Cookies</h4>
                <p className="text-[#8F95A3] text-sm">These are generally removed when you close your browser or session.</p>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Persistent Cookies</h4>
                <p className="text-[#8F95A3] text-sm">These remain for a specified period or until you delete them through your browser settings.</p>
              </div>
            </div>
            <p>The retention period may vary depending on the service provider and purpose of the Cookie.</p>
          </Section>

          <Section title="15. International Services">
            <p>BinnyCash is operated by Weeo Media LLC in the United States and uses service providers that may operate in different countries. As a result, information associated with Cookies and similar technologies may be processed in countries other than the country where you live.</p>
            <p>For additional information about international data processing, please review our Privacy Policy.</p>
          </Section>

          <Section title="16. Your Privacy Rights">
            <p>Depending on your location and applicable law, you may have rights relating to your personal information, including rights to:</p>
            <BulletList>
              <Bullet>Access information</Bullet>
              <Bullet>Request correction</Bullet>
              <Bullet>Request deletion</Bullet>
              <Bullet>Object to certain processing</Bullet>
              <Bullet>Restrict certain processing</Bullet>
              <Bullet>Request data portability</Bullet>
              <Bullet>Withdraw consent where applicable</Bullet>
            </BulletList>
            <p>For privacy-related requests, contact: <a href="mailto:privacy@binnycash.com" className="text-[#A66CFF] hover:underline font-medium">privacy@binnycash.com</a></p>
          </Section>

          <Section title="17. Do Not Track Signals">
            <p>Some browsers provide "Do Not Track" or similar privacy signals. Because there is currently no universally consistent technical standard for interpreting all such signals, BinnyCash may not respond to every browser-based Do Not Track signal in the same manner.</p>
            <p>Where applicable law requires recognition of a legally recognized privacy signal, we will handle such signals as required by applicable law.</p>
          </Section>

          <Section title="18. Changes to This Cookie Policy">
            <p>We may update this Cookie Policy when our technologies, services, business practices, or legal requirements change. When we make changes, we will update the Last Updated date displayed at the top of this page.</p>
            <p>Where required, we may also provide additional notice or request consent for newly introduced non-essential technologies.</p>
          </Section>

          <Section title="19. Contact Us">
            <p>If you have questions about Cookies, tracking technologies, or your privacy preferences, contact us:</p>
            <div className="mt-4 bg-[#111319] p-5 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-[#A66CFF] mt-0.5" />
                <div>
                  <h4 className="text-white font-bold text-sm">Company</h4>
                  <p className="text-[#8F95A3]">Weeo Media LLC</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#A66CFF] mt-0.5" />
                <div>
                  <h4 className="text-white font-bold text-sm">Address</h4>
                  <p className="text-[#8F95A3]">5900 Balcones Drive STE 100<br />Austin, TX 78731<br />United States</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#A66CFF] mt-0.5" />
                <div>
                  <h4 className="text-white font-bold text-sm">Email</h4>
                  <p className="text-[#8F95A3]">Privacy: <a href="mailto:privacy@binnycash.com" className="hover:text-white transition-colors">privacy@binnycash.com</a></p>
                  <p className="text-[#8F95A3]">Support: <a href="mailto:support@binnycash.com" className="hover:text-white transition-colors">support@binnycash.com</a></p>
                </div>
              </div>
            </div>
          </Section>

          {/* Quick Summary Block */}
          <div className="mt-12 bg-gradient-to-br from-[#A66CFF]/10 to-transparent border border-[#A66CFF]/20 rounded-2xl p-6">
            <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2">
              <Cookie className="w-5 h-5 text-[#A66CFF]" /> Quick Summary
            </h3>
            <p className="text-sm text-[#8F95A3] mb-3">BinnyCash uses Cookies and similar technologies primarily to:</p>
            <BulletList>
              <Bullet>Keep the platform functioning</Bullet>
              <Bullet>Maintain secure sessions</Bullet>
              <Bullet>Remember preferences</Bullet>
              <Bullet>Attribute affiliate and offer conversions</Bullet>
              <Bullet>Prevent fraud and abuse</Bullet>
              <Bullet>Analyze platform performance</Bullet>
              <Bullet>Measure advertising campaigns</Bullet>
              <Bullet>Improve our Services</Bullet>
            </BulletList>
            <p className="text-sm text-[#8F95A3] mt-4">
              You can manage non-essential Cookie preferences where applicable through our Cookie consent controls.
            </p>
          </div>

          <div className="mt-10 pt-8 border-t border-white/10 flex items-center justify-center gap-2 text-xs font-bold text-[#A66CFF] bg-[#A66CFF]/10 py-3 rounded-xl border border-[#A66CFF]/20">
             <ShieldCheck className="w-4 h-4" /> BinnyCash - Operated by Weeo Media LLC
          </div>
        </motion.div>

      </main>
    </div>
  );
}