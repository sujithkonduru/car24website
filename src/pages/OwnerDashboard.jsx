import React from "react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getOwnerDashboardData, getOwnerCars } from "../api.js";
import { carImageUrl } from "../utils/carImage.js";
import "./OwnerDashboard.css";

function formatINR(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

const STATUS_CLASS = {
  approved: "owd-badge--approved",
  pending: "owd-badge--pending",
  rejected: "owd-badge--rejected",
};

const PLACEHOLDER = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&q=80";

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [cars, setCars] = useState([]);
  const [expandedCar, setExpandedCar] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching owner dashboard data...");
      
      // Fetch both dashboard data and cars in parallel
      const [dashData, carsData] = await Promise.all([
        getOwnerDashboardData(),
        getOwnerCars(),
      ]);
      
      console.log("Dashboard data:", dashData);
      console.log("Cars data:", carsData);
      console.log("Number of cars:", carsData?.length || 0);
      
      // Set dashboard data
      setDashboardData(dashData);
      
      // Process cars data - handle different response structures
      let carsList = [];
      if (Array.isArray(carsData)) {
        carsList = carsData;
      } else if (carsData?.data && Array.isArray(carsData.data)) {
        carsList = carsData.data;
      } else if (carsData?.cars && Array.isArray(carsData.cars)) {
        carsList = carsData.cars;
      } else {
        carsList = [];
      }
      
      // Ensure each car has required fields with defaults
      const processedCars = carsList.map(car => ({
        ...car,
        total_trips: car.total_trips || 0,
        total_earnings: car.total_earnings || 0,
        monthly_earnings: car.monthly_earnings || 0,
        six_hr_price: car.six_hr_price || 0,
        twelve_hr_price: car.twelve_hr_price || 0,
        twentyfour_hr_price: car.twentyfour_hr_price || 0,
        approvalstatus: car.approvalstatus || car.approval_status || "pending",
        isavailable: car.isavailable !== false,
      }));
      
      console.log("Processed cars:", processedCars);
      setCars(processedCars);
      
    } catch (e) {
      console.error("Failed to load dashboard:", e);
      setError(e.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Calculate statistics from cars data
  const totalEarningsFromCars = cars.reduce((sum, car) => sum + (Number(car.total_earnings) || 0), 0);
  const activeCarsCount = cars.filter(car => car.approvalstatus === 'approved' && car.isavailable).length;
  const pendingCarsCount = cars.filter(car => car.approvalstatus === 'pending').length;
  
  // Sort cars by earnings (highest first)
  const sortedCars = [...cars].sort((a, b) => (Number(b.total_earnings) || 0) - (Number(a.total_earnings) || 0));
  
  // Top earning car
  const topCar = sortedCars[0];

  // Stats cards from dashboard data
  const statsCards = dashboardData?.stats ? [
    { label: "Total Bookings", value: dashboardData.stats.total_bookings || 0, icon: "📋" },
    { label: "Total Earnings", value: formatINR(dashboardData.stats.total_earnings), icon: "💰" },
    { label: "Today's Earnings", value: formatINR(dashboardData.stats.today_earnings), icon: "📈" },
    { label: "This Week", value: formatINR(dashboardData.stats.week_earnings), icon: "🗓️" },
    { label: "This Month", value: formatINR(dashboardData.stats.month_earnings), icon: "📅" },
    { label: "Active Rides", value: dashboardData.stats.active_rides || 0, icon: "🚗" },
    { label: "Upcoming", value: dashboardData.stats.upcoming_rides || 0, icon: "⏰" },
    { label: "Your Fleet", value: cars.length, icon: "🏎️" },
    { label: "Active Cars", value: activeCarsCount, icon: "✅" },
    { label: "Pending Approval", value: pendingCarsCount, icon: "⏳" },
  ] : [];

  // Earnings summary cards
  const earningsSummary = [
    { label: "Total Fleet Earnings", value: formatINR(totalEarningsFromCars), icon: "💰", color: "#10b981" },
    { label: "Average per Car", value: formatINR(cars.length ? totalEarningsFromCars / cars.length : 0), icon: "📊", color: "#3b82f6" },
    { label: "Top Earning Car", value: topCar?.model || "N/A", icon: "🏆", color: "#f59e0b", subValue: topCar?.total_earnings ? formatINR(topCar.total_earnings) : null },
  ];

  const toggleCarDetails = (carId) => {
    setExpandedCar(expandedCar === carId ? null : carId);
  };

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
      {/* Header */}
      <div className="owd-header">
        <div>
          <p className="owd-eyebrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            Owner Dashboard
          </p>
          <h1 className="owd-title">Welcome, {dashboardData?.owner?.name || user?.name || "Owner"}</h1>
          <p className="muted owd-subtitle">{dashboardData?.owner?.email || user?.email}</p>
        </div>
        <div className="owd-header-actions">
          <Link to="/car-register" className="btn primary">+ Add New Car</Link>
          <Link to="/owner/bookings" className="btn ghost">Fleet Bookings</Link>
          <Link to="/profile" className="btn ghost">Profile</Link>
        </div>
      </div>

      {error && (
        <div className="banner error">
          <p>{error}</p>
          <button onClick={load} className="btn small ghost" style={{ marginTop: "8px" }}>
            Retry
          </button>
        </div>
      )}

      {/* Stats Bento Grid */}
      {statsCards.length > 0 && (
        <div className="owd-bento">
          {statsCards.map((s) => (
            <div key={s.label} className="owd-stat-card">
              <span className="owd-stat-icon">{s.icon}</span>
              <span className="owd-stat-value">{s.value}</span>
              <span className="owd-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Earnings Summary Cards */}
      {cars.length > 0 && (
        <div className="owd-earnings-summary">
          {earningsSummary.map((item, idx) => (
            <div key={idx} className="owd-earnings-card" style={{ borderTopColor: item.color }}>
              <div className="owd-earnings-card-header">
                <span className="owd-earnings-icon">{item.icon}</span>
                <span className="owd-earnings-label">{item.label}</span>
              </div>
              <div className="owd-earnings-value">{item.value}</div>
              {item.subValue && (
                <div className="owd-earnings-subvalue">{item.subValue}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cars Table with Earnings */}
      <div className="owd-section">
        <div className="owd-section-head">
          <h2 className="owd-section-title">Your Fleet ({cars.length})</h2>
          <div className="owd-section-actions">
            <span className="owd-total-earnings-label">
              Total Fleet Earnings: {formatINR(totalEarningsFromCars)}
            </span>
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
                  <th>Approval</th>
                  <th>Total Trips</th>
                  <th>Total Earnings</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedCars.map((car) => {
                  // Safely get image URL
                  let imgUrl = PLACEHOLDER;
                  try {
                    imgUrl = carImageUrl(car);
                  } catch (err) {
                    console.error("Image URL error for car:", car.id, err);
                  }
                  
                  const carEarnings = Number(car.total_earnings) || 0;
                  const tripCount = Number(car.total_trips) || 0;
                  const avgPerTrip = tripCount > 0 ? carEarnings / tripCount : 0;
                  
                  return (
                    <React.Fragment key={car.id}>
                      <tr className={expandedCar === car.id ? "owd-expanded-row" : ""}>
                        <td className="owd-image-cell">
                          <div className="owd-car-thumb">
                            <img 
                              src={imgUrl} 
                              alt={car.model || "Car"} 
                              className="owd-thumb-img"
                              onError={(e) => {
                                e.target.src = PLACEHOLDER;
                              }}
                            />
                          </div>
                        </td>
                        <td className="owd-model-cell">
                          <span className="owd-model-name">{car.model || "N/A"}</span>
                          <span className="owd-fuel-badge">{car.fuelType || "N/A"}</span>
                        </td>
                        <td className="muted">{car.year || "N/A"}</td>
                        <td className="muted">{car.category || "N/A"}</td>
                        <td>
                          <code className="owd-plate">{car.licensePlate || "N/A"}</code>
                        </td>
                        <td>
                          <span className={`owd-badge ${STATUS_CLASS[car.approvalstatus] || ""}`}>
                            {car.approvalstatus || "pending"}
                          </span>
                        </td>
                        <td className="owd-trip-count">{tripCount}</td>
                        <td className="owd-earnings-cell">
                          <span className="owd-car-earnings">{formatINR(carEarnings)}</span>
                          {tripCount > 0 && (
                            <span className="owd-avg-per-trip">Avg: {formatINR(avgPerTrip)}/trip</span>
                          )}
                        </td>
                        <td>
                          <button 
                            className="owd-details-btn"
                            onClick={() => toggleCarDetails(car.id)}
                          >
                            {expandedCar === car.id ? "▼ Hide" : "▶ Details"}
                          </button>
                        </td>
                      </tr>
                      {expandedCar === car.id && (
                        <tr className="owd-details-row">
                          <td colSpan="9">
                            <div className="owd-car-details">
                              <div className="owd-details-grid">
                                <div className="owd-detail-item">
                                  <span className="owd-detail-label">Car Model:</span>
                                  <span className="owd-detail-value">{car.model || "N/A"} ({car.year || "N/A"})</span>
                                </div>
                                <div className="owd-detail-item">
                                  <span className="owd-detail-label">License Plate:</span>
                                  <span className="owd-detail-value">{car.licensePlate || "N/A"}</span>
                                </div>
                                <div className="owd-detail-item">
                                  <span className="owd-detail-label">Total Trips:</span>
                                  <span className="owd-detail-value">{tripCount}</span>
                                </div>
                                <div className="owd-detail-item">
                                  <span className="owd-detail-label">Total Earnings:</span>
                                  <span className="owd-detail-value earnings">{formatINR(carEarnings)}</span>
                                </div>
                                <div className="owd-detail-item">
                                  <span className="owd-detail-label">Monthly Earnings:</span>
                                  <span className="owd-detail-value">{formatINR(car.monthly_earnings || 0)}</span>
                                </div>
                                <div className="owd-detail-item">
                                  <span className="owd-detail-label">Avg per Trip:</span>
                                  <span className="owd-detail-value">{formatINR(avgPerTrip)}</span>
                                </div>
                                <div className="owd-detail-item">
                                  <span className="owd-detail-label">Fuel Type:</span>
                                  <span className="owd-detail-value">{car.fuelType || "N/A"}</span>
                                </div>
                                <div className="owd-detail-item">
                                  <span className="owd-detail-label">Transmission:</span>
                                  <span className="owd-detail-value">{car.transmission || "N/A"}</span>
                                </div>
                                <div className="owd-detail-item">
                                  <span className="owd-detail-label">Seating Capacity:</span>
                                  <span className="owd-detail-value">{car.seatingCapacity || "N/A"} seats</span>
                                </div>
                                <div className="owd-detail-item">
                                  <span className="owd-detail-label">Mileage:</span>
                                  <span className="owd-detail-value">{car.mileage || "N/A"} km</span>
                                </div>
                                <div className="owd-detail-item">
                                  <span className="owd-detail-label">Color:</span>
                                  <span className="owd-detail-value">{car.colour || "N/A"}</span>
                                </div>
                                <div className="owd-detail-item">
                                  <span className="owd-detail-label">Branch:</span>
                                  <span className="owd-detail-value">{car.branch_name || car.branch_city || "N/A"}</span>
                                </div>
                                <div className="owd-detail-item">
                                  <span className="owd-detail-label">Price (6hr):</span>
                                  <span className="owd-detail-value">{formatINR(car.six_hr_price)}</span>
                                </div>
                                <div className="owd-detail-item">
                                  <span className="owd-detail-label">Price (12hr):</span>
                                  <span className="owd-detail-value">{formatINR(car.twelve_hr_price)}</span>
                                </div>
                                <div className="owd-detail-item">
                                  <span className="owd-detail-label">Price (24hr):</span>
                                  <span className="owd-detail-value">{formatINR(car.twentyfour_hr_price)}</span>
                                </div>
                                <div className="owd-detail-item">
                                  <span className="owd-detail-label">Approval Status:</span>
                                  <span className={`owd-detail-value ${car.approvalstatus === 'approved' ? 'text-success' : 'text-warning'}`}>
                                    {car.approvalstatus || "pending"}
                                  </span>
                                </div>
                                <div className="owd-detail-item">
                                  <span className="owd-detail-label">Availability:</span>
                                  <span className={`owd-detail-value ${car.isavailable ? 'text-success' : 'text-danger'}`}>
                                    {car.isavailable ? "Available" : "Not Available"}
                                  </span>
                                </div>
                              </div>
                              <div className="owd-details-actions">
                                <Link to={`/car/${car.id}/edit`} className="btn small ghost">Edit Car</Link>
                                <Link to={`/car/${car.id}/bookings`} className="btn small ghost">View Bookings</Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
              {cars.length > 0 && (
                <tfoot className="owd-table-footer">
                  <tr>
                    <td colSpan="6" className="owd-footer-label">Total Fleet Earnings:</td>
                    <td className="owd-footer-earnings" colSpan="2">
                      <strong>{formatINR(totalEarningsFromCars)}</strong>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan="6" className="owd-footer-label">Average per Car:</td>
                    <td className="owd-footer-earnings" colSpan="2">
                      <strong>{formatINR(cars.length ? totalEarningsFromCars / cars.length : 0)}</strong>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      {/* Chart Section (if chart data is available from backend) */}
      {dashboardData?.chart && dashboardData.chart.length > 0 && (
        <div className="owd-chart-section">
          <h3 className="owd-section-title">Last 7 Days Earnings</h3>
          <div className="owd-chart-container">
            <div className="owd-chart-bars">
              {dashboardData.chart.map((day, idx) => (
                <div key={idx} className="owd-chart-bar-wrapper">
                  <div 
                    className="owd-chart-bar" 
                    style={{ 
                      height: `${Math.min(100, (day.value / Math.max(...dashboardData.chart.map(d => d.value), 1)) * 100)}%`,
                      backgroundColor: day.today ? "#f59e0b" : "#10b981"
                    }}
                  />
                  <span className="owd-chart-label">{day.day}</span>
                  <span className="owd-chart-value">{formatINR(day.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
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