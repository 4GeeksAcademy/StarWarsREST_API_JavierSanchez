import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useStore } from "../hooks/useGlobalReducer";

// Single entity detail view
export const Single = () => {
  const { store, dispatch } = useStore();
  const { type, uid } = useParams(); // Get type and uid from URL
  const [entity, setEntity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if entity is in favorites
  const isFavorite = store.favorites.some(
    (fav) => fav.uid === uid && fav.type === type,
  );

  // Fetch entity details from SWAPI
  useEffect(() => {
    const fetchEntityDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://www.swapi.tech/api/${type}/${uid}`,
        );

        if (!response.ok) {
          throw new Error("Entity not found");
        }

        const data = await response.json();
        setEntity(data.result);
      } catch (err) {
        console.error("Error fetching entity:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEntityDetails();
  }, [type, uid]);

  // Toggle favorite status
  const handleToggleFavorite = () => {
    if (isFavorite) {
      dispatch({
        type: "REMOVE_FAVORITE",
        payload: { uid, type },
      });
    } else {
      dispatch({
        type: "ADD_FAVORITE",
        payload: {
          uid,
          name: entity?.properties?.name || entity?.properties?.title,
          type,
        },
      });
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading entity details...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <hr />
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Render entity details
  const properties = entity?.properties || {};
  const entityName = properties.name || properties.title || "Unknown";

  return (
    <div className="container mt-4">
      {/* Header with name and favorite button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-4 text-capitalize">{entityName}</h1>
        <button
          className={`btn ${isFavorite ? "btn-warning" : "btn-outline-warning"} btn-lg`}
          onClick={handleToggleFavorite}
        >
          {isFavorite ? "⭐ Remove from Favorites" : "☆ Add to Favorites"}
        </button>
      </div>

      {/* Entity image placeholder */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div
            className="bg-secondary rounded d-flex align-items-center justify-content-center"
            style={{ height: "300px" }}
          >
            <span className="text-white" style={{ fontSize: "4rem" }}>
              🌌
            </span>
          </div>
        </div>

        {/* Entity description/info */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0 text-capitalize">{type} Information</h5>
            </div>
            <div className="card-body">
              <p className="text-muted">
                {entity?.description || "No description available."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* All properties in a table */}
      <div className="card">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0">Detailed Properties</h5>
        </div>
        <div className="card-body">
          <table className="table table-striped">
            <tbody>
              {Object.entries(properties).map(([key, value]) => (
                <tr key={key}>
                  <th className="text-capitalize" style={{ width: "30%" }}>
                    {key.replace(/_/g, " ")}
                  </th>
                  <td>
                    {Array.isArray(value)
                      ? value.length > 0
                        ? value.join(", ")
                        : "N/A"
                      : value || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Back button */}
      <div className="mt-4 mb-5">
        <Link to="/" className="btn btn-primary">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};
