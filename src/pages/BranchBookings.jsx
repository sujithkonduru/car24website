import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getBranchBookings, updateBookingStatus } from "../api.js";
import { formatINR, formatDateTime } from "../utils/formatters.js";
import { Search, RefreshCw, AlertCircle, Calendar, Car, User, MapPin, TrendingUp, CheckCircle, XCircle, Eye, Key } from 'lucide-react';
import "./BranchBooking.css";

export default function BranchBookings() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBranchBookings(filter);
      const data = res?.data || res;

      if (!Array.isArray(data)) {
        throw new Error("Invalid response from server");
      }

      setBookings(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, status) => {
    if (!confirm(`Are you sure you want to ${status} this booking?`)) return;
    
    try {
      await updateBookingStatus(bookingId, status);
      alert(`Booking ${status} successfully!`);
      loadBookings();
    } catch (error) {
      alert(error.message || "Failed to update booking status");
    }
  };

  const filteredBookings = bookings.filter((b) =>
    search === ""
      ? true
      : b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        b.car_model?.toLowerCase().includes(search.toLowerCase()) ||
        b.id?.toString().includes(search) ||
        b.license_plate?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadgeClass = (status) => {
    const statusLower = (status || "").toLowerCase();
    const classes = {
      pending: "status-pending",
      confirmed: "status-confirmed",
      ongoing: "status-ongoing",
      completed: "status-completed",
      cancelled: "status-cancelled"
    };
    return classes[statusLower] || "status-pending";
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    ongoing: bookings.filter(b => b.status === "ongoing").length,
    completed: bookings.filter(b => b.status === "completed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length
  };

  return (
    <div className="branch-bookings-container">
      {/* Header */}
      <div className="bookings-header">
        <h1>Branch Bookings Dashboard</h1>
        <div className="branch-info">
          <p>
            <MapPin size={16} />
            <strong>Branch Head:</strong> {user?.name || "Unknown"}
          </p>
          <p>
            <User size={16} />
            <strong>Role:</strong> 
            <span className="role-badge">branch_head</span>
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-badge">
          <span>📊 Total:</span>
          <span className="stat-count">{stats.total}</span>
        </div>
        <div className="stat-badge">
          <span>⏳ Pending:</span>
          <span className="stat-count">{stats.pending}</span>
        </div>
        <div className="stat-badge">
          <span>✅ Confirmed:</span>
          <span className="stat-count">{stats.confirmed}</span>
        </div>
        <div className="stat-badge">
          <span>▶ Ongoing:</span>
          <span className="stat-count">{stats.ongoing}</span>
        </div>
        <div className="stat-badge">
          <span>✔ Completed:</span>
          <span className="stat-count">{stats.completed}</span>
        </div>
        <div className="stat-badge">
          <span>❌ Cancelled:</span>
          <span className="stat-count">{stats.cancelled}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by customer, car, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <button className="refresh-btn" onClick={loadBookings}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* States */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading bookings...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <AlertCircle className="error-icon" size={48} />
          <p>{error}</p>
          <button className="retry-btn" onClick={loadBookings}>Try Again</button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bookings-table-wrapper">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Car</th>
                <th>Pickup Date</th>
                <th>Dropoff Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" align="center" style={{ padding: "3rem", color: "#94a3b8" }}>
                    <Calendar size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
                    <p>No bookings found</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td>
                      <div className="customer-info">
                        <span className="customer-name">{b.customer_name || "Guest"}</span>
                        {b.customer_phone && (
                          <span className="customer-phone">{b.customer_phone}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="car-info">
                        <span className="car-model">{b.car_model || "N/A"}</span>
                        {b.license_plate && (
                          <span className="car-plate">{b.license_plate}</span>
                        )}
                      </div>
                    </td>
                    <td className="date">
                      {formatDateTime(b.pickup_date) || "-"}
                    </td>
                    <td className="date">
                      {formatDateTime(b.dropoff_date) || "-"}
                    </td>
                    <td className="amount">
                      {formatINR(b.total_price || 0)}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(b.status)}`}>
                        {b.status || "Unknown"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {b.status === "pending" && (
                          <button 
                            className="action-btn btn-confirm"
                            onClick={() => handleUpdateStatus(b.id, "confirmed")}
                          >
                            <CheckCircle size={12} />
                            Confirm
                          </button>
                        )}
                        {b.status === "confirmed" && (
                          <button 
                            className="action-btn btn-start"
                            onClick={() => handleUpdateStatus(b.id, "ongoing")}
                          >
                            <Key size={12} />
                            Start
                          </button>
                        )}
                        {b.status === "ongoing" && (
                          <button 
                            className="action-btn btn-end"
                            onClick={() => handleUpdateStatus(b.id, "completed")}
                          >
                            <CheckCircle size={12} />
                            Complete
                          </button>
                        )}
                        {(b.status === "pending" || b.status === "confirmed") && (
                          <button 
                            className="action-btn btn-cancel"
                            onClick={() => handleUpdateStatus(b.id, "cancelled")}
                          >
                            <XCircle size={12} />
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}