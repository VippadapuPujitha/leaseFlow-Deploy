import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import VerifiedStamp from "../components/VerifiedStamp";

function OwnerPropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await api.get(`/api/properties/${id}`);

        const data = res.data.property || res.data;

        setProperty(data);
      } catch (error) {
        console.log("Property fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);


  if (loading)
    return <div className="text-center py-5">Loading...</div>;

  if (!property)
    return <div className="alert alert-warning">Property not found</div>;


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

      <div className="page-title mb-1">
        {property.title}
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">

        <p className="page-subtitle">
          {property.address}, {property.city}
        </p>


        <button
          className="btn btn-secondary"
          onClick={() => navigate("/my-properties")}
        >
          Back to My Properties
        </button>

      </div>


      <div className="card-glass p-4 mb-4">


        {/* Images */}

        <div className="property-gallery mb-4">

          {property.images?.length > 0 ? (

            <>

            <div className="main-image-container">

              <button
                className="gallery-arrow left"
                onClick={prevImage}
              >
                &#10094;
              </button>


              <div className="image-wrapper">
                <img
                  src={property.images[selectedImage]}
                  className="property-image-main"
                  alt="property"
                />

                <VerifiedStamp verificationStatus={property?.verificationStatus} className="verified-stamp--overlay" />
              </div>

              <button
                className="gallery-arrow right"
                onClick={nextImage}
              >
                &#10095;
              </button>

            </div>



            <div className="thumbnail-scroll">

              {property.images.map((img,index)=>(

                <img
                  key={index}
                  src={img}
                  className={`thumbnail ${
                    selectedImage === index
                    ? "active-thumbnail"
                    : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                  alt="thumbnail"
                />

              ))}

            </div>

            </>

          ) : (

            <h4>No Images Available</h4>

          )}

        </div>



        {/* Description */}

        <div className="property-description-card">

          <h3>Property Description</h3>

          <p>
            {property.description ||
            "No description available"}
          </p>

        </div>



        {/* Details */}

        <div className="details-grid">


          <div className="details-card">
            <strong>Rent</strong>
            <p>
              ₹ {Number(property.rent).toLocaleString()}
            </p>
          </div>


          <div className="details-card">
            <strong>Bedrooms</strong>
            <p>{property.bedrooms}</p>
          </div>


          <div className="details-card">
            <strong>Bathrooms</strong>
            <p>{property.bathrooms}</p>
          </div>


          <div className="details-card">
            <strong>Square Feet</strong>
            <p>{property.squareFeet} sq ft</p>
          </div>


          <div className="details-card">
            <strong>Status</strong>
            <p>{property.rentalStatus}</p>
          </div>


          <div className="details-card">
            <strong>Available From</strong>
            <p>
              {property.availableFrom
              ? new Date(property.availableFrom)
                .toLocaleDateString()
              : "Immediate"}
            </p>
          </div>


        </div>


      </div>

    </div>
  );
}

export default OwnerPropertyDetail;
