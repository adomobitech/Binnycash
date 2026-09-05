'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileText, Mail, MapPin, Building, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="text-[19px] sm:text-xl font-black text-white mb-4 flex items-center gap-2">
      <div className="w-2 h-6 rounded-full bg-[#8B5CF6] shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
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
    <div className="w-1.5 h-1.5 rounded-full bg-[#00E57A] mt-2 shrink-0 shadow-[0_0_8px_rgba(0,229,122,0.8)]" />
    <span className="text-gray-300 font-medium">{children}</span>
  </li>
);

const NumberList = ({ children }: { children: React.ReactNode }) => (
  <ul className="space-y-2.5 mt-3 mb-3 ml-1">
    {children}
  </ul>
);

const NumBullet = ({ num, children }: { num: number | string, children: React.ReactNode }) => (
  <li className="flex items-start gap-3">
    <span className="font-black text-[#8B5CF6] text-sm mt-0.5">{num}.</span>
    <span className="text-gray-300 font-medium">{children}</span>
  </li>
);

export default function AffiliatePolicyPage() {
  return (
    <div className="min-h-screen bg-[#0B0D14] text-[#F5F3FF] selection:bg-[#8B5CF6]/30 relative overflow-x-hidden font-sans pb-20">
      
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#8B5CF6]/10 blur-[150px] rounded-full pointer-events-none z-0" />

      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 py-10 relative z-10">
        
        <div className="flex items-center gap-2 text-xs font-bold text-[#8F95A3] uppercase tracking-wider mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#8B5CF6]">Affiliate & Offer Policy</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#1A1035] to-[#111319] border border-[#8B5CF6]/30 rounded-[24px] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden mb-10"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B5CF6]/10 blur-[50px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-16 h-16 rounded-[16px] bg-[#0E1015]/80 border border-white/10 flex items-center justify-center shrink-0 shadow-inner backdrop-blur-sm">
              <FileText className="w-8 h-8 text-[#00E57A] drop-shadow-[0_0_10px_rgba(0,229,122,0.8)]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">Affiliate & Offer Policy</h1>
              <p className="text-[#8F95A3] text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" /> Last Updated: August 22, 2026
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#161821] border border-white/5 rounded-[24px] p-6 sm:p-10 shadow-xl"
        >
          <p className="text-[#8F95A3] text-[15px] font-medium leading-relaxed mb-10 pb-8 border-b border-white/10">
            This Affiliate & Offer Policy ("Policy") explains the rules that apply when you participate in affiliate offers, surveys, promotions, cashback activities, games, applications, trials, and other earning opportunities available through BinnyCash, operated by Weeo Media LLC ("BinnyCash", "we", "us", or "our").
            <br /><br />
            By participating in an offer through BinnyCash, you agree to this Policy, our Terms and Conditions, and our Privacy Policy.
          </p>

          <Section title="1. What Are Affiliate Offers?">
            <p>BinnyCash partners with third-party advertisers, affiliate networks, offer providers, survey providers, application developers, merchants, and other promotional partners ("Offer Partners").</p>
            <p>These partners may provide opportunities through which eligible users can earn rewards for completing specified actions. Examples may include:</p>
            <BulletList>
              <Bullet>Installing an application</Bullet>
              <Bullet>Registering for a service</Bullet>
              <Bullet>Completing a survey</Bullet>
              <Bullet>Reaching a specific level in a game</Bullet>
              <Bullet>Signing up for a promotion</Bullet>
              <Bullet>Making a qualifying purchase</Bullet>
              <Bullet>Submitting an eligible lead</Bullet>
              <Bullet>Completing a trial</Bullet>
              <Bullet>Watching or interacting with sponsored content</Bullet>
              <Bullet>Completing other advertiser-defined actions</Bullet>
            </BulletList>
            <p>The exact requirements for each offer are displayed on the relevant offer page.</p>
          </Section>

          <Section title="2. Offer Eligibility">
            <p>Each offer may have its own eligibility requirements. These may include:</p>
            <BulletList>
              <Bullet>Country or geographic location</Bullet>
              <Bullet>Age requirement</Bullet>
              <Bullet>New-user status</Bullet>
              <Bullet>Device type</Bullet>
              <Bullet>Operating system</Bullet>
              <Bullet>Previous registration with the advertiser</Bullet>
              <Bullet>Previous installation of an application</Bullet>
              <Bullet>Purchase requirements</Bullet>
              <Bullet>Payment requirements</Bullet>
              <Bullet>Specific promotional conditions</Bullet>
              <Bullet>Time limits</Bullet>
              <Bullet>Other advertiser-defined restrictions</Bullet>
            </BulletList>
            <p>An offer may not be available to every BinnyCash user. You are responsible for reviewing the offer requirements before starting an offer.</p>
          </Section>

          <Section title="3. One Account Per Person">
            <p>Unless expressly permitted by BinnyCash, each person may maintain only one BinnyCash account. You must not create multiple accounts to:</p>
            <BulletList>
              <Bullet>Claim the same offer multiple times</Bullet>
              <Bullet>Receive duplicate rewards</Bullet>
              <Bullet>Circumvent offer restrictions</Bullet>
              <Bullet>Bypass account restrictions</Bullet>
              <Bullet>Exploit promotional campaigns</Bullet>
              <Bullet>Manipulate referral programs</Bullet>
              <Bullet>Obtain rewards through fraudulent activity</Bullet>
            </BulletList>
            <p>Multiple accounts associated with the same individual, device, payment method, identity, household, or other indicators may be reviewed for potential abuse where appropriate.</p>
          </Section>

          <Section title="4. Offer Tracking">
            <p>BinnyCash and its Offer Partners may use tracking technologies to determine whether an offer has been properly completed. Tracking may involve:</p>
            <BulletList>
              <Bullet>Click identifiers</Bullet>
              <Bullet>Attribution identifiers</Bullet>
              <Bullet>Device identifiers</Bullet>
              <Bullet>Advertising identifiers</Bullet>
              <Bullet>Cookies</Bullet>
              <Bullet>SDKS</Bullet>
              <Bullet>Conversion tracking</Bullet>
              <Bullet>Postback notifications</Bullet>
              <Bullet>Referral parameters</Bullet>
              <Bullet>Other technical attribution methods</Bullet>
            </BulletList>
            <p>Tracking is necessary to determine whether a completed action can be attributed to BinnyCash. If tracking fails or an Offer Partner does not report a qualifying completion, BinnyCash may not be able to credit the reward.</p>
          </Section>

          <Section title="5. Start an Offer Correctly">
            <p>To maximize the likelihood of successful tracking:</p>
            <NumberList>
              <NumBullet num={1}>Open the offer through BinnyCash.</NumBullet>
              <NumBullet num={2}>Read all offer requirements before starting.</NumBullet>
              <NumBullet num={3}>Follow the advertiser's instructions exactly.</NumBullet>
              <NumBullet num={4}>Complete the required action within the stated time period.</NumBullet>
              <NumBullet num={5}>Avoid using prohibited methods or devices.</NumBullet>
              <NumBullet num={6}>Do not attempt to manipulate tracking or attribution.</NumBullet>
            </NumberList>
            <p>If an offer requires a new installation or new customer status, you must meet those requirements.</p>
          </Section>

          <Section title="6. Offer Completion Requirements">
            <p>A reward is earned only when the Offer Partner confirms that the required action has been successfully completed. Simply clicking an offer, installing an application, registering an account, or starting an activity does not necessarily guarantee a reward.</p>
            <p>Some offers require additional conditions such as:</p>
            <BulletList>
              <Bullet>Completing a specific game level</Bullet>
              <Bullet>Completing a survey</Bullet>
              <Bullet>Making a qualifying purchase</Bullet>
              <Bullet>Maintaining an account for a specified period</Bullet>
              <Bullet>Completing multiple steps</Bullet>
              <Bullet>Meeting advertiser-defined eligibility requirements</Bullet>
            </BulletList>
            <p>Always review the individual offer description.</p>
          </Section>

          <Section title="7. Reward Pending Status">
            <p>Some rewards may initially appear as: <strong>Pending</strong>.</p>
            <p>A pending reward means that the activity has been detected or reported but has not yet been fully confirmed by the relevant Offer Partner. Pending periods may vary depending on the offer and partner.</p>
            <p>During this period, BinnyCash may perform:</p>
            <BulletList>
              <Bullet>Tracking verification</Bullet>
              <Bullet>Fraud checks</Bullet>
              <Bullet>Advertiser confirmation</Bullet>
              <Bullet>Eligibility checks</Bullet>
              <Bullet>Transaction verification</Bullet>
            </BulletList>
            <p>A pending reward is not a guarantee that the reward will ultimately become payable.</p>
          </Section>

          <Section title="8. Reward Approval">
            <p>A reward becomes available for withdrawal only after the required verification and approval process has been completed. BinnyCash may reject or reverse a reward when:</p>
            <BulletList>
              <Bullet>The advertiser rejects the conversion.</Bullet>
              <Bullet>The offer requirements were not satisfied.</Bullet>
              <Bullet>Tracking information is incomplete.</Bullet>
              <Bullet>The user was not eligible.</Bullet>
              <Bullet>The transaction was cancelled or refunded.</Bullet>
              <Bullet>The advertiser reports fraudulent activity.</Bullet>
              <Bullet>The activity violates the offer terms.</Bullet>
              <Bullet>Duplicate attribution is detected.</Bullet>
              <Bullet>The activity cannot be reliably verified.</Bullet>
            </BulletList>
          </Section>

          <Section title="9. Reward Reversals">
            <p>An approved or pending reward may be reversed if the underlying transaction is later cancelled, refunded, rejected, charged back, determined to be fraudulent, or otherwise invalidated by the Offer Partner.</p>
            <p>Examples include:</p>
            <BulletList>
              <Bullet>Cancelled subscriptions</Bullet>
              <Bullet>Refunded purchases</Bullet>
              <Bullet>Invalid leads</Bullet>
              <Bullet>Chargebacks</Bullet>
              <Bullet>Rejected applications</Bullet>
              <Bullet>Fraudulent conversions</Bullet>
              <Bullet>Duplicate conversions</Bullet>
              <Bullet>Violations of advertiser terms</Bullet>
            </BulletList>
            <p>BinnyCash may adjust the user's reward balance to reflect such reversals.</p>
          </Section>

          <Section title="10. Offer-Specific Terms">
            <p>Certain offers may have additional terms imposed by the advertiser or Offer Partner. For example, an advertiser may require:</p>
            <BulletList>
              <Bullet>New customers only</Bullet>
              <Bullet>Specific countries</Bullet>
              <Bullet>Specific devices</Bullet>
              <Bullet>Minimum purchase amounts</Bullet>
              <Bullet>Specific subscription periods</Bullet>
              <Bullet>Specific completion deadlines</Bullet>
              <Bullet>No previous account with the advertiser</Bullet>
            </BulletList>
            <p>If an offer's individual terms conflict with general promotional descriptions, the specific offer requirements will apply to that offer.</p>
          </Section>

          <Section title="11. Prohibited Activities">
            <p>Users must not attempt to generate rewards through fraudulent, deceptive, automated, or manipulative methods. Prohibited activities include, but are not limited to:</p>
            <BulletList>
              <Bullet>Creating multiple accounts</Bullet>
              <Bullet>Using bots or automated scripts</Bullet>
              <Bullet>Fake registrations</Bullet>
              <Bullet>Fake information</Bullet>
              <Bullet>Manipulating attribution</Bullet>
              <Bullet>Cookie stuffing</Bullet>
              <Bullet>Click manipulation</Bullet>
              <Bullet>Forced clicks</Bullet>
              <Bullet>Fake leads</Bullet>
              <Bullet>Incentivizing users outside approved campaigns</Bullet>
              <Bullet>Using stolen payment information</Bullet>
              <Bullet>Using another person's identity</Bullet>
              <Bullet>Manipulating device identifiers</Bullet>
              <Bullet>Circumventing geographic restrictions</Bullet>
              <Bullet>Attempting to bypass advertiser eligibility requirements</Bullet>
              <Bullet>Exploiting technical errors</Bullet>
              <Bullet>Self-referrals where prohibited</Bullet>
              <Bullet>Fraudulent referrals</Bullet>
              <Bullet>Chargeback abuse</Bullet>
              <Bullet>Any activity intended to generate rewards without genuinely completing the required action</Bullet>
            </BulletList>
          </Section>

          <Section title="12. VPN, Proxy and Location Manipulation">
            <p>Some offers are restricted to specific countries or geographic locations. Using VPNs, proxies, remote devices, emulators, or other technologies to misrepresent your location or bypass offer restrictions may result in:</p>
            <BulletList>
              <Bullet>Offer disqualification</Bullet>
              <Bullet>Reward reversal</Bullet>
              <Bullet>Account review</Bullet>
              <Bullet>Withdrawal restrictions</Bullet>
              <Bullet>Account suspension or termination</Bullet>
            </BulletList>
            <p>Certain offers may expressly permit VPNs or similar technologies. In such cases, the individual offer terms will apply.</p>
          </Section>

          <Section title="13. Emulators and Modified Devices">
            <p>Certain offers may not support:</p>
            <BulletList>
              <Bullet>Android emulators</Bullet>
              <Bullet>iOS simulators</Bullet>
              <Bullet>Rooted devices</Bullet>
              <Bullet>Jailbroken devices</Bullet>
              <Bullet>Modified operating systems</Bullet>
              <Bullet>Virtualized environments</Bullet>
            </BulletList>
            <p>If an offer specifically prohibits these environments, completion from such an environment may not qualify for a reward.</p>
          </Section>

          <Section title="14. Advertiser and Third-Party Tracking">
            <p>Offers may be hosted, tracked, or fulfilled by third-party Offer Partners. BinnyCash does not control every aspect of third-party tracking systems.</p>
            <p>If an Offer Partner fails to report a conversion, BinnyCash may be unable to independently confirm the completion. Where appropriate, BinnyCash may submit a missing-reward inquiry to the relevant Offer Partner.</p>
          </Section>

          <Section title="15. Missing Rewards">
            <p>If you believe you completed an offer but did not receive the expected reward, you may contact BinnyCash Support. When submitting a missing-reward request, you may be asked to provide:</p>
            <BulletList>
              <Bullet>Offer name</Bullet>
              <Bullet>Offer ID</Bullet>
              <Bullet>Date of completion</Bullet>
              <Bullet>Approximate completion time</Bullet>
              <Bullet>Relevant screenshots</Bullet>
              <Bullet>Transaction information</Bullet>
              <Bullet>Order or confirmation number</Bullet>
              <Bullet>Other information reasonably required to investigate the issue</Bullet>
            </BulletList>
            <p>BinnyCash may forward the inquiry to the relevant Offer Partner. A missing-reward request does not guarantee that a reward will be issued.</p>
          </Section>

          <Section title="16. Investigation of Missing Rewards">
            <p>BinnyCash may investigate missing-reward claims using information received from the relevant Offer Partner. The final determination may depend on:</p>
            <BulletList>
              <Bullet>Advertiser tracking data</Bullet>
              <Bullet>Attribution records</Bullet>
              <Bullet>Conversion logs</Bullet>
              <Bullet>Technical information</Bullet>
              <Bullet>Offer eligibility</Bullet>
              <Bullet>Transaction records</Bullet>
              <Bullet>Fraud-prevention results</Bullet>
            </BulletList>
            <p>Where the Offer Partner confirms that a qualifying conversion occurred, BinnyCash may credit the applicable reward. Where the Offer Partner determines that the conversion was invalid or cannot be verified, BinnyCash may be unable to issue the reward.</p>
          </Section>

          <Section title="17. Advertiser Changes">
            <p>Offer Partners may:</p>
            <BulletList>
              <Bullet>Change offer requirements</Bullet>
              <Bullet>Reduce or increase reward amounts</Bullet>
              <Bullet>Pause campaigns</Bullet>
              <Bullet>End campaigns</Bullet>
              <Bullet>Change geographic eligibility</Bullet>
              <Bullet>Reject conversions</Bullet>
              <Bullet>Change tracking requirements</Bullet>
            </BulletList>
            <p>BinnyCash does not guarantee that a particular offer will remain available for a specific period. We recommend reviewing the current offer terms before starting an activity.</p>
          </Section>

          <Section title="18. Reward Amounts">
            <p>The reward amount displayed on BinnyCash may depend on the applicable campaign, advertiser, country, user eligibility, and other factors. Reward amounts may change without prior notice when permitted by the applicable campaign terms.</p>
            <p>Once a qualifying reward has been properly confirmed and credited, BinnyCash will generally honor the displayed reward unless the transaction is later determined to be invalid, fraudulent, reversed, or otherwise ineligible.</p>
          </Section>

          <Section title="19. Referral and Affiliate Rewards">
            <p>If BinnyCash offers referral or affiliate-based rewards, additional conditions may apply. Referral rewards may require:</p>
            <BulletList>
              <Bullet>A valid referral</Bullet>
              <Bullet>A new eligible user</Bullet>
              <Bullet>Completion of qualifying activity</Bullet>
              <Bullet>Compliance with campaign rules</Bullet>
              <Bullet>Successful verification</Bullet>
            </BulletList>
            <p>Users must not use spam, misleading advertising, fake accounts, paid traffic, or unauthorized promotional methods to generate referral rewards where prohibited.</p>
          </Section>

          <Section title="20. Withdrawal and Redemption">
            <p>Earning a reward does not necessarily mean that it is immediately available for withdrawal. Withdrawals may be subject to:</p>
            <BulletList>
              <Bullet>Minimum withdrawal limits</Bullet>
              <Bullet>Account verification</Bullet>
              <Bullet>Identity verification</Bullet>
              <Bullet>Fraud review</Bullet>
              <Bullet>Reward approval</Bullet>
              <Bullet>Payment-provider requirements</Bullet>
              <Bullet>Geographic availability</Bullet>
              <Bullet>Additional eligibility requirements</Bullet>
            </BulletList>
            <p>BinnyCash may delay a withdrawal while a security, fraud, identity, or transaction review is in progress.</p>
          </Section>

          <Section title="21. Account Restrictions">
            <p>BinnyCash may temporarily restrict an account when we reasonably believe that:</p>
            <BulletList>
              <Bullet>Fraud may have occurred</Bullet>
              <Bullet>Multiple accounts are being used</Bullet>
              <Bullet>Offer manipulation is suspected</Bullet>
              <Bullet>Reward abuse is suspected</Bullet>
              <Bullet>Identity information is inaccurate</Bullet>
              <Bullet>Payment information appears suspicious</Bullet>
              <Bullet>The user has violated an offer's terms</Bullet>
              <Bullet>The user has violated BinnyCash policies</Bullet>
            </BulletList>
            <p>During a review, withdrawals or rewards may be temporarily unavailable.</p>
          </Section>

          <Section title="22. Account Suspension or Termination">
            <p>BinnyCash may suspend or terminate accounts involved in serious or repeated violations of this Policy, our Terms and Conditions, or applicable offer requirements.</p>
            <p>Where appropriate and legally permitted, we may allow users to appeal an account decision. Fraudulent or abusive activity may result in the cancellation or reversal of associated rewards.</p>
          </Section>

          <Section title="23. No Guarantee of Offer Availability">
            <p>BinnyCash does not guarantee that:</p>
            <BulletList>
              <Bullet>A particular offer will always be available.</Bullet>
              <Bullet>Every user will qualify for every offer.</Bullet>
              <Bullet>Every completed action will generate a reward.</Bullet>
              <Bullet>Third-party tracking will always function correctly.</Bullet>
              <Bullet>An advertiser will approve every conversion.</Bullet>
            </BulletList>
            <p>Offers are subject to advertiser availability, eligibility, tracking, and verification.</p>
          </Section>

          <Section title="24. Third-Party Terms">
            <p>When completing an offer, you may also be required to agree to the terms, privacy policy, or other conditions of the relevant advertiser or Offer Partner. BinnyCash is not responsible for independent third-party services, products, websites, applications, or policies. You should review the applicable third-party terms before participating.</p>
          </Section>

          <Section title="25. Policy Enforcement">
            <p>BinnyCash reserves the right to investigate activity and take reasonable action when we identify suspected fraud, abuse, manipulation, or violations of this Policy. Our actions may include:</p>
            <BulletList>
              <Bullet>Rejecting a reward</Bullet>
              <Bullet>Placing a reward on hold</Bullet>
              <Bullet>Reversing a reward</Bullet>
              <Bullet>Restricting an offer</Bullet>
              <Bullet>Restricting withdrawals</Bullet>
              <Bullet>Suspending an account</Bullet>
              <Bullet>Terminating an account</Bullet>
              <Bullet>Reporting unlawful activity where required</Bullet>
            </BulletList>
          </Section>

          <Section title="26. Changes to This Policy">
            <p>We may update this Affiliate & Offer Policy from time to time to reflect changes to our Services, Offer Partners, technology, business practices, or applicable requirements. The updated version will be published on this page with a revised "Last Updated" date.</p>
          </Section>

          <Section title="27. Contact Us">
            <p>If you have questions about an offer, reward, tracking issue, or this Policy, please contact BinnyCash Support:</p>
            <div className="mt-4 bg-[#111319] p-5 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#8B5CF6] mt-0.5" />
                <div>
                  <h4 className="text-white font-bold text-sm">Email</h4>
                  <p className="text-[#8F95A3]">support@binnycash.com</p>
                  <p className="text-[#8F95A3] mt-1">For privacy-related matters: privacy@binnycash.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-[#8B5CF6] mt-0.5" />
                <div>
                  <h4 className="text-white font-bold text-sm">Company</h4>
                  <p className="text-[#8F95A3]">Weeo Media LLC</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#8B5CF6] mt-0.5" />
                <div>
                  <h4 className="text-white font-bold text-sm">Address</h4>
                  <p className="text-[#8F95A3]">5900 Balcones Drive STE 100<br />Austin, TX 78731<br />United States</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-[#8B5CF6] bg-[#8B5CF6]/10 py-3 rounded-xl border border-[#8B5CF6]/20">
              <ShieldCheck className="w-4 h-4" /> BinnyCash - Rewards & Offers Platform operated by Weeo Media LLC
            </div>
          </Section>

        </motion.div>
      </main>
    </div>
  );
}