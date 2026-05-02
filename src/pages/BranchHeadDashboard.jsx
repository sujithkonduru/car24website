import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Calendar,
  Users,
  ClipboardList,
  LogOut,
  RefreshCw,
  CheckCircle,
  XCircle,
  Key,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { formatINR, formatDateTime } from "../utils/formatters.js";
import api from "../api.js";

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
  cyan: "#06B6D4",
  text: "#F1F5F9",
  muted: "#64748B",
  subtle: "#1E293B",
};

const s = {
  root: { fontFamily: "'DM Mono', 'Fira Code', monospace", background: C.bg, minHeight: "100vh", color: C.text, display: "flex" },
  sidebar: { width: 220, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", padding: "24px 0", gap: 4, flexShrink: 0 },
  logo: { padding: "0 20px 24px", borderBottom: `1px solid ${C.border}`, marginBottom: 8 },
  logoText: { fontSize: 20, fontWeight: 700, color: C.text, letterSpacing: "-0.5px" },
  logoSub: { fontSize: 10, color: C.muted, letterSpacing: 3, textTransform: "uppercase", marginTop: 2 },
  navItem: (active) => ({ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", cursor: "pointer", borderRadius: 0, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", fontWeight: active ? 700 : 400, color: active ? C.text : C.muted, background: active ? C.card : "transparent", borderLeft: `3px solid ${active ? C.accent : "transparent"}`, transition: "all .15s" }),
  main: { flex: 1, overflow: "auto", padding: 28, display: "flex", flexDirection: "column", gap: 24 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px" },
  headerSub: { fontSize: 11, color: C.muted, marginTop: 2, letterSpacing: 1, textTransform: "uppercase" },
  grid: (cols) => ({ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: 16 }),
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 20 },
  cardLabel: { fontSize: 10, color: C.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 },
  cardValue: (color) => ({ fontSize: 28, fontWeight: 700, color: color || C.text, letterSpacing: "-1px" }),
  cardSub: { fontSize: 11, color: C.muted, marginTop: 4 },
  badge: (color) => ({ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", background: color + "22", color }),
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: { padding: "10px 12px", textAlign: "left", color: C.muted, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, fontWeight: 400 },
  td: { padding: "12px 12px", borderBottom: `1px solid ${C.border}`, verticalAlign: "middle" },
  btn: (color = "#3B82F6", ghost = false) => ({ cursor: "pointer", border: ghost ? `1px solid ${color}` : "none", background: ghost ? "transparent" : color, color: ghost ? color : "#fff", padding: "7px 14px", borderRadius: 6, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", transition: "opacity .15s" }),
  input: { background: C.subtle, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 12px", color: C.text, fontSize: 12, width: "100%", outline: "none", boxSizing: "border-box" },
  select: { background: C.subtle, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 12px", color: C.text, fontSize: 12, outline: "none", cursor: "pointer" },
  pill: { display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: C.subtle, borderRadius: 20, fontSize: 11, color: C.muted },
  tag: (c) => ({ background: c + "18", color: c, padding: "2px 8px", borderRadius: 3, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }),
  modal: { position: "fixed", inset: 0, background: "#000a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalBox: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 28, width: 480, maxWidth: "95vw", maxHeight: "85vh", overflowY: "auto" },
  sectionTitle: { fontSize: 13, fontWeight: 600, color: C.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${C.border}` },
  searchBar: { display: "flex", alignItems: "center", gap: 12, background: C.subtle, border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 12px", flex: 1 },
};

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={s.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={s.cardLabel}>{label}</div>
          <div style={s.cardValue(color)}>{value}</div>
          {sub && <div style={s.cardSub}>{sub}</div>}
        </div>
        <div style={{ fontSize: 22, opacity: 0.6 }}>{icon}</div>
      </div>
    </div>
  );
}

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  const bg = type === "error" ? C.red : C.green;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, background: bg, color: "#fff", padding: "12px 20px", borderRadius: 8, fontSize: 12, fontWeight: 600, zIndex: 2000, letterSpacing: 0.5, maxWidth: 340 }}>
      {msg}
    </div>
  );
}

export default function BranchHeadDashboard() {
  const navigate = useNavigate();
  const { user, isSubAdmin, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [branchId, setBranchId] = useState(null);
  const [toast, setToast] = useState(null);
  const [branchInfo, setBranchInfo] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const [stats, setStats] = useState({
    totalCars: 0,
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    onRoadToday: 0,
    idleCars: 0,
  });

  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyAction, setVerifyAction] = useState(null);
  const [verifyOtp, setVerifyOtp] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const getBookingCounts = useMemo(() => {
    if (!Array.isArray(bookings)) {
      return { pending: 0, confirmed: 0, ongoing: 0, completed: 0, cancelled: 0, total: 0 };
    }
    return {
      pending: bookings.filter((b) => b.system_status?.toLowerCase() === "pending").length,
      confirmed: bookings.filter((b) => b.system_status?.toLowerCase() === "confirmed").length,
      ongoing: bookings.filter((b) => b.live_status === "ongoing").length,
      completed: bookings.filter((b) => b.live_status === "completed").length,
      cancelled: bookings.filter((b) => b.system_status?.toLowerCase() === "cancelled").length,
      total: bookings.length,
    };
  }, [bookings]);

  const getCarCounts = useMemo(() => {
    if (!Array.isArray(cars)) {
      return { available: 0, unavailable: 0, total: 0 };
    }
    return {
      available: cars.filter((c) => c.isAvailable === true || c.is_available === true).length,
      unavailable: cars.filter((c) => c.isAvailable === false || c.is_available === false).length,
      total: cars.length,
    };
  }, [cars]);

  const getStaffCounts = useMemo(() => {
    if (!Array.isArray(staff)) {
      return { branch_head: 0, staff: 0, total: 0 };
    }
    return {
      branch_head: staff.filter((s) => s.role === "branch_head").length,
      staff: staff.filter((s) => s.role === "staff").length,
      total: staff.length,
    };
  }, [staff]);

  const loadBranchProfile = useCallback(async () => {
    try {
      const profile = await api.getBranchHeadProfile();
      if (profile) {
        const extractedBranchId = profile.branch_id || profile.branchId || profile.branch;
        if (extractedBranchId) {
          setBranchId(extractedBranchId);
          setBranchInfo(profile);
          return extractedBranchId;
        }
      }
      return null;
    } catch (error) {
      console.error("Failed to load branch profile:", error);
      return null;
    }
  }, []);

  const loadDashboardStats = useCallback(async (id) => {
    if (!id) return;
    try {
      const response = await api.getBranchDashboardStatsWithDate(id, selectedMonth);
      setStats({
        totalCars: response?.totalCars || 0,
        totalBookings: response?.totalBookings || 0,
        completedBookings: response?.completedBookings || 0,
        cancelledBookings: response?.cancelledBookings || 0,
        onRoadToday: response?.onRoadToday || 0,
        idleCars: response?.idleCars || 0,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  }, [selectedMonth]);

  const loadBranchCars = useCallback(async (id) => {
    if (!id) return;
    try {
      const response = await api.getBranchCars(id);
      setCars(response?.data || []);
    } catch (error) {
      console.error("Failed to load cars:", error);
      setCars([]);
    }
  }, []);

  const loadBranchBookings = useCallback(async (id) => {
    if (!id) return;
    try {
      const dateParam = selectedMonth ? `${selectedMonth}-01` : new Date().toISOString().slice(0, 10);
      const response = await api.getBranchBookingsByDate(id, dateParam);
      let bookingsData = response?.data || [];
      if (bookingStatusFilter !== "all") {
        bookingsData = bookingsData.filter(b => 
          b.system_status?.toLowerCase() === bookingStatusFilter.toLowerCase()
        );
      }
      setBookings(bookingsData);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      setBookings([]);
    }
  }, [selectedMonth, bookingStatusFilter]);

  const loadBranchStaff = useCallback(async (id) => {
    if (!id) return;
    try {
      const staffData = await api.getBranchStaff(id);
      setStaff(Array.isArray(staffData) ? staffData : []);
    } catch (error) {
      console.error("Failed to load staff:", error);
      setStaff([]);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      let id = branchId;
      if (!id) {
        id = await loadBranchProfile();
      }
      if (!id) {
        console.error("No branch ID found");
        showToast("Branch ID not found. Please contact support.", "error");
        setLoading(false);
        return;
      }
      await Promise.allSettled([
        loadDashboardStats(id),
        loadBranchCars(id),
        loadBranchBookings(id),
        loadBranchStaff(id),
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
      showToast("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  }, [branchId, loadBranchProfile, loadDashboardStats, loadBranchCars, loadBranchBookings, loadBranchStaff]);

  useEffect(() => {
    loadAll();
  }, [selectedMonth, bookingStatusFilter]);

  const handleLogout = () => {
    logout();
    navigate("/branch/login");
  };

  const handleStatusUpdate = async (id, status) => {
    if (!confirm(`Are you sure you want to ${status} this booking?`)) return;
    try {
      await api.updateBranchBookingStatus(id, status);
      showToast(`Booking ${status} successfully!`, "success");
      loadAll();
    } catch (error) {
      showToast(error.message || "Failed to update booking status", "error");
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
        showToast("Ride started successfully!", "success");
      } else if (verifyAction === "end") {
        await api.verifyBookingEnd(selectedBooking.id, verifyOtp);
        showToast("Ride completed successfully!", "success");
      }
      setShowVerifyModal(false);
      setVerifyOtp("");
      setSelectedBooking(null);
      loadAll();
    } catch (error) {
      setVerifyError(error.message || "Verification failed");
    } finally {
      setVerifyLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = { pending: C.amber, confirmed: C.green, ongoing: C.purple, completed: C.accent, cancelled: C.red };
    return colors[status?.toLowerCase()] || C.muted;
  };

  const getStatusText = (status) => {
    const texts = { pending: "Pending", confirmed: "Confirmed", ongoing: "Ongoing", completed: "Completed", cancelled: "Cancelled" };
    return texts[status?.toLowerCase()] || status || "Unknown";
  };

  const filteredBookings = useMemo(() => {
    if (!Array.isArray(bookings)) return [];
    if (!searchTerm) return bookings;
    return bookings.filter((b) =>
      (b.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.car_model || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [bookings, searchTerm]);

  const navItems = [
    { id: "overview", label: "Overview", icon: "◈" },
    { id: "bookings", label: "Bookings", icon: "◉" },
    { id: "cars", label: "Cars", icon: "◗" },
    { id: "staff", label: "Staff", icon: "◍" },
  ];

  if (!branchId && !loading) {
    return (
      <div style={{ ...s.root, justifyContent: "center", alignItems: "center" }}>
        <div style={s.card}>
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔑</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Access Restricted</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>No branch ID found. This dashboard is only for branch staff.</div>
            <button style={s.btn(C.accent)} onClick={handleLogout}>Return to Login</button>
          </div>
        </div>
      </div>
    );
  }

  const OverviewTab = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={s.grid(4)}>
        <StatCard label="Total Cars" value={stats.totalCars || getCarCounts.total} sub={`${getCarCounts.available} available · ${getCarCounts.unavailable} unavailable`} color={C.accent} icon="🚗" />
        <StatCard label="Total Bookings" value={stats.totalBookings || getBookingCounts.total} sub={`${getBookingCounts.pending} pending · ${getBookingCounts.ongoing} ongoing`} color={C.cyan} icon="📅" />
        <StatCard label="On Road Today" value={stats.onRoadToday || 0} sub={`${stats.idleCars || 0} idle cars`} color={C.green} icon="🛣️" />
        <StatCard label="Staff Members" value={getStaffCounts.total} sub={`${getStaffCounts.staff} staff · ${getStaffCounts.branch_head} heads`} color={C.purple} icon="👥" />
      </div>
      <div style={s.card}>
        <div style={s.sectionTitle}>Booking Status Overview</div>
        <div style={s.grid(5)}>
          <div style={{ textAlign: "center", padding: 12 }}><div style={{ fontSize: 24, fontWeight: 700, color: C.amber }}>{getBookingCounts.pending}</div><div style={{ fontSize: 11, color: C.muted }}>Pending</div></div>
          <div style={{ textAlign: "center", padding: 12 }}><div style={{ fontSize: 24, fontWeight: 700, color: C.green }}>{getBookingCounts.confirmed}</div><div style={{ fontSize: 11, color: C.muted }}>Confirmed</div></div>
          <div style={{ textAlign: "center", padding: 12 }}><div style={{ fontSize: 24, fontWeight: 700, color: C.purple }}>{getBookingCounts.ongoing}</div><div style={{ fontSize: 11, color: C.muted }}>Ongoing</div></div>
          <div style={{ textAlign: "center", padding: 12 }}><div style={{ fontSize: 24, fontWeight: 700, color: C.accent }}>{getBookingCounts.completed}</div><div style={{ fontSize: 11, color: C.muted }}>Completed</div></div>
          <div style={{ textAlign: "center", padding: 12 }}><div style={{ fontSize: 24, fontWeight: 700, color: C.red }}>{getBookingCounts.cancelled}</div><div style={{ fontSize: 11, color: C.muted }}>Cancelled</div></div>
        </div>
      </div>
      <div style={s.card}>
        <div style={s.sectionTitle}>Select Month</div>
        <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={s.input} />
      </div>
    </div>
  );

  const BookingsTab = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={s.pill}><span>📅 </span><input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ background: "transparent", border: "none", color: C.text, outline: "none" }} /></div>
        {["all", "pending", "confirmed", "ongoing", "completed", "cancelled"].map((filter) => (
          <button key={filter} style={s.btn(filter === bookingStatusFilter ? C.accent : C.muted, filter !== bookingStatusFilter)} onClick={() => setBookingStatusFilter(filter)}>
            {filter.charAt(0).toUpperCase() + filter.slice(1)} ({getBookingCounts[filter] || 0})
          </button>
        ))}
        <div style={{ ...s.searchBar, marginLeft: "auto" }}>
          <input style={{ background: "transparent", border: "none", color: C.text, flex: 1, outline: "none" }} placeholder="Search customer or car..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>
      <div style={s.card}>
        {loading ? <div style={{ color: C.muted, padding: 20, textAlign: "center" }}>Loading bookings...</div>
          : filteredBookings.length === 0 ? <div style={{ color: C.muted, padding: 40, textAlign: "center" }}>No bookings found for {selectedMonth}</div>
            : (
              <div style={{ overflowX: "auto" }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {["ID", "Customer", "Car", "Number Plate", "Pickup", "Dropoff", "Amount", "Status", "Live Status", "Actions"].map(h => <th key={h} style={s.th}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b) => (
                      <tr key={b.booking_id}>
                        <td style={s.td}>#{b.booking_id}</td>
                        <td style={s.td}><div style={{ fontWeight: 600 }}>{b.customer_name}</div><small style={{ color: C.muted }}>{b.customer_phone}</small></td>
                        <td style={s.td}>{b.car_model}</td>
                        <td style={s.td}>{b.number_plate}</td>
                        <td style={{ ...s.td, color: C.muted }}>{formatDateTime(b.pickupDate)}</td>
                        <td style={{ ...s.td, color: C.muted }}>{formatDateTime(b.dropoffDate)}</td>
                        <td style={{ ...s.td, color: C.green, fontWeight: 600 }}>{formatINR(b.totalPrice)}</td>
                        <td style={s.td}><span style={s.badge(getStatusColor(b.system_status))}>{getStatusText(b.system_status)}</span></td>
                        <td style={s.td}><span style={s.tag(b.live_status === "ongoing" ? C.purple : b.live_status === "completed" ? C.green : C.muted)}>{b.live_status || "—"}</span></td>
                        <td style={s.td}>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {b.system_status === "pending" && (
                              <>
                                <button style={s.btn(C.green)} onClick={() => handleStatusUpdate(b.booking_id, "confirmed")}><CheckCircle size={14} style={{ marginRight: 4 }} />Confirm</button>
                                <button style={s.btn(C.red, true)} onClick={() => handleStatusUpdate(b.booking_id, "cancelled")}><XCircle size={14} style={{ marginRight: 4 }} />Cancel</button>
                              </>
                            )}
                            {b.system_status === "confirmed" && (
                              <button style={s.btn(C.accent)} onClick={() => { setSelectedBooking(b); setVerifyAction("start"); setShowVerifyModal(true); }}><Key size={14} style={{ marginRight: 4 }} />Start Ride</button>
                            )}
                            {b.live_status === "ongoing" && (
                              <button style={s.btn(C.purple)} onClick={() => { setSelectedBooking(b); setVerifyAction("end"); setShowVerifyModal(true); }}><CheckCircle size={14} style={{ marginRight: 4 }} />End Ride</button>
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
    </div>
  );

  const CarsTab = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
        <span style={s.pill}><span style={{ color: C.green }}>●</span> Available: {getCarCounts.available}</span>
        <span style={s.pill}><span style={{ color: C.red }}>●</span> Unavailable: {getCarCounts.unavailable}</span>
      </div>
      <div style={s.card}>
        {loading ? <div style={{ color: C.muted, padding: 20, textAlign: "center" }}>Loading cars...</div>
          : cars.length === 0 ? <div style={{ color: C.muted, padding: 40, textAlign: "center" }}>No cars found in your branch</div>
            : (
              <div style={{ overflowX: "auto" }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {["ID", "Model", "License Plate", "Status", "Pricing (6h/12h/24h)"].map(h => <th key={h} style={s.th}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {cars.map((car) => (
                      <tr key={car.id}>
                        <td style={s.td}>#{car.id}</td>
                        <td style={s.td}><div style={{ fontWeight: 600 }}>{car.model}</div><small style={{ color: C.muted }}>{car.year} · {car.transmission} · {car.seating_capacity} seats</small></td>
                        <td style={s.td}>{car.license_plate || car.licensePlate}</td>
                        <td style={s.td}><span style={s.tag(car.isAvailable || car.is_available ? C.green : C.red)}>{car.isAvailable || car.is_available ? "Available" : "Unavailable"}</span></td>
                        <td style={s.td}><div style={{ display: "flex", gap: 8 }}><span>6h: {formatINR(car.six_hr_price)}</span><span>12h: {formatINR(car.twelve_hr_price)}</span><span>24h: {formatINR(car.twentyfour_hr_price)}</span></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
      </div>
    </div>
  );

  const StaffTab = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
        <span style={s.pill}>Total: {getStaffCounts.total}</span>
        <span style={s.pill}>Branch Heads: {getStaffCounts.branch_head}</span>
        <span style={s.pill}>Staff: {getStaffCounts.staff}</span>
      </div>
      <div style={s.card}>
        {loading ? <div style={{ color: C.muted, padding: 20, textAlign: "center" }}>Loading staff...</div>
          : staff.length === 0 ? <div style={{ color: C.muted, padding: 40, textAlign: "center" }}>No staff members found</div>
            : (
              <div style={{ overflowX: "auto" }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {["Name", "Email", "Role", "Status"].map(h => <th key={h} style={s.th}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((emp) => (
                      <tr key={emp.id}>
                        <td style={{ ...s.td, fontWeight: 600 }}>{emp.name}</td>
                        <td style={s.td}>{emp.email}</td>
                        <td style={s.td}><span style={s.tag(emp.role === "branch_head" ? C.green : C.accent)}>{emp.role === "branch_head" ? "Branch Head" : emp.role || "Staff"}</span></td>
                        <td style={s.td}><span style={s.badge(emp.is_verified ? C.green : C.amber)}>{emp.is_verified ? "Active" : "Pending"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
      </div>
    </div>
  );

  return (
    <div style={s.root}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:5px;height:5px;}::-webkit-scrollbar-track{background:#0B0F1A;}::-webkit-scrollbar-thumb{background:#1E2A3A;border-radius:3px;}button:hover{opacity:.85;}input:focus,select:focus{border-color:#3B82F6 !important;}`}</style>
      <aside style={s.sidebar}>
        <div style={s.logo}><div style={s.logoText}>CAR24</div><div style={s.logoSub}>{isSubAdmin ? "Sub Admin" : "Branch Head"}</div></div>
        <div style={{ padding: "0 20px 16px" }}><div style={s.pill}><MapPin size={12} /><span style={{ fontSize: 11 }}>{branchInfo?.branch_name || user?.branch_name || "Branch"}</span></div></div>
        {navItems.map((item) => (<div key={item.id} style={s.navItem(activeTab === item.id)} onClick={() => setActiveTab(item.id)}><span style={{ fontSize: 14, opacity: 0.7 }}>{item.icon}</span>{item.label}</div>))}
        <div style={{ marginTop: "auto", padding: "12px 20px", borderTop: `1px solid ${C.border}` }}><button style={{ ...s.btn(C.red, true), width: "100%" }} onClick={handleLogout}><LogOut size={14} style={{ marginRight: 8 }} />Logout</button></div>
      </aside>
      <main style={s.main}>
        <div style={s.header}>
          <div><div style={s.headerTitle}>{navItems.find((n) => n.id === activeTab)?.label}</div><div style={s.headerSub}>Welcome back, {branchInfo?.name || user?.name || "User"} · {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div></div>
          <button style={s.btn(C.accent)} onClick={loadAll}><RefreshCw size={14} style={{ marginRight: 8 }} />Refresh</button>
        </div>
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "bookings" && <BookingsTab />}
        {activeTab === "cars" && <CarsTab />}
        {activeTab === "staff" && <StaffTab />}
      </main>
      {showVerifyModal && (
        <div style={s.modal} onClick={() => setShowVerifyModal(false)}>
          <div style={s.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={s.sectionTitle}>{verifyAction === "start" ? "Start Ride" : "End Ride"} Verification</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Enter the 6-digit OTP to {verifyAction === "start" ? "start" : "end"} this ride.</div>
            <input style={s.input} type="text" maxLength="6" placeholder="Enter 6-digit OTP" value={verifyOtp} onChange={(e) => setVerifyOtp(e.target.value.replace(/\D/g, ""))} autoFocus />
            {verifyError && <div style={{ marginTop: 12, fontSize: 12, color: C.red, display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={14} />{verifyError}</div>}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}><button style={s.btn(C.green)} onClick={handleVerifyBooking} disabled={verifyLoading}>{verifyLoading ? "Verifying..." : "Verify"}</button><button style={s.btn(C.muted, true)} onClick={() => setShowVerifyModal(false)}>Cancel</button></div>
          </div>
        </div>
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}