import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getStaffTasks, verifyCarKey, startRide, endRide, collectRemainingPayment, getBookingDetails, getCarGpsLocation } from "../api.js";
import { toastSuccess, toastError } from "../hooks/useToast.js";
import { Search, Clock, TrendingUp, CheckCircle, Users, Calendar, CreditCard, Smartphone, Banknote, ChevronDown, ChevronUp, MapPin, Navigation, AlertCircle, RefreshCw } from 'lucide-react';
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
  if (hours > 0) return `${hours}h ${minutes}m`;
  else if (minutes > 0) return `${minutes}m ${seconds}s`;
  else return `${seconds}s`;
}

function calculateDuration(pickupDate, dropoffDate) {
  if (!pickupDate || !dropoffDate) return "—";
  const start = new Date(pickupDate);
  const end = new Date(dropoffDate);
  const diffMs = end - start;
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours >= 24) {
    const days = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;
    if (remainingHours > 0) return `${days}d ${Math.round(remainingHours)}h`;
    return `${days}d`;
  }
  return `${Math.round(diffHours)}h`;
}

// Track Button Component
function TrackButton({ carId, carModel, carPlate, onTrack, size = "normal" }) {
  if (!carId) return null;
  const isSmall = size === "small";
  return (
    <button
      onClick={() => onTrack(carId, carModel, carPlate)}
      title={`Track ${carModel} live`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isSmall ? 3 : 5,
        padding: isSmall ? "4px 9px" : "6px 12px",
        background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
        color: "#fff",
        border: "none",
        borderRadius: isSmall ? "5px" : "7px",
        cursor: "pointer",
        fontSize: isSmall ? "11px" : "12px",
        fontWeight: 600,
        letterSpacing: "0.02em",
        boxShadow: "0 2px 8px rgba(59,130,246,0.35)",
        transition: "transform 0.15s, box-shadow 0.15s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(59,130,246,0.5)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(59,130,246,0.35)"; }}
    >
      <MapPin size={isSmall ? 12 : 14} />
      Track Live
    </button>
  );
}

export default function StaffDashboard() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState(null);

  // Tracking tab state
  const [trackingCar, setTrackingCar] = useState(null);
  const [trackingLocation, setTrackingLocation] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);
  const [trackingLastUpdate, setTrackingLastUpdate] = useState(null);
  const trackingIntervalRef = useRef(null);

  const [verifyForm, setVerifyForm] = useState({ bookingId: "", key: "" });
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const [startForm, setStartForm] = useState({ odometer: "", fuelLevel: "", fastagBalance: "" });
  const [startResult, setStartResult] = useState(null);
  const [startError, setStartError] = useState(null);
  const [startLoading, setStartLoading] = useState(false);

  const [endForm, setEndForm] = useState({ bookingId: "", odometer: "", fuelLevel: "", fastagBalance: "" });
  const [endResult, setEndResult] = useState(null);
  const [endError, setEndError] = useState(null);
  const [endLoading, setEndLoading] = useState(false);

  const [paymentData, setPaymentData] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [showOfflinePaymentModal, setShowOfflinePaymentModal] = useState(false);
  const [offlinePaymentData, setOfflinePaymentData] = useState(null);
  const [offlinePaymentForm, setOfflinePaymentForm] = useState({ paymentMethod: "cash", transactionId: "", remarks: "" });

  const [bookingFilter, setBookingFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedUsers, setExpandedUsers] = useState({});
  const [elapsedTimes, setElapsedTimes] = useState({});
  const [printingReceipt, setPrintingReceipt] = useState(false);

  const loadTasks = useCallback(async () => {
  setTasksLoading(true);
  setTasksError(null);
  setElapsedTimes({});
  try {
    const today = new Date().toISOString().slice(0, 10);
    const rows = await getStaffTasks(today);
    console.log("Raw staff tasks:", rows);
    
    let tasksData = Array.isArray(rows) ? rows : [];
    
    if (tasksData.length > 0) {
      console.log("Fetching booking details for pricing information...");
      const enrichedTasks = await Promise.all(
        tasksData.map(async (task) => {
          try {
            const bookingDetails = await getBookingDetails(task.booking_id);
            console.log(`Booking ${task.booking_id} details:`, bookingDetails);
            
            // Extract car_id from multiple possible sources
            let carId = null;
            if (bookingDetails.car_id) {
              carId = bookingDetails.car_id;
            } else if (bookingDetails.carId) {
              carId = bookingDetails.carId;
            } else if (task.car_id) {
              carId = task.car_id;
            } else if (task.carId) {
              carId = task.carId;
            }
            
            // If still no car_id, check if there's a car object
            if (!carId && bookingDetails.car) {
              carId = bookingDetails.car.id || bookingDetails.car.car_id;
            }
            
            console.log(`Extracted car_id for booking ${task.booking_id}:`, carId);
            
            return {
              ...task,
              totalPrice: bookingDetails.totalPrice || bookingDetails.total_price || 0,
              advance_paid: bookingDetails.advance_paid || bookingDetails.advancePaid || 0,
              remaining_amount: bookingDetails.remaining_amount || (bookingDetails.totalPrice - bookingDetails.advance_paid) || 0,
              pickupDate: bookingDetails.pickupDate || task.pickupDate,
              dropoffDate: bookingDetails.dropoffDate || task.dropoffDate,
              customer_name: bookingDetails.customer_name || task.customer_name,
              customer_phone: bookingDetails.customer_phone || task.customer_phone,
              customer_email: bookingDetails.customer_email || task.customer_email,
              car_model: bookingDetails.car_model || task.car_model,
              car_plate: bookingDetails.car_plate || task.car_plate,
              car_brand: bookingDetails.car_brand || task.car_brand,
              car_id: carId, // Use the extracted car_id
              duration: calculateDuration(bookingDetails.pickupDate || task.pickupDate, bookingDetails.dropoffDate || task.dropoffDate),
              rentalType: bookingDetails.rentalType || task.rentalType || "daily"
            };
          } catch (err) {
            console.warn(`Failed to fetch booking details for ${task.booking_id}:`, err.message);
            return {
              ...task,
              totalPrice: task.totalPrice || task.total_amount || 0,
              advance_paid: task.advance_paid || 0,
              remaining_amount: task.remaining_amount || 0,
              duration: calculateDuration(task.pickupDate, task.dropoffDate),
            };
          }
        })
      );
      tasksData = enrichedTasks;
    }
    
    console.log("Final tasks data with car_id:", tasksData.map(t => ({ 
      booking_id: t.booking_id, 
      car_id: t.car_id, 
      car_model: t.car_model 
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

  // Function to fetch location for tracking car
  const fetchTrackingLocation = async (carId, isRefresh = false) => {
    if (!carId) return;
    if (!isRefresh) setTrackingLoading(true);
    setTrackingError(null);
    
    try {
      const response = await getCarGpsLocation(carId);
      console.log("Tracking location response:", response);
      
      let location = null;
      if (response.success && response.location) {
        location = response.location;
      } else if (response.latitude !== undefined && response.longitude !== undefined) {
        location = { latitude: response.latitude, longitude: response.longitude, ...response };
      } else {
        location = response?.location || null;
      }
      
      if (location && location.latitude != null && location.longitude != null) {
        setTrackingLocation(location);
        setTrackingError(null);
        setTrackingLastUpdate(new Date());
        return true;
      } else {
        setTrackingError(response?.message || "Location not available for this vehicle");
        return false;
      }
    } catch (err) {
      console.error("Location fetch error:", err);
      setTrackingError(err?.message || "Failed to fetch GPS location");
      return false;
    } finally {
      if (!isRefresh) setTrackingLoading(false);
    }
  };

  // Start auto-refresh when tracking car changes
  useEffect(() => {
    if (trackingCar && trackingCar.id && activeTab === "tracking") {
      fetchTrackingLocation(trackingCar.id);
      
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
      trackingIntervalRef.current = setInterval(() => {
        if (trackingCar && trackingCar.id) {
          fetchTrackingLocation(trackingCar.id, true);
        }
      }, 10000);
      
      return () => {
        if (trackingIntervalRef.current) {
          clearInterval(trackingIntervalRef.current);
          trackingIntervalRef.current = null;
        }
      };
    } else {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
      }
    }
  }, [trackingCar, activeTab]);

  const pendingPickup = tasks.filter((t) => !t.ride_start_time);
  const activeRides = tasks.filter((t) => t.ride_start_time && !t.ride_end_time);
  const completedRides = tasks.filter((t) => t.ride_end_time);

  const getTotalAmount = (task) => Number(task.totalPrice) || Number(task.total_price) || Number(task.totalamount) || 0;
  const getAdvancePaid = (task) => Number(task.advance_paid) || Number(task.advancePaid) || 0;
  const getRemainingAmount = (task) => getTotalAmount(task) - getAdvancePaid(task);

  const handleTrackCar = (carId, carModel, carPlate) => {
    setTrackingLocation(null);
    setTrackingError(null);
    setTrackingCar({ id: carId, model: carModel, license_plate: carPlate });
    setActiveTab("tracking");
  };

  const groupedByCustomer = useMemo(() => {
    const grouped = {};
    tasks.forEach(task => {
      const customerKey = task.customer_name || task.customer_phone || `Customer_${task.user_id}`;
      if (!grouped[customerKey]) {
        grouped[customerKey] = {
          customerName: task.customer_name || "Unknown Customer",
          customerPhone: task.customer_phone || "—",
          customerEmail: task.customer_email || "—",
          userId: task.user_id,
          bookings: [],
          totalAmount: 0,
          totalAdvancePaid: 0,
          totalRemaining: 0
        };
      }
      const totalAmount = getTotalAmount(task);
      const advancePaid = getAdvancePaid(task);
      const remaining = getRemainingAmount(task);
      grouped[customerKey].bookings.push({
        ...task,
        totalAmount,
        advancePaid,
        remaining,
        carDisplay: `${task.car_brand || ""} ${task.car_model || ""}`.trim() || task.car_model || "Unknown Car"
      });
      grouped[customerKey].totalAmount += totalAmount;
      grouped[customerKey].totalAdvancePaid += advancePaid;
      grouped[customerKey].totalRemaining += Math.max(0, remaining);
    });
    return Object.values(grouped);
  }, [tasks]);

  const individualStats = useMemo(() => {
    return groupedByCustomer.map(customer => ({
      name: customer.customerName,
      phone: customer.customerPhone,
      totalAmount: customer.totalAmount,
      advancePaid: customer.totalAdvancePaid,
      remaining: customer.totalRemaining,
      bookingCount: customer.bookings.length
    }));
  }, [groupedByCustomer]);

  const toggleUserExpand = (customerName) => {
    setExpandedUsers(prev => ({ ...prev, [customerName]: !prev[customerName] }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newElapsed = {};
      activeRides.forEach((ride) => {
        if (ride.ride_start_time) newElapsed[ride.booking_id] = formatElapsed(ride.ride_start_time);
      });
      setElapsedTimes(newElapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeRides]);

  async function handleVerify(e) {
    e.preventDefault();
    setVerifyError(null); setVerifyResult(null); setStartResult(null); setVerifyLoading(true);
    try {
      const booking = tasks.find(t => t.booking_id === parseInt(verifyForm.bookingId));
      if (!booking) throw new Error("Booking not found in tasks");
      const customerUserId = booking.userId || booking.user_id;
      if (!customerUserId) throw new Error("Customer user ID not found for this booking");
      const res = await verifyCarKey(verifyForm.bookingId, verifyForm.key, customerUserId);
      setVerifyResult(res);
    } catch (err) {
      setVerifyError(err.message || "Verification failed");
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleStartRide(e) {
    e.preventDefault();
    if (!verifyResult?.bookingToken) { setStartError("Please verify customer key first"); return; }
    const fastagBalanceNum = parseFloat(startForm.fastagBalance?.toString().replace(/[₹,]/g, '') || '0');
    if (isNaN(fastagBalanceNum) || fastagBalanceNum < 0) { setStartError("Fastag balance must be 0 or positive number"); return; }
    const odometerNum = Number(startForm.odometer) || 0;
    if (odometerNum <= 0) { setStartError("Odometer reading must be greater than 0"); return; }
    if (!startForm.fuelLevel) { setStartError("Please select fuel level"); return; }
    setStartError(null); setStartResult(null); setStartLoading(true);
    try {
      const res = await startRide({ odometer: odometerNum, fuelLevel: startForm.fuelLevel, fastagBalance: fastagBalanceNum, bookingToken: verifyResult.bookingToken });
      setStartResult(res);
      toastSuccess("Ride started successfully!");
      loadTasks();
      setVerifyResult(null);
      setVerifyForm({ bookingId: "", key: "" });
      setStartForm({ odometer: "", fuelLevel: "", fastagBalance: "" });
    } catch (err) {
      setStartError(err.message || "Failed to start ride");
      toastError(err.message || "Failed to start ride");
    } finally {
      setStartLoading(false);
    }
  }

  async function handleEndRide(e) {
    e.preventDefault();
    setEndError(null); setEndResult(null); setEndLoading(true);
    try {
      const odometerNum = Number(endForm.odometer) || 0;
      if (odometerNum <= 0) { setEndError("Odometer reading must be greater than 0"); setEndLoading(false); return; }
      const fastagBalanceNum = parseFloat(endForm.fastagBalance?.toString().replace(/[₹,]/g, '') || '0');
      if (isNaN(fastagBalanceNum) || fastagBalanceNum < 0) { setEndError("Fastag balance must be 0 or positive number"); setEndLoading(false); return; }
      if (!endForm.fuelLevel) { setEndError("Please select fuel level"); setEndLoading(false); return; }
      let rideEndAmount = 0;
      try {
        const bookingDetails = await getBookingDetails(endForm.bookingId);
        const totalAmount = Number(bookingDetails?.totalPrice || bookingDetails?.total_price || 0);
        const advancePaid = Number(bookingDetails?.advance_paid || 0);
        rideEndAmount = Math.max(0, totalAmount - advancePaid);
      } catch (err) {
        rideEndAmount = Number(endForm.ride_end_amount) || 0;
      }
      const res = await endRide(endForm.bookingId, { odometer: odometerNum, fuelLevel: endForm.fuelLevel, fastagBalance: fastagBalanceNum, ride_end_amount: rideEndAmount });
      setEndResult(res);
      const rideData = res.data || res;
      const pendingAmt = Number(rideData.remaining_amount ?? rideData.remainingAmount ?? 0);
      const totalAmt = Number(rideData.totalPrice ?? rideData.total_price ?? rideData.totalprice ?? 0);
      const advancePaidAmt = Number(rideData.advance_paid ?? rideData.advancePaid ?? 0);
      if (pendingAmt > 0) {
        toastError(`Pending Amount: ₹${pendingAmt.toLocaleString('en-IN')}`, { duration: 6000 });
        setOfflinePaymentData({ bookingId: endForm.bookingId, remainingAmount: pendingAmt, totalAmount: totalAmt, advancePaid: advancePaidAmt, bookingDetails: { total_amount: totalAmt, advance_paid: advancePaidAmt }, carDetails: res.carDetails || null, rideData });
        setShowOfflinePaymentModal(true);
      } else {
        toastSuccess(res.message || "Ride ended successfully!");
        loadTasks();
        setEndForm({ bookingId: "", odometer: "", fuelLevel: "", fastagBalance: "" });
      }
    } catch (err) {
      setEndError(err.message || "Could not end ride");
      toastError(err.message || "Could not end ride");
    } finally {
      setEndLoading(false);
    }
  }

  async function handleOfflinePayment(e) {
    e.preventDefault();
    setPaymentLoading(true); setPaymentError(null);
    try {
      const paymentDataObj = { bookingId: offlinePaymentData.bookingId, amount: offlinePaymentData.remainingAmount, paymentMethod: offlinePaymentForm.paymentMethod, paymentType: "offline", transactionId: offlinePaymentForm.transactionId || `OFFLINE_${Date.now()}`, remarks: offlinePaymentForm.remarks, collectedBy: user?.name || user?.email || "Staff", collectedAt: new Date().toISOString() };
      const response = await collectRemainingPayment(paymentDataObj);
      if (response.success) {
        toastSuccess(`₹${formatCurrency(offlinePaymentData.remainingAmount)} collected via ${offlinePaymentForm.paymentMethod === 'cash' ? 'Cash' : 'UPI'}!`);
        await printReceipt({ ...offlinePaymentData, paymentMethod: offlinePaymentForm.paymentMethod, transactionId: paymentDataObj.transactionId });
        setShowOfflinePaymentModal(false);
        setOfflinePaymentForm({ paymentMethod: "cash", transactionId: "", remarks: "" });
        setOfflinePaymentData(null);
        loadTasks();
        setEndForm({ bookingId: "", odometer: "", fuelLevel: "", fastagBalance: "" });
      } else {
        setPaymentError(response.message || "Payment recording failed");
        toastError(response.message || "Payment recording failed");
      }
    } catch (err) {
      setPaymentError(err.message || "Could not record payment");
    } finally {
      setPaymentLoading(false);
    }
  }

  async function printReceipt(paymentInfo) {
    setPrintingReceipt(true);
    try {
      const booking = tasks.find(t => t.booking_id === parseInt(paymentInfo.bookingId));
      if (booking) {
        await printBookingReceipt({ 
          bookingId: paymentInfo.bookingId, 
          customerName: booking.customer_name, 
          customerPhone: booking.customer_phone, 
          carModel: booking.car_model, 
          carPlate: booking.car_plate, 
          totalAmount: getTotalAmount(booking), 
          advancePaid: getAdvancePaid(booking), 
          remainingAmount: paymentInfo.remainingAmount, 
          paidAmount: paymentInfo.remainingAmount, 
          paymentMethod: paymentInfo.paymentMethod === 'cash' ? 'Cash' : 'UPI', 
          transactionId: paymentInfo.transactionId, 
          paymentDate: new Date().toLocaleString(), 
          collectedBy: user?.name || "Staff", 
          duration: booking.duration 
        });
      }
    } catch (err) {
      alert("Payment recorded but receipt printing failed. You can view receipt in booking history.");
    } finally {
      setPrintingReceipt(false);
    }
  }

  function openRazorpay(order, bookingId, onVerified) {
    if (!window.Razorpay) { setPaymentError("Razorpay script not loaded. Refresh the page."); setPaymentLoading(false); return; }
    if (!RZP_KEY) { setPaymentError("Payment configuration missing"); setPaymentLoading(false); return; }
    const options = {
      key: RZP_KEY, 
      amount: order.amount, 
      currency: order.currency || "INR", 
      name: "Car24",
      description: `Final Payment - Booking #${bookingId}`, 
      order_id: order.id,
      handler(response) { onVerified(response); },
      prefill: { email: paymentData?.bookingDetails?.customerEmail || "", contact: paymentData?.bookingDetails?.customerPhone || "" },
      theme: { color: "#14b8a6" },
      modal: { ondismiss: () => { setPaymentLoading(false); } }
    };
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (res) => { setPaymentError(res?.error?.description || "Payment failed"); setPaymentLoading(false); });
    rzp.open();
  }

  async function handleCollectOnlinePayment() {
    setPaymentLoading(true); setPaymentError(null);
    try {
      const res = await collectRemainingPayment({ bookingId: paymentData.bookingId, amount: paymentData.remainingAmount });
      if (res.order == null || res.amount === 0) { setShowPaymentModal(false); loadTasks(); setPaymentLoading(false); return; }
      openRazorpay(res.order, paymentData.bookingId, async (response) => {
        try {
          const verifyRes = await collectRemainingPayment({ bookingId: paymentData.bookingId, amount: paymentData.remainingAmount, razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature });
          if (verifyRes.success) { toastSuccess("Payment collected successfully!"); setShowPaymentModal(false); loadTasks(); }
          else { setPaymentError("Payment verification failed"); toastError("Payment verification failed"); }
        } catch (ve) { setPaymentError(ve.message || "Payment verification failed"); }
        finally { setPaymentLoading(false); }
      });
    } catch (err) { setPaymentError(err.message || "Could not initiate payment"); setPaymentLoading(false); }
  }

  function prefillEndRide(bookingId, bookingData) {
    setEndForm((f) => ({ ...f, bookingId: String(bookingId) }));
    setActiveTab("verify");
    setVerifyResult({ ...verifyResult, bookingDetails: bookingData });
  }

  function prefillVerify(bookingId) {
    setVerifyForm((f) => ({ ...f, bookingId: String(bookingId) }));
    setActiveTab("verify");
  }

  return (
    <div className="sdb-root">
      {/* Header */}
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

      {/* Tabs */}
      <div className="sdb-tabs">
        <button className={`sdb-tab${activeTab === "overview" ? " active" : ""}`} onClick={() => setActiveTab("overview")}>Overview</button>
        <button className={`sdb-tab${activeTab === "customers" ? " active" : ""}`} onClick={() => setActiveTab("customers")}>Customers <span className="sdb-tab-badge">{groupedByCustomer.length}</span></button>
        <button className={`sdb-tab${activeTab === "bookings" ? " active" : ""}`} onClick={() => setActiveTab("bookings")}>Bookings <span className="sdb-tab-badge">{tasks.length}</span></button>
        <button className={`sdb-tab${activeTab === "tasks" ? " active" : ""}`} onClick={() => setActiveTab("tasks")}>Tasks {(pendingPickup.length + activeRides.length) > 0 && <span className="sdb-tab-badge">{pendingPickup.length + activeRides.length}</span>}</button>
        <button className={`sdb-tab${activeTab === "tracking" ? " active" : ""}`} onClick={() => setActiveTab("tracking")}>Live Tracking {activeRides.length > 0 && <span className="sdb-tab-badge">{activeRides.length}</span>}</button>
        <button className={`sdb-tab${activeTab === "verify" ? " active" : ""}`} onClick={() => setActiveTab("verify")}>Key Verify & Ride Control</button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="sdb-panel">
          <div className="sdb-stats-grid">
            <div className="sdb-stat-card">
              <div className="sdb-stat-icon" style={{ background: "#fbbf2420", color: "#fbbf24" }}><Users size={24} /></div>
              <div className="sdb-stat-content"><span className="sdb-stat-value">{groupedByCustomer.length}</span><span className="sdb-stat-label">Total Customers</span></div>
            </div>
            <div className="sdb-stat-card">
              <div className="sdb-stat-icon" style={{ background: "#14b8a620", color: "#14b8a6" }}><Clock size={24} /></div>
              <div className="sdb-stat-content"><span className="sdb-stat-value">{pendingPickup.length}</span><span className="sdb-stat-label">Pending Pickup</span></div>
            </div>
            <div className="sdb-stat-card">
              <div className="sdb-stat-icon" style={{ background: "#3b82f620", color: "#3b82f6" }}><TrendingUp size={24} /></div>
              <div className="sdb-stat-content"><span className="sdb-stat-value">{activeRides.length}</span><span className="sdb-stat-label">Active Rides</span></div>
            </div>
            <div className="sdb-stat-card">
              <div className="sdb-stat-icon" style={{ background: "#10b98120", color: "#10b981" }}><CheckCircle size={24} /></div>
              <div className="sdb-stat-content"><span className="sdb-stat-value">{completedRides.length}</span><span className="sdb-stat-label">Completed Rides</span></div>
            </div>
          </div>

          <div className="sdb-section">
            <h2 className="sdb-section-title">Customer Payment Summary</h2>
            <div className="customer-summary-grid">
              {individualStats.map((customer, idx) => (
                <div key={idx} className="customer-summary-card">
                  <div className="customer-header">
                    <div className="customer-avatar">{customer.name?.charAt(0)?.toUpperCase() || "C"}</div>
                    <div className="customer-info">
                      <h4>{customer.name}</h4>
                      <p className="customer-phone">{customer.phone}</p>
                      <span className="booking-count">{customer.bookingCount} booking(s)</span>
                    </div>
                  </div>
                  <div className="customer-payment-details">
                    <div className="payment-row"><span>💰 Total Amount:</span><strong>{formatCurrency(customer.totalAmount)}</strong></div>
                    <div className="payment-row paid"><span>✅ Advance Paid:</span><strong className="text-success">{formatCurrency(customer.advancePaid)}</strong></div>
                    <div className="payment-row"><span>⏳ Remaining:</span><strong className={customer.remaining > 0 ? "text-warning" : "text-success"}>{formatCurrency(customer.remaining)}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === "customers" && (
        <div className="sdb-panel">
          <div className="sdb-section-header">
            <h2 className="sdb-section-title">Customer-wise Bookings</h2>
            <div className="sdb-search-bar" style={{ marginBottom: 0, width: "300px" }}>
              <Search size={18} />
              <input type="text" placeholder="Search customer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          {tasksLoading ? (
            <div className="sdb-loading">Loading customers...</div>
          ) : groupedByCustomer.length === 0 ? (
            <div className="sdb-empty-state"><Users size={48} /><p>No customers found</p></div>
          ) : (
            <div className="customer-accordion">
              {groupedByCustomer.filter(c => c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || c.customerPhone.includes(searchTerm)).map((customer) => (
                <div key={customer.customerName} className="customer-accordion-item">
                  <div className="customer-accordion-header" onClick={() => toggleUserExpand(customer.customerName)}>
                    <div className="customer-info-summary">
                      <div className="customer-avatar-large">{customer.customerName?.charAt(0)?.toUpperCase() || "C"}</div>
                      <div className="customer-details-summary">
                        <h3>{customer.customerName}</h3>
                        <div className="customer-contact">
                          <span>📞 {customer.customerPhone}</span>
                          <span>✉️ {customer.customerEmail}</span>
                        </div>
                      </div>
                    </div>
                    <div className="customer-stats-summary">
                      <div className="stat-badge"><span className="stat-label">Total</span><span className="stat-value">{formatCurrency(customer.totalAmount)}</span></div>
                      <div className="stat-badge paid"><span className="stat-label">Paid</span><span className="stat-value">{formatCurrency(customer.totalAdvancePaid)}</span></div>
                      <div className={`stat-badge ${customer.totalRemaining > 0 ? 'pending' : 'completed'}`}><span className="stat-label">Remaining</span><span className="stat-value">{formatCurrency(customer.totalRemaining)}</span></div>
                      {expandedUsers[customer.customerName] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                  {expandedUsers[customer.customerName] && (
                    <div className="customer-accordion-content">
                      <div className="bookings-list">
                        <table className="bookings-detail-table">
                          <thead>
                            <tr><th>Booking ID</th><th>Car</th><th>Plate</th><th>Duration</th><th>Pickup</th><th>Dropoff</th><th>Total</th><th>Paid</th><th>Remaining</th><th>Status</th><th>Actions</th></tr>
                          </thead>
                          <tbody>
                            {customer.bookings.map((booking) => {
                              const status = !booking.ride_start_time ? "pending" : booking.ride_start_time && !booking.ride_end_time ? "active" : "completed";
                              return (
                                <tr key={booking.booking_id}>
                                  <td>#{booking.booking_id}</td>
                                  <td>{booking.carDisplay}</td>
                                  <td>{booking.car_plate || "—"}</td>
                                  <td>{booking.duration || "—"}</td>
                                  <td>{formatDt(booking.pickupDate)}</td>
                                  <td>{formatDt(booking.dropoffDate)}</td>
                                  <td className="amount">{formatCurrency(booking.totalAmount)}</td>
                                  <td className="amount paid">{formatCurrency(booking.advancePaid)}</td>
                                  <td className={`amount ${booking.remaining > 0 ? 'warning' : 'success'}`}>{formatCurrency(booking.remaining)}</td>
                                  <td><span className={`status-badge status-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
                                  <td className="actions-cell">
                                    <TrackButton carId={booking.car_id} carModel={booking.carDisplay} carPlate={booking.car_plate} onTrack={handleTrackCar} size="small" />
                                    {status === "pending" && <button className="btn-small primary" onClick={() => prefillVerify(booking.booking_id)}>Verify</button>}
                                    {status === "active" && <button className="btn-small danger" onClick={() => prefillEndRide(booking.booking_id, booking)}>End Ride</button>}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="total-row">
                              <td colSpan="6"><strong>Total Summary</strong></td>
                              <td className="amount"><strong>{formatCurrency(customer.totalAmount)}</strong></td>
                              <td className="amount paid"><strong>{formatCurrency(customer.totalAdvancePaid)}</strong></td>
                              <td className={`amount ${customer.totalRemaining > 0 ? 'warning' : 'success'}`}><strong>{formatCurrency(customer.totalRemaining)}</strong></td>
                              <td colSpan="2"></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === "bookings" && (
        <div className="sdb-panel">
          <div className="sdb-section-header">
            <h2 className="sdb-section-title">All Bookings</h2>
            <div className="sdb-filters">
              <select value={bookingFilter} onChange={(e) => setBookingFilter(e.target.value)} className="sdb-filter-select">
                <option value="all">All Bookings</option><option value="pending">Pending Pickup</option>
                <option value="active">Active Rides</option><option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="sdb-search-bar">
            <Search size={18} />
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          {tasksLoading ? <div className="sdb-loading">Loading bookings...</div> : tasks.length === 0 ? <div className="sdb-empty-state"><Calendar size={48} /><p>No bookings found</p></div> : (
            <div className="sdb-bookings-table">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Customer</th><th>Car</th><th>Duration</th><th>Pickup</th><th>Total</th><th>Paid</th><th>Remaining</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {tasks.filter(task => {
                    const mf = bookingFilter === "all" || (bookingFilter === "pending" && !task.ride_start_time) || (bookingFilter === "active" && task.ride_start_time && !task.ride_end_time) || (bookingFilter === "completed" && task.ride_end_time);
                    const ms = !searchTerm || task.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || task.car_model?.toLowerCase().includes(searchTerm.toLowerCase()) || task.car_plate?.toLowerCase().includes(searchTerm.toLowerCase()) || task.booking_id?.toString().includes(searchTerm);
                    return mf && ms;
                  }).map(task => {
                    const status = !task.ride_start_time ? "pending" : task.ride_start_time && !task.ride_end_time ? "active" : "completed";
                    return (
                      <tr key={task.booking_id}>
                        <td>#{task.booking_id}</td>
                        <td><strong>{task.customer_name}</strong><small>{task.customer_phone || "—"}</small></td>
                        <td>{task.car_model}<small>{task.car_plate}</small></td>
                        <td>{task.duration || calculateDuration(task.pickupDate, task.dropoffDate)}</td>
                        <td>{formatDt(task.pickupDate)}</td>
                        <td className="amount">{formatCurrency(getTotalAmount(task))}</td>
                        <td className="amount paid">{formatCurrency(getAdvancePaid(task))}</td>
                        <td className={`amount ${getRemainingAmount(task) > 0 ? 'warning' : 'success'}`}>{formatCurrency(getRemainingAmount(task))}</td>
                        <td><span className={`sdb-status-badge sdb-status-badge-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
                        <td className="sdb-actions">
                          <TrackButton carId={task.car_id} carModel={task.car_model} carPlate={task.car_plate} onTrack={handleTrackCar} size="small" />
                          <button className="sdb-btn-small primary" onClick={() => prefillVerify(task.booking_id)}>Verify</button>
                          {status === "active" && <button className="sdb-btn-small danger" onClick={() => prefillEndRide(task.booking_id, task)}>End Ride</button>}
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

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <div className="sdb-panel">
          {tasksError && <p className="banner error">{tasksError}</p>}
          {tasksLoading && <div className="sdb-skeleton-list">{[1,2,3].map(i => <div key={i} className="sdb-skeleton-row" />)}</div>}
          {!tasksLoading && (
            <>
              <div className="sdb-section">
                <h2 className="sdb-section-title">Pending Pickup ({pendingPickup.length})</h2>
                {pendingPickup.length === 0 ? <p className="muted sdb-empty">No rides waiting for pickup.</p> : (
                  <div className="sdb-task-list">
                    {pendingPickup.map(t => (
                      <div key={t.booking_id} className="sdb-task-card">
                        <div className="sdb-task-top"><div><p className="sdb-task-car">{t.car_model}</p><p className="sdb-task-plate">{t.car_plate}</p></div><span className="sdb-status-pill sdb-status-pill--pending">Pending</span></div>
                        <div className="sdb-task-meta"><span>👤 {t.customer_name}</span><span>🕐 {formatDt(t.pickupDate)}</span><span>Booking #{t.booking_id}</span></div>
                        <div className="sdb-payment-info"><div className="payment-detail"><span>💰 Total:</span><strong>{formatCurrency(getTotalAmount(t))}</strong></div><div className="payment-detail"><span>✅ Paid:</span><strong>{formatCurrency(getAdvancePaid(t))}</strong></div><div className="payment-detail highlight"><span>⏳ Remaining:</span><strong>{formatCurrency(getRemainingAmount(t))}</strong></div></div>
                        <div className="sdb-task-actions"><TrackButton carId={t.car_id} carModel={t.car_model} carPlate={t.car_plate} onTrack={handleTrackCar} /><button className="btn small primary" onClick={() => prefillVerify(t.booking_id)}>Verify & Start</button></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="sdb-section">
                <h2 className="sdb-section-title">Active Rides ({activeRides.length})</h2>
                {activeRides.length === 0 ? <p className="muted sdb-empty">No active rides.</p> : (
                  <div className="sdb-task-list">
                    {activeRides.map(t => (
                      <div key={t.booking_id} className="sdb-task-card sdb-task-card--active">
                        <div className="sdb-task-top"><div><p className="sdb-task-car">{t.car_model}</p><p className="sdb-task-plate">{t.car_plate}</p></div><div><TrackButton carId={t.car_id} carModel={t.car_model} carPlate={t.car_plate} onTrack={handleTrackCar} /><span className="sdb-status-pill sdb-status-pill--active">Ongoing</span></div></div>
                        <div className="sdb-task-meta"><span>👤 {t.customer_name}</span><span>▶ {elapsedTimes[t.booking_id] || formatElapsed(t.ride_start_time)}</span><span>Booking #{t.booking_id}</span></div>
                        <div className="sdb-payment-info"><div className="payment-detail"><span>💰 Total:</span><strong>{formatCurrency(getTotalAmount(t))}</strong></div><div className="payment-detail"><span>✅ Paid:</span><strong>{formatCurrency(getAdvancePaid(t))}</strong></div><div className="payment-detail highlight"><span>⏳ Pending:</span><strong>{formatCurrency(getRemainingAmount(t))}</strong></div></div>
                        <div className="sdb-task-actions"><button className="btn small danger" onClick={() => prefillEndRide(t.booking_id, t)}>End Ride</button></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button className="btn ghost sdb-refresh-btn" onClick={loadTasks}>↻ Refresh tasks</button>
            </>
          )}
        </div>
      )}


{activeTab === "tracking" && (
  <div className="sdb-panel" style={{ padding: 0, overflow: "hidden" }}>
    <div style={{ display: "flex", height: "calc(100vh - 220px)", minHeight: 520 }}>
      {/* Vehicle List */}
      <div style={{ width: 320, flexShrink: 0, borderRight: "1px solid #e2e8f0", overflowY: "auto", background: "#f8fafc" }}>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid #e2e8f0", background: "#f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <MapPin size={15} style={{ color: "#3b82f6" }} />
            <span style={{ fontWeight: 700, fontSize: "14px" }}>Active Vehicles</span>
          </div>
          <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>
            {activeRides.length} vehicle(s) currently on the road
          </p>
        </div>
        
        {tasksLoading ? (
          <div style={{ padding: 24, textAlign: "center", color: "#64748b" }}>Loading vehicles...</div>
        ) : (
          <>
            {activeRides.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center" }}>
                <Navigation size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                <p style={{ color: "#64748b", marginBottom: 8 }}>No active rides found</p>
                <p style={{ color: "#94a3b8", fontSize: "12px" }}>Start a ride from the Verify tab to see it here</p>
              </div>
            ) : (
              activeRides.map(task => {
                const isSelected = trackingCar?.id === task.car_id;
                return (
                  <div 
                    key={task.booking_id} 
                    onClick={() => {
                      console.log("Selected car:", task);
                      setTrackingLocation(null);
                      setTrackingError(null);
                      setTrackingCar({ 
                        id: task.car_id, 
                        model: task.car_model, 
                        license_plate: task.car_plate,
                        booking_id: task.booking_id,
                        customer_name: task.customer_name
                      });
                    }}
                    style={{ 
                      padding: "14px 18px", 
                      borderBottom: "1px solid #e2e8f0", 
                      cursor: "pointer", 
                      background: isSelected ? "#eff6ff" : "transparent", 
                      borderLeft: isSelected ? "3px solid #3b82f6" : "3px solid transparent",
                      transition: "background 0.15s"
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#f8fafc"; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: "13px", color: isSelected ? "#2563eb" : "#1e293b" }}>
                          {task.car_model || "Unknown Car"}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
                          {task.car_plate || "No Plate"}
                        </p>
                      </div>
                      <span style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: 4, 
                        fontSize: "10px", 
                        fontWeight: 700, 
                        padding: "3px 8px", 
                        borderRadius: 999, 
                        background: "#22c55e18", 
                        color: "#22c55e", 
                        border: "1px solid #22c55e30" 
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                        Active
                      </span>
                    </div>
                    <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#64748b" }}>
                      👤 {task.customer_name || "—"} | Booking #{task.booking_id}
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#3b82f6" }}>
                      ▶ {elapsedTimes[task.booking_id] || formatElapsed(task.ride_start_time)}
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: "10px", color: "#94a3b8" }}>
                      🚗 Car ID: {task.car_id || "Not assigned"}
                    </p>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
      
      {/* Map Panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0f172a" }}>
        {!trackingCar ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", color: "#64748b" }}>
              <Navigation size={64} style={{ opacity: 0.15, marginBottom: 16 }} />
              <p style={{ marginBottom: 8 }}>Select a vehicle from the list to track</p>
              <p style={{ fontSize: "12px", color: "#475569" }}>Click on any active ride to see its live location</p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Header */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #334155", background: "#1e293b" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "15px", color: "#f1f5f9" }}>{trackingCar.model}</p>
                  <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#64748b" }}>
                    {trackingCar.license_plate || "—"} | Booking #{trackingCar.booking_id}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button 
                    onClick={() => fetchTrackingLocation(trackingCar.id, true)}
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 5, 
                      padding: "6px 12px", 
                      background: "#334155", 
                      color: "#e2e8f0", 
                      border: "none", 
                      borderRadius: "6px", 
                      cursor: "pointer", 
                      fontSize: "12px",
                      fontWeight: 500
                    }}
                  >
                    <RefreshCw size={12} /> Refresh
                  </button>
                </div>
              </div>
            </div>
            
            {/* Map or Loading/Error */}
            <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
              {trackingLoading && !trackingLocation && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", zIndex: 10 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: 40, height: 40, border: "3px solid #3b82f630", borderTop: "3px solid #3b82f6", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
                    <p style={{ color: "#94a3b8" }}>Fetching live location...</p>
                  </div>
                </div>
              )}
              
              {trackingError && !trackingLocation && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", zIndex: 10 }}>
                  <div style={{ textAlign: "center", maxWidth: 300 }}>
                    <AlertCircle size={48} style={{ color: "#ef4444", marginBottom: 16 }} />
                    <p style={{ color: "#f87171", marginBottom: 8, fontWeight: 500 }}>{trackingError}</p>
                    <button 
                      onClick={() => fetchTrackingLocation(trackingCar.id)}
                      style={{ padding: "8px 20px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", marginTop: 12 }}
                    >
                      Try Again
                    </button>
                    <p style={{ color: "#64748b", fontSize: "11px", marginTop: 12 }}>
                      Make sure the vehicle has GPS tracking enabled
                    </p>
                  </div>
                </div>
              )}
              
              {trackingLocation && (
                <iframe 
                  key={`map-${trackingLocation.latitude}-${trackingLocation.longitude}`}
                  title="Vehicle Location" 
                  src={`https://maps.google.com/maps?q=${trackingLocation.latitude},${trackingLocation.longitude}&z=16&output=embed`} 
                  width="100%" 
                  height="100%" 
                  style={{ border: "none" }} 
                  allowFullScreen 
                  loading="lazy" 
                />
              )}
            </div>
            
            {/* Location Info Footer */}
            {trackingLocation && (
              <div style={{ flexShrink: 0, borderTop: "1px solid #334155", background: "#1e293b", padding: "12px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                    <div>
                      <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase" }}>📍 Latitude</span>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#f1f5f9", fontFamily: "monospace" }}>
                        {trackingLocation.latitude?.toFixed(6)}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase" }}>📍 Longitude</span>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#f1f5f9", fontFamily: "monospace" }}>
                        {trackingLocation.longitude?.toFixed(6)}
                      </div>
                    </div>
                    {trackingLocation.speed !== undefined && (
                      <div>
                        <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase" }}>💨 Speed</span>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#22c55e" }}>
                          {trackingLocation.speed} km/h
                        </div>
                      </div>
                    )}
                    {trackingLocation.ignition !== undefined && (
                      <div>
                        <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase" }}>🔑 Ignition</span>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: trackingLocation.ignition ? "#22c55e" : "#94a3b8" }}>
                          {trackingLocation.ignition ? "ON" : "OFF"}
                        </div>
                      </div>
                    )}
                    {trackingLastUpdate && (
                      <div>
                        <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase" }}>🕐 Last Update</span>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>
                          {trackingLastUpdate.toLocaleTimeString()}
                        </div>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps?q=${trackingLocation.latitude},${trackingLocation.longitude}`, "_blank")}
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 6, 
                      padding: "6px 14px", 
                      background: "linear-gradient(135deg, #1d4ed8, #3b82f6)", 
                      color: "#fff", 
                      border: "none", 
                      borderRadius: "8px", 
                      cursor: "pointer", 
                      fontSize: "12px", 
                      fontWeight: 600 
                    }}
                  >
                    <MapPin size={14} />
                    Open in Google Maps
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
)}


      {/* Verify Tab */}
      {activeTab === "verify" && (
        <div className="sdb-panel sdb-verify-panel">
          <div className="sdb-verify-grid">
            <section className="card"><h2 className="sdb-card-title">Verify Customer Key</h2>
              <form className="sdb-form" onSubmit={handleVerify}>
                <label>Booking ID<input type="text" value={verifyForm.bookingId} onChange={(e) => setVerifyForm(f => ({ ...f, bookingId: e.target.value }))} required /></label>
                <label>OTP / Key<input type="text" value={verifyForm.key} onChange={(e) => setVerifyForm(f => ({ ...f, key: e.target.value }))} required /></label>
                {verifyError && <p className="banner error">{verifyError}</p>}
                <button type="submit" className="btn primary" disabled={verifyLoading}>{verifyLoading ? "Verifying…" : "Verify Key"}</button>
              </form>
              {verifyResult && <div className="sdb-verify-result"><p className="banner success">✓ Key verified</p>{verifyResult.userdata && <div><h3>Customer Details</h3><dl><div><dt>Name</dt><dd>{verifyResult.userdata.name}</dd></div><div><dt>Email</dt><dd>{verifyResult.userdata.email}</dd></div></dl></div>}</div>}
            </section>
            <section className="card"><h2 className="sdb-card-title">Start Ride</h2>
              {!verifyResult?.bookingToken ? <p className="muted sdb-hint">Verify a key first</p> : (
                <form className="sdb-form" onSubmit={handleStartRide}>
                  <label>Odometer (km)*<input type="number" step="0.1" value={startForm.odometer} onChange={(e) => setStartForm(f => ({ ...f, odometer: e.target.value }))} required /></label>
                  <label>Fuel Level*<select value={startForm.fuelLevel} onChange={(e) => setStartForm(f => ({ ...f, fuelLevel: e.target.value }))} required><option value="">Select</option><option value="Full">Full</option><option value="3/4">3/4</option><option value="1/2">1/2</option><option value="1/4">1/4</option><option value="Empty">Empty</option></select></label>
                  <label>Fastag Balance*<input type="text" value={startForm.fastagBalance} onChange={(e) => setStartForm(f => ({ ...f, fastagBalance: e.target.value }))} required /></label>
                  {startError && <p className="banner error">{startError}</p>}
                  <button type="submit" className="btn primary" disabled={startLoading}>{startLoading ? "Starting…" : "Start Ride"}</button>
                </form>
              )}
            </section>
            <section className="card"><h2 className="sdb-card-title">End Ride</h2>
              <form className="sdb-form" onSubmit={handleEndRide}>
                <label>Booking ID<input type="text" value={endForm.bookingId} onChange={(e) => setEndForm(f => ({ ...f, bookingId: e.target.value }))} required /></label>
                <label>Odometer (km)*<input type="number" step="0.1" value={endForm.odometer} onChange={(e) => setEndForm(f => ({ ...f, odometer: e.target.value }))} required /></label>
                <label>Fuel Level*<select value={endForm.fuelLevel} onChange={(e) => setEndForm(f => ({ ...f, fuelLevel: e.target.value }))} required><option value="">Select</option><option value="Full">Full</option><option value="3/4">3/4</option><option value="1/2">1/2</option><option value="1/4">1/4</option><option value="Empty">Empty</option></select></label>
                <label>Fastag Balance*<input type="text" value={endForm.fastagBalance} onChange={(e) => setEndForm(f => ({ ...f, fastagBalance: e.target.value }))} required /></label>
                {endError && <p className="banner error">{endError}</p>}
                <button type="submit" className="btn danger" disabled={endLoading}>{endLoading ? "Ending…" : "End Ride"}</button>
              </form>
            </section>
          </div>
        </div>
      )}

      {/* Modals */}
      {showOfflinePaymentModal && offlinePaymentData && (
        <div className="payment-modal-overlay"><div className="payment-modal offline-modal"><div className="payment-modal-header"><h2>Collect Payment</h2><button className="close-btn" onClick={() => setShowOfflinePaymentModal(false)}>×</button></div>
          <div className="payment-modal-content"><div className="offline-badge"><span className="badge offline">Offline Collection</span><p className="info-text">Collect payment from customer</p></div>
            <div className="payment-amount-section"><div className="amount-to-collect"><span className="amount-label">Remaining Amount:</span><span className="amount-value">{formatCurrency(offlinePaymentData.remainingAmount)}</span></div></div>
            <form onSubmit={handleOfflinePayment}><div className="payment-methods"><div className="method-options"><label className={`method-option ${offlinePaymentForm.paymentMethod === 'cash' ? 'selected' : ''}`}><input type="radio" value="cash" checked={offlinePaymentForm.paymentMethod === 'cash'} onChange={(e) => setOfflinePaymentForm({ ...offlinePaymentForm, paymentMethod: e.target.value })} /><Banknote size={20} /><span>Cash</span></label><label className={`method-option ${offlinePaymentForm.paymentMethod === 'upi' ? 'selected' : ''}`}><input type="radio" value="upi" checked={offlinePaymentForm.paymentMethod === 'upi'} onChange={(e) => setOfflinePaymentForm({ ...offlinePaymentForm, paymentMethod: e.target.value })} /><Smartphone size={20} /><span>UPI</span></label></div></div>
              {offlinePaymentForm.paymentMethod === 'upi' && <div className="form-group"><label>Transaction ID</label><input type="text" value={offlinePaymentForm.transactionId} onChange={(e) => setOfflinePaymentForm({ ...offlinePaymentForm, transactionId: e.target.value })} required /></div>}
              {paymentError && <div className="payment-error"><p>{paymentError}</p></div>}
              <div className="modal-footer-buttons"><button type="button" className="btn secondary" onClick={() => setShowOfflinePaymentModal(false)}>Cancel</button><button type="submit" className="btn primary" disabled={paymentLoading}>{paymentLoading ? "Recording..." : "Confirm & Print"}</button></div>
            </form></div></div></div>
      )}
      {showPaymentModal && paymentData && (
        <div className="payment-modal-overlay"><div className="payment-modal"><div className="payment-modal-header"><h2>Complete Payment</h2><button className="close-btn" onClick={() => setShowPaymentModal(false)}>×</button></div>
          <div className="payment-modal-content"><div className="payment-amount-section"><div className="amount-breakdown"><div className="breakdown-row"><span>💰 Total:</span><span>{formatCurrency(paymentData.bookingDetails?.total_amount || 0)}</span></div><div className="breakdown-row"><span>✅ Paid:</span><span>{formatCurrency(paymentData.bookingDetails?.advance_paid || 0)}</span></div><div className="breakdown-row total"><span>⏳ Due:</span><span className="warning large">{formatCurrency(paymentData.remainingAmount)}</span></div></div></div>
            {paymentError && <div className="payment-error"><p>{paymentError}</p></div>}
            <button className="btn primary collect-payment-btn" onClick={handleCollectOnlinePayment} disabled={paymentLoading}>{paymentLoading ? "Processing..." : `Pay ${formatCurrency(paymentData.remainingAmount)} Online`}</button></div></div></div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}