import { useState, useEffect, useCallback } from "react";
import {
  apiGet,
  apiPut,
  apiPost
} from "../api.js";

// ── Colour tokens ──────────────────────────────────────────────────────────
const C = {
  bg:      "#0B0F1A",
  surface: "#111827",
  card:    "#161D2E",
  border:  "#1E2A3A",
  accent:  "#3B82F6",
  green:   "#10B981",
  amber:   "#F59E0B",
  red:     "#EF4444",
  purple:  "#8B5CF6",
  cyan:    "#06B6D4",
  text:    "#F1F5F9",
  muted:   "#64748B",
  subtle:  "#1E293B",
};

// ── Tiny helpers ───────────────────────────────────────────────────────────
const fmt = n => "₹" + Number(n || 0).toLocaleString("en-IN");
const fmtNum = n => Number(n || 0).toLocaleString("en-IN");
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";

// ── Styles ─────────────────────────────────────────────────────────────────
const s = {
  root: { fontFamily:"'DM Mono', 'Fira Code', monospace", background:C.bg, minHeight:"100vh", color:C.text, display:"flex" },
  sidebar: { width:220, background:C.surface, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", padding:"24px 0", gap:4, flexShrink:0 },
  logo: { padding:"0 20px 24px", borderBottom:`1px solid ${C.border}`, marginBottom:8 },
  logoText: { fontSize:20, fontWeight:700, color:C.text, letterSpacing:"-0.5px" },
  logoSub: { fontSize:10, color:C.muted, letterSpacing:3, textTransform:"uppercase", marginTop:2 },
  navItem: (active) => ({ display:"flex", alignItems:"center", gap:10, padding:"10px 20px", cursor:"pointer", borderRadius:0, fontSize:12, letterSpacing:1, textTransform:"uppercase", fontWeight:active?700:400, color:active?C.text:C.muted, background:active?C.card:"transparent", borderLeft:`3px solid ${active?C.accent:"transparent"}`, transition:"all .15s" }),
  main: { flex:1, overflow:"auto", padding:28, display:"flex", flexDirection:"column", gap:24 },
  header: { display:"flex", justifyContent:"space-between", alignItems:"center" },
  headerTitle: { fontSize:22, fontWeight:700, letterSpacing:"-0.5px" },
  headerSub: { fontSize:11, color:C.muted, marginTop:2, letterSpacing:1, textTransform:"uppercase" },
  grid: (cols) => ({ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:16 }),
  card: { background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:20 },
  cardLabel: { fontSize:10, color:C.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:8 },
  cardValue: (color) => ({ fontSize:28, fontWeight:700, color:color||C.text, letterSpacing:"-1px" }),
  cardSub: { fontSize:11, color:C.muted, marginTop:4 },
  badge: (color) => ({ display:"inline-flex", alignItems:"center", padding:"2px 8px", borderRadius:4, fontSize:10, fontWeight:600, letterSpacing:1, textTransform:"uppercase", background:color+"22", color }),
  table: { width:"100%", borderCollapse:"collapse", fontSize:12 },
  th: { padding:"10px 12px", textAlign:"left", color:C.muted, fontSize:10, letterSpacing:2, textTransform:"uppercase", borderBottom:`1px solid ${C.border}`, fontWeight:400 },
  td: { padding:"12px 12px", borderBottom:`1px solid ${C.border}+"44"`, verticalAlign:"middle" },
  btn: (color="#3B82F6", ghost=false) => ({ cursor:"pointer", border: ghost ? `1px solid ${color}` : "none", background: ghost ? "transparent" : color, color: ghost ? color : "#fff", padding:"7px 14px", borderRadius:6, fontSize:11, fontWeight:600, letterSpacing:1, textTransform:"uppercase", transition:"opacity .15s" }),
  input: { background:C.subtle, border:`1px solid ${C.border}`, borderRadius:6, padding:"8px 12px", color:C.text, fontSize:12, width:"100%", outline:"none", boxSizing:"border-box" },
  select: { background:C.subtle, border:`1px solid ${C.border}`, borderRadius:6, padding:"8px 12px", color:C.text, fontSize:12, outline:"none", cursor:"pointer" },
  pill: { display:"flex", alignItems:"center", gap:8, padding:"6px 12px", background:C.subtle, borderRadius:20, fontSize:11, color:C.muted },
  tag: (c) => ({ background:c+"18", color:c, padding:"2px 8px", borderRadius:3, fontSize:10, fontWeight:700, letterSpacing:1, textTransform:"uppercase" }),
  modal: { position:"fixed", inset:0, background:"#000a", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 },
  modalBox: { background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:28, width:480, maxWidth:"95vw", maxHeight:"85vh", overflowY:"auto" },
  sectionTitle: { fontSize:13, fontWeight:600, color:C.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:12, paddingBottom:8, borderBottom:`1px solid ${C.border}` },
};

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={s.card}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={s.cardLabel}>{label}</div>
          <div style={s.cardValue(color)}>{value}</div>
          {sub && <div style={s.cardSub}>{sub}</div>}
        </div>
        <div style={{ fontSize:22, opacity:.6 }}>{icon}</div>
      </div>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "error" ? C.red : C.green;
  return (
    <div style={{ position:"fixed", bottom:24, right:24, background:bg, color:"#fff", padding:"12px 20px", borderRadius:8, fontSize:12, fontWeight:600, zIndex:2000, letterSpacing:.5, maxWidth:340 }}>
      {msg}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION: OVERVIEW
// ─────────────────────────────────────────────────────────────────────────
function OverviewSection() {
  const [stats, setStats] = useState(null);
  const [finances, setFinances] = useState(null);
  const [branches, setBranches] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiGet("/roleauth/getAllData", { withAuth: true }),
      apiGet("/roleauth/getSuperAdminFinances", { withAuth: true }),
      apiGet("/roleauth/get_branches_revenue", { withAuth: true }),
      apiGet("/cars/get_pending_cars", { withAuth: true }),
    ]).then(([s, f, b, pc]) => {
      setStats(s);
      setFinances(f?.data);
      setBranches(Array.isArray(b) ? b : []);
      const pendingOnly = (Array.isArray(pc?.data) ? pc.data : []).filter(c => c.approvalstatus !== "rejected");
      setPendingCount(pendingOnly.length);
    }).catch((e) => {
      console.error("Overview API error:", e);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color:C.muted, padding:40, textAlign:"center" }}>Loading overview…</div>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={s.grid(3)}>
        <StatCard label="Total Gross Revenue" value={fmt(finances?.total_gross_revenue)} sub="all time" color={C.green} icon="₹" />
        <StatCard label="Net Profit" value={fmt(finances?.total_profit)} sub="superadmin + branch" color={C.cyan} icon="📈" />
        <StatCard label="Pending Owner Dues" value={fmt(finances?.total_pending_dues)} sub="unpaid payouts" color={C.amber} icon="⏳" />
      </div>
      <div style={s.grid(3)}>
        <StatCard label="Total Cars" value={fmtNum(stats?.totalCars)} sub={`${pendingCount} pending approval`} color={C.accent} icon="🚗" />
        <StatCard label="Branches" value={fmtNum(stats?.totalBranches)} color={C.purple} icon="🏢" />
        <StatCard label="Cars On Road Today" value={fmtNum(stats?.carsUsedToday)} color={C.green} icon="🛣️" />
      </div>
      <div style={s.grid(2)}>
        <StatCard label="Verified Users" value={fmtNum(stats?.verifiedUsers)} color={C.text} icon="✅" />
        <StatCard label="Total Owners" value={fmtNum(stats?.totalOwners)} color={C.text} icon="👤" />
      </div>

      <div style={s.card}>
        <div style={s.sectionTitle}>Branch Revenue Leaderboard</div>
        <div style={{ overflowX: "auto" }}>
          <table style={s.table}>
            <thead>
              <tr>
                {["#","Branch","City","Total Volume","Branch Keep","Owner Payout"].map(h=>(
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {branches.slice(0,8).map((b,i)=>(
                <tr key={b.id}>
                  <td style={s.td}><span style={s.tag(i===0?C.amber:i===1?C.muted:C.border)}>{i+1}</span></td>
                  <td style={{...s.td, fontWeight:600}}>{b.name}</td>
                  <td style={{...s.td, color:C.muted}}>{b.city}</td>
                  <td style={s.td}>{fmt(b.total_volume)}</td>
                  <td style={{...s.td, color:C.green}}>{fmt(b.branch_retained)}</td>
                  <td style={{...s.td, color:C.amber}}>{fmt(b.owner_payout)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION: USERS
// ─────────────────────────────────────────────────────────────────────────
function UsersSection() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("user");
  const [page, setPage] = useState(0);
  const limit = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet(`/roleauth/getUsersData/null/${role}/${limit}/${page * limit}`, { withAuth: true });
      setUsers(Array.isArray(res?.data) ? res.data : []);
    } catch(e) { 
      console.error("Users load error:", e);
      setUsers([]); 
    }
    setLoading(false);
  }, [role, page, limit]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
        {["user","owner"].map(r=>(
          <button key={r} style={s.btn(r===role?C.accent:C.muted, r!==role)} onClick={()=>{setRole(r);setPage(0);}}>
            {r === "user" ? "Customers" : "Owners"}
          </button>
        ))}
        <span style={{...s.pill, marginLeft:"auto"}}>{users.length} records</span>
      </div>

      <div style={s.card}>
        {loading ? <div style={{color:C.muted,padding:20,textAlign:"center"}}>Loading…</div> : (
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["Name","Username","Email","Mobile","Verified","Profile","Role"].map(h=>(
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u,i)=>(
                  <tr key={i}>
                    <td style={{...s.td,fontWeight:600}}>{u.name}</td>
                    <td style={{...s.td,color:C.muted}}>{u.username||"—"}</td>
                    <td style={s.td}>{u.email}</td>
                    <td style={s.td}>{u.mobileNo || u.mobileno || "—"}</td>
                    <td style={s.td}><span style={s.badge(u.is_verified?C.green:C.amber)}>{u.is_verified?"Yes":"No"}</span></td>
                    <td style={s.td}><span style={s.badge(u.is_profile_completed?C.green:C.muted)}>{u.is_profile_completed?"Done":"Incomplete"}</span></td>
                    <td style={s.td}><span style={s.tag(u.role==="owner"?C.purple:C.accent)}>{u.role}</span></td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={7} style={{...s.td,color:C.muted,textAlign:"center"}}>No records found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
        <button style={s.btn(C.accent, true)} onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0}>← Prev</button>
        <span style={s.pill}>Page {page+1}</span>
        <button style={s.btn(C.accent, true)} onClick={()=>setPage(p=>p+1)} disabled={users.length < limit}>Next →</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION: MANAGEMENT (Staff / Admins)
// ─────────────────────────────────────────────────────────────────────────
function ManagementSection({ toast }) {
  const [mgmt, setMgmt] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("null");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    role: "sub_admin", 
    mobile_no: "",
    branch: "",
    dob: null,        // Changed from "" to null
    marrieddate: null, // Changed from "" to null
    address: "", 
    permissions: [] 
  });
  const [pwModal, setPwModal] = useState(null);
  const [newPw, setNewPw] = useState("");
  const [verifyModal, setVerifyModal] = useState(null);
  const [otpVal, setOtpVal] = useState("");
  const [page, setPage] = useState(0);
  const limit = 15;

  const fetchBranches = useCallback(async () => {
    setLoadingBranches(true);
    try {
      const res = await apiGet("/roleauth/get_branches_revenue", { withAuth: true });
      const branchesData = Array.isArray(res) ? res : (res?.data || []);
      setBranches(branchesData);
    } catch (error) {
      console.error("Error fetching branches:", error);
      setBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  }, []);

  useEffect(() => {
    if (showCreate) {
      fetchBranches();
    }
  }, [showCreate, fetchBranches]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet(`/roleauth/getManagementData/null/null/${role}/${limit}/${page * limit}`, { withAuth: true });
      setMgmt(Array.isArray(res?.data) ? res.data : []);
    } catch { setMgmt([]); }
    setLoading(false);
  }, [role, page, limit]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    // Validate required fields
    if (!form.name?.trim()) { toast("Name is required", "error"); return; }
    if (!form.email?.trim()) { toast("Email is required", "error"); return; }
    if (!form.password?.trim()) { toast("Password is required", "error"); return; }
    if (!form.mobile_no?.trim()) { toast("Mobile number is required", "error"); return; }
    if ((form.role === "staff" || form.role === "sub_admin") && !form.branch) {
      toast(`${form.role.replace('_', ' ')} role requires a branch assignment`, "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) { toast("Please enter a valid email address", "error"); return; }

    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(form.mobile_no)) { toast("Please enter a valid 10-digit mobile number", "error"); return; }

    if (form.password.length < 6) { toast("Password must be at least 6 characters long", "error"); return; }

    // Prepare data for API - convert empty strings to null for date fields
    const payload = {
      ...form,
      dob: form.dob === "" ? null : form.dob,
      marrieddate: form.marrieddate === "" ? null : form.marrieddate,
    };

    try {
      console.log("Sending payload:", payload);
      const response = await apiPost("/roleauth/createMangement", payload, { withAuth: true });
      if (response.message === "User created successfully") {
        toast("Account created! OTP sent to email for verification", "success");
        setShowCreate(false);
        setForm({ 
          name: "", email: "", password: "", role: "sub_admin", 
          mobile_no: "", branch: "", dob: "", marrieddate:"", address: "", permissions: [] 
        });
        load();
      } else {
        toast(response.message || "Creation failed", "error");
      }
    } catch(e) { 
      console.error("Creation error:", e);
      const errorMessage = e.response?.data?.message || e.message || "Network error";
      toast(errorMessage, "error");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpVal || otpVal.length !== 6) { toast("Please enter a valid 6-digit OTP", "error"); return; }
    try {
      await apiPut("/roleauth/verifyManagementRegister", { email: verifyModal.email, otp: otpVal }, { withAuth: true });
      toast("Account verified successfully!", "success");
      setVerifyModal(null); setOtpVal("");
      load();
    } catch(e) { 
      toast(e.response?.data?.message || e.message, "error"); 
    }
  };

  const handleChangePw = async () => {
    if (!newPw || newPw.length < 6) { toast("Password must be at least 6 characters long", "error"); return; }
    try {
      await apiPut(`/roleauth/superAdmin/changePass/${pwModal.email}`, { pass: newPw }, { withAuth: true });
      toast("Password changed successfully!", "success");
      setPwModal(null); setNewPw("");
    } catch(e) { 
      toast(e.response?.data?.message || e.message, "error"); 
    }
  };

  const handleDateChange = (field, value) => {
    // If value is empty string, set to null, otherwise keep the date
    setForm(f => ({ ...f, [field]: value === "" ? null : value }));
  };

  const roles = ["null", "admin", "sub_admin", "staff"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        {roles.map(r => (
          <button 
            key={r} 
            style={s.btn(r === role ? C.accent : C.muted, r !== role)} 
            onClick={() => { setRole(r); setPage(0); }}
          >
            {r === "null" ? "All" : r === "sub_admin" ? "Sub Admin" : r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
        <button style={{ ...s.btn(C.green), marginLeft: "auto" }} onClick={() => setShowCreate(true)}>
          + Add Member
        </button>
      </div>

      <div style={s.card}>
        {loading ? <div style={{ color: C.muted, padding: 20, textAlign: "center" }}>Loading…</div> : (
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["Name", "Email", "Role", "Branch", "Verified", "Actions"].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mgmt.map((u, i) => (
                  <tr key={i}>
                    <td style={{ ...s.td, fontWeight: 600 }}>{u.name}</td>
                    <td style={s.td}>{u.email}</td>
                    <td style={s.td}>
                      <span style={s.tag(u.role === "admin" ? C.red : u.role === "sub_admin" ? C.purple : C.cyan)}>
                        {u.role === "sub_admin" ? "Sub Admin" : u.role}
                      </span>
                    </td>
                    <td style={{ ...s.td, color: C.muted }}>{u.branch || "—"} </td>
                    <td style={s.td}>
                      <span style={s.badge(u.is_verified ? C.green : C.amber)}>
                        {u.is_verified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {!u.is_verified && (
                          <button 
                            style={s.btn(C.amber, true)} 
                            onClick={() => setVerifyModal({ email: u.email })}
                          >
                            Verify
                          </button>
                        )}
                        <button 
                          style={s.btn(C.accent, true)} 
                          onClick={() => setPwModal({ email: u.email })}
                        >
                          Reset PW
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {mgmt.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ ...s.td, color: C.muted, textAlign: "center" }}>
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button 
          style={s.btn(C.accent, true)} 
          onClick={() => setPage(p => Math.max(0, p - 1))} 
          disabled={page === 0}
        >
          ← Prev
        </button>
        <span style={s.pill}>Page {page + 1}</span>
        <button 
          style={s.btn(C.accent, true)} 
          onClick={() => setPage(p => p + 1)} 
          disabled={mgmt.length < limit}
        >
          Next →
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div style={s.modal} onClick={() => setShowCreate(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <div style={s.sectionTitle}>Create Management Account</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              
              {/* Name Field */}
              <div>
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                  Name *
                </div>
                <input 
                  style={s.input} 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                  placeholder="Enter full name"
                />
              </div>

              {/* Email Field */}
              <div>
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                  Email *
                </div>
                <input 
                  style={s.input} 
                  type="email" 
                  value={form.email} 
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                  placeholder="Enter email address"
                />
              </div>

              {/* Password Field */}
              <div>
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                  Password *
                </div>
                <input 
                  style={s.input} 
                  type="password" 
                  value={form.password} 
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
                  placeholder="Minimum 6 characters"
                />
              </div>

              {/* Mobile Field */}
              <div>
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                  Mobile Number *
                </div>
                <input 
                  style={s.input} 
                  type="tel" 
                  value={form.mobile_no} 
                  onChange={e => setForm(f => ({ ...f, mobile_no: e.target.value.replace(/\D/g, '').slice(0, 10) }))} 
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
              </div>

              {/* DOB Field - Handle empty values */}
              <div>
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                  Date of Birth (Optional)
                </div>
                <input 
                  style={s.input} 
                  type="date" 
                  value={form.dob || ""} 
                  onChange={e => handleDateChange('dob', e.target.value)} 
                />
              </div>

              {/* Married Date Field - Handle empty values */}
              <div>
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                  Married Date (Optional)
                </div>
                <input 
                  style={s.input} 
                  type="date" 
                  value={form.marrieddate || ""} 
                  onChange={e => handleDateChange('marrieddate', e.target.value)} 
                />
              </div>

              {/* Address Field */}
              <div>
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                  Address
                </div>
                <textarea 
                  style={{ ...s.input, minHeight: 60, resize: "vertical" }} 
                  value={form.address} 
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))} 
                  placeholder="Enter complete address"
                />
              </div>

              {/* Branch Dropdown */}
              <div>
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                  Branch {loadingBranches && <span style={{ fontSize: 9 }}>(Loading...)</span>}
                  {(form.role === "staff" || form.role === "sub_admin") && <span style={{ color: C.red }}>*</span>}
                </div>
                <select 
                  style={{ ...s.select, width: "100%" }} 
                  value={form.branch} 
                  onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}
                  disabled={loadingBranches}
                >
                  <option value="">Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} {branch.city ? `(${branch.city})` : ""}
                    </option>
                  ))}
                </select>
                {branches.length === 0 && !loadingBranches && (
                  <div style={{ fontSize: 11, color: C.amber, marginTop: 4 }}>
                    No branches found. Please create a branch first.
                  </div>
                )}
              </div>

              {/* Role Field */}
              <div>
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                  Role *
                </div>
                <select 
                  style={{ ...s.select, width: "100%" }} 
                  value={form.role} 
                  onChange={e => setForm(f => ({ ...f, role: e.target.value, branch: e.target.value === "admin" ? "" : f.branch }))}
                >
                  <option value="admin">Admin</option>
                  <option value="sub_admin">Sub Admin</option>
                  <option value="staff">Staff</option>
                </select>
                {form.role === "admin" && (
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>
                    Note: Admin role does not require branch assignment
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button style={s.btn(C.green)} onClick={handleCreate}>Create Account</button>
              <button style={s.btn(C.muted, true)} onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Verify OTP Modal */}
      {verifyModal && (
        <div style={s.modal} onClick={() => setVerifyModal(null)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <div style={s.sectionTitle}>Verify Account OTP</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
              Email: <strong>{verifyModal.email}</strong>
            </div>
            <input 
              style={s.input} 
              type="text"
              placeholder="Enter 6-digit OTP" 
              value={otpVal} 
              onChange={e => setOtpVal(e.target.value.replace(/\D/g, '').slice(0, 6))} 
              maxLength={6}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button style={s.btn(C.green)} onClick={handleVerifyOtp}>Verify</button>
              <button style={s.btn(C.muted, true)} onClick={() => setVerifyModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Change PW Modal */}
      {pwModal && (
        <div style={s.modal} onClick={() => setPwModal(null)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <div style={s.sectionTitle}>Reset Password</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
              Email: <strong>{pwModal.email}</strong>
            </div>
            <input 
              style={s.input} 
              type="password" 
              placeholder="New password (min 6 characters)" 
              value={newPw} 
              onChange={e => setNewPw(e.target.value)} 
            />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button style={s.btn(C.accent)} onClick={handleChangePw}>Update Password</button>
              <button style={s.btn(C.muted, true)} onClick={() => setPwModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// BRANCH FORM — defined outside BranchesSection to prevent focus loss
// ─────────────────────────────────────────────────────────────────────────
const BRANCH_FIELDS = [
  { label: "Branch Name",  key: "name",    type: "text",  placeholder: "e.g. Hyderabad Central" },
  { label: "Address",      key: "address", type: "text",  placeholder: "Street / Area" },
  { label: "City",         key: "city",    type: "text",  placeholder: "e.g. Hyderabad" },
  { label: "State",        key: "state",   type: "text",  placeholder: "e.g. Telangana" },
  { label: "Zip Code",     key: "zipcode", type: "text",  placeholder: "e.g. 500001", maxLength: 6 },
  { label: "Phone",        key: "phone",   type: "tel",   placeholder: "10-digit number", maxLength: 10 },
  { label: "Email",        key: "email",   type: "email", placeholder: "branch@car24.in" },
];

function BranchForm({ form, setForm, onSubmit, onCancel, submitLabel }) {
  const [branchHeads, setBranchHeads] = useState([]);

  useEffect(() => {
    apiGet("/roleauth/getManagementData/null/null/branch_head/100/0", { withAuth: true })
      .then(res => setBranchHeads(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setBranchHeads([]));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {BRANCH_FIELDS.map(({ label, key, type, placeholder, maxLength }) => (
        <div key={key}>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
          <input
            style={s.input}
            type={type}
            value={form[key] || ""}
            placeholder={placeholder}
            maxLength={maxLength}
            onChange={e => {
              let val = e.target.value;
              if (key === "phone" || key === "zipcode") val = val.replace(/\D/g, "");
              setForm(f => ({ ...f, [key]: val }));
            }}
          />
        </div>
      ))}
      <div>
        <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Branch Head (Optional)</div>
        <select
          style={{ ...s.select, width: "100%" }}
          value={form.branchHeadId || ""}
          onChange={e => setForm(f => ({ ...f, branchHeadId: e.target.value || null }))}
        >
          <option value="">— Select Branch Head —</option>
          {branchHeads.map(bh => (
            <option key={bh.id} value={bh.id}>{bh.name} ({bh.email})</option>
          ))}
        </select>
        {branchHeads.length === 0 && (
          <div style={{ fontSize: 10, color: C.amber, marginTop: 4 }}>No branch heads found. Create one in Management first.</div>
        )}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button style={s.btn(C.green)} onClick={onSubmit}>{submitLabel}</button>
        <button style={s.btn(C.muted, true)} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION: BRANCHES
// ─────────────────────────────────────────────────────────────────────────
function BranchesSection({ toast }) {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editBranch, setEditBranch] = useState(null);
  const [form, setForm] = useState({ name:"", address:"", city:"", state:"", zipcode:"", phone:"", email:"", branchHeadId:"" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/roleauth/get_branches_revenue", { withAuth: true });
      setBranches(Array.isArray(res) ? res : []);
    } catch { setBranches([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.name?.trim())    { toast("Branch name is required", "error"); return; }
    if (!form.address?.trim()) { toast("Address is required", "error"); return; }
    if (!form.city?.trim())    { toast("City is required", "error"); return; }
    if (!form.state?.trim())   { toast("State is required", "error"); return; }
    if (!form.zipcode?.trim()) { toast("Zip code is required", "error"); return; }
    if (!form.phone?.trim())   { toast("Phone is required", "error"); return; }
    if (!form.email?.trim())   { toast("Email is required", "error"); return; }
    try {
      const payload = {
        name:         form.name.trim(),
        address:      form.address.trim(),
        city:         form.city.trim(),
        state:        form.state.trim(),
        zipCode:      form.zipcode.trim(),
        phone:        form.phone.trim(),
        email:        form.email.trim(),
        branchHeadId: form.branchHeadId?.trim() || null,
      };
      const res = await apiPost("/branch/create-branch", payload, { withAuth: true });
      toast("Branch created!", "success");
      setShowCreate(false);
      setForm({ name:"", address:"", city:"", state:"", zipcode:"", phone:"", email:"", branchHeadId:"" });
      load();
    } catch(e) { toast(e.message, "error"); }
  };

  const handleUpdate = async () => {
    try {
      await apiPut(`/roleauth/update-branch/${editBranch.id}`, form);
      toast("Branch updated!", "success");
      setEditBranch(null);
      load();
    } catch(e) { toast(e.message,"error"); }
  };

  const openEdit = (b) => {
    setEditBranch(b);
    setForm({ name:b.name, address:"", city:b.city, state:"", zipcode:"", phone:"", email:"", branchHeadId:"" });
  };



  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <button style={s.btn(C.green)} onClick={()=>setShowCreate(true)}>+ New Branch</button>
      </div>

      <div style={s.card}>
        {loading ? <div style={{color:C.muted,padding:20,textAlign:"center"}}>Loading…</div> : (
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead><tr>{["Branch","City","Total Volume","Retained","Owner Payout","Actions"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {branches.map((b,i)=>(
                  <tr key={i}>
                    <td style={{...s.td,fontWeight:600}}>{b.name}</td>
                    <td style={{...s.td,color:C.muted}}>{b.city}</td>
                    <td style={s.td}>{fmt(b.total_volume)}</td>
                    <td style={{...s.td,color:C.green}}>{fmt(b.branch_retained)}</td>
                    <td style={{...s.td,color:C.amber}}>{fmt(b.owner_payout)}</td>
                    <td style={s.td}><button style={s.btn(C.accent,true)} onClick={()=>openEdit(b)}>Edit</button></td>
                  </tr>
                ))}
                {branches.length===0 && <tr><td colSpan={6} style={{...s.td,color:C.muted,textAlign:"center"}}>No branches</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <div style={s.modal} onClick={()=>setShowCreate(false)}>
          <div style={s.modalBox} onClick={e=>e.stopPropagation()}>
            <div style={s.sectionTitle}>Create New Branch</div>
            <BranchForm
              form={form}
              setForm={setForm}
              onSubmit={handleCreate}
              onCancel={() => { setShowCreate(false); setEditBranch(null); }}
              submitLabel="Create Branch"
            />
          </div>
        </div>
      )}

      {editBranch && (
        <div style={s.modal} onClick={()=>setEditBranch(null)}>
          <div style={s.modalBox} onClick={e=>e.stopPropagation()}>
            <div style={s.sectionTitle}>Edit Branch — {editBranch.name}</div>
            <BranchForm
              form={form}
              setForm={setForm}
              onSubmit={handleUpdate}
              onCancel={() => { setShowCreate(false); setEditBranch(null); }}
              submitLabel="Save Changes"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION: CARS
// ─────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────
// SECTION: CARS (Fixed for Super Admin Approval)
// ─────────────────────────────────────────────────────────────────────────
function CarsSection({ toast }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [pricingModal, setPricingModal] = useState(null);
  const [pricing, setPricing] = useState({ 
    six_hr_price: "", 
    twelve_hr_price: "", 
    twentyfour_hr_price: "", 
    percentage: 70 
  });
  const [page, setPage] = useState(0);
  const [viewModal, setViewModal] = useState(null);
  const limit = 12;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (filter === "pending") {
        const res = await apiGet("/cars/get_pending_cars", { withAuth: true });
        const all = Array.isArray(res?.data) ? res.data : [];
        setCars(all.filter(c => c.approvalstatus !== "rejected"));
      } else {
        // Fetch all approved cars
        const res = await apiGet("/cars/get_cars", { withAuth: true, query: { limit, pageno: page } });
        console.log("All cars response:", res);
        setCars(Array.isArray(res?.data) ? res.data : []);
      }
    } catch (error) {
      console.error("Error loading cars:", error);
      setCars([]);
      toast(error.message || "Failed to load cars", "error");
    }
    setLoading(false);
  }, [filter, page, limit, toast]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async () => {
    // Validate pricing inputs
    if (!pricing.six_hr_price || !pricing.twelve_hr_price || !pricing.twentyfour_hr_price) {
      toast("Please enter all pricing fields", "error");
      return;
    }

    try {
      const response = await apiPut(`/cars/approve_pending_cars/${pricingModal.id}`, {
        status: "approved",
        six: parseFloat(pricing.six_hr_price),
        twelve: parseFloat(pricing.twelve_hr_price),
        twentyFour: parseFloat(pricing.twentyfour_hr_price),
        percentage: parseFloat(pricing.percentage)
      }, { withAuth: true });
      
      console.log("Approve response:", response);
      toast("Car approved successfully!", "success");
      setPricingModal(null);
      setPricing({ six_hr_price: "", twelve_hr_price: "", twentyfour_hr_price: "", percentage: 70 });
      load(); // Refresh the list
    } catch (error) {
      console.error("Approve error:", error);
      toast(error.message || "Failed to approve car", "error");
    }
  };

  const handleReject = async (carId) => {
    if (!confirm("Are you sure you want to reject this car?")) return;
    
    try {
      await apiPut(`/cars/approve_pending_cars/${carId}`, { 
        status: "rejected" 
      }, { withAuth: true });
      toast("Car rejected", "success");
      load();
    } catch (error) {
      console.error("Reject error:", error);
      toast(error.message || "Failed to reject car", "error");
    }
  };

  const handleUpdateCar = async (carId, data) => {
    try {
      await apiPut(`/roleauth/updateCar/${carId}`, data, { withAuth: true });
      toast("Car updated successfully!", "success");
      load();
    } catch (error) {
      console.error("Update error:", error);
      toast(error.message || "Failed to update car", "error");
    }
  };

  const ViewCarModal = ({ car, onClose }) => (
    <div style={s.modal} onClick={onClose}>
      <div style={{...s.modalBox, maxWidth: 600}} onClick={e => e.stopPropagation()}>
        <div style={s.sectionTitle}>Car Details - {car.model}</div>
        
        {/* Car Images */}
        {car.images && car.images.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>IMAGES</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 8 }}>
              {car.images.slice(0, 3).map((img, idx) => (
                <img 
                  key={idx} 
                  src={img} 
                  alt={`${car.model} ${idx + 1}`}
                  style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 6 }}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/100?text=No+Image"; }}
                />
              ))}
            </div>
          </div>
        )}
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><div style={{ fontSize: 10, color: C.muted }}>Model</div><div style={{ fontWeight: 600 }}>{car.model}</div></div>
          <div><div style={{ fontSize: 10, color: C.muted }}>Year</div><div>{car.year}</div></div>
          <div><div style={{ fontSize: 10, color: C.muted }}>Category</div><div>{car.category}</div></div>
          <div><div style={{ fontSize: 10, color: C.muted }}>Transmission</div><div>{car.transmission}</div></div>
          <div><div style={{ fontSize: 10, color: C.muted }}>Fuel Type</div><div>{car.fuelType}</div></div>
          <div><div style={{ fontSize: 10, color: C.muted }}>Seating Capacity</div><div>{car.seatingCapacity}</div></div>
          <div><div style={{ fontSize: 10, color: C.muted }}>Color</div><div>{car.colour}</div></div>
          <div><div style={{ fontSize: 10, color: C.muted }}>License Plate</div><div>{car.licensePlate}</div></div>
          <div><div style={{ fontSize: 10, color: C.muted }}>Mileage</div><div>{car.mileage} km</div></div>
          <div><div style={{ fontSize: 10, color: C.muted }}>Status</div><span style={s.tag(car.isAvailable ? C.green : C.red)}>{car.isAvailable ? "Available" : "Unavailable"}</span></div>
          <div><div style={{ fontSize: 10, color: C.muted }}>Approval Status</div><span style={s.badge(car.approvalstatus === "approved" ? C.green : C.amber)}>{car.approvalstatus}</span></div>
        </div>
        
        <button style={{...s.btn(C.accent), marginTop: 16, width: "100%" }} onClick={onClose}>Close</button>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {["pending", "all"].map(f => (
          <button 
            key={f} 
            style={s.btn(f === filter ? C.accent : C.muted, f !== filter)} 
            onClick={() => { setFilter(f); setPage(0); }}
          >
            {f === "pending" ? "🚗 Pending Approval" : "📋 All Cars"}
          </button>
        ))}
        <span style={{...s.pill, marginLeft: "auto"}}>
          {cars.length} {filter === "pending" ? "pending" : "total"} cars
        </span>
      </div>

      <div style={s.card}>
        {loading ? (
          <div style={{ color: C.muted, padding: 20, textAlign: "center" }}>Loading cars...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["Image", "Model", "Year", "Category", "Fuel", "Seats", "Branch", "Status", "Approval", "Actions"].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cars.map((c, i) => (
                  <tr key={i}>
                    <td style={s.td}>
                      {c.images && c.images[0] ? (
                        <img 
                          src={c.images[0]} 
                          alt={c.model}
                          style={{ width: 50, height: 40, objectFit: "cover", borderRadius: 4 }}
                          onError={(e) => { e.target.src = "https://via.placeholder.com/50x40?text=Car"; }}
                        />
                      ) : (
                        <div style={{ width: 50, height: 40, background: C.subtle, borderRadius: 4 }}></div>
                      )}
                    </td>
                    <td style={{...s.td, fontWeight: 600}}>{c.model}</td>
                    <td style={s.td}>{c.year}</td>
                    <td style={s.td}>{c.category}</td>
                    <td style={s.td}>{c.fuelType}</td>
                    <td style={s.td}>{c.seatingCapacity}</td>
                    <td style={{...s.td, color: C.muted}}>{c.branch_name || "—"}</td>
                    <td style={s.td}>
                      <span style={s.tag(c.isAvailable ? C.green : C.red)}>
                        {c.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={s.badge(
                        c.approvalstatus === "approved" ? C.green : 
                        c.approvalstatus === "rejected" ? C.red : C.amber
                      )}>
                        {c.approvalstatus}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button 
                          style={s.btn(C.cyan, true)} 
                          onClick={() => setViewModal(c)}
                        >
                          View
                        </button>
                        
                        {c.approvalstatus === "pending" && (
                          <>
                            <button 
                              style={s.btn(C.green)} 
                              onClick={() => { 
                                setPricingModal(c); 
                                setPricing({ 
                                  six_hr_price: "", 
                                  twelve_hr_price: "", 
                                  twentyfour_hr_price: "", 
                                  percentage: 70 
                                }); 
                              }}
                            >
                              Approve
                            </button>
                            <button 
                              style={s.btn(C.red, true)} 
                              onClick={() => handleReject(c.id)}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        
                        {c.approvalstatus === "approved" && (
                          <button 
                            style={s.btn(C.amber, true)} 
                            onClick={() => handleUpdateCar(c.id, { isAvailable: !c.isAvailable })}
                          >
                            {c.isAvailable ? "Disable" : "Enable"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {cars.length === 0 && (
                  <tr>
                    <td colSpan={10} style={{...s.td, color: C.muted, textAlign: "center"}}>
                      {filter === "pending" ? "No pending cars for approval" : "No cars found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filter !== "pending" && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button 
            style={s.btn(C.accent, true)} 
            onClick={() => setPage(p => Math.max(0, p - 1))} 
            disabled={page === 0}
          >
            ← Prev
          </button>
          <span style={s.pill}>Page {page + 1}</span>
          <button 
            style={s.btn(C.accent, true)} 
            onClick={() => setPage(p => p + 1)} 
            disabled={cars.length < limit}
          >
            Next →
          </button>
        </div>
      )}

      {/* Pricing Modal for Approval */}
      {pricingModal && (
        <div style={s.modal} onClick={() => setPricingModal(null)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <div style={s.sectionTitle}>Approve Car - {pricingModal.model}</div>
            
            <div style={{ marginBottom: 16, padding: 12, background: C.subtle, borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Owner: {pricingModal.ownerid || "Unknown"}</div>
              <div style={{ fontSize: 11, color: C.muted }}>Branch: {pricingModal.branch_name || pricingModal.branchId || "Unknown"}</div>
            </div>
            
            <div>
              <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                6 Hour Price (₹) *
              </div>
              <input 
                style={s.input} 
                type="number" 
                value={pricing.six_hr_price} 
                onChange={e => setPricing(p => ({ ...p, six_hr_price: e.target.value }))} 
                placeholder="e.g., 1200"
              />
            </div>
            
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                12 Hour Price (₹) *
              </div>
              <input 
                style={s.input} 
                type="number" 
                value={pricing.twelve_hr_price} 
                onChange={e => setPricing(p => ({ ...p, twelve_hr_price: e.target.value }))} 
                placeholder="e.g., 2000"
              />
            </div>
            
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                24 Hour Price (₹) *
              </div>
              <input 
                style={s.input} 
                type="number" 
                value={pricing.twentyfour_hr_price} 
                onChange={e => setPricing(p => ({ ...p, twentyfour_hr_price: e.target.value }))} 
                placeholder="e.g., 3500"
              />
            </div>
            
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                Owner Percentage (%) *
              </div>
              <input 
                style={s.input} 
                type="number" 
                value={pricing.percentage} 
                onChange={e => setPricing(p => ({ ...p, percentage: e.target.value }))} 
                placeholder="e.g., 70"
              />
              <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>
                Owner will receive {pricing.percentage}% of the booking amount
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button style={s.btn(C.green)} onClick={handleApprove}>Approve Car</button>
              <button style={s.btn(C.muted, true)} onClick={() => setPricingModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* View Car Modal */}
      {viewModal && <ViewCarModal car={viewModal} onClose={() => setViewModal(null)} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION: FINANCIALS
// ─────────────────────────────────────────────────────────────────────────
function FinancialsSection({ toast }) {
  const [finances, setFinances] = useState(null);
  const [ownerLedger, setOwnerLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [filterBranch, setFilterBranch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [f, o] = await Promise.all([
        apiGet("/roleauth/getSuperAdminFinances", { withAuth: true }),
        apiGet("/roleauth/getFinancial", { withAuth: true, query: filterBranch ? { branchid: filterBranch } : {} }),
      ]);
      setFinances(f?.data);
      setOwnerLedger(Array.isArray(o?.data) ? o.data : []);
    } catch { }
    setLoading(false);
  }, [filterBranch]);

  useEffect(() => { load(); }, [load]);

  const openBreakdown = async (row) => {
    setPayModal(row);
    try {
      const res = await apiGet(`/roleauth/getOwnerPendingBreakdown/${row.ownerid}`, { withAuth: true, query: { branchId: row.branchId } });
      setBreakdown(Array.isArray(res?.data) ? res.data : []);
    } catch { setBreakdown([]); }
  };

  const handleMarkPaid = async () => {
    try {
      await apiPut(`/roleauth/mark-owner-paid/${payModal.ownerid}`, { branchId: payModal.branchId }, { withAuth: true });
      toast("Marked as paid!", "success");
      setPayModal(null); setBreakdown([]);
      load();
    } catch(e) { toast(e.message,"error"); }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {finances && (
        <div style={s.grid(3)}>
          <StatCard label="Gross Revenue" value={fmt(finances.total_gross_revenue)} color={C.green} icon="💰" />
          <StatCard label="Net Profit" value={fmt(finances.total_profit)} color={C.cyan} icon="📊" />
          <StatCard label="Pending Owner Dues" value={fmt(finances.total_pending_dues)} color={C.amber} icon="⏳" />
          <StatCard label="Total Owner Payouts (Paid)" value={fmt(finances.total_owner_payouts)} color={C.text} icon="✅" />
          <StatCard label="Branch Payouts" value={fmt(finances.total_branch_payouts)} color={C.purple} icon="🏢" />
        </div>
      )}

      <div style={s.card}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, flexWrap:"wrap", gap:8 }}>
          <div style={s.sectionTitle}>Owner Pending Payouts</div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <input style={{...s.input,width:160}} placeholder="Branch ID filter" value={filterBranch} onChange={e=>setFilterBranch(e.target.value)} />
            <button style={s.btn(C.accent,true)} onClick={load}>Apply</button>
          </div>
        </div>
        {loading ? <div style={{color:C.muted,padding:20,textAlign:"center"}}>Loading…</div> : (
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead><tr>{["Owner","Phone","Bookings","Total Payable","Trips","Actions"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {ownerLedger.map((r,i)=>(
                  <tr key={i}>
                    <td style={{...s.td,fontWeight:600}}>{r.owner_name}</td>
                    <td style={{...s.td,color:C.muted}}>{r.owner_phone}</td>
                    <td style={s.td}>{r.total_bookings}</td>
                    <td style={{...s.td,color:C.amber,fontWeight:600}}>{fmt(r.total_payable)}</td>
                    <td style={s.td}>{r.total_trips}</td>
                    <td style={s.td}><button style={s.btn(C.green,true)} onClick={()=>openBreakdown(r)}>View & Pay</button></td>
                  </tr>
                ))}
                {ownerLedger.length===0 && <tr><td colSpan={6} style={{...s.td,color:C.muted,textAlign:"center"}}>No pending payouts</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {payModal && (
        <div style={s.modal} onClick={()=>setPayModal(null)}>
          <div style={{...s.modalBox,width:560}} onClick={e=>e.stopPropagation()}>
            <div style={s.sectionTitle}>Payout Breakdown — {payModal.owner_name}</div>
            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead><tr>{["Booking","Car","Pickup","Dropoff","User Paid","Owner Share"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {breakdown.map((b,i)=>(
                    <tr key={i}>
                      <td style={s.td}>#{b.booking_id}</td>
                      <td style={s.td}>{b.car_model}</td>
                      <td style={s.td}>{fmtDate(b.pickupDate)}</td>
                      <td style={s.td}>{fmtDate(b.dropoffDate)}</td>
                      <td style={s.td}>{fmt(b.total_user_paid)}</td>
                      <td style={{...s.td,color:C.green,fontWeight:600}}>{fmt(b.owner_share)}</td>
                    </tr>
                  ))}
                  {breakdown.length===0 && <tr><td colSpan={6} style={{...s.td,color:C.muted,textAlign:"center"}}>No pending trips found</td></tr>}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop:14, display:"flex", gap:10 }}>
              <button style={s.btn(C.green)} onClick={handleMarkPaid}>Mark All Paid</button>
              <button style={s.btn(C.muted,true)} onClick={()=>setPayModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// ROOT COMPONENT
// ─────────────────────────────────────────────────────────────────────────
const NAV = [
  { id:"overview",  label:"Overview",   icon:"◈" },
  { id:"users",     label:"Users",      icon:"◉" },
  { id:"management",label:"Management", icon:"◍" },
  { id:"branches",  label:"Branches",   icon:"◆" },
  { id:"cars",      label:"Cars",       icon:"◗" },
  { id:"financials",label:"Financials", icon:"◈" },
];

export default function SuperAdminDashboard() {
  const [active, setActive] = useState("overview");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type="success") => setToast({ msg, type });

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background: #0B0F1A; }
        ::-webkit-scrollbar-thumb { background: #1E2A3A; border-radius:3px; }
        button:hover { opacity:.85; }
        input:focus, select:focus { border-color:#3B82F6 !important; }
      `}</style>

      <aside style={s.sidebar}>
        <div style={s.logo}>
          <div style={s.logoText}>CAR24</div>
          <div style={s.logoSub}>Super Admin</div>
        </div>
        {NAV.map(n=>(
          <div key={n.id} style={s.navItem(active===n.id)} onClick={()=>setActive(n.id)}>
            <span style={{ fontSize:14, opacity:.7 }}>{n.icon}</span>
            {n.label}
          </div>
        ))}
        <div style={{ marginTop:"auto", padding:"12px 20px", borderTop:`1px solid ${C.border}` }}>
          <div style={{ fontSize:10, color:C.muted, letterSpacing:2, textTransform:"uppercase" }}>Session</div>
          <div style={{ fontSize:11, color:C.text, marginTop:4 }}>{new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</div>
        </div>
      </aside>

      <main style={s.main}>
        <div style={s.header}>
          <div>
            <div style={s.headerTitle}>{NAV.find(n=>n.id===active)?.label}</div>
            <div style={s.headerSub}>Car24 · Super Admin Panel</div>
          </div>
          <div style={s.pill}>
            <span style={{ color:C.green, fontSize:8 }}>●</span>
            Live
          </div>
        </div>

        {active==="overview"   && <OverviewSection />}
        {active==="users"      && <UsersSection />}
        {active==="management" && <ManagementSection toast={showToast} />}
        {active==="branches"   && <BranchesSection toast={showToast} />}
        {active==="cars"       && <CarsSection toast={showToast} />}
        {active==="financials" && <FinancialsSection toast={showToast} />}
      </main>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
    </div>
  );
}