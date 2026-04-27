import { Link, useNavigate } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="nf-root">
      <div className="nf-glow nf-glow--left" />
      <div className="nf-glow nf-glow--right" />
      <div className="nf-content">
        <div className="nf-code">404</div>
        <div className="nf-car">🚗</div>
        <h1 className="nf-title">Lost on the road?</h1>
        <p className="nf-desc">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
        <div className="nf-actions">
          <Link to="/" className="nf-btn-primary">← Back to Home</Link>
          <button className="nf-btn-ghost" onClick={() => navigate(-1)}>Go Back</button>
        </div>
        <div className="nf-links">
          <Link to="/bookings">My Bookings</Link>
          <span>·</span>
          <Link to="/help">Help Center</Link>
          <span>·</span>
          <Link to="/contact">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
