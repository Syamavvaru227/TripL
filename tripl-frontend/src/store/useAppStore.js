import { create } from "zustand"

const useAppStore = create((set, get) => ({
  // Location & search
  searchCity: "",
  searchCoords: null,
  setSearchCity: (city) => set({ searchCity: city }),
  setSearchCoords: (coords) => set({ searchCoords: coords }),

  // Places
  places: [],
  filteredPlaces: [],
  selectedPlace: null,
  placesLoading: false,
  placesError: null,
  setPlaces: (places) => set({ places, filteredPlaces: places }),
  setFilteredPlaces: (fp) => set({ filteredPlaces: fp }),
  setSelectedPlace: (p) => set({ selectedPlace: p }),
  setPlacesLoading: (v) => set({ placesLoading: v }),
  setPlacesError: (e) => set({ placesError: e }),

  // Filters
  activeCategory: "all",
  maxDistance: 30,
  minRating: 0,
  openNow: false,
  budgetFriendly: false,
  setActiveCategory: (c) => set({ activeCategory: c }),
  setMaxDistance: (d) => set({ maxDistance: d }),
  setMinRating: (r) => set({ minRating: r }),
  setOpenNow: (v) => set({ openNow: v }),
  setBudgetFriendly: (v) => set({ budgetFriendly: v }),

  // Saved
  savedPlaces: [],
  savedItineraries: [],
  toggleSaved: (place) => set((s) => {
    const exists = s.savedPlaces.find((p) => p.id === place.id)
    return { savedPlaces: exists ? s.savedPlaces.filter((p) => p.id !== place.id) : [...s.savedPlaces, place] }
  }),
  isSaved: (id) => get().savedPlaces.some((p) => p.id === id),
  addSavedItinerary: (it) => set((s) => ({ savedItineraries: [it, ...s.savedItineraries] })),

  // Trail / Itinerary
  trailResult: null,
  trailLoading: false,
  trailError: null,
  setTrailResult: (r) => set({ trailResult: r }),
  setTrailLoading: (v) => set({ trailLoading: v }),
  setTrailError: (e) => set({ trailError: e }),

  // Map
  mapCenter: [17.6868, 83.2185],
  mapZoom: 12,
  setMapCenter: (c) => set({ mapCenter: c }),
  setMapZoom: (z) => set({ mapZoom: z }),
  hoveredPlaceId: null,
  setHoveredPlaceId: (id) => set({ hoveredPlaceId: id }),
}))

export default useAppStore
