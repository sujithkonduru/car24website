import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost, uploadOwnerDocument, verifyOwnerOtp, resendUserOtp, getToken } from "../api.js";
import "../Auth.css";

export default function OwnerRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState("form");
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    dob: "",
    nativePlace: "",
    mobileno: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [userId, setUserId] = useState(null);
  const [retryStep, setRetryStep] = useState(null);

  // Document upload states
  const [licenseFile, setLicenseFile] = useState(null);
  const [aadharFile, setAadharFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadMessage, setUploadMessage] = useState(null);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validateForm() {
    if (!form.name.trim()) return "Full name is required";
    if (!form.username.trim()) return "Username is required";
    if (!form.email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email";
    if (!form.password) return "Password is required";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    if (!form.mobileno.trim()) return "Mobile number is required";
    if (!/^\d{10}$/.test(form.mobileno)) return "Enter a valid 10-digit mobile number";
    if (!form.nativePlace.trim()) return "Native place is required";
    return null;
  }

  async function submitRegister(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setRetryStep(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    const payload = {
      Name: form.name,
      Username: form.username,
      Email: form.email,
      DOB: form.dob || null,
      NativePlace: form.nativePlace,
      Mobileno: form.mobileno,
      pass: form.password,
      role: "owner"
    };

    try {
      const response = await apiPost("/owners/CreateOwnerAccount", payload);

      if (response.message || response.success) {
        setMessage(response.message || "OTP sent to your email. Please verify to complete registration.");
        if (response.userId) {
          setUserId(response.userId);
        }
        setStep("otp");
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      const status = err.status || 500;
      let errorMsg = err.data?.message || err.message || "Registration failed";
      
      if (status >= 500) {
        errorMsg = `Server Error (${status}): ${errorMsg}. Please check email/username uniqueness and try again.`;
      } else if (status === 400 && errorMsg.includes("already exists")) {
        errorMsg = "Account already exists. Try different email/username.";
      }
      
      setError(errorMsg);
      setRetryStep("register");
    } finally {
      setLoading(false);
    }
  }

  async function submitOtp(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setRetryStep(null);

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    
    try {
      const response = await verifyOwnerOtp(form.email, otp);

      if (response.message || response.success) {
        setMessage(response.message || "Email verified! Please upload your documents to complete profile.");
        setStep("upload-docs");
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err) {
      const status = err.status || 500;
      let errorMsg = err.data?.message || err.message || "Invalid or expired OTP";
      
      if (status >= 500) {
        errorMsg = `Server Error (${status}): ${errorMsg}`;
      }
      
      setError(errorMsg);
      setRetryStep("otp");
    } finally {
      setLoading(false);
    }
  }

  async function handleDocumentUpload(e) {
    e.preventDefault();
    setUploadError(null);
    setUploadMessage(null);
    setRetryStep(null);

    if (!licenseFile || !aadharFile) {
      setUploadError("Please select both license and Aadhaar files");
      return;
    }

    const token = getToken();
    
    if (!token) {
      setUploadError("Authentication token not found. Please login again.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("license", licenseFile);
    formData.append("aadhar", aadharFile);
    if (userId) formData.append("userId", userId);
    if (form.email) formData.append("email", form.email);

    try {
      const response = await uploadOwnerDocument(formData);
      setUploadMessage(response.message || "Documents uploaded successfully!");
      setTimeout(() => setStep("done"), 2000);
    } catch (err) {
      const status = err.status || 500;
      let errorMsg = err.data?.message || err.message || "Upload failed";
      
      if (status === 401) {
        errorMsg = "Session expired. Please login again.";
        setTimeout(() => navigate("/owner/login"), 2000);
      } else if (status >= 500) {
        errorMsg = `Server Error (${status}): ${errorMsg}`;
      }
      
      setUploadError(errorMsg);
      setRetryStep("upload");
    } finally {
      setUploading(false);
    }
  }

  async function resendOtp() {
    setError(null);
    setMessage(null);
    setResendingOtp(true);
    
    try {
      const response = await resendUserOtp(form.email);
      setMessage(response.message || "A new OTP has been sent to your email.");
    } catch (err) {
      const status = err.status || 500;
      let errorMsg = err.data?.message || err.message || "Could not resend OTP";
      
      if (status >= 500) {
        errorMsg = `Server Error (${status}): ${errorMsg}`;
      }
      
      setError(errorMsg);
    } finally {
      setResendingOtp(false);
    }
  }

  const handleBackToForm = () => {
    setStep("form");
    setOtp("");
    setError(null);
    setMessage(null);
  };

  const handleBackToOtp = () => {
    setStep("otp");
    setUploadError(null);
    setUploadMessage(null);
    setLicenseFile(null);
    setAadharFile(null);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Register as Car Owner</h1>
          <p className="muted">List your cars on Car24 and start earning</p>
        </div>

        {/* Step 1: Registration Form */}
        {step === "form" && (
          <form className="auth-form" onSubmit={submitRegister}>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Username *</label>
                <input
                  name="username"
                  type="text"
                  placeholder="john_doe"
                  value={form.username}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  name="email"
                  type="email"
                  placeholder="owner@example.com"
                  value={form.email}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mobile Number *</label>
                <input
                  name="mobileno"
                  type="tel"
                  placeholder="9876543210"
                  value={form.mobileno}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  name="dob"
                  type="date"
                  value={form.dob}
                  onChange={onChange}
                />
              </div>

              <div className="form-group">
                <label>Native Place *</label>
                <input
                  name="nativePlace"
                  type="text"
                  placeholder="e.g., Nellore"
                  value={form.nativePlace}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={form.confirmPassword}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Address</label>
                <textarea
                  name="address"
                  rows="3"
                  placeholder="Your full address"
                  value={form.address}
                  onChange={onChange}
                />
              </div>

              <div className="form-group">
                <label>City</label>
                <input
                  name="city"
                  type="text"
                  placeholder="City"
                  value={form.city}
                  onChange={onChange}
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  name="state"
                  type="text"
                  placeholder="State"
                  value={form.state}
                  onChange={onChange}
                />
              </div>

              <div className="form-group">
                <label>Pincode</label>
                <input
                  name="pincode"
                  type="text"
                  placeholder="524001"
                  value={form.pincode}
                  onChange={onChange}
                />
              </div>
            </div>

            {error && (
              <div className="banner error">
                {error}
                {retryStep === "register" && (
                  <button 
                    className="btn ghost small mt-2" 
                    onClick={() => { setError(null); setRetryStep(null); }}
                    disabled={loading}
                  >
                    Retry Registration
                  </button>
                )}
              </div>
            )}
            {message && <div className="banner success">{message}</div>}

            <button type="submit" className="btn primary btn-full" disabled={loading}>
              {loading ? "Sending OTP..." : "Register as Owner"}
            </button>

            <div className="auth-links">
              <span className="auth-text">Already have an owner account?</span>
              <Link to="/owner/login" className="auth-link">Sign in</Link>
            </div>
            <div className="auth-links">
              <span className="auth-text">Want to rent a car?</span>
              <Link to="/register" className="auth-link">Register as User</Link>
            </div>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === "otp" && (
          <form className="auth-form" onSubmit={submitOtp}>
            <div className="otp-container">
              <div className="form-group">
                <label>OTP Code</label>
                <input
                  type="text"
                  maxLength="6"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                />
                <p className="muted small">
                  We sent a verification code to <strong>{form.email}</strong>
                </p>
                <p className="muted small">
                  OTP expires in 5 minutes
                </p>
              </div>
            </div>

            {message && <div className="banner success">{message}</div>}
            {error && (
              <div className="banner error">
                {error}
                {retryStep === "otp" && (
                  <button 
                    className="btn ghost small mt-2" 
                    onClick={() => { setError(null); setOtp(""); setRetryStep(null); }}
                    disabled={loading}
                  >
                    Retry OTP
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              className="btn primary btn-full"
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            <button
              type="button"
              className="btn ghost btn-full"
              disabled={resendingOtp}
              onClick={resendOtp}
            >
              {resendingOtp ? "Sending..." : "Resend OTP"}
            </button>

            <button
              type="button"
              className="btn ghost btn-full"
              onClick={handleBackToForm}
            >
              Back to registration
            </button>
          </form>
        )}

        {/* Step 3: Document Upload */}
        {step === "upload-docs" && (
          <form className="auth-form" onSubmit={handleDocumentUpload}>
            <div className="upload-section">
              <h3>Upload Documents</h3>
              <p className="muted">Upload clear images of your Aadhaar and Driving License to complete your profile.</p>
            </div>

            <div className="form-group">
              <label>Driving License *</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                required
              />
              {licenseFile && (
                <div className="file-preview">
                  {licenseFile.type.startsWith('image/') ? (
                    <img 
                      src={URL.createObjectURL(licenseFile)} 
                      alt="License preview" 
                      className="file-preview-image"
                    />
                  ) : (
                    <div className="file-icon">📄</div>
                  )}
                  <span>{licenseFile.name}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Aadhaar Card *</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setAadharFile(e.target.files?.[0] || null)}
                required
              />
              {aadharFile && (
                <div className="file-preview">
                  {aadharFile.type.startsWith('image/') ? (
                    <img 
                      src={URL.createObjectURL(aadharFile)} 
                      alt="Aadhaar preview" 
                      className="file-preview-image"
                    />
                  ) : (
                    <div className="file-icon">📄</div>
                  )}
                  <span>{aadharFile.name}</span>
                </div>
              )}
            </div>

            {uploadError && (
              <div className="banner error">
                {uploadError}
                {retryStep === "upload" && (
                  <button 
                    className="btn ghost small mt-2" 
                    onClick={handleBackToOtp}
                    disabled={uploading}
                  >
                    Change Files & Retry
                  </button>
                )}
              </div>
            )}
            {uploadMessage && <div className="banner success">{uploadMessage}</div>}

            <button
              type="submit"
              className="btn primary btn-full"
              disabled={uploading || !licenseFile || !aadharFile}
            >
              {uploading ? "Uploading..." : "Upload Documents"}
            </button>

            <button
              type="button"
              className="btn ghost btn-full"
              onClick={handleBackToOtp}
            >
              Back to OTP
            </button>
          </form>
        )}

        {/* Step 4: Completion */}
        {step === "done" && (
          <div className="success-card">
            <div className="success-icon">✓</div>
            <h2>Registration Complete!</h2>
            <p className="muted">{uploadMessage || "Your account has been successfully verified."}</p>
            <div className="success-actions">
              <Link to="/owner/login" className="btn primary btn-full">
                Go to Owner Login
              </Link>
              <Link to="/" className="btn ghost btn-full">
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}