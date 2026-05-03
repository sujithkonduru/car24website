import { useState } from "react";
import { Link } from "react-router-dom";
import { carImageUrl, PLACEHOLDER } from "../utils/carImage.js";
import "./CarCard.css";

/* ── Fuel type icon map ── */
const FUEL_ICONS = {
  petrol:   "⛽",
  diesel:   "🛢",
  electric: "⚡",
  cng:      "💨",
  hybrid:   "🔋",
};

/* ── Transmission short label ── */
const TX_LABEL = {
  manual:    "Manual",
  automatic: "Automatic",
  cvt:       "CVT",
  dct:       "DCT",
};

/* ── Status badge configurations ── */
const STATUS_CONFIG = {
  available: { label: "Available", className: "available", icon: "✓" },
  booked: { label: "Not Available", className: "booked", icon: "✗" },
  popular: { label: "Popular", className: "popular", icon: "🔥" },
  new: { label: "New", className: "new", icon: "✨" },
};

export default function CarCard({ 
  car, 
  status = "available",
  showWishlist = true,
  onWishlistToggle,
  isWishlisted = false,
  compact = false 
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [liked, setLiked] = useState(isWishlisted);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // ✅ MODIFIED: Get images array and main_image
  const images = car.images || [];
  const mainImage = car.main_image;
  
  // ✅ NEW: Create array of image URLs prioritizing main_image
  const getImageUrls = () => {
    let allImages = [];
    
    // If main_image exists and is a string, add it first
    if (mainImage && typeof mainImage === 'string') {
      allImages.push(mainImage);
    }
    
    // Add all other images from images array
    if (images.length > 0) {
      allImages = [...allImages, ...images];
    }
    
    // Process through carImageUrl utility
    return allImages.map(img => carImageUrl({ images: [img] }));
  };
  
  const processedImages = getImageUrls();
  const currentImage = processedImages[currentImageIndex] || PLACEHOLDER;
  const price = car.twentyfour_hr_price != null
    ? `₹${Number(car.twentyfour_hr_price).toLocaleString("en-IN")}`
    : null;

  const fuelIcon = FUEL_ICONS[(car.fuelType || car.fuel_type || "").toLowerCase()] ?? "⛽";
  const txLabel = TX_LABEL[(car.transmission || "").toLowerCase()] ?? car.transmission;
  
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.available;
  
  const rating = car.rating || 4.5;
  const reviews = car.reviews || Math.floor(Math.random() * 500) + 50;
  const location = car.branch_city || "Multiple Locations";

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newLikedState = !liked;
    setLiked(newLikedState);
    if (onWishlistToggle) {
      onWishlistToggle(car.id, newLikedState);
    }
  };

  // Calculate discount if available
  const getDiscount = () => {
    if (status === 'popular') {
      const originalPrice = car.twentyfour_hr_price;
      const discountedPrice = originalPrice * 0.85;
      return {
        original: `₹${originalPrice.toLocaleString("en-IN")}`,
        discounted: `₹${Math.floor(discountedPrice).toLocaleString("en-IN")}`,
        percentage: 15
      };
    }
    return null;
  };

  const discount = getDiscount();

  // ✅ NEW: Handle image navigation
  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (processedImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % processedImages.length);
    }
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (processedImages.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + processedImages.length) % processedImages.length);
    }
  };

  return (
    <article 
      className={`cc-root ${compact ? 'cc-compact' : ''} ${isHovered ? 'cc-hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Image Section ── */}
      <div className="cc-media">
        {!imageLoaded && !imageError && (
          <div className="cc-image-skeleton">
            <div className="cc-skeleton-shimmer"></div>
          </div>
        )}
        <img 
          className={`cc-img ${imageLoaded ? 'cc-img-loaded' : ''}`}
          src={imageError ? PLACEHOLDER : currentImage} 
          alt={car.model || "Car"} 
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          style={{ display: imageLoaded  }}
        />

        {/* ✅ NEW: Image navigation arrows (shown on hover) */}
        {processedImages.length > 1 && isHovered && (
          <>
            <button 
              className="cc-nav-arrow cc-nav-prev"
              onClick={prevImage}
              aria-label="Previous image"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button 
              className="cc-nav-arrow cc-nav-next"
              onClick={nextImage}
              aria-label="Next image"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        {/* ✅ NEW: Image counter */}
        {processedImages.length > 1 && (
          <div className="cc-image-counter">
            {currentImageIndex + 1} / {processedImages.length}
          </div>
        )}

        {/* Status Badge */}
        <div className={`cc-status-badge ${statusConfig.className}`}>
          <span className="cc-status-icon">{statusConfig.icon}</span>
          <span className="cc-status-text">{statusConfig.label}</span>
        </div>

        {/* Category badge */}
        {car.category && (
          <span className="cc-badge">{car.category}</span>
        )}

        {/* Discount Badge */}
        {discount && (
          <div className="cc-discount-badge">
            -{discount.percentage}%
          </div>
        )}

        {/* Wishlist Button */}
        {showWishlist && (
          <button 
            className={`cc-wishlist-btn ${liked ? 'cc-wishlist-active' : ''}`}
            onClick={handleWishlistClick}
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg viewBox="0 0 24 24" fill={liked ? "#ef4444" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}

        {/* Year badge */}
        {car.year && !compact && (
          <span className="cc-year">{car.year}</span>
        )}
      </div>

      {/* ── Body ── */}
      <div className="cc-body">
        {/* Rating & Location Row */}
        <div className="cc-meta-row">
          <div className="cc-rating">
            <svg viewBox="0 0 24 24" fill="#f59e0b" stroke="none" width="14" height="14">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>{rating}</span>
            <span className="cc-reviews-count">({reviews})</span>
          </div>
          <div className="cc-location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{location}</span>
          </div>
        </div>

        {/* Car Model */}
        <h3 className="cc-model">{car.model || "Unknown Model"}</h3>

        {/* Branch info */}
        {(car.branch_name || car.branch_city) && !compact && (
          <p className="cc-branch">
            <span className="cc-branch-dot" />
            {car.branch_name}
            {car.branch_city ? ` · ${car.branch_city}` : ""}
          </p>
        )}

        {/* Spec chips */}
        <div className="cc-specs">
          {car.fuelType && (
            <span className="cc-spec" title="Fuel Type">
              <span className="cc-spec-icon">{fuelIcon}</span>
              <span>{car.fuelType}</span>
            </span>
          )}
          {car.transmission && (
            <span className="cc-spec" title="Transmission">
              <span className="cc-spec-icon">⚙</span>
              <span>{txLabel}</span>
            </span>
          )}
          {car.seatingCapacity && (
            <span className="cc-spec" title="Seating Capacity">
              <span className="cc-spec-icon">👤</span>
              <span>{car.seatingCapacity} seats</span>
            </span>
          )}
          {/* {car.mileage && !compact && (
            <span className="cc-spec" title="Mileage">
              <span className="cc-spec-icon">📊</span>
              <span>{car.mileage} km/l</span>
            </span>
          )} */}
          {car.colour && !compact && (
            <span className="cc-spec" title="Colour">
              <span
                className="cc-colour-dot"
                style={{ background: car.colour.toLowerCase() }}
              />
              <span>{car.colour}</span>
            </span>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="cc-footer">
          <div className="cc-price-wrapper">
            {discount ? (
              <div className="cc-price-discount">
                <span className="cc-price-original">{discount.original}</span>
                <span className="cc-price-value">{discount.discounted}<span className="cc-price-unit-sm">/day</span></span>
              </div>
            ) : price ? (
              <div className="cc-price-info">
                <span className="cc-price-label">From</span>
                <span className="cc-price-value">{price}<span className="cc-price-unit-sm">/day</span></span>
              </div>
            ) : (
              <span className="cc-no-price">See details</span>
            )}
          </div>

          <Link to={`/car/${car.id}`} className="cc-book-btn">
  
  {/* Steering Wheel SVG */}
  <svg
    className="cc-book-icon"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="10" cy="10" r="9" />
    <path d="M12 3v6M3 12h6M21 12h-6M12 21v-6" />
    <circle cx="12" cy="12" r="2" />
  </svg>

  <span>View Now</span>

  {/* Arrow */}
  <svg className="cc-book-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>

</Link>
        </div>
      </div>

      {/* Bottom glow line */}
      <div className="cc-glow-line" />
    </article>
  );
}