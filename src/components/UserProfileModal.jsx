import { X, Phone, Hash, Calendar, Car, DollarSign, CheckCircle, User, Clock } from "lucide-react";
import "./UserProfileModal.css";

function fmt(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

function formatINR(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

/**
 * UserProfileModal — shows customer profile before key verification.
 * Props:
 *   booking: task/booking object from getStaffTasks()
 *   onClose: () => void
 *   onProceed: () => void   (optional, pre-fills verify form)
 */
export default function UserProfileModal({ booking, onClose, onProceed }) {
  if (!booking) return null;

  const name = booking.customer_name || "Customer";
  const phone = booking.customer_phone || "—";
  const email = booking.customer_email || null;
  const bookingId = booking.booking_id || booking.id;
  const carModel = booking.car_model || booking.model || "N/A";
  const carPlate = booking.car_plate || booking.licenseplate || "N/A";
  const otp = booking.confirmationNumber;
  const totalAmount = Number(booking.total_amount || booking.totalPrice || 0);
  const advancePaid = Number(booking.advance_paid || 0);
  const remaining = totalAmount - advancePaid;
  const initial = name.charAt(0).toUpperCase();

  const status = (() => {
    if (booking.ride_end_time) return "completed";
    if (booking.ride_start_time) return "active";
    return "pending";
  })();

  const STATUS_LABELS = {
    pending: "Pending Pickup",
    active: "Ride Active",
    completed: "Completed",
  };
  const STATUS_COLORS = {
    pending: "#f59e0b",
    active: "#14b8a6",
    completed: "#10b981",
  };

  function handleProceed() {
    if (onProceed) onProceed(bookingId);
    onClose();
  }

  return (
    <div className="upm-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Customer Profile">
      <div className="upm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="upm-header">
          <div className="upm-header-left">
            <User size={16} />
            <span>Customer Profile</span>
          </div>
          <button className="upm-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="upm-body">
          {/* Avatar + name */}
          <div className="upm-identity">
            <div className="upm-avatar">{initial}</div>
            <div className="upm-identity-info">
              <h3 className="upm-name">{name}</h3>
              {phone !== "—" && (
                <a href={`tel:${phone}`} className="upm-phone">
                  <Phone size={13} />
                  {phone}
                </a>
              )}
              {email && <span className="upm-email">{email}</span>}
            </div>
            <span
              className="upm-status-pill"
              style={{ background: STATUS_COLORS[status] + "22", color: STATUS_COLORS[status], borderColor: STATUS_COLORS[status] + "44" }}
            >
              {STATUS_LABELS[status]}
            </span>
          </div>

          {/* Booking summary grid */}
          <div className="upm-grid">
            <div className="upm-grid-item">
              <Hash size={13} />
              <div>
                <span className="upm-grid-label">Booking ID</span>
                <span className="upm-grid-value upm-code">#{bookingId}</span>
              </div>
            </div>
            <div className="upm-grid-item">
              <Car size={13} />
              <div>
                <span className="upm-grid-label">Vehicle</span>
                <span className="upm-grid-value">{carModel}</span>
              </div>
            </div>
            <div className="upm-grid-item">
              <span className="upm-plate-icon">🪪</span>
              <div>
                <span className="upm-grid-label">License Plate</span>
                <span className="upm-grid-value upm-code">{carPlate}</span>
              </div>
            </div>
            {otp != null && (
              <div className="upm-grid-item upm-grid-item--otp">
                <span style={{ fontSize: "1rem" }}>🔑</span>
                <div>
                  <span className="upm-grid-label">Confirmation OTP</span>
                  <span className="upm-grid-value upm-otp">{String(otp)}</span>
                </div>
              </div>
            )}
            {booking.pickupDate && (
              <div className="upm-grid-item">
                <Calendar size={13} />
                <div>
                  <span className="upm-grid-label">Pickup</span>
                  <span className="upm-grid-value">{fmt(booking.pickupDate)}</span>
                </div>
              </div>
            )}
            {booking.dropoffDate && (
              <div className="upm-grid-item">
                <Clock size={13} />
                <div>
                  <span className="upm-grid-label">Return</span>
                  <span className="upm-grid-value">{fmt(booking.dropoffDate)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Payment summary */}
          <div className="upm-payment">
            <div className="upm-payment-row">
              <span>Total Amount</span>
              <strong>{formatINR(totalAmount)}</strong>
            </div>
            <div className="upm-payment-row upm-payment-row--paid">
              <span>Advance Paid</span>
              <strong>{formatINR(advancePaid)}</strong>
            </div>
            <div className={`upm-payment-row upm-payment-row--${remaining > 0 ? "remaining" : "clear"}`}>
              <span>Remaining</span>
              <strong>{formatINR(remaining)}</strong>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="upm-footer">
          <button className="upm-btn-secondary" onClick={onClose}>
            Close
          </button>
          {onProceed && status === "pending" && (
            <button className="upm-btn-primary" onClick={handleProceed}>
              <CheckCircle size={15} />
              Proceed to Key Verify
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
