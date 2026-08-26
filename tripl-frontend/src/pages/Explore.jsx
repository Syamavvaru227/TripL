import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { Map, List, Search, MapPin, Navigation, Loader2 } from "lucide-react"
import FilterPanel from "../components/explore/FilterPanel"
import MapView from "../components/explore/MapView"
import PlaceCard from "../components/explore/PlaceCard"
import LoadingMandala from "../components/ui/LoadingMandala"
import EmptyState from "../components/ui/EmptyState"
import { getNearbyPlaces, getNearbyPlacesByCoords } from "../api/places"
import useAppStore from "../store/useAppStore"

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
  const [params] = useSearchParams()
  const cityParam = params.get("city") || "Visakhapatnam"
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
    setPlacesLoading(true)
    setPlacesError(null)
    try {
      let res
      if (liveCoords) {
        res = await getNearbyPlacesByCoords(liveCoords[0], liveCoords[1], maxDistance)
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
    if (activeCategory !== "all") fp = fp.filter(p => p.category?.name?.toLowerCase().includes(activeCategory))
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
