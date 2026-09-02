import { useEffect, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Bookmark, BookmarkCheck, MapPin, Clock, Star, DollarSign, Share2 } from "lucide-react"
import { getPlaceById } from "../api/places"
import TransportComparison from "../components/place/TransportComparison"
import RideBooking from "../components/place/RideBooking"
import KnowIndiaTab from "../components/place/KnowIndiaTab"
import LocalExperiences from "../components/place/LocalExperiences"
import LoadingMandala from "../components/ui/LoadingMandala"
import Badge from "../components/ui/Badge"
import useAppStore from "../store/useAppStore"
import { showToast } from "../components/ui/Toast"

const CITY_COORDS = { Visakhapatnam: [17.6868, 83.2185], Hyderabad: [17.3850, 78.4867], Goa: [15.2993, 74.1240], Jaipur: [26.9124, 75.7873] }
const PLACEHOLDER_GRADIENTS = ["from-peacock to-indigo", "from-saffron to-terracotta", "from-emerald to-peacock", "from-terracotta to-saffron", "from-indigo to-peacock"]
const CAT_EMOJI = { heritage: "🏛️", beach: "🏖️", nature: "🌳", religious: "🛕", park: "🌿", food: "🍛", cultural: "🎭", viewpoint: "🏞️", family: "👨‍👩‍👧", shopping: "🛍️",newspots: "🛍️" }
const CAT_COLORS = { heritage: "terracotta", beach: "peacock", nature: "emerald", religious: "saffron", park: "emerald", food: "saffron", cultural: "peacock", viewpoint: "indigo", family: "emerald", shopping: "terracotta" }

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "transport", label: "🚗 Get There" },
  { id: "know-india", label: "🏛️ Know India" },
  { id: "experiences", label: "🎭 Experiences" },
]

export default function PlaceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("overview")
  const { isSaved, toggleSaved } = useAppStore()

  useEffect(() => {
    // If place data was passed via state (real-time places), use it directly
    if (location.state?.place) {
      setPlace(location.state.place)
      setLoading(false)
      return
    }
    // If negative ID with name query param, construct a basic place object
    const nameParam = new URLSearchParams(location.search).get("name")
    if (parseInt(id) < 0 && nameParam) {
      setPlace({
        id: parseInt(id),
        name: nameParam,
        description: "",
        city: "",
        latitude: 0,
        longitude: 0,
        rating: 4.0,
        avg_visit_duration: 60,
        entry_fee: 0,
        opening_time: null,
        closing_time: null,
        image_url: null,
        category: { name: "Heritage", icon: "🏛️", color: "#C2410C" },
      })
      setLoading(false)
      return
    }
    setLoading(true)
    getPlaceById(id)
      .then(r => setPlace(r.data))
      .catch(() => setPlace(null))
      .finally(() => setLoading(false))
  }, [id, location.state, location.search])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingMandala text="Loading destination..." /></div>
  if (!place) return (
    <div className="min-h-screen bg-ivory">
      <div className="sticky top-0 z-50 bg-white border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-sand transition-colors">
          <ArrowLeft size={20} className="text-charcoal" />
        </button>
        <span className="font-display font-semibold text-charcoal">Place Details</span>
      </div>
      <div className="flex flex-col items-center justify-center gap-4 py-20 px-4">
        <p className="text-6xl">🗺️</p>
        <h2 className="font-display font-bold text-2xl text-charcoal">Place not found</h2>
        <p className="text-muted text-sm text-center max-w-xs">This place data isn't available right now. Try exploring nearby destinations instead.</p>
        <div className="flex gap-3">
          <button onClick={() => navigate(-1)} className="btn-secondary text-sm">Go Back</button>
          <button onClick={() => navigate("/explore")} className="btn-primary text-sm">Explore Places</button>
        </div>
      </div>
    </div>
  )

  const saved = isSaved(place.id)
  const catKey = place.category?.name?.toLowerCase() || "heritage"
  const catEmoji = CAT_EMOJI[catKey] || "📍"
  const catColor = CAT_COLORS[catKey] || "muted"
  const gradient = PLACEHOLDER_GRADIENTS[Math.abs(place.id) % PLACEHOLDER_GRADIENTS.length]
  const cityCoords = CITY_COORDS[place.city] || [17.6868, 83.2185]

  return (
    <div className="min-h-screen bg-ivory pb-20">
      {/* Hero */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        {place.image_url ? (
          <img src={place.image_url} alt={place.name} className="w-full h-full object-cover" onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex" }} />
        ) : null}
        <div className={`bg-gradient-to-br ${gradient} w-full h-full ${place.image_url ? "hidden" : "flex"} items-center justify-center`}>
          <span className="text-8xl opacity-60">{catEmoji}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        {/* Nav */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/20 backdrop-blur border border-white/30 hover:bg-white/30 transition-colors">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => { toggleSaved(place); showToast(saved ? "Removed from saved" : "Saved!", saved ? "info" : "success") }}
              className="p-2 rounded-xl bg-white/20 backdrop-blur border border-white/30 hover:bg-white/30 transition-colors">
              {saved ? <BookmarkCheck size={20} className="text-saffron" /> : <Bookmark size={20} className="text-white" />}
            </button>
            <button onClick={() => navigator.share?.({ title: place.name, url: window.location.href })}
              className="p-2 rounded-xl bg-white/20 backdrop-blur border border-white/30 hover:bg-white/30 transition-colors">
              <Share2 size={20} className="text-white" />
            </button>
          </div>
        </div>
        {/* Bottom info */}
        <div className="absolute bottom-6 left-6 right-6">
          <Badge color={catColor} className="mb-2">{catEmoji} {place.category?.name || "Place"}</Badge>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-white mb-1">{place.name}</h1>
          <div className="flex items-center gap-3 text-white/80 text-sm">
            <span className="flex items-center gap-1"><MapPin size={14} />{place.city}</span>
            <span className="flex items-center gap-1"><Star size={14} className="text-amber-400" />{place.rating?.toFixed(1)}</span>
            {place.opening_time && <span className="flex items-center gap-1"><Clock size={14} />{place.opening_time} – {place.closing_time}</span>}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <motion.div className="bg-white border-b border-border"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="max-w-5xl mx-auto px-4 py-4 flex gap-6 overflow-x-auto scrollbar-hide">
          {[
            { icon: "⭐", label: "Rating", val: `${place.rating?.toFixed(1)} / 5.0` },
            { icon: "🕐", label: "Visit Duration", val: `${place.avg_visit_duration || 60} min` },
            { icon: "💰", label: "Entry Fee", val: place.entry_fee === 0 ? "Free" : `₹${place.entry_fee}` },
            { icon: "🕒", label: "Opens", val: place.opening_time || "All day" },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center text-center shrink-0 px-3 border-r border-border last:border-0">
              <span className="text-xl mb-0.5">{s.icon}</span>
              <span className="font-bold text-charcoal text-sm">{s.val}</span>
              <span className="text-muted text-xs">{s.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Crowded & Timing Info */}
      {place.crowded_level && (
        <motion.div className="bg-white border-b border-border"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-charcoal">🕐 Best Times to Visit</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className={`rounded-xl p-3 text-center ${
                place.crowded_level === 'High' ? 'bg-red-50' :
                place.crowded_level === 'Medium' ? 'bg-amber-50' : 'bg-emerald-50'
              }`}>
                <div className="text-lg mb-1">👥</div>
                <div className={`text-xs font-bold ${
                  place.crowded_level === 'High' ? 'text-red-600' :
                  place.crowded_level === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                }`}>{place.crowded_level}</div>
                <div className="text-[10px] text-muted">Peak Hours</div>
                {place.crowded_peak && <div className="text-xs font-medium text-charcoal mt-1">{place.crowded_peak}</div>}
              </div>
              <div className="bg-saffron/5 rounded-xl p-3 text-center">
                <div className="text-lg mb-1">✨</div>
                <div className="text-xs font-bold text-saffron">Best Time</div>
                {place.best_time && <div className="text-xs font-medium text-charcoal mt-1">{place.best_time}</div>}
              </div>
              <div className="bg-indigo/5 rounded-xl p-3 text-center">
                <div className="text-lg mb-1">📅</div>
                <div className="text-xs font-bold text-indigo">Opening</div>
                <div className="text-xs font-medium text-charcoal mt-1">{place.opening_time || 'All day'}</div>
                <div className="text-[10px] text-muted">to {place.closing_time || 'Sunset'}</div>
              </div>
              <div className="bg-peacock/5 rounded-xl p-3 text-center">
                <div className="text-lg mb-1">💡</div>
                <div className="text-xs font-bold text-peacock">Tips</div>
                {place.visit_tips && <div className="text-[10px] font-medium text-charcoal mt-1 leading-tight">{place.visit_tips}</div>}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b border-border sticky top-16 z-10">
        <div className="max-w-5xl mx-auto px-4 flex gap-0 overflow-x-auto scrollbar-hide">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`py-4 px-5 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? "border-saffron text-saffron" : "border-transparent text-muted hover:text-charcoal"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="max-w-5xl mx-auto px-4 py-8"
        >
        {tab === "overview" && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="card p-6">
                <h2 className="font-display font-semibold text-xl text-charcoal mb-3">About {place.name}</h2>
                <p className="text-muted leading-relaxed">{place.description || "A wonderful destination offering a unique blend of natural beauty and cultural richness. This place promises memorable experiences for every type of traveler, from history enthusiasts to nature lovers."}</p>
              </div>
              <div className="card p-6">
                <h3 className="font-display font-semibold text-charcoal mb-3">Location & Address</h3>
                <p className="text-muted text-sm mb-3 flex items-start gap-2"><MapPin size={14} className="text-saffron mt-0.5 shrink-0" />{place.address || `${place.city}, India`}</p>
                <div className="h-40 bg-sand rounded-xl flex items-center justify-center text-muted text-sm">
                  📍 Coordinates: {place.latitude?.toFixed(4)}, {place.longitude?.toFixed(4)}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="card p-5">
                <h3 className="font-display font-semibold text-charcoal mb-3">Practical Info</h3>
                <div className="space-y-3 text-sm">
                  {[
                    { label: "Entry Fee", val: place.entry_fee === 0 ? "Free Entry" : `₹${place.entry_fee} per person` },
                    { label: "Opening Hours", val: place.opening_time ? `${place.opening_time} – ${place.closing_time}` : "All Day" },
                    { label: "Best Time", val: "Morning (8–11 AM)" },
                    { label: "Category", val: place.category?.name || "Tourist Spot" },
                  ].map(i => (
                    <div key={i.label} className="flex justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                      <span className="text-muted">{i.label}</span>
                      <span className="font-medium text-charcoal">{i.val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => navigate(`/plan?city=${place.city}`)}
                className="w-full btn-primary py-3 text-base justify-center">✨ Plan a Journey Here</button>
            </div>
          </div>
        )}
        {tab === "transport" && (
          <div className="max-w-2xl space-y-6">
            <TransportComparison fromCoords={cityCoords} toCoords={[place.latitude, place.longitude]} fromName={place.city} toName={place.name} />
            <RideBooking fromName={place.city} toName={place.name} distanceKm={place.distance_km} />
          </div>
        )}
        {tab === "know-india" && <KnowIndiaTab place={place} />}
        {tab === "experiences" && <LocalExperiences />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
