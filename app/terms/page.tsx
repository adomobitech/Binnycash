'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, FileText } from 'lucide-react';

export default function TermsPage() {
  const sections = [
    {
      title: "Introduction",
      content: "Welcome to BinnyCash. These Terms & Conditions (\"Terms\", \"Terms of Service\", or \"Agreement\") govern your access to and use of the BinnyCash mobile application, website, rewards services, promotional activities, and related features (collectively, the \"Services\"). BinnyCash is operated by Weeo Media LLC. By creating an account, accessing, or using BinnyCash, you agree to these Terms and our Privacy Policy. If you do not agree with these Terms, please do not use the Services."
    },
    {
      title: "1. About BinnyCash",
      content: "BinnyCash is a rewards and digital engagement platform that may provide users with opportunities to participate in eligible activities, offers, promotions, referrals, and other features through which rewards may be made available. The availability of specific activities, offers, rewards, payment methods, and features may vary by country, user eligibility, account status, advertiser requirements, and other applicable conditions. Participation does not guarantee a particular level of earnings or rewards."
    },
    {
      title: "2. Eligibility",
      content: "You must meet the minimum age and eligibility requirements applicable to your location and the Services you use. You are responsible for ensuring that your use of BinnyCash is lawful in your jurisdiction. We may apply additional eligibility requirements to particular offers, promotions, or rewards. You may not use BinnyCash if:",
      list: [
        "You are not legally permitted to use the Services.",
        "Your account has previously been suspended or terminated for abuse.",
        "You are attempting to create multiple unauthorized accounts.",
        "Your use of the Services violates applicable laws or regulations."
      ]
    },
    {
      title: "3. Account Registration",
      content: "Some BinnyCash features require you to create an account. You are responsible for activity conducted through your account unless caused by circumstances outside your reasonable control. You agree to:",
      list: [
        "Provide accurate and current information.",
        "Keep your account information updated.",
        "Protect your login credentials.",
        "Not share your account with another person.",
        "Not create multiple accounts unless expressly permitted.",
        "Immediately notify us of suspected unauthorized access."
      ]
    },
    {
      title: "4. Rewards and Points",
      content: "BinnyCash may provide rewards, points, bonuses, or other incentives for eligible activities. Rewards are not guaranteed merely because an activity is displayed in the application. An activity may be rejected, reversed, delayed, or become unavailable where the applicable advertiser, partner, tracking system, or fraud-prevention process determines that the required conditions were not satisfied. Rewards may be subject to:",
      list: [
        "Eligibility requirements",
        "Minimum completion requirements",
        "Advertiser or partner validation",
        "Verification procedures",
        "Time limits",
        "Geographic restrictions",
        "Fraud and abuse checks",
        "Promotional terms"
      ]
    },
    {
      title: "5. Offer and Task Completion",
      content: "Certain activities may be provided by third-party advertisers, partners, or offer providers. To receive a reward, you may be required to complete the conditions specified for the relevant activity. You must follow the applicable offer terms. BinnyCash is not responsible for an advertiser changing, withdrawing, suspending, or modifying an offer. Examples may include:",
      list: [
        "Installing an eligible application",
        "Registering for a service",
        "Completing a qualifying activity",
        "Reaching a specified milestone",
        "Completing an eligible survey or task",
        "Meeting promotional requirements"
      ]
    },
    {
      title: "6. Referral Program",
      content: "If BinnyCash provides a referral program, referral rewards are subject to the applicable referral rules. We may cancel rewards and restrict or terminate accounts involved in referral abuse. You must not:",
      list: [
        "Create fake accounts to generate referral rewards.",
        "Refer yourself through unauthorized accounts.",
        "Use automated systems or bots.",
        "Manipulate referral tracking.",
        "Spam users.",
        "Misrepresent BinnyCash or its offers.",
        "Use misleading advertisements to obtain referrals."
      ]
    },
    {
      title: "7. Withdrawals and Payouts",
      content: "Where withdrawal functionality is available, users may request eligible rewards through supported payment methods. A withdrawal request does not guarantee immediate payment. We may temporarily delay or review a transaction where necessary for security, fraud prevention, technical investigation, or compliance purposes. If a reward was incorrectly credited because of a technical error, fraud, manipulation, or invalid activity, we may reverse the affected reward before or after a withdrawal. Withdrawal requirements may include:",
      list: [
        "Minimum withdrawal thresholds",
        "Account verification",
        "Identity or fraud checks",
        "Valid payment information",
        "Eligibility requirements",
        "Applicable processing periods"
      ]
    },
    {
      title: "8. Payment Information",
      content: "Users are responsible for providing accurate payout information. Additional verification may be required before certain payouts. BinnyCash is not responsible for payment failures caused by:",
      list: [
        "Incorrect information provided by the user",
        "Unsupported payment methods",
        "Third-party payment provider issues",
        "Bank or payment-network restrictions",
        "Regulatory restrictions",
        "Technical problems outside our reasonable control"
      ]
    },
    {
      title: "9. Prohibited Activities",
      content: "You must not use BinnyCash to:",
      list: [
        "Commit fraud or financial abuse.",
        "Operate multiple unauthorized accounts.",
        "Use bots, scripts, emulators, or automated systems to manipulate rewards.",
        "Manipulate advertising, attribution, tracking, or offer systems.",
        "Generate fraudulent clicks, installs, leads, registrations, or conversions.",
        "Exploit bugs or technical vulnerabilities.",
        "Attempt to bypass security controls.",
        "Reverse engineer or interfere with the Services.",
        "Submit false information.",
        "Use another person's identity or payment information without authorization.",
        "Abuse referral programs.",
        "Circumvent geographic or eligibility restrictions.",
        "Engage in activity that violates applicable laws.",
        "Interfere with the operation of BinnyCash or third-party services."
      ]
    },
    {
      title: "10. Account Suspension and Termination",
      content: "Where appropriate, we may review the account and relevant activity before taking final action. Account suspension or termination does not remove legitimate obligations that arose before termination. We may suspend, restrict, or terminate an account when we reasonably believe that:",
      list: [
        "These Terms have been violated.",
        "Fraudulent or abusive activity has occurred.",
        "Multiple unauthorized accounts have been created.",
        "Rewards have been manipulated.",
        "The account creates a security or legal risk.",
        "The user has provided materially inaccurate information.",
        "The Services are being used unlawfully."
      ]
    },
    {
      title: "11. Account Deletion",
      content: "You may request deletion of your BinnyCash account. Inside the application: Profile / Settings → Delete Account. \nWhen an account deletion request is submitted, we will process the request in accordance with our Privacy Policy and applicable law. Certain information may need to be retained where required or permitted for legitimate purposes such as fraud prevention, security, legal compliance, dispute resolution, or financial recordkeeping. Account deletion is separate from account suspension or temporary deactivation."
    },
    {
      title: "12. Advertising and Third-Party Services",
      content: "BinnyCash may display advertisements and provide links to third-party services, offers, advertisers, or partners. Third-party services may have their own terms and privacy policies. We do not guarantee the availability, accuracy, performance, security, or reliability of third-party services. Users should review applicable third-party terms before using third-party services."
    },
    {
      title: "13. Intellectual Property",
      content: "The BinnyCash application, branding, logos, designs, software, text, graphics, interfaces, and other content provided by BinnyCash are owned by or licensed to Weeo Media LLC unless otherwise stated. You may not copy, reproduce, modify, distribute, sell, license, reverse engineer, or commercially exploit BinnyCash intellectual property without written authorization."
    },
    {
      title: "14. User Content",
      content: "If BinnyCash allows users to submit content, reviews, comments, messages, images, or other material (\"User Content\"), you are responsible for the content you submit. We may remove content or restrict accounts where reasonably necessary to enforce these Terms and applicable policies. If User Content functionality is enabled, BinnyCash will provide appropriate reporting and moderation mechanisms consistent with applicable requirements. You must not submit content that:",
      list: [
        "Is unlawful.",
        "Is fraudulent or misleading.",
        "Infringes another person's intellectual property.",
        "Contains malicious software.",
        "Harasses or threatens another person.",
        "Contains abusive or hateful material.",
        "Contains sexually explicit material where prohibited.",
        "Promotes illegal activity.",
        "Violates another person's privacy."
      ]
    },
    {
      title: "15. Responsible Use",
      content: "BinnyCash is intended to provide legitimate digital rewards and engagement opportunities. You should not treat rewards provided through BinnyCash as guaranteed income, employment, investment returns, or a substitute for regular employment or financial planning. The amount and availability of rewards may vary."
    },
    {
      title: "16. Changes to Services",
      content: "We may modify, suspend, replace, or discontinue features of BinnyCash from time to time. Where appropriate, material changes will be communicated through the application or website. Changes may include:",
      list: [
        "Adding or removing offers",
        "Changing reward values",
        "Changing eligibility requirements",
        "Updating withdrawal methods",
        "Modifying referral programs",
        "Updating application functionality"
      ]
    },
    {
      title: "17. Availability of Services",
      content: "We aim to provide a reliable service but do not guarantee that BinnyCash will always be available or uninterrupted. The Services may be temporarily unavailable because of:",
      list: [
        "Maintenance",
        "Updates",
        "Server problems",
        "Network problems",
        "Security incidents",
        "Third-party service interruptions",
        "Events outside our reasonable control"
      ]
    },
    {
      title: "18. No Guarantee of Rewards",
      content: "BinnyCash does not guarantee that every user will receive a specific amount of rewards. Rewards depend on eligible activities, applicable conditions, advertiser validation, availability, user eligibility, and other factors. Any promotional statement regarding potential rewards should not be interpreted as a guarantee of earnings."
    },
    {
      title: "19. Disclaimer",
      content: "To the maximum extent permitted by applicable law, BinnyCash is provided on an \"as available\" basis. Nothing in these Terms excludes rights or protections that cannot legally be excluded under applicable law. We do not guarantee that:",
      list: [
        "The Services will always be available.",
        "All offers will remain available.",
        "Every activity will generate a reward.",
        "Third-party services will operate without interruption.",
        "Reward tracking will never experience technical problems."
      ]
    },
    {
      title: "20. Limitation of Liability",
      content: "To the maximum extent permitted by applicable law, Weeo Media LLC will not be responsible for indirect, incidental, special, consequential, or punitive damages arising from your use of the Services. This limitation does not apply where prohibited by applicable law."
    },
    {
      title: "21. Indemnification",
      content: "To the extent permitted by applicable law, you agree to be responsible for losses, claims, damages, liabilities, and reasonable expenses arising from your:",
      list: [
        "Violation of these Terms.",
        "Misuse of the Services.",
        "Fraudulent or abusive activity.",
        "Violation of applicable laws.",
        "Infringement of third-party rights."
      ]
    },
    {
      title: "22. Privacy",
      content: "Your use of BinnyCash is also governed by our Privacy Policy: https://www.binnycash.com/privacy\nThe Privacy Policy explains how we collect, use, share, retain, and delete personal information."
    },
    {
      title: "23. Google Play",
      content: "BinnyCash is distributed through Google Play and must comply with applicable Google Play policies. These Terms govern the relationship between you and BinnyCash. They do not replace or modify any applicable terms imposed by Google Play."
    },
    {
      title: "24. Changes to These Terms",
      content: "We may update these Terms from time to time. When material changes are made, we may provide notice through the application or website. The updated version will include a revised effective date. Your continued use of BinnyCash after the effective date of updated Terms constitutes acceptance of the updated Terms to the extent permitted by applicable law."
    },
    {
      title: "25. Contact",
      content: "For questions regarding these Terms or BinnyCash services:\n\nCompany: Weeo Media LLC\nProduct: BinnyCash\nWebsite: https://www.binnycash.com\nPrivacy Policy: https://www.binnycash.com/privacy\n\nFor additional support, please use the contact/support options provided on the BinnyCash website or within the application."
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
          <p className="text-sm text-[#8D89A8] font-medium ml-1">Last Updated: August 21, 2026</p>
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
                {section.content && <p className="text-[#8F95A3] text-sm leading-relaxed whitespace-pre-wrap bg-[#1A1725] p-4 rounded-xl border border-white/5">{section.content}</p>}
                
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