import React, { useState, useEffect } from 'react';
import { LoadScript, GoogleMap, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import './BranchMap.css';

const BranchMap = ({ branchName, branchAddress, branchesCount }) => {
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const [branchCoords, setBranchCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);

  const mapContainerStyle = {
    width: '100%',
    height: '350px',
    borderRadius: '12px'
  };

  const defaultCenter = {
    lat: 28.6139,
    lng: 77.2090
  };

  // Geocode address to coordinates
  const geocodeAddress = (address, callback) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        callback({ lat: location.lat(), lng: location.lng() });
      } else {
        console.error('Geocoding failed:', status);
        callback(null);
      }
    });
  };

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);
        }
      );
    }
  };

  // Get directions from user location to branch
  const getDirections = () => {
    if (!userLocation || !branchAddress) return;

    setLoading(true);
    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: userLocation,
        destination: branchAddress,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        setLoading(false);
        if (status === 'OK') {
          setDirections(result);
          setShowDirections(true);
          
          // Extract route info
          const route = result.routes[0].legs[0];
          setRouteInfo({
            distance: route.distance.text,
            duration: route.duration.text
          });
        } else {
          console.error('Directions request failed:', status);
        }
      }
    );
  };

  // Geocode branch address on component mount
  useEffect(() => {
    if (branchAddress) {
      geocodeAddress(branchAddress, (coords) => {
        if (coords) setBranchCoords(coords);
      });
    }
    getUserLocation();
  }, [branchAddress]);

  const handleOpenInGoogleMaps = () => {
    if (branchAddress) {
      let url;
      if (userLocation) {
        url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(branchAddress)}`;
      } else {
        url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branchAddress)}`;
      }
      window.open(url, '_blank');
    }
  };

  const handleOpenInWaze = () => {
    if (branchAddress) {
      const url = `https://www.waze.com/ul?q=${encodeURIComponent(branchAddress)}&navigate=yes`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="branch-map-container">
      <div className="branch-info-header">
        <div className="branch-info-text">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <div>
            <p className="branch-title">
              This car is available at <strong>{branchName || "Branch"}</strong> branch
              {branchesCount > 0 && ` • ${branchesCount} branches across India`}
            </p>
            <p className="branch-address-full">{branchAddress}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="map-action-buttons">
        <button 
          onClick={getDirections}
          className="map-btn map-btn-primary"
          disabled={!userLocation || loading}
        >
          {loading ? (
            <span className="btn-spinner"></span>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Get Directions
            </>
          )}
        </button>
        
        <button 
          onClick={handleOpenInGoogleMaps}
          className="map-btn map-btn-google"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
          </svg>
          Google Maps
        </button>
        
        <button 
          onClick={handleOpenInWaze}
          className="map-btn map-btn-waze"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
          </svg>
          Waze
        </button>
      </div>

      {/* Map Display */}
      {branchCoords && (
        <div className="map-wrapper">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={branchCoords}
            zoom={14}
            onLoad={setMap}
            options={{
              zoomControl: true,
              streetViewControl: true,
              mapTypeControl: true,
              fullscreenControl: true
            }}
          >
            {/* Branch Marker */}
            <Marker
              position={branchCoords}
              title={branchName}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new window.google.maps.Size(40, 40)
              }}
            />
            
            {/* User Location Marker */}
            {userLocation && !showDirections && (
              <Marker
                position={userLocation}
                title="Your Location"
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                  scaledSize: new window.google.maps.Size(40, 40)
                }}
              />
            )}
            
            {/* Directions Renderer */}
            {directions && showDirections && (
              <DirectionsRenderer 
                directions={directions}
                options={{
                  suppressMarkers: false,
                  polylineOptions: {
                    strokeColor: '#4285f4',
                    strokeWeight: 4
                  }
                }}
              />
            )}

            {/* Info Window */}
            <InfoWindow
              position={branchCoords}
              onCloseClick={() => {}}
            >
              <div className="map-info-window">
                <strong>{branchName}</strong>
                <p>{branchAddress}</p>
                {routeInfo && (
                  <div className="route-info-mini">
                    <span>🚗 {routeInfo.distance}</span>
                    <span>⏱️ {routeInfo.duration}</span>
                  </div>
                )}
                <button 
                  onClick={handleOpenInGoogleMaps}
                  className="navigate-btn"
                >
                  Navigate →
                </button>
              </div>
            </InfoWindow>
          </GoogleMap>
        </div>
      )}

      {/* Route Information Display */}
      {routeInfo && showDirections && (
        <div className="route-info-card">
          <div className="route-info-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z"/>
            </svg>
            <div>
              <span className="route-label">Distance</span>
              <strong>{routeInfo.distance}</strong>
            </div>
          </div>
          <div className="route-info-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <div>
              <span className="route-label">Estimated Time</span>
              <strong>{routeInfo.duration}</strong>
            </div>
          </div>
        </div>
      )}

      {!userLocation && (
        <div className="location-prompt">
          <button onClick={getUserLocation} className="location-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M6.34 17.66l-2.83 2.83M17.66 6.34l2.83-2.83M4.93 19.07l2.83-2.83"/>
            </svg>
            Enable Location for Live Directions
          </button>
        </div>
      )}
    </div>
  );
};

export default BranchMap;