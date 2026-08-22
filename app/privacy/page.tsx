'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ChevronRight, Clock, Building, MapPin, Mail } from 'lucide-react';
import Link from 'next/link';

// --- CUSTOM COMPONENTS FOR CLEAN FORMATTING ---
const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="text-[19px] sm:text-xl font-black text-white mb-4 flex items-center gap-2">
      <div className="w-2 h-6 rounded-full bg-[#3DE8A0] shadow-[0_0_10px_rgba(61,232,160,0.5)]"></div>
      {title}
    </h2>
    <div className="space-y-4 text-[#8F95A3] text-[14px] leading-relaxed">
      {children}
    </div>
  </section>
);

const SubSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="mt-6 mb-4">
    <h3 className="text-white font-bold text-base mb-2">{title}</h3>
    <div className="space-y-3 text-[#8F95A3] text-[14px] leading-relaxed">
      {children}
    </div>
  </div>
);

const BulletList = ({ children }: { children: React.ReactNode }) => (
  <ul className="space-y-2.5 mt-3 mb-3 ml-2">
    {children}
  </ul>
);

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-3">
    <div className="w-1.5 h-1.5 rounded-full bg-[#3DE8A0] mt-2 shrink-0 shadow-[0_0_8px_rgba(61,232,160,0.8)]" />
    <span className="text-gray-300 font-medium">{children}</span>
  </li>
);

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0B0D14] text-[#F5F3FF] selection:bg-[#3DE8A0]/30 relative overflow-x-hidden font-sans pb-20">
      
      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#3DE8A0]/10 blur-[150px] rounded-full pointer-events-none z-0" />

      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 py-10 relative z-10">
        
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#8F95A3] uppercase tracking-wider mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#3DE8A0]">Privacy Policy</span>
        </div>

        {/* HERO BANNER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#0C1A14] to-[#111319] border border-[#3DE8A0]/30 rounded-[24px] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden mb-10"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3DE8A0]/10 blur-[50px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-16 h-16 rounded-[16px] bg-[#0E1015]/80 border border-white/10 flex items-center justify-center shrink-0 shadow-inner backdrop-blur-sm">
              <ShieldCheck className="w-8 h-8 text-[#3DE8A0] drop-shadow-[0_0_10px_rgba(61,232,160,0.8)]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">Privacy Policy</h1>
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
            Welcome to BinnyCash, a rewards and earning platform operated by Weeo Media LLC ("BinnyCash", "we", "us", or "our").
            <br /><br />
            This Privacy Policy explains how we collect, use, disclose, protect, retain, and delete information when you use the BinnyCash website, mobile application, rewards services, offers, surveys, promotions, and related services (collectively, the "Services").
            <br /><br />
            By using BinnyCash, you acknowledge that you have read and understood this Privacy Policy.
          </p>

          <Section title="1. Company Information">
            <div className="bg-[#1A1C24] p-5 rounded-xl border border-white/5 space-y-4">
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-[#3DE8A0] mt-0.5" />
                <div>
                  <h4 className="text-white font-bold text-sm">Company</h4>
                  <p className="text-[#8F95A3]">Weeo Media LLC</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#3DE8A0] mt-0.5" />
                <div>
                  <h4 className="text-white font-bold text-sm">Address</h4>
                  <p className="text-[#8F95A3]">5900 Balcones Drive STE 100<br />Austin, TX 78731<br />United States</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#3DE8A0] mt-0.5" />
                <div>
                  <h4 className="text-white font-bold text-sm">Email</h4>
                  <p className="text-[#8F95A3]">General Support: <a href="mailto:support@binnycash.com" className="hover:text-white transition-colors">support@binnycash.com</a></p>
                  <p className="text-[#8F95A3]">Privacy Contact: <a href="mailto:privacy@binnycash.com" className="hover:text-white transition-colors">privacy@binnycash.com</a></p>
                </div>
              </div>
            </div>
          </Section>

          <Section title="2. Information We Collect">
            <p>The information we collect depends on how you use BinnyCash.</p>
            
            <SubSection title="2.1 Account Information">
              <p>When you create an account, we may collect:</p>
              <BulletList>
                <Bullet>Name</Bullet>
                <Bullet>Username</Bullet>
                <Bullet>Email address</Bullet>
                <Bullet>Phone number</Bullet>
                <Bullet>Profile information</Bullet>
                <Bullet>Country or region</Bullet>
                <Bullet>Account credentials and authentication information</Bullet>
              </BulletList>
              <p>You may be able to use certain BinnyCash features without providing all optional profile information.</p>
            </SubSection>

            <SubSection title="2.2 Rewards and Activity Information">
              <p>When you participate in offers, surveys, games, promotions, or other earning activities, we may collect:</p>
              <BulletList>
                <Bullet>Offers viewed or selected</Bullet>
                <Bullet>Offers started or completed</Bullet>
                <Bullet>Tasks and milestones completed</Bullet>
                <Bullet>Rewards earned</Bullet>
                <Bullet>Reward balances</Bullet>
                <Bullet>Transaction history</Bullet>
                <Bullet>Redemption history</Bullet>
                <Bullet>Referral activity</Bullet>
                <Bullet>Cashback or promotional activity, where applicable</Bullet>
                <Bullet>Information received from offer, survey, advertising, or rewards partners regarding completion and attribution</Bullet>
              </BulletList>
              <p>This information is used to accurately calculate and credit rewards, investigate disputes, and prevent fraudulent activity.</p>
            </SubSection>

            <SubSection title="2.3 Payment and Redemption Information">
              <p>When you request a payout or redemption, we may collect information necessary to process the transaction. Depending on the redemption method selected, this may include:</p>
              <BulletList>
                <Bullet>Payment method</Bullet>
                <Bullet>UPI information</Bullet>
                <Bullet>PayPal information</Bullet>
                <Bullet>Bank or payout information</Bullet>
                <Bullet>Gift-card redemption information</Bullet>
                <Bullet>Transaction identifiers</Bullet>
                <Bullet>Information required by payment or rewards providers</Bullet>
              </BulletList>
              <p>We do not require you to provide payment information unless it is necessary for the payout or redemption method you choose.</p>
            </SubSection>

            <SubSection title="2.4 Identity Verification">
              <p>To protect users, advertisers, payment partners, and BinnyCash from fraud and abuse, certain withdrawals or accounts may require identity or eligibility verification. Where required, we or our authorized verification providers may process:</p>
              <BulletList>
                <Bullet>Full name</Bullet>
                <Bullet>Date of birth</Bullet>
                <Bullet>Government-issued identification information</Bullet>
                <Bullet>Identification document images</Bullet>
                <Bullet>Selfie or verification image</Bullet>
                <Bullet>Country of issuance</Bullet>
                <Bullet>Verification results</Bullet>
                <Bullet>Fraud and risk signals</Bullet>
                <Bullet>Technical information associated with the verification process</Bullet>
              </BulletList>
              <p>Identity verification may be required before certain rewards or withdrawals can be processed.</p>
            </SubSection>

            <SubSection title="2.5 Device and Technical Information">
              <p>When you access BinnyCash, we may automatically collect technical information such as:</p>
              <BulletList>
                <Bullet>IP address</Bullet>
                <Bullet>Device type</Bullet>
                <Bullet>Device model</Bullet>
                <Bullet>Operating system</Bullet>
                <Bullet>Operating system version</Bullet>
                <Bullet>Browser type</Bullet>
                <Bullet>App version</Bullet>
                <Bullet>Language and region settings</Bullet>
                <Bullet>Network information</Bullet>
                <Bullet>Device identifiers</Bullet>
                <Bullet>Advertising identifiers, where applicable</Bullet>
                <Bullet>Approximate location derived from technical information</Bullet>
                <Bullet>Error logs and diagnostic information</Bullet>
              </BulletList>
              <p>We use this information to operate, secure, analyze, and improve our Services.</p>
            </SubSection>

            <SubSection title="2.6 Usage Information">
              <p>We may collect information about how you interact with BinnyCash, including:</p>
              <BulletList>
                <Bullet>Pages or screens viewed</Bullet>
                <Bullet>Buttons and features used</Bullet>
                <Bullet>Session information</Bullet>
                <Bullet>Offers interacted with</Bullet>
                <Bullet>Referral activity</Bullet>
                <Bullet>Search activity</Bullet>
                <Bullet>App interactions</Bullet>
                <Bullet>Date and time of activity</Bullet>
                <Bullet>Error and performance information</Bullet>
              </BulletList>
            </SubSection>

            <SubSection title="2.7 Cookies and Similar Technologies">
              <p>We may use cookies, SDKs, pixels, local storage, and similar technologies to:</p>
              <BulletList>
                <Bullet>Keep users signed in</Bullet>
                <Bullet>Maintain sessions</Bullet>
                <Bullet>Remember preferences</Bullet>
                <Bullet>Measure performance</Bullet>
                <Bullet>Understand how our Services are used</Bullet>
                <Bullet>Detect fraud and abuse</Bullet>
                <Bullet>Attribute offers and rewards</Bullet>
                <Bullet>Support advertising and analytics where applicable</Bullet>
              </BulletList>
              <p>Where required by law, we will request appropriate consent for non-essential technologies.</p>
            </SubSection>
          </Section>

          <Section title="3. Optional Device Features">
            <p>Certain BinnyCash features may request additional device permissions. If a feature requires access to device information, we will provide appropriate notice and, where required, request permission before accessing that information.</p>
            <p>Optional permissions may be used to:</p>
            <BulletList>
              <Bullet>Verify offer completion</Bullet>
              <Bullet>Measure participation in supported offers</Bullet>
              <Bullet>Prevent fraudulent activity</Bullet>
              <Bullet>Personalize available offers</Bullet>
              <Bullet>Calculate and credit rewards</Bullet>
            </BulletList>
            <p>You may be able to disable optional permissions through your device or app settings. Disabling a permission may prevent specific offers or features from functioning correctly. BinnyCash will not request access to device information that is unnecessary for the feature being provided.</p>
          </Section>

          <Section title="4. Information From Third Parties">
            <p>BinnyCash works with third-party providers that may provide offers, surveys, advertising campaigns, games, cashback opportunities, rewards, payment services, identity verification, analytics, or fraud-prevention services.</p>
            <p>These partners may provide us with information such as:</p>
            <BulletList>
              <Bullet>Offer identifier</Bullet>
              <Bullet>Campaign identifier</Bullet>
              <Bullet>Completion status</Bullet>
              <Bullet>Transaction status</Bullet>
              <Bullet>Reward attribution information</Bullet>
              <Bullet>Fraud or risk signals</Bullet>
              <Bullet>Technical identifiers</Bullet>
              <Bullet>Survey eligibility or completion information</Bullet>
            </BulletList>
            <p>We use this information primarily to determine whether an activity qualifies for a reward, accurately credit rewards, investigate disputes, and prevent fraud.</p>
          </Section>

          <Section title="5. How We Use Information">
            <p>We may use information to:</p>
            <div className="bg-[#1A1C24] p-5 rounded-xl border border-white/5">
              <ol className="list-decimal list-inside space-y-2 text-[#8F95A3] text-[14px]">
                <li>Create and manage your account.</li>
                <li>Provide BinnyCash Services.</li>
                <li>Display and manage available offers.</li>
                <li>Track offer completion and reward eligibility.</li>
                <li>Credit rewards accurately.</li>
                <li>Process withdrawals and redemptions.</li>
                <li>Verify identity and eligibility.</li>
                <li>Prevent fraud, abuse, manipulation, and multiple-account activity.</li>
                <li>Detect suspicious transactions.</li>
                <li>Provide customer support.</li>
                <li>Maintain and improve the app and website.</li>
                <li>Analyze service performance.</li>
                <li>Communicate important service information.</li>
                <li>Send promotional communications where permitted and, where required, with your consent.</li>
                <li>Comply with legal and regulatory requirements.</li>
                <li>Protect our users, partners, systems, and business.</li>
                <li>Enforce our Terms and Conditions.</li>
              </ol>
            </div>
          </Section>

          <Section title="6. Fraud Prevention and Security">
            <p>Because BinnyCash provides monetary or monetary-equivalent rewards, we use security and fraud-prevention measures to protect the platform. These measures may include analysis of:</p>
            <BulletList>
              <Bullet>Device information</Bullet>
              <Bullet>IP address</Bullet>
              <Bullet>Account activity</Bullet>
              <Bullet>Offer activity</Bullet>
              <Bullet>Redemption behavior</Bullet>
              <Bullet>Transaction history</Bullet>
              <Bullet>Multiple-account indicators</Bullet>
              <Bullet>Technical identifiers</Bullet>
              <Bullet>Identity verification results</Bullet>
              <Bullet>Partner-provided fraud signals</Bullet>
            </BulletList>
            <p>We may delay, reject, investigate, or restrict a reward or withdrawal when we reasonably believe that fraud, abuse, manipulation, policy violations, or other suspicious activity has occurred.</p>
          </Section>

          <Section title="7. How We Share Information">
            <p>We do not sell your personal information for money. We may disclose limited information to service providers and partners where necessary to operate BinnyCash. These may include:</p>
            
            <div className="space-y-4 mt-4">
              <div className="bg-[#1A1C24] p-4 rounded-xl border border-white/5">
                <h4 className="text-white font-bold text-sm mb-1">Service Providers</h4>
                <p className="text-[#8F95A3] text-sm">Hosting, cloud infrastructure, security, analytics, customer support, communication, and technical service providers.</p>
              </div>
              <div className="bg-[#1A1C24] p-4 rounded-xl border border-white/5">
                <h4 className="text-white font-bold text-sm mb-1">Offer and Survey Partners</h4>
                <p className="text-[#8F95A3] text-sm">Information necessary to attribute and verify offers, surveys, games, cashback activities, and rewards.</p>
              </div>
              <div className="bg-[#1A1C24] p-4 rounded-xl border border-white/5">
                <h4 className="text-white font-bold text-sm mb-1">Payment and Rewards Providers</h4>
                <p className="text-[#8F95A3] text-sm">Information necessary to process gift cards, PayPal, UPI, bank transfers, or other supported redemption methods.</p>
              </div>
              <div className="bg-[#1A1C24] p-4 rounded-xl border border-white/5">
                <h4 className="text-white font-bold text-sm mb-1">Identity Verification Providers</h4>
                <p className="text-[#8F95A3] text-sm">Information necessary to verify identity, eligibility, and prevent fraud.</p>
              </div>
              <div className="bg-[#1A1C24] p-4 rounded-xl border border-white/5">
                <h4 className="text-white font-bold text-sm mb-1">Legal and Regulatory Authorities</h4>
                <p className="text-[#8F95A3] text-sm">Information may be disclosed where required by law, legal process, court order, regulatory requirement, or to protect the rights, safety, and security of BinnyCash, our users, or others.</p>
              </div>
              <div className="bg-[#1A1C24] p-4 rounded-xl border border-white/5">
                <h4 className="text-white font-bold text-sm mb-1">Business Transactions</h4>
                <p className="text-[#8F95A3] text-sm">Information may be transferred as part of a merger, acquisition, financing, restructuring, sale of assets, or similar business transaction, subject to applicable law.</p>
              </div>
            </div>
            <p className="mt-4">Service providers processing information on our behalf are expected to use the information only for authorized purposes and in accordance with applicable contractual and legal requirements.</p>
          </Section>

          <Section title="8. International Data Transfers">
            <p>BinnyCash is operated by Weeo Media LLC in the United States and may use service providers located in different countries. As a result, your information may be processed or stored outside the country in which you live.</p>
            <p>Where required by applicable law, we use appropriate safeguards for international data transfers.</p>
          </Section>

          <Section title="9. Data Security">
            <p>We use reasonable technical, organizational, and administrative safeguards designed to protect personal information against unauthorized access, loss, misuse, alteration, or disclosure. Security measures may include:</p>
            <BulletList>
              <Bullet>Encryption in transit</Bullet>
              <Bullet>Access controls</Bullet>
              <Bullet>Restricted administrative access</Bullet>
              <Bullet>Secure infrastructure</Bullet>
              <Bullet>Monitoring and logging</Bullet>
              <Bullet>Fraud detection</Bullet>
              <Bullet>Security reviews</Bullet>
              <Bullet>Backup and recovery procedures</Bullet>
            </BulletList>
            <p>However, no online system can be guaranteed to be completely secure.</p>
          </Section>

          <Section title="10. Data Retention">
            <p>We retain personal information only for as long as reasonably necessary for the purposes described in this Privacy Policy. Retention periods may depend on:</p>
            <BulletList>
              <Bullet>The purpose for which the information was collected</Bullet>
              <Bullet>Account and reward activity</Bullet>
              <Bullet>Payment and transaction requirements</Bullet>
              <Bullet>Fraud prevention requirements</Bullet>
              <Bullet>Legal and regulatory obligations</Bullet>
              <Bullet>Dispute resolution</Bullet>
              <Bullet>Security requirements</Bullet>
            </BulletList>
            <p>When information is no longer required, we will delete, anonymize, or securely dispose of it where reasonably practicable. Certain information may need to be retained after account closure where required for legal compliance, fraud prevention, security, accounting, dispute resolution, or the establishment or defense of legal claims.</p>
          </Section>

          <Section title="11. Your Privacy Rights">
            <p>Depending on your location and applicable law, you may have rights to:</p>
            <BulletList>
              <Bullet>Access your personal information</Bullet>
              <Bullet>Correct inaccurate information</Bullet>
              <Bullet>Request deletion</Bullet>
              <Bullet>Request restriction of processing</Bullet>
              <Bullet>Object to certain processing</Bullet>
              <Bullet>Request portability of certain information</Bullet>
              <Bullet>Withdraw consent where processing is based on consent</Bullet>
              <Bullet>Request information about how your data is processed</Bullet>
            </BulletList>
            <p>To exercise your rights, contact: <a href="mailto:privacy@binnycash.com" className="text-[#3DE8A0] hover:underline font-medium">privacy@binnycash.com</a>. We may need to verify your identity before completing certain requests.</p>
          </Section>

          <Section title="12. Account Deletion">
            <p>If you create a BinnyCash account, you may request deletion of your account and associated personal information. BinnyCash will provide an account deletion option within the app and an external web-based method for submitting an account deletion request.</p>
            <p>When an account deletion request is completed, we will delete or anonymize associated personal information unless we are required or permitted by applicable law to retain certain information. Information may be retained where reasonably necessary for:</p>
            <BulletList>
              <Bullet>Fraud prevention</Bullet>
              <Bullet>Security</Bullet>
              <Bullet>Legal compliance</Bullet>
              <Bullet>Tax or accounting requirements</Bullet>
              <Bullet>Dispute resolution</Bullet>
              <Bullet>Establishing or defending legal claims</Bullet>
              <Bullet>Enforcement of our Terms</Bullet>
            </BulletList>
            <p>Retained information will not be used for unrelated purposes where prohibited by law.</p>
          </Section>

          <Section title="13. Children's Privacy">
            <p>BinnyCash is intended for users who meet the minimum age requirements applicable to the Services and their country of residence. We do not knowingly collect personal information from children where such collection is prohibited by applicable law.</p>
            <p>If you believe a child has provided personal information to BinnyCash in violation of applicable requirements, please contact: <a href="mailto:privacy@binnycash.com" className="text-[#3DE8A0] hover:underline font-medium">privacy@binnycash.com</a>. We will investigate and take appropriate action.</p>
          </Section>

          <Section title="14. Marketing Communications">
            <p>Where permitted by applicable law, we may send service-related communications necessary to operate your account. Promotional communications may be sent where permitted and, where required, based on your consent.</p>
            <p>You may unsubscribe from promotional emails using the unsubscribe mechanism included in the communication. You may continue to receive essential service, security, transaction, and account-related communications even if you opt out of promotional communications.</p>
          </Section>

          <Section title="15. Third-Party Services and Links">
            <p>BinnyCash may contain links to or integrations with third-party websites, applications, offer providers, payment providers, advertising platforms, and other services.</p>
            <p>Third-party services have their own privacy policies and terms. BinnyCash is not responsible for the privacy practices of independent third parties. We encourage users to review the privacy policies of third-party services before providing information to them.</p>
          </Section>

          <Section title="16. Rewards and Payment Information">
            <p>BinnyCash may provide rewards through gift cards, cash-equivalent payouts, PayPal, UPI, bank transfer, or other redemption methods depending on availability and eligibility. Rewards may be subject to:</p>
            <BulletList>
              <Bullet>Minimum redemption requirements</Bullet>
              <Bullet>Identity verification</Bullet>
              <Bullet>Geographic availability</Bullet>
              <Bullet>Offer-specific requirements</Bullet>
              <Bullet>Fraud checks</Bullet>
              <Bullet>Payment-provider requirements</Bullet>
              <Bullet>Applicable laws and regulations</Bullet>
            </BulletList>
            <p>Information required to complete a redemption may be shared with the relevant payment or rewards provider.</p>
          </Section>

          <Section title="17. Changes to This Privacy Policy">
            <p>We may update this Privacy Policy from time to time to reflect changes in our Services, technology, legal requirements, or data practices.</p>
            <p>When we make changes, we will update the "Last Updated" date at the top of this Privacy Policy. For material changes, we may provide additional notice where required by applicable law.</p>
          </Section>

          <Section title="18. Contact Us">
            <p>If you have questions about this Privacy Policy, your personal information, or a privacy request, contact us:</p>
            <div className="mt-4 bg-[#111319] p-5 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-[#3DE8A0] mt-0.5" />
                <div>
                  <h4 className="text-white font-bold text-sm">Company</h4>
                  <p className="text-[#8F95A3]">Weeo Media LLC</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#3DE8A0] mt-0.5" />
                <div>
                  <h4 className="text-white font-bold text-sm">Address</h4>
                  <p className="text-[#8F95A3]">5900 Balcones Drive STE 100<br />Austin, TX 78731<br />United States</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#3DE8A0] mt-0.5" />
                <div>
                  <h4 className="text-white font-bold text-sm">Email</h4>
                  <p className="text-[#8F95A3]">Privacy: <a href="mailto:privacy@binnycash.com" className="hover:text-white transition-colors">privacy@binnycash.com</a></p>
                  <p className="text-[#8F95A3]">Support: <a href="mailto:support@binnycash.com" className="hover:text-white transition-colors">support@binnycash.com</a></p>
                </div>
              </div>
            </div>
          </Section>

          <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-center gap-2 text-xs font-bold text-[#3DE8A0] bg-[#3DE8A0]/10 py-3 rounded-xl border border-[#3DE8A0]/20">
             <ShieldCheck className="w-4 h-4" /> BinnyCash - A rewards platform operated by Weeo Media LLC.
          </div>
        </motion.div>

      </main>
    </div>
  );
}