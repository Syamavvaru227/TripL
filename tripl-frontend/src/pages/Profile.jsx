import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import useAuthStore from "../store/useAuthStore"
import { getMe } from "../api/auth"
import { User, Settings, Globe, Bell, Shield, LogOut, ChevronRight } from "lucide-react"

export default function Profile() {
  const { user, isAuthenticated, logout, setUser } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) { navigate("/auth"); return }
    if (!user) {
      setLoading(true)
      getMe().then(r => setUser(r.data)).catch(() => logout()).finally(() => setLoading(false))
    }
  }, [isAuthenticated])

  if (!isAuthenticated) return null

  const MENU_ITEMS = [
    { icon: Globe, label: "Language", value: "English", sub: "Choose your preferred language" },
    { icon: Bell, label: "Notifications", value: "On", sub: "Journey reminders and tips" },
    { icon: Shield, label: "Privacy & Data", value: "", sub: "Manage your data preferences" },
  ]

  const INTERESTS = ["🏖️ Beaches", "🏛️ Heritage", "🌳 Nature", "🍛 Food", "🎭 Culture"]

  return (
    <div className="min-h-screen bg-ivory pb-20">
      {/* Header */}
      <motion.div className="bg-gradient-to-br from-indigo to-peacock px-4 pt-8 pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-saffron flex items-center justify-center text-white text-3xl font-bold shadow-cta">
            {user?.full_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">{user?.full_name || "Traveler"}</h1>
            <p className="text-white/70 text-sm">{user?.email}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium">
              ✨ Explorer Tier
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="max-w-2xl mx-auto px-4 -mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        {/* Stats */}
        <div className="card p-5 mb-6 grid grid-cols-3 gap-4 text-center">
          {[["0", "Journeys Taken"], ["0", "Places Visited"], ["0", "Places Saved"]].map(([n, l]) => (
            <div key={l}>
              <div className="font-display font-bold text-2xl text-saffron">{n}</div>
              <div className="text-muted text-xs">{l}</div>
            </div>
          ))}
        </div>

        {/* Interests */}
        <div className="card p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-charcoal">My Interests</h3>
            <button className="text-xs text-saffron hover:underline">Edit</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(i => <span key={i} className="chip chip-active text-xs">{i}</span>)}
          </div>
        </div>

        {/* Settings */}
        <div className="card mb-4 overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h3 className="font-display font-semibold text-charcoal flex items-center gap-2"><Settings size={16} />Settings</h3>
          </div>
          {MENU_ITEMS.map(item => (
            <div key={item.label} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-sand/50 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-sand flex items-center justify-center"><item.icon size={18} className="text-muted" /></div>
              <div className="flex-1">
                <div className="font-medium text-charcoal text-sm">{item.label}</div>
                <div className="text-muted text-xs">{item.sub}</div>
              </div>
              <div className="flex items-center gap-2 text-muted text-sm">
                {item.value && <span>{item.value}</span>}
                <ChevronRight size={16} />
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => { logout(); navigate("/") }} className="w-full btn-secondary justify-center text-red-500 border-red-200 hover:bg-red-50">
          <LogOut size={16} /> Sign Out
        </button>
      </motion.div>
    </div>
  )
}
