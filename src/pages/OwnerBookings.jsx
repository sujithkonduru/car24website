import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";
import { carImageUrl } from "../utils/carImage.js";
import "./OwnerBookings.css";

function formatDt(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch { return iso; }
}

function formatINR(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

const STATUS_CONFIG = {
  upcoming:  { label: "Upcoming",  cls: "owb-pill--upcoming" },
  ongoing:   { label: "Ongoing",   cls: "owb-pill--ongoing" },
  completed: { label: "Completed", cls: "owb-pill--completed" },
  cancelled: { label: "Cancelled", cls: "owb-pill--cancelled" },
  pending:   { label: "Pending",   cls: "owb-pill--pending" },
};

export default function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await api.getOwnerBookings();
      setBookings(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setError(e.message || "Could not load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered =
    filter === "all"
      ? bookings
      : bookings.filter((b) => (b.display_status || b.status) === filter);

  const counts = bookings.reduce((acc, b) => {
    const s = b.display_status || b.status;
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const filterOptions = [
    { value: "all", label: `All (${bookings.length})` },
    { value: "upcoming",  label: `Upcoming (${counts.upcoming || 0})` },
    { value: "ongoing",   label: `Ongoing (${counts.ongoing || 0})` },
    { value: "completed", label: `Completed (${counts.completed || 0})` },
    { value: "cancelled", label: `Cancelled (${counts.cancelled || 0})` },
    { value: "pending",   label: `Pending (${counts.pending || 0})` },
  ];

  return (
    <div className="owb-root">
      <div className="owb-header">
        <div>
          <p className="owb-eyebrow">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            Owner Portal
          </p>
          <h1 className="owb-title">Fleet Bookings</h1>
          <p className="muted owb-subtitle">{bookings.length} total booking{bookings.length !== 1 ? "s" : ""} across your cars</p>
        </div>
        <div className="owb-header-nav">
          <Link to="/owner/dashboard" className="btn ghost">← Dashboard</Link>
          <button className="btn ghost" onClick={load}>↻ Refresh</button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="owb-filter-tabs">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            className={`owb-filter-tab${filter === opt.value ? " active" : ""}`}
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {error && <p className="banner error">{error}</p>}

      {loading && (
        <div className="owb-skeleton-list">
          {[1, 2, 3].map((i) => <div key={i} className="owb-skeleton-row" />)}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="owb-empty">
          <span className="owb-empty-icon">📋</span>
          <p>No {filter === "all" ? "" : filter} bookings yet.</p>
          {filter !== "all" && (
            <button className="btn ghost" onClick={() => setFilter("all")}>View all bookings</button>
          )}
        </div>
      )}

      <div className="owb-list">
        {!loading &&
          filtered.map((b) => {
            const statusKey = b.display_status || b.status;
            const statusConf = STATUS_CONFIG[statusKey] || { label: statusKey, cls: "" };
            const thumb = carImageUrl({ images: b.images });

            return (
              <article key={b.id} className="owb-card card">
                <div className="owb-card-img">
                  <img src={thumb} alt={b.model} />
                </div>
                <div className="owb-card-body">
                  <div className="owb-card-top">
                    <div>
                      <h2 className="owb-car-name">{b.model || "Car"}</h2>
                      <p className="muted owb-branch">
                        📍 {b.branch_name}, {b.branch_city}
                      </p>
                    </div>
                    <span className={`owb-pill ${statusConf.cls}`}>{statusConf.label}</span>
                  </div>

                  <dl className="owb-dl">
                    <div>
                      <dt>Pickup</dt>
                      <dd>{formatDt(b.pickupDate)}</dd>
                    </div>
                    <div>
                      <dt>Drop-off</dt>
                      <dd>{formatDt(b.dropoffDate)}</dd>
                    </div>
                    <div>
                      <dt>Total</dt>
                      <dd className="owb-amount">{formatINR(b.totalPrice)}</dd>
                    </div>
                    <div>
                      <dt>Advance</dt>
                      <dd>{formatINR(b.advance_paid)}</dd>
                    </div>
                    <div>
                      <dt>Remaining</dt>
                      <dd>{formatINR(b.remaining_amount)}</dd>
                    </div>
                    <div>
                      <dt>Payment</dt>
                      <dd>{b.payment_status || "—"}</dd>
                    </div>
                    {b.confirmationNumber != null && (
                      <div>
                        <dt>OTP</dt>
                        <dd>
                          <code className="owb-otp">{b.confirmationNumber}</code>
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt>Booking #</dt>
                      <dd>{b.id}</dd>
                    </div>
                  </dl>

                  <div className="owb-car-chips">
                    <span>{b.fuelType}</span>
                    <span>{b.transmission}</span>
                    <span>{b.seatingCapacity} seats</span>
                  </div>
                </div>
              </article>
            );
          })}
      </div>
    </div>
  );
}
