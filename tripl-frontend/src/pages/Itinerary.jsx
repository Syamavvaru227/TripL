import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import useAppStore from "../store/useAppStore"
import EmptyState from "../components/ui/EmptyState"
import Button from "../components/ui/Button"
import { Share2, Bookmark, Navigation, ChevronRight } from "lucide-react"
import { saveTrail } from "../api/trail"
import { showToast } from "../components/ui/Toast"

const CAT_EMOJI = { heritage: "🏛️", beach: "🏖️", nature: "🌳", religious: "🛕", park: "🌿", food: "🍛", cultural: "🎭", viewpoint: "🏞️", family: "👨‍👩‍👧", shopping: "🛍️", other: "📌" }
const CAT_COLORS = { heritage: "terracotta", beach: "peacock", nature: "emerald", religious: "saffron", park: "emerald", food: "saffron" }
const PLACEHOLDER_GRADIENTS = ["from-peacock/70 to-indigo", "from-saffron/70 to-terracotta", "from-emerald/70 to-peacock", "from-terracotta/70 to-saffron"]

export default function Itinerary() {
  const navigate = useNavigate()
  const { trailResult, addSavedItinerary } = useAppStore()

  if (!trailResult) return (
    <div className="min-h-screen flex items-center justify-center bg-ivory">
      <EmptyState icon="🗺️" title="No itinerary yet" description="Use the Journey Planner to generate your personalized trail."
        action={<Button onClick={() => navigate("/plan")}>Plan My Journey ✨</Button>} />
    </div>
  )

  const trail = trailResult
  const reasons = ["Matches your interests", "Fits your budget", "Fits your available time", "Minimises unnecessary travel", "Considers destination timings", "Optimised route efficiency"]

  const handleSave = async () => {
    try {
      addSavedItinerary({ ...trail, savedAt: new Date().toISOString() })
      showToast("Itinerary saved successfully!", "success")
    } catch { showToast("Could not save — try again", "error") }
  }

  return (
    <div className="min-h-screen bg-ivory pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo to-peacock text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-4 cursor-pointer hover:text-white transition-colors" onClick={() => navigate("/plan")}>
            ← Edit Preferences
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm mb-3">
                ✨ AI-Generated Itinerary
              </div>
              <h1 className="font-display font-bold text-3xl sm:text-4xl mb-1">Your {trail.total_duration_minutes >= 480 ? "Full Day" : `${Math.round(trail.total_duration_minutes / 60)}-Hour`} Journey</h1>
              <p className="text-white/70">{trail.city} · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="p-2.5 rounded-xl bg-white/20 border border-white/30 hover:bg-white/30 transition-colors"><Bookmark size={18} /></button>
              <button onClick={() => navigator.share?.({ title: "My TripL Journey", url: window.location.href })} className="p-2.5 rounded-xl bg-white/20 border border-white/30 hover:bg-white/30 transition-colors"><Share2 size={18} /></button>
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-8 bg-white/10 rounded-2xl p-5">
            {[
              { emoji: "📍", val: trail.total_places, label: "Places" },
              { emoji: "⏱️", val: `${Math.round(trail.total_duration_minutes / 60)}h ${trail.total_duration_minutes % 60}m`, label: "Duration" },
              { emoji: "💰", val: `₹${Math.round(trail.total_cost_inr)}`, label: "Est. Cost" },
              { emoji: "🏁", val: trail.end_time, label: "Finish By" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-xl mb-0.5">{s.emoji}</div>
                <div className="font-display font-bold text-lg text-white">{s.val}</div>
                <div className="text-white/50 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Timeline */}
        <h2 className="font-display font-bold text-xl text-charcoal mb-6">Your Trail</h2>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-saffron via-peacock to-emerald" style={{ zIndex: 0 }} />

          {/* Start */}
          <motion.div className="flex gap-4 mb-6 relative z-10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="w-12 h-12 rounded-full bg-saffron flex items-center justify-center shrink-0 shadow-cta">
              <span className="text-white font-bold text-xs">START</span>
            </div>
            <div className="flex-1 pt-3">
              <div className="font-display font-semibold text-charcoal">{trail.start_time} — Departure</div>
              <div className="text-muted text-sm">📍 {trail.city}</div>
            </div>
          </motion.div>

          {/* Stops */}
          {trail.stops?.map((stop, i) => {
            const catKey = stop.category?.name?.toLowerCase() || "heritage"
            const emoji = CAT_EMOJI[catKey] || "📍"
            const gradient = PLACEHOLDER_GRADIENTS[i % PLACEHOLDER_GRADIENTS.length]
            return (
              <motion.div key={stop.order} className="flex gap-4 mb-6 relative z-10"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.12, type: "spring", stiffness: 260, damping: 24 }}
              >
                {/* Connector */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="text-xs text-muted mb-1 font-mono w-12 text-center">{stop.arrival_time}</div>
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
                    <span className="text-xl">{emoji}</span>
                  </div>
                </div>
                <div className="flex-1 card p-4 hover:shadow-card-hover transition-all cursor-pointer" onClick={() => navigate(`/place/${stop.place.id}?name=${encodeURIComponent(stop.place.name)}&city=${encodeURIComponent(stop.place.city || trail.city || '')}&cat=${encodeURIComponent(stop.category?.name?.toLowerCase() || 'heritage')}&lat=${stop.place.latitude || ''}&lng=${stop.place.longitude || ''}${stop.place.image_url ? '&img=' + encodeURIComponent(stop.place.image_url) : ''}`, { state: { place: stop.place } })}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="text-xs text-muted font-medium mb-0.5">Stop {stop.order}</div>
                      <h3 className="font-display font-semibold text-charcoal text-base leading-tight">{stop.place.name}</h3>
                      <p className="text-muted text-xs mt-0.5">{stop.category?.name}</p>
                    </div>
                    <ChevronRight size={16} className="text-muted shrink-0 mt-1" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs text-muted border-t border-border pt-2 mt-2">
                    <span>⏱️ Stay {stop.stay_minutes} min</span>
                    <span>💰 ₹{Math.round(stop.cumulative_cost)}</span>
                    <span>🕐 Until {stop.departure_time}</span>
                  </div>
                  {i > 0 && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <div className="text-xs text-muted flex items-center gap-2 mb-2">
                        <span>{stop.transport_icon || "🚗"}</span>
                        <span>From previous stop: {stop.travel_from_prev_minutes} min · {stop.distance_from_prev_km?.toFixed(1)} km · ₹{Math.round(stop.travel_cost_inr)}</span>
                      </div>
                      <div className="flex gap-2">
                        <a href={`https://m.uber.com/go/search-pickup?pickup=${encodeURIComponent(trail.stops?.[i-1]?.place?.name || trail.city || "")}&dropoff=${encodeURIComponent(stop.place?.name || "")}`} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] bg-black text-white px-2 py-1 rounded-full hover:opacity-80">Uber</a>
                        <a href={`https://book.olacabs.com/?pickup=${encodeURIComponent(trail.stops?.[i-1]?.place?.name || trail.city || "")}&drop=${encodeURIComponent(stop.place?.name || "")}`} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded-full hover:opacity-80">Ola</a>
                        <a href={`https://rapido.bike/ride?pickup=${encodeURIComponent(trail.stops?.[i-1]?.place?.name || trail.city || "")}&dropoff=${encodeURIComponent(stop.place?.name || "")}`} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] bg-yellow-400 text-black px-2 py-1 rounded-full hover:opacity-80">Rapido</a>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}

          {/* End */}
          <motion.div className="flex gap-4 mb-6 relative z-10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + (trail.stops?.length || 0) * 0.12 }}
          >
            <div className="w-12 h-12 rounded-full bg-emerald flex items-center justify-center shrink-0 shadow-md">
              <span className="text-white font-bold text-xs">END</span>
            </div>
            <div className="flex-1 pt-3">
              <div className="font-display font-semibold text-charcoal">{trail.end_time} — Return</div>
              <div className="text-muted text-sm">🏠 Back to {trail.city}</div>
            </div>
          </motion.div>
        </div>

        {/* Why this route */}
        <motion.div className="card p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="font-display font-semibold text-charcoal mb-4">✨ Why We Recommended This Route</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {reasons.map((r, i) => (
              <div key={r} className="flex items-center gap-2 text-sm text-muted">
                <div className="w-5 h-5 rounded-full bg-saffron/10 flex items-center justify-center shrink-0">
                  <span className="text-saffron text-xs">✓</span>
                </div>
                {r}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Total Trip Summary */}
        <motion.div className="card p-6 mb-6 bg-gradient-to-br from-indigo/5 to-saffron/5 border border-saffron/20"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h3 className="font-display font-semibold text-charcoal mb-4">📊 Total Trip Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl mb-1">📍</div>
              <div className="font-bold text-charcoal">{trail.stops?.length || 0}</div>
              <div className="text-muted text-xs">Places</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">⏱️</div>
              <div className="font-bold text-charcoal">{Math.floor((trail.total_duration_minutes || 0) / 60)}h {(trail.total_duration_minutes || 0) % 60}m</div>
              <div className="text-muted text-xs">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🛣️</div>
              <div className="font-bold text-charcoal">{trail.stops?.reduce((sum, s) => sum + (s.distance_from_prev_km || 0), 0).toFixed(1)} km</div>
              <div className="text-muted text-xs">Total Distance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">💰</div>
              <div className="font-bold text-saffron">₹{Math.round(trail.total_cost_inr || 0)}</div>
              <div className="text-muted text-xs">Total Cost</div>
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-muted text-sm mb-3">Book your complete trip ride:</p>
            <div className="flex gap-3">
              <a href={`https://m.uber.com/go/search-pickup?pickup=${encodeURIComponent(trail.city || "")}&dropoff=${encodeURIComponent(trail.stops?.[trail.stops.length - 1]?.place?.name || "")}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">
                🚗 Book Uber — ₹{Math.round((trail.stops?.reduce((sum, s) => sum + (s.distance_from_prev_km || 0), 0) || 0) * 14)}
              </a>
              <a href={`https://book.olacabs.com/?pickup=${encodeURIComponent(trail.city || "")}&drop=${encodeURIComponent(trail.stops?.[trail.stops.length - 1]?.place?.name || "")}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">
                🛺 Book Ola — ₹{Math.round((trail.stops?.reduce((sum, s) => sum + (s.distance_from_prev_km || 0), 0) || 0) * 12)}
              </a>
              <a href={`https://rapido.bike/ride?pickup=${encodeURIComponent(trail.city || "")}&dropoff=${encodeURIComponent(trail.stops?.[trail.stops.length - 1]?.place?.name || "")}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">
                🏍️ Book Rapido — ₹{Math.round((trail.stops?.reduce((sum, s) => sum + (s.distance_from_prev_km || 0), 0) || 0) * 8)}
              </a>
            </div>
          </div>
        </motion.div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => navigate("/plan")} className="btn-secondary flex-1 justify-center">🔄 Regenerate</button>
          <button onClick={handleSave} className="btn-primary flex-1 justify-center">💾 Save Itinerary</button>
        </div>
      </div>
    </div>
  )
}
