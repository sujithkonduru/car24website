import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";
import { getBranchCars } from "../api.js";  // Only import what's needed
import { carImageUrl } from "../utils/carImage.js";
import { formatINR } from "../utils/formatters.js";
import { 
  Car, 
  Plus, 
  Search, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Fuel,
  Settings,
  Users,
  MapPin,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import "./BranchFleet.css";

export default function BranchFleet() {
  const { user } = useAuth();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);
  const [showCarModal, setShowCarModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [carsPerPage] = useState(12);

  // Load branch cars
  const loadCars = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getBranchCars();
      const carsData = response?.data || response;
      setCars(Array.isArray(carsData) ? carsData : []);
    } catch (err) {
      console.error("Failed to load cars:", err);
      setError(err.message || "Failed to load cars");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  // Filter cars based on search
  const filteredCars = cars.filter(car => 
    searchTerm === "" ||
    car.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = filteredCars.slice(indexOfFirstCar, indexOfLastCar);
  const totalPages = Math.ceil(filteredCars.length / carsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Get status badge class
  const getStatusBadge = (car) => {
    if (!car.is_available) return "status-unavailable";
    if (car.approvalstatus === "pending") return "status-pending";
    if (car.approvalstatus === "approved") return "status-approved";
    if (car.approvalstatus === "rejected") return "status-rejected";
    return "status-available";
  };

  const getStatusText = (car) => {
    if (!car.is_available) return "Unavailable";
    if (car.approvalstatus === "pending") return "Pending Approval";
    if (car.approvalstatus === "approved") return "Approved";
    if (car.approvalstatus === "rejected") return "Rejected";
    return "Available";
  };

  // Stats
  const stats = {
    total: cars.length,
    available: cars.filter(c => c.is_available && c.approvalstatus === "approved").length,
    pending: cars.filter(c => c.approvalstatus === "pending").length,
    unavailable: cars.filter(c => !c.is_available).length
  };

  return (
    <div className="branch-fleet-container">
      {/* Header */}
      <div className="fleet-header">
        <div>
          <h1>Branch Fleet Management</h1>
          <div className="branch-info">
            <p>
              <MapPin size={16} />
              <strong>Branch Head:</strong> {user?.name || "Unknown"}
            </p>
            <p className="role-badge">branch_head</p>
          </div>
        </div>
        <Link to="/car-register" className="add-car-btn">
          <Plus size={18} />
          Add New Car
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="fleet-stats">
        <div className="stat-card">
          <Car size={24} className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Cars</span>
          </div>
        </div>
        <div className="stat-card success">
          <CheckCircle size={24} className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{stats.available}</span>
            <span className="stat-label">Available</span>
          </div>
        </div>
        <div className="stat-card warning">
          <AlertCircle size={24} className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Pending Approval</span>
          </div>
        </div>
        <div className="stat-card danger">
          <XCircle size={24} className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{stats.unavailable}</span>
            <span className="stat-label">Unavailable</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="fleet-search">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by model, license plate, or category..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <button className="refresh-btn" onClick={loadCars}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading fleet data...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="error-state">
          <AlertCircle size={48} />
          <p>{error}</p>
          <button className="retry-btn" onClick={loadCars}>Try Again</button>
        </div>
      )}

      {/* Cars Grid */}
      {!loading && !error && (
        <>
          {filteredCars.length === 0 ? (
            <div className="empty-state">
              <Car size={64} />
              <p>No cars found in your branch fleet</p>
              <Link to="/car-register" className="add-car-btn primary">
                <Plus size={18} />
                Add Your First Car
              </Link>
            </div>
          ) : (
            <>
              <div className="cars-grid">
                {currentCars.map((car) => (
                  <div key={car.id} className="car-card">
                    <div className="car-image-container">
                      <img 
                        src={carImageUrl(car)} 
                        alt={car.model}
                        className="car-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80";
                        }}
                      />
                      <span className={`car-status-badge ${getStatusBadge(car)}`}>
                        {getStatusText(car)}
                      </span>
                    </div>
                    
                    <div className="car-details">
                      <h3 className="car-model">{car.model}</h3>
                      <p className="car-year">{car.year}</p>
                      
                      <div className="car-specs">
                        <span className="spec-tag">
                          <Fuel size={14} />
                          {car.fuelType || car.fuel_type}
                        </span>
                        <span className="spec-tag">
                          <Settings size={14} />
                          {car.transmission}
                        </span>
                        <span className="spec-tag">
                          <Users size={14} />
                          {car.seatingCapacity || car.seating_capacity} seats
                        </span>
                      </div>

                      <div className="car-plate">
                        <span className="plate-label">License Plate:</span>
                        <span className="plate-number">{car.licenseplate || car.license_plate}</span>
                      </div>

                      <div className="car-pricing">
                        <div className="price-item">
                          <span>6h</span>
                          <strong>{formatINR(car.six_hr_price)}</strong>
                        </div>
                        <div className="price-item">
                          <span>12h</span>
                          <strong>{formatINR(car.twelve_hr_price)}</strong>
                        </div>
                        <div className="price-item">
                          <span>24h</span>
                          <strong>{formatINR(car.twentyfour_hr_price)}</strong>
                        </div>
                      </div>

                      {car.category && (
                        <div className="car-category">
                          <span className="category-badge">{car.category}</span>
                        </div>
                      )}

                      <div className="car-actions">
                        <button 
                          className="action-btn view-btn"
                          onClick={() => {
                            setSelectedCar(car);
                            setShowCarModal(true);
                          }}
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="page-btn"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </button>
                  <span className="page-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    className="page-btn"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Car Details Modal */}
      {showCarModal && selectedCar && (
        <div className="modal-overlay" onClick={() => setShowCarModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedCar.model} ({selectedCar.year})</h2>
              <button className="close-btn" onClick={() => setShowCarModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-image">
                <img 
                  src={carImageUrl(selectedCar)} 
                  alt={selectedCar.model}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80";
                  }}
                />
              </div>

              <div className="modal-details">
                <div className="detail-row">
                  <span className="detail-label">Model:</span>
                  <span className="detail-value">{selectedCar.model}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Year:</span>
                  <span className="detail-value">{selectedCar.year}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">{selectedCar.category || "N/A"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Transmission:</span>
                  <span className="detail-value">{selectedCar.transmission}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Fuel Type:</span>
                  <span className="detail-value">{selectedCar.fuelType || selectedCar.fuel_type}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Seating Capacity:</span>
                  <span className="detail-value">{selectedCar.seatingCapacity || selectedCar.seating_capacity}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Color:</span>
                  <span className="detail-value">{selectedCar.colour || "N/A"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">License Plate:</span>
                  <span className="detail-value plate">{selectedCar.licenseplate || selectedCar.license_plate}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Mileage:</span>
                  <span className="detail-value">{selectedCar.mileage || "N/A"} km/l</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`status-badge ${getStatusBadge(selectedCar)}`}>
                    {getStatusText(selectedCar)}
                  </span>
                </div>
                
                {selectedCar.features && selectedCar.features.length > 0 && (
                  <div className="detail-section">
                    <span className="detail-label">Features:</span>
                    <div className="features-list">
                      {selectedCar.features.map((feature, idx) => (
                        <span key={idx} className="feature-tag">{feature}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <span className="detail-label">Pricing:</span>
                  <div className="pricing-details">
                    <div>6 hours: <strong>{formatINR(selectedCar.six_hr_price)}</strong></div>
                    <div>12 hours: <strong>{formatINR(selectedCar.twelve_hr_price)}</strong></div>
                    <div>24 hours: <strong>{formatINR(selectedCar.twentyfour_hr_price)}</strong></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCarModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}