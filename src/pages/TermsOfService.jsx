import { Link } from "react-router-dom";
import "./Legal.css";

const SECTIONS = [
  { id: "overview", num: "01", label: "Overview" },
  { id: "eligibility", num: "02", label: "Eligibility" },
  { id: "booking-payment", num: "03", label: "Booking and Payment" },
  { id: "custody", num: "04", label: "Vehicle Custody and Customer Responsibility" },
  { id: "important-notice", num: "05", label: "Important Notice" },
  { id: "additional-charges", num: "06", label: "Additional Charges and Deductions" },
  { id: "inspection", num: "07", label: "Vehicle Condition, Inspection, and Evidence" },
  { id: "prohibited-use", num: "08", label: "Prohibited Use" },
  { id: "cancellation-extension", num: "09", label: "Cancellation and Extension" },
  { id: "suspension", num: "10", label: "Suspension and Termination" },
  { id: "limitation", num: "11", label: "Limitation of Liability" },
  { id: "force-majeure", num: "12", label: "Force Majeure" },
  { id: "third-party", num: "13", label: "Third-Party Services" },
  { id: "intellectual-property", num: "14", label: "Intellectual Property" },
  { id: "changes", num: "15", label: "Changes to Terms" },
  { id: "privacy", num: "16", label: "Privacy Policy" },
  { id: "governing-law", num: "17", label: "Governing Law and Jurisdiction" },
  { id: "contact", num: "18", label: "Contact" },
];

export default function TermsOfService() {
  return (
    <div className="legal-root">
      {/* Hero */}
      <div className="legal-hero">
        <div className="legal-hero-inner">
          <div className="legal-breadcrumb">
            <Link to="/">Home</Link>
            <span className="legal-breadcrumb-sep">›</span>
            <span>Terms of Service</span>
          </div>
          <div className="legal-badge">
            <span className="legal-badge-dot" />
            Legal
          </div>
          <h1 className="legal-title">
            Terms and <span className="legal-title-accent">Conditions</span>
          </h1>
          <p className="legal-subtitle">
            Please read these terms carefully before using Car24 Travels' platform. By accessing or booking through our service, you agree to be bound by these terms.
          </p>
          <div className="legal-meta">
            <span className="legal-meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Effective: April 2026
            </span>
            <span className="legal-meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Last updated: April 2026
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
            <p>These Terms and Conditions govern your use of the Car24 Travels platform, including our website, mobile application, and related services. By using our services, you agree to be bound by these terms.</p>
          </div>

          <div className="legal-section" id="eligibility">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 02</span>
                <h2 className="legal-section-title">Eligibility</h2>
              </div>
            </div>
            <p>The customer must:</p>
            <ul className="legal-list">
              <li><span className="legal-list-dot" />Provide correct and complete information.</li>
              <li><span className="legal-list-dot" />Possess a valid driving license, where driving is required.</li>
              <li><span className="legal-list-dot" />Be legally competent to enter into a binding contract.</li>
            </ul>
          </div>

          <div className="legal-section" id="booking-payment">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 03</span>
                <h2 className="legal-section-title">Booking and Payment</h2>
              </div>
            </div>
            <p>All bookings are subject to availability and verification. The final amount, advance payment, penalties, extension charges, and any other fees shown in the app/website or invoice will apply. Payment confirmation, booking confirmation number, and booking status shown in the system shall be treated as the official record.</p>
          </div>

          <div className="legal-section" id="custody">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2H2v10l9 9 10-10-9-9z"/><path d="M7 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 04</span>
                <h2 className="legal-section-title">Vehicle Custody and Customer Responsibility</h2>
              </div>
            </div>
            <p>The customer accepts full responsibility for the vehicle while it is in the customer's custody.</p>
            <ol className="legal-list-ordered">
              <li>The customer agrees that they are responsible for any damage while the vehicle is under their custody and will bear all expenses incurred thereto.</li>
              <li>If the car is not returned before the return time, Car24 Travels may take lawful steps to recover possession of the vehicle.</li>
              <li>In case of car damage, the customer is solely responsible for the repair cost required to bring the car back to its original condition.</li>
              <li>If necessary, the customer agrees to come to the police station, showroom, or any other place until the car is restored to original condition, and the customer shall bear the rental charges during the repair period until the car is repaired.</li>
              <li>The customer is responsible for any police case during the booking period and agrees that during any such police case, the daily rent for the car will be borne by the customer.</li>
            </ol>
            <div className="legal-warning">
              <p>⚠️ You are fully responsible for the vehicle during your custody period, including all damage, repair costs, and rental charges during repair periods.</p>
            </div>
          </div>

          <div className="legal-section" id="important-notice">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 05</span>
                <h2 className="legal-section-title">Important Notice</h2>
              </div>
            </div>
            <ol className="legal-list-ordered">
              <li>Car24 Travels is not responsible for FASTag recharge issues or FASTag not working.</li>
              <li>If the car is not returned within the booking time, an extension fee of <strong style={{color:'#fff'}}>150/- per hour for 5-seater vehicles</strong> and <strong style={{color:'#fff'}}>200/- per hour for 7-seater vehicles</strong> shall be payable in addition to rental charges.</li>
              <li>In case the customer has to extend the booking from 12 hours to 24 hours, an extra booking charge of <strong style={{color:'#fff'}}>500/-</strong> shall be payable.</li>
              <li>The customer is solely responsible for any antisocial activity, criminal activity, or illegal activity committed while using the vehicle. Neither Car24 Travels nor the car owner shall be responsible for such activities.</li>
            </ol>
            <div className="legal-highlight">
              <p>⏰ Late return fees: ₹150/hour for 5-seater, ₹200/hour for 7-seater. Extending from 12h to 24h incurs ₹500 extra.</p>
            </div>
          </div>

          <div className="legal-section" id="additional-charges">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 06</span>
                <h2 className="legal-section-title">Additional Charges and Deductions</h2>
              </div>
            </div>
            <p>The customer may also be liable for:</p>
            <ul className="legal-list">
              <li><span className="legal-list-dot" />Traffic challans, parking charges, tolls, fines, towing, impound, seizure, or recovery charges arising during the booking period.</li>
              <li><span className="legal-list-dot" />Charges for missing accessories, documents, keys, damage to interiors/exteriors, deep cleaning, or any misuse.</li>
              <li><span className="legal-list-dot" />Any reasonable administrative, inspection, or recovery expenses connected with the booking issue, to the extent permitted by law.</li>
            </ul>
          </div>

          <div className="legal-section" id="inspection">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 07</span>
                <h2 className="legal-section-title">Vehicle Condition, Inspection, and Evidence</h2>
              </div>
            </div>
            <ul className="legal-list">
              <li><span className="legal-list-dot" />The vehicle condition at handover and return may be recorded using photos, videos, odometer readings, fuel level, and inspection notes.</li>
              <li><span className="legal-list-dot" />Such records may be used as evidence for damage, delay, misuse, missing items, or charge disputes.</li>
              <li><span className="legal-list-dot" />The customer agrees that handover records, return records, and system logs may be final for operational purposes, unless proved otherwise.</li>
            </ul>
          </div>

          <div className="legal-section" id="prohibited-use">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 08</span>
                <h2 className="legal-section-title">Prohibited Use</h2>
              </div>
            </div>
            <p>The customer must not:</p>
            <ul className="legal-list">
              <li><span className="legal-list-dot" />Drive under the influence of alcohol, drugs, or intoxicating substances.</li>
              <li><span className="legal-list-dot" />Use the vehicle for racing, off-roading, overloading, towing, unlawful transport, or any illegal purpose.</li>
              <li><span className="legal-list-dot" />Allow an unauthorized person to drive the vehicle.</li>
              <li><span className="legal-list-dot" />Sublet, transfer, pledge, sell, or hand over the vehicle to any third party.</li>
              <li><span className="legal-list-dot" />Remove, tamper with, or damage company property, GPS devices, trackers, tags, keys, or accessories.</li>
            </ul>
            <div className="legal-highlight">
              <p>🚫 No alcohol/drugs while driving, no racing or off-roading, no unauthorized drivers, and no tampering with GPS devices.</p>
            </div>
          </div>

          <div className="legal-section" id="cancellation-extension">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 09</span>
                <h2 className="legal-section-title">Cancellation and Extension</h2>
              </div>
            </div>
            <ul className="legal-list">
              <li><span className="legal-list-dot" />Booking cancellation, cancellation requests, and refund eligibility shall be governed by the cancellation policy shown in the app/website or supported by the booking team.</li>
              <li><span className="legal-list-dot" />Booking extension, if allowed, shall be subject to availability and may attract additional charges.</li>
              <li><span className="legal-list-dot" />Any extension granted by the company should be treated as a separate operational approval and may require additional payment.</li>
            </ul>
          </div>

          <div className="legal-section" id="suspension">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 10</span>
                <h2 className="legal-section-title">Suspension and Termination</h2>
              </div>
            </div>
            <p>Car24 Travels may suspend, cancel, or terminate a booking or user account if:</p>
            <ul className="legal-list">
              <li><span className="legal-list-dot" />False, incomplete, or misleading information is provided.</li>
              <li><span className="legal-list-dot" />The customer violates these Terms.</li>
              <li><span className="legal-list-dot" />The vehicle is misused, delayed, damaged, or not returned properly.</li>
              <li><span className="legal-list-dot" />The company suspects fraud, illegal activity, or safety risk.</li>
            </ul>
          </div>

          <div className="legal-section" id="limitation">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 11</span>
                <h2 className="legal-section-title">Limitation of Liability</h2>
              </div>
            </div>
            <p>To the extent permitted by law:</p>
            <ul className="legal-list">
              <li><span className="legal-list-dot" />Car24 Travels is not liable for indirect, incidental, consequential, or special losses.</li>
              <li><span className="legal-list-dot" />The company is not liable for losses caused by third-party actions, traffic authorities, law enforcement actions, or events beyond reasonable control.</li>
              <li><span className="legal-list-dot" />Nothing in these Terms limits any rights available to a consumer under applicable Indian law.</li>
            </ul>
          </div>

          <div className="legal-section" id="force-majeure">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h3l3-9 3 18 3-9h3"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 12</span>
                <h2 className="legal-section-title">Force Majeure</h2>
              </div>
            </div>
            <p>Car24 Travels shall not be responsible for delay or failure in performance caused by events beyond reasonable control, including natural disasters, road closures, strikes, government actions, public emergencies, internet failure, or technical outages.</p>
          </div>

          <div className="legal-section" id="third-party">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 13</span>
                <h2 className="legal-section-title">Third-Party Services</h2>
              </div>
            </div>
            <p>The app or website may use third-party services for payment, maps, notifications, analytics, storage, or communication. Their services are subject to their own terms and policies.</p>
          </div>

          <div className="legal-section" id="intellectual-property">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-4-3 3-4-4-5 6"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 14</span>
                <h2 className="legal-section-title">Intellectual Property</h2>
              </div>
            </div>
            <p>All content, trademarks, logos, text, graphics, designs, software, and branding used in the app and website belong to Car24 Travels or its licensors and may not be copied, modified, or reused without permission.</p>
          </div>

          <div className="legal-section" id="changes">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 15</span>
                <h2 className="legal-section-title">Changes to Terms</h2>
              </div>
            </div>
            <p>Car24 Travels may update these Terms from time to time. The updated version will be posted in the app and/or website. Continued use of the app or website after updates means acceptance of the revised Terms.</p>
          </div>

          <div className="legal-section" id="privacy">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 16</span>
                <h2 className="legal-section-title">Privacy Policy</h2>
              </div>
            </div>
            <p>These Terms are separate from our Privacy Policy. The Privacy Policy explains how user data is collected, used, stored, and protected.</p>
          </div>

          <div className="legal-section" id="governing-law">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 0 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 17</span>
                <h2 className="legal-section-title">Governing Law and Jurisdiction</h2>
              </div>
            </div>
            <p>These Terms shall be governed by the laws of India. Any dispute shall be subject to the jurisdiction of the courts at the place where Car24 Travels has its registered office, unless a different jurisdiction is required by law.</p>
          </div>

          <div className="legal-section" id="contact">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 18</span>
                <h2 className="legal-section-title">Contact</h2>
              </div>
            </div>
            <p>If you have questions about these Terms, contact:</p>
            <div className="legal-contact-card">
              <div>
                <p><strong>Car24 Travels</strong></p>
                <p>Email: [support email]</p>
                <p>Phone: [support phone]</p>
                <p>Address: [registered address]</p>
              </div>
              <div className="legal-contact-links">
                <a href="mailto:support@car24.com" className="legal-contact-link primary">Email Us</a>
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
          <Link to="/privacy-policy" className="legal-related-card">
            <div className="legal-related-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <h4>Privacy Policy</h4>
              <p>How we collect and use your data</p>
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