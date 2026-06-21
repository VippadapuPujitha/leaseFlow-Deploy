import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await api.get(`/api/properties/${id}`);
        const data = response.data;
        setProperty(data.property || data || null);
      } catch (err) {
        setError('Unable to load property details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) return <div className="text-center py-5">Loading property details...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!property) return <div className="alert alert-warning">No property found.</div>;

  const title = property.title || property.name || 'Property details';
  const subtitle = property.location || property.address || 'Location unavailable';

  const fetchNearbyPlaces = async (type) => {
    if (!property.latitude || !property.longitude) return;

    setLoadingPlaces(true);

    try {
      const service = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );

      const location = new window.google.maps.LatLng(
        Number(property.latitude),
        Number(property.longitude)
      );

      const request = {
        location,
        radius: 1500,
        type
      };

      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setNearbyPlaces(results);
        } else {
          setNearbyPlaces([]);
        }
        setLoadingPlaces(false);
      });

    } catch (err) {
      setLoadingPlaces(false);
    }
  };
console.log("Latitude:", property.latitude);
console.log("Longitude:", property.longitude);
console.log("Property:", property);
console.log(property);
  return (
    <div className="mb-4">

      <div className="page-title mb-1">{title}</div>
      <p className="page-subtitle mb-4">{subtitle}</p>

      {/* MAIN CARD */}
      <div className="card-glass p-4 mb-4">
        <div className="row gy-4">

          {/* LEFT SIDE */}
          <div className="col-lg-7">
            <div className="property-card__media mb-4">
              {property.images ?.length>0? (
                <img
                  src={`http://localhost:5000/uploads/images/${property.images[0].split("\\").pop()}`}
                  alt={title}
                  className="img-fluid rounded-4"
                />
              ) : (
                <div className="display-6 fw-bold">
                  {title.split(' ').slice(0, 3).join(' ')}
                </div>
              )}
            </div>

            <h3 className="h5 mb-3">Property Description</h3>
            <p className="text-muted">
              {property.description || 'No description available.'}
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div className="col-lg-5">

            <div className="details-card mb-3">
              <strong>Price</strong>
              <p>
                {property.price || property.rent
                  ? `$${property.price || property.rent}`
                  : 'N/A'}
              </p>
            </div>

            <div className="details-card mb-3">
              <strong>Status</strong>
              <p>{property.status || 'Available'}</p>
            </div>

            <div className="details-card mb-3">
              <strong>Bedrooms</strong>
              <p>{property.bedrooms ?? '—'}</p>
            </div>

            <div className="details-card mb-3">
              <strong>Bathrooms</strong>
              <p>{property.bathrooms ?? '—'}</p>
            </div>

            <div className="details-card mb-3">
              <strong>Property Type</strong>
              <p>{property.propertyType || property.type || 'Residential'}</p>
            </div>

            <div className="details-card mb-3">
              <strong>Area</strong>
              <p>{property.area ? `${property.area} sqft` : 'N/A'}</p>
            </div>

            <div className="details-card mb-3">
              <strong>Available from</strong>
              <p>{property.availableDate || 'Immediate'}</p>
            </div>

            <div className="details-card mb-3">
              <strong>Verification Status</strong>
              <p>{property.verificationStatus || 'Pending'}</p>
            </div>

            <div className="details-card mb-3">
              <strong>Rental Status</strong>
              <p>{property.rentalStatus || 'Available'}</p>
            </div>
                <button
  className="btn btn-secondary mt-3"
  onClick={() => navigate("/tenant-dashboard")}
>
  Back to Browse Properties
</button>
          </div>
        </div>
      </div>
      {/* GOOGLE MAPS BUTTON */}
  {property.latitude && property.longitude && (
  <div className="mt-4">
    <a
      href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
      target="_blank"
      rel="noreferrer"
      className="btn btn-primary"
    >
      View on Google Maps
    </a>
  </div>
)}
      {/* MAP SECTION */}
      {/*{property.latitude && property.longitude && (
        <div className="mt-4">

          <a
            href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary mb-3"
          >
            View on Google Maps
          </a>

          <h5>Location</h5>

          <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={{
                width: "100%",
                height: "300px",
                borderRadius: "8px"
              }}
              center={{
                lat: Number(property.latitude),
                lng: Number(property.longitude)
              }}
              zoom={14}
            >
              <Marker
                position={{
                  lat: Number(property.latitude),
                  lng: Number(property.longitude)
                }}
              />
            </GoogleMap>
          </LoadScript>

          <a
            className="btn btn-primary mt-3"
            href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
            target="_blank"
            rel="noreferrer"
          >
            Get Directions
          </a>
        </div>
      )}*/}

      {/* NEARBY PLACES */}
      {/*{property.latitude && property.longitude && (
        <div className="mt-4">
          <h5>Nearby Places</h5>

          <div className="d-flex gap-2 flex-wrap mb-3">
            <button className="btn btn-outline-primary btn-sm" onClick={() => fetchNearbyPlaces("school")}>
              Schools
            </button>

            <button className="btn btn-outline-danger btn-sm" onClick={() => fetchNearbyPlaces("hospital")}>
              Hospitals
            </button>

            <button className="btn btn-outline-success btn-sm" onClick={() => fetchNearbyPlaces("restaurant")}>
              Restaurants
            </button>

            <button className="btn btn-outline-dark btn-sm" onClick={() => fetchNearbyPlaces("bank")}>
              Banks
            </button>
          </div>

          {loadingPlaces && <p>Loading nearby places...</p>}

          {nearbyPlaces.length > 0 && (
            <ul className="list-group">
              {nearbyPlaces.map((place, index) => (
                <li key={index} className="list-group-item">
                  <strong>{place.name}</strong>
                  <br />
                  <small>{place.vicinity}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}*/}

    </div>
  );
}

export default PropertyDetail;