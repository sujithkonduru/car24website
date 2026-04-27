import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { apiGet, apiPost, getToken, decodeToken } from "../api.js";
import { carImageUrl, PLACEHOLDER } from "../utils/carImage.js";
import "./CarDetail.css";
import "./BookingPanel.css";

const RZP_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || "";

/* ─────────────────────────────────────────────────────────────
   CANCELLATION POLICY DATA
───────────────────────────────────────────────────────────── */
const CANCEL_POLICY = [
  {
    id: 1,
    icon: "✅",
    title: "Free cancellation — 24h+ before pickup",
    desc: "Cancel anytime up to 24 hours before your scheduled pickup and receive a full refund to your original payment method within 5–7 business days.",
    color: "#10b981",
  },
  {
    id: 2,
    icon: "⚡",
    title: "50% refund — 6–24h before pickup",
    desc: "Cancellations made between 6 and 24 hours before pickup are eligible for a 50% refund of the advance paid. The remaining 50% is retained as a late-cancellation fee.",
    color: "#f59e0b",
  },
  {
    id: 3,
    icon: "❌",
    title: "No refund — less than 6h before pickup",
    desc: "Cancellations within 6 hours of pickup are non-refundable. The full advance amount is forfeited. You may reschedule once at no extra charge if done 12h+ in advance.",
    color: "#ef4444",
  },
  {
    id: 4,
    icon: "🔄",
    title: "Credits instead of refund",
    desc: "If you paid using wallet credits, the refundable amount is returned as Car24 credits (valid 90 days). Credits cannot be converted to cash.",
    color: "#3b82f6",
  },
];

// Helper function to calculate price based on duration (matching backend logic)
function calculatePriceFromSlots(slots, pricing) {
  if (!Array.isArray(slots) || slots.length === 0) {
    return null;
  }

  const { six_hr_price, twelve_hr_price, twentyfour_hr_price } = pricing;

  // Total hours from slots array
  const totalHours = slots.reduce((sum, s) => sum + s, 0);

  // Smart breakdown matching backend
  let remaining = totalHours;
  let totalPrice = 0;

  const days = Math.floor(remaining / 24);
  totalPrice += days * twentyfour_hr_price;
  remaining -= days * 24;

  const halfDays = Math.floor(remaining / 12);
  totalPrice += halfDays * twelve_hr_price;
  remaining -= halfDays * 12;

  const sixHrs = Math.floor(remaining / 6);
  totalPrice += sixHrs * six_hr_price;

  const platformFee = Math.ceil(totalPrice * 0.0236);
  const finalAmount = totalPrice + platformFee;

  return { basePrice: totalPrice, platformFee, totalAmount: finalAmount, totalHours };
}

// Calculate advance amount matching backend logic
function calculateAdvanceAmount(totalHours) {
  let remaining = totalHours;
  let advance = 0;

  const days = Math.floor(remaining / 24);
  advance += days * 500;
  remaining -= days * 24;

  const halfDays = Math.floor(remaining / 12);
  advance += halfDays * 500;
  remaining -= halfDays * 12;

  const sixHrs = Math.floor(remaining / 6);
  advance += sixHrs * 400;

  return advance;
}

/* ─────────────────────────────────────────────────────────────
   BOOKING PANEL COMPONENT
───────────────────────────────────────────────────────────── */
function BookingPanel({
  car, isLoggedIn,
  pickup, setPickup, dropoff, setDropoff,
  useCredits, setUseCredits,
  estimatedPrice, platformFee, totalPrice, advanceAmount,
  getDuration, formatDateTime, getDurationDetails,
  handleBook, bookingBusy, bookingErr, booking,
  copyOtpToClipboard,
}) {
  const [policyOpen, setPolicyOpen] = useState(false);
  const [openPolicyId, setOpenPolicyId] = useState(null);
  const hasPrices = estimatedPrice !== null;
  const duration = getDuration();
  const durationDetails = getDurationDetails();

  return (
    <section className="bp-root">
      {/* ── Header ── */}
      <div className="bp-header">
        <div className="bp-header-left">
          <div className="bp-header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <h2 className="bp-title">Book this car</h2>
            <p className="bp-subtitle">
              {isLoggedIn
                ? "Select dates to see live pricing"
                : <span>Please <Link to="/login" className="bp-login-link">sign in</Link> to book</span>}
            </p>
          </div>
        </div>
        <div className="bp-price-badges">
          {car?.six_hr_price && (
            <div className="bp-price-badge bp-price-badge--small">
              <span className="bp-price-badge-amount">₹{Number(car.six_hr_price).toLocaleString("en-IN")}</span>
              <span className="bp-price-badge-unit">/6hrs</span>
            </div>
          )}
          {car?.twelve_hr_price && (
            <div className="bp-price-badge bp-price-badge--small">
              <span className="bp-price-badge-amount">₹{Number(car.twelve_hr_price).toLocaleString("en-IN")}</span>
              <span className="bp-price-badge-unit">/12hrs</span>
            </div>
          )}
          {car?.twentyfour_hr_price && (
            <div className="bp-price-badge">
              <span className="bp-price-badge-amount">₹{Number(car.twentyfour_hr_price).toLocaleString("en-IN")}</span>
              <span className="bp-price-badge-unit">/day</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Trust bar ── */}
      <div className="bp-trust-bar">
        <span className="bp-trust-item"><span className="bp-trust-dot bp-trust-dot--green" />Free cancellation</span>
        <span className="bp-trust-sep" />
        <span className="bp-trust-item"><span className="bp-trust-dot bp-trust-dot--blue" />Instant confirmation</span>
        <span className="bp-trust-sep" />
        <span className="bp-trust-item"><span className="bp-trust-dot bp-trust-dot--teal" />30% advance only</span>
      </div>

      {isLoggedIn && (
        <form onSubmit={handleBook}>
          <div className="bp-body">

            {/* ── LEFT: Date inputs + price breakdown ── */}
            <div className="bp-left">

              {/* Date pickers */}
              <div className="bp-dates">
                <div className="bp-date-field">
                  <label className="bp-label">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Pickup
                  </label>
                  <input
                    className="bp-input"
                    type="datetime-local"
                    value={pickup}
                    onChange={e => setPickup(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>

                <div className="bp-date-divider">
                  <div className="bp-date-divider-line" />
                  <div className="bp-date-divider-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                  <div className="bp-date-divider-line" />
                </div>

                <div className="bp-date-field">
                  <label className="bp-label">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Drop-off
                  </label>
                  <input
                    className="bp-input"
                    type="datetime-local"
                    value={dropoff}
                    onChange={e => setDropoff(e.target.value)}
                    min={pickup || new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>
              </div>

              {/* Duration pill — shows after both dates selected */}
              {pickup && dropoff && duration && (
                <div className="bp-duration-row">
                  <div className="bp-duration-pill">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {duration}
                  </div>
                  {durationDetails && (
                    <div className="bp-duration-detail">
                      {durationDetails.durationLabel}
                    </div>
                  )}
                  <div className="bp-date-range-text">
                    <span>{formatDateTime(pickup)}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14"/>
                    </svg>
                    <span>{formatDateTime(dropoff)}</span>
                  </div>
                </div>
              )}

              {/* Price breakdown — live, appears when dates are set */}
              {hasPrices ? (
                <div className="bp-breakdown">
                  <div className="bp-breakdown-title">Price breakdown</div>
                  <div className="bp-breakdown-rows">
                    <div className="bp-breakdown-row">
                      <span>Base rental</span>
                      <span>₹{estimatedPrice.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="bp-breakdown-row">
                      <span>Platform fee <em>(2.36%)</em></span>
                      <span>+ ₹{platformFee.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="bp-breakdown-row bp-breakdown-row--total">
                      <span>Total</span>
                      <span className="bp-total-val">₹{totalPrice.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bp-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <p>Select pickup &amp; drop-off dates<br/>to see live pricing</p>
                </div>
              )}
            </div>

            {/* ── RIGHT: Order summary + CTA ── */}
            <div className="bp-right">
              <div className="bp-summary">
                <div className="bp-summary-title">Booking summary</div>

                {/* Advance highlight */}
                <div className="bp-advance-block">
                  <div className="bp-advance-label">Pay now (30% advance)</div>
                  <div className="bp-advance-amount">
                    {advanceAmount ? `₹${advanceAmount.toLocaleString("en-IN")}` : "—"}
                  </div>
                  <div className="bp-advance-note">Remaining ₹{hasPrices ? (totalPrice - advanceAmount).toLocaleString("en-IN") : "—"} paid at pickup</div>
                </div>

                {/* Summary rows */}
                <div className="bp-summary-rows">
                  <div className="bp-summary-row">
                    <span>Duration</span>
                    <strong>{duration || "—"}</strong>
                  </div>
                  <div className="bp-summary-row">
                    <span>Total amount</span>
                    <strong>{hasPrices ? `₹${totalPrice.toLocaleString("en-IN")}` : "—"}</strong>
                  </div>
                  <div className="bp-summary-row">
                    <span>Branch</span>
                    <strong>{car?.branch_name || "—"}</strong>
                  </div>
                </div>

                {/* Credits toggle */}
                <label className="bp-credits-toggle">
                  <input
                    type="checkbox"
                    checked={useCredits}
                    onChange={e => setUseCredits(e.target.checked)}
                  />
                  <span className="bp-credits-check" />
                  <span className="bp-credits-text">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                    Use wallet credits
                  </span>
                </label>

                {/* CTA button */}
                <button
                  type="submit"
                  className="bp-cta"
                  disabled={bookingBusy || !pickup || !dropoff}
                >
                  {bookingBusy ? (
                    <><span className="bp-spinner" /> Processing…</>
                  ) : (
                    <>
                      Confirm &amp; Pay
                      {advanceAmount ? ` ₹${advanceAmount.toLocaleString("en-IN")}` : ""}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </>
                  )}
                </button>

                <p className="bp-terms">
                  By confirming you agree to our
                  <button type="button" className="bp-policy-link" onClick={() => setPolicyOpen(o => !o)}>
                    cancellation policy
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* ── Error / Success banners ── */}
          {bookingErr && (
            <div className="bp-banner bp-banner--error">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div>
                <strong>Booking failed</strong>
                <p>{bookingErr}</p>
              </div>
            </div>
          )}

          {booking?.ok && (
            <div className="bp-banner bp-banner--success">
              <div className="bp-success-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="bp-success-body">
                <strong>{booking.message || "Booking confirmed!"}</strong>
                <div className="bp-success-chips">
                  {booking.bookingId && (
                    <span className="bp-chip">
                      Booking <code>#{booking.bookingId}</code>
                    </span>
                  )}
                  {booking.otp && (
                    <span className="bp-chip bp-chip--otp">
                      OTP: <code>{booking.otp}</code>
                      <button
                        type="button"
                        className="bp-copy-btn"
                        onClick={() => copyOtpToClipboard(booking.otp)}
                      >
                        Copy
                      </button>
                    </span>
                  )}
                </div>
                {booking.credits && (
                  <span className="bp-credits-badge">✓ Advance covered by credits</span>
                )}
                <Link to="/myBookings" className="bp-view-link">View booking details →</Link>
              </div>
            </div>
          )}
        </form>
      )}

      {/* ── Cancellation Policy Accordion ── */}
      <div className="bp-policy-section">
        <button
          type="button"
          className="bp-policy-toggle"
          onClick={() => setPolicyOpen(o => !o)}
        >
          <div className="bp-policy-toggle-left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <span>Cancellation Policy</span>
          </div>
          <svg
            className={`bp-policy-chevron ${policyOpen ? "open" : ""}`}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>

        {policyOpen && (
          <div className="bp-policy-body">
            <div className="bp-policy-grid">
              {CANCEL_POLICY.map(item => (
                <div key={item.id} className="bp-policy-card">
                  <button
                    type="button"
                    className="bp-policy-card-header"
                    onClick={() => setOpenPolicyId(openPolicyId === item.id ? null : item.id)}
                  >
                    <div className="bp-policy-card-left">
                      <span className="bp-policy-icon" style={{ background: `${item.color}18`, border: `1px solid ${item.color}40` }}>
                        {item.icon}
                      </span>
                      <span className="bp-policy-card-title">{item.title}</span>
                    </div>
                    <svg
                      className={`bp-policy-chevron ${openPolicyId === item.id ? "open" : ""}`}
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                  {openPolicyId === item.id && (
                    <div className="bp-policy-card-desc">{item.desc}</div>
                  )}
                </div>
              ))}
            </div>
            <p className="bp-policy-note">
              ℹ️ All refunds are processed within 5–7 business days. For disputes, contact
              <a href="mailto:support@car24.in"> support@car24.in</a>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State declarations
  const [user, setUser] = useState(id);
  const [car, setCar] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [useCredits, setUseCredits] = useState(false);
  const [booking, setBooking] = useState(null);
  const [bookingErr, setBookingErr] = useState(null);
  const [bookingBusy, setBookingBusy] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [platformFee, setPlatformFee] = useState(null);
  const [totalPrice, setTotalPrice] = useState(null);
  const [advanceAmount, setAdvanceAmount] = useState(null);
  const [durationDetails, setDurationDetails] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [status, setStatus] = useState("available");

  // Image gallery state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Fetch car details
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [c, br] = await Promise.all([
          apiGet(`/cars/get_car/${id}`),
          apiGet("/cars/get_branches")
        ]);
        setCar(c);
        setStatus(c.isAvailable ? "available" : "booked");
        setBranches(Array.isArray(br) ? br : []);
        
        if (c?.branchId) {
          setSelectedBranchId(c.branchId);
        }

        // Fix: Get real user data from token
        const token = getToken();
        if (token) {
          const decoded = decodeToken(token);
          setUser(decoded || null);
        }
      } catch (e) {
        if (!controller.signal.aborted) {
          setErr(e.message || "Failed to load car");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();
    return () => controller.abort();
  }, [id]);

  // Calculate price when dates change - using backend matching logic
  useEffect(() => {
    if (!car || !pickup || !dropoff) {
      setEstimatedPrice(null);
      setPlatformFee(null);
      setTotalPrice(null);
      setAdvanceAmount(null);
      setDurationDetails(null);
      return;
    }

    const start = new Date(pickup);
    const end = new Date(dropoff);
    
    if (start >= end) {
      setEstimatedPrice(null);
      setPlatformFee(null);
      setTotalPrice(null);
      setAdvanceAmount(null);
      setDurationDetails(null);
      return;
    }

    // Calculate hours difference
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    // Calculate number of 6-hour slots (ceil to ensure full coverage)
    const numSlots = Math.ceil(diffHours / 6);
    const slots = Array(numSlots).fill(6);
    
    const pricing = {
      six_hr_price: car.six_hr_price,
      twelve_hr_price: car.twelve_hr_price,
      twentyfour_hr_price: car.twentyfour_hr_price
    };
    
    const priceResult = calculatePriceFromSlots(slots, pricing);
    
    if (!priceResult) {
      setEstimatedPrice(null);
      setPlatformFee(null);
      setTotalPrice(null);
      setAdvanceAmount(null);
      setDurationDetails(null);
      return;
    }

    const advance = calculateAdvanceAmount(priceResult.totalHours);

    setEstimatedPrice(priceResult.basePrice);
    setPlatformFee(priceResult.platformFee);
    setTotalPrice(priceResult.totalAmount);
    setAdvanceAmount(advance);
    setDurationDetails({
      durationLabel: `${priceResult.totalHours} hours total`,
      totalHours: priceResult.totalHours
    });
  }, [pickup, dropoff, car]);

  // Format date for display
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate duration
  const getDuration = () => {
    if (!pickup || !dropoff) return null;
    const start = new Date(pickup);
    const end = new Date(dropoff);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;
    
    if (diffDays === 0) {
      return `${diffHours.toFixed(1)} hours`;
    } else if (remainingHours === 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ${remainingHours.toFixed(1)} hours`;
    }
  };

  const getDurationDetails = () => durationDetails;

  // Payment handling
  function openRazorpay(order, bookingId, onVerified) {
    if (!window.Razorpay) {
      setBookingErr("Razorpay script not loaded. Refresh the page.");
      setBookingBusy(false);
      return;
    }
    if (!RZP_KEY) {
      setBookingErr("Payment configuration missing. Please contact support.");
      setBookingBusy(false);
      return;
    }
    const options = {
      key: RZP_KEY,
      amount: order.amount,
      currency: order.currency || "INR",
      name: "Car24",
      description: `Booking #${bookingId} — Advance Payment`,
      order_id: order.id,
      handler(response) {
        onVerified(response);
      },
      prefill: {
        email: localStorage.getItem("user_email") || "",
        contact: localStorage.getItem("user_phone") || ""
      },
      theme: { color: "#1FB6D9" },
      modal: {
        ondismiss: () => {
          setBookingBusy(false);
        }
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (res) => {
      setBookingErr(res?.error?.description || "Payment failed. Please try again.");
      setBookingBusy(false);
    });
    rzp.open();
  }

  // Handle booking
  async function handleBook(e) {
    e.preventDefault();
    setBookingErr(null);
    setBooking(null);
    
    if (!car) return;
    if (!pickup || !dropoff) {
      setBookingErr("Please select both pickup and drop-off date & time.");
      return;
    }
    
    // Check if user is logged in and has valid userId
    const token = getToken();
    if (!token) {
      setBookingErr("Please sign in to book this car.");
      navigate("/login");
      return;
    }

    const decoded = decodeToken(token);
    if (!decoded?.userId && !decoded?.id) {
      setBookingErr("Invalid user session. Please sign in again.");
      localStorage.removeItem("car24_token");
      navigate("/login");
      return;
    }
    
    const start = new Date(pickup);
    const end = new Date(dropoff);
    
    if (start >= end) {
      setBookingErr("Drop-off time must be after pickup time.");
      return;
    }
    
    // Calculate total hours for validation
    const diffHours = (end - start) / (1000 * 60 * 60);
    if (diffHours < 6) {
      setBookingErr("Minimum rental duration is 6 hours.");
      return;
    }
    
    const branchId = selectedBranchId || car.branchId;
    
    if (!branchId) {
      setBookingErr("Branch information is missing. Please refresh the page.");
      return;
    }
    
    setBookingBusy(true);
    
    try {
      // Check availability
      const availability = await apiGet("/bookingApi/checkAvailability", {
        query: { carId: car.id, pickupDate: start.toISOString(), dropoffDate: end.toISOString() },
        withAuth: true
      });
      
      if (availability?.available === false) {
        setBookingErr("This car is already booked for the selected time range. Please choose different dates.");
        setBookingBusy(false);
        return;
      }

      // IMPORTANT: DO NOT send slots array - let backend calculate it
      // The backend calculates slots based on startTime and endTime
      const bookingData = {
        userId: decoded.userId || decoded.id || user?.id,
        carId: car.id,
        branchId: branchId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        useCredits: useCredits
      };
      
      console.log("Token decoded:", decoded);
      console.log("Using userId:", decoded.userId || decoded.id || user?.id);
      console.log("Sending booking request:", bookingData);

      // Create booking - backend will calculate slots and price
      const res = await apiPost(
        "/bookingApi/bookCar",
        bookingData,
        { withAuth: true }
      );

      const finish = async (verifyBody) => {
        const v = await apiPost("/bookingApi/verify-payment", verifyBody);
        setBooking({
          ok: true,
          bookingId: v.bookingId,
          otp: v.otp,
          message: v.message
        });
      };

      // If advance is fully covered by credits or no payment needed
      if (res.order == null || res.advancePayable === 0) {
        setBooking({
          ok: true,
          bookingId: res.bookingId,
          message: res.message || "Booking confirmed successfully!",
          credits: true
        });
        setBookingBusy(false);
        return;
      }

      // Open Razorpay for remaining advance
      openRazorpay(res.order, res.bookingId, async (response) => {
        try {
          await finish({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
        } catch (ve) {
          setBookingErr(ve.message || "Payment verification failed");
        } finally {
          setBookingBusy(false);
        }
      });
    } catch (be) {
      console.error("Booking error:", be);
      
      // Enhanced error handling
      let errorMsg = "Unable to create booking. Please try again.";
      
      if (be.statusCode === 401 || be.statusCode === 403) {
        errorMsg = "Session expired. Please sign in again.";
        localStorage.removeItem("car24_token");
        navigate("/login");
      } else if (be.message?.includes("foreign key") || be.message?.includes("userId_fkey")) {
        errorMsg = "Booking authentication error. Please refresh and try again.";
      } else if (be.message?.includes("Minimum booking duration")) {
        errorMsg = be.message;
      } else if (be.message) {
        errorMsg = be.message;
      }
      
      setBookingErr(errorMsg);
      setBookingBusy(false);
    }
  }

  // Copy OTP to clipboard
  const copyOtpToClipboard = (otp) => {
    navigator.clipboard.writeText(otp);
    const tempMessage = document.createElement('div');
    tempMessage.className = 'toast-message';
    tempMessage.textContent = 'OTP copied to clipboard!';
    document.body.appendChild(tempMessage);
    setTimeout(() => tempMessage.remove(), 2000);
  };

  const isLoggedIn = !!getToken();

  // Loading state
  if (loading) {
    return (
      <div className="car-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading car details...</p>
      </div>
    );
  }
  
  // Error state
  if (err || !car) {
    return (
      <div className="car-detail-error">
        <div className="error-container">
          <span className="error-icon">⚠️</span>
          <p className="banner error">{err || "Car not found"}</p>
          <Link to="/" className="btn-primary">Back to listings</Link>
        </div>
      </div>
    );
  }

  // Process main_image first for display
  const getImageUrls = () => {
    const urls = [];
    if (car.main_image && typeof car.main_image === 'string' && car.main_image.trim() !== '') {
      urls.push(car.main_image);
    }
    if (car.images && Array.isArray(car.images) && car.images.length > 0) {
      for (let img of car.images) {
        if (img !== car.main_image && urls.indexOf(img) === -1) {
          urls.push(img);
        }
      }
    }
    return urls.length > 0 ? urls : [PLACEHOLDER];
  };

  const imageUrls = getImageUrls();
  const processedImages = imageUrls.map(img => carImageUrl({ images: [img] }));
  const currentImage = processedImages[currentImageIndex] || PLACEHOLDER;
  const prices = car.six_hr_price != null
    ? [
        ["6 hours", car.six_hr_price],
        ["12 hours", car.twelve_hr_price],
        ["24 hours", car.twentyfour_hr_price]
      ]
    : [];

  return (
    <div className="car-detail">
      <Link to="/" className="back-link">
        ← Back to all cars
      </Link>

      <div className="car-detail-grid">
        {/* Image Section */}
        <div className="car-detail-media card">
          <div className="image-gallery">
            <div className="main-image-container">
              <motion.img 
                src={currentImage} 
                alt={`${car.model} - Photo ${currentImageIndex + 1}`}
                loading="lazy"
                onClick={() => setIsImageModalOpen(true)}
                style={{ cursor: 'pointer' }}
                onError={(e) => {
                  e.target.src = PLACEHOLDER;
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              />
              {car.category && (
                <span className="car-category-badge">{car.category}</span>
              )}
              
              {imageUrls.length > 1 && (
                <div className="gallery-nav">
                  <button 
                    className={`nav-arrow ${currentImageIndex === 0 ? 'disabled' : ''}`}
                    onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentImageIndex === 0}
                    aria-label="Previous image"
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  <button 
                    className={`nav-arrow ${currentImageIndex === imageUrls.length - 1 ? 'disabled' : ''}`}
                    onClick={() => setCurrentImageIndex(prev => Math.min(imageUrls.length - 1, prev + 1))}
                    disabled={currentImageIndex === imageUrls.length - 1}
                    aria-label="Next image"
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}
              
              {imageUrls.length > 1 && (
                <div className="image-counter">
                  {currentImageIndex + 1} / {imageUrls.length}
                </div>
              )}
            </div>
            
            {processedImages.length > 1 && (
              <div className="thumbnail-dots">
                {processedImages.map((_, index) => (
                  <button
                    key={index}
                    className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="car-detail-info">
          <div className="car-header">
            <h1>{car.model}</h1>
            <div className="car-rating">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.07 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>4.8</span>
              <span className="reviews-count">(2.3k reviews)</span>
            </div>
          </div>
          
          <div className="branch-info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            {car.branch_name || "Branch"}
            {car.branch_city ? `, ${car.branch_city}` : ""}
            {car.branch_address ? ` — ${car.branch_address}` : ""}
          </div>

          <div className="detail-chips">
            <span>📅 {car.year}</span>
            <span>⛽ {car.fuelType}</span>
            <span>⚙️ {car.transmission}</span>
            <span>👥 {car.seatingCapacity} seats</span>
            {car.colour && <span>🎨 {car.colour}</span>}
          </div>

          {Array.isArray(car.features) && car.features.length > 0 && (
            <div className="features">
              <h3>Features & Amenities</h3>
              <ul>
                {car.features.map((f, idx) => (
                  <li key={idx}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {prices.length > 0 && (
            <div className="pricing card subtle">
              <h3>💰 Pricing (inclusive of taxes)</h3>
              <div className="pricing-grid">
                {prices.map(([label, amt]) => (
                  <div key={label} className="pricing-item">
                    <span className="pricing-label">{label}</span>
                    <strong className="pricing-amount">₹{Number(amt).toLocaleString("en-IN")}</strong>
                  </div>
                ))}
              </div>
              <p className="small muted">
                * Platform fee (2.36%) will be added at checkout
              </p>
              <p className="small muted">
                * Minimum booking duration is 6 hours
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Car Status Badge */}
      <div className="car-status-badge-section">
        <div className={`cc-status-badge ${status === 'available' ? 'available' : 'booked'}`}>
          <span className="cc-status-icon">{status === 'available' ? '✅' : '🔒'}</span>
          <span className="cc-status-text">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
           BOOKING SECTION
      ═══════════════════════════════════════════════════ */}
      <BookingPanel
        car={car}
        isLoggedIn={isLoggedIn}
        pickup={pickup} setPickup={setPickup}
        dropoff={dropoff} setDropoff={setDropoff}
        useCredits={useCredits} setUseCredits={setUseCredits}
        estimatedPrice={estimatedPrice}
        platformFee={platformFee}
        totalPrice={totalPrice}
        advanceAmount={advanceAmount}
        getDuration={getDuration}
        formatDateTime={formatDateTime}
        getDurationDetails={getDurationDetails}
        handleBook={handleBook}
        bookingBusy={bookingBusy}
        bookingErr={bookingErr}
        booking={booking}
        copyOtpToClipboard={copyOtpToClipboard}
      />

      {/* Branch Info Section */}
      <section className="branch-info-section">
        <div className="branch-info-card">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <div className="branch-info-content">
            <p>
              This car is available at <strong>{car.branch_name || "Branch"}</strong> branch.
              {branches.length > 0 && ` We have ${branches.length} branches across India.`}
            </p>
            {car.branch_address && (
              <p className="branch-address">{car.branch_address}</p>
            )}
          </div>
        </div>
      </section>

      {/* Image Modal */}
      <AnimatePresence>
        {isImageModalOpen && (
          <motion.div 
            className="image-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsImageModalOpen(false)}
          >
            <motion.div 
              className="image-modal-content"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setIsImageModalOpen(false)}>×</button>
              <img src={currentImage} alt={car.model} />
              {imageUrls.length > 1 && (
                <div className="modal-nav">
                  <button 
                    className="modal-nav-btn"
                    onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentImageIndex === 0}
                  >
                    ←
                  </button>
                  <span className="modal-counter">{currentImageIndex + 1} / {imageUrls.length}</span>
                  <button 
                    className="modal-nav-btn"
                    onClick={() => setCurrentImageIndex(prev => Math.min(imageUrls.length - 1, prev + 1))}
                    disabled={currentImageIndex === imageUrls.length - 1}
                  >
                    →
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}