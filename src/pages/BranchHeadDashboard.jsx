import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Calendar,
  Users,
  ClipboardList,
  LogOut,
  Home,
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Key,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { formatINR, formatDateTime } from "../utils/formatters.js";
import api from "../api.js";

/* -------------------------------------------------------------------------- */
/* COLORS */
/* -------------------------------------------------------------------------- */

const C = {
  bg: "#0B0F1A",
  surface: "#111827",
  card: "#161D2E",
  border: "#1E2A3A",
  accent: "#3B82F6",
  green: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
  purple: "#8B5CF6",
  text: "#F1F5F9",
  muted: "#94A3B8",
};

/* -------------------------------------------------------------------------- */
/* STYLES */
/* -------------------------------------------------------------------------- */

const s = {
  root: {
    fontFamily: "'DM Mono', monospace",
    background: C.bg,
    color: C.text,
    minHeight: "100vh",
    display: "flex",
  },

  sidebar: {
    width: 260,
    background: C.surface,
    borderRight: `1px solid ${C.border}`,
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    zIndex: 10,
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    flex: 1,
  },

  navItem: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    background: active ? C.card : "transparent",
    color: active ? C.text : C.muted,
    width: "100%",
    textAlign: "left",
    transition: "all 0.2s",
  }),

  navBadge: {
    background: C.red,
    color: "#fff",
    fontSize: 10,
    borderRadius: 20,
    padding: "2px 6px",
    marginLeft: "auto",
  },

  main: {
    marginLeft: 260,
    flex: 1,
    padding: 24,
  },

  card: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: 18,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: 16,
    marginBottom: 24,
  },

  statCard: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: 20,
    display: "flex",
    alignItems: "center",
    gap: 16,
  },

  statIcon: (color) => ({
    width: 48,
    height: 48,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: color + "20",
    color: color,
  }),

  statValue: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: C.muted,
  },

  section: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: 12,
    borderBottom: `1px solid ${C.border}`,
  },

  td: {
    padding: 12,
    borderBottom: `1px solid ${C.border}`,
  },

  btn: (bg, ghost = false) => ({
    padding: "8px 12px",
    borderRadius: 8,
    border: ghost ? `1px solid ${bg}` : "none",
    background: ghost ? "transparent" : bg,
    color: ghost ? bg : "#fff",
    cursor: "pointer",
    marginRight: 8,
    transition: "opacity 0.2s",
  }),

  input: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: `1px solid ${C.border}`,
    background: C.surface,
    color: C.text,
    marginBottom: 16,
  },

  badge: (color) => ({
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    display: "inline-block",
    background: color + "20",
    color: color,
  }),

  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: "10px 16px",
    marginBottom: 20,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "#000a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },

  modal: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: 24,
    width: 400,
    maxWidth: "90vw",
  },
};

/* -------------------------------------------------------------------------- */
/* COMPONENT */
/* -------------------------------------------------------------------------- */

export default function BranchHeadDashboard() {
  const navigate = useNavigate();
  const { user, isSubAdmin, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [branchId, setBranchId] = useState(null);

  const [stats, setStats] = useState({
    total_cars: 0,
    total_bookings: 0,
    total_revenue: 0,
    active_bookings: 0,
  });
  
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [activities, setActivities] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [bookingFilter, setBookingFilter] = useState("all");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyAction, setVerifyAction] = useState(null);
  const [verifyOtp, setVerifyOtp] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState(null);

  /* ---------------------------------------------------------------------- */
  /* HELPER FUNCTIONS */
  /* ---------------------------------------------------------------------- */

  const toArray = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.bookings)) return res.bookings;
    if (Array.isArray(res?.cars)) return res.cars;
    if (Array.isArray(res?.staff)) return res.staff;
    if (Array.isArray(res?.activities)) return res.activities;
    return [];
  };

  // Calculate booking counts by status
  const getBookingCounts = useMemo(() => {
    if (!Array.isArray(bookings)) {
      return {
        pending: 0,
        confirmed: 0,
        ongoing: 0,
        completed: 0,
        cancelled: 0,
        total: 0,
      };
    }

    return {
      pending: bookings.filter((b) => b.status?.toLowerCase() === "pending").length,
      confirmed: bookings.filter((b) => b.status?.toLowerCase() === "confirmed").length,
      ongoing: bookings.filter((b) => b.status?.toLowerCase() === "ongoing").length,
      completed: bookings.filter((b) => b.status?.toLowerCase() === "completed").length,
      cancelled: bookings.filter((b) => b.status?.toLowerCase() === "cancelled").length,
      total: bookings.length,
    };
  }, [bookings]);

  // Calculate car counts by status
  const getCarCounts = useMemo(() => {
    if (!Array.isArray(cars)) {
      return { available: 0, unavailable: 0, total: 0 };
    }

    return {
      available: cars.filter((c) => c.isAvailable === true || c.is_available === true || c.status === "available").length,
      unavailable: cars.filter((c) => c.isAvailable === false || c.is_available === false || c.status === "unavailable").length,
      total: cars.length,
    };
  }, [cars]);

  // Calculate staff counts by role
  const getStaffCounts = useMemo(() => {
    if (!Array.isArray(staff)) {
      return { branch_head: 0, staff: 0, total: 0 };
    }

    return {
      branch_head: staff.filter((s) => s.role === "branch_head" || s.role === "Branch Head").length,
      staff: staff.filter((s) => s.role === "staff" || s.role === "Staff").length,
      total: staff.length,
    };
  }, [staff]);

  /* ---------------------------------------------------------------------- */
  /* LOAD DATA FUNCTIONS */
  /* ---------------------------------------------------------------------- */

  const loadDashboardStats = useCallback(async () => {
    if (!branchId) return;
    try {
      const response = await api.getBranchDashboardStats(branchId);
      console.log("Dashboard stats:", response);
      setStats({
        total_cars: response?.totalCars || response?.total_cars || 0,
        total_bookings: response?.totalBookings || response?.total_bookings || 0,
        total_revenue: response?.totalRevenue || response?.total_revenue || 0,
        active_bookings: response?.active_bookings || 0,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  }, [branchId]);

  const loadBranchCars = useCallback(async () => {
    if (!branchId) return;
    try {
      const response = await api.getBranchCars(branchId);
      console.log("Branch cars:", response);
      const carsData = response?.data || response || [];
      setCars(Array.isArray(carsData) ? carsData : []);
    } catch (error) {
      console.error("Failed to load cars:", error);
      setCars([]);
    }
  }, [branchId]);

  const loadBranchBookings = useCallback(async () => {
    try {
      const response = await api.getBranchBookings(bookingFilter);
      console.log("Branch bookings:", response);
      const bookingsData = response?.data || response || [];
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      setBookings([]);
    }
  }, [bookingFilter]);

  const loadBranchStaff = useCallback(async () => {
    try {
      const response = await api.getBranchStaff();
      console.log("Branch staff:", response);
      const staffData = response?.data || response || [];
      setStaff(Array.isArray(staffData) ? staffData : []);
    } catch (error) {
      console.error("Failed to load staff:", error);
      setStaff([]);
    }
  }, []);

  const loadBranchActivities = useCallback(async () => {
    try {
      const response = await api.getBranchActivities();
      console.log("Branch activities:", response);
      const activityData = response?.data || response || [];
      setActivities(Array.isArray(activityData) ? activityData : []);
    } catch (error) {
      console.error("Failed to load activities:", error);
      setActivities([]);
    }
  }, []);

  const loadAll = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      await Promise.all([
        loadDashboardStats(),
        loadBranchCars(),
        loadBranchBookings(),
        loadBranchStaff(),
        loadBranchActivities(),
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [branchId, loadDashboardStats, loadBranchCars, loadBranchBookings, loadBranchStaff, loadBranchActivities]);

  // Get branch ID directly from token on component mount
  useEffect(() => {
    try {
      const token = api.getToken();
      console.log('Token exists:', !!token);
      
      if (token) {
        const decoded = api.decodeToken(token);
        console.log('Decoded token:', decoded);
        
        // Extract branch ID from token (try all possible field names)
        let extractedBranchId = decoded?.branch_id || 
                               decoded?.branchId || 
                               decoded?.branch || 
                               decoded?.branchHeadId ||
                               user?.branch_id ||
                               user?.branchId;
        
        // Fallback for sub_admin - use user.id as branchId
        if (!extractedBranchId && user?.role === 'sub_admin' && user?.id) {
          extractedBranchId = user.id;
          console.log('Using sub_admin user.id as branchId:', extractedBranchId);
        }
        
        if (extractedBranchId) {
          console.log('Branch ID extracted from token:', extractedBranchId);
          setBranchId(extractedBranchId);
        } else {
          console.error('No branch ID found in token', decoded);
          // You might want to redirect to login or show an error message
        }
      } else {
        console.error('No token found');
      }
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  }, [user]);

  // Load data when branchId is available
  useEffect(() => {
    if (branchId) {
      console.log('Loading data for branch:', branchId);
      loadAll();
    }
  }, [branchId]);

  /* ---------------------------------------------------------------------- */
  /* HANDLERS */
  /* ---------------------------------------------------------------------- */

  const handleLogout = () => {
    logout();
    navigate("/branch/login");
  };

  const handleStatusUpdate = async (id, status) => {
    if (!confirm(`Are you sure you want to ${status} this booking?`)) return;
    
    try {
      await api.updateBranchBookingStatus(id, status);
      await Promise.all([loadBranchBookings(), loadDashboardStats(), loadBranchActivities()]);
    } catch (error) {
      alert(error.message || "Failed to update booking status");
    }
  };

  const handleVerifyBooking = async () => {
    if (!verifyOtp || verifyOtp.length !== 6) {
      setVerifyError("Please enter a valid 6-digit OTP");
      return;
    }

    setVerifyLoading(true);
    setVerifyError(null);

    try {
      if (verifyAction === "start") {
        await api.verifyBookingStart(selectedBooking.id, verifyOtp);
      } else if (verifyAction === "end") {
        await api.verifyBookingEnd(selectedBooking.id, verifyOtp);
      }

      setShowVerifyModal(false);
      setVerifyOtp("");
      setSelectedBooking(null);
      await Promise.all([loadBranchBookings(), loadDashboardStats(), loadBranchActivities()]);
    } catch (error) {
      setVerifyError(error.message || "Verification failed");
    } finally {
      setVerifyLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusLower = (status || "").toLowerCase();
    const colors = {
      pending: C.amber,
      confirmed: C.green,
      ongoing: C.purple,
      completed: C.accent,
      cancelled: C.red,
    };
    return colors[statusLower] || C.muted;
  };

  const getStatusText = (status) => {
    const statusLower = (status || "").toLowerCase();
    const texts = {
      pending: "Pending",
      confirmed: "Confirmed",
      ongoing: "Ongoing",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return texts[statusLower] || status || "Unknown";
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) =>
      (b.customer_name || b.customerName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (b.car_model || b.carModel || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [bookings, searchTerm]);

  const navItems = [
    { id: "overview", label: "Overview", icon: Home, badge: null },
    { id: "bookings", label: "Bookings", icon: Calendar, badge: getBookingCounts.pending > 0 ? getBookingCounts.pending : null },
    { id: "cars", label: "Cars", icon: Car, badge: getCarCounts.total },
    { id: "staff", label: "Staff", icon: Users, badge: getStaffCounts.total },
    { id: "activities", label: "Activities", icon: ClipboardList, badge: activities.length },
  ];

  if (loading && !branchId) {
    return (
      <div style={{ padding: 40, color: "#fff", textAlign: "center" }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div style={s.root}>
      {/* SIDEBAR */}
      <aside style={s.sidebar}>
        <h2 style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          <Car size={24} color={C.accent} />
          Car24
        </h2>

        <div style={{ marginBottom: 16, padding: 8, background: C.card, borderRadius: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <MapPin size={14} />
            <span>{user?.branch_name || user?.branchName || "Main Branch"}</span>
          </div>
        </div>

        <div style={s.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                style={s.navItem(isActive)}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.badge !== null && item.badge > 0 && (
                  <span style={s.navBadge}>{item.badge}</span>
                )}
              </button>
            );
          })}
        </div>

        <button style={s.navItem(false)} onClick={handleLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <main style={s.main}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>
              {isSubAdmin ? "Branch Dashboard" : "Branch Head Dashboard"}
            </h1>
            <p style={{ color: C.muted, marginTop: 4 }}>
              Welcome back, {user?.name || "User"}
            </p>
          </div>

          <button style={s.btn(C.accent)} onClick={loadAll}>
            <RefreshCw size={14} style={{ marginRight: 8 }} />
            Refresh
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            {/* Stats Grid */}
            <div style={s.statsGrid}>
              <div style={s.statCard}>
                <div style={s.statIcon(C.green)}>
                  <Car size={24} />
                </div>
                <div>
                  <div style={s.statValue}>{stats.total_cars || getCarCounts.total}</div>
                  <div style={s.statLabel}>Total Cars</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                    {getCarCounts.available} Available · {getCarCounts.unavailable} Unavailable
                  </div>
                </div>
              </div>

              <div style={s.statCard}>
                <div style={s.statIcon(C.accent)}>
                  <Calendar size={24} />
                </div>
                <div>
                  <div style={s.statValue}>{stats.total_bookings || getBookingCounts.total}</div>
                  <div style={s.statLabel}>Total Bookings</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                    {getBookingCounts.pending} Pending · {getBookingCounts.ongoing} Ongoing
                  </div>
                </div>
              </div>

              <div style={s.statCard}>
                <div style={s.statIcon(C.amber)}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <div style={s.statValue}>{formatINR(stats.total_revenue || 0)}</div>
                  <div style={s.statLabel}>Total Revenue</div>
                </div>
              </div>

              <div style={s.statCard}>
                <div style={s.statIcon(C.purple)}>
                  <Users size={24} />
                </div>
                <div>
                  <div style={s.statValue}>{getStaffCounts.total}</div>
                  <div style={s.statLabel}>Staff Members</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                    {getStaffCounts.staff} Staff · {getStaffCounts.branch_head} Branch Heads
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Status Breakdown */}
            <div style={s.section}>
              <h2 style={s.sectionTitle}>Booking Status Overview</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: 12,
                }}
              >
                <div style={{ background: C.surface, padding: 12, borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.amber }}>
                    {getBookingCounts.pending}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>Pending</div>
                </div>
                <div style={{ background: C.surface, padding: 12, borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.green }}>
                    {getBookingCounts.confirmed}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>Confirmed</div>
                </div>
                <div style={{ background: C.surface, padding: 12, borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.purple }}>
                    {getBookingCounts.ongoing}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>Ongoing</div>
                </div>
                <div style={{ background: C.surface, padding: 12, borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.accent }}>
                    {getBookingCounts.completed}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>Completed</div>
                </div>
                <div style={{ background: C.surface, padding: 12, borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.red }}>
                    {getBookingCounts.cancelled}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>Cancelled</div>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div style={{ ...s.section, marginTop: 24 }}>
              <h2 style={s.sectionTitle}>Recent Activities</h2>
              {activities.length > 0 ? (
                activities.slice(0, 5).map((activity, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 12,
                      borderBottom: `1px solid ${C.border}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{activity.message || activity.activity || "Activity"}</span>
                    <span style={{ fontSize: 11, color: C.muted }}>
                      {formatDateTime(activity.created_at)}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: 40, color: C.muted }}>
                  No recent activities
                </div>
              )}
            </div>
          </>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === "bookings" && (
          <div style={s.section}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={s.sectionTitle}>Booking Management</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={s.badge(C.amber)}>Pending: {getBookingCounts.pending}</span>
                <span style={s.badge(C.green)}>Confirmed: {getBookingCounts.confirmed}</span>
                <span style={s.badge(C.purple)}>Ongoing: {getBookingCounts.ongoing}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <select
                value={bookingFilter}
                onChange={(e) => setBookingFilter(e.target.value)}
                style={{ ...s.input, width: "auto", margin: 0 }}
              >
                <option value="all">All Bookings ({getBookingCounts.total})</option>
                <option value="pending">Pending ({getBookingCounts.pending})</option>
                <option value="confirmed">Confirmed ({getBookingCounts.confirmed})</option>
                <option value="ongoing">Ongoing ({getBookingCounts.ongoing})</option>
                <option value="completed">Completed ({getBookingCounts.completed})</option>
                <option value="cancelled">Cancelled ({getBookingCounts.cancelled})</option>
              </select>

              <div style={s.searchBar}>
                <input
                  style={{ background: "transparent", border: "none", color: C.text, flex: 1, outline: "none" }}
                  placeholder="Search customer or car..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: 40, color: C.muted }}>
                Loading bookings...
              </div>
            ) : filteredBookings.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: C.muted }}>
                No bookings found
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>ID</th>
                      <th style={s.th}>Customer</th>
                      <th style={s.th}>Car</th>
                      <th style={s.th}>Pickup</th>
                      <th style={s.th}>Dropoff</th>
                      <th style={s.th}>Amount</th>
                      <th style={s.th}>Status</th>
                      <th style={s.th}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredBookings.map((b) => (
                      <tr key={b.id}>
                        <td style={s.td}>#{b.id}</td>
                        <td style={s.td}>
                          <div>
                            <strong>{b.customer_name || b.customerName}</strong>
                          </div>
                          <small style={{ color: C.muted }}>{b.customer_phone || b.customerPhone}</small>
                        </td>
                        <td style={s.td}>
                          <div>{b.car_model || b.carModel}</div>
                          <small style={{ color: C.muted }}>{b.license_plate || b.licensePlate}</small>
                        </td>
                        <td style={s.td}>{formatDateTime(b.pickup_date || b.pickupDate)}</td>
                        <td style={s.td}>{formatDateTime(b.dropoff_date || b.dropoffDate)}</td>
                        <td style={s.td}>
                          <strong style={{ color: C.green }}>{formatINR(b.total_price || b.totalPrice || 0)}</strong>
                        </td>
                        <td style={s.td}>
                          <span style={s.badge(getStatusColor(b.status))}>
                            {getStatusText(b.status)}
                          </span>
                        </td>
                        <td style={s.td}>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {b.status === "pending" && (
                              <>
                                <button
                                  style={s.btn(C.green)}
                                  onClick={() => handleStatusUpdate(b.id, "confirmed")}
                                >
                                  <CheckCircle size={14} style={{ marginRight: 4 }} />
                                  Confirm
                                </button>
                                <button
                                  style={s.btn(C.red, true)}
                                  onClick={() => handleStatusUpdate(b.id, "cancelled")}
                                >
                                  <XCircle size={14} style={{ marginRight: 4 }} />
                                  Cancel
                                </button>
                              </>
                            )}

                            {b.status === "confirmed" && (
                              <button
                                style={s.btn(C.accent)}
                                onClick={() => {
                                  setSelectedBooking(b);
                                  setVerifyAction("start");
                                  setShowVerifyModal(true);
                                }}
                              >
                                <Key size={14} style={{ marginRight: 4 }} />
                                Start Ride
                              </button>
                            )}

                            {b.status === "ongoing" && (
                              <button
                                style={s.btn(C.purple)}
                                onClick={() => {
                                  setSelectedBooking(b);
                                  setVerifyAction("end");
                                  setShowVerifyModal(true);
                                }}
                              >
                                <CheckCircle size={14} style={{ marginRight: 4 }} />
                                End Ride
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CARS TAB */}
        {activeTab === "cars" && (
          <div style={s.section}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={s.sectionTitle}>Fleet Management</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={s.badge(C.green)}>Available: {getCarCounts.available}</span>
                <span style={s.badge(C.red)}>Unavailable: {getCarCounts.unavailable}</span>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: 40, color: C.muted }}>
                Loading cars...
              </div>
            ) : cars.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: C.muted }}>
                No cars found in your branch
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>ID</th>
                      <th style={s.th}>Model</th>
                      <th style={s.th}>License Plate</th>
                      <th style={s.th}>Status</th>
                      <th style={s.th}>Price (6h/12h/24h)</th>
                    </tr>
                  </thead>

                  <tbody>
                    {cars.map((car) => (
                      <tr key={car.id}>
                        <td style={s.td}>#{car.id}</td>
                        <td style={s.td}>
                          <div>
                            <strong>{car.model}</strong>
                          </div>
                          <small style={{ color: C.muted }}>
                            {car.year} · {car.transmission} · {car.seating_capacity || car.seatingCapacity} seats
                          </small>
                        </td>
                        <td style={s.td}>{car.license_plate || car.licensePlate || car.number}</td>
                        <td style={s.td}>
                          <span style={s.badge(car.isAvailable || car.is_available || car.status === "available" ? C.green : C.red)}>
                            {car.isAvailable || car.is_available || car.status === "available" ? "Available" : "Unavailable"}
                          </span>
                        </td>
                        <td style={s.td}>
                          <div style={{ display: "flex", gap: 8, fontSize: 11 }}>
                            <span>6h: {formatINR(car.six_hr_price || car.sixHrPrice)}</span>
                            <span>12h: {formatINR(car.twelve_hr_price || car.twelveHrPrice)}</span>
                            <span>24h: {formatINR(car.twentyfour_hr_price || car.twentyFourHrPrice)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* STAFF TAB */}
        {activeTab === "staff" && (
          <div style={s.section}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={s.sectionTitle}>Staff Management</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={s.badge(C.accent)}>Total: {getStaffCounts.total}</span>
                <span style={s.badge(C.green)}>Branch Heads: {getStaffCounts.branch_head}</span>
                <span style={s.badge(C.purple)}>Staff: {getStaffCounts.staff}</span>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: 40, color: C.muted }}>
                Loading staff...
              </div>
            ) : staff.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: C.muted }}>
                No staff members found
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {staff.map((emp) => (
                  <div
                    key={emp.id}
                    style={{
                      padding: 16,
                      borderBottom: `1px solid ${C.border}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{emp.name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{emp.email}</div>
                    </div>
                    <div>
                      <span style={s.badge(emp.role === "branch_head" ? C.green : C.accent)}>
                        {emp.role === "branch_head" ? "Branch Head" : "Staff"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ACTIVITIES TAB */}
        {activeTab === "activities" && (
          <div style={s.section}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={s.sectionTitle}>Branch Activities</h2>
              <span style={s.badge(C.accent)}>Total: {activities.length}</span>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: 40, color: C.muted }}>
                Loading activities...
              </div>
            ) : activities.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: C.muted }}>
                No activities found
              </div>
            ) : (
              <div>
                {activities.map((a, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 12,
                      borderBottom: `1px solid ${C.border}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div>{a.message || a.activity || "Activity"}</div>
                      {a.user_name && (
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                          by {a.user_name}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted }}>
                      {formatDateTime(a.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Verification Modal */}
      {showVerifyModal && (
        <div style={s.modalOverlay} onClick={() => setShowVerifyModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3>{verifyAction === "start" ? "Start Ride" : "End Ride"} Verification</h3>
              <button
                onClick={() => setShowVerifyModal(false)}
                style={{ background: "none", border: "none", color: C.muted, fontSize: 24, cursor: "pointer" }}
              >
                ×
              </button>
            </div>
            <div>
              <p style={{ fontSize: 13, marginBottom: 16 }}>
                Enter the 6-digit OTP to {verifyAction === "start" ? "start" : "end"} this ride.
              </p>
              <input
                type="text"
                maxLength="6"
                placeholder="000000"
                style={s.input}
                value={verifyOtp}
                onChange={(e) => setVerifyOtp(e.target.value.replace(/\D/g, ""))}
                autoFocus
              />
              {verifyError && (
                <div style={{ marginTop: 12, fontSize: 12, color: C.red, display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertCircle size={14} />
                  {verifyError}
                </div>
              )}
              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button style={s.btn(C.muted, true)} onClick={() => setShowVerifyModal(false)}>
                  Cancel
                </button>
                <button style={s.btn(C.green)} onClick={handleVerifyBooking} disabled={verifyLoading}>
                  {verifyLoading ? "Verifying..." : "Verify"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}