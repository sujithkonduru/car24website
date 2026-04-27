import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ownerLogin } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import "./Login.css";

export default function OwnerLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await ownerLogin(email, password);
      if (res.token) {
        login(res.token);
        navigate("/owner/dashboard");
        return;
      }
      setError("Login failed. Please check your credentials.");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="portal-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
              <path d="M1 21h22" />
              <path d="M9 21V9h6v12" />
            </svg>
            Owner Portal
          </div>
          <h1>Owner Login</h1>
          <p className="muted">Access your fleet dashboard and earnings</p>
          <p className="small muted">
            No account? <Link to="/owner/register">Register as owner</Link>
            {" · "}<Link to="/login">User login</Link>
          </p>
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="owner@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span> {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Signing in…" : "Sign in to Owner Portal"}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/forgot-password">Forgot password?</Link>
          <span className="divider">•</span>
          <Link to="/staff/login">Staff Login</Link>
          <span className="divider">•</span>
          <Link to="/branch/login">Branch Login</Link>
        </div>
      </div>

      <style>{`
        .portal-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 14px;
          background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 999px;
          color: #c9a84c;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }
      `}</style>
    </div>
  );
}
