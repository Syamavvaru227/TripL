import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Car, Bike, Bus, Footprints } from "lucide-react"
import { getTransportOptions } from "../../api/transport"

const MODE_ICONS = { car: "🚗", bike: "🏍️", bus: "🚌", auto: "🛺", walking: "🚶" }
const MODE_COLORS = { car: "saffron", bike: "peacock", bus: "emerald", auto: "terracotta", walking: "muted" }

export default function TransportComparison({ fromCoords, toCoords, fromName = "Your Location", toName = "Destination" }) {
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!fromCoords || !toCoords) return
    setLoading(true)
    getTransportOptions(fromCoords[0], fromCoords[1], toCoords[0], toCoords[1])
      .then(r => { setOptions(r.data.options); setSelected(r.data.options[0]?.mode) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [fromCoords, toCoords])

  if (!fromCoords || !toCoords) return null
  if (loading) return <div className="py-4 text-center text-muted text-sm animate-pulse">Loading travel options...</div>
  if (!options.length) return null

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-charcoal">How to Get There</h3>
        <div className="text-xs text-muted">{fromName} → {toName}</div>
      </div>
      <div className="space-y-2">
        {options.map((o, i) => (
          <motion.button key={o.mode} onClick={() => setSelected(o.mode)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 text-left ${selected === o.mode ? "border-saffron bg-saffron/5" : "border-border hover:border-saffron/40 bg-white"}`}>
            <span className="text-2xl shrink-0">{MODE_ICONS[o.mode] || "🚗"}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-charcoal">{o.display_name}</span>
                <span className="font-bold text-sm text-saffron">₹{Math.round(o.cost_inr)}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                <span>⏱️ {o.duration_minutes} min</span>
                <span>📍 {o.distance_km?.toFixed(1)} km</span>
              </div>
            </div>
            {selected === o.mode && <div className="w-2 h-2 rounded-full bg-saffron shrink-0" />}
          </motion.button>
        ))}
      </div>
      {selected && (
        <div className="mt-3 pt-3 border-t border-border">
          <button className="w-full bg-saffron text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-saffron-dark transition-colors">
            Navigate with {selected} →
          </button>
        </div>
      )}
    </div>
  )
}
