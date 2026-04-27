import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getStaffTasks, verifyCarKey, startRide, endRide, collectRemainingPayment, getBookingDetails } from "../api.js";
import { Search, Clock, TrendingUp, CheckCircle, Users, Calendar, Activity, Download, User, Wallet, CreditCard, IndianRupee } from 'lucide-react';
import UserProfileModal from "../components/UserProfileModal.jsx";
import { printBookingReceipt } from "../utils/receiptUtils.js";
import "./StaffDashboard.css";

const RZP_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || "";

function formatDt(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch { return iso; }
}

function formatCurrency(amount) {
  if (!amount && amount !== 0) return "₹0";
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function formatElapsed(isoString) {
  if (!isoString) return "—";
  const now = new Date();
  const start = new Date(isoString);
  const diffMs = now - start;

  if (diffMs < 0) return "Not started";

  const diffSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(diffSeconds / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

export default function StaffDashboard() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState(null);

  // Key verify state
  const [verifyForm, setVerifyForm] = useState({ bookingId: "", key: "" });
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Start ride state  
  const [startForm, setStartForm] = useState({ odometer: "", fuelLevel: "", fastagBalance: "" });
  const [startResult, setStartResult] = useState(null);
  const [startError, setStartError] = useState(null);
  const [startLoading, setStartLoading] = useState(false);

  // End ride state
  const [endForm, setEndForm] = useState({ bookingId: "", odometer: "", fuelLevel: "", fastagBalance: "" });
  const [endResult, setEndResult] = useState(null);
  const [endError, setEndError] = useState(null);
  const [endLoading, setEndLoading] = useState(false);

  // Payment state
  const [paymentData, setPaymentData] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Filter and search state
  const [bookingFilter, setBookingFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Live timer state
  const [elapsedTimes, setElapsedTimes] = useState({});

  const loadTasks = useCallback(async () => {
    setTasksLoading(true);
    setTasksError(null);
    setElapsedTimes({});
    try {
      const rows = await getStaffTasks();
      console.log("Loaded staff tasks:", rows);
      
      let tasksData = Array.isArray(rows) ? rows : [];
      
      // Fetch complete booking details for each task to get pricing information
      if (tasksData.length > 0) {
        console.log("Fetching booking details for pricing information...");
        const enrichedTasks = await Promise.all(
          tasksData.map(async (task) => {
            try {
              // Fetch full booking details from the booking API
              const bookingDetails = await getBookingDetails(task.booking_id);
              console.log(`Booking ${task.booking_id} details:`, bookingDetails);
              
              return {
                ...task,
                // Map booking details to task fields
                totalPrice: bookingDetails.totalPrice || bookingDetails.total_price || 0,
                advance_paid: bookingDetails.advance_paid || bookingDetails.advancePaid || 0,
                remaining_amount: bookingDetails.remaining_amount || (bookingDetails.totalPrice - bookingDetails.advance_paid) || 0,
                pickupDate: bookingDetails.pickupDate || task.pickupDate,
                dropoffDate: bookingDetails.dropoffDate || task.dropoffDate,
                customer_name: bookingDetails.user?.name || task.customer_name,
                customer_phone: bookingDetails.user?.mobileNo || task.customer_phone,
                car_model: bookingDetails.car?.model || task.car_model,
                car_plate: bookingDetails.car?.licensePlate || task.car_plate
              };
            } catch (err) {
              console.warn(`Failed to fetch booking details for ${task.booking_id}:`, err.message);
              // Return original task with default values
              return {
                ...task,
                totalPrice: task.totalPrice || task.total_amount || 0,
                advance_paid: task.advance_paid || 0,
                remaining_amount: task.remaining_amount || 0
              };
            }
          })
        );
        tasksData = enrichedTasks;
      }
      
      console.log("Enriched tasks with pricing:", tasksData.map(t => ({
        id: t.booking_id,
        totalPrice: t.totalPrice,
        advance_paid: t.advance_paid,
        remaining_amount: t.remaining_amount
      })));
      
      setTasks(tasksData);
    } catch (e) {
      console.error("Load tasks error:", e);
      setTasksError(e.message || "Could not load tasks");
    } finally {
      setTasksLoading(false);
    }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const pendingPickup = tasks.filter((t) => !t.ride_start_time);
  const activeRides = tasks.filter((t) => t.ride_start_time && !t.ride_end_time);
  const completedRides = tasks.filter((t) => t.ride_end_time);

  // Helper function to safely get total amount from task
  const getTotalAmount = (task) => {
    return Number(task.totalPrice) || Number(task.total_price) || Number(task.totalamount) || 0;
  };

  // Helper function to safely get advance paid from task
  const getAdvancePaid = (task) => {
    return Number(task.advance_paid) || Number(task.advancePaid) || 0;
  };

  // Helper function to get remaining amount
  const getRemainingAmount = (task) => {
    return getTotalAmount(task) - getAdvancePaid(task);
  };

  // Aggregate financial stats
  const totalAmount = useMemo(() => 
    tasks.reduce((sum, t) => sum + getTotalAmount(t), 0)
  , [tasks]);

  const advancePaid = useMemo(() => 
    tasks.reduce((sum, t) => sum + getAdvancePaid(t), 0)
  , [tasks]);

  const pendingCollection = useMemo(() => 
    tasks.reduce((sum, t) => sum + Math.max(0, getRemainingAmount(t)), 0)
  , [tasks]);

  // Live timer updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newElapsed = {};
      activeRides.forEach((ride) => {
        if (ride.ride_start_time) {
          newElapsed[ride.booking_id] = formatElapsed(ride.ride_start_time);
        }
      });
      setElapsedTimes(newElapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeRides]);

  // ── Verify Key ──
  async function handleVerify(e) {
    e.preventDefault();
    setVerifyError(null);
    setVerifyResult(null);
    setStartResult(null);
    setVerifyLoading(true);
    try {
      const booking = tasks.find(t => t.booking_id === parseInt(verifyForm.bookingId));
      
      if (!booking) {
        throw new Error("Booking not found in tasks");
      }
      
      const customerUserId = booking.userId || booking.user_id;
      
      if (!customerUserId) {
        throw new Error("Customer user ID not found for this booking");
      }
      
      const res = await verifyCarKey(
        verifyForm.bookingId, 
        verifyForm.key, 
        customerUserId
      );
      setVerifyResult(res);
    } catch (err) {
      setVerifyError(err.message || "Verification failed");
    } finally {
      setVerifyLoading(false);
    }
  }

  // ── Start Ride ──
  async function handleStartRide(e) {
    e.preventDefault();
    if (!verifyResult?.bookingToken) {
      setStartError("Please verify customer key first");
      return;
    }

    const fastagBalanceNum = parseFloat(
      startForm.fastagBalance?.toString().replace(/[₹,]/g, '') || '0'
    );

    if (isNaN(fastagBalanceNum) || fastagBalanceNum < 0) {
      setStartError("Fastag balance must be 0 or positive number");
      return;
    }

    const odometerNum = Number(startForm.odometer) || 0;
    if (odometerNum <= 0) {
      setStartError("Odometer reading must be greater than 0");
      return;
    }

    if (!startForm.fuelLevel) {
      setStartError("Please select fuel level");
      return;
    }

    setStartError(null);
    setStartResult(null);
    setStartLoading(true);
    try {
      const res = await startRide({
        odometer: odometerNum,
        fuelLevel: startForm.fuelLevel,
        fastagBalance: fastagBalanceNum,
        bookingToken: verifyResult.bookingToken,
      });
      setStartResult(res);
      loadTasks();
      setVerifyResult(null);
      setVerifyForm({ bookingId: "", key: "" });
      setStartForm({ odometer: "", fuelLevel: "", fastagBalance: "" });
    } catch (err) {
      setStartError(err.message || `Failed to start ride: ${err.status || 'Unknown error'}`);
    } finally {
      setStartLoading(false);
    }
  }

  // ── End Ride ──
  async function handleEndRide(e) {
    e.preventDefault();
    setEndError(null);
    setEndResult(null);
    setEndLoading(true);
    try {
      const odometerNum = Number(endForm.odometer) || 0;
      if (odometerNum <= 0) {
        setEndError("Odometer reading must be greater than 0");
        setEndLoading(false);
        return;
      }

      const fastagBalanceNum = parseFloat(
        endForm.fastagBalance?.toString().replace(/[₹,]/g, '') || '0'
      );
      if (isNaN(fastagBalanceNum) || fastagBalanceNum < 0) {
        setEndError("Fastag balance must be 0 or positive number");
        setEndLoading(false);
        return;
      }

      if (!endForm.fuelLevel) {
        setEndError("Please select fuel level");
        setEndLoading(false);
        return;
      }

      const res = await endRide(endForm.bookingId, {
        odometer: odometerNum,
        fuelLevel: endForm.fuelLevel,
        fastagBalance: fastagBalanceNum,
      });
      setEndResult(res);

      if (res.remainingAmount && res.remainingAmount > 0) {
        setPaymentData({
          bookingId: endForm.bookingId,
          remainingAmount: res.remainingAmount,
          bookingDetails: res.bookingDetails,
          carDetails: res.carDetails
        });
        setShowPaymentModal(true);
      } else {
        loadTasks();
        setEndForm({ bookingId: "", odometer: "", fuelLevel: "", fastagBalance: "" });
      }
    } catch (err) {
      setEndError(err.message || "Could not end ride");
    } finally {
      setEndLoading(false);
    }
  }

  // ── Collect Remaining Payment ──
  function openRazorpay(order, bookingId, onVerified) {
    if (!window.Razorpay) {
      setPaymentError("Razorpay script not loaded. Refresh the page.");
      setPaymentLoading(false);
      return;
    }
    if (!RZP_KEY) {
      setPaymentError("Payment configuration missing");
      setPaymentLoading(false);
      return;
    }

    const options = {
      key: RZP_KEY,
      amount: order.amount,
      currency: order.currency || "INR",
      name: "Car24",
      description: `Final Payment - Booking #${bookingId}`,
      order_id: order.id,
      handler(response) {
        onVerified(response);
      },
      prefill: {
        email: paymentData?.bookingDetails?.customerEmail || "",
        contact: paymentData?.bookingDetails?.customerPhone || ""
      },
      theme: { color: "#14b8a6" },
      modal: {
        ondismiss: () => {
          setPaymentLoading(false);
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (res) => {
      setPaymentError(res?.error?.description || "Payment failed");
      setPaymentLoading(false);
    });
    rzp.open();
  }

  async function handleCollectPayment() {
    setPaymentLoading(true);
    setPaymentError(null);

    try {
      const res = await collectRemainingPayment({
        bookingId: paymentData.bookingId,
        amount: paymentData.remainingAmount
      });

      if (res.order == null || res.amount === 0) {
        setShowPaymentModal(false);
        loadTasks();
        setPaymentLoading(false);
        return;
      }

      openRazorpay(res.order, paymentData.bookingId, async (response) => {
        try {
          const verifyRes = await collectRemainingPayment({
            bookingId: paymentData.bookingId,
            amount: paymentData.remainingAmount,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });

          if (verifyRes.success) {
            alert("Payment collected successfully!");
            setShowPaymentModal(false);
            loadTasks();
          } else {
            setPaymentError("Payment verification failed");
          }
        } catch (ve) {
          setPaymentError(ve.message || "Payment verification failed");
        } finally {
          setPaymentLoading(false);
        }
      });
    } catch (err) {
      setPaymentError(err.message || "Could not initiate payment");
      setPaymentLoading(false);
    }
  }

  function prefillEndRide(bookingId, bookingData) {
    setEndForm((f) => ({ ...f, bookingId: String(bookingId) }));
    setActiveTab("verify");
    setVerifyResult({
      ...verifyResult,
      bookingDetails: bookingData
    });
  }

  function prefillVerify(bookingId) {
    setVerifyForm((f) => ({ ...f, bookingId: String(bookingId) }));
    setActiveTab("verify");
  }

  return (
    <div className="sdb-root">
      {/* ── Header ── */}
      <div className="sdb-header">
        <div>
          <p className="sdb-eyebrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            {isAdmin ? "Admin" : "Staff"} Dashboard
          </p>
          <h1 className="sdb-title">Welcome, {user?.name || "Staff"}</h1>
        </div>
        <div className="sdb-header-stats">
          <div className="sdb-mini-stat">
            <span className="sdb-mini-num">{pendingPickup.length}</span>
            <span className="sdb-mini-label">Pending Pickup</span>
          </div>
          <div className="sdb-mini-stat sdb-mini-stat--active">
            <span className="sdb-mini-num">{activeRides.length}</span>
            <span className="sdb-mini-label">Active Rides</span>
          </div>
          <div className="sdb-mini-stat sdb-mini-stat--completed">
            <span className="sdb-mini-num">{completedRides.length}</span>
            <span className="sdb-mini-label">Completed</span>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="sdb-tabs">
        <button
          className={`sdb-tab${activeTab === "overview" ? " active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`sdb-tab${activeTab === "bookings" ? " active" : ""}`}
          onClick={() => setActiveTab("bookings")}
        >
          Bookings
          <span className="sdb-tab-badge">{tasks.length}</span>
        </button>
        <button
          className={`sdb-tab${activeTab === "tasks" ? " active" : ""}`}
          onClick={() => setActiveTab("tasks")}
        >
          Tasks
          {(pendingPickup.length + activeRides.length) > 0 && (
            <span className="sdb-tab-badge">{pendingPickup.length + activeRides.length}</span>
          )}
        </button>
        <button
          className={`sdb-tab${activeTab === "verify" ? " active" : ""}`}
          onClick={() => setActiveTab("verify")}
        >
          Key Verify &amp; Ride Control
        </button>
      </div>

      {/* ══ OVERVIEW TAB ══ */}
      {activeTab === "overview" && (
        <div className="sdb-panel">
          <div className="sdb-stats-grid">
            <div className="sdb-stat-card">
              <div className="sdb-stat-icon" style={{ background: "#fbbf2420", color: "#fbbf24" }}>
                <Clock size={24} />
              </div>
              <div className="sdb-stat-content">
                <span className="sdb-stat-value">{pendingPickup.length}</span>
                <span className="sdb-stat-label">Pending Pickup</span>
              </div>
            </div>
            <div className="sdb-stat-card">
              <div className="sdb-stat-icon" style={{ background: "#14b8a620", color: "#14b8a6" }}>
                <TrendingUp size={24} />
              </div>
              <div className="sdb-stat-content">
                <span className="sdb-stat-value">{activeRides.length}</span>
                <span className="sdb-stat-label">Active Rides</span>
              </div>
            </div>
            <div className="sdb-stat-card">
              <div className="sdb-stat-icon" style={{ background: "#10b98120", color: "#10b981" }}>
                <CheckCircle size={24} />
              </div>
              <div className="sdb-stat-content">
                <span className="sdb-stat-value">{completedRides.length}</span>
                <span className="sdb-stat-label">Completed Rides</span>
              </div>
            </div>
            <div className="sdb-stat-card">
              <div className="sdb-stat-icon" style={{ background: "#3b82f620", color: "#3b82f6" }}>
                <Users size={24} />
              </div>
              <div className="sdb-stat-content">
                <span className="sdb-stat-value">{tasks.length}</span>
                <span className="sdb-stat-label">Total Tasks</span>
              </div>
            </div>

            <div className="sdb-stat-card">
              <div className="sdb-stat-icon" style={{ background: "#8b5cf620", color: "#8b5cf6" }}>
                <Wallet size={24} />
              </div>
              <div className="sdb-stat-content">
                <span className="sdb-stat-value">{formatCurrency(totalAmount)}</span>
                <span className="sdb-stat-label">Total Amount</span>
              </div>
            </div>

            <div className="sdb-stat-card">
              <div className="sdb-stat-icon" style={{ background: "#10b98120", color: "#10b981" }}>
                <CreditCard size={24} />
              </div>
              <div className="sdb-stat-content">
                <span className="sdb-stat-value">{formatCurrency(advancePaid)}</span>
                <span className="sdb-stat-label">Advance Paid</span>
              </div>
            </div>

            <div className="sdb-stat-card">
              <div className="sdb-stat-icon" style={{ background: "#f59e2020", color: "#f59e20" }}>
                <IndianRupee size={24} />
              </div>
              <div className="sdb-stat-content">
                <span className={`sdb-stat-value ${pendingCollection > 0 ? 'text-warning' : ''}`}>{formatCurrency(pendingCollection)}</span>
                <span className="sdb-stat-label">Pending Collection</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ BOOKINGS TAB ══ */}
      {activeTab === "bookings" && (
        <div className="sdb-panel">
          <div className="sdb-section-header">
            <h2 className="sdb-section-title">All Bookings</h2>
            <div className="sdb-filters">
              <select
                value={bookingFilter}
                onChange={(e) => setBookingFilter(e.target.value)}
                className="sdb-filter-select"
              >
                <option value="all">All Bookings</option>
                <option value="pending">Pending Pickup</option>
                <option value="active">Active Rides</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="sdb-search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by customer, car model, plate, or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {tasksLoading ? (
            <div className="sdb-loading">Loading bookings...</div>
          ) : tasks.length === 0 ? (
            <div className="sdb-empty-state">
              <Calendar size={48} />
              <p>No bookings found</p>
            </div>
          ) : (
            <div className="sdb-bookings-table">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Car</th>
                    <th>Pickup</th>
                    <th>Amount Details</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks
                    .filter((task) => {
                      const matchesFilter = bookingFilter === "all" ||
                        (bookingFilter === "pending" && !task.ride_start_time) ||
                        (bookingFilter === "active" && task.ride_start_time && !task.ride_end_time) ||
                        (bookingFilter === "completed" && task.ride_end_time);
                      const matchesSearch = !searchTerm ||
                        task.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        task.car_model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        task.car_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        task.booking_id?.toString().includes(searchTerm);
                      return matchesFilter && matchesSearch;
                    })
                    .map((task) => {
                      const status = !task.ride_start_time ? "pending" :
                        task.ride_start_time && !task.ride_end_time ? "active" : "completed";

                      const totalAmount = getTotalAmount(task);
                      const advancePaidAmount = getAdvancePaid(task);
                      const remainingAmount = getRemainingAmount(task);

                      return (
                        <tr key={task.booking_id}>
                          <td>#{task.booking_id}</td>
                          <td>
                            <strong>{task.customer_name}</strong>
                            <small>{task.customer_phone || "—"}</small>
                          </td>
                          <td>
                            {task.car_model}
                            <small>{task.car_plate}</small>
                          </td>
                          <td>{formatDt(task.pickupDate)}</td>
                          <td className="amount-cell">
                            <div className="amount-details">
                              <div className="amount-row total">
                                <span>Total:</span>
                                <strong className="total-amount">{formatCurrency(totalAmount)}</strong>
                              </div>
                              <div className="amount-row paid">
                                <span>Paid:</span>
                                <span className="paid-amount">{formatCurrency(advancePaidAmount)}</span>
                              </div>
                              <div className="amount-row remaining">
                                <span>Remaining:</span>
                                <strong className={`remaining-amount ${remainingAmount > 0 ? 'text-warning' : 'text-success'}`}>
                                  {formatCurrency(remainingAmount)}
                                </strong>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`sdb-status-badge sdb-status-badge-${status}`}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          </td>
                          <td className="sdb-actions">
                            <button
                              className="sdb-btn-small primary"
                              onClick={() => prefillVerify(task.booking_id)}
                            >
                              Verify
                            </button>
                            {status === "active" && (
                              <button
                                className="sdb-btn-small danger"
                                onClick={() => prefillEndRide(task.booking_id, task)}
                              >
                                End Ride
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══ TASKS TAB ══ */}
      {activeTab === "tasks" && (
        <div className="sdb-panel">
          {tasksError && <p className="banner error">{tasksError}</p>}
          {tasksLoading && (
            <div className="sdb-skeleton-list">
              {[1, 2, 3].map((i) => <div key={i} className="sdb-skeleton-row" />)}
            </div>
          )}

          {!tasksLoading && (
            <>
              {/* Pending pickup */}
              <div className="sdb-section">
                <h2 className="sdb-section-title">
                  <span className="sdb-dot sdb-dot--yellow" />
                  Pending Pickup ({pendingPickup.length})
                </h2>
                {pendingPickup.length === 0 ? (
                  <p className="muted sdb-empty">No rides waiting for pickup.</p>
                ) : (
                  <div className="sdb-task-list">
                    {pendingPickup.map((t) => {
                      const totalAmount = getTotalAmount(t);
                      const advancePaidAmount = getAdvancePaid(t);
                      const remainingAmount = getRemainingAmount(t);

                      return (
                        <div key={t.booking_id} className="sdb-task-card">
                          <div className="sdb-task-top">
                            <div>
                              <p className="sdb-task-car">{t.car_model}</p>
                              <p className="sdb-task-plate">{t.car_plate}</p>
                            </div>
                            <span className="sdb-status-pill sdb-status-pill--pending">Pending Pickup</span>
                          </div>
                          <div className="sdb-task-meta">
                            <span>👤 {t.customer_name}</span>
                            <span>🕐 {formatDt(t.pickupDate)}</span>
                            <span>🚩 Until {formatDt(t.dropoffDate)}</span>
                            <span>Booking #{t.booking_id}</span>
                          </div>

                          <div className="sdb-payment-info">
                            <div className="payment-header">
                              <CreditCard size={14} />
                              <span>Payment Summary</span>
                            </div>
                            <div className="payment-detail">
                              <span>💰 Total Amount:</span>
                              <strong className="total-amount">{formatCurrency(totalAmount)}</strong>
                            </div>
                            <div className="payment-detail">
                              <span>✅ Advance Paid:</span>
                              <strong className="paid-amount">{formatCurrency(advancePaidAmount)}</strong>
                            </div>
                            <div className="payment-detail highlight">
                              <span>⏳ Remaining to Collect:</span>
                              <strong className={`remaining-amount ${remainingAmount > 0 ? 'text-warning' : 'text-success'}`}>
                                {formatCurrency(remainingAmount)}
                              </strong>
                            </div>
                            {remainingAmount > 0 && (
                              <div className="payment-note">
                                <span>⚠️ Customer needs to pay {formatCurrency(remainingAmount)} at pickup</span>
                              </div>
                            )}
                          </div>

                          <div className="sdb-task-actions">
                            <button
                              className="btn small primary"
                              onClick={() => prefillVerify(t.booking_id)}
                            >
                              Verify Key &amp; Start
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Active rides */}
              <div className="sdb-section">
                <h2 className="sdb-section-title">
                  <span className="sdb-dot sdb-dot--teal" />
                  Active Rides ({activeRides.length})
                </h2>
                {activeRides.length === 0 ? (
                  <p className="muted sdb-empty">No active rides right now.</p>
                ) : (
                  <div className="sdb-task-list">
                    {activeRides.map((t) => {
                      const totalAmount = getTotalAmount(t);
                      const advancePaidAmount = getAdvancePaid(t);
                      const remainingAmount = getRemainingAmount(t);

                      return (
                        <div key={t.booking_id} className="sdb-task-card sdb-task-card--active">
                          <div className="sdb-task-top">
                            <div>
                              <p className="sdb-task-car">{t.car_model}</p>
                              <p className="sdb-task-plate">{t.car_plate}</p>
                            </div>
                            <span className="sdb-status-pill sdb-status-pill--active">Ongoing</span>
                          </div>
                          <div className="sdb-task-meta">
                            <span>👤 {t.customer_name}</span>
                            <span>▶ Running {elapsedTimes[t.booking_id] || formatElapsed(t.ride_start_time)}</span>
                            <span>🏁 Due {formatDt(t.dropoffDate)}</span>
                            <span>Booking #{t.booking_id}</span>
                          </div>

                          <div className="sdb-payment-info">
                            <div className="payment-header">
                              <CreditCard size={14} />
                              <span>Payment Summary</span>
                            </div>
                            <div className="payment-detail">
                              <span>💰 Total Amount:</span>
                              <strong className="total-amount">{formatCurrency(totalAmount)}</strong>
                            </div>
                            <div className="payment-detail">
                              <span>✅ Advance Paid:</span>
                              <strong className="paid-amount">{formatCurrency(advancePaidAmount)}</strong>
                            </div>
                            <div className="payment-detail highlight">
                              <span>⏳ Pending Collection:</span>
                              <strong className={`remaining-amount ${remainingAmount > 0 ? 'text-warning' : 'text-success'}`}>
                                {formatCurrency(remainingAmount)}
                              </strong>
                            </div>
                            {remainingAmount > 0 && (
                              <div className="payment-note warning">
                                <span>⚠️ Collect {formatCurrency(remainingAmount)} at ride end</span>
                              </div>
                            )}
                          </div>

                          <div className="sdb-task-actions">
                            <button
                              className="btn small danger"
                              onClick={() => prefillEndRide(t.booking_id, t)}
                            >
                              End Ride & Collect Payment
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button className="btn ghost sdb-refresh-btn" onClick={loadTasks}>
                ↻ Refresh tasks
              </button>
            </>
          )}
        </div>
      )}

      {/* ══ VERIFY TAB ══ */}
      {activeTab === "verify" && (
        <div className="sdb-panel sdb-verify-panel">
          <div className="sdb-verify-grid">
            {/* Key Verification */}
            <section className="card">
              <h2 className="sdb-card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
                Verify Customer Key
              </h2>
              <form className="sdb-form" onSubmit={handleVerify}>
                <label>
                  Booking ID
                  <input
                    type="text"
                    value={verifyForm.bookingId}
                    onChange={(e) => setVerifyForm((f) => ({ ...f, bookingId: e.target.value }))}
                    placeholder="e.g. 42"
                    required
                  />
                </label>
                <label>
                  Confirmation OTP / Key
                  <input
                    type="text"
                    value={verifyForm.key}
                    onChange={(e) => setVerifyForm((f) => ({ ...f, key: e.target.value }))}
                    placeholder="6-digit OTP"
                    required
                  />
                </label>
                {verifyError && <p className="banner error">{verifyError}</p>}
                <button type="submit" className="btn primary" disabled={verifyLoading}>
                  {verifyLoading ? "Verifying…" : "Verify Key"}
                </button>
              </form>

              {verifyResult && (
                <div className="sdb-verify-result">
                  <p className="banner success">✓ Key verified successfully</p>
                  {verifyResult.userdata && (
                    <div className="sdb-customer-info">
                      <h3>Customer Details</h3>
                      <dl className="sdb-dl">
                        <div><dt>Name</dt><dd>{verifyResult.userdata.name}</dd></div>
                        <div><dt>Email</dt><dd>{verifyResult.userdata.email}</dd></div>
                        <div><dt>Mobile</dt><dd>{verifyResult.userdata.mobileno || "—"}</dd></div>
                        <div><dt>Verified</dt><dd>{verifyResult.userdata.is_verified ? "✓ Yes" : "✗ No"}</dd></div>
                      </dl>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Start Ride */}
            <section className="card">
              <h2 className="sdb-card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Start Ride
              </h2>
              {!verifyResult?.bookingToken ? (
                <p className="muted sdb-hint">Verify a customer key first to enable ride start.</p>
              ) : (
                <form className="sdb-form" onSubmit={handleStartRide}>
                  <label>
                    Odometer Reading (km) <span className="required">*</span>
                    <input
                      type="number"
                      step="0.1"
                      value={startForm.odometer}
                      onChange={(e) => setStartForm((f) => ({ ...f, odometer: e.target.value }))}
                      placeholder="e.g. 24000.5"
                      required
                    />
                  </label>
                  <label>
                    Fuel Level <span className="required">*</span>
                    <select
                      value={startForm.fuelLevel}
                      onChange={(e) => setStartForm((f) => ({ ...f, fuelLevel: e.target.value }))}
                      required
                    >
                      <option value="">Select level</option>
                      <option value="Full">Full</option>
                      <option value="3/4">3/4</option>
                      <option value="1/2">1/2</option>
                      <option value="1/4">1/4</option>
                      <option value="Empty">Empty</option>
                    </select>
                  </label>
                  <label>
                    Fastag Balance <span className="required">*</span>
                    <input
                      type="text"
                      value={startForm.fastagBalance}
                      onChange={(e) => setStartForm((f) => ({ ...f, fastagBalance: e.target.value }))}
                      placeholder="e.g. ₹250 or 250"
                      required
                    />
                  </label>
                  {startError && <p className="banner error">{startError}</p>}
                  {startResult && <p className="banner success">✓ Ride started successfully!</p>}
                  <button type="submit" className="btn primary" disabled={startLoading || !!startResult}>
                    {startLoading ? "Starting…" : startResult ? "Started ✓" : "Start Ride"}
                  </button>
                </form>
              )}
            </section>

            {/* End Ride */}
            <section className="card">
              <h2 className="sdb-card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                </svg>
                End Ride
              </h2>
              <form className="sdb-form" onSubmit={handleEndRide}>
                <label>
                  Booking ID
                  <input
                    type="text"
                    value={endForm.bookingId}
                    onChange={(e) => setEndForm((f) => ({ ...f, bookingId: e.target.value }))}
                    placeholder="e.g. 42"
                    required
                  />
                </label>
                <label>
                  Odometer Reading (km) <span className="required">*</span>
                  <input
                    type="number"
                    step="0.1"
                    value={endForm.odometer}
                    onChange={(e) => setEndForm((f) => ({ ...f, odometer: e.target.value }))}
                    placeholder="e.g. 24350.2"
                    required
                  />
                </label>
                <label>
                  Fuel Level <span className="required">*</span>
                  <select
                    value={endForm.fuelLevel}
                    onChange={(e) => setEndForm((f) => ({ ...f, fuelLevel: e.target.value }))}
                    required
                  >
                    <option value="">Select level</option>
                    <option value="Full">Full</option>
                    <option value="3/4">3/4</option>
                    <option value="1/2">1/2</option>
                    <option value="1/4">1/4</option>
                    <option value="Empty">Empty</option>
                  </select>
                </label>
                <label>
                  Fastag Balance <span className="required">*</span>
                  <input
                    type="text"
                    value={endForm.fastagBalance}
                    onChange={(e) => setEndForm((f) => ({ ...f, fastagBalance: e.target.value }))}
                    placeholder="e.g. ₹180 or 180"
                    required
                  />
                </label>
                {endError && <p className="banner error">{endError}</p>}
                {endResult && (
                  <p className="banner success">
                    ✓ {endResult.message || "Ride ended successfully"}
                  </p>
                )}
                <button type="submit" className="btn danger" disabled={endLoading}>
                  {endLoading ? "Ending…" : "End Ride"}
                </button>
              </form>
            </section>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && paymentData && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <div className="payment-modal-header">
              <h2>Complete Payment</h2>
              <button className="close-btn" onClick={() => setShowPaymentModal(false)}>×</button>
            </div>

            <div className="payment-modal-content">
              {paymentData.carDetails && (
                <div className="car-details-section">
                  <h3>Car Details</h3>
                  <div className="car-info-grid">
                    <div className="car-info-item">
                      <span className="label">Model:</span>
                      <span className="value">{paymentData.carDetails.model}</span>
                    </div>
                    <div className="car-info-item">
                      <span className="label">License Plate:</span>
                      <span className="value">{paymentData.carDetails.licensePlate}</span>
                    </div>
                    <div className="car-info-item">
                      <span className="label">Color:</span>
                      <span className="value">{paymentData.carDetails.colour || "—"}</span>
                    </div>
                    <div className="car-info-item">
                      <span className="label">Fuel Type:</span>
                      <span className="value">{paymentData.carDetails.fuelType}</span>
                    </div>
                  </div>
                </div>
              )}

              {paymentData.bookingDetails && (
                <div className="booking-details-section">
                  <h3>Booking Summary</h3>
                  <div className="booking-info-grid">
                    <div className="booking-info-item">
                      <span className="label">Customer:</span>
                      <span className="value">{paymentData.bookingDetails.customerName}</span>
                    </div>
                    <div className="booking-info-item">
                      <span className="label">Booking ID:</span>
                      <span className="value">#{paymentData.bookingId}</span>
                    </div>
                    <div className="booking-info-item">
                      <span className="label">Rental Period:</span>
                      <span className="value">
                        {formatDt(paymentData.bookingDetails.pickupDate)} - {formatDt(paymentData.bookingDetails.dropoffDate)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="payment-amount-section">
                <h3>Payment Details</h3>
                <div className="amount-breakdown">
                  <div className="breakdown-row">
                    <span>💰 Total Amount:</span>
                    <span className="total">{formatCurrency(paymentData.bookingDetails?.total_amount || 0)}</span>
                  </div>
                  <div className="breakdown-row">
                    <span>✅ Advance Paid:</span>
                    <span className="success">{formatCurrency(paymentData.bookingDetails?.advance_paid || 0)}</span>
                  </div>
                  <div className="breakdown-row total">
                    <span>⏳ Remaining Amount:</span>
                    <span className="warning large">{formatCurrency(paymentData.remainingAmount)}</span>
                  </div>
                </div>
              </div>

              {paymentError && (
                <div className="payment-error">
                  <p>{paymentError}</p>
                </div>
              )}

              <button
                className="btn primary collect-payment-btn"
                onClick={handleCollectPayment}
                disabled={paymentLoading}
              >
                {paymentLoading ? "Processing..." : `Collect Payment of ${formatCurrency(paymentData.remainingAmount)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}