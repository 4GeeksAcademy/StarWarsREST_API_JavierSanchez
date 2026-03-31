import React from "react";
import { Link } from "react-router-dom";
import { useStore } from "../hooks/useGlobalReducer";

// Card component to display each Star Wars entity
export const EntityCard = ({ item, type }) => {
  const { store, dispatch } = useStore();

  // Check if item is already in favorites
  const isFavorite = store.favorites.some(
    (fav) => fav.uid === item.uid && fav.type === type,
  );

  // Toggle favorite status
  const handleToggleFavorite = () => {
    if (isFavorite) {
      dispatch({
        type: "REMOVE_FAVORITE",
        payload: { uid: item.uid, type },
      });
    } else {
      dispatch({
        type: "ADD_FAVORITE",
        payload: {
          uid: item.uid,
          name: item.name || item.title, // films use 'title' instead of 'name'
          type,
        },
      });
    }
  };

  // Get item name (films use 'title', others use 'name')
  const itemName = item.name || item.title;

  return (
    <div className="card flex-shrink-0" style={{ width: "18rem" }}>
      {/* Placeholder image - SWAPI doesn't provide images */}
      <div
        className="card-img-top bg-secondary d-flex align-items-center justify-content-center"
        style={{ height: "200px" }}
      >
        <span className="text-white fs-1"></span>
      </div>

      <div className="card-body">
        {/* Entity name/title with link to detail view */}
        <h5 className="card-title">
          <Link
            to={`/single/${type}/${item.uid}`}
            className="text-decoration-none text-dark"
          >
            {itemName}
          </Link>
        </h5>

        {/* Show some preview information based on type */}
        <p className="card-text text-muted small">
          {type === "people" && item.gender && `Gender: ${item.gender}`}
          {type === "planets" &&
            item.population &&
            `Population: ${item.population}`}
          {type === "starships" && item.model && `Model: ${item.model}`}
          {type === "vehicles" && item.model && `Model: ${item.model}`}
          {type === "films" && item.director && `Director: ${item.director}`}
          {type === "species" &&
            item.classification &&
            `Classification: ${item.classification}`}
        </p>

        <div className="d-flex justify-content-between align-items-center">
          {/* Link to detail view */}
          <Link
            to={`/single/${type}/${item.uid}`}
            className="btn btn-outline-primary btn-sm"
          >
            Learn more
          </Link>

          {/* Favorite button */}
          <button
            className={`btn btn-sm ${isFavorite ? "btn-warning" : "btn-outline-warning"}`}
            onClick={handleToggleFavorite}
          >
            {isFavorite ? "⭐" : "☆"}
          </button>
        </div>
      </div>
    </div>
  );
};
