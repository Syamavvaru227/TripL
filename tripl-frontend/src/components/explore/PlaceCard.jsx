import { motion } from "framer-motion"
import { Bookmark, BookmarkCheck, Clock, MapPin, Navigation, Star } from "lucide-react"
import { useNavigate } from "react-router-dom"
import useAppStore from "../../store/useAppStore"
import Badge from "../ui/Badge"
import { showToast } from "../ui/Toast"

const CAT_COLORS = { heritage: "terracotta", beach: "peacock", nature: "emerald", religious: "saffron", park: "emerald", food: "saffron", cultural: "peacock", viewpoint: "peacock", family: "emerald", shopping: "terracotta", other: "muted" }
const CAT_EMOJI = { heritage: "🏛️", beach: "🏖️", nature: "🌳", religious: "🛕", park: "🌿", food: "🍛", cultural: "🎭", viewpoint: "🏞️", family: "👨‍👩‍👧", shopping: "🛍️", other: "📌" }
const PLACEHOLDER_GRADIENTS = ["from-peacock/80 to-indigo", "from-saffron/80 to-terracotta", "from-emerald/80 to-peacock", "from-terracotta/80 to-saffron", "from-indigo/80 to-peacock"]

export default function PlaceCard({ place, index = 0 }) {
  const navigate = useNavigate()
  const { isSaved, toggleSaved } = useAppStore()
  const saved = isSaved(place.id)
  const catKey = place.category?.name?.toLowerCase() || "heritage"
  const catColor = CAT_COLORS[catKey] || "muted"
  const catEmoji = CAT_EMOJI[catKey] || "📍"
  const gradient = PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length]

  const handleSave = (e) => {
    e.stopPropagation()
    toggleSaved(place)
    showToast(saved ? "Removed from saved" : "Saved to your places!", saved ? "info" : "success")
  }

  return (
    <motion.div
      className="card cursor-pointer group"
      onClick={() => navigate(`/place/${place.id}?name=${encodeURIComponent(place.name)}&city=${encodeURIComponent(place.city || '')}&cat=${encodeURIComponent(catKey)}&lat=${place.latitude || ''}&lng=${place.longitude || ''}${place.image_url ? '&img=' + encodeURIComponent(place.image_url) : ''}`, { state: { place } })}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
      whileHover={{ y: -3, boxShadow: "0 10px 36px rgba(28,25,23,0.10)" }}
      layout
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        {place.image_url ? (
          <img src={place.image_url} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex" }} />
        ) : null}
        <div className={`bg-gradient-to-br ${gradient} w-full h-full ${place.image_url ? "hidden" : "flex"} items-end p-4`}>
          <span className="text-4xl opacity-80">{catEmoji}</span>
        </div>
        <button onClick={handleSave} className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow transition-all hover:scale-110">
          {saved ? <BookmarkCheck size={16} className="text-saffron" /> : <Bookmark size={16} className="text-muted" />}
        </button>
        <div className="absolute bottom-3 left-3">
          <Badge color={catColor}>{catEmoji} {place.category?.name || "Place"}</Badge>
        </div>
      </div>
      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-semibold text-charcoal text-base leading-tight group-hover:text-saffron transition-colors">{place.name}</h3>
          <div className="flex items-center gap-0.5 shrink-0">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-sm font-semibold text-charcoal">{place.rating?.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-muted text-xs mb-3 line-clamp-2">{place.description || "A wonderful destination to visit in this area."}</p>
        <div className="flex items-center gap-3 text-xs text-muted flex-wrap">
          <span className="flex items-center gap-1"><MapPin size={11} className="text-saffron" />{place.distance_km?.toFixed(1)} km</span>
          <span className="flex items-center gap-1"><Navigation size={11} className="text-peacock" />~{Math.round((place.distance_km || 5) / 30 * 40 + 10)} min</span>
          {place.opening_time && <span className="flex items-center gap-1"><Clock size={11} className="text-emerald" />{place.opening_time}–{place.closing_time}</span>}
          {place.entry_fee === 0 && <span className="text-emerald font-medium">Free Entry</span>}
          {place.entry_fee > 0 && <span>₹{place.entry_fee}</span>}
        </div>
        {place.crowded_level && (
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              place.crowded_level === 'High' ? 'bg-red-50 text-red-600' :
              place.crowded_level === 'Medium' ? 'bg-amber-50 text-amber-600' :
              'bg-emerald-50 text-emerald-600'
            }`}>👥 {place.crowded_level} crowd</span>
            {place.best_time && <span className="text-[10px] text-muted">✨ Best: {place.best_time}</span>}
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-border flex gap-2">
          <button onClick={e => { e.stopPropagation(); navigate(`/place/${place.id}?name=${encodeURIComponent(place.name)}&city=${encodeURIComponent(place.city || '')}&cat=${encodeURIComponent(catKey)}&lat=${place.latitude || ''}&lng=${place.longitude || ''}${place.image_url ? '&img=' + encodeURIComponent(place.image_url) : ''}`, { state: { place } }) }}
            className="flex-1 bg-saffron/10 text-saffron text-xs font-semibold py-2 rounded-lg hover:bg-saffron hover:text-white transition-colors">
            Explore Destination
          </button>
          <button onClick={e => { e.stopPropagation(); navigate(`/plan?city=${place.city}`) }}
            className="px-3 py-2 border border-border rounded-lg hover:border-saffron/50 transition-colors">
            <Navigation size={14} className="text-muted" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
