import { useState } from "react";
import { Link } from "react-router-dom";
import { apiPost, apiPut } from "../api.js";
import "../Auth.css";
import logo from "../images/Car 24 logo (1).png";

export default function Register() {
  const [step, setStep] = useState("form");
  const [form, setForm] = useState({
    name: "", 
    username: "", 
    email: "", 
    DOB: "",
    marriedDate: "", 
    NativePlace: "", 
    mobileno: "", 
    password: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function submitRegister(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      // FIX: Removed "/user" prefix - backend route is "/createUser"
      // FIX: Send marriedDate as null if empty (PostgreSQL expects NULL, not empty string)
      const payload = {
        name: form.name,
        username: form.username,
        email: form.email,
        DOB: form.DOB,
        marriedDate: form.marriedDate || null,
        NativePlace: form.NativePlace,
        mobileno: form.mobileno,
        password: form.password,
      };
      
      await apiPost("/user/createUser", payload);
      setMessage("Check your email for the OTP.");
      setStep("otp");
    } catch (err) {
      const status = err.status || err.statusCode;
      const handler = (await import('../utils/errorHandler.js')).formatError;
      setError(status ? handler(status, err.data?.message) : err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function submitOtp(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      // FIX: Removed "/user" prefix - backend route is "/verifyuserRegister"
      // FIX: OTP should be sent as string to match backend validation
      await apiPut("/user/verifyuserRegister", {
        otp: String(otp),
        email: form.email,
      });
      setStep("done");
    } catch (err) {
      const status = err.status || err.statusCode;
      const handler = (await import('../utils/errorHandler.js')).formatError;
      setError(status ? handler(status, err.data?.message) : err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    setError(null);
    setMessage(null);
    setResending(true);
    try {
      // FIX: Removed "/user" prefix - backend route is "/resendOTP"
      await apiPost("/user/resendOTP", { email: form.email });
      setMessage("A new OTP has been sent to your email.");
    } catch (err) {
      const status = err.status || err.statusCode;
      const handler = (await import('../utils/errorHandler.js')).formatError;
      setError(status ? handler(status, err.data?.message) : err.message || "Could not resend OTP");
    } finally {
      setResending(false);
    }
  }

  const STEPS = [
    { key: "form", label: "Details" },
    { key: "otp", label: "Verify" },
    { key: "done", label: "Done" },
  ];
  const stepIdx = STEPS.findIndex(s => s.key === step);

  const BrandPanel = () => (
    <div className="auth-brand-panel">
      <div className="auth-brand-glow" />
      <Link to="/" className="auth-brand-logo">
        <img src={logo} alt="Car24" />
      </Link>
      <div className="auth-brand-body">
        <div className="auth-brand-tag">
          <span className="auth-brand-tag-dot" />
          Join 25,000+ Happy Renters
        </div>
        <h2 className="auth-brand-headline">
          Start your<br /><em>journey</em><br />with us.
        </h2>
        <p className="auth-brand-sub">
          Create your free account and get access to 500+ certified cars across India. No hidden fees, ever.
        </p>
        <div className="auth-brand-stats">
          <div className="auth-stat-item">
            <span className="auth-stat-num">Free</span>
            <span className="auth-stat-lbl">Sign Up</span>
          </div>
          <div className="auth-stat-item">
            <span className="auth-stat-num">24/7</span>
            <span className="auth-stat-lbl">Support</span>
          </div>
          <div className="auth-stat-item">
            <span className="auth-stat-num">100%</span>
            <span className="auth-stat-lbl">Verified</span>
          </div>
        </div>
      </div>
      <div className="auth-brand-footer">© {new Date().getFullYear()} Car24 India</div>
    </div>
  );

  if (step === "done") {
    return (
      <div className="auth-page">
        <BrandPanel />
        <div className="auth-form-panel">
          <div className="auth-form-inner" style={{ textAlign: "center" }}>
            <div className="auth-success-icon">✓</div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#e8edf5", marginBottom: "0.5rem" }}>You're verified!</h1>
            <p style={{ color: "#8b98ab", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
              Your email has been confirmed. You can now sign in to Car24.
            </p>
            <Link to="/login" className="auth-submit" style={{ display: "inline-flex", textDecoration: "none", justifyContent: "center" }}>
              Go to Login →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="auth-page">
        <BrandPanel />
        <div className="auth-form-panel">
          <div className="auth-form-inner">
            <div className="auth-steps">
              {STEPS.map((s, i) => (
                <div key={s.key} className="auth-step">
                  <div className={`auth-step-circle ${i < stepIdx ? "done" : i === stepIdx ? "active" : "pending"}`}>
                    {i < stepIdx ? "✓" : i + 1}
                  </div>
                  <span className="auth-step-label">{s.label}</span>
                  {i < STEPS.length - 1 && <div className={`auth-step-line ${i < stepIdx ? "done" : ""}`} />}
                </div>
              ))}
            </div>
            <div className="auth-form-header">
              <h1>Check your email</h1>
              <p>We sent a 6-digit code to <strong style={{ color: "#14b8a6" }}>{form.email}</strong></p>
            </div>
            <form className="auth-form" onSubmit={submitOtp}>
              <div className="auth-field">
                <label>Verification Code</label>
                <input
                  type="text"
                  className="auth-otp-input"
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  required
                  maxLength={6}
                />
              </div>
              {message && <div className="auth-banner success">✓ {message}</div>}
              {error && <div className="auth-banner error">⚠️ {error}</div>}
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? <><span className="auth-spinner" /> Verifying…</> : "Verify Email →"}
              </button>
              <button
                type="button"
                onClick={resendOtp}
                disabled={resending}
                style={{ background: "none", border: "none", color: "#14b8a6", cursor: "pointer", fontSize: "0.85rem", textAlign: "center", fontFamily: "inherit" }}
              >
                {resending ? "Sending…" : "Resend OTP"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <BrandPanel />
      <div className="auth-form-panel">
        <div className="auth-form-inner" style={{ maxWidth: 480 }}>
          <div className="auth-steps">
            {STEPS.map((s, i) => (
              <div key={s.key} className="auth-step">
                <div className={`auth-step-circle ${i < stepIdx ? "done" : i === stepIdx ? "active" : "pending"}`}>
                  {i < stepIdx ? "✓" : i + 1}
                </div>
                <span className="auth-step-label">{s.label}</span>
                {i < STEPS.length - 1 && <div className={`auth-step-line ${i < stepIdx ? "done" : ""}`} />}
              </div>
            ))}
          </div>
          <div className="auth-form-header">
            <h1>Create account</h1>
            <p>Join Car24 and start your journey. <Link to="/login">Already have an account?</Link></p>
          </div>

          <form className="auth-form" onSubmit={submitRegister}>
            <div className="auth-form-grid">
              <div className="auth-field">
                <label>Full Name</label>
                <input name="name" placeholder="John Doe" value={form.name} onChange={onChange} required />
              </div>
              <div className="auth-field">
                <label>Username</label>
                <input name="username" placeholder="johndoe" value={form.username} onChange={onChange} required />
              </div>
              <div className="auth-field auth-full">
                <label>Email Address</label>
                <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={onChange} required />
              </div>
              <div className="auth-field">
                <label>Date of Birth</label>
                <input name="DOB" type="date" value={form.DOB} onChange={onChange} required />
              </div>
              <div className="auth-field">
                <label>Mobile Number</label>
                <input name="mobileno" placeholder="+91 98765 43210" value={form.mobileno} onChange={onChange} required />
              </div>
              <div className="auth-field">
                <label>Native Place</label>
                <input name="NativePlace" placeholder="City, State" value={form.NativePlace} onChange={onChange} required />
              </div>
              <div className="auth-field">
                <label>Married Date <span style={{ color: "#4a5568", fontWeight: 400 }}>(optional)</span></label>
                <input name="marriedDate" type="date" value={form.marriedDate} onChange={onChange} />
              </div>
              <div className="auth-field auth-full">
                <label>Password</label>
                <div className="auth-input-wrap">
                  <input
                    name="password"
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    className="has-toggle"
                    value={form.password}
                    onChange={onChange}
                    required
                  />
                  <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(p => !p)} tabIndex={-1}>
                    {showPw
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>
            </div>

            {error && <div className="auth-banner error">⚠️ {error}</div>}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <><span className="auth-spinner" /> Creating account…</> : "Create Account & Send OTP →"}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/owner/register">Register as Owner</Link>
            <span className="sep">·</span>
            <Link to="/owner/login">Owner Login</Link>
            <span className="sep">·</span>
            <Link to="/staff/login">Staff Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
