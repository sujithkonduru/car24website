import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getBranches, addCar } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import "./carRegister.css";

export default function CarRegister() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [branchId, setBranchId] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    model: "",
    year: "",
    category: "",
    transmission: "Automatic",
    fuelType: "petrol",
    seatingCapacity: "",
    licensePlate: "",
    mileage: "",
    colour: "",
    features: ""
  });

  const loadBranches = useCallback(async () => {
    try {
      const data = await getBranches();
      setBranches(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load branches");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "branchId") {
      setBranchId(value);
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setMessage("");
    setError("");
  };

  const handleImagePreview = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    if (!branchId) {
      setError("Please select a branch");
      setSubmitting(false);
      return;
    }

    const fd = new FormData();
    fd.append("model", formData.model);
    fd.append("year", formData.year);
    fd.append("category", formData.category);
    fd.append("transmission", formData.transmission);
    fd.append("fuelType", formData.fuelType);
    fd.append("seatingCapacity", formData.seatingCapacity);
    fd.append("licensePlate", formData.licensePlate.toUpperCase());
    fd.append("mileage", formData.mileage);
    fd.append("colour", formData.colour);
    fd.append("features", formData.features);
    fd.append("branchId", branchId);

    const mainImage = e.target.mainImage?.files[0];
    const images = e.target.images?.files;
    
    if (mainImage) {
      fd.append("mainImage", mainImage);
    }
    if (images) {
      for (let i = 0; i < images.length; i++) {
        fd.append("images", images[i]);
      }
    }

    try {
      await addCar(branchId, fd);
      setMessage("Car registered successfully! Awaiting approval.");
      setTimeout(() => navigate("/owner/dashboard"), 2000);
    } catch (e) {
      setError(e.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) return <Navigate to="/login" replace />;

  if (loading) return (
    <div className="page narrow auth-page">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading branches...</p>
      </div>
    </div>
  );

  return (
    <div className="page narrow auth-page">
      <div className="header-section">
        <h1>Register Your Car</h1>
        <p className="subtitle">List your vehicle and start earning</p>
      </div>
      
      {error && <div className="banner error">{error}</div>}
      {message && <div className="banner success">{message}</div>}
      
      <form className="card auth-form" onSubmit={handleSubmit}>
        {/* Branch Selection - Full Width */}
        <div className="form-group full-width">
          <label htmlFor="branchId">
            <span className="label-text">Select Branch</span>
            <span className="required">*</span>
          </label>
          <select 
            id="branchId"
            name="branchId" 
            value={branchId} 
            onChange={handleChange} 
            required
          >
            <option value="">Choose a branch location</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name} - {b.city}</option>
            ))}
          </select>
        </div>

        {/* Car Model - Full Width */}
        <div className="form-group full-width">
          <label htmlFor="model">
            <span className="label-text">Car Model</span>
            <span className="required">*</span>
          </label>
          <input 
            type="text" 
            id="model"
            name="model" 
            value={formData.model} 
            onChange={handleChange} 
            placeholder="e.g., Toyota Camry, Honda City"
            required 
            maxLength="250" 
          />
        </div>

        {/* Year and Category - Two Columns */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="year">
              <span className="label-text">Manufacturing Year</span>
              <span className="required">*</span>
            </label>
            <input 
              type="number" 
              id="year"
              name="year" 
              value={formData.year} 
              onChange={handleChange} 
              placeholder="e.g., 2022"
              min="1900" 
              max={new Date().getFullYear() + 1} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">
              <span className="label-text">Vehicle Category</span>
              <span className="required">*</span>
            </label>
            <select 
              id="category"
              name="category" 
              value={formData.category} 
              onChange={handleChange} 
              required
            >
              <option value="">Select category</option>
              <option>Hatchback</option>
              <option>Sedan</option>
              <option>SUV</option>
              <option>MPV</option>
              <option>Luxury</option>
              <option>Sports</option>
            </select>
          </div>
        </div>

        {/* Transmission and Fuel Type - Two Columns */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="transmission">
              <span className="label-text">Transmission</span>
              <span className="required">*</span>
            </label>
            <select 
              id="transmission"
              name="transmission" 
              value={formData.transmission} 
              onChange={handleChange} 
              required
            >
              <option>Automatic</option>
              <option>Manual</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fuelType">
              <span className="label-text">Fuel Type</span>
              <span className="required">*</span>
            </label>
            <select 
              id="fuelType"
              name="fuelType" 
              value={formData.fuelType} 
              onChange={handleChange} 
              required
            >
              <option>petrol</option>
              <option>diesel</option>
              <option>cng</option>
              <option>electric</option>
              <option>hybrid</option>
            </select>
          </div>
        </div>

        {/* Seating and License Plate - Two Columns */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="seatingCapacity">
              <span className="label-text">Seating Capacity</span>
              <span className="required">*</span>
            </label>
            <input 
              type="number" 
              id="seatingCapacity"
              name="seatingCapacity" 
              value={formData.seatingCapacity} 
              onChange={handleChange} 
              placeholder="e.g., 5"
              min="2" 
              max="12" 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="licensePlate">
              <span className="label-text">License Plate</span>
              <span className="required">*</span>
            </label>
            <input 
              type="text" 
              id="licensePlate"
              name="licensePlate" 
              value={formData.licensePlate} 
              onChange={handleChange} 
              placeholder="e.g., KA01AB1234"
              required 
              maxLength="20" 
            />
          </div>
        </div>

        {/* Mileage and Colour - Two Columns */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="mileage">
              <span className="label-text">Mileage (km/l or km/kWh)</span>
            </label>
            <input 
              type="number" 
              id="mileage"
              name="mileage" 
              value={formData.mileage} 
              onChange={handleChange} 
              placeholder="e.g., 18.5"
              min="0" 
              step="0.1" 
            />
          </div>

          <div className="form-group">
            <label htmlFor="colour">
              <span className="label-text">Color</span>
              <span className="required">*</span>
            </label>
            <input 
              type="text" 
              id="colour"
              name="colour" 
              value={formData.colour} 
              onChange={handleChange} 
              placeholder="e.g., Red, Black, White"
              required 
              maxLength="250" 
            />
          </div>
        </div>

        {/* Features - Full Width */}
        <div className="form-group full-width">
          <label htmlFor="features">
            <span className="label-text">Features & Amenities</span>
          </label>
          <textarea 
            id="features"
            name="features" 
            value={formData.features} 
            onChange={handleChange} 
            rows="4" 
            maxLength="2000" 
            placeholder="e.g., AC, Power Steering, ABS, Airbags, Bluetooth, Reverse Camera"
          />
          <small className="char-count">{formData.features.length}/2000 characters</small>
        </div>

        {/* Images Section - Full Width */}
        <div className="form-group full-width">
          <label htmlFor="mainImage">
            <span className="label-text">Main Image</span>
          </label>
          <input 
            type="file" 
            id="mainImage"
            name="mainImage" 
            accept="image/*" 
            onChange={handleImagePreview}
          />
          <small className="helper-text">Recommended: JPG or PNG, max 5MB (First image will be shown as main)</small>
        </div>

        <div className="form-group full-width">
          <label htmlFor="images">
            <span className="label-text">Additional Images</span>
          </label>
          <input 
            type="file" 
            id="images"
            name="images" 
            accept="image/*" 
            multiple 
            onChange={handleImagePreview}
          />
          <small className="helper-text">You can select up to 5 images (Hold Ctrl/Cmd to select multiple)</small>
          
          {imagePreviews.length > 0 && (
            <div className="image-previews">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="preview-item">
                  <img src={preview} alt={`Preview ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner"></span>
              Registering...
            </>
          ) : (
            'Register Car'
          )}
        </button>
      </form>
      
      <div className="back-link">
        <a href="/profile">← Back to Profile</a>
      </div>
    </div>
  );
}