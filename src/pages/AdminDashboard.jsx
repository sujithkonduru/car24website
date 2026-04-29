import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getBranchBookings,
  getBranchCars,
  getBranchRevenue,
  getBranchStaff,
  getOwnerPendingBreakdown,
  // getBranchOwners,
  // getBranchStats,
  // getCarCategories,
  // getBranchAnalytics,
  // getBranchFinancials,
  // getPendingOwnerRequests,
} from "../api.js";
import "./AdminDashboard.css";

function fmt(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

function fmtDate(d) {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-IN", { 
    day: "numeric", 
    month: "short", 
    year: "numeric" 
  });
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Data states
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState([]);
  const [staff, setStaff] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [owners, setOwners] = useState([]);
  const [stats, setStats] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [pendingOwners, setPendingOwners] = useState([]);

  // Filter states
  const [bookingFilter, setBookingFilter] = useState({ 
    status: "", 
    search: "" 
  });
  
  const [carFilter, setCarFilter] = useState({ 
    category: "", 
    status: "" 
  });

  function showNotification(text, type = "success") {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "overview") {
        const [rev, stat, cat, anal, fin] = await Promise.allSettled([
          getBranchRevenue(),
          // getBranchStats(),
          // getCarCategories(),
          // getBranchAnalytics(),
          // getBranchFinancials()
        ]);
        if (rev.status === "fulfilled") setRevenue(rev.value);
        if (stat.status === "fulfilled") setStats(stat.value);
        if (cat.status === "fulfilled") setCategories(cat.value?.data || cat.value || []);
        if (anal.status === "fulfilled") setAnalytics(anal.value);
        if (fin.status === "fulfilled") setFinancials(fin.value);
        
        const bookingsData = await getBranchBookings({ limit: 5 });
        setBookings(bookingsData?.data || bookingsData || []);
      }
      
      if (activeTab === "bookings") {
        const data = await getBranchBookings(bookingFilter);
        setBookings(data?.data || data || []);
      }
      
      if (activeTab === "cars") {
        const data = await getBranchCars(carFilter);
        setCars(data?.data || data || []);
      }
      
      if (activeTab === "staff") {
        const data = await getBranchStaff();
        setStaff(data?.data || data || []);
      }
      
      if (activeTab === "owners") {
        const [ownersData, pendingData] = await Promise.allSettled([
          getBranchOwners(),
          getPendingOwnerRequests()
        ]);
        if (ownersData.status === "fulfilled") setOwners(ownersData.value?.data || ownersData.value || []);
        if (pendingData.status === "fulfilled") setPendingOwners(pendingData.value?.data || pendingData.value || []);
      }
      
      if (activeTab === "payments") {
        const data = await getOwnerPendingBreakdown();
        setPendingPayments(data?.data || data || []);
      }
    } catch (err) {
      showNotification(err.message || "Failed to load data", "error");
    }
    setLoading(false);
  }, [activeTab, bookingFilter, carFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const tabs = [
    { id: "overview", label: "Dashboard", icon: "📊" },
    { id: "bookings", label: "Bookings", icon: "📅" },
    { id: "cars", label: "Fleet", icon: "🚗" },
    { id: "owners", label: "Owners", icon: "👥" },
    { id: "staff", label: "Staff", icon: "👨‍💼" },
    { id: "payments", label: "Payments", icon: "💰" },
  ];

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">🚗 CarRental</div>
          <div className="role-badge">{user?.branch_name || "Admin"}</div>
        </div>
        
        <nav className="sidebar-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="nav-item logout" 
            onClick={() => { 
              logout(); 
              navigate("/staff/login"); 
            }}
          >
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="page-title">
            <h1>{tabs.find(t => t.id === activeTab)?.label}</h1>
            <p className="breadcrumb">
              Dashboard / {tabs.find(t => t.id === activeTab)?.label}
            </p>
          </div>
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">Branch Administrator (Read Only)</span>
            </div>
          </div>
        </header>

        {/* Notification Banner */}
        {notification && (
          <div className={`notification-banner ${notification.type}`}>
            {notification.text}
          </div>
        )}

        {/* Content Area */}
        <div className="content-area">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading data...</p>
            </div>
          )}

          {/* Dashboard Overview Tab */}
          {!loading && activeTab === "overview" && (
            <div className="tab-content">
              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-info">
                    <span className="stat-value">{fmt(revenue?.totalRevenue || 0)}</span>
                    <span className="stat-label">Total Revenue</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📤</div>
                  <div className="stat-info">
                    <span className="stat-value">{fmt(revenue?.branchProfit || 0)}</span>
                    <span className="stat-label">Branch Profit</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🚗</div>
                  <div className="stat-info">
                    <span className="stat-value">{stats?.totalCars || cars.length || 0}</span>
                    <span className="stat-label">Total Cars</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <div className="stat-info">
                    <span className="stat-value">{stats?.totalBookings || bookings.length || 0}</span>
                    <span className="stat-label">Total Bookings</span>
                  </div>
                </div>
              </div>

              {/* Analytics Section */}
              {analytics && (
                <div className="data-card">
                  <div className="card-header">
                    <h3>Branch Analytics</h3>
                    <button className="btn-icon" disabled style={{ opacity: 0.5 }}>📈</button>
                  </div>
                  <div className="analytics-grid">
                    <div className="analytics-item">
                      <span className="analytics-label">Active Bookings</span>
                      <span className="analytics-value">{analytics.activeBookings || 0}</span>
                    </div>
                    <div className="analytics-item">
                      <span className="analytics-label">Available Cars</span>
                      <span className="analytics-value">{analytics.availableCars || 0}</span>
                    </div>
                    <div className="analytics-item">
                      <span className="analytics-label">Utilization Rate</span>
                      <span className="analytics-value">{analytics.utilizationRate || 0}%</span>
                    </div>
                    <div className="analytics-item">
                      <span className="analytics-label">Avg. Daily Revenue</span>
                      <span className="analytics-value">{fmt(analytics.avgDailyRevenue || 0)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Bookings */}
              {bookings.length > 0 && (
                <div className="data-card">
                  <div className="card-header">
                    <h3>Recent Bookings</h3>
                    <button 
                      className="btn-text" 
                      onClick={() => setActiveTab("bookings")}
                    >
                      View All →
                    </button>
                  </div>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Customer</th>
                          <th>Car</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 5).map((booking) => (
                          <tr key={booking.id}>
                            <td>#{booking.id}</td>
                            <td>{booking.customer_name}</td>
                            <td>{booking.car_model}</td>
                            <td className="amount">{fmt(booking.amount)}</td>
                            <td>
                              <span className={`status-badge ${booking.status}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td>{fmtDate(booking.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bookings Tab - Read Only */}
          {!loading && activeTab === "bookings" && (
            <div className="tab-content">
              <div className="data-card">
                <div className="card-header">
                  <h3>All Bookings</h3>
                  <div className="filter-bar">
                    <select
                      value={bookingFilter.status}
                      onChange={(e) => setBookingFilter({ ...bookingFilter, status: e.target.value })}
                      className="filter-select"
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Search customer..."
                      value={bookingFilter.search}
                      onChange={(e) => setBookingFilter({ ...bookingFilter, search: e.target.value })}
                      className="filter-input"
                    />
                    <button className="btn-primary" onClick={loadData}>Apply Filter</button>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Car</th>
                        <th>Pickup Date</th>
                        <th>Return Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="empty-state">No bookings found</td>
                        </tr>
                      ) : (
                        bookings.map((booking) => (
                          <tr key={booking.id}>
                            <td>#{booking.id}</td>
                            <td>
                              <div>
                                <div>{booking.customer_name}</div>
                                <small className="text-muted">{booking.customer_phone}</small>
                              </div>
                            </td>
                            <td>{booking.car_model}</td>
                            <td>{fmtDate(booking.pickup_date)}</td>
                            <td>{fmtDate(booking.return_date)}</td>
                            <td className="amount">{fmt(booking.amount)}</td>
                            <td>
                              <span className={`status-badge ${booking.status}`}>
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Cars / Fleet Tab - Read Only */}
          {!loading && activeTab === "cars" && (
            <div className="tab-content">
              <div className="data-card">
                <div className="card-header">
                  <h3>Fleet Management</h3>
                  <span className="badge info">Read Only Mode</span>
                </div>
                
                {/* Filters */}
                <div className="filter-bar" style={{ marginBottom: "1rem" }}>
                  <select
                    value={carFilter.status}
                    onChange={(e) => setCarFilter({ ...carFilter, status: e.target.value })}
                    className="filter-select"
                  >
                    <option value="">All Status</option>
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                  <button className="btn-primary" onClick={loadData}>Filter</button>
                </div>

                {/* Cars Grid - No edit/delete buttons */}
                <div className="cars-grid">
                  {cars.length === 0 ? (
                    <div className="empty-state">No cars found</div>
                  ) : (
                    cars.map((car) => (
                      <div key={car.id} className="car-card">
                        <div className="car-image">
                          <div className="car-placeholder">🚗</div>
                          <span className={`car-status ${car.status}`}>{car.status}</span>
                        </div>
                        <div className="car-details">
                          <h4>{car.brand} {car.model}</h4>
                          <p className="car-plate">{car.plate_number}</p>
                          <div className="car-specs">
                            <span>📅 {car.year || "N/A"}</span>
                            <span>🏷️ {car.category_name || "Uncategorized"}</span>
                          </div>
                          <div className="car-pricing">
                            <span className="price">{fmt(car.daily_rate)}/day</span>
                            <span className="price">{fmt(car.hourly_rate)}/hr</span>
                          </div>
                          <div className="car-actions-readonly">
                            <span className="readonly-badge">View Only</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Owners Tab - Read Only */}
          {!loading && activeTab === "owners" && (
            <div className="tab-content">
              {/* Pending Owner Approvals - Read Only */}
              {pendingOwners.length > 0 && (
                <div className="data-card">
                  <div className="card-header">
                    <h3>Pending Owner Approvals</h3>
                    <span className="badge warning">{pendingOwners.length} Pending</span>
                  </div>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Owner Name</th>
                          <th>Email</th>
                          <th>Mobile</th>
                          <th>Registered</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingOwners.map((owner) => (
                          <tr key={owner.id}>
                            <td><strong>{owner.name}</strong></td>
                            <td>{owner.email}</td>
                            <td>{owner.mobile_no}</td>
                            <td>{fmtDate(owner.created_at)}</td>
                            <td>
                              <span className="status-badge pending">Pending Approval</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* All Owners */}
              <div className="data-card">
                <div className="card-header">
                  <h3>All Car Owners</h3>
                  <span className="badge">{owners.length} Owners</span>
                </div>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Owner Name</th>
                        <th>Contact</th>
                        <th>Email</th>
                        <th>Total Cars</th>
                        <th>Status</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {owners.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="empty-state">No owners found</td>
                        </tr>
                      ) : (
                        owners.map((owner) => (
                          <tr key={owner.id}>
                            <td>
                              <div className="member-info">
                                <div className="member-avatar">{owner.name?.charAt(0)}</div>
                                <div>
                                  <div className="member-name">{owner.name}</div>
                                </div>
                              </div>
                            </td>
                            <td>{owner.mobile_no}</td>
                            <td>{owner.email}</td>
                            <td>{owner.total_cars || 0}</td>
                            <td>
                              <span className={`status-badge ${owner.status || "active"}`}>
                                {owner.status || "Active"}
                              </span>
                            </td>
                            <td>{fmtDate(owner.created_at)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Staff Tab - Read Only */}
          {!loading && activeTab === "staff" && (
            <div className="tab-content">
              <div className="data-card">
                <div className="card-header">
                  <h3>Staff Members</h3>
                  <span className="badge">{staff.length} Members</span>
                </div>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Staff Member</th>
                        <th>Contact</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="empty-state">No staff members found</td>
                        </tr>
                      ) : (
                        staff.map((member) => (
                          <tr key={member.id}>
                            <td>
                              <div className="member-info">
                                <div className="member-avatar">{member.name?.charAt(0)}</div>
                                <div>
                                  <div className="member-name">{member.name}</div>
                                  <div className="member-email">{member.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>{member.mobile_no}</td>
                            <td>{member.email}</td>
                            <td>
                              <span className={`role-badge ${member.role}`}>
                                {member.role || "staff"}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge ${member.is_verified ? "active" : "pending"}`}>
                                {member.is_verified ? "Verified" : "Pending"}
                              </span>
                            </td>
                            <td>{fmtDate(member.created_at)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Payments Tab - Read Only */}
          {!loading && activeTab === "payments" && (
            <div className="tab-content">
              <div className="data-card">
                <div className="card-header">
                  <h3>Pending Owner Payments</h3>
                  <span className="badge warning">{pendingPayments.length} Pending</span>
                </div>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Owner Name</th>
                        <th>Branch</th>
                        <th>Amount</th>
                        <th>Due Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingPayments.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="empty-state">No pending payments</td>
                        </tr>
                      ) : (
                        pendingPayments.map((payment) => (
                          <tr key={payment.id}>
                            <td><strong>{payment.owner_name}</strong></td>
                            <td>{payment.branch_name}</td>
                            <td className="amount">{fmt(payment.amount)}</td>
                            <td>{fmtDate(payment.due_date)}</td>
                            <td>
                              <span className="status-badge pending">Pending</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}