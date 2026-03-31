// Initial store state - loads favorites from localStorage if available
export const initialStore = () => {
  const savedFavorites = localStorage.getItem("starwars_favorites");

  return {
    // SWAPI data organized by category
    people: [],
    planets: [],
    starships: [],
    vehicles: [],
    films: [],
    species: [],

    // Favorites list - persisted in localStorage
    favorites: savedFavorites ? JSON.parse(savedFavorites) : [],

    // Loading states for each category
    loading: {
      people: false,
      planets: false,
      starships: false,
      vehicles: false,
      films: false,
      species: false,
    },
  };
};

// Reducer function to handle state updates
export default function storeReducer(store, action = {}) {
  let newStore;

  switch (action.type) {
    // Set data for a specific category
    case "SET_DATA":
      return {
        ...store,
        [action.payload.category]: action.payload.data,
      };

    // Set loading state for a category
    case "SET_LOADING":
      return {
        ...store,
        loading: {
          ...store.loading,
          [action.payload.category]: action.payload.isLoading,
        },
      };

    // Add item to favorites
    case "ADD_FAVORITE":
      newStore = {
        ...store,
        favorites: [...store.favorites, action.payload],
      };
      // Save to localStorage
      localStorage.setItem(
        "starwars_favorites",
        JSON.stringify(newStore.favorites),
      );
      return newStore;

    // Remove item from favorites
    case "REMOVE_FAVORITE":
      newStore = {
        ...store,
        favorites: store.favorites.filter(
          (fav) =>
            !(
              fav.uid === action.payload.uid && fav.type === action.payload.type
            ),
        ),
      };
      // Save to localStorage
      localStorage.setItem(
        "starwars_favorites",
        JSON.stringify(newStore.favorites),
      );
      return newStore;

    default:
      throw Error("Unknown action: " + action.type);
  }
}
