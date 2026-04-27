import { useState, useEffect, useMemo } from "react";

export default function DataTable({ 
  columns, 
  data = [], 
  type, 
  loading = false,
  onStatusChange, 
  onDelete, 
  onView, 
  onEdit,
  onApprove,
  onReject,
  onCancel,
  onConfirm,
  priorityColumns = [], // Optional: mobile priority columns
  className = ""
}) {
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [isMobile, setIsMobile] = useState(false);

  // Responsive detection
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mediaQuery.matches);

    const handleChange = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      if (!sortBy) return 0;
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortBy, sortOrder]);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const renderCell = (item, column) => {
    if (column.key === "image") {
      return <img src={item.image} alt={item.model} className="table-thumb" />;
    }
    if (column.key === "status") {
      return (
        <select 
          className={`status-select ${item.status}`}
          value={item.status}
          onChange={(e) => onStatusChange?.(item.id, e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      );
    }
    if (column.key === "actions") {
      return (
        <div className="action-buttons">
          {onView && (
            <button className="action-btn view" onClick={() => onView(item)} title="View">
              👁️
            </button>
          )}
          {onEdit && (
            <button className="action-btn edit" onClick={() => onEdit(item)} title="Edit">
              ✏️
            </button>
          )}
          {onApprove && item.status === "pending" && (
            <button className="action-btn approve" onClick={() => onApprove(item)} title="Approve">
              ✓
            </button>
          )}
          {onReject && item.status === "pending" && (
            <button className="action-btn reject" onClick={() => onReject(item)} title="Reject">
              ✗
            </button>
          )}
          {onCancel && item.status === "pending" && (
            <button className="action-btn cancel" onClick={() => onCancel(item)} title="Cancel">
              🗑️
            </button>
          )}
          {onConfirm && item.status === "pending" && (
            <button className="action-btn confirm" onClick={() => onConfirm(item)} title="Confirm">
              ✓
            </button>
          )}
          {onDelete && (
            <button className="action-btn delete" onClick={() => onDelete(item)} title="Delete">
              🗑️
            </button>
          )}
        </div>
      );
    }
    // Default render
    return item[column.key] || "—";
  };

  const renderMobileCard = (item, index) => {
    const priorityCols = priorityColumns.length > 0 ? priorityColumns : columns.slice(0, 2);
    const hasActions = onView || onEdit || onDelete || onApprove || onReject || onCancel || onConfirm;
    
    return (
      <div key={item.id || index} className="table-card">
        <div className="card-header">
          {priorityCols.map(col => (
            <div key={col.key} className="card-field">
              <span className="field-label">{col.label}:</span>
              <span className="field-value">{renderCell(item, col)}</span>
            </div>
          ))}
        </div>
        
        {columns.length > 3 && (
          <div className="card-details">
            <details>
              <summary>More Details</summary>
              <div className="details-grid">
                {columns.filter(col => !priorityCols.some(p => p.key === col.key) && col.key !== 'actions').map(col => (
                  <div key={col.key} className="detail-item">
                    <strong>{col.label}:</strong> {renderCell(item, col)}
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
        
        {hasActions && (
          <div className="card-actions">
            <div className="mobile-action-buttons">
              {onView && (
                <button className="mobile-btn view" onClick={() => onView(item)} title="View">
                  👁️ View
                </button>
              )}
              {onEdit && (
                <button className="mobile-btn edit" onClick={() => onEdit(item)} title="Edit">
                  ✏️ Edit
                </button>
              )}
              {onApprove && item.status === "pending" && (
                <button className="mobile-btn success" onClick={() => onApprove(item)} title="Approve">
                  ✓ Approve
                </button>
              )}
              {onReject && item.status === "pending" && (
                <button className="mobile-btn danger" onClick={() => onReject(item)} title="Reject">
                  ✗ Reject
                </button>
              )}
              {onDelete && (
                <button className="mobile-btn danger" onClick={() => onDelete(item)} title="Delete">
                  🗑️ Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="table-skeleton">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (sortedData.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📊</div>
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className={`data-table-container ${className}`}>
      {isMobile ? (
        <div className="table-cards">
          {sortedData.map((item, index) => renderMobileCard(item, index))}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map(col => (
                  <th 
                    key={col.key} 
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    style={{ cursor: col.sortable !== false ? 'pointer' : 'default' }}
                  >
                    {col.label}
                    {col.sortable !== false && sortBy === col.key && (
                      <span className="sort-icon">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item, idx) => (
                <tr key={item.id || idx}>
                  {columns.map(col => (
                    <td key={col.key}>{renderCell(item, col)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}