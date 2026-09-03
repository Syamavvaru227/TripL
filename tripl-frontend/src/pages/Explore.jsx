import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Map, List, Search, MapPin, Navigation, Loader2 } from "lucide-react"
import FilterPanel from "../components/explore/FilterPanel"
import MapView from "../components/explore/MapView"
import PlaceCard from "../components/explore/PlaceCard"
import LoadingMandala from "../components/ui/LoadingMandala"
import EmptyState from "../components/ui/EmptyState"
import { getNearbyPlaces, getNearbyPlacesByCoords } from "../api/places"
import useAppStore from "../store/useAppStore"

const FAMOUS_DESTINATIONS = [
  { name: "Taj Mahal", city: "Agra", emoji: "🕌", rating: 4.8, gradient: "from-saffron to-terracotta",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=250&fit=crop",
    history: "Built by Emperor Shah Jahan in 1632-1653 as a mausoleum for his wife Mumtaz Mahal. A UNESCO World Heritage Site and one of the Seven Wonders of the World." },
  { name: "Jaipur", city: "Jaipur", emoji: "🏯", rating: 4.7, gradient: "from-terracotta to-saffron",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&h=250&fit=crop",
    history: "Founded in 1727 by Maharaja Sawai Jai Singh II. Known as the Pink City for its terracotta buildings. Home to Hawa Mahal, Amber Fort, and City Palace." },
  { name: "Varanasi", city: "Varanasi", emoji: "🛕", rating: 4.8, gradient: "from-indigo to-saffron",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400&h=250&fit=crop",
    history: "One of the oldest continuously inhabited cities in the world (5,000+ years). Sacred to Hindus — the Ganges ghats host spiritual rituals and evening aarti ceremonies." },
  { name: "Goa", city: "Goa", emoji: "🏖️", rating: 4.6, gradient: "from-peacock to-emerald",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=250&fit=crop",
    history: "Portuguese colony from 1510-1961. Blends Indian and Portuguese cultures — 400+ years of heritage churches, spice plantations, and golden beaches." },
  { name: "Hampi", city: "Hampi", emoji: "🏛️", rating: 4.7, gradient: "from-indigo to-peacock",
    image: "https://images.unsplash.com/photo-1590050752117-2c8b5e0e3d6e?w=400&h=250&fit=crop",
    history: "Ruins of the Vijayanagara Empire (1336-1646). Once one of the richest cities in the world. Over 1,600 surviving remains of temples, palaces, and markets." },
  { name: "Kerala Backwaters", city: "Alleppey", emoji: "🛶", rating: 4.7, gradient: "from-emerald to-peacock",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=250&fit=crop",
    history: "A network of 900+ km of waterways in Kerala. Houseboat cruises through lagoons, lakes, and canals fringed by coconut palms — God's Own Country." },
  { name: "Mysore Palace", city: "Mysore", emoji: "🏰", rating: 4.7, gradient: "from-saffron to-indigo",
    image: "https://images.unsplash.com/photo-1600112356915-089fbaa7f718?w=400&h=250&fit=crop",
    history: "Built in 1912 in Indo-Saracenic style for the Wadiyar dynasty. Illuminated with 97,000 light bulbs during Dasara festival — a royal spectacle." },
  { name: "Darjeeling", city: "Darjeeling", emoji: "🏔️", rating: 4.6, gradient: "from-emerald to-indigo",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=250&fit=crop",
    history: "Queen of the Himalayas — British hill station at 2,225m. Famous for Darjeeling tea, toy train (UNESCO), and sunrise views of Kanchenjunga." },
  { name: "Rajasthan Forts", city: "Jaipur", emoji: "⚔️", rating: 4.8, gradient: "from-terracotta to-indigo",
    image: "https://images.unsplash.com/photo-1599661046289-e31897833d08?w=400&h=250&fit=crop",
    history: "Rajasthan's Hill Forts are UNESCO sites — Chittorgarh, Kumbhalgarh, Amber, and more. Massive ramparts built by Rajput warriors over 1,000 years." },
]

const CITY_COORDS = {
  Visakhapatnam: [17.6868, 83.2185],
  Hyderabad: [17.3850, 78.4867],
  Goa: [15.2993, 74.1240],
  Jaipur: [26.9124, 75.7873],
  Mumbai: [19.0760, 72.8777],
  Delhi: [28.7041, 77.1025],
  Bangalore: [12.9716, 77.5946],
  Kolkata: [22.5726, 88.3639],
  Udaipur: [24.5854, 73.7125],
  Pondicherry: [11.9416, 79.8083],
}

export default function Explore() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const cityParam = params.get("city") || ""
  const latParam = params.get("lat")
  const lngParam = params.get("lng")
  const [viewMode, setViewMode] = useState("split") // "split"|"map"|"list"
  const initialSearch = latParam && lngParam ? `${parseFloat(latParam).toFixed(4)}, ${parseFloat(lngParam).toFixed(4)}` : cityParam
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [liveCoords, setLiveCoords] = useState(
    latParam && lngParam ? [parseFloat(latParam), parseFloat(lngParam)] : null
  )
  const [locationLoading, setLocationLoading] = useState(false)
  const { places, filteredPlaces, setPlaces, setFilteredPlaces, placesLoading, setPlacesLoading, placesError, setPlacesError, activeCategory, maxDistance, minRating, openNow } = useAppStore()
  const [computedCenter, setComputedCenter] = useState(null)
  const coords = liveCoords || CITY_COORDS[cityParam] || computedCenter || [17.6868, 83.2185]

  const loadPlaces = useCallback(async () => {
    if (!cityParam && !liveCoords) {
      setPlacesLoading(false)
      return
    }
    setPlacesLoading(true)
    setPlacesError(null)
    try {
      let res
      if (liveCoords) {
        res = await getNearbyPlacesByCoords(liveCoords[0], liveCoords[1], maxDistance, "", cityParam)
      } else {
        res = await getNearbyPlaces(cityParam, maxDistance)
      }
      setPlaces(res.data)
      setPlacesError(null)
      // Center map on returned places if city not in CITY_COORDS
      if (res.data?.length > 0 && !liveCoords && !CITY_COORDS[cityParam]) {
        const avgLat = res.data.reduce((s, p) => s + p.latitude, 0) / res.data.length
        const avgLon = res.data.reduce((s, p) => s + p.longitude, 0) / res.data.length
        setComputedCenter([avgLat, avgLon])
      }
    } catch (e) {
      if (!e.name?.includes('AbortError')) {
        setPlacesError("Could not load places. Is the backend running?")
      }
    } finally {
      setPlacesLoading(false)
    }
  }, [cityParam, maxDistance, liveCoords])

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLiveCoords([latitude, longitude])
        setSearchInput(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        setLocationLoading(false)
      },
      (error) => {
        setLocationLoading(false)
        let msg = "Unable to get your location."
        if (error.code === 1) msg = "Location access denied. Please allow location access in your browser settings."
        else if (error.code === 2) msg = "Location unavailable. Please try again."
        else if (error.code === 3) msg = "Location request timed out. Please try again."
        alert(msg)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }

  useEffect(() => { loadPlaces() }, [loadPlaces])

  const applyFilters = useCallback(() => {
    let fp = [...places]
    if (activeCategory === "other") {
      const known = ["heritage", "beach", "beaches", "nature", "religious", "viewpoint", "food", "cultural", "shopping", "family", "park", "parks"]
      fp = fp.filter(p => !p.category?.name || !known.includes(p.category.name.toLowerCase()))
    } else if (activeCategory !== "all") {
      fp = fp.filter(p => p.category?.name?.toLowerCase().includes(activeCategory))
    }
    if (minRating > 0) fp = fp.filter(p => p.rating >= minRating)
    if (openNow) fp = fp.filter(p => p.opening_time)
    setFilteredPlaces(fp)
  }, [places, activeCategory, minRating, openNow])

  useEffect(() => { applyFilters() }, [applyFilters])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchInput.trim()) return
    // If it looks like coordinates, search by location
    const coordMatch = searchInput.match(/([\d.-]+)\s*[,]\s*([\d.-]+)/)
    if (coordMatch) {
      setLiveCoords([parseFloat(coordMatch[1]), parseFloat(coordMatch[2])])
      window.location.href = `/explore?lat=${coordMatch[1]}&lng=${coordMatch[2]}`
    } else {
      setLiveCoords(null)
      window.location.href = `/explore?city=${encodeURIComponent(searchInput.trim())}`
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-ivory">
      {/* Top bar */}
      <div className="bg-white border-b border-border px-4 py-3 flex items-center gap-3 flex-wrap">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-0 max-w-sm">
          <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2 flex-1 bg-sand/50 focus-within:border-saffron transition-colors">
            <MapPin size={14} className="text-saffron shrink-0" />
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search city..." className="bg-transparent text-sm outline-none text-charcoal flex-1 min-w-0" />
            <button type="submit"><Search size={14} className="text-muted hover:text-saffron transition-colors" /></button>
          </div>
        </form>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={handleUseMyLocation} disabled={locationLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-saffron/10 text-saffron text-xs font-semibold hover:bg-saffron/20 transition-colors disabled:opacity-50">
            {locationLoading ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
            {locationLoading ? "Locating..." : "My Location"}
          </button>
          <span className="text-xs text-muted mx-1">{filteredPlaces.length} places</span>
          {[{ id: "split", icon: <><Map size={14}/><List size={14}/></> }, { id: "map", icon: <Map size={14}/> }, { id: "list", icon: <List size={14}/> }].map(v => (
            <button key={v.id} onClick={() => setViewMode(v.id)}
              className={`p-2 rounded-lg flex items-center gap-0.5 transition-colors ${viewMode === v.id ? "bg-saffron text-white" : "bg-sand text-muted hover:text-charcoal"}`}>
              {v.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Filter panel */}
        <div className={`shrink-0 w-64 hidden md:block ${viewMode === "map" ? "hidden" : ""}`}>
          <FilterPanel onFilterChange={applyFilters} />
        </div>

        {/* Map */}
        {viewMode !== "list" && (
          <div className={`flex-1 relative p-3 ${viewMode === "split" ? "max-w-[55%]" : ""} hidden md:block`} style={viewMode === "split" ? {} : {}}>
            {placesLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-sand rounded-xl"><LoadingMandala text="Loading map..." /></div>
            ) : (
              <MapView center={coords} places={filteredPlaces} />
            )}
          </div>
        )}

        {/* Cards list */}
        {viewMode !== "map" && (
          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            {placesLoading ? (
              <LoadingMandala text="Discovering places near you..." />
            ) : !cityParam && !liveCoords ? (
              <div className="p-4">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">🇮🇳</div>
                  <h2 className="font-display font-bold text-xl text-charcoal mb-1">Where do you want to explore?</h2>
                  <p className="text-muted text-sm">Type a city above or pick a famous destination below</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {FAMOUS_DESTINATIONS.map((d) => (
                    <button key={d.city} onClick={() => navigate(`/explore?city=${d.city}`)}
                      className="group text-left rounded-xl overflow-hidden border border-border hover:border-saffron/40 hover:shadow-lg transition-all duration-300">
                      <div className={`relative h-32 bg-gradient-to-br ${d.gradient} flex items-center justify-center overflow-hidden`}>                        <img src={d.image} alt={d.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={e => { e.target.style.display = "none" }} />
                        <span className="relative text-5xl group-hover:scale-110 transition-transform duration-300 z-10 drop-shadow-lg">{d.emoji}</span>
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-charcoal text-xs font-bold px-2 py-0.5 rounded-full">⭐ {d.rating}</div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-display font-semibold text-sm text-charcoal group-hover:text-saffron transition-colors">{d.name}</h3>
                        <p className="text-muted text-xs mt-0.5 line-clamp-2">{d.history}</p>
                        <span className="inline-block mt-2 text-saffron text-xs font-semibold">Explore →</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : placesError && filteredPlaces.length === 0 ? (
              <EmptyState icon="🌐" title="Backend not connected" description={placesError}
                action={<button onClick={loadPlaces} className="btn-primary text-sm">Retry</button>} />
            ) : filteredPlaces.length === 0 ? (
              <EmptyState icon="🔍" title="No places found" description="Try changing your filters or distance radius." />
            ) : (
              <div className={`grid gap-4 ${viewMode === "list" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                {filteredPlaces.map((p, i) => <PlaceCard key={p.id} place={p} index={i} />)}
              </div>
            )}
          </div>
        )}

        {/* Mobile: stacked map + cards */}
        <div className="md:hidden flex flex-col flex-1 overflow-hidden">
          <div className="h-56 p-2">
            {!placesLoading && <MapView center={coords} places={filteredPlaces} />}
          </div>
          <div className="flex-1 overflow-y-auto p-3 scrollbar-hide">
            {placesLoading ? (
              <LoadingMandala text="Finding places..." />
            ) : !cityParam && !liveCoords ? (
              <div className="p-3">
                <div className="text-center mb-4">
                  <div className="text-3xl mb-1">🇮🇳</div>
                  <h3 className="font-display font-semibold text-charcoal text-sm">Pick a destination</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {FAMOUS_DESTINATIONS.map((d) => (
                    <button key={d.city} onClick={() => navigate(`/explore?city=${d.city}`)}
                      className="group text-left rounded-xl overflow-hidden border border-border hover:border-saffron/40 transition-all">
                      <div className={`h-20 bg-gradient-to-br ${d.gradient} flex items-center justify-center`}>                        <span className="text-3xl group-hover:scale-110 transition-transform">{d.emoji}</span>
                      </div>
                      <div className="p-2">
                        <h3 className="font-semibold text-xs text-charcoal group-hover:text-saffron">{d.name}</h3>
                        <p className="text-muted text-[10px] line-clamp-1 mt-0.5">{d.history}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : placesError && filteredPlaces.length === 0 ? (
              <EmptyState icon="🌐" title="Backend not connected" description={placesError}
                action={<button onClick={loadPlaces} className="btn-primary text-sm">Retry</button>} />
            ) : (
              filteredPlaces.map((p, i) => <div key={p.id} className="mb-3"><PlaceCard place={p} index={i} /></div>)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
