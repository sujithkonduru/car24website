import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../car24website/frontend/src/context/AuthContext.jsx";
import {
  getAllData,
  getSuperAdminFinances,
  getFinancialData,
  getPaymentHistory,
  getBranches,
  getManagementUsers,
  getPendingOwners,
  approveOwner,
  getPendingCars,
  approveCar,
  rejectCar,
  createStaff,
  verifyStaffRegister,
  adminChangePassword,
  updateBranch,
  markOwnerPaid,
  getOwnerPendingBreakdown,
  getBranchRevenue,
} from "../../../car24website/frontend/src/api.js";
import "./AdminDashboard.css";

function fmt(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

function fmtDate(d) {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);

  // Data states
  const [overview, setOverview] = useState(null);
  const [finances, setFinances] = useState(null);
  const [financialData, setFinancialData] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [management, setManagement] = useState([]);
  const [pendingOwners, setPendingOwners] = useState([]);
  const [pendingCars, setPendingCars] = useState([]);
  const [branchRevenue, setBranchRevenue] = useState([]);

  // Form states
  const [staffForm, setStaffForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    role: "staff", 
    branchId: "", 
    mobile_no: "" 
  });
  const [otpModal, setOtpModal] = useState({ open: false, email: "", otp: "" });
  const [passForm, setPassForm] = useState({ email: "", pass: "" });
  const [branchForm, setBranchForm] = useState({ 
    id: null, 
    name: "", 
    address: "", 
    city: "", 
    state: "", 
    zipCode: "", 
    phone: "", 
    email: "" 
  });
  const [approvalForm, setApprovalForm] = useState({ 
    carId: null, 
    six: "", 
    twelve: "", 
    twentyFour: "" 
  });
  
  // Filter states
  const [financialFilters, setFinancialFilters] = useState({ 
    fromDate: "", 
    carid: "", 
    ownerid: "", 
    branchid: "", 
    status: "" 
  });
  const [payHistFilters, setPayHistFilters] = useState({ 
    branchid: "", 
    date: "" 
  });

  const [notification, setNotification] = useState(null);

  function showNotification(text, type = "success") {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  }

  const loadData = useCallback(async (tab) => {
    setLoading(true);
    try {
      if (tab === "overview" || tab === "all") {
        const [ov, br, rev] = await Promise.allSettled([
          getAllData(), 
          getBranches(), 
          getBranchRevenue()
        ]);
        if (ov.status === "fulfilled") setOverview(ov.value);
        if (br.status === "fulfilled") setBranches(Array.isArray(br.value) ? br.value : br.value?.data || []);
        if (rev.status === "fulfilled") setBranchRevenue(Array.isArray(rev.value) ? rev.value : []);
      }
      if (tab === "management" || tab === "all") {
        const res = await getManagementUsers("null", "null", "null", "1000", "0");
        setManagement(res?.data || []);
      }
      if (tab === "approvals" || tab === "all") {
        const [po, pc] = await Promise.allSettled([getPendingOwners(), getPendingCars()]);
        if (po.status === "fulfilled") setPendingOwners(po.value?.data || po.value || []);
        if (pc.status === "fulfilled") setPendingCars(pc.value?.data || pc.value || []);
      }
      if (tab === "financials" || tab === "all") {
        const [fin, sf] = await Promise.allSettled([
          getFinancialData(financialFilters),
          getSuperAdminFinances(),
        ]);
        if (fin.status === "fulfilled") setFinancialData(fin.value?.data || fin.value || []);
        if (sf.status === "fulfilled") setFinances(sf.value);
      }
      if (tab === "payments") {
        const res = await getPaymentHistory(payHistFilters);
        setPaymentHistory(res?.data || res || []);
      }
    } catch (e) {
      showNotification(e.message || "Load failed", "error");
    } finally {
      setLoading(false);
    }
  }, [financialFilters, payHistFilters]);

  useEffect(() => { 
    loadData(activeTab); 
  }, [activeTab, loadData]);

  // Handler functions
  async function handleApproveOwner(id) {
    try { 
      await approveOwner(id); 
      showNotification("Owner approved successfully"); 
      loadData("approvals");
    } catch (e) { 
      showNotification(e.message, "error"); 
    }
  }

  async function handleApproveCar(e) {
    e.preventDefault();
    if (!approvalForm.six || !approvalForm.twelve || !approvalForm.twentyFour) {
      showNotification("Please set all prices", "error"); 
      return;
    }
    try {
      await approveCar(approvalForm.carId, { 
        status: "approved", 
        six: +approvalForm.six, 
        twelve: +approvalForm.twelve, 
        twentyFour: +approvalForm.twentyFour 
      });
      showNotification("Car approved successfully"); 
      setApprovalForm({ carId: null, six: "", twelve: "", twentyFour: "" }); 
      loadData("approvals");
    } catch (e) { 
      showNotification(e.message, "error"); 
    }
  }

  async function handleRejectCar(id) {
    if (!window.confirm("Are you sure you want to reject this car?")) return;
    try { 
      await rejectCar(id); 
      showNotification("Car rejected"); 
      loadData("approvals");
    } catch (e) { 
      showNotification(e.message, "error"); 
    }
  }

  async function handleCreateStaff(e) {
    e.preventDefault();
    try {
      await createStaff(staffForm);
      setOtpModal({ open: true, email: staffForm.email, otp: "" });
      setStaffForm({ name: "", email: "", password: "", role: "staff", branchId: "", mobile_no: "" });
      showNotification("Staff created — please verify OTP");
    } catch (e) { 
      showNotification(e.message, "error"); 
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    try {
      await verifyStaffRegister(otpModal.email, otpModal.otp);
      showNotification("Staff verified successfully"); 
      setOtpModal({ open: false, email: "", otp: "" }); 
      loadData("management");
    } catch (e) { 
      showNotification(e.message, "error"); 
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    try { 
      await adminChangePassword(passForm.email, passForm.pass); 
      showNotification("Password changed successfully"); 
      setPassForm({ email: "", pass: "" }); 
    } catch (e) { 
      showNotification(e.message, "error"); 
    }
  }

  async function handleUpdateBranch(e) {
    e.preventDefault();
    try {
      await updateBranch(branchForm.id, branchForm);
      showNotification("Branch updated successfully"); 
      setBranchForm({ id: null, name: "", address: "", city: "", state: "", zipCode: "", phone: "", email: "" }); 
      loadData("overview");
    } catch (e) { 
      showNotification(e.message, "error"); 
    }
  }

  async function handleMarkPaid(ownerId, branchId) {
    try { 
      await markOwnerPaid(ownerId, branchId); 
      showNotification("Marked as paid"); 
      loadData("financials");
    } catch (e) { 
      showNotification(e.message, "error"); 
    }
  }

  const tabs = [
    { id: "overview", label: "Dashboard", icon: "📊" },
    { id: "branches", label: "Branches", icon: "🏢" },
    { id: "management", label: "Team", icon: "👥" },
    { id: "approvals", label: "Pending Approvals", icon: "⏳" },
    { id: "financials", label: "Revenue", icon: "💰" },
    { id: "payments", label: "Transactions", icon: "💳" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">🚗 CarRental</div>
          <div className="role-badge">Super Admin</div>
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
          <button className="nav-item logout" onClick={() => { logout(); navigate("/staff/login"); }}>
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
            <p className="breadcrumb">Dashboard / {tabs.find(t => t.id === activeTab)?.label}</p>
          </div>
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">Super Administrator</span>
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
                  <div className="stat-icon">🏢</div>
                  <div className="stat-info">
                    <span className="stat-value">{branches.length}</span>
                    <span className="stat-label">Total Branches</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <span className="stat-value">{overview?.totalUsers || 0}</span>
                    <span className="stat-label">Active Users</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🚗</div>
                  <div className="stat-info">
                    <span className="stat-value">{overview?.totalCars || 0}</span>
                    <span className="stat-label">Total Vehicles</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <div className="stat-info">
                    <span className="stat-value">{overview?.totalBookings || 0}</span>
                    <span className="stat-label">Total Bookings</span>
                  </div>
                </div>
              </div>

              {/* Branch Revenue Table */}
              {branchRevenue.length > 0 && (
                <div className="data-card">
                  <div className="card-header">
                    <h3>Branch Performance</h3>
                    <button className="btn-icon">📈</button>
                  </div>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Branch Name</th>
                          <th>Total Revenue</th>
                          <th>Total Bookings</th>
                          <th>Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {branchRevenue.map((branch, idx) => (
                          <tr key={idx}>
                            <td>
                              <div className="branch-name">
                                <span className="branch-icon">🏪</span>
                                {branch.name || branch.branch_name || "—"}
                              </div>
                            </td>
                            <td className="amount">{fmt(branch.revenue || branch.total_revenue)}</td>
                            <td>{branch.bookings || branch.total_bookings || 0}</td>
                            <td>
                              <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${Math.min(100, ((branch.bookings || 0) / (branchRevenue[0]?.bookings || 1)) * 100)}%` }}></div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Branches Tab */}
          {!loading && activeTab === "branches" && (
            <div className="tab-content">
              <div className="data-card">
                <div className="card-header">
                  <h3>All Branches</h3>
                  <span className="badge">{branches.length} Total</span>
                </div>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Branch Name</th>
                        <th>Location</th>
                        <th>Contact</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branches.map((branch) => (
                        <tr key={branch.id}>
                          <td>#{branch.id}</td>
                          <td>
                            <strong>{branch.name}</strong>
                          </td>
                          <td>{branch.city}, {branch.state}</td>
                          <td>{branch.phone || "—"}</td>
                          <td><span className="status-badge active">Active</span></td>
                          <td>
                            <button 
                              className="btn-secondary small"
                              onClick={() => setBranchForm({ 
                                id: branch.id, 
                                name: branch.name || "", 
                                address: branch.address || "", 
                                city: branch.city || "", 
                                state: branch.state || "", 
                                zipCode: branch.zipCode || "", 
                                phone: branch.phone || "", 
                                email: branch.email || "" 
                              })}>
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Edit Branch Form Modal */}
              {branchForm.id && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h3>Edit Branch</h3>
                      <button className="close-btn" onClick={() => setBranchForm({ id: null, name: "", address: "", city: "", state: "", zipCode: "", phone: "", email: "" })}>×</button>
                    </div>
                    <form onSubmit={handleUpdateBranch}>
                      <div className="form-grid">
                        {["name", "address", "city", "state", "zipCode", "phone", "email"].map((field) => (
                          <div className="form-group" key={field}>
                            <label>{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                            <input 
                              value={branchForm[field]} 
                              onChange={(e) => setBranchForm({ ...branchForm, [field]: e.target.value })} 
                              placeholder={`Enter ${field}`}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={() => setBranchForm({ id: null, name: "", address: "", city: "", state: "", zipCode: "", phone: "", email: "" })}>Cancel</button>
                        <button type="submit" className="btn-primary">Save Changes</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Management Tab */}
          {!loading && activeTab === "management" && (
            <div className="tab-content">
              {/* Create Staff Form */}
              <div className="data-card">
                <div className="card-header">
                  <h3>Add Team Member</h3>
                </div>
                <form onSubmit={handleCreateStaff}>
                  <div className="form-grid">
                    {["name", "email", "password", "mobile_no"].map((field) => (
                      <div className="form-group" key={field}>
                        <label>{field.replace("_", " ").toUpperCase()}</label>
                        <input 
                          type={field === "password" ? "password" : "text"} 
                          value={staffForm[field]} 
                          required
                          onChange={(e) => setStaffForm({ ...staffForm, [field]: e.target.value })} 
                          placeholder={`Enter ${field.replace("_", " ")}`}
                        />
                      </div>
                    ))}
                    <div className="form-group">
                      <label>ROLE</label>
                      <select value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}>
                        <option value="staff">Staff Member</option>
                        <option value="branch_head">Branch Head</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                    {(staffForm.role === "staff" || staffForm.role === "branch_head") && (
                      <div className="form-group">
                        <label>ASSIGN BRANCH</label>
                        <select value={staffForm.branchId} onChange={(e) => setStaffForm({ ...staffForm, branchId: e.target.value })} required>
                          <option value="">Select Branch</option>
                          {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                  <button type="submit" className="btn-primary">Create Member</button>
                </form>
              </div>

              {/* OTP Verification Modal */}
              {otpModal.open && (
                <div className="modal-overlay">
                  <div className="modal-content small">
                    <div className="modal-header">
                      <h3>Verify OTP</h3>
                    </div>
                    <form onSubmit={handleVerifyOtp}>
                      <p>Enter the OTP sent to <strong>{otpModal.email}</strong></p>
                      <div className="form-group">
                        <label>OTP Code</label>
                        <input 
                          maxLength={6} 
                          value={otpModal.otp} 
                          onChange={(e) => setOtpModal({ ...otpModal, otp: e.target.value })} 
                          required 
                          placeholder="Enter 6-digit OTP"
                        />
                      </div>
                      <div className="modal-footer">
                        <button type="submit" className="btn-primary">Verify</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Team Members Table */}
              <div className="data-card">
                <div className="card-header">
                  <h3>Team Members</h3>
                  <span className="badge">{management.length} Members</span>
                </div>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Contact</th>
                        <th>Role</th>
                        <th>Branch</th>
                        <th>Status</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {management.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="empty-state">No team members found</td>
                        </tr>
                      ) : management.map((member) => (
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
                          <td>{member.mobile_no || "—"}</td>
                          <td><span className={`role-badge ${member.role}`}>{member.role}</span></td>
                          <td>{member.branch_name || "—"}</td>
                          <td>
                            <span className={`status-badge ${member.is_verified ? "active" : "pending"}`}>
                              {member.is_verified ? "Verified" : "Pending"}
                            </span>
                          </td>
                          <td>{fmtDate(member.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Approvals Tab */}
          {!loading && activeTab === "approvals" && (
            <div className="tab-content">
              {/* Pending Owners */}
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
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingOwners.length === 0 ? (
                        <tr><td colSpan={5} className="empty-state">No pending owner approvals</td></tr>
                      ) : pendingOwners.map((owner) => (
                        <tr key={owner.id}>
                          <td><strong>{owner.name}</strong></td>
                          <td>{owner.email}</td>
                          <td>{owner.mobileNo || "—"}</td>
                          <td>{fmtDate(owner.created_at)}</td>
                          <td>
                            <button className="btn-success small" onClick={() => handleApproveOwner(owner.id)}>
                              Approve
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pending Cars */}
              <div className="data-card">
                <div className="card-header">
                  <h3>Pending Vehicle Approvals</h3>
                  <span className="badge warning">{pendingCars.length} Pending</span>
                </div>
                
                {/* Approve Car Form */}
                {approvalForm.carId && (
                  <div className="modal-overlay">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h3>Set Pricing for Vehicle</h3>
                        <button className="close-btn" onClick={() => setApprovalForm({ carId: null, six: "", twelve: "", twentyFour: "" })}>×</button>
                      </div>
                      <form onSubmit={handleApproveCar}>
                        <div className="form-grid">
                          {[
                            ["six", "6 Hours (₹)"],
                            ["twelve", "12 Hours (₹)"], 
                            ["twentyFour", "24 Hours (₹)"]
                          ].map(([key, label]) => (
                            <div className="form-group" key={key}>
                              <label>{label}</label>
                              <input 
                                type="number" 
                                value={approvalForm[key]} 
                                required 
                                onChange={(e) => setApprovalForm({ ...approvalForm, [key]: e.target.value })} 
                                placeholder="Enter amount"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="modal-footer">
                          <button type="submit" className="btn-success">Approve Vehicle</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Vehicle</th>
                        <th>Owner</th>
                        <th>Year</th>
                        <th>Category</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingCars.length === 0 ? (
                        <tr><td colSpan={6} className="empty-state">No pending vehicle approvals</td></tr>
                      ) : pendingCars.map((car) => (
                        <tr key={car.id}>
                          <td><strong>{car.model}</strong></td>
                          <td>{car.owner_name || "—"}</td>
                          <td>{car.year}</td>
                          <td><span className="category-badge">{car.category}</span></td>
                          <td>{fmtDate(car.created_at)}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-success small" onClick={() => setApprovalForm({ carId: car.id, six: "", twelve: "", twentyFour: "" })}>
                                Approve
                              </button>
                              <button className="btn-danger small" onClick={() => handleRejectCar(car.id)}>
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Financials Tab */}
          {!loading && activeTab === "financials" && (
            <div className="tab-content">
              {/* Revenue Summary Cards */}
              {finances && (
                <div className="stats-grid">
                  <div className="stat-card primary">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                      <span className="stat-label">Total Revenue</span>
                      <span className="stat-value">{fmt(finances.totalRevenue)}</span>
                    </div>
                  </div>
                  <div className="stat-card success">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                      <span className="stat-label">Paid Amount</span>
                      <span className="stat-value">{fmt(finances.totalPaid)}</span>
                    </div>
                  </div>
                  <div className="stat-card warning">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-info">
                      <span className="stat-label">Pending Amount</span>
                      <span className="stat-value">{fmt(finances.totalPending)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="data-card">
                <div className="card-header">
                  <h3>Filter Transactions</h3>
                </div>
                <div className="filter-bar">
                  {[
                    ["fromDate", "From Date", "date"],
                    ["carid", "Car ID", "text"],
                    ["ownerid", "Owner ID", "text"],
                    ["branchid", "Branch ID", "text"],
                    ["status", "Status", "text"]
                  ].map(([key, label, type]) => (
                    <div className="filter-group" key={key}>
                      <label>{label}</label>
                      <input 
                        type={type} 
                        value={financialFilters[key]} 
                        onChange={(e) => setFinancialFilters({ ...financialFilters, [key]: e.target.value })} 
                        placeholder={`Filter by ${label.toLowerCase()}`}
                      />
                    </div>
                  ))}
                  <button className="btn-primary" onClick={() => loadData("financials")}>Apply Filters</button>
                </div>
              </div>

              {/* Financial Data Table */}
              <div className="data-card">
                <div className="card-header">
                  <h3>Transaction History</h3>
                </div>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Vehicle</th>
                        <th>Owner</th>
                        <th>Branch</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financialData.length === 0 ? (
                        <tr><td colSpan={8} className="empty-state">No transaction data found</td></tr>
                      ) : financialData.map((record, idx) => (
                        <tr key={idx}>
                          <td>#{record.booking_id || record.id}</td>
                          <td>{record.car_model || "—"}</td>
                          <td>{record.owner_name || "—"}</td>
                          <td>{record.branch_name || "—"}</td>
                          <td className="amount">{fmt(record.amount || record.total_price)}</td>
                          <td>
                            <span className={`status-badge ${record.payment_status || record.status}`}>
                              {record.payment_status || record.status}
                            </span>
                          </td>
                          <td>{fmtDate(record.created_at)}</td>
                          <td>
                            {record.payment_status === "pending" && (
                              <button className="btn-success small" onClick={() => handleMarkPaid(record.owner_id, record.branch_id)}>
                                Mark Paid
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {!loading && activeTab === "payments" && (
            <div className="tab-content">
              <div className="data-card">
                <div className="card-header">
                  <h3>Payment History</h3>
                </div>
                <div className="filter-bar">
                  <div className="filter-group">
                    <label>Branch</label>
                    <input 
                      value={payHistFilters.branchid} 
                      onChange={(e) => setPayHistFilters({ ...payHistFilters, branchid: e.target.value })} 
                      placeholder="Branch ID"
                    />
                  </div>
                  <div className="filter-group">
                    <label>Date</label>
                    <input 
                      type="date" 
                      value={payHistFilters.date} 
                      onChange={(e) => setPayHistFilters({ ...payHistFilters, date: e.target.value })} 
                    />
                  </div>
                  <button className="btn-primary" onClick={() => loadData("payments")}>Search</button>
                </div>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Owner</th>
                        <th>Branch</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.length === 0 ? (
                        <tr><td colSpan={6} className="empty-state">No payment history found</td></tr>
                      ) : paymentHistory.map((payment, idx) => (
                        <tr key={idx}>
                          <td>#{payment.id}</td>
                          <td><strong>{payment.owner_name || "—"}</strong></td>
                          <td>{payment.branch_name || "—"}</td>
                          <td className="amount">{fmt(payment.amount)}</td>
                          <td>{fmtDate(payment.created_at || payment.date)}</td>
                          <td>
                            <span className={`status-badge ${payment.status}`}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {!loading && activeTab === "settings" && (
            <div className="tab-content">
              <div className="data-card">
                <div className="card-header">
                  <h3>Change User Password</h3>
                </div>
                <form onSubmit={handleChangePassword} className="settings-form">
                  <div className="form-group">
                    <label>User Email Address</label>
                    <input 
                      type="email" 
                      value={passForm.email} 
                      required 
                      onChange={(e) => setPassForm({ ...passForm, email: e.target.value })} 
                      placeholder="Enter user's email"
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input 
                      type="password" 
                      value={passForm.pass} 
                      required 
                      onChange={(e) => setPassForm({ ...passForm, pass: e.target.value })} 
                      placeholder="Enter new password"
                    />
                  </div>
                  <button type="submit" className="btn-primary">Update Password</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}