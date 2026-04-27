import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet } from "../api.js";
import "./Locations.css";

export default function Locations() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiGet("/cars/get_branches")
      .then((rows) => setBranches(Array.isArray(rows) ? rows : []))
      .catch(() => setBranches([]))
      .finally(() => setLoading(false));
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  const filtered = branches.filter((b) => {
    const q = search.toLowerCase();
    return (
      !q ||
      b.name?.toLowerCase().includes(q) ||
      b.city?.toLowerCase().includes(q) ||
      b.state?.toLowerCase().includes(q)
    );
  });

  // Group by state
  const byState = filtered.reduce((acc, b) => {
    const state = b.state || "Other";
    if (!acc[state]) acc[state] = [];
    acc[state].push(b);
    return acc;
  }, {});

  return (
    <div className="loc-page">
      {/* Back Button */}
      <button onClick={handleGoBack} className="loc-back-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>Back</span>
      </button>

      {/* Hero */}
      <div className="loc-hero">
        <span className="loc-eyebrow">Our Network</span>
        <h1 className="loc-title">Find a Branch Near You</h1>
        <p className="loc-subtitle">
          Car24 operates across multiple cities in India. Pick up and drop off at any of our branches.
        </p>
        <div className="loc-search-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search by city or state…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="loc-search"
          />
        </div>
      </div>

      <div className="loc-body">
        {loading && (
          <div className="loc-skeleton-grid">
            {[...Array(6)].map((_, i) => <div key={i} className="loc-skeleton-card" />)}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="loc-empty">
            <span>📍</span>
            <p>No branches found{search ? ` for "${search}"` : ""}.</p>
            {search && <button onClick={() => setSearch("")} className="loc-clear-btn">Clear search</button>}
          </div>
        )}

        {!loading && Object.entries(byState).map(([state, list]) => (
          <div key={state} className="loc-state-group">
            <h2 className="loc-state-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {state}
              <span className="loc-state-count">{list.length} branch{list.length !== 1 ? "es" : ""}</span>
            </h2>
            <div className="loc-grid">
              {list.map((b) => (
                <div key={b.id} className="loc-card">
                  <div className="loc-card-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <div className="loc-card-body">
                    <h3 className="loc-card-name">{b.name}</h3>
                    <p className="loc-card-city">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      {b.city}{b.state ? `, ${b.state}` : ""}
                    </p>
                    {b.address && <p className="loc-card-address">{b.address}</p>}
                    {b.phone && (
                      <a href={`tel:${b.phone}`} className="loc-card-phone">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        {b.phone}
                      </a>
                    )}
                  </div>
                  <Link to={`/?branch=${b.id}`} className="loc-card-btn">
                    Browse Cars →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}

        {!loading && branches.length === 0 && (
          <div className="loc-empty">
            <span>🏢</span>
            <p>Branch information coming soon.</p>
            <Link to="/" className="loc-clear-btn">Browse all cars</Link>
          </div>
        )}
      </div>
    </div>
  );
}