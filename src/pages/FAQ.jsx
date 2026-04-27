import { useState } from "react";
import { Link } from "react-router-dom";
import "./FAQ.css";

const FAQS = [
  {
    category: "Booking",
    items: [
      {
        q: "How do I book a car on Car24?",
        a: "Browse cars on the home page, select one you like, choose your pickup and drop-off dates, and click 'Confirm & Pay'. You'll pay 30% advance online and the rest at pickup."
      },
      {
        q: "Can I cancel my booking?",
        a: "Yes. You can cancel from 'My Bookings' up to 24 hours before your pickup time for a full refund of the advance as wallet credits. Cancellations within 24 hours may be subject to a fee."
      },
      {
        q: "What is the minimum rental duration?",
        a: "The minimum rental period is 6 hours. Pricing is calculated in 6-hour slots."
      },
      {
        q: "Can I extend my rental?",
        a: "Contact the branch directly or reach our support team via WhatsApp to request an extension, subject to availability."
      },
    ]
  },
  {
    category: "Payment",
    items: [
      {
        q: "What payment methods are accepted?",
        a: "We accept all major credit/debit cards, UPI, net banking, and wallet credits via Razorpay."
      },
      {
        q: "What are wallet credits?",
        a: "Credits are earned when you cancel a booking (advance refunded as credits) or through promotions. They can be used to pay the advance on your next booking."
      },
      {
        q: "Is there a platform fee?",
        a: "Yes, a 2.36% platform fee is added to the base rental price at checkout. This covers insurance and platform maintenance."
      },
      {
        q: "When is the remaining balance paid?",
        a: "The remaining 70% of the total is paid directly to the branch at the time of vehicle pickup."
      },
    ]
  },
  {
    category: "Vehicles",
    items: [
      {
        q: "Are the cars insured?",
        a: "Yes. All vehicles listed on Car24 are covered by basic insurance. The platform fee includes insurance coverage for the rental period."
      },
      {
        q: "What documents do I need to rent a car?",
        a: "You need a valid driving licence and a government-issued ID (Aadhaar, Passport, or Voter ID). Upload them once in your Profile and they'll be verified."
      },
      {
        q: "Can I take the car outside the city?",
        a: "Inter-city travel is allowed unless specified otherwise by the car owner. Check the car listing or contact the branch for restrictions."
      },
      {
        q: "What if the car breaks down?",
        a: "Call our 24/7 support line immediately. We'll arrange roadside assistance or a replacement vehicle as quickly as possible."
      },
    ]
  },
  {
    category: "Account",
    items: [
      {
        q: "How do I list my car on Car24?",
        a: "Register as an Owner, complete your profile, upload your documents, and add your car from the Owner Dashboard. Our team will verify and approve it within 24–48 hours."
      },
      {
        q: "How do I reset my password?",
        a: "Click 'Forgot password?' on the login page, enter your email, and follow the OTP verification steps."
      },
      {
        q: "Can I have multiple roles (user and owner)?",
        a: "Currently each account has a single role. Register a separate owner account to list cars while keeping your user account for rentals."
      },
    ]
  },
];

export default function FAQ() {
  const [open, setOpen] = useState({});
  const [search, setSearch] = useState("");

  function toggle(key) {
    setOpen((o) => ({ ...o, [key]: !o[key] }));
  }

  const filtered = FAQS.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        !search ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="faq-page">
      <div className="faq-hero">
        <span className="faq-eyebrow">Support</span>
        <h1 className="faq-title">Frequently Asked Questions</h1>
        <p className="faq-subtitle">Everything you need to know about renting with Car24.</p>
        <div className="faq-search-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search questions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="faq-search"
          />
        </div>
      </div>

      <div className="faq-body">
        {filtered.length === 0 && (
          <div className="faq-empty">
            <span>🔍</span>
            <p>No results for "{search}"</p>
            <button onClick={() => setSearch("")} className="faq-clear-btn">Clear search</button>
          </div>
        )}

        {filtered.map((cat) => (
          <div key={cat.category} className="faq-category">
            <h2 className="faq-cat-title">{cat.category}</h2>
            <div className="faq-list">
              {cat.items.map((item, i) => {
                const key = `${cat.category}-${i}`;
                const isOpen = !!open[key];
                return (
                  <div key={key} className={`faq-item ${isOpen ? "open" : ""}`}>
                    <button className="faq-question" onClick={() => toggle(key)}>
                      <span>{item.q}</span>
                      <svg
                        width="18" height="18" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2.5"
                        style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.25s", flexShrink: 0 }}
                      >
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </button>
                    {isOpen && <div className="faq-answer">{item.a}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="faq-cta">
          <p>Still have questions?</p>
          <div className="faq-cta-btns">
            <Link to="/contact" className="faq-cta-btn primary">Contact Support</Link>
            <Link to="/help" className="faq-cta-btn ghost">Help Center</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
