import React from "react";
import { Link } from "react-router-dom";
import { useStore } from "../hooks/useGlobalReducer";

export const Navbar = () => {
  const { store, dispatch } = useStore();

  // Remove item from favorites
  const handleRemoveFavorite = (uid, type) => {
    dispatch({
      type: "REMOVE_FAVORITE",
      payload: { uid, type },
    });
  };

  return (
    <nav className="navbar navbar-dark bg-dark mb-4">
      <div className="container-fluid">
        {/* Star Wars Logo */}
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img
            src="https://1000logos.net/wp-content/uploads/2017/06/Star-Wars-Logo-1.png"
            alt="Star Wars logo"
            style={{ height: "50px", objectFit: "contain" }}
          />
        </Link>

        {/* Favorites Dropdown */}
        <div className="dropdown">
          <button
            className="btn btn-warning dropdown-toggle"
            type="button"
            id="favoritesDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Favorites
            <span className="badge bg-danger ms-2">
              {store.favorites.length}
            </span>
          </button>

          <ul
            className="dropdown-menu dropdown-menu-end"
            aria-labelledby="favoritesDropdown"
            style={{ minWidth: "300px", maxHeight: "400px", overflowY: "auto" }}
          >
            {store.favorites.length === 0 ? (
              <li>
                <span className="dropdown-item text-muted">
                  No favorites yet
                </span>
              </li>
            ) : (
              store.favorites.map((fav, index) => (
                <li
                  key={`${fav.type}-${fav.uid}-${index}`}
                  className="dropdown-item d-flex justify-content-between align-items-center"
                >
                  {/* Link to detail page */}
                  <Link
                    to={`/single/${fav.type}/${fav.uid}`}
                    className="text-decoration-none text-dark flex-grow-1"
                  >
                    <span className="badge bg-secondary me-2">{fav.type}</span>
                    {fav.name}
                  </Link>

                  {/* Remove button */}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleRemoveFavorite(fav.uid, fav.type)}
                  >
                    🗑️
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};
