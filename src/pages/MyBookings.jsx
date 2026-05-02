import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { apiPost, apiGet } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { carImageUrl } from "../utils/carImage.js";
import { printBookingReceipt } from "../utils/receiptUtils.js";
import "./MyBooking.css";

function formatDt(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

function statusClass(status) {
  const s = (status || "").toLowerCase();
  if (s === "confirmed") return "mb-status--confirmed";
  if (s === "pending") return "mb-status--pending";
  if (s === "ongoing" || s === "active") return "mb-status--ongoing";
  if (s === "completed") return "mb-status--completed";
  if (s === "cancelled") return "mb-status--cancelled";
  return "mb-status--pending";
}

function statusDot(status) {
  const s = (status || "").toLowerCase();
  if (s === "confirmed") return "✓";
  if (s === "pending") return "⏳";
  if (s === "ongoing" || s === "active") return "▶";
  if (s === "completed") return "✔";
  if (s === "cancelled") return "✕";
  return "•";
}

export default function MyBookings() {
  const { token } = useAuth();
  const [list, setList] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await apiGet("/bookingApi/myBookings", { withAuth: true });
      setList(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setError(e.message || "Could not load bookings");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function cancelBooking(id) {
    if (!window.confirm("Cancel this booking? Advance may be refunded as credits per server rules.")) return;
    setActionId(id);
    try {
      await apiPost(`/bookingApi/cancelBooking/${id}`, {}, { withAuth: true });
      await load();
    } catch (e) {
      setError(e.message || "Cancel failed");
    } finally {
      setActionId(null);
    }
  }

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="mb-page">
      <div className="mb-header">
        <h1 className="mb-title">My Bookings</h1>
        <p className="mb-subtitle">
          {list ? `${list.length} booking${list.length !== 1 ? "s" : ""}` : "Loading your trips…"}
        </p>
      </div>

      {error && (
        <div className="mb-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {loading && (
        <div className="mb-skeleton-list">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-skeleton-card" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      )}

      {!loading && list && list.length === 0 && (
        <div className="mb-empty">
          <div className="mb-empty-icon">🚗</div>
          <p className="mb-empty-title">No bookings yet</p>
          <p className="mb-empty-text">
            You haven't made any bookings. Browse our fleet and find your perfect ride.
          </p>
          <Link to="/" className="mb-empty-btn">Browse Cars →</Link>
        </div>
      )}

      {!loading && list && list.length > 0 && (
        <div className="mb-list">
          {list.map((b, idx) => {
            const thumb = carImageUrl({ images: b.images });
            
            // FIXED: Cannot cancel if:
            // 1. Already cancelled
            // 2. Already completed
            // 3. Used credits (since credits can't be refunded)
            // 4. Booking is in the past (completed)
            // 5. Payment is completed (ride already finished)
            const isCancelled = b.status === "cancelled";
            const isCompleted = b.status === "completed";
            const isOngoing = b.status === "ongoing" || b.status === "active";
            const isConfirmed = b.status === "confirmed";
            const isPending = b.status === "pending";
            const usedCredits = Number(b.credits_used || 0) > 0;
            
            // Can cancel only if NOT cancelled, NOT completed, and NOT used credits
            const canCancel = !isCancelled && !isCompleted && !usedCredits && (isConfirmed || isOngoing || isPending);
            
            const displayStatus = b.display_status || b.status || "pending";

            return (
              <article key={b.id} className="mb-card" style={{ animationDelay: `${idx * 0.06}s` }}>
                <div className="mb-thumb-wrap">
                  <img src={thumb} alt={b.model || "Car"} className="mb-thumb" loading="lazy" />
                </div>

                <div className="mb-body">
                  <div className="mb-top">
                    <div>
                      <h2 className="mb-model">{b.model || "Car"}</h2>
                      {(b.branch_name || b.branch_city) && (
                        <p className="mb-branch">📍 {b.branch_name}{b.branch_city ? `, ${b.branch_city}` : ""}</p>
                      )}
                    </div>
                    <span className={`mb-status ${statusClass(displayStatus)}`}>
                      {statusDot(displayStatus)} {displayStatus}
                    </span>
                  </div>

                  <div className="mb-details">
                    <div className="mb-detail">
                      <span className="mb-detail-label">Pickup</span>
                      <span className="mb-detail-value">{formatDt(b.pickupDate)}</span>
                    </div>
                    <div className="mb-detail">
                      <span className="mb-detail-label">Drop-off</span>
                      <span className="mb-detail-value">{formatDt(b.dropoffDate)}</span>
                    </div>
                    <div className="mb-detail">
                      <span className="mb-detail-label">Total</span>
                      <span className="mb-detail-value mb-detail-value--price">
                        ₹{Number(b.totalPrice || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="mb-detail">
                      <span className="mb-detail-label">Payment</span>
                      <span className="mb-detail-value">{b.payment_status || "—"}</span>
                    </div>
                    {b.confirmationNumber != null && (
                      <div className="mb-detail">
                        <span className="mb-detail-label">OTP</span>
                        <span className="mb-detail-value mb-detail-value--otp">{String(b.confirmationNumber)}</span>
                      </div>
                    )}
                    {usedCredits && (
                      <div className="mb-detail">
                        <span className="mb-detail-label">Credits Used</span>
                        <span className="mb-detail-value">₹{Number(b.credits_used).toLocaleString("en-IN")}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-actions">
                    <Link to="/" className="mb-btn-ghost">Browse more</Link>
                    
                    {/* Show receipt for completed or confirmed bookings */}
                    {(b.status === "completed" || b.status === "confirmed") && (
                      <button
                        type="button"
                        className="mb-btn-ghost"
                        onClick={() => printBookingReceipt(b, "user")}
                      >
                        🧾 Receipt
                      </button>
                    )}
                    
                    {/* Show track button for ongoing/active bookings */}
                    {["confirmed", "ongoing", "active"].includes(b.status?.toLowerCase()) && (
                      <Link to={`/carGps/${b.id}`} className="mb-btn-ghost">
                        📍 Track
                      </Link>
                    )}
                    
                    {/* Show cancel button only if allowed */}
                    {canCancel && (
                      <button
                        type="button"
                        className="mb-btn-danger"
                        disabled={actionId === b.id}
                        onClick={() => cancelBooking(b.id)}
                      >
                        {actionId === b.id ? "Cancelling…" : "Cancel booking"}
                      </button>
                    )}
                    
                    {/* Show message for completed bookings */}
                    {isCompleted && (
                      <span className="mb-completed-message">
                        ✓ Trip completed on {formatDt(b.dropoffDate)}
                      </span>
                    )}
                    
                    {/* Show message for cancelled bookings */}
                    {isCancelled && (
                      <span className="mb-cancelled-message">
                        ✗ Booking cancelled
                      </span>
                    )}
                    
                    {/* Show message for credit bookings */}
                    {usedCredits && isConfirmed && (
                      <span className="mb-credit-message">
                        💰 Paid with credits - Cannot be cancelled
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}