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
  const [selectedImage, setSelectedImage] = useState(0);

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
const nextImage = () => {
  setSelectedImage((prev) =>
    prev === property.images.length - 1 ? 0 : prev + 1
  );
};

const prevImage = () => {
  setSelectedImage((prev) =>
    prev === 0 ? property.images.length - 1 : prev - 1
  );
};
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
{/* Property Images */}

<div className="property-gallery mb-4">

  {property.images?.length > 0 ? (

    <>
<div className="main-image-container">

  <button
    type="button"
    className="gallery-arrow left"
    onClick={prevImage}
  >
    &#10094;
  </button>

  <img
    src={property.images[selectedImage]}
    alt={title}
    className="property-image-main"
  />

  <button
    type="button"
    className="gallery-arrow right"
    onClick={nextImage}
  >
    &#10095;
  </button>

</div>


      <div className="thumbnail-scroll">

        {property.images.map((image, index) => (

          <img
            key={index}
            src={image}
            alt={`Property ${index + 1}`}
            className={`thumbnail ${
              selectedImage === index ? "active-thumbnail" : ""
            }`}
            onClick={() => setSelectedImage(index)}
          />

        ))}

      </div>

    </>

  ) : (

    <div className="property-card__media property-image">
      <div className="display-6 fw-bold">
        No Images Available
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
{/* Lightbox */}
{showLightbox && (
  <div
    className="lightbox-overlay"
    onClick={() => setShowLightbox(false)}
  >
    <button
      className="lightbox-close"
      onClick={() => setShowLightbox(false)}
    >
      ✕
    </button>

    <button
      className="lightbox-prev"
      onClick={(e) => {
        e.stopPropagation();
        prevImage();
      }}
    >
      ❮
    </button>

    <img
      src={property.images[selectedImage]}
      alt="Property"
      className="lightbox-image"
      onClick={(e) => e.stopPropagation()}
    />

    <button
      className="lightbox-next"
      onClick={(e) => {
        e.stopPropagation();
        nextImage();
      }}
    >
      ❯
    </button>
  </div>
)}
    </div>
  );
  
}

export default PropertyDetail;