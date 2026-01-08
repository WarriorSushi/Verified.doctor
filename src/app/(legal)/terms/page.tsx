import { Metadata } from "next";
import Link from "next/link";

const baseUrl = "https://verified.doctor";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Verified.Doctor - The Blue Checkmark for Medical Professionals",
  alternates: {
    canonical: `${baseUrl}/terms`,
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-slate-500 mb-8">Last updated: January 3, 2026</p>

        <div className="prose prose-slate max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Verified.Doctor (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to all the terms and conditions, you must not access or use the Service.
          </p>
          <p>
            These Terms constitute a legally binding agreement between you and Verified.Doctor (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). We reserve the right to modify these Terms at any time. Your continued use of the Service after any modifications constitutes acceptance of the updated Terms.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Verified.Doctor is a digital identity and reputation management platform for medical professionals. The Service allows doctors to:
          </p>
          <ul>
            <li>Create and maintain a verified professional profile</li>
            <li>Receive patient recommendations</li>
            <li>Connect with other medical professionals</li>
            <li>Receive patient inquiries through our messaging system</li>
            <li>Display verification badges upon credential verification</li>
          </ul>
          <p>
            The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied.
          </p>

          <h2>3. Eligibility and Registration</h2>
          <p>
            To use the Service, you must:
          </p>
          <ul>
            <li>Be at least 18 years of age</li>
            <li>Be a licensed medical professional or authorized representative</li>
            <li>Provide accurate, complete, and current registration information</li>
            <li>Maintain the security of your account credentials</li>
          </ul>
          <p>
            We reserve the right to refuse service, terminate accounts, or remove content at our sole discretion without prior notice or liability.
          </p>

          <h2>4. User Content and Conduct</h2>
          <p>
            You are solely responsible for all content you post, upload, or display on the Service (&quot;User Content&quot;). By posting User Content, you represent and warrant that:
          </p>
          <ul>
            <li>You have all necessary rights to post such content</li>
            <li>The content is accurate and not misleading</li>
            <li>The content does not violate any applicable laws or regulations</li>
            <li>The content does not infringe any third-party rights</li>
          </ul>
          <p>
            You grant us a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform your User Content in connection with the Service and our business operations.
          </p>

          <h2>5. Verification Process</h2>
          <p>
            Our verification process involves manual review of submitted credentials. We do not guarantee:
          </p>
          <ul>
            <li>Approval of any verification request</li>
            <li>Specific timeframes for verification decisions</li>
            <li>The accuracy of verification beyond our reasonable review</li>
          </ul>
          <p>
            Verification status may be revoked at any time if we determine that credentials were falsified, have expired, or the user has violated these Terms.
          </p>

          <h2>6. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by Verified.Doctor and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>
          <p>
            You may not copy, modify, distribute, sell, or lease any part of our Service or included software, nor may you reverse engineer or attempt to extract the source code of that software.
          </p>

          <h2>7. Payment Terms</h2>
          <p>
            Certain features of the Service may require payment. By subscribing to paid services:
          </p>
          <ul>
            <li>You agree to pay all fees associated with your subscription</li>
            <li>Fees are non-refundable except as required by law</li>
            <li>We may change our fees upon reasonable notice</li>
            <li>Failure to pay may result in suspension or termination of your account</li>
          </ul>
          <p>
            All purchases are final. We do not offer refunds for partial subscription periods or unused features.
          </p>

          <h2>8. Disclaimer of Warranties</h2>
          <p className="uppercase font-semibold">
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT ANY WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
          </p>
          <p>
            We do not warrant that: (a) the Service will function uninterrupted, secure, or available at any particular time or location; (b) any errors or defects will be corrected; (c) the Service is free of viruses or other harmful components; or (d) the results of using the Service will meet your requirements.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p className="uppercase font-semibold">
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL VERIFIED.DOCTOR, ITS AFFILIATES, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO THE USE OF, OR INABILITY TO USE, THE SERVICE.
          </p>
          <p>
            IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS RELATING TO THE SERVICE EXCEED THE AMOUNT PAID BY YOU TO US DURING THE TWELVE (12) MONTHS PRIOR TO THE CLAIM, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
          </p>
          <p>
            SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF LIABILITY FOR CONSEQUENTIAL OR INCIDENTAL DAMAGES, SO THE ABOVE LIMITATION MAY NOT APPLY TO YOU.
          </p>

          <h2>10. Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless Verified.Doctor, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys&apos; fees) arising out of or relating to:
          </p>
          <ul>
            <li>Your violation of these Terms</li>
            <li>Your User Content</li>
            <li>Your use of the Service</li>
            <li>Your violation of any third-party rights</li>
          </ul>

          <h2>11. Third-Party Links and Services</h2>
          <p>
            The Service may contain links to third-party websites or services that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
          </p>

          <h2>12. Data Usage and Privacy</h2>
          <p>
            Your use of the Service is also governed by our Privacy Policy. By using the Service, you consent to our collection, use, and disclosure of your information as described in the Privacy Policy, including:
          </p>
          <ul>
            <li>Sharing anonymized and aggregated data with third parties for research, analytics, and business purposes</li>
            <li>Sharing data with healthcare industry partners, pharmaceutical companies, and medical device manufacturers for legitimate business purposes</li>
            <li>Using your data to improve our services and develop new features</li>
          </ul>

          <h2>13. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
          </p>
          <p>
            Upon termination, your right to use the Service will immediately cease. All provisions of the Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
          </p>

          <h2>14. Governing Law and Dispute Resolution</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
          </p>
          <p>
            Any dispute arising from or relating to these Terms or the Service shall be resolved through binding arbitration in accordance with the Arbitration and Conciliation Act, 1996, as amended. The arbitration shall be conducted in Bangalore, India, in the English language.
          </p>

          <h2>15. Severability</h2>
          <p>
            If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law, and the remaining provisions will continue in full force and effect.
          </p>

          <h2>16. Entire Agreement</h2>
          <p>
            These Terms, together with the Privacy Policy and any other legal notices published by us on the Service, constitute the entire agreement between you and Verified.Doctor concerning the Service and supersede all prior agreements.
          </p>

          <h2>17. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us through our <Link href="/contact" className="text-sky-600 hover:underline">Contact Page</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
