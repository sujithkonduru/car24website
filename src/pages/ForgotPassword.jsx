import { useState } from "react";
import { Link } from "react-router-dom";
import { apiPost, apiPut } from "../api.js";
import "../Auth.css";
import logo from "../images/Car 24 logo (1).png";

export default function ForgotPassword() {
  const [step, setStep]             = useState("request");
  const [email, setEmail]           = useState("");
  const [otp, setOtp]               = useState("");
  const [newPass, setNewPass]       = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [changeToken, setChangeToken] = useState("");
  const [error, setError]           = useState(null);
  const [message, setMessage]       = useState(null);
  const [loading, setLoading]       = useState(false);

  async function requestOtp(e) {
    e.preventDefault();
    setError(null); setMessage(null); setLoading(true);
    try {
      await apiPost("/user/forgotPassOTP", { email });
      setMessage("OTP sent to your email.");
      setStep("verify");
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally { setLoading(false); }
  }

  async function verifyOtp(e) {
    e.preventDefault();
    setError(null); setMessage(null); setLoading(true);
    try {
      const res = await apiPost("/user/forgotPassOTPVerify", { email, otp });
      if (!res?.changePasswordToken) throw new Error("Token not received");
      setChangeToken(res.changePasswordToken);
      setStep("reset");
    } catch (err) {
      setError(err.message || "OTP verification failed");
    } finally { setLoading(false); }
  }

  async function resetPassword(e) {
    e.preventDefault();
    setError(null); setMessage(null); setLoading(true);
    try {
      await apiPut("/user/changePass", { pass: newPass }, { headers: { Authorization: `Bearer ${changeToken}` } });
      setStep("done");
    } catch (err) {
      setError(err.message || "Failed to change password");
    } finally { setLoading(false); }
  }

  const STEPS = [
    { key: "request", label: "Email" },
    { key: "verify",  label: "OTP" },
    { key: "reset",   label: "Reset" },
    { key: "done",    label: "Done" },
  ];
  const stepIdx = STEPS.findIndex(s => s.key === step);

  const titles = {
    request: { icon: "🔑", h: "Forgot Password", sub: "Enter your email to receive a reset code" },
    verify:  { icon: "📧", h: "Enter OTP",        sub: `We sent a code to ${email}` },
    reset:   { icon: "🔒", h: "New Password",     sub: "Choose a strong new password" },
    done:    { icon: "✅", h: "All Done!",         sub: "Your password has been updated" },
  };
  const t = titles[step];

  return (
    <div className="auth-page">
      {/* Brand Panel */}
      <div className="auth-brand-panel">
        <div className="auth-brand-glow" />
        <Link to="/" className="auth-brand-logo">
          <img src={logo} alt="Car24" />
        </Link>
        <div className="auth-brand-body">
          <div className="auth-brand-tag">
            <span className="auth-brand-tag-dot" />
            Secure Account Recovery
          </div>
          <h2 className="auth-brand-headline">
            Regain<br /><em>access</em><br />securely.
          </h2>
          <p className="auth-brand-sub">
            We'll send a one-time code to your registered email to verify your identity and reset your password.
          </p>
        </div>
        <div className="auth-brand-footer">© {new Date().getFullYear()} Car24 India</div>
      </div>

      {/* Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          {/* Step indicator */}
          <div className="auth-steps">
            {STEPS.slice(0, 3).map((s, i) => (
              <div key={s.key} className="auth-step">
                <div className={`auth-step-circle ${i < stepIdx ? "done" : i === stepIdx ? "active" : "pending"}`}>
                  {i < stepIdx ? "✓" : i + 1}
                </div>
                <span className="auth-step-label">{s.label}</span>
                {i < 2 && <div className={`auth-step-line ${i < stepIdx ? "done" : ""}`} />}
              </div>
            ))}
          </div>

          <div className="auth-form-header">
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{t.icon}</div>
            <h1>{t.h}</h1>
            <p>{t.sub}</p>
          </div>

          {error   && <div className="auth-banner error" style={{ marginBottom: "1rem" }}>⚠️ {error}</div>}
          {message && step !== "done" && <div className="auth-banner success" style={{ marginBottom: "1rem" }}>✓ {message}</div>}

          {step === "request" && (
            <form className="auth-form" onSubmit={requestOtp}>
              <div className="auth-field">
                <label>Email Address</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? <><span className="auth-spinner" /> Sending…</> : "Send Reset Code →"}
              </button>
            </form>
          )}

          {step === "verify" && (
            <form className="auth-form" onSubmit={verifyOtp}>
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
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? <><span className="auth-spinner" /> Verifying…</> : "Verify Code →"}
              </button>
            </form>
          )}

          {step === "reset" && (
            <form className="auth-form" onSubmit={resetPassword}>
              <div className="auth-field">
                <label>New Password</label>
                <div className="auth-input-wrap">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    className="has-toggle"
                    minLength={6}
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
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
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? <><span className="auth-spinner" /> Updating…</> : "Set New Password →"}
              </button>
            </form>
          )}

          {step === "done" && (
            <div style={{ textAlign: "center" }}>
              <div className="auth-success-icon">✓</div>
              <p style={{ color: "#8b98ab", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                You can now sign in with your new password.
              </p>
              <Link to="/login" className="auth-submit" style={{ display: "inline-flex", textDecoration: "none", justifyContent: "center" }}>
                Go to Login →
              </Link>
            </div>
          )}

          <div className="auth-footer">
            <Link to="/login">Back to Login</Link>
            <span className="sep">·</span>
            <Link to="/register">Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
