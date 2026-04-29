import { Link } from "react-router-dom";
import "./Legal.css";

const SECTIONS = [
  { id: "overview", num: "01", label: "Overview" },
  { id: "how-to-cancel", num: "02", label: "How to Request a Cancellation" },
  { id: "approval-process", num: "03", label: "The Cancellation Approval Process" },
  { id: "refund-policy", num: "04", label: "Refund Policy (Car24 Credits System)" },
  { id: "credits-terms", num: "05", label: "Terms of Using Car24 Credits" },
  { id: "late-cancellations", num: "06", label: "Late Cancellations and No-Shows" },
  { id: "contact", num: "07", label: "Contact Us" },
];

export default function CancellationPolicy() {
  return (
    <div className="legal-root">
      {/* Hero */}
      <div className="legal-hero">
        <div className="legal-hero-inner">
          <div className="legal-breadcrumb">
            <Link to="/">Home</Link>
            <span className="legal-breadcrumb-sep">›</span>
            <span>Cancellation Policy</span>
          </div>
          <div className="legal-badge">
            <span className="legal-badge-dot" />
            Legal
          </div>
          <h1 className="legal-title">
            Cancellation & <span className="legal-title-accent">Refund Policy</span>
          </h1>
          <p className="legal-subtitle">
            At Car24 Travels, we strive to make the booking process as smooth as possible. We understand that plans can change. This Cancellation and Refund Policy outlines exactly how cancellations are processed and how your advance payments are protected.
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 01</span>
                <h2 className="legal-section-title">Overview</h2>
              </div>
            </div>
            <p>At Car24 Travels, we strive to make the booking process as smooth as possible. We understand that plans can change. This Cancellation and Refund Policy outlines exactly how cancellations are processed and how your advance payments are protected.</p>
          </div>

          <div className="legal-section" id="how-to-cancel">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 02</span>
                <h2 className="legal-section-title">How to Request a Cancellation</h2>
              </div>
            </div>
            <p>You can initiate a cancellation request directly through the <strong style={{color:'#fff'}}>"My Trips"</strong> or <strong style={{color:'#fff'}}>"Bookings"</strong> section of the Car24 Travels mobile application or website. Simply select your upcoming trip and click <strong style={{color:'#fff'}}>"Cancel Booking"</strong>.</p>
          </div>

          <div className="legal-section" id="approval-process">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 03</span>
                <h2 className="legal-section-title">The Cancellation Approval Process</h2>
              </div>
            </div>
            <p>To ensure security and prevent fraudulent bookings, cancellations are not instantly automated. The process is as follows:</p>
            <ul className="legal-list">
              <li><span className="legal-list-dot" /><strong>Pending Status:</strong> Once you request a cancellation in the app, your booking will be moved to a "Pending Cancellation" state.</li>
              <li><span className="legal-list-dot" /><strong>Staff Verification Call:</strong> A member of the Car24 Travels support team will call the registered phone number to verify the reason for cancellation and confirm your identity.</li>
              <li><span className="legal-list-dot" /><strong>Final Approval:</strong> Cancellations will only be processed after they have been officially approved by our staff during the verification call.</li>
            </ul>
            <div className="legal-highlight">
              <p>📞 Our support team will call to verify your cancellation request. This ensures security and prevents fraudulent cancellations.</p>
            </div>
          </div>

          <div className="legal-section" id="refund-policy">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 04</span>
                <h2 className="legal-section-title">Refund Policy (Car24 Credits System)</h2>
              </div>
            </div>
            <p>Car24 Travels operates on a strictly <strong style={{color:'#fff'}}>Credit-Based Refund System</strong>.</p>
            <ul className="legal-list">
              <li><span className="legal-list-dot" /><strong>No Direct Bank Refunds:</strong> Advance payments made during the booking process are not refunded back to your original payment method (Credit/Debit Card, UPI, or Bank Account).</li>
              <li><span className="legal-list-dot" /><strong>Conversion to Credits:</strong> Upon successful staff approval of your cancellation, the exact advance payment amount (₹) you paid will be converted into Car24 Credits.</li>
              <li><span className="legal-list-dot" /><strong>Crediting to Account:</strong> These credits will be immediately added to your Car24 Travels account.</li>
            </ul>
            <div className="legal-warning">
              <p>⚠️ Car24 Travels operates on a strictly Credit-Based Refund System. No direct bank refunds are issued for cancellations.</p>
            </div>
          </div>

          <div className="legal-section" id="credits-terms">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 05</span>
                <h2 className="legal-section-title">Terms of Using Car24 Credits</h2>
              </div>
            </div>
            <ul className="legal-list">
              <li><span className="legal-list-dot" /><strong>Future Bookings:</strong> Your credits can be seamlessly applied toward the advance payment or total cost of any future car bookings with Car24 Travels.</li>
              <li><span className="legal-list-dot" /><strong>Non-Transferable:</strong> Credits are strictly tied to your user account and cannot be transferred to another user, sold, or exchanged for cash.</li>
              <li><span className="legal-list-dot" /><strong>Validity Period:</strong> Car24 Credits are valid for exactly <strong style={{color:'#fff'}}>one (1) month (30 days)</strong> from the date the cancellation is approved. If not utilized for a new booking within this timeframe, the credits will expire and cannot be reclaimed.</li>
            </ul>
            <div className="legal-highlight">
              <p>⏰ Credits expire 30 days after approval. Use them before they expire!</p>
            </div>
          </div>

          <div className="legal-section" id="late-cancellations">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 06</span>
                <h2 className="legal-section-title">Late Cancellations and No-Shows</h2>
              </div>
            </div>
            <p>If you fail to cancel the booking and do not show up to collect the vehicle at the designated time (a <strong style={{color:'#fff'}}>"No-Show"</strong>), Car24 Travels reserves the right to decline the cancellation request.</p>
            <p>In the event of a No-Show, or a cancellation requested <strong style={{color:'#fff'}}>after the booking start time</strong>, the advance payment may be forfeited entirely without the issuance of Car24 Credits, subject to management discretion.</p>
            <div className="legal-warning">
              <p>⚠️ No-shows or cancellations after booking start time may result in complete forfeiture of your advance payment without any credits issued.</p>
            </div>
          </div>

          <div className="legal-section" id="contact">
            <div className="legal-section-header">
              <div className="legal-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div>
                <span className="legal-section-num">Section 07</span>
                <h2 className="legal-section-title">Contact Us</h2>
              </div>
            </div>
            <p>If you need immediate assistance with a cancellation, please contact us at:</p>
            <div className="legal-contact-card">
              <div>
                <p><strong>Car24 Travels Support Team</strong></p>
                <p>Email: support@car24.com</p>
                <p>Phone: [Your Support Number]</p>
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
          <Link to="/terms-and-conditions" className="legal-related-card">
            <div className="legal-related-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div>
              <h4>Terms of Service</h4>
              <p>Rules governing platform use</p>
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