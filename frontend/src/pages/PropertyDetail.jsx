import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requested, setRequested] = useState(false);

  const handleSendRequest = async () => {
  try {
    await api.post("/api/requests/send", {
      propertyId: property._id,
    });

    setRequested(true);
  } catch (error) {
    alert(
      error.response?.data?.message ||
      "Unable to send request."
    );
  }
};
useEffect(() => {
  const fetchProperty = async () => {
    try {
      const response = await api.get(`/api/properties/${id}`);
      const data = response.data;
      const propertyData = data.property || data || null;

      setProperty(propertyData);

      const requestResponse = await api.get("/api/requests/my-requests");

      const alreadyRequested = requestResponse.data.requests?.some(
        (request) => request.property?._id === propertyData?._id
      );

      setRequested(alreadyRequested);
    } catch (err) {
      setError("Unable to load property details.");
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
  const subtitle =
  `${property.address || ""}${property.city ? `, ${property.city}` : ""}` ||
  "Location unavailable";

  return (
    <div className="mb-4">

      <div className="page-title mb-1">{title}</div>
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
  <p className="page-subtitle mb-0">{subtitle}</p>

  {property.latitude && property.longitude && (
    <a
      href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
      target="_blank"
      rel="noreferrer"
      className="btn btn-outline-primary btn-sm"
    >
      📍 View on Maps
    </a>
  )}
</div>
    {/* MAIN CARD */}
<div className="card-glass p-4 mb-4">

  {/* Property Image */}
  <div className="mb-4">
    {property.images?.length > 0 ? (
      <img
        src={property.images[0]}
        alt={title}
        className="property-image"
      />
    ) : (
      <div className="property-card__media property-image">
        <div className="display-6 fw-bold">
          {title.split(" ").slice(0, 3).join(" ")}
        </div>
      </div>
    )}
  </div>

  {/* Description */}
  <div className="property-description-card">
    <h3>Property Description</h3>
    <p>{property.description || "No description available."}</p>
  </div>

  {/* Property Details */}
  <div className="details-grid">

    <div className="details-card">
      <strong>Price</strong>
      <p>
  {property.price || property.rent
    ? `₹ ${Number(property.price || property.rent).toLocaleString()}`
    : "N/A"}
</p>
    </div>

    <div className="details-card">
      <strong>Bedrooms</strong>
      <p>{property.bedrooms ?? "—"}</p>
    </div>

    <div className="details-card">
      <strong>Bathrooms</strong>
      <p>{property.bathrooms ?? "—"}</p>
    </div>

    <div className="details-card">
      <strong>Square Feet</strong>
      <p>{property.squareFeet ?? "—"} sq ft</p>
    </div>

    <div className="details-card">
      <strong>Property Type</strong>
      <p>{property.propertyType || property.type || "Residential"}</p>
    </div>

      <div className="details-card">
  <strong>Status</strong>
  <p>
    <span
      className={`badge ${
        property.status === "Available"
          ? "bg-success"
          : "bg-secondary"
      }`}
    >
      {property.status || "Available"}
    </span>
  </p>
</div>

<div className="details-card">
  <strong>Available From</strong>
  <p>
    {property.availableFrom
      ? new Date(property.availableFrom).toLocaleDateString()
      : "Immediate"}
  </p>
</div>

<div className="details-card">
  <strong>Verification</strong>
  <p>
    <span
      className={`badge ${
        property.verificationStatus === "Approved"
          ? "bg-success"
          : property.verificationStatus === "Rejected"
          ? "bg-danger"
          : "bg-warning text-dark"
      }`}
    >
      {property.verificationStatus || "Pending"}
    </span>
  </p>
</div>

<div className="details-card">
  <strong>Rental Status</strong>
  <p>
    <span
      className={`badge ${
        property.rentalStatus === "Available"
          ? "bg-success"
          : property.rentalStatus === "Occupied"
          ? "bg-danger"
          : "bg-secondary"
      }`}
    >
      {property.rentalStatus || "Available"}
    </span>
  </p>
</div>
</div>

  {/* Buttons */}
  <div className="property-buttons">

    <button
      className="btn btn-primary"
      onClick={handleSendRequest}
      disabled={requested}
    >
      {requested ? "Requested ✅" : "Request Property"}
    </button>

    <button
      className="btn btn-secondary"
      onClick={() => navigate("/tenant-dashboard")}
    >
      Back to Browse Properties
    </button>

  </div>

</div>

    </div>
  );
}

export default PropertyDetail;