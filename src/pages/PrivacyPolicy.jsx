import { Link } from "react-router-dom";
import "./Legal.css";

const SECTIONS = [
  { id: "overview", num: "01", label: "Overview" },
  { id: "data-collected", num: "02", label: "Information We Collect" },
  { id: "how-we-use", num: "03", label: "How We Use Your Data" },
  { id: "sharing", num: "04", label: "Third-Party Services & Data Sharing" },
  { id: "storage", num: "05", label: "How We Store & Protect Your Data" },
  { id: "retention", num: "06", label: "Data Retention & Deletion Policy" },
  { id: "liability", num: "07", label: "Liability, Integrity & Restrictions" },
  { id: "children", num: "08", label: "Age Restriction" },
  { id: "contact", num: "09", label: "Contact Us" },
];

export default function PrivacyPolicy() {
  return (
    <div className="legal-root">
      {/* Hero */}
      <div className="legal-hero">
        <div className="legal-hero-inner">
          <div className="legal-breadcrumb">
            <Link to="/">Home</Link>
            <span className="legal-breadcrumb-sep">›</span>
            <span>Privacy Policy</span>
          </div>
          <div className="legal-badge">
            <span className="legal-badge-dot" />
            Legal
          </div>
          <h1 className="legal-title">
            Privacy <span className="legal-title-accent">Policy</span>
          </h1>
          <p className="legal-subtitle">
            Your privacy matters to us. This policy explains what data we collect, why we collect it, and how we protect it across the Car24 platform.
          </p>
          <div className="legal-meta">
            <span className="legal-meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Effective: January 1, 2025
            </span>
            <span className="legal-meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Last updated: June 2025
            </span>
            <span className="legal-meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              GDPR & IT Act compliant
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="legal-layout">
        {/* TOC */}
        <aside className="legal-toc">
          <p className="legal-toc-title">On this page</p>
          <ul className="legal-toc-list">
            {SECTIONS.map(s => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.num} — {s.label}</a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Content */}
        <article className="legal-content">

          <div className="legal-section" id="overview">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 01</span>
                <h2 className="legal-section-title">Overview</h2>
              </div>
            </div>
            <p>To provide a secure and seamless car rental experience, Car24 ("we", "our", or "us") collects and processes your personal information in accordance with this Privacy Policy. This document describes how we collect, use, store, share, and protect your data when you use our car rental platform, website, or mobile application.</p>
            <p>By using Car24, you consent to the data practices described in this policy. If you do not agree, please discontinue use of our services.</p>
            <div className="legal-highlight">
              <p>🔒 Car24 does not sell your personal data to third parties. Your information is used solely to provide and improve our services, ensure safety, and comply with legal requirements.</p>
            </div>
          </div>

          <div className="legal-section" id="data-collected">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 02</span>
                <h2 className="legal-section-title">Information We Collect</h2>
              </div>
            </div>
            <p>To provide a secure and seamless car rental experience, we collect the following categories of information:</p>

            <p><strong style={{color:'#fff'}}>Personal Profile Data</strong></p>
            <ul className="legal-list">
              <li><span className="legal-list-dot" />First Name, Last Name</li>
              <li><span className="legal-list-dot" />Phone Number</li>
              <li><span className="legal-list-dot" />Date of Birth</li>
              <li><span className="legal-list-dot" />Anniversary/Marriage Date (optional)</li>
            </ul>

            <p><strong style={{color:'#fff'}}>Detailed Contact Data</strong></p>
            <ul className="legal-list">
              <li><span className="legal-list-dot" />Full residential address (Area, City, State, and Pincode)</li>
            </ul>

            <p><strong style={{color:'#fff'}}>KYC & Identity Verification</strong></p>
            <ul className="legal-list">
              <li><span className="legal-list-dot" /><strong>Driving License:</strong> Mandatory to legally verify driving eligibility and ensure safety</li>
              <li><span className="legal-list-dot" /><strong>Government ID:</strong> Aadhaar Card, PAN Card, or Passport (mandatory for establishing trust, identity verification, and fraud prevention)</li>
            </ul>

            <p><strong style={{color:'#fff'}}>Live Tracking & Telematics</strong></p>
            <ul className="legal-list">
              <li><span className="legal-list-dot" /><strong>Car GPS:</strong> Live location tracking of the physical vehicle via onboard GPS devices</li>
              <li><span className="legal-list-dot" /><strong>Mobile GPS:</strong> Background and foreground location tracking from your mobile device while a trip is active</li>
            </ul>

            <p><strong style={{color:'#fff'}}>Financial & Transactional Data</strong></p>
            <ul className="legal-list">
              <li><span className="legal-list-dot" />Booking history</li>
              <li><span className="legal-list-dot" />Payment logs</li>
              <li><span className="legal-list-dot" />Payout records</li>
              <li><span className="legal-list-dot" />Invoice details</li>
            </ul>

            <p><strong style={{color:'#fff'}}>Device Data & Permissions</strong></p>
            <ul className="legal-list">
              <li><span className="legal-list-dot" />Camera access — solely to upload required KYC documents</li>
              <li><span className="legal-list-dot" />Photo Gallery access — to capture pre-trip and post-trip photos of the vehicle's condition</li>
            </ul>
          </div>

          <div className="legal-section" id="how-we-use">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 03</span>
                <h2 className="legal-section-title">How We Use Your Data</h2>
              </div>
            </div>
            <p>We collect your information strictly for the following operational and legal purposes:</p>
            <ul className="legal-list">
              <li><span className="legal-list-dot" /><strong>Service Delivery:</strong> To authenticate your account, process bookings, unlock vehicles, and generate accurate invoices</li>
              <li><span className="legal-list-dot" /><strong>Safety & Security:</strong> GPS tracking (both car and mobile) is actively used to prevent vehicle theft, ensure your physical safety during the trip, and dispatch roadside assistance if needed</li>
              <li><span className="legal-list-dot" /><strong>Legal Compliance:</strong> KYC documents are collected and maintained to comply with local transport laws, motor vehicle acts, and insurance mandates</li>
              <li><span className="legal-list-dot" /><strong>Communication:</strong> To send essential operational updates, OTPs, invoices, and booking confirmations</li>
              <li><span className="legal-list-dot" /><strong>Marketing:</strong> To send promotional emails, discount offers, and SMS marketing (you may opt-out of marketing communications at any time; however, transactional alerts cannot be disabled)</li>
            </ul>
          </div>

          <div className="legal-section" id="sharing">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 04</span>
                <h2 className="legal-section-title">Third-Party Services & Data Sharing</h2>
              </div>
            </div>
            <p>We do not sell your personal data. We only share specific data points with vetted third-party partners required to operate our service:</p>
            <ul className="legal-list">
              <li><span className="legal-list-dot" /><strong>Notification Providers:</strong> We utilize Google Firebase and Expo Push Notification Services to deliver real-time alerts. We share necessary device push-tokens with them.</li>
              <li><span className="legal-list-dot" /><strong>Payment Gateways:</strong> We partner with secure payment gateways (e.g., Razorpay, Stripe, Cashfree). We do not store your raw credit/debit card numbers on our servers; these are handled directly by our compliant payment partners.</li>
              <li><span className="legal-list-dot" /><strong>Car Owners:</strong> If applicable to your booking, we share highly restricted, operational details (Booking Time, Car Model) with the vehicle owner. We never share your sensitive KYC documents or precise live location with them.</li>
              <li><span className="legal-list-dot" /><strong>Law Enforcement & Authorities:</strong> We will unequivocally share KYC, booking, and GPS tracking data with the Police, RTO, or legal authorities in the event of an accident, traffic violation, vehicle theft, or valid court order.</li>
            </ul>
          </div>

          <div className="legal-section" id="storage">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 05</span>
                <h2 className="legal-section-title">How We Store & Protect Your Data</h2>
              </div>
            </div>
            <p>We implement strict technical and organizational measures to ensure your data remains secure:</p>
            <ul className="legal-list">
              <li><span className="legal-list-dot" /><strong>Secure Infrastructure:</strong> All data is transmitted over encrypted channels (HTTPS/SSL) and stored securely in our relational databases (PostgreSQL).</li>
              <li><span className="legal-list-dot" /><strong>Automated Processing:</strong> Uploaded images and KYC documents are processed securely using automated cloud functions to extract necessary verification details and obscure sensitive visual data, ensuring minimal manual handling and maximum privacy.</li>
              <li><span className="legal-list-dot" /><strong>Mobile App Security:</strong> For mobile users, authentication tokens are heavily encrypted and stored in your device's native secure storage (Keychain for iOS / Keystore for Android).</li>
              <li><span className="legal-list-dot" /><strong>Web Security:</strong> For website users, authentication tokens are stored securely in encrypted Cookies.</li>
              <li><span className="legal-list-dot" /><strong>Active Sessions:</strong> While using the app, temporary data (like current trip navigation) is stored securely in your device's RAM and local storage to maintain seamless performance and offline safety.</li>
            </ul>
          </div>

          <div className="legal-section" id="retention">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 06</span>
                <h2 className="legal-section-title">Data Retention & Deletion Policy</h2>
              </div>
            </div>
            <p>You have the right to control your data, subject to legal and security constraints:</p>
            <ul className="legal-list">
              <li><span className="legal-list-dot" /><strong>The 30-Day Deletion Rule:</strong> You may request account deletion at any time via the Car24 app. Upon request, your account enters a "Pending Deletion" state. Your profile data will be permanently wiped 30 days after the request is initiated.</li>
              <li><span className="legal-list-dot" /><strong>Permanent Retention of Transactional Data:</strong> For accounting, taxation, legal compliance, and internal security purposes, Transactional Data (such as booking history, payment logs, and associated invoices) is never deleted.</li>
              <li><span className="legal-list-dot" /><strong>Fraud & Dispute Prevention:</strong> If an account is flagged for fraudulent activity, vehicle damage, or pending traffic fines, the deletion request will be paused indefinitely until the dispute or financial obligation is legally resolved.</li>
            </ul>
          </div>

          <div className="legal-section" id="liability">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 07</span>
                <h2 className="legal-section-title">Liability, Integrity & Restrictions</h2>
              </div>
            </div>
            <p><strong>Traffic Fines & Tolls Liability:</strong> By agreeing to this policy and using our vehicles, you explicitly grant Car24 the right to retain your data and pass it to relevant traffic authorities if a camera catches you speeding, committing a traffic violation, or skipping a toll during your active booking period.</p>
            <p><strong>App Integrity & Prohibited Misuse:</strong> The Car24 platform, its code, and systems are exclusive property. Users are strictly prohibited from reverse-engineering the app, scraping data, tampering with onboard vehicle GPS devices, or utilizing GPS spoofing applications to manipulate mobile location data. Such misuse will result in an immediate lifetime ban and potential civil/criminal legal action.</p>
            <div className="legal-warning">
              <p>⚠️ Any attempt to manipulate location tracking or tamper with vehicle GPS devices will result in immediate account termination and legal action.</p>
            </div>
          </div>

          <div className="legal-section" id="children">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 08</span>
                <h2 className="legal-section-title">Age Restriction</h2>
              </div>
            </div>
            <p>Our platform is strictly restricted to individuals aged 18 and above who hold a valid driving license. We do not knowingly collect or process data from minors. If we become aware that a minor has provided us with personal data, we will delete it promptly.</p>
            <p>If you believe a minor has registered on our platform, please contact us immediately at support@car24.in.</p>
          </div>

          <div className="legal-section" id="contact">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 09</span>
                <h2 className="legal-section-title">Contact Us</h2>
              </div>
            </div>
            <p>For any privacy-related questions, data requests, or concerns, please contact our Data Protection team:</p>
            <div className="legal-contact-card">
              <div>
                <p><strong>Car24 Privacy Team</strong></p>
                <p>support@car24.in</p>
              </div>
              <div className="legal-contact-links">
                <a href="mailto:support@car24.in" className="legal-contact-link primary">Email Us</a>
                <Link to="/contact" className="legal-contact-link ghost">Contact Page</Link>
              </div>
            </div>
          </div>

        </article>
      </div>

      <hr className="legal-divider" />

      {/* Related */}
      <div className="legal-related">
        <p className="legal-related-title">Related Policies</p>
        <div className="legal-related-grid">
          <Link to="/terms-of-service" className="legal-related-card">
            <div className="legal-related-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div>
              <h4>Terms of Service</h4>
              <p>Rules governing platform use</p>
            </div>
          </Link>
          <Link to="/cancellation-policy" className="legal-related-card">
            <div className="legal-related-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <h4>Cancellation Policy</h4>
              <p>Refund rules and timelines</p>
            </div>
          </Link>
          <Link to="/faq" className="legal-related-card">
            <div className="legal-related-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div>
              <h4>FAQ</h4>
              <p>Common questions answered</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}