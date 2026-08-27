import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useNavigate } from "react-router-dom"
import useAppStore from "../../store/useAppStore"

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png", iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png" })

const CAT_COLORS = { heritage: "#C2410C", beach: "#006B75", nature: "#15803D", religious: "#E8621A", park: "#15803D", food: "#E8621A", cultural: "#006B75", viewpoint: "#1E1B4B", family: "#15803D", shopping: "#C2410C" }
const CAT_EMOJI = { heritage: "🏛️", beach: "🏖️", nature: "🌳", religious: "🛕", park: "🌿", food: "🍛", cultural: "🎭", viewpoint: "🏞️", family: "👨‍👩‍👧", shopping: "🛍️" }

const createCustomIcon = (color, emoji, isHovered) => L.divIcon({
  html: `<div style="background:${color};width:${isHovered?44:36}px;height:${isHovered?44:36}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,0.3);border:2px solid white;transition:all 0.2s">
    <span style="transform:rotate(45deg);font-size:${isHovered?18:14}px;line-height:1">${emoji}</span>
  </div>`,
  className: "", iconSize: [isHovered?44:36, isHovered?44:36], iconAnchor: [isHovered?22:18, isHovered?44:36], popupAnchor: [0, -(isHovered?44:36)]
})

const userIcon = L.divIcon({
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#E8621A;border:3px solid white;box-shadow:0 0 0 4px rgba(232,98,26,0.3)"></div>`,
  className: "", iconSize: [16, 16], iconAnchor: [8, 8]
})

function MapUpdater({ center, zoom }) {
  const map = useMap()
  const prevCenter = useRef(null)
  useEffect(() => {
    if (!prevCenter.current) {
      // First render: jump directly to correct center
      try { map.setView(center, zoom, { animate: false }) } catch {}
    } else {
      // Subsequent changes: smooth fly
      try { map.flyTo(center, zoom, { duration: 1.5 }) } catch {}
    }
    prevCenter.current = center
  }, [center, zoom, map])
  return null
}

export default function MapView({ center, places, onPlaceClick }) {
  const navigate = useNavigate()
  const { hoveredPlaceId } = useAppStore()
  const validCenter = center && isFinite(center[0]) && isFinite(center[1]) && center[0] !== 0 ? center : [16.3067, 80.4365]

  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <MapContainer center={validCenter} zoom={13} style={{ width: "100%", height: "100%" }} zoomControl={false}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapUpdater center={validCenter} zoom={13} />
        {/* User location */}
        <Marker position={validCenter} icon={userIcon}>
          <Popup><div className="p-2 text-sm font-medium text-charcoal">📍 Your Location</div></Popup>
        </Marker>
        {/* 30km radius circle */}
        <Circle center={validCenter} radius={30000} pathOptions={{ color: "#E8621A", fillColor: "#E8621A", fillOpacity: 0.03, weight: 1, dashArray: "6 6" }} />
        {/* Place markers */}
        {places.filter(p => p.latitude && p.longitude && isFinite(p.latitude) && isFinite(p.longitude) && p.latitude > -90 && p.latitude < 90 && p.longitude > -180 && p.longitude < 180).map((place) => {
          const catKey = (place.category?.name || place.category_name || "heritage").toLowerCase()
          const color = CAT_COLORS[catKey] || "#E8621A"
          const emoji = CAT_EMOJI[catKey] || "📍"
          const isHovered = hoveredPlaceId === place.id
          return (
            <Marker key={place.id} position={[place.latitude, place.longitude]}
              icon={createCustomIcon(color, emoji, isHovered)}
              eventHandlers={{ click: () => { onPlaceClick?.(place); navigate(`/place/${place.id}`) } }}>
              <Popup>
                <div className="p-3 min-w-[180px]">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <p className="font-semibold text-charcoal text-sm leading-tight">{place.name}</p>
                      <p className="text-muted text-xs">{place.category?.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs text-muted mb-2">
                    <span>⭐ {place.rating?.toFixed(1)}</span>
                    <span>📍 {place.distance_km?.toFixed(1)} km</span>
                  </div>
                  <button onClick={() => navigate(`/place/${place.id}`)}
                    className="w-full bg-saffron text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-saffron-dark transition-colors">
                    Explore →
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
