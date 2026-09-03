import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SlidersHorizontal, X } from "lucide-react"
import useAppStore from "../../store/useAppStore"
import { clsx } from "clsx"

const CATEGORIES = [
  { id: "all", label: "All", emoji: "🗺️" },
  { id: "heritage", label: "Heritage", emoji: "🏛️" },
  { id: "beach", label: "Beaches", emoji: "🏖️" },
  { id: "nature", label: "Nature", emoji: "🌳" },
  { id: "religious", label: "Religious", emoji: "🛕" },
  { id: "viewpoint", label: "Viewpoints", emoji: "🏞️" },
  { id: "food", label: "Food", emoji: "🍛" },
  { id: "cultural", label: "Cultural", emoji: "🎭" },
  { id: "shopping", label: "Shopping", emoji: "🛍️" },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧" },
  { id: "park", label: "Parks", emoji: "🌿" },
  { id: "other", label: "Other", emoji: "📌" },
]

export default function FilterPanel({ onFilterChange }) {
  const { activeCategory, setActiveCategory, maxDistance, setMaxDistance, minRating, setMinRating, openNow, setOpenNow, budgetFriendly, setBudgetFriendly } = useAppStore()
  const [showFilters, setShowFilters] = useState(false)

  const handleCategory = (cat) => {
    setActiveCategory(cat)
    onFilterChange?.()
  }

  return (
    <div className="bg-white border-r border-border h-full overflow-y-auto scrollbar-hide">
      <motion.div className="p-4 border-b border-border"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className="font-display font-semibold text-charcoal text-base">Discover Nearby</h2>
        <p className="text-muted text-xs mt-0.5">Showing places within {maxDistance} km</p>
      </motion.div>
      {/* Categories */}
      <motion.div className="p-4 border-b border-border"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Categories</p>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => handleCategory(c.id)}
              className={clsx("flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-150 text-xs font-medium",
                activeCategory === c.id ? "bg-saffron/10 border-saffron text-saffron" : "bg-white border-border text-muted hover:border-saffron/50")}>
              <span className="text-lg">{c.emoji}</span>
              <span className="leading-tight text-center">{c.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
      {/* Filters */}
      <div className="p-4">
        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center justify-between w-full mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5"><SlidersHorizontal size={12} />Filters</p>
          <span className="text-xs text-saffron">{showFilters ? "Hide" : "Show"}</span>
        </button>
        {showFilters && (
          <motion.div className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-charcoal">Max Distance</label>
                <span className="text-sm font-semibold text-saffron">{maxDistance} km</span>
              </div>
              <input type="range" min={5} max={30} step={5} value={maxDistance}
                onChange={e => { setMaxDistance(Number(e.target.value)); onFilterChange?.() }}
                className="w-full accent-saffron" />
              <div className="flex justify-between text-xs text-muted mt-1"><span>5 km</span><span>30 km</span></div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-charcoal">Min Rating</label>
                <span className="text-sm font-semibold text-saffron">{minRating > 0 ? `${minRating}+ ⭐` : "Any"}</span>
              </div>
              <div className="flex gap-2">
                {[0,3,4,4.5].map(r => (
                  <button key={r} onClick={() => { setMinRating(r); onFilterChange?.() }}
                    className={clsx("flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                      minRating === r ? "bg-saffron text-white border-saffron" : "border-border text-muted hover:border-saffron/50")}>
                    {r === 0 ? "Any" : `${r}+`}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {[
                { key: "openNow", label: "Open Now", val: openNow, set: setOpenNow, emoji: "🕐" },
                { key: "budget", label: "Budget Friendly", val: budgetFriendly, set: setBudgetFriendly, emoji: "💰" },
              ].map(f => (
                <label key={f.key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-charcoal flex items-center gap-2">{f.emoji} {f.label}</span>
                  <div onClick={() => { f.set(!f.val); onFilterChange?.() }}
                    className={clsx("w-10 h-5 rounded-full transition-colors duration-200 relative cursor-pointer", f.val ? "bg-saffron" : "bg-border")}>
                    <div className={clsx("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200", f.val ? "left-5" : "left-0.5")} />
                  </div>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
