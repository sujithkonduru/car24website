import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet } from "../api.js";
import { carImageUrl } from "../utils/carImage.js";
import "./LiveTracking.css";

function formatDt(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

function formatElapsed(isoStart) {
  if (!isoStart) return "—";
  const diff = Date.now() - new Date(isoStart).getTime();
  if (diff < 0) return "Not started";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// Simulated route waypoints (lat/lng offsets for animation)
const ROUTE_POINTS = [
  { x: 20, y: 65 }, { x: 25, y: 58 }, { x: 32, y: 52 },
  { x: 40, y: 48 }, { x: 48, y: 44 }, { x: 55, y: 40 },
  { x: 62, y: 38 }, { x: 70, y: 35 }, { x: 78, y: 33 },
];

export default function LiveTracking() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState("—");
  const [carPos, setCarPos] = useState(0); // index into ROUTE_POINTS
  const [progress, setProgress] = useState(0); // 0-100
  const animRef = useRef(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await apiGet(`/bookingApi/booking/${bookingId}`, { withAuth: true });
        setBooking(data);
      } catch (e) {
        setError(e.message || "Could not load booking");
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId]);

  // Live elapsed timer
  useEffect(() => {
    if (!booking?.ride_start_time) return;
    const t = setInterval(() => setElapsed(formatElapsed(booking.ride_start_time)), 1000);
    return () => clearInterval(t);
  }, [booking?.ride_start_time]);

  // Simulate car movement along route
  useEffect(() => {
    if (!booking) return;
    const isActive = booking.ride_start_time && !booking.ride_end_time;
    if (!isActive) return;

    let step = 0;
    animRef.current = setInterval(() => {
      step = (step + 1) % ROUTE_POINTS.length;
      setCarPos(step);
      setProgress(Math.round((step / (ROUTE_POINTS.length - 1)) * 100));
    }, 2000);
    return () => clearInterval(animRef.current);
  }, [booking]);

  // Calculate time progress
  const timeProgress = (() => {
    if (!booking?.pickupDate || !booking?.dropoffDate) return 0;
    const start = new Date(booking.pickupDate).getTime();
    const end = new Date(booking.dropoffDate).getTime();
    const now = Date.now();
    return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
  })();

  const isActive = booking?.ride_start_time && !booking?.ride_end_time;
  const isCompleted = !!booking?.ride_end_time;
  const isPending = !booking?.ride_start_time;

  if (loading) {
    return (
      <div className="lt-root">
        <div className="lt-skeleton-map" />
        <div className="lt-skeleton-info" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="lt-root">
        <div className="lt-error">
          <span>⚠️</span>
          <p>{error || "Booking not found"}</p>
          <Link to="/bookings" className="lt-btn-back">← Back to Bookings</Link>
        </div>
      </div>
    );
  }

  const thumb = carImageUrl({ images: booking.images });
  const pt = ROUTE_POINTS[carPos];

  return (
    <div className="lt-root">
      <Link to="/dashboard" className="lt-back-link">← Back to Dashboard</Link>

      <div className="lt-layout">
        {/* Map Panel */}
        <div className="lt-map-panel">
          <div className="lt-map-header">
            <h2>Live Tracking</h2>
            <span className={`lt-status-pill ${isActive ? "active" : isCompleted ? "completed" : "pending"}`}>
              {isActive ? "🟢 Ride in Progress" : isCompleted ? "✅ Completed" : "⏳ Awaiting Pickup"}
            </span>
          </div>

          {/* Simulated Map */}
          <div className="lt-map">
            <div className="lt-map-bg">
              {/* Grid lines */}
              {[...Array(8)].map((_, i) => (
                <div key={`h${i}`} className="lt-grid-h" style={{ top: `${(i + 1) * 11}%` }} />
              ))}
              {[...Array(8)].map((_, i) => (
                <div key={`v${i}`} className="lt-grid-v" style={{ left: `${(i + 1) * 11}%` }} />
              ))}

              {/* Route path */}
              <svg className="lt-route-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline
                  points={ROUTE_POINTS.map(p => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke="rgba(20,184,166,0.3)"
                  strokeWidth="0.8"
                  strokeDasharray="2,1"
                />
                <polyline
                  points={ROUTE_POINTS.slice(0, carPos + 1).map(p => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="1.2"
                />
              </svg>

              {/* Start marker */}
              <div className="lt-marker lt-marker-start" style={{ left: `${ROUTE_POINTS[0].x}%`, top: `${ROUTE_POINTS[0].y}%` }}>
                <div className="lt-marker-dot lt-marker-dot--green" />
                <span className="lt-marker-label">Pickup</span>
              </div>

              {/* End marker */}
              <div className="lt-marker lt-marker-end" style={{ left: `${ROUTE_POINTS[ROUTE_POINTS.length - 1].x}%`, top: `${ROUTE_POINTS[ROUTE_POINTS.length - 1].y}%` }}>
                <div className="lt-marker-dot lt-marker-dot--red" />
                <span className="lt-marker-label">Drop-off</span>
              </div>

              {/* Car marker */}
              {isActive && (
                <div
                  className="lt-car-marker"
                  style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                >
                  <div className="lt-car-pulse" />
                  <span className="lt-car-icon">🚗</span>
                </div>
              )}

              {/* Map overlay info */}
              <div className="lt-map-overlay">
                <div className="lt-overlay-item">
                  <span className="lt-overlay-label">Booking</span>
                  <span className="lt-overlay-value">#{bookingId}</span>
                </div>
                {isActive && (
                  <div className="lt-overlay-item">
                    <span className="lt-overlay-label">Elapsed</span>
                    <span className="lt-overlay-value lt-overlay-value--accent">{elapsed}</span>
                  </div>
                )}
              </div>

              {/* Simulated disclaimer */}
              <div className="lt-map-disclaimer">
                Simulated tracking — live GPS integration available
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {isActive && (
            <div className="lt-progress-section">
              <div className="lt-progress-labels">
                <span>Trip Progress</span>
                <span>{timeProgress}%</span>
              </div>
              <div className="lt-progress-bar">
                <div className="lt-progress-fill" style={{ width: `${timeProgress}%` }} />
              </div>
              <div className="lt-progress-times">
                <span>{formatDt(booking.pickupDate)}</span>
                <span>{formatDt(booking.dropoffDate)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="lt-info-panel">
          {/* Car Info */}
          <div className="lt-card">
            <div className="lt-card-thumb">
              <img src={thumb} alt={booking.model || "Car"} />
            </div>
            <div className="lt-card-body">
              <h3>{booking.model || "Car"}</h3>
              {booking.licensePlate && (
                <code className="lt-plate">{booking.licensePlate}</code>
              )}
              <div className="lt-car-chips">
                {booking.fuelType && <span>{booking.fuelType}</span>}
                {booking.transmission && <span>{booking.transmission}</span>}
                {booking.seatingCapacity && <span>{booking.seatingCapacity} seats</span>}
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="lt-details-card">
            <h3 className="lt-details-title">Booking Details</h3>
            <div className="lt-details-grid">
              <div className="lt-detail">
                <span className="lt-detail-label">Booking ID</span>
                <span className="lt-detail-value">#{bookingId}</span>
              </div>
              <div className="lt-detail">
                <span className="lt-detail-label">Status</span>
                <span className="lt-detail-value">
                  {isActive ? "Ongoing" : isCompleted ? "Completed" : "Pending Pickup"}
                </span>
              </div>
              <div className="lt-detail">
                <span className="lt-detail-label">Pickup</span>
                <span className="lt-detail-value">{formatDt(booking.pickupDate)}</span>
              </div>
              <div className="lt-detail">
                <span className="lt-detail-label">Drop-off</span>
                <span className="lt-detail-value">{formatDt(booking.dropoffDate)}</span>
              </div>
              {booking.branch_name && (
                <div className="lt-detail">
                  <span className="lt-detail-label">Branch</span>
                  <span className="lt-detail-value">{booking.branch_name}{booking.branch_city ? `, ${booking.branch_city}` : ""}</span>
                </div>
              )}
              <div className="lt-detail">
                <span className="lt-detail-label">Total</span>
                <span className="lt-detail-value lt-detail-price">
                  ₹{Number(booking.totalPrice || 0).toLocaleString("en-IN")}
                </span>
              </div>
              {booking.confirmationNumber != null && (
                <div className="lt-detail">
                  <span className="lt-detail-label">OTP</span>
                  <span className="lt-detail-value lt-detail-otp">{booking.confirmationNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Ride Stats (active only) */}
          {isActive && (
            <div className="lt-stats-card">
              <div className="lt-ride-stat">
                <span className="lt-ride-stat-icon">⏱</span>
                <span className="lt-ride-stat-value">{elapsed}</span>
                <span className="lt-ride-stat-label">Elapsed</span>
              </div>
              <div className="lt-ride-stat">
                <span className="lt-ride-stat-icon">📍</span>
                <span className="lt-ride-stat-value">{progress}%</span>
                <span className="lt-ride-stat-label">Route</span>
              </div>
              <div className="lt-ride-stat">
                <span className="lt-ride-stat-icon">🕐</span>
                <span className="lt-ride-stat-value">{timeProgress}%</span>
                <span className="lt-ride-stat-label">Time Used</span>
              </div>
            </div>
          )}

          {/* Support */}
          <div className="lt-support-card">
            <p className="lt-support-title">Need help?</p>
            <p className="lt-support-text">Contact our 24/7 support team for any assistance during your ride.</p>
            <a href="tel:+916281704664" className="lt-support-btn">📞 Call Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
