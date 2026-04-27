import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiGet } from "../api.js";
import { carImageUrl } from "../utils/carImage.js";
import { printBookingReceipt } from "../utils/receiptUtils.js";
import "./UserDashboard.css";

function formatDt(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

function statusClass(s) {
  const v = (s || "").toLowerCase();
  if (v === "confirmed") return "ud-badge--confirmed";
  if (v === "pending") return "ud-badge--pending";
  if (v === "ongoing" || v === "active") return "ud-badge--ongoing";
  if (v === "completed") return "ud-badge--completed";
  if (v === "cancelled") return "ud-badge--cancelled";
  return "ud-badge--pending";
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bRes, cRes] = await Promise.all([
        apiGet("/bookingApi/myBookings", { withAuth: true }),
        apiGet("/bookingApi/myCredits", { withAuth: true }).catch(() => null),
      ]);
      setBookings(Array.isArray(bRes) ? bRes : []);
      
      // Handle different credit response structures
      if (cRes) {
        // The response might be { totalCredits: 500, credits: [...] } or just a number
        const totalCredits = cRes.totalCredits !== undefined 
          ? cRes.totalCredits 
          : (typeof cRes === 'number' ? cRes : 0);
        setCredits({ totalCredits, creditsList: cRes.credits || [] });
      } else {
        setCredits({ totalCredits: 0, creditsList: [] });
      }
    } catch (e) {
      setError(e.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const active = bookings.filter(b => ["confirmed", "ongoing", "active"].includes((b.status || "").toLowerCase()));
  const completed = bookings.filter(b => b.status?.toLowerCase() === "completed");
  const cancelled = bookings.filter(b => b.status?.toLowerCase() === "cancelled");
  const totalSpent = bookings.reduce((s, b) => s + Number(b.totalPrice || 0), 0);

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  if (loading) {
    return (
      <div className="ud-root">
        <div className="ud-skeleton-header" />
        <div className="ud-skeleton-grid">
          {[...Array(4)].map((_, i) => <div key={i} className="ud-skeleton-card" />)}
        </div>
      </div>
    );
  }

  // Calculate total credits from the creditsList if available
  const totalCredits = credits?.totalCredits || 
    (credits?.creditsList?.reduce((sum, c) => sum + Number(c.remaining_amount || 0), 0) || 0);

  return (
    <div className="ud-root">
      {/* Profile Hero */}
      <div className="ud-hero">
        <div className="ud-hero-bg" />
        <div className="ud-hero-content">
          <div className="ud-avatar">{initials}</div>
          <div className="ud-hero-info">
            <h1 className="ud-hero-name">{user?.name || "User"}</h1>
            <p className="ud-hero-email">{user?.email}</p>
            <div className="ud-hero-badges">
              <span className="ud-role-badge">{user?.role || "user"}</span>
              {user?.id && <span className="ud-id-badge">ID: #{user.id}</span>}
            </div>
          </div>
          <div className="ud-hero-actions">
            <Link to="/profile" className="ud-btn-ghost">Edit Profile</Link>
            <Link to="/" className="ud-btn-primary">Browse Cars</Link>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="ud-stats">
        <div className="ud-stat">
          <span className="ud-stat-icon">📋</span>
          <span className="ud-stat-value">{bookings.length}</span>
          <span className="ud-stat-label">Total Bookings</span>
        </div>
        <div className="ud-stat ud-stat--active">
          <span className="ud-stat-icon">🚗</span>
          <span className="ud-stat-value">{active.length}</span>
          <span className="ud-stat-label">Active</span>
        </div>
        <div className="ud-stat ud-stat--completed">
          <span className="ud-stat-icon">✅</span>
          <span className="ud-stat-value">{completed.length}</span>
          <span className="ud-stat-label">Completed</span>
        </div>
        <div className="ud-stat ud-stat--money">
          <span className="ud-stat-icon">💰</span>
          <span className="ud-stat-value">₹{totalSpent.toLocaleString("en-IN")}</span>
          <span className="ud-stat-label">Total Spent</span>
        </div>
        {/* Credits Stat - Same as Profile.jsx */}
        <div className="ud-stat ud-stat--credits">
          <span className="ud-stat-icon">🪙</span>
          <span className="ud-stat-value">
            ₹{Number(totalCredits).toLocaleString("en-IN")}
          </span>
          <span className="ud-stat-label">Credits Available</span>
        </div>
      </div>

      {error && <div className="ud-error">⚠️ {error}</div>}

      {/* Tabs */}
      <div className="ud-tabs">
        {[
          { key: "overview", label: "Overview", count: null },
          { key: "active", label: "Active Bookings", count: active.length || null },
          { key: "history", label: "History", count: null },
        ].map(t => (
          <button
            key={t.key}
            className={`ud-tab${activeTab === t.key ? " active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
            {t.count ? <span className="ud-tab-badge">{t.count}</span> : null}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="ud-panel">
          {/* Quick Links */}
          <div className="ud-quick-grid">
            <Link to="/bookings" className="ud-quick-card">
              <span className="ud-quick-icon">📋</span>
              <div>
                <p className="ud-quick-title">My Bookings</p>
                <p className="ud-quick-desc">View all your trips</p>
              </div>
              <span className="ud-quick-arrow">→</span>
            </Link>
            <Link to="/profile" className="ud-quick-card">
              <span className="ud-quick-icon">👤</span>
              <div>
                <p className="ud-quick-title">Profile & Docs</p>
                <p className="ud-quick-desc">Update your info</p>
              </div>
              <span className="ud-quick-arrow">→</span>
            </Link>
            <Link to="/" className="ud-quick-card">
              <span className="ud-quick-icon">🚗</span>
              <div>
                <p className="ud-quick-title">Browse Fleet</p>
                <p className="ud-quick-desc">Find your next ride</p>
              </div>
              <span className="ud-quick-arrow">→</span>
            </Link>
            <Link to="/help" className="ud-quick-card">
              <span className="ud-quick-icon">🆘</span>
              <div>
                <p className="ud-quick-title">Help & Support</p>
                <p className="ud-quick-desc">Get assistance</p>
              </div>
              <span className="ud-quick-arrow">→</span>
            </Link>
          </div>

          {/* Recent Bookings */}
          {bookings.length > 0 && (
            <div className="ud-section">
              <div className="ud-section-head">
                <h2>Recent Bookings</h2>
                <Link to="/bookings" className="ud-view-all">View all →</Link>
              </div>
              <div className="ud-booking-list">
                {bookings.slice(0, 3).map(b => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            </div>
          )}

          {bookings.length === 0 && (
            <div className="ud-empty">
              <span className="ud-empty-icon">🚗</span>
              <p className="ud-empty-title">No bookings yet</p>
              <p className="ud-empty-text">Start your journey by browsing our premium fleet.</p>
              <Link to="/" className="ud-btn-primary">Browse Cars</Link>
            </div>
          )}
        </div>
      )}

      {/* Active Bookings Tab */}
      {activeTab === "active" && (
        <div className="ud-panel">
          {active.length === 0 ? (
            <div className="ud-empty">
              <span className="ud-empty-icon">✅</span>
              <p className="ud-empty-title">No active bookings</p>
              <p className="ud-empty-text">You have no ongoing or confirmed bookings right now.</p>
              <Link to="/" className="ud-btn-primary">Book a Car</Link>
            </div>
          ) : (
            <div className="ud-booking-list">
              {active.map(b => (
                <BookingCard key={b.id} booking={b} showTracking />
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="ud-panel">
          {completed.length === 0 && cancelled.length === 0 ? (
            <div className="ud-empty">
              <span className="ud-empty-icon">📋</span>
              <p className="ud-empty-title">No history yet</p>
              <p className="ud-empty-text">Completed and cancelled bookings will appear here.</p>
            </div>
          ) : (
            <div className="ud-booking-list">
              {[...completed, ...cancelled].map(b => (
                <BookingCard key={b.id} booking={b} showReceipt />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking: b, showTracking, showReceipt }) {
  const thumb = carImageUrl({ images: b.images });
  const displayStatus = b.display_status || b.status || "pending";

  return (
    <article className="ud-booking-card">
      <div className="ud-booking-thumb">
        <img src={thumb} alt={b.model || "Car"} loading="lazy" />
      </div>
      <div className="ud-booking-body">
        <div className="ud-booking-top">
          <div>
            <h3 className="ud-booking-model">{b.model || "Car"}</h3>
            {(b.branch_name || b.branch_city) && (
              <p className="ud-booking-branch">📍 {b.branch_name}{b.branch_city ? `, ${b.branch_city}` : ""}</p>
            )}
          </div>
          <span className={`ud-badge ${statusClass(displayStatus)}`}>{displayStatus}</span>
        </div>

        <div className="ud-booking-meta">
          <div className="ud-meta-item">
            <span className="ud-meta-label">Pickup</span>
            <span className="ud-meta-value">{formatDt(b.pickupDate)}</span>
          </div>
          <div className="ud-meta-item">
            <span className="ud-meta-label">Drop-off</span>
            <span className="ud-meta-value">{formatDt(b.dropoffDate)}</span>
          </div>
          <div className="ud-meta-item">
            <span className="ud-meta-label">Total</span>
            <span className="ud-meta-value ud-meta-price">₹{Number(b.totalPrice || 0).toLocaleString("en-IN")}</span>
          </div>
          <div className="ud-meta-item">
            <span className="ud-meta-label">Payment</span>
            <span className="ud-meta-value">{b.payment_status || "—"}</span>
          </div>
          {b.confirmationNumber != null && (
            <div className="ud-meta-item">
              <span className="ud-meta-label">OTP</span>
              <span className="ud-meta-value ud-meta-otp">{b.confirmationNumber}</span>
            </div>
          )}
          {/* Show credits used if any */}
          {Number(b.credits_used || 0) > 0 && (
            <div className="ud-meta-item">
              <span className="ud-meta-label">Credits Used</span>
              <span className="ud-meta-value ud-meta-credits">₹{Number(b.credits_used).toLocaleString("en-IN")}</span>
            </div>
          )}
        </div>

        <div className="ud-booking-actions">
          {showTracking && (
            <Link to={`/tracking/${b.id}`} className="ud-btn-track">
              📍 Track Ride
            </Link>
          )}
          {showReceipt && (
            <button
              className="ud-btn-receipt"
              onClick={() => printBookingReceipt(b, "user")}
            >
              🧾 Download Receipt
            </button>
          )}
          <Link to="/bookings" className="ud-btn-ghost-sm">View Details</Link>
        </div>
      </div>
    </article>
  );
}