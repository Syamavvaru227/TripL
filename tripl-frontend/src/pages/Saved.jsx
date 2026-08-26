import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import useAppStore from "../store/useAppStore"
import EmptyState from "../components/ui/EmptyState"
import Button from "../components/ui/Button"
import { Bookmark, MapPin, Star, Clock, ChevronRight, X } from "lucide-react"

const TABS = ["Saved Places", "Saved Itineraries"]
const GRADIENTS = ["from-peacock/80 to-indigo", "from-saffron/80 to-terracotta", "from-emerald/80 to-peacock"]
const CAT_EMOJI = { heritage: "🏛️", beach: "🏖️", nature: "🌳", religious: "🛕", park: "🌿", food: "🍛", cultural: "🎭", viewpoint: "🏞️" }

export default function Saved() {
  const [tab, setTab] = useState(0)
  const navigate = useNavigate()
  const { savedPlaces, savedItineraries, toggleSaved, setTrailResult } = useAppStore()

  return (
    <div className="min-h-screen bg-ivory py-8">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Bookmark size={24} className="text-saffron" />
          <h1 className="font-display font-bold text-3xl text-indigo">My Saved</h1>
        </motion.div>
        {/* Tabs */}
        <div className="flex gap-1 bg-sand rounded-2xl p-1.5 w-fit mb-8">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === i ? "bg-white text-saffron shadow-sm" : "text-muted hover:text-charcoal"}`}>
              {t} {i === 0 ? `(${savedPlaces.length})` : `(${savedItineraries.length})`}
            </button>
          ))}
        </div>

        {tab === 0 && (
          savedPlaces.length === 0 ? (
            <EmptyState icon="🔖" title="No saved places yet" description="Bookmark places you love while exploring and they'll appear here."
              action={<Button onClick={() => navigate("/explore")}>Explore Destinations</Button>} />
          ) : (
            <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
              initial="hidden"
              animate="show"
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
            >
              {savedPlaces.map((p, i) => {
                const catKey = p.category?.name?.toLowerCase() || "heritage"
                const emoji = CAT_EMOJI[catKey] || "📍"
                const gradient = GRADIENTS[i % GRADIENTS.length]
                return (
                  <motion.div key={p.id} className="card group cursor-pointer"
                    variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 }}
                  } onClick={() => navigate(`/place/${p.id}`)}>
                    <div className={`relative h-40 bg-gradient-to-br ${gradient} flex items-end p-4`}>
                      <span className="text-4xl opacity-70">{emoji}</span>
                      <button onClick={e => { e.stopPropagation(); toggleSaved(p) }}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/30 hover:bg-white/50 transition-colors">
                        <X size={14} className="text-white" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-semibold text-charcoal group-hover:text-saffron transition-colors mb-1">{p.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted">
                        <span><MapPin size={10} className="inline" /> {p.city}</span>
                        <span><Star size={10} className="inline text-amber-400" /> {p.rating?.toFixed(1)}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )
        )}

        {tab === 1 && (
          savedItineraries.length === 0 ? (
            <EmptyState icon="🗺️" title="No saved itineraries yet" description="Generate a journey plan and save it to access it anytime."
              action={<Button onClick={() => navigate("/plan")}>Plan a Journey</Button>} />
          ) : (
            <div className="space-y-4">
              {savedItineraries.map((it, i) => (
                <div key={i} className="card p-5 cursor-pointer hover:shadow-card-hover transition-all" onClick={() => { setTrailResult(it); navigate("/itinerary") }}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-saffron/10 text-saffron text-xs font-semibold mb-2">
                        ✨ {it.city} Trail
                      </div>
                      <h3 className="font-display font-semibold text-charcoal">{Math.round(it.total_duration_minutes / 60)}-Hour Journey in {it.city}</h3>
                      <p className="text-muted text-sm mt-1">{it.total_places} places · ₹{Math.round(it.total_cost_inr)}</p>
                      <p className="text-muted text-xs mt-0.5">Saved {new Date(it.savedAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    <ChevronRight size={18} className="text-muted shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
