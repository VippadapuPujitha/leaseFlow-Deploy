import { useEffect, useState } from "react";
import { getAllProperties } from "../services/propertyService";
import PropertyCard from "../components/PropertyCard";
function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await getAllProperties();

      setProperties(response.data.properties);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <h1>All Properties</h1>

      {properties.map((property) => (
  <PropertyCard
    key={property._id}
    property={property}
  />
))}
    </div>
  );
}

export default Properties;