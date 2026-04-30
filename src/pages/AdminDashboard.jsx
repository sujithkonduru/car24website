import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api, { decodeToken, getToken } from "../api.js";

// ── Colour tokens (matching SuperAdminDashboard) ──────────────────────────
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

// ── Tiny helpers ───────────────────────────────────────────────────────────
const fmt = n => "₹" + Number(n || 0).toLocaleString("en-IN");
const fmtNum = n => Number(n || 0).toLocaleString("en-IN");
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// ── Styles (matching SuperAdminDashboard) ──────────────────────────────────
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
  sectionTitle: { fontSize: 13, fontWeight: 600, color: C.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${C.border}` },
  searchBar: { display: "flex", alignItems: "center", gap: 12, background: C.subtle, border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 12px", flex: 1 },
};

// ── Stat Card Component ────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={s.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={s.cardLabel}>{label}</div>
          <div style={s.cardValue(color)}>{value}</div>
          {sub && <div style={s.cardSub}>{sub}</div>}
        </div>
        <div style={{ fontSize: 22, opacity: .6 }}>{icon}</div>
      </div>
    </div>
  );
}

// ── Toast Component ────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "error" ? C.red : C.green;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, background: bg, color: "#fff", padding: "12px 20px", borderRadius: 8, fontSize: 12, fontWeight: 600, zIndex: 2000, letterSpacing: .5, maxWidth: 340 }}>
      {msg}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [branchId, setBranchId] = useState(null);
  const [stats, setStats] = useState(null);
  const [finances, setFinances] = useState(null);

  // Data states
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState([]);
  const [staff, setStaff] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);

  // Filter states
  const [bookingFilter, setBookingFilter] = useState({ 
    branchId: "", 
    date: new Date().toISOString().slice(0, 7) 
  });
  const [carFilter, setCarFilter] = useState({ status: "" });

  const showToast = (msg, type = "success") => setToast({ msg, type });

  // Extract user info from token on mount
  useEffect(() => {
    try {
      const token = getToken();
      if (token) {
        const decoded = decodeToken(token);
        console.log("Decoded token:", decoded);
        
        const extractedBranchId = decoded?.branch_id || decoded?.branchId || decoded?.branch;
        
        if (extractedBranchId) {
          setBranchId(extractedBranchId);
          setBookingFilter(prev => ({ ...prev, branchId: extractedBranchId }));
          console.log("Branch ID set:", extractedBranchId);
        } else {
          console.log("No branch ID found - user is super admin");
          setBranchId(null);
        }
      }
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }, [user]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Overview Tab - Load stats and finances
      if (activeTab === "overview") {
        const [statsRes, financesRes] = await Promise.all([
          api.getAdminDashboardStats(),
          api.getSuperAdminFinances()
        ]);
        
        setStats(statsRes);
        setFinances(financesRes?.data);
        
        // Load recent staff for overview display
        const staffRes = await api.getManagementUsers("null", "null", "staff", 10, 0);
        setStaff(Array.isArray(staffRes?.data) ? staffRes.data : []);
      }
      
      // Bookings Tab - Use getBranchBookingsByDate
      if (activeTab === "bookings") {
        let bookingsData = [];
        
        if (!branchId) {
          // Super admin - fetch all bookings
          const response = await api.getBookingDetailsByDate(bookingFilter);
          bookingsData = response?.data || [];
        } else {
          // Branch admin - fetch branch-specific bookings
          const response = await api.getBranchBookingsByDate(branchId, bookingFilter.date);
          bookingsData = response?.data || [];
        }
        
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      }
      
      // Cars Tab
      if (activeTab === "cars") {
        let carsData = [];
        
        if (!branchId) {
          const carsRes = await api.getCars();
          carsData = Array.isArray(carsRes?.data) ? carsRes.data : [];
        } else {
          const carsRes = await api.getBranchCars(branchId);
          carsData = Array.isArray(carsRes?.data) ? carsRes.data : [];
        }
        
        if (carFilter.status && carFilter.status !== "all") {
          carsData = carsData.filter(car => {
            if (carFilter.status === "available") {
              return car.isAvailable === true || car.is_available === true;
            }
            return car.isAvailable === false || car.is_available === false;
          });
        }
        
        setCars(carsData);
      }
      
      // Staff Tab
      if (activeTab === "staff") {
        let staffData = [];
        
        if (!branchId) {
          const staffRes = await api.getManagementUsers("null", "null", "staff", 1000, 0);
          staffData = staffRes?.data || [];
        } else {
          const staffRes = await api.getManagementUsers("null", branchId, "staff", 1000, 0);
          staffData = staffRes?.data || [];
        }
        
        setStaff(Array.isArray(staffData) ? staffData : []);
      }
      
      // Payments Tab
      if (activeTab === "payments") {
        const financialRes = await api.getFinancialData({ pending_only: true });
        setPendingPayments(Array.isArray(financialRes?.data) ? financialRes.data : []);
      }
    } catch (err) {
      console.error("Load data error:", err);
      showToast(err.message || "Failed to load data", "error");
    }
    setLoading(false);
  }, [activeTab, branchId, bookingFilter, carFilter.status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helper functions with safe array handling
  const getBookingCounts = () => {
    const bookingsArray = Array.isArray(bookings) ? bookings : [];
    return {
      pending: bookingsArray.filter(b => b?.system_status?.toLowerCase() === "pending" || b?.status?.toLowerCase() === "pending").length,
      confirmed: bookingsArray.filter(b => b?.system_status?.toLowerCase() === "confirmed" || b?.status?.toLowerCase() === "confirmed").length,
      ongoing: bookingsArray.filter(b => b?.live_status === "ongoing" || b?.system_status?.toLowerCase() === "ongoing").length,
      completed: bookingsArray.filter(b => b?.live_status === "completed" || b?.system_status?.toLowerCase() === "completed").length,
      cancelled: bookingsArray.filter(b => b?.system_status?.toLowerCase() === "cancelled").length,
      total: bookingsArray.length,
    };
  };

  const getCarCounts = () => {
    const carsArray = Array.isArray(cars) ? cars : [];
    return {
      available: carsArray.filter(c => c.isAvailable === true || c.is_available === true).length,
      unavailable: carsArray.filter(c => c.isAvailable === false || c.is_available === false).length,
      total: carsArray.length,
    };
  };

  const getStaffCounts = () => {
    const staffArray = Array.isArray(staff) ? staff : [];
    return {
      total: staffArray.length,
      verified: staffArray.filter(s => s?.is_verified).length,
      pending: staffArray.filter(s => !s?.is_verified).length,
    };
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: "◈" },
    { id: "bookings", label: "Bookings", icon: "◉" },
    { id: "cars", label: "Cars", icon: "◗" },
    { id: "staff", label: "Staff", icon: "◍" },
    { id: "payments", label: "Payments", icon: "◆" },
  ];

  // Overview Tab Component
  const OverviewTab = () => {
    const carCounts = getCarCounts();
    const staffCounts = getStaffCounts();
    
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={s.grid(3)}>
          <StatCard 
            label="Total Gross Revenue" 
            value={fmt(finances?.total_gross_revenue || 0)} 
            sub="all time" 
            color={C.green} 
            icon="💰" 
          />
          <StatCard 
            label="Net Profit" 
            value={fmt(finances?.total_profit || 0)} 
            sub="superadmin + branch" 
            color={C.cyan} 
            icon="📈" 
          />
          <StatCard 
            label="Pending Owner Dues" 
            value={fmt(finances?.total_pending_dues || 0)} 
            sub="unpaid payouts" 
            color={C.amber} 
            icon="⏳" 
          />
        </div>
        
        <div style={s.grid(3)}>
          <StatCard 
            label="Total Cars" 
            value={fmtNum(stats?.totalCars || carCounts.total)} 
            sub={`${stats?.pendingCars || 0} pending approval`} 
            color={C.purple} 
            icon="🚗" 
          />
          <StatCard 
            label="Total Branches" 
            value={fmtNum(stats?.totalBranches || 0)} 
            color={C.accent} 
            icon="🏢" 
          />
          <StatCard 
            label="Cars On Road Today" 
            value={fmtNum(stats?.carsUsedToday || 0)} 
            color={C.green} 
            icon="🛣️" 
          />
        </div>
        
        <div style={s.grid(2)}>
          <StatCard 
            label="Verified Users" 
            value={fmtNum(stats?.verifiedUsers || 0)} 
            color={C.text} 
            icon="✅" 
          />
          <StatCard 
            label="Total Owners" 
            value={fmtNum(stats?.totalOwners || 0)} 
            color={C.text} 
            icon="👤" 
          />
        </div>

        {/* Recent Staff */}
        {staff.length > 0 && (
          <div style={s.card}>
            <div style={s.sectionTitle}>Recent Staff Members</div>
            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {["Name", "Email", "Role", "Status", "Joined"].map(h => <th key={h} style={s.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {staff.slice(0, 5).map((member) => (
                    <tr key={member.id}>
                      <td style={{ ...s.td, fontWeight: 600 }}>{member.name}</td>
                      <td style={s.td}>{member.email}</td>
                      <td style={s.td}>{member.role || "Staff"}</td>
                      <td style={s.td}>
                        <span style={s.badge(member.is_verified ? C.green : C.amber)}>
                          {member.is_verified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td style={{ ...s.td, color: C.muted }}>{fmtDate(member.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Bookings Tab Component
  const BookingsTab = () => {
    const bookingsArray = Array.isArray(bookings) ? bookings : [];
    const bookingCounts = getBookingCounts();
    
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={s.pill}>
            <span>📅 </span>
            <input
              type="month"
              value={bookingFilter.date}
              onChange={(e) => setBookingFilter(prev => ({ ...prev, date: e.target.value }))}
              style={{ background: "transparent", border: "none", color: C.text, outline: "none" }}
            />
          </div>
          <button style={s.btn(C.accent)} onClick={loadData}>Apply Filter</button>
          
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <span style={s.pill}>📋 Pending: {bookingCounts.pending}</span>
            <span style={s.pill}>✅ Confirmed: {bookingCounts.confirmed}</span>
            <span style={s.pill}>🔄 Ongoing: {bookingCounts.ongoing}</span>
            <span style={s.pill}>✔️ Completed: {bookingCounts.completed}</span>
          </div>
        </div>

        <div style={s.card}>
          {loading ? (
            <div style={{ color: C.muted, padding: 20, textAlign: "center" }}>Loading bookings...</div>
          ) : bookingsArray.length === 0 ? (
            <div style={{ color: C.muted, padding: 40, textAlign: "center" }}>No bookings found for {bookingFilter.date}</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {["ID", "Customer", "Car", "Number Plate", "Pickup Date", "Dropoff Date", "Amount", "Status", "Live Status"].map(h => <th key={h} style={s.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {bookingsArray.map((b, idx) => (
                    <tr key={b.booking_id || idx}>
                      <td style={s.td}>#{b.booking_id || b.id || idx}</td>
                      <td style={s.td}>
                        <div style={{ fontWeight: 600 }}>{b.customer_name}</div>
                        <small style={{ color: C.muted }}>{b.customer_phone}</small>
                      </td>
                      <td style={s.td}>{b.car_model}</td>
                      <td style={s.td}>{b.number_plate}</td>
                      <td style={{ ...s.td, color: C.muted }}>{fmtDate(b.pickupDate)}</td>
                      <td style={{ ...s.td, color: C.muted }}>{fmtDate(b.dropoffDate)}</td>
                      <td style={{ ...s.td, color: C.green, fontWeight: 600 }}>{fmt(b.totalPrice)}</td>
                      <td style={s.td}>
                        <span style={s.badge(
                          b.system_status === "confirmed" ? C.green :
                          b.system_status === "pending" ? C.amber : C.red
                        )}>{b.system_status || "pending"}</span>
                      </td>
                      <td style={s.td}>
                        <span style={s.tag(
                          b.live_status === "ongoing" ? C.purple :
                          b.live_status === "completed" ? C.green : C.muted
                        )}>{b.live_status || "—"}</span>
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
  };

  // Cars Tab Component
  const CarsTab = () => {
    const carsArray = Array.isArray(cars) ? cars : [];
    const carCounts = getCarCounts();
    
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "flex-end" }}>
          <span style={s.pill}>
            <span style={{ color: C.green }}>●</span> Available: {carCounts.available}
          </span>
          <span style={s.pill}>
            <span style={{ color: C.red }}>●</span> Unavailable: {carCounts.unavailable}
          </span>
          <select
            value={carFilter.status}
            onChange={(e) => {
              setCarFilter({ status: e.target.value });
              setTimeout(() => loadData(), 100);
            }}
            style={{ ...s.select, width: "auto", padding: "4px 8px", fontSize: 11 }}
          >
            <option value="">All Cars</option>
            <option value="available">Available Only</option>
            <option value="unavailable">Unavailable Only</option>
          </select>
        </div>

        <div style={s.card}>
          {loading ? (
            <div style={{ color: C.muted, padding: 20, textAlign: "center" }}>Loading cars...</div>
          ) : carsArray.length === 0 ? (
            <div style={{ color: C.muted, padding: 40, textAlign: "center" }}>No cars found</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {["ID", "Model", "License Plate", "Status", "Pricing (6h/12h/24h)"].map(h => <th key={h} style={s.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {carsArray.map((car) => (
                    <tr key={car.id}>
                      <td style={s.td}>#{car.id}</td>
                      <td style={{ ...s.td, fontWeight: 600 }}>{car.model}</td>
                      <td style={s.td}>{car.licensePlate || car.license_plate}</td>
                      <td style={s.td}>
                        <span style={s.tag(car.isAvailable || car.is_available ? C.green : C.red)}>
                          {car.isAvailable || car.is_available ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <span>6h: {fmt(car.six_hr_price)}</span>
                          <span>12h: {fmt(car.twelve_hr_price)}</span>
                          <span>24h: {fmt(car.twentyfour_hr_price)}</span>
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
  };

  // Staff Tab Component
  const StaffTab = () => {
    const staffArray = Array.isArray(staff) ? staff : [];
    const staffCounts = getStaffCounts();
    
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "flex-end" }}>
          <span style={s.pill}>Total: {staffCounts.total}</span>
          <span style={s.pill}>Verified: {staffCounts.verified}</span>
          <span style={s.pill}>Pending: {staffCounts.pending}</span>
        </div>

        <div style={s.card}>
          {loading ? (
            <div style={{ color: C.muted, padding: 20, textAlign: "center" }}>Loading staff...</div>
          ) : staffArray.length === 0 ? (
            <div style={{ color: C.muted, padding: 40, textAlign: "center" }}>No staff members found</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {["Name", "Email", "Mobile", "Role", "Branch", "Status", "Joined"].map(h => <th key={h} style={s.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {staffArray.map((member) => (
                    <tr key={member.id}>
                      <td style={{ ...s.td, fontWeight: 600 }}>{member.name}</td>
                      <td style={s.td}>{member.email}</td>
                      <td style={s.td}>{member.mobileNo || member.mobile_no}</td>
                      <td style={s.td}>{member.role || "Staff"}</td>
                      <td style={s.td}>{member.branch || "—"}</td>
                      <td style={s.td}>
                        <span style={s.badge(member.is_verified ? C.green : C.amber)}>
                          {member.is_verified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td style={{ ...s.td, color: C.muted }}>{fmtDate(member.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Payments Tab Component
  const PaymentsTab = () => {
    const paymentsArray = Array.isArray(pendingPayments) ? pendingPayments : [];
    
    return (
      <div style={s.card}>
        <div style={s.sectionTitle}>Pending Owner Payments</div>
        {loading ? (
          <div style={{ color: C.muted, padding: 20, textAlign: "center" }}>Loading payments...</div>
        ) : paymentsArray.length === 0 ? (
          <div style={{ color: C.muted, padding: 40, textAlign: "center" }}>No pending payments</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["Owner Name", "Phone", "Total Bookings", "Total Payable", "Total Trips", "Status"].map(h => <th key={h} style={s.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {paymentsArray.map((payment, idx) => (
                  <tr key={payment.ownerid || idx}>
                    <td style={{ ...s.td, fontWeight: 600 }}>{payment.owner_name}</td>
                    <td style={s.td}>{payment.owner_phone}</td>
                    <td style={s.td}>{payment.total_bookings || 0}</td>
                    <td style={{ ...s.td, color: C.amber, fontWeight: 600 }}>{fmt(payment.total_payable)}</td>
                    <td style={s.td}>{payment.total_trips || 0}</td>
                    <td style={s.td}>
                      <span style={s.badge(C.amber)}>Pending</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #0B0F1A; }
        ::-webkit-scrollbar-thumb { background: #1E2A3A; border-radius: 3px; }
        button:hover { opacity: .85; }
        input:focus, select:focus { border-color: #3B82F6 !important; }
      `}</style>

      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.logo}>
          <div style={s.logoText}>CAR24</div>
          <div style={s.logoSub}>{branchId ? "Branch Admin" : "Super Admin"}</div>
        </div>

        <div style={{ padding: "0 20px 16px" }}>
          <div style={s.pill}>
            <span style={{ fontSize: 11 }}>👤 {user?.name || "Admin"}</span>
          </div>
        </div>

        {navItems.map((item) => (
          <div
            key={item.id}
            style={s.navItem(activeTab === item.id)}
            onClick={() => setActiveTab(item.id)}
          >
            <span style={{ fontSize: 14, opacity: .7 }}>{item.icon}</span>
            {item.label}
          </div>
        ))}

        <div style={{ marginTop: "auto", padding: "12px 20px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Session</div>
          <button style={{ ...s.btn(C.red, true), width: "100%" }} onClick={() => { logout(); navigate("/staff/login"); }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={s.main}>
        <div style={s.header}>
          <div>
            <div style={s.headerTitle}>{navItems.find(n => n.id === activeTab)?.label}</div>
            <div style={s.headerSub}>
              Welcome back, {user?.name || "Admin"} · {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </div>
          </div>
          <button style={s.btn(C.accent)} onClick={loadData}>
            🔄 Refresh
          </button>
        </div>

        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "bookings" && <BookingsTab />}
        {activeTab === "cars" && <CarsTab />}
        {activeTab === "staff" && <StaffTab />}
        {activeTab === "payments" && <PaymentsTab />}
      </main>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}