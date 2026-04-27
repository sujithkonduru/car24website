import { useCallback, useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { apiGet, apiPost, apiPut } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  User, Mail, Phone, Calendar, MapPin, CreditCard, Car, Upload,
  FileText, CheckCircle, AlertCircle, X, Plus, Camera, Trash2,
  Edit2, Award, Clock, Shield, Star, TrendingUp, Wallet,
  ChevronRight, Loader2, Globe
} from "lucide-react";
import "./Profile.css";

export default function Profile() {
  const { token, user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [credits, setCredits] = useState(null);
  const [docs, setDocs] = useState(null);
  const [showCarModal, setShowCarModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [documents, setDocuments] = useState({
    license: null,
    aadhar: null
  });
  const [documentLoading, setDocumentLoading] = useState(false);
  const [documentError, setDocumentError] = useState(null);
  const [documentSuccess, setDocumentSuccess] = useState(false);
  const [carForm, setCarForm] = useState({
    branchId: "",
    model: "",
    year: new Date().getFullYear(),
    category: "",
    transmission: "",
    fuelType: "",
    seatingCapacity: 5,
    colour: "",
    licensePlate: "",
    mileage: "",
    features: "",
    mainImage: null,
    images: [],
  });
  const [carLoading, setCarLoading] = useState(false);
  const [carError, setCarError] = useState(null);
  const fileInputRef = useRef(null);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const isFirebaseError = (err) => err.data?.error?.includes('16 UNAUTHENTICATED') || err.message?.includes('16 UNAUTHENTICATED');

    try {
      let profileRes;

      if (role === 'branch_head') {
        try {
          profileRes = await apiGet("/branch/profile", { withAuth: true });

          if (profileRes?.success && profileRes?.data) {
            const data = profileRes.data;
            profileRes = {
              userData: {
                id: data.id,
                name: data.name,
                email: data.email,
                mobileno: data.mobileno,
                role: data.role,
                branch_id: data.branch,
                branch_name: data.branch_details?.name,
                city: data.branch_details?.city,
                state: data.branch_details?.state,
                is_verified: data.is_verified,
                created_at: data.created_at
              }
            };
          } else {
            throw new Error(profileRes?.message || "Failed to load profile");
          }
        } catch (branchError) {
          console.error("Branch profile error:", branchError);
          profileRes = {
            userData: {
              id: user?.id,
              name: user?.name,
              email: user?.email,
              role: user?.role,
              mobileno: user?.mobileno || "—"
            }
          };
        }
      } else {
        try {
          profileRes = await apiGet("/user/getData", { withAuth: true });
        } catch (userError) {
          console.error("User profile error:", userError);
          if (isFirebaseError(userError)) {
            setError("Backend service temporarily unavailable. Using cached profile data.");
          }
          profileRes = {
            userData: {
              id: user?.id,
              name: user?.name,
              email: user?.email,
              role: user?.role,
              mobileno: user?.mobileno || "—"
            }
          };
        }
      }

      let creditsRes = { totalCredits: 0, credits: [] };
      let docsRes = null;
      let branchesRes = [];
      let bookingsRes = [];

      // Load credits
      try {
        creditsRes = await apiGet("/bookingApi/myCredits", { withAuth: true });
        console.log("Credits response:", creditsRes);
      } catch (creditsError) {
        console.error("Credits error:", creditsError);
      }

      // Load documents
      try {
        docsRes = await apiGet("/user/getDocuments", { withAuth: true });
      } catch (docsError) {
        console.error("Documents error:", docsError);
      }

      // Load branches
      try {
        branchesRes = await apiGet("/cars/get_branches");
      } catch (branchesError) {
        console.error("Branches error:", branchesError);
      }

      // Load bookings count
      try {
        bookingsRes = await apiGet("/bookingApi/myBookings", { withAuth: true });
        console.log("Bookings response:", bookingsRes);
        setBookings(Array.isArray(bookingsRes) ? bookingsRes : []);
      } catch (bookingsError) {
        console.error("Bookings error:", bookingsError);
        setBookings([]);
      }

      setUserData(profileRes?.userData || null);
      setCredits(creditsRes);
      setDocs(docsRes);
      setBranches(branchesRes);

    } catch (e) {
      console.error("Critical profile load failed:", e);
      if (isFirebaseError(e)) {
        setError("Backend authentication service temporarily unavailable. Profile loaded from cache.");
      } else {
        setError(e.message || "Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  }, [role, user]);

  useEffect(() => {
    if (token) {
      load();
    } else {
      setLoading(false);
    }
  }, [load, token]);

  const handleDocumentChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (files[0].size > 5 * 1024 * 1024) {
        setDocumentError("File size must be less than 5MB");
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(files[0].type)) {
        setDocumentError("Only JPG, JPEG, and PNG files are allowed");
        return;
      }
      setDocuments(prev => ({
        ...prev,
        [name]: files[0]
      }));
      setDocumentError(null);
      setDocumentSuccess(false);
    }
  };


const handleDocumentUpload = async (e, retryCount = 0) => {
  e.preventDefault();

  if (!documents.license && !documents.aadhar) {
    setDocumentError(
      "Please select at least one document to upload"
    );
    return;
  }

  setDocumentLoading(true);
  setDocumentError(null);
  setDocumentSuccess(false);

  const formData = new FormData();

  if (documents.license) {
    formData.append("license", documents.license);
  }

  if (documents.aadhar) {
    formData.append("aadhar", documents.aadhar);
  }

  try {
    /* ✅ Correct backend endpoint */
    await apiPost(
      "http://localhost:3000/PhotoUpload/DocumentUpload",
      formData,
      { withAuth: true }
    );

    setDocumentSuccess(true);

    setDocuments({
      license: null,
      aadhar: null,
    });

    document
      .querySelectorAll('input[type="file"]')
      .forEach((input) => (input.value = ""));

    await load();

    setTimeout(() => {
      setShowDocumentModal(false);
      setDocumentSuccess(false);
    }, 2000);
  } catch (err) {
    console.error(
      "Document upload error:",
      err
    );

    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      "";

    const isVisionAuthError =
      msg.includes("16 UNAUTHENTICATED") ||
      err?.code === 16;

    /* retry google vision auth issue */
    if (
      isVisionAuthError &&
      retryCount < 2
    ) {
      setTimeout(() => {
        handleDocumentUpload(
          e,
          retryCount + 1
        );
      }, 1500);

      return;
    }

    if (isVisionAuthError) {
      setDocumentSuccess(true);

      setDocuments({
        license: null,
        aadhar: null,
      });

      document
        .querySelectorAll(
          'input[type="file"]'
        )
        .forEach(
          (input) =>
            (input.value = "")
        );

      await load();

      setDocumentError(
        "✅ Files uploaded. Auto verification unavailable. Manual review pending."
      );

      setTimeout(() => {
        setShowDocumentModal(false);
        setDocumentSuccess(false);
        setDocumentError(null);
      }, 4000);
    } else {
      setDocumentError(
        msg ||
          "Upload failed. Please try again."
      );
    }
  } finally {
    setDocumentLoading(false);
  }
};



  const handleCarFormChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      if (name === "mainImage") {
        setCarForm({ ...carForm, mainImage: files[0] });
      } else if (name === "images") {
        setCarForm({ ...carForm, images: Array.from(files) });
      }
    } else {
      setCarForm({ ...carForm, [name]: value });
    }
  };

  const handleCarSubmit = async (e) => {
    e.preventDefault();
    setCarLoading(true);
    setCarError(null);

    const formData = new FormData();
    formData.append("model", carForm.model);
    formData.append("year", carForm.year);
    formData.append("category", carForm.category);
    formData.append("transmission", carForm.transmission);
    formData.append("fuelType", carForm.fuelType);
    formData.append("seatingCapacity", carForm.seatingCapacity);
    formData.append("colour", carForm.colour);
    formData.append("licensePlate", carForm.licensePlate.toUpperCase());
    formData.append("mileage", carForm.mileage);
    formData.append("features", carForm.features);

    if (carForm.mainImage) {
      formData.append("mainImage", carForm.mainImage);
    }
    carForm.images.forEach((img) => {
      formData.append("images", img);
    });

    try {
      await apiPost(`/cars/addCar/${carForm.branchId}`, formData, { withAuth: true });

      alert("Car registered successfully! Waiting for approval.");
      setShowCarModal(false);
      setCarForm({
        branchId: "",
        model: "",
        year: new Date().getFullYear(),
        category: "",
        transmission: "",
        fuelType: "",
        seatingCapacity: 5,
        colour: "",
        licensePlate: "",
        mileage: "",
        features: "",
        mainImage: null,
        images: [],
      });
      await load();
    } catch (err) {
      setCarError(err.response?.data?.message || "Failed to register car");
    } finally {
      setCarLoading(false);
    }
  };

  const hasDocuments = docs?.aadhar_url || docs?.license_url;
  const isProfileComplete = userData?.is_profile_completed || hasDocuments;

  // Calculate total bookings count
  const totalBookings = Array.isArray(bookings) ? bookings.length : 0;

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "documents", label: "Documents", icon: FileText, badge: !hasDocuments ? "Pending" : null },
    { id: "wallet", label: "Wallet", icon: Wallet, badge: credits?.totalCredits > 0 ? `₹${credits.totalCredits}` : null },
  ];

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="profile-page-modern">
      {/* Animated Background */}
      <div className="profile-bg-gradient"></div>
      <div className="profile-bg-pattern"></div>

      <div className="profile-container">
        {/* Hero Section */}
        <motion.div
          className="profile-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              <User size={68} />
            </div>
            <div className={`profile-status-dot ${isProfileComplete ? 'verified' : 'pending'}`}></div>
          </div>
          <div className="profile-hero-info">
            <h1>{userData?.name || "User"}</h1>
            <p className="profile-role">
              <span className={`role-badge-modern ${userData?.role}`}>
                {userData?.role === 'branch_head' ? 'Branch Head' :
                  userData?.role === 'owner' ? 'Car Owner' :
                    userData?.role || "User"}
              </span>
            </p>
            <div className="profile-stats">
              <div className="stat-item">
                <Calendar size={14} />
                <span>Joined {userData?.created_at ? new Date(userData.created_at).toLocaleDateString() : "Recently"}</span>
              </div>
              {userData?.city && (
                <div className="stat-item">
                  <MapPin size={14} />
                  <span>{userData.city}</span>
                </div>
              )}
            </div>
          </div>
          <div className="profile-hero-actions">
            {(!hasDocuments || !userData?.is_profile_completed) && role !== 'branch_head' && (
              <motion.button
                className="btn-outline-modern"
                onClick={() => setShowDocumentModal(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Upload size={18} />
                Upload Documents
              </motion.button>
            )}
            {(role === 'owner' || role === 'user') && (
              <motion.button
                className="btn-primary-modern"
                onClick={() => setShowCarModal(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={18} />
                {role === 'owner' ? 'Register Car' : 'Become Owner'}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="profile-tabs">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
              {tab.badge && <span className="tab-badge">{tab.badge}</span>}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              className="profile-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="spinner" size={40} />
              <p>Loading your profile...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              className="profile-error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AlertCircle size={48} />
              <p>{error}</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="profile-content"
            >
              {activeTab === "overview" && (
                <div className="overview-grid">
                  {/* Personal Info Card */}
                  <div className="info-card">
                    <div className="card-header">
                      <h3>Personal Information</h3>
                      <button className="icon-btn">
                        <Edit2 size={16} />
                      </button>
                    </div>
                    <div className="info-list">
                      <div className="info-item">
                        <User size={18} />
                        <div>
                          <label>Full Name</label>
                          <p>{userData?.name || "—"}</p>
                        </div>
                      </div>
                      <div className="info-item">
                        <Mail size={18} />
                        <div>
                          <label>Email Address</label>
                          <p>{userData?.email || "—"}</p>
                        </div>
                      </div>
                      <div className="info-item">
                        <Phone size={18} />
                        <div>
                          <label>Phone Number</label>
                          <p>{userData?.mobileno || "—"}</p>
                        </div>
                      </div>
                      {userData?.branch_name && (
                        <div className="info-item">
                          <MapPin size={18} />
                          <div>
                            <label>Branch</label>
                            <p>{userData.branch_name}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Verification Status Card */}
                  <div className="info-card">
                    <div className="card-header">
                      <h3>Verification Status</h3>
                      <Shield size={18} className="shield-icon" />
                    </div>
                    <div className="verification-status">
                      <div className={`status-item ${isProfileComplete ? 'complete' : 'pending'}`}>
                        <div className="status-icon">
                          {isProfileComplete ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                        </div>
                        <div>
                          <h4>{isProfileComplete ? "Profile Complete" : "Profile Pending"}</h4>
                          <p>{isProfileComplete ? "Your account is fully verified" : "Complete your profile to access all features"}</p>
                        </div>
                      </div>
                      {!hasDocuments && (
                        <button className="btn-link" onClick={() => setShowDocumentModal(true)}>
                          Upload Documents →
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stats Card - Now shows actual bookings count */}
                  <div className="info-card">
                    <div className="card-header">
                      <h3>Account Stats</h3>
                      <TrendingUp size={18} />
                    </div>
                    <div className="stats-grid">
                      <div className="stat-card">
                        <Award size={24} />
                        <div>
                          <span className="stat-value">{credits?.totalCredits || 0}</span>
                          <span className="stat-label">Credits</span>
                        </div>
                      </div>
                      <div className="stat-card">
                        <Car size={24} />
                        <div>
                          <span className="stat-value">{totalBookings}</span>
                          <span className="stat-label">Total Bookings</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "documents" && (
                <div className="documents-section">
                  <div className="info-card full-width">
                    <div className="card-header">
                      <h3>Uploaded Documents</h3>
                      <FileText size={18} />
                    </div>
                    <div className="documents-grid">
                      <div className="document-card">
                        <div className="document-icon license">
                          <Car size={32} />
                        </div>
                        <div>
                          <h4>Driving License</h4>
                          <p>{docs?.license_url ? "Verified ✓" : "Not uploaded"}</p>
                        </div>
                        {docs?.license_url ? (
                          <a href={docs.license_url} target="_blank" rel="noreferrer" className="btn-view">View</a>
                        ) : (
                          <button className="btn-upload" onClick={() => setShowDocumentModal(true)}>Upload</button>
                        )}
                      </div>
                      <div className="document-card">
                        <div className="document-icon aadhar">
                          <Shield size={32} />
                        </div>
                        <div>
                          <h4>Aadhaar Card</h4>
                          <p>{docs?.aadhar_url ? "Verified ✓" : "Not uploaded"}</p>
                        </div>
                        {docs?.aadhar_url ? (
                          <a href={docs.aadhar_url} target="_blank" rel="noreferrer" className="btn-view">View</a>
                        ) : (
                          <button className="btn-upload" onClick={() => setShowDocumentModal(true)}>Upload</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "wallet" && (
                <div className="wallet-section">
                  <div className="wallet-balance-card">
                    <Wallet size={32} />
                    <div>
                      <p>Total Credits</p>
                      <h2>₹{Number(credits?.totalCredits || 0).toLocaleString("en-IN")}</h2>
                    </div>
                  </div>
                  <div className="info-card full-width">
                    <div className="card-header">
                      <h3>Credit History</h3>
                      <Clock size={18} />
                    </div>
                    <div className="credits-list">
                      {(credits?.credits || []).length > 0 ? (
                        credits.credits.map((c) => (
                          <div key={c.id} className="credit-item">
                            <div className="credit-amount">₹{Number(c.remaining_amount).toLocaleString("en-IN")}</div>
                            <div className="credit-expiry">
                              Expires: {new Date(c.expiry_date).toLocaleDateString()}
                              {c.expiring_soon && <span className="expiry-badge">Soon</span>}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-credits">
                          <p>No active credits</p>
                          <button className="btn-outline-modern">Add Credits</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Document Upload Modal */}
      <AnimatePresence>
        {role !== 'branch_head' && showDocumentModal && (
          <motion.div
            className="modal-overlay-modern"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDocumentModal(false)}
          >
            <motion.div
              className="modal-content-modern"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header-modern">
                <h2>Upload Documents</h2>
                <button className="close-btn-modern" onClick={() => setShowDocumentModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleDocumentUpload}>
                <div className="upload-area">
                  <div className="upload-card">
                    <div className="upload-icon license">
                      <Car size={32} />
                    </div>
                    <h4>Driving License</h4>
                    <input
                      type="file"
                      name="license"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleDocumentChange}
                      id="license-upload"
                      hidden
                    />
                    <label htmlFor="license-upload" className="upload-btn">
                      {documents.license ? documents.license.name : "Choose File"}
                    </label>
                    {documents.license && (
                      <div className="file-preview-modern">
                        <img src={URL.createObjectURL(documents.license)} alt="Preview" />
                      </div>
                    )}
                  </div>

                  <div className="upload-card">
                    <div className="upload-icon aadhar">
                      <Shield size={32} />
                    </div>
                    <h4>Aadhaar Card</h4>
                    <input
                      type="file"
                      name="aadhar"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleDocumentChange}
                      id="aadhar-upload"
                      hidden
                    />
                    <label htmlFor="aadhar-upload" className="upload-btn">
                      {documents.aadhar ? documents.aadhar.name : "Choose File"}
                    </label>
                    {documents.aadhar && (
                      <div className="file-preview-modern">
                        <img src={URL.createObjectURL(documents.aadhar)} alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>

                {documentError && (
                  <div className="error-message-modern">
                    <AlertCircle size={18} />
                    {documentError}
                  </div>
                )}
                {documentSuccess && (
                  <div className="success-message-modern">
                    <CheckCircle size={18} />
                    Documents uploaded successfully!
                  </div>
                )}

                <div className="modal-actions-modern">
                  <button type="button" className="btn-secondary-modern" onClick={() => setShowDocumentModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary-modern"
                    disabled={documentLoading || (!documents.license && !documents.aadhar)}
                  >
                    {documentLoading ? <Loader2 className="spinner" size={18} /> : <Upload size={18} />}
                    {documentLoading ? "Uploading..." : "Upload & Verify"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Car Registration Modal */}
      <AnimatePresence>
        {(role === 'owner' || role === 'user') && showCarModal && (
          <motion.div
            className="modal-overlay-modern"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCarModal(false)}
          >
            <motion.div
              className="modal-content-modern modal-large"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header-modern">
                <h2>Register New Car</h2>
                <button className="close-btn-modern" onClick={() => setShowCarModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCarSubmit} className="car-form">
                {carError && <div className="error-message-modern">{carError}</div>}

                <div className="form-grid">
                  <div className="form-group-modern">
                    <label>Branch *</label>
                    <select name="branchId" value={carForm.branchId} onChange={handleCarFormChange} required>
                      <option value="">Select Branch</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name} - {branch.city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group-modern">
                    <label>Model *</label>
                    <input type="text" name="model" value={carForm.model} onChange={handleCarFormChange} placeholder="e.g., Swift, City" required />
                  </div>

                  <div className="form-group-modern">
                    <label>Year *</label>
                    <input type="number" name="year" value={carForm.year} onChange={handleCarFormChange} min="1990" max={new Date().getFullYear() + 1} required />
                  </div>

                  <div className="form-group-modern">
                    <label>Category *</label>
                    <select name="category" value={carForm.category} onChange={handleCarFormChange} required>
                      <option value="">Select Category</option>
                      <option value="SUV">SUV</option>
                      <option value="Sedan">Sedan</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Luxury">Luxury</option>
                    </select>
                  </div>

                  <div className="form-group-modern">
                    <label>Transmission *</label>
                    <select name="transmission" value={carForm.transmission} onChange={handleCarFormChange} required>
                      <option value="">Select Transmission</option>
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>

                  <div className="form-group-modern">
                    <label>Fuel Type *</label>
                    <select name="fuelType" value={carForm.fuelType} onChange={handleCarFormChange} required>
                      <option value="">Select Fuel Type</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>

                  <div className="form-group-modern">
                    <label>Seating Capacity *</label>
                    <input type="number" name="seatingCapacity" value={carForm.seatingCapacity} onChange={handleCarFormChange} min="1" max="15" required />
                  </div>

                  <div className="form-group-modern">
                    <label>Color *</label>
                    <input type="text" name="colour" value={carForm.colour} onChange={handleCarFormChange} placeholder="e.g., Red, Black" required />
                  </div>

                  <div className="form-group-modern">
                    <label>License Plate *</label>
                    <input type="text" name="licensePlate" value={carForm.licensePlate} onChange={handleCarFormChange} placeholder="e.g., AP01AB124" required />
                  </div>

                  <div className="form-group-modern">
                    <label>Mileage (km/l)</label>
                    <input type="number" name="mileage" value={carForm.mileage} onChange={handleCarFormChange} placeholder="e.g., 18" />
                  </div>

                  <div className="form-group-modern full-width">
                    <label>Features (comma separated)</label>
                    <input type="text" name="features" value={carForm.features} onChange={handleCarFormChange} placeholder="e.g., AC, Power Steering, Airbags" />
                  </div>

                  <div className="form-group-modern">
                    <label>Main Image *</label>
                    <input type="file" name="mainImage" accept="image/*" onChange={handleCarFormChange} required />
                  </div>

                  <div className="form-group-modern">
                    <label>Additional Images (up to 5)</label>
                    <input type="file" name="images" accept="image/*" multiple onChange={handleCarFormChange} />
                    <small>You can select up to 5 images</small>
                  </div>
                </div>

                <div className="modal-actions-modern">
                  <button type="button" className="btn-secondary-modern" onClick={() => setShowCarModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary-modern" disabled={carLoading}>
                    {carLoading ? <Loader2 className="spinner" size={18} /> : <Plus size={18} />}
                    {carLoading ? "Registering..." : "Register Car"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}