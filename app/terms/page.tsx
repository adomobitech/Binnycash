'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ChevronRight, Clock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

// --- CUSTOM COMPONENTS FOR CLEAN FORMATTING ---
const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="text-[19px] sm:text-xl font-black text-white mb-4 flex items-center gap-2">
      <div className="w-2 h-6 rounded-full bg-[#3B82F6] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
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
    <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] mt-2 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
    <span className="text-gray-300 font-medium">{children}</span>
  </li>
);

export default function TermsPage() {
  const sections = [
    {
      title: "1. About BinnyCash",
      content: "BinnyCash is a rewards platform that allows eligible users to participate in activities made available through BinnyCash and its third-party partners. Depending on your location and eligibility, available activities may include:",
      list: [
        "Surveys",
        "Mobile application offers",
        "Games",
        "Promotional activities",
        "Shopping offers",
        "Cashback opportunities",
        "Sponsored activities",
        "Referral programs",
        "Advertiser campaigns",
        "Other reward-eligible activities"
      ],
      postContent: "In return for completing qualifying activities, users may become eligible to receive rewards through the redemption methods made available by BinnyCash. The availability of specific features, offers, rewards, and redemption methods may vary by country, account, device, campaign, and other eligibility requirements."
    },
    {
      title: "2. Eligibility",
      content: "You may use BinnyCash only if you meet the minimum age and legal eligibility requirements applicable to the Services in your country or region. Unless a specific offer states otherwise, BinnyCash is intended for users who are 18 years of age or older. By using BinnyCash, you represent that:",
      list: [
        "You meet the applicable minimum age requirement.",
        "The information you provide is accurate and current.",
        "You are legally permitted to use the Services.",
        "You will comply with these Terms.",
        "You will comply with applicable laws and regulations."
      ],
      postContent: "If you do not meet the applicable eligibility requirements, you must not use BinnyCash. Certain offers may have additional age, country, device, or eligibility requirements."
    },
    {
      title: "3. One Account Per Person",
      content: "Unless BinnyCash expressly permits otherwise, you may maintain only one personal BinnyCash account. You must not create multiple accounts to:",
      list: [
        "Claim the same reward more than once.",
        "Circumvent account restrictions.",
        "Manipulate referral programs.",
        "Repeat offers intended for new users.",
        "Abuse promotional campaigns.",
        "Avoid fraud or security controls."
      ],
      postContent: "We may review accounts, devices, transactions, and activity when reasonably necessary to identify duplicate accounts or abuse."
    },
    {
      title: "4. Creating and Maintaining Your Account",
      content: "Certain features may require you to create a BinnyCash account. You agree to provide accurate, complete, and current information. You are responsible for:",
      list: [
        "Protecting your login credentials.",
        "Keeping your account information accurate.",
        "Preventing unauthorized access.",
        "Informing us if you believe your account has been compromised."
      ],
      postContent: "Your account is personal to you and must not be sold, rented, transferred, or provided to another person."
    },
    {
      title: "5. Guest Access",
      content: "Some BinnyCash features may be available without creating an account. Guest access may be subject to:",
      list: [
        "Usage limits",
        "Device or IP-based restrictions",
        "Feature limitations",
        "Security controls",
        "Temporary session identifiers"
      ],
      postContent: "Certain features, rewards, withdrawals, or account history may require registration."
    },
    {
      title: "6. Offers and Earning Opportunities",
      content: "BinnyCash may display offers provided by third-party advertisers, affiliate networks, survey providers, application developers, merchants, and other partners (\"Offer Partners\"). Offer requirements are determined by the applicable campaign. An offer may require you to:",
      list: [
        "Install an application.",
        "Register for a service.",
        "Complete a survey.",
        "Reach a specified game milestone.",
        "Make a qualifying purchase.",
        "Start or maintain a subscription.",
        "Complete a series of actions.",
        "Meet a specified eligibility condition."
      ],
      postContent: "You should carefully read the requirements of an offer before participating."
    },
    {
      title: "7. Offer Tracking and Attribution",
      content: "BinnyCash may use tracking technologies and information supplied by Offer Partners to determine whether an activity was completed through BinnyCash. Tracking may involve:",
      list: [
        "Click identifiers",
        "Campaign identifiers",
        "Cookies",
        "Device identifiers",
        "Advertising identifiers",
        "Attribution parameters",
        "SDKs",
        "Conversion tracking",
        "Postbacks",
        "Partner reporting systems"
      ],
      postContent: "An activity may not qualify for a reward if it cannot be properly attributed, verified, or reported by the applicable Offer Partner. BinnyCash does not guarantee that every activity will be successfully tracked."
    },
    {
      title: "8. Reward Eligibility",
      content: "Completing an activity does not automatically guarantee a reward. A reward may require:",
      list: [
        "Completing all requirements of the applicable offer.",
        "Completing the activity within the required time period.",
        "Meeting all eligibility conditions.",
        "Successful tracking.",
        "Confirmation by the applicable Offer Partner.",
        "Passing applicable fraud and security checks."
      ],
      postContent: "Where an Offer Partner determines that an activity was invalid, incomplete, duplicated, fraudulent, or otherwise ineligible, BinnyCash may decline to issue the associated reward."
    },
    {
      title: "9. Pending Rewards",
      content: "Certain rewards may initially appear as Pending. A pending reward means that the activity may have been detected but has not yet completed the applicable verification process. Pending periods can vary depending on:",
      list: [
        "The Offer Partner.",
        "The type of offer.",
        "Advertiser verification.",
        "Transaction status.",
        "Fraud and security checks."
      ],
      postContent: "A pending reward is not necessarily a final or guaranteed reward."
    },
    {
      title: "10. Reward Reversals",
      content: "A reward may be cancelled, adjusted, or reversed if the underlying activity is subsequently determined to be invalid. Examples may include:",
      list: [
        "Cancelled transactions.",
        "Refunded purchases.",
        "Failed subscriptions.",
        "Invalid leads.",
        "Duplicate conversions.",
        "Fraudulent activity.",
        "Advertiser rejection.",
        "Violation of offer requirements.",
        "Chargebacks.",
        "Inaccurate or misleading information."
      ],
      postContent: "Where appropriate, BinnyCash may deduct a reversed reward from your available balance."
    },
    {
      title: "11. Rewards and Reward Balance",
      content: "BinnyCash may display rewards using points, credits, currency-equivalent amounts, or other denominations. Unless expressly stated otherwise, an unredeemed reward balance is a platform reward balance and does not represent a bank deposit, investment, security, or guaranteed cash balance. Rewards are subject to:",
      list: [
        "These Terms.",
        "Offer-specific requirements.",
        "Verification.",
        "Redemption requirements.",
        "Availability of the selected redemption method."
      ],
      postContent: "Rewards cannot be sold, transferred, or assigned to another person unless BinnyCash expressly allows it."
    },
    {
      title: "12. Redemption and Withdrawals",
      content: "Eligible rewards may be redeemed using the payout or redemption methods currently supported by BinnyCash. Depending on availability, these may include:",
      list: [
        "Digital gift cards.",
        "PayPal.",
        "UPI.",
        "Bank-related payout methods.",
        "Other supported reward providers."
      ],
      postContent: "Redemption availability may vary by country, account, reward type, provider, and applicable requirements. A minimum redemption threshold may apply."
    },
    {
      title: "13. Redemption Verification",
      content: "BinnyCash may require verification before processing a withdrawal or redemption. Verification may include:",
      list: [
        "Email verification.",
        "Phone verification.",
        "Identity verification.",
        "Proof of address.",
        "Proof of transaction.",
        "Payment verification.",
        "Other reasonable eligibility checks."
      ],
      postContent: "We may use third-party verification providers where appropriate. If you fail to provide required information or provide information that cannot be reasonably verified, we may delay, reject, or restrict the relevant transaction."
    },
    {
      title: "14. Gift Cards and Third-Party Rewards",
      content: "Where BinnyCash provides gift cards through third-party issuers or reward providers:",
      list: [
        "Gift cards are subject to the issuer's terms.",
        "Availability may vary by country and denomination.",
        "Certain gift cards may have expiration dates or additional restrictions.",
        "BinnyCash may not be the issuer of the gift card.",
        "Once a gift card has been successfully delivered, it may not be cancellable or refundable except where required by applicable law or the issuer's applicable policy."
      ],
      postContent: "Users are responsible for protecting digital gift-card codes after delivery. BinnyCash is not responsible for unauthorized use caused by a user sharing or exposing a gift-card code."
    },
    {
      title: "15. Payment and Payout Providers",
      content: "Some payouts may be processed through independent payment providers. BinnyCash may provide the information necessary for the selected payout method to the relevant provider. Payment providers may perform their own:",
      list: [
        "Identity checks.",
        "Fraud checks.",
        "Transaction monitoring.",
        "Compliance checks."
      ],
      postContent: "A payout may be delayed or rejected by a payment provider even after BinnyCash has approved the underlying reward."
    },
    {
      title: "16. Taxes",
      content: "Depending on your country and circumstances, rewards or other benefits received through BinnyCash may have tax implications. You are responsible for determining and complying with your own tax obligations. BinnyCash does not provide tax, legal, or financial advice. Where required by law, we may request or provide information relating to tax reporting."
    },
    {
      title: "17. Fraud Prevention and Account Security",
      content: "BinnyCash uses security and fraud-prevention systems to protect users, advertisers, Offer Partners, and the platform. We may review information such as:",
      list: [
        "Account activity.",
        "Device information.",
        "IP information.",
        "Offer activity.",
        "Redemption behavior.",
        "Transaction history.",
        "Referral activity.",
        "Technical identifiers.",
        "Identity verification information.",
        "Partner-provided risk signals."
      ],
      postContent: "We may place rewards or accounts under review where activity appears inconsistent with legitimate platform use. For security reasons, we may not disclose detailed fraud-detection rules, thresholds, signals, or internal security methods."
    },
    {
      title: "18. Prohibited Activities",
      content: "You must use BinnyCash honestly and lawfully. You must not:",
      list: [
        "Create fraudulent accounts.",
        "Maintain multiple accounts to obtain additional rewards.",
        "Use bots or automated software.",
        "Automate offer completion.",
        "Manipulate clicks or conversions.",
        "Submit false information.",
        "Use stolen or unauthorized payment information.",
        "Impersonate another person.",
        "Manipulate surveys.",
        "Manipulate offer tracking.",
        "Abuse referral systems.",
        "Attempt to obtain duplicate rewards.",
        "Exploit bugs or technical vulnerabilities.",
        "Circumvent security controls.",
        "Interfere with BinnyCash systems.",
        "Reverse-engineer protected platform components.",
        "Upload malicious software.",
        "Conduct attacks against the platform.",
        "Use the Services for unlawful purposes.",
        "Engage in activity that may damage BinnyCash, its users, or its partners."
      ]
    },
    {
      title: "19. VPNs, Proxies and Location Manipulation",
      content: "Certain offers are available only to users in specific countries or regions. You must not use VPNs, proxies, remote environments, or other methods to falsely represent your location when doing so violates the applicable offer requirements. Attempting to bypass geographic restrictions may result in:",
      list: [
        "Offer disqualification.",
        "Reward reversal.",
        "Withdrawal restrictions.",
        "Account review.",
        "Account suspension or termination."
      ],
      postContent: "Some offers may have their own rules regarding VPNs or similar technologies. The individual offer requirements will apply."
    },
    {
      title: "20. Emulators and Modified Devices",
      content: "Some offers may require a genuine physical device and may prohibit:",
      list: [
        "Emulators.",
        "Simulators.",
        "Rooted devices.",
        "Jailbroken devices.",
        "Modified operating systems.",
        "Virtual environments."
      ],
      postContent: "If an offer prohibits these environments, activity performed through such environments may not qualify for rewards."
    },
    {
      title: "21. Missing Rewards",
      content: "If you believe you completed an eligible offer but did not receive the expected reward, you may contact BinnyCash Support. We may request:",
      list: [
        "Offer name.",
        "Offer ID.",
        "Date of completion.",
        "Screenshots.",
        "Order or transaction information.",
        "Confirmation details.",
        "Other relevant evidence."
      ],
      postContent: "We may submit the issue to the applicable Offer Partner for investigation. A missing-reward request does not guarantee that a reward will be credited."
    },
    {
      title: "22. Offer Partner Decisions",
      content: "Some conversion decisions are made using information provided by third-party Offer Partners. An Offer Partner may determine that an activity:",
      list: [
        "Was not completed.",
        "Was completed incorrectly.",
        "Was not eligible.",
        "Was duplicated.",
        "Was fraudulent.",
        "Was cancelled or reversed.",
        "Could not be verified."
      ],
      postContent: "Where BinnyCash cannot independently establish that an activity qualifies, we may rely on the applicable partner's available records, subject to applicable law and our dispute procedures."
    },
    {
      title: "23. Changes to Offers and Rewards",
      content: "BinnyCash may modify, pause, remove, or replace offers and reward opportunities. This may happen because:",
      list: [
        "An advertiser ends a campaign.",
        "An offer reaches its campaign limit.",
        "A partner changes its requirements.",
        "Geographic eligibility changes.",
        "A technical issue occurs.",
        "A reward provider becomes unavailable.",
        "Security or compliance concerns arise."
      ],
      postContent: "We do not guarantee that a particular offer or reward will remain available."
    },
    {
      title: "24. Referral Programs",
      content: "BinnyCash may offer referral or invitation programs. Referral rewards may be subject to additional requirements. You must not:",
      list: [
        "Create accounts for yourself through referral links.",
        "Create fake referral accounts.",
        "Spam referral links.",
        "Misrepresent BinnyCash.",
        "Use misleading advertising.",
        "Use automated referral activity.",
        "Manipulate referral attribution."
      ],
      postContent: "Additional referral terms may apply to specific campaigns."
    },
    {
      title: "25. Promotions and Contests",
      content: "BinnyCash may occasionally provide contests, promotional campaigns, giveaways, or other special programs. Such programs may have additional rules regarding:",
      list: [
        "Eligibility.",
        "Geographic restrictions.",
        "Entry requirements.",
        "Start and end dates.",
        "Prizes.",
        "Winner selection.",
        "Disqualification."
      ],
      postContent: "Where additional rules are provided, those rules form part of the applicable promotion."
    },
    {
      title: "26. User Content and Communications",
      content: "If BinnyCash allows users to submit reviews, comments, messages, profile information, or other content, you are responsible for the content you submit. You must not submit content that:",
      list: [
        "Is unlawful.",
        "Is fraudulent.",
        "Harasses another person.",
        "Contains threats.",
        "Contains malware.",
        "Infringes intellectual property rights.",
        "Violates privacy rights.",
        "Impersonates another person.",
        "Contains abusive or hateful material."
      ],
      postContent: "BinnyCash may remove content that violates these Terms or applicable law."
    },
    {
      title: "27. Intellectual Property",
      content: "The BinnyCash name, logo, website design, software, graphics, text, interfaces, databases, features, and other original materials are owned by or licensed to Weeo Media LLC or its applicable licensors. Except as expressly permitted by us, you may not:",
      list: [
        "Copy our platform.",
        "Reproduce our branding.",
        "Modify our software.",
        "Sell our content.",
        "Redistribute our proprietary materials.",
        "Reverse engineer protected components.",
        "Use BinnyCash trademarks without permission."
      ],
      postContent: "Third-party trademarks remain the property of their respective owners."
    },
    {
      title: "28. Third-Party Services",
      content: "BinnyCash may contain links, advertisements, offers, applications, payment services, or other integrations provided by third parties. Third-party services may have separate:",
      list: [
        "Terms.",
        "Privacy policies.",
        "Refund policies.",
        "Eligibility requirements."
      ],
      postContent: "BinnyCash does not control independent third-party services and is not responsible for their independent policies or operations."
    },
    {
      title: "29. Service Availability",
      content: "We work to keep BinnyCash available and reliable, but we do not guarantee uninterrupted access. Services may occasionally be unavailable because of:",
      list: [
        "Maintenance.",
        "Software updates.",
        "Security events.",
        "Infrastructure failures.",
        "Third-party service outages.",
        "Internet failures.",
        "Events beyond our reasonable control."
      ],
      postContent: "We may modify or temporarily suspend portions of the Services when reasonably necessary."
    },
    {
      title: "30. Account Reviews",
      content: "BinnyCash may conduct routine or targeted reviews to protect the platform and its users. During a review, we may request reasonable information or documentation relating to:",
      list: [
        "Identity.",
        "Account ownership.",
        "Offer completion.",
        "Transactions.",
        "Payment methods.",
        "Eligibility.",
        "Reward activity."
      ],
      postContent: "You agree to provide accurate information when reasonably requested. Failure to provide required information may result in temporary restrictions or other action permitted under these Terms."
    },
    {
      title: "31. Suspension and Termination",
      content: "We may suspend or terminate an account if we reasonably believe that:",
      list: [
        "These Terms have been violated.",
        "Fraud or abuse has occurred.",
        "Multiple accounts have been created improperly.",
        "Rewards have been manipulated.",
        "False information has been provided.",
        "Security has been compromised.",
        "Applicable law requires action.",
        "Continued access creates a material risk to BinnyCash or its users."
      ],
      postContent: "Where appropriate, we may allow an account review or appeal. Rewards associated with fraudulent or invalid activity may be cancelled or reversed."
    },
    {
      title: "32. Account Deletion",
      content: "You may request deletion of your BinnyCash account through the account deletion functionality provided by BinnyCash or by contacting: privacy@binnycash.com. Account deletion does not necessarily require immediate deletion of information that we are legally required or permitted to retain, including information needed for:",
      list: [
        "Fraud prevention.",
        "Security.",
        "Legal compliance.",
        "Accounting.",
        "Dispute resolution.",
        "Establishing or defending legal claims."
      ],
      postContent: "For additional information, please see our Privacy Policy."
    },
    {
      title: "33. Privacy",
      content: "Your use of BinnyCash is also governed by our Privacy Policy. Our Privacy Policy explains:",
      list: [
        "What information we collect.",
        "How we use information.",
        "How information may be shared.",
        "Cookie and tracking practices.",
        "Data retention.",
        "Your privacy rights.",
        "Account deletion."
      ]
    },
    {
      title: "34. Disclaimer",
      content: "To the fullest extent permitted by applicable law, BinnyCash provides the Services on an \"as available\" basis. We do not guarantee that:",
      list: [
        "Every offer will be available.",
        "Every user will qualify for every offer.",
        "Every activity will be successfully tracked.",
        "Every reward will be approved.",
        "Every payout method will always be available.",
        "The Services will always operate without interruption.",
        "Third-party services will always function correctly."
      ],
      postContent: "Nothing in these Terms excludes rights or protections that cannot legally be excluded under applicable law."
    },
    {
      title: "35. Limitation of Liability",
      content: "To the fullest extent permitted by applicable law, Weeo Media LLC and its affiliates, service providers, officers, employees, and contractors will not be responsible for indirect, incidental, special, consequential, or punitive losses arising from your use of the Services. This may include losses relating to:",
      list: [
        "Loss of data.",
        "Loss of expected rewards.",
        "Third-party service interruptions.",
        "Offer availability.",
        "Payment-provider delays.",
        "Unauthorized access caused by circumstances outside our reasonable control."
      ],
      postContent: "Nothing in these Terms limits liability that cannot legally be limited or excluded under applicable law."
    },
    {
      title: "36. Indemnification",
      content: "To the extent permitted by applicable law, you agree to be responsible for claims, losses, liabilities, costs, and reasonable expenses arising from:",
      list: [
        "Your violation of these Terms.",
        "Your unlawful use of BinnyCash.",
        "Your fraudulent or abusive activity.",
        "Your violation of another person's rights.",
        "Your misuse of the Services."
      ],
      postContent: "This section does not apply to the extent that the claim results from our own unlawful conduct or liability that cannot legally be transferred to you."
    },
    {
      title: "37. Governing Law",
      content: "These Terms are governed by the applicable laws governing the relationship between you and Weeo Media LLC, subject to mandatory consumer-protection and other rights that apply in your country or region. Nothing in this section is intended to remove or restrict rights that you are entitled to under mandatory applicable law. Where a dispute cannot be resolved informally, the parties may use the courts or other dispute-resolution mechanisms available under applicable law."
    },
    {
      title: "38. Dispute Resolution",
      content: "If you have a dispute or concern regarding BinnyCash, please contact us first so that we can attempt to resolve the matter.\n\nContact: support@binnycash.com\nFor privacy-related matters: privacy@binnycash.com\n\nWe encourage users to provide sufficient information about the issue so that our team can investigate it."
    },
    {
      title: "39. Changes to These Terms",
      content: "We may update these Terms when our Services, business model, legal requirements, or operational practices change. When we update these Terms, we will change the Last Updated date at the top of this page. Where required by applicable law, we may provide additional notice of material changes. Your continued use of BinnyCash after an updated version becomes effective constitutes acceptance of the revised Terms to the extent permitted by applicable law. If you do not agree with an updated version, you should stop using the Services."
    },
    {
      title: "40. Severability",
      content: "If any provision of these Terms is found to be invalid or unenforceable, that provision will be limited or removed only to the extent necessary. The remaining provisions will continue to apply to the fullest extent permitted by law."
    },
    {
      title: "41. Entire Agreement",
      content: "These Terms, together with the documents expressly incorporated into them, including:",
      list: [
        "Privacy Policy",
        "Cookie Policy",
        "Affiliate & Offer Policy",
        "Applicable promotion-specific terms",
        "Other applicable service-specific policies"
      ],
      postContent: "form the agreement governing your use of BinnyCash, except where additional terms expressly apply to a particular service."
    },
    {
      title: "42. Contact Us",
      content: "BinnyCash\nOperated by Weeo Media LLC\n5900 Balcones Drive STE 100\nAustin, TX 78731\nUnited States\n\nGeneral Support: support@binnycash.com\nPrivacy: privacy@binnycash.com\nWebsite: www.binnycash.com\n\n© 2026 Weeo Media LLC. All rights reserved."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0D14] text-[#F5F3FF] selection:bg-[#3B82F6]/30 relative overflow-x-hidden font-sans pb-20">
      
      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#3B82F6]/10 blur-[150px] rounded-full pointer-events-none z-0" />

      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 py-10 relative z-10">
        
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#8F95A3] uppercase tracking-wider mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#3B82F6]">Terms of Service</span>
        </div>

        {/* HERO BANNER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#101E35] to-[#111319] border border-[#3B82F6]/30 rounded-[24px] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden mb-10"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/10 blur-[50px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-16 h-16 rounded-[16px] bg-[#0E1015]/80 border border-white/10 flex items-center justify-center shrink-0 shadow-inner backdrop-blur-sm">
              <FileText className="w-8 h-8 text-[#3B82F6] drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">Terms of Service</h1>
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
            Welcome to BinnyCash. These Terms of Service ("Terms", "Terms of Service") govern your access to and use of the BinnyCash website, mobile application, rewards platform, offers, surveys, promotions, referral programs, redemption services, and related features (collectively, the "Services").
            <br /><br />
            BinnyCash is operated by Weeo Media LLC (5900 Balcones Drive STE 100, Austin, TX 78731, United States).
            <br /><br />
            By accessing or using BinnyCash, you agree to these Terms of Service and our Privacy Policy. If you do not agree with these Terms, you must not use the Services.
          </p>

          {sections.map((section, idx) => (
            <Section key={idx} title={section.title}>
              {section.content && (
                <p className="whitespace-pre-wrap">{section.content}</p>
              )}
              {section.list && (
                <BulletList>
                  {section.list.map((item, i) => (
                    <Bullet key={i}>{item}</Bullet>
                  ))}
                </BulletList>
              )}
              {section.postContent && (
                <p className="whitespace-pre-wrap mt-2">{section.postContent}</p>
              )}
            </Section>
          ))}

          <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-center gap-2 text-xs font-bold text-[#3B82F6] bg-[#3B82F6]/10 py-3 rounded-xl border border-[#3B82F6]/20">
             <ShieldCheck className="w-4 h-4" /> BinnyCash - Rewards Platform operated by Weeo Media LLC
          </div>
        </motion.div>

      </main>
    </div>
  );
}