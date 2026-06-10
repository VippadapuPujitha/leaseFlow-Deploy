function PropertyCard({ property }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "15px",
        margin: "10px",
        borderRadius: "8px"
      }}
    >
      <h3>{property.title}</h3>

      <p>
        <strong>Rent:</strong> ₹{property.rent}
      </p>

      <p>
        <strong>Address:</strong> {property.address}
      </p>

      <p>
        <strong>Type:</strong> {property.propertyType}
      </p>

      <button>View Details</button>
    </div>
  );
}

export default PropertyCard;