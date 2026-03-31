import React from "react";
import { EntityCard } from "./EntityCard";

// Component to display a horizontal scrollable section of entities
export const HorizontalScroll = ({ title, items, type, loading }) => {
  return (
    <div className="mb-5">
      {/* Section title */}
      <h2 className="text-capitalize mb-3">
        {title}
        {loading && (
          <span
            className="spinner-border spinner-border-sm ms-3"
            role="status"
            aria-hidden="true"
          ></span>
        )}
      </h2>

      {/* Horizontal scrollable container */}
      <div
        className="d-flex gap-3 overflow-auto pb-3"
        style={{
          scrollBehavior: "smooth",
          msOverflowStyle: "none", // Hide scrollbar for IE and Edge
          scrollbarWidth: "thin", // Firefox
        }}
      >
        {loading ? (
          // Loading placeholder cards
          [...Array(5)].map((_, index) => (
            <div
              key={`loading-${index}`}
              className="card flex-shrink-0 placeholder-glow"
              style={{ width: "18rem" }}
            >
              <div
                className="card-img-top bg-secondary"
                style={{ height: "200px" }}
              ></div>
              <div className="card-body">
                <h5 className="card-title placeholder col-6"></h5>
                <p className="card-text placeholder col-8"></p>
                <div className="d-flex justify-content-between">
                  <span className="placeholder col-4"></span>
                  <span className="placeholder col-2"></span>
                </div>
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          // No items found
          <div className="alert alert-info">No {title.toLowerCase()} found</div>
        ) : (
          // Render entity cards
          items.map((item) => (
            <EntityCard key={`${type}-${item.uid}`} item={item} type={type} />
          ))
        )}
      </div>
    </div>
  );
};
