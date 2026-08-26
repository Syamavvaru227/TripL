import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { MapPin, Search, Sparkles, ChevronRight, Navigation, Loader2 } from "lucide-react"
import Button from "../ui/Button"

const SUGGESTIONS = ["Visakhapatnam, Andhra Pradesh","Hyderabad, Telangana","Goa","Jaipur, Rajasthan","Mumbai, Maharashtra","Delhi","Bangalore, Karnataka","Kolkata, West Bengal","Udaipur, Rajasthan","Pondicherry"]

export default function HeroSection() {
  const [query, setQuery] = useState("")
  const [showSugg, setShowSugg] = useState(false)
  const [locating, setLocating] = useState(false)
  const navigate = useNavigate()
  const filtered = SUGGESTIONS.filter(s => s.toLowerCase().includes(query.toLowerCase()))
  const handleExplore = (city) => {
    const c = city || query
    if (c.trim()) navigate(`/explore?city=${encodeURIComponent(c.split(",")[0].trim())}`)
  }
  const handleMyLocation = () => {
    if (!navigator.geolocation) { alert("Geolocation not supported"); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        navigate(`/explore?lat=${pos.coords.latitude.toFixed(4)}&lng=${pos.coords.longitude.toFixed(4)}`)
      },
      (err) => {
        setLocating(false)
        let msg = "Unable to get your location."
        if (err.code === 1) msg = "Location access denied. Please allow location access."
        alert(msg)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Cinematic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo via-peacock to-charcoal" />
      {/* Geometric Indian pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="jaali" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="20" fill="none" stroke="white" strokeWidth="0.5" />
              <circle cx="30" cy="30" r="10" fill="none" stroke="white" strokeWidth="0.5" />
              <line x1="10" y1="30" x2="50" y2="30" stroke="white" strokeWidth="0.3" />
              <line x1="30" y1="10" x2="30" y2="50" stroke="white" strokeWidth="0.3" />
              <line x1="15" y1="15" x2="45" y2="45" stroke="white" strokeWidth="0.3" />
              <line x1="45" y1="15" x2="15" y2="45" stroke="white" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#jaali)" />
        </svg>
      </div>
      {/* Saffron glow orb */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-saffron/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full bg-peacock/30 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center w-full">
        {/* Left: Text + Search */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium mb-6">
            <Sparkles size={14} className="text-saffron" />
            AI-Powered Indian Travel Planning
          </div>
          <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6">
            One Location In.
            <span className="block" style={{ color: "#E8621A" }}>A Complete Indian</span>
            Journey Out.
          </h1>
          <p className="text-white/70 text-lg mb-8 leading-relaxed max-w-lg">
            Discover hidden gems, compare travel options, and build your perfect journey within 30 km. Powered by AI, rooted in India.
          </p>
          {/* Search box */}
          <div className="relative max-w-lg">
            <div className="flex items-center gap-3 bg-white rounded-2xl shadow-2xl p-2 pl-4">
              <MapPin size={20} className="text-saffron shrink-0" />
              <input
                type="text" placeholder="Where do you want to explore?"
                value={query} onChange={e => { setQuery(e.target.value); setShowSugg(true) }}
                onFocus={() => setShowSugg(true)}
                onKeyDown={e => e.key === "Enter" && handleExplore()}
                className="flex-1 py-2 text-charcoal placeholder:text-muted outline-none text-sm font-medium bg-transparent"
              />
              <button onClick={() => handleExplore()} className="bg-saffron text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-saffron-dark transition-colors flex items-center gap-1.5 shrink-0">
                <Search size={16} /> Explore
              </button>
            </div>
            {showSugg && query && filtered.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden z-20">
                {filtered.map(s => (
                  <button key={s} onClick={() => { setQuery(s); setShowSugg(false); handleExplore(s.split(",")[0]) }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-sand transition-colors text-left">
                    <MapPin size={14} className="text-saffron shrink-0" />
                    <span className="text-sm text-charcoal">{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <button onClick={handleMyLocation} disabled={locating}
              className="flex items-center gap-1.5 text-white bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-white/20 disabled:opacity-50">
              {locating ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
              {locating ? "Locating..." : "Use My Location"}
            </button>
            <button onClick={() => navigate("/plan")} className="flex items-center gap-1 text-white/70 hover:text-white text-sm transition-colors">
              <Sparkles size={14} /> Plan My Journey <ChevronRight size={14} />
            </button>
          </div>

        </motion.div>

        {/* Right: Floating destination cards */}
        <div className="hidden lg:flex flex-col gap-4 items-end">
          {[
            { name: "Rushikonda Beach", city: "Visakhapatnam", rating: 4.5, dist: "8.4 km", cat: "🏖️ Beach", color: "from-peacock to-indigo" },
            { name: "Kailasagiri Park", city: "Visakhapatnam", rating: 4.6, dist: "5.2 km", cat: "🏞️ Nature", color: "from-saffron to-terracotta" },
            { name: "Hampi Ruins", city: "Karnataka", rating: 4.8, dist: "12.1 km", cat: "🏛️ Heritage", color: "from-indigo to-peacock" },
          ].map((d, i) => (
            <motion.div key={d.name} className={`bg-gradient-to-br ${d.color} p-0.5 rounded-2xl w-72 ${i === 1 ? "self-center" : ""}`}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.15, type: "spring", stiffness: 200, damping: 20 }}>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white font-display font-semibold">{d.name}</p>
                    <p className="text-white/60 text-xs mt-0.5">{d.city}</p>
                  </div>
                  <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">{d.cat}</span>
                </div>
                <div className="flex items-center gap-3 text-white/80 text-xs">
                  <span>⭐ {d.rating}</span>
                  <span>📍 {d.dist}</span>
                  <span>🕐 Open Now</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom stats bar */}
      <div className="absolute bottom-0 left-0 right-0 glass border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <motion.div
            className="flex items-center justify-center gap-8 md:gap-16 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {[["96+","Tourist Places"], ["10","Cities Covered"], ["5","Travel Modes"], ["AI","Smart Itinerary"]].map(([n, l], i) => (
              <motion.div key={l} className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.9 + i * 0.1 }}
              >
                <div className="font-display font-bold text-2xl text-saffron">{n}</div>
                <div className="text-white/50 text-xs">{l}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
