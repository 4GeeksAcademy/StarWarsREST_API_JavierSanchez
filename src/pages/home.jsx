import React, { useEffect } from "react";
import { useStore } from "../hooks/useGlobalReducer";
import { HorizontalScroll } from "../components/HorizontalScroll";

export const Home = () => {
  const { store, dispatch } = useStore();

  // SWAPI categories to fetch
  const categories = [
    { name: "people", title: "Characters" },
    { name: "planets", title: "Planets" },
    { name: "starships", title: "Starships" },
    { name: "vehicles", title: "Vehicles" },
    { name: "films", title: "Films" },
    { name: "species", title: "Species" },
  ];

  // Fetch data from SWAPI for a specific category
  const fetchCategory = async (category) => {
    try {
      // Set loading state
      dispatch({
        type: "SET_LOADING",
        payload: { category, isLoading: true },
      });

      // Fetch data from SWAPI
      const response = await fetch(`https://www.swapi.tech/api/${category}`);
      const data = await response.json();

      // SWAPI returns paginated results, fetch all pages if needed
      if (data.results) {
        // For simplicity, we'll just use the first page (10 items)
        // In a real app, you'd want to fetch all pages or implement pagination

        // Fetch detailed information for each item
        const detailedItems = await Promise.all(
          data.results.map(async (item) => {
            try {
              const detailResponse = await fetch(item.url);
              const detailData = await detailResponse.json();
              return {
                uid: item.uid,
                ...detailData.result.properties,
              };
            } catch (error) {
              console.error(`Error fetching detail for ${item.name}:`, error);
              return { uid: item.uid, name: item.name };
            }
          }),
        );

        // Update store with fetched data
        dispatch({
          type: "SET_DATA",
          payload: { category, data: detailedItems },
        });
      }
    } catch (error) {
      console.error(`Error fetching ${category}:`, error);
    } finally {
      // Clear loading state
      dispatch({
        type: "SET_LOADING",
        payload: { category, isLoading: false },
      });
    }
  };

  // Fetch all categories on component mount
  useEffect(() => {
    categories.forEach(({ name }) => {
      // Only fetch if data doesn't exist yet
      if (store[name].length === 0 && !store.loading[name]) {
        fetchCategory(name);
      }
    });
  }, []); // Empty dependency array - only run once on mount

  return (
    <div className="container-fluid px-4">
      <div className="text-center my-4">
        <h1 className="display-4 fw-bold text-warning">Star Wars Universe</h1>
        <p className="lead text-muted">
          Explore characters, planets, starships, and more!
        </p>
      </div>

      {/* Render a horizontal scroll section for each category */}
      {categories.map(({ name, title }) => (
        <HorizontalScroll
          key={name}
          title={title}
          items={store[name]}
          type={name}
          loading={store.loading[name]}
        />
      ))}
    </div>
  );
};
