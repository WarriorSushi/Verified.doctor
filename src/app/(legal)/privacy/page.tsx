import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

const baseUrl = "https://verified.doctor";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Verified.Doctor - How we collect, use, and protect your data",
  alternates: {
    canonical: `${baseUrl}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image
                src="/verified-doctor-logo.svg"
                alt="Verified.Doctor"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-lg font-semibold text-slate-800">
              verified<span className="text-sky-600">.doctor</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-slate-600 hover:text-sky-600 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-500 mb-8">Last updated: January 3, 2026</p>

          <div className="prose prose-slate max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Verified.Doctor (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy and is committed to protecting it through our compliance with this Privacy Policy.
            </p>
            <p>
              This Privacy Policy describes the types of information we may collect from you or that you may provide when you use our website and services (collectively, the &quot;Service&quot;), and our practices for collecting, using, maintaining, protecting, and disclosing that information.
            </p>
            <p>
              By using the Service, you consent to the collection, use, and disclosure of your information as described in this Privacy Policy.
            </p>

            <h2>2. Information We Collect</h2>

            <h3>2.1 Information You Provide</h3>
            <p>We collect information you provide directly to us, including:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, phone number, password, and professional credentials</li>
              <li><strong>Profile Information:</strong> Medical specialty, qualifications, clinic details, professional biography, photos, and other information you choose to include in your profile</li>
              <li><strong>Verification Documents:</strong> Medical registration certificates, identification documents, and other credentials submitted for verification</li>
              <li><strong>Communication Data:</strong> Messages you send or receive through our platform</li>
              <li><strong>Payment Information:</strong> Billing details and payment method information (processed by our payment providers)</li>
            </ul>

            <h3>2.2 Information Collected Automatically</h3>
            <p>When you use our Service, we automatically collect:</p>
            <ul>
              <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent on pages, click patterns, search queries</li>
              <li><strong>Location Data:</strong> Approximate location based on IP address</li>
              <li><strong>Cookies and Tracking:</strong> Information collected through cookies, web beacons, and similar technologies</li>
            </ul>

            <h3>2.3 Information from Third Parties</h3>
            <p>We may receive information about you from:</p>
            <ul>
              <li>Authentication providers (Google, email providers)</li>
              <li>Analytics providers</li>
              <li>Medical registration verification services</li>
              <li>Other users who connect with you on our platform</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect for various purposes, including:</p>

            <h3>3.1 Providing and Improving Services</h3>
            <ul>
              <li>Creating and managing your account</li>
              <li>Displaying your public profile to patients and other users</li>
              <li>Processing verification requests</li>
              <li>Facilitating connections between medical professionals</li>
              <li>Enabling patient-doctor communication</li>
              <li>Processing payments for premium services</li>
              <li>Providing customer support</li>
              <li>Improving and optimizing our Service</li>
            </ul>

            <h3>3.2 Analytics and Research</h3>
            <ul>
              <li>Analyzing usage patterns and trends</li>
              <li>Conducting research and development</li>
              <li>Creating anonymized and aggregated datasets</li>
              <li>Generating insights about healthcare industry trends</li>
            </ul>

            <h3>3.3 Communications</h3>
            <ul>
              <li>Sending service-related notifications</li>
              <li>Responding to your inquiries</li>
              <li>Sending marketing communications (with your consent)</li>
              <li>Providing important updates about the Service</li>
            </ul>

            <h3>3.4 Legal and Security</h3>
            <ul>
              <li>Protecting against fraud and abuse</li>
              <li>Enforcing our Terms of Service</li>
              <li>Complying with legal obligations</li>
              <li>Responding to legal requests and preventing harm</li>
            </ul>

            <h2>4. Information Sharing and Disclosure</h2>
            <p>
              We may share your information in the following circumstances:
            </p>

            <h3>4.1 Public Profile Information</h3>
            <p>
              Information you include in your public profile (name, specialty, clinic details, professional information) is publicly visible and may be indexed by search engines.
            </p>

            <h3>4.2 With Your Consent</h3>
            <p>
              We may share your information when you give us explicit consent to do so.
            </p>

            <h3>4.3 Service Providers</h3>
            <p>
              We share information with third-party vendors who provide services on our behalf, including:
            </p>
            <ul>
              <li>Cloud hosting and storage providers</li>
              <li>Payment processors</li>
              <li>Email and SMS service providers</li>
              <li>Analytics providers</li>
              <li>Customer support tools</li>
            </ul>

            <h3>4.4 Business Partners and Industry Partners</h3>
            <p className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <strong>Important:</strong> We may share anonymized, aggregated, or de-identified information with:
            </p>
            <ul>
              <li><strong>Pharmaceutical Companies:</strong> For research, market analysis, and understanding healthcare trends</li>
              <li><strong>Medical Device Manufacturers:</strong> For product development and market research</li>
              <li><strong>Healthcare Research Organizations:</strong> For academic and clinical research purposes</li>
              <li><strong>Healthcare Analytics Companies:</strong> For industry insights and benchmarking</li>
              <li><strong>Advertising Partners:</strong> For targeted advertising and marketing campaigns</li>
            </ul>
            <p>
              This shared data will not directly identify you without your explicit consent. However, we reserve the right to share identifiable information with business partners when you have opted in to specific programs or when required by our business operations.
            </p>

            <h3>4.5 Legal Requirements</h3>
            <p>We may disclose your information if required to do so by law or in response to:</p>
            <ul>
              <li>Court orders or legal processes</li>
              <li>Government or regulatory requests</li>
              <li>Protecting our rights, privacy, safety, or property</li>
              <li>Emergency situations involving potential threats to any person</li>
            </ul>

            <h3>4.6 Business Transfers</h3>
            <p>
              If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction. We will notify you of any change in ownership or uses of your personal information.
            </p>

            <h2>5. Data Retention</h2>
            <p>
              We retain your information for as long as your account is active or as needed to provide you services. We may retain certain information for longer periods for:
            </p>
            <ul>
              <li>Legal compliance and dispute resolution</li>
              <li>Fraud prevention and security</li>
              <li>Anonymized analytics and research</li>
              <li>Backup and disaster recovery</li>
            </ul>
            <p>
              Verification documents are retained for a minimum of 5 years after account termination for regulatory compliance purposes.
            </p>

            <h2>6. Cookies and Tracking Technologies</h2>
            <p>We use cookies and similar tracking technologies to:</p>
            <ul>
              <li>Remember your preferences and settings</li>
              <li>Authenticate your sessions</li>
              <li>Analyze usage patterns</li>
              <li>Deliver targeted advertising</li>
              <li>Measure advertising effectiveness</li>
            </ul>
            <p>
              You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of the Service.
            </p>

            <h2>7. Your Rights and Choices</h2>
            <p>Depending on your jurisdiction, you may have certain rights regarding your personal information:</p>

            <h3>7.1 Access and Portability</h3>
            <p>You may request access to the personal information we hold about you and receive it in a portable format.</p>

            <h3>7.2 Correction</h3>
            <p>You may update or correct inaccurate personal information through your account settings or by contacting us.</p>

            <h3>7.3 Deletion</h3>
            <p>You may request deletion of your personal information, subject to certain exceptions (legal requirements, ongoing disputes, etc.).</p>

            <h3>7.4 Opt-Out</h3>
            <p>You may opt out of:</p>
            <ul>
              <li>Marketing communications (via unsubscribe links or account settings)</li>
              <li>Certain data sharing (by contacting us)</li>
              <li>Targeted advertising (through browser/device settings)</li>
            </ul>

            <h3>7.5 Do Not Track</h3>
            <p>
              Our Service does not currently respond to &quot;Do Not Track&quot; browser signals.
            </p>

            <h2>8. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information, including:
            </p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and audits</li>
              <li>Access controls and authentication measures</li>
              <li>Employee training on data protection</li>
            </ul>
            <p>
              However, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security of your information.
            </p>

            <h2>9. International Data Transfers</h2>
            <p>
              Your information may be transferred to, stored, and processed in countries other than your country of residence, including India and other jurisdictions where our service providers operate. By using the Service, you consent to such transfers.
            </p>

            <h2>10. Children&apos;s Privacy</h2>
            <p>
              The Service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we learn we have collected information from a child, we will delete it.
            </p>

            <h2>11. Third-Party Links</h2>
            <p>
              Our Service may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to read their privacy policies.
            </p>

            <h2>12. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. Your continued use of the Service after any modifications indicates acceptance of the updated Privacy Policy.
            </p>

            <h2>13. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our privacy practices, please contact us through our <Link href="/contact" className="text-sky-600 hover:underline">Contact Page</Link>.
            </p>

            <h2>14. Additional Rights for Specific Jurisdictions</h2>

            <h3>For European Economic Area (EEA) Residents</h3>
            <p>
              If you are located in the EEA, you have additional rights under the General Data Protection Regulation (GDPR), including the right to lodge a complaint with a supervisory authority.
            </p>

            <h3>For California Residents</h3>
            <p>
              California residents have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information is collected and the right to opt out of the sale of personal information.
            </p>

            <h3>For Indian Residents</h3>
            <p>
              This Service operates in compliance with applicable Indian data protection laws, including the Information Technology Act, 2000 and its associated rules.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Verified.Doctor. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/terms" className="hover:text-sky-600">Terms</Link>
            <Link href="/privacy" className="hover:text-sky-600">Privacy</Link>
            <Link href="/contact" className="hover:text-sky-600">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
