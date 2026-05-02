import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getOwnerDashboardData, getOwnerCars } from "../api.js";
import { carImageUrl } from "../utils/carImage.js";
import "./OwnerDashboard.css";

function formatINR(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

const STATUS_CLASS = {
  approved: "owd-badge--approved",
  pending:  "owd-badge--pending",
  rejected: "owd-badge--rejected",
};

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [stats, setStats]             = useState(null);
  const [cars, setCars]               = useState([]);
  const [chart, setChart]             = useState([]);
  const [expandedCar, setExpandedCar] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ownerRes, carsRes] = await Promise.all([
        getOwnerDashboardData(),
        getOwnerCars(),
      ]);
      setStats(ownerRes?.stats || null);
      setChart(Array.isArray(ownerRes?.chart) ? ownerRes.chart : []);
      setCars(Array.isArray(carsRes) ? carsRes : []);
    } catch (e) {
      setError(e.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const activeCarsCount = cars.filter(c => c.approvalstatus === "approved" && c.isAvailable).length;
  const totalTrips      = cars.reduce((s, c) => s + Number(c.total_trips || 0), 0);
  const topCar          = [...cars].sort((a, b) => Number(b.total_trips || 0) - Number(a.total_trips || 0))[0];

  const statsCards = stats ? [
    { label: "Total Bookings", value: stats.total_bookings || 0,        icon: "📋" },
    { label: "Total Earnings", value: formatINR(stats.total_earnings),  icon: "💰" },
    { label: "Today",          value: formatINR(stats.today_earnings),  icon: "📈" },
    { label: "This Week",      value: formatINR(stats.week_earnings),   icon: "🗓️" },
    { label: "This Month",     value: formatINR(stats.month_earnings),  icon: "📅" },
    { label: "Active Rides",   value: stats.active_rides   || 0,        icon: "🚗" },
    { label: "Upcoming",       value: stats.upcoming_rides || 0,        icon: "⏰" },
    { label: "Fleet Size",     value: cars.length,                      icon: "🏎️" },
    { label: "Active Cars",    value: activeCarsCount,                  icon: "✅" },
  ] : [];

  const earningsSummary = [
    { label: "Total Earnings",   value: formatINR(stats?.total_earnings), icon: "💰", color: "#10b981" },
    { label: "This Month",       value: formatINR(stats?.month_earnings), icon: "📅", color: "#3b82f6" },
    { label: "Top Car by Trips", value: topCar?.model || "N/A",
      subValue: topCar ? `${topCar.total_trips || 0} trips` : null,      icon: "🏆", color: "#f59e0b" },
  ];

  if (loading) {
    return (
      <div className="owd-root">
        <div className="owd-skeleton-header" />
        <div className="owd-skeleton-grid">
          {[...Array(8)].map((_, i) => <div key={i} className="owd-skeleton-card" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="owd-root">

      {/* ── Header ── */}
      <div className="owd-header">
        <div>
          <p className="owd-eyebrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            Owner Dashboard
          </p>
          <h1 className="owd-title">Welcome, {user?.name || "Owner"}</h1>
          <p className="muted owd-subtitle">{user?.email}</p>
        </div>
        <div className="owd-header-actions">
          <Link to="/car-register"   className="btn primary">+ Add New Car</Link>
          <Link to="/owner/bookings" className="btn ghost">Fleet Bookings</Link>
          <Link to="/profile"        className="btn ghost">Profile</Link>
        </div>
      </div>

      {error && <p className="banner error">{error}</p>}

      {/* ── Stats Bento ── */}
      {statsCards.length > 0 && (
        <div className="owd-bento">
          {statsCards.map(s => (
            <div key={s.label} className="owd-stat-card">
              <span className="owd-stat-icon">{s.icon}</span>
              <span className="owd-stat-value">{s.value}</span>
              <span className="owd-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Earnings Summary ── */}
      {stats && (
        <div className="owd-earnings-summary">
          {earningsSummary.map((item, i) => (
            <div key={i} className="owd-earnings-card" style={{ borderTopColor: item.color }}>
              <div className="owd-earnings-card-header">
                <span className="owd-earnings-icon">{item.icon}</span>
                <span className="owd-earnings-label">{item.label}</span>
              </div>
              <div className="owd-earnings-value">{item.value}</div>
              {item.subValue && <div className="owd-earnings-subvalue">{item.subValue}</div>}
            </div>
          ))}
        </div>
      )}

      {/* ── Weekly Chart ── */}
      {chart.length > 0 && (
        <div className="owd-section">
          <div className="owd-section-head">
            <h2 className="owd-section-title">Earnings — Last 7 Days</h2>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80, padding: "0 4px" }}>
            {chart.map((d, i) => {
              const max = Math.max(...chart.map(x => Number(x.value || 0)), 1);
              const h   = Math.max(4, (Number(d.value || 0) / max) * 72);
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 9, color: "#64748B" }}>{Number(d.value) > 0 ? formatINR(d.value) : ""}</div>
                  <div style={{ width: "100%", height: h, background: d.today ? "#10B981" : "#1E2A3A", borderRadius: 4 }} />
                  <div style={{ fontSize: 10, color: d.today ? "#10B981" : "#64748B", fontWeight: d.today ? 700 : 400 }}>{d.day}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Fleet Table ── */}
      <div className="owd-section">
        <div className="owd-section-head">
          <h2 className="owd-section-title">Your Fleet ({cars.length})</h2>
          <div className="owd-section-actions">
            <span className="owd-total-earnings-label">Total Trips: {totalTrips}</span>
            <Link to="/car-register" className="btn small ghost">+ Add Car</Link>
          </div>
        </div>

        {cars.length === 0 ? (
          <div className="owd-empty">
            <span className="owd-empty-icon">🚗</span>
            <p>No cars registered yet.</p>
            <Link to="/car-register" className="btn primary">Register your first car</Link>
          </div>
        ) : (
          <div className="owd-table-wrap">
            <table className="owd-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Model</th>
                  <th>Year</th>
                  <th>Category</th>
                  <th>Plate</th>
                  <th>Status</th>
                  <th>Trips</th>
                  <th>Branch</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cars.map(car => {
                  const imgUrl     = carImageUrl(car);
                  const trips      = Number(car.total_trips || 0);
                  const isExpanded = expandedCar === car.id;

                  return (
                    <>
                      <tr key={car.id} className={isExpanded ? "owd-expanded-row" : ""}>
                        <td>
                          <div className="owd-car-thumb">
                            <img
                              src={imgUrl}
                              alt={car.model}
                              className="owd-thumb-img"
                              onError={e => { e.target.src = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=100&q=80"; }}
                            />
                          </div>
                        </td>
                        <td className="owd-model-cell">
                          <span className="owd-model-name">{car.model}</span>
                          <span className="owd-fuel-badge">{car.fuelType}</span>
                        </td>
                        <td className="muted">{car.year}</td>
                        <td className="muted">{car.category}</td>
                        <td><code className="owd-plate">{car.licensePlate}</code></td>
                        <td>
                          <span className={`owd-badge ${STATUS_CLASS[car.approvalstatus] || ""}`}>
                            {car.approvalstatus}
                          </span>
                        </td>
                        <td className="owd-trip-count">{trips}</td>
                        <td className="muted">{car.branch_name || "—"}</td>
                        <td>
                          <button
                            className="owd-details-btn"
                            onClick={() => setExpandedCar(isExpanded ? null : car.id)}
                          >
                            {isExpanded ? "▼ Hide" : "▶ Details"}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr key={`${car.id}-details`} className="owd-details-row">
                          <td colSpan={9}>
                            <div className="owd-car-details">
                              <div className="owd-details-grid">
                                {[
                                  ["Model",         `${car.model} (${car.year})`],
                                  ["License Plate", car.licensePlate],
                                  ["Transmission",  car.transmission],
                                  ["Fuel Type",     car.fuelType],
                                  ["Seating",       `${car.seatingCapacity} seats`],
                                  ["Mileage",       `${car.mileage || "N/A"} km`],
                                  ["Colour",        car.colour || "—"],
                                  ["Total Trips",   trips],
                                  ["Branch",        car.branch_name || "—"],
                                  ["6hr Price",     formatINR(car.six_hr_price)],
                                  ["12hr Price",    formatINR(car.twelve_hr_price)],
                                  ["24hr Price",    formatINR(car.twentyfour_hr_price)],
                                ].map(([label, val]) => (
                                  <div key={label} className="owd-detail-item">
                                    <span className="owd-detail-label">{label}</span>
                                    <span className="owd-detail-value">{val}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="owd-details-actions">
                                <Link to="/owner/bookings" className="btn small ghost">View Bookings</Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
              <tfoot className="owd-table-footer">
                <tr>
                  <td colSpan={6} className="owd-footer-label">Total Trips (All Cars)</td>
                  <td className="owd-footer-earnings"><strong>{totalTrips}</strong></td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ── Quick Links ── */}
      <div className="owd-quick-links">
        <Link to="/owner/bookings" className="owd-quick-card">
          <span className="owd-quick-icon">📋</span>
          <div>
            <p className="owd-quick-title">Fleet Bookings</p>
            <p className="muted owd-quick-desc">View all bookings for your cars</p>
          </div>
          <span className="owd-quick-arrow">→</span>
        </Link>
        <Link to="/car-register" className="owd-quick-card">
          <span className="owd-quick-icon">➕</span>
          <div>
            <p className="owd-quick-title">Register New Car</p>
            <p className="muted owd-quick-desc">Add a car to your fleet</p>
          </div>
          <span className="owd-quick-arrow">→</span>
        </Link>
        <Link to="/profile" className="owd-quick-card">
          <span className="owd-quick-icon">👤</span>
          <div>
            <p className="owd-quick-title">Profile & Documents</p>
            <p className="muted owd-quick-desc">Update your personal info</p>
          </div>
          <span className="owd-quick-arrow">→</span>
        </Link>
      </div>

    </div>
  );
}