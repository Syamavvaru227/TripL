import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, User, Bookmark, Menu, X, Globe } from "lucide-react"
import useAuthStore from "../../store/useAuthStore"

const TripLLogo = () => (
  <Link to="/" className="flex items-center gap-2 group">
    <div className="relative w-8 h-8">
      <svg viewBox="0 0 40 40" fill="none" width="32" height="32">
        <circle cx="20" cy="20" r="18" fill="#1E1B4B" />
        <path d="M20 8 C20 8, 28 16, 28 22 C28 27 24.4 31 20 31 C15.6 31 12 27 12 22 C12 16 20 8 20 8Z" fill="#E8621A" />
        <circle cx="20" cy="22" r="5" fill="white" />
        <path d="M17 22 L19 24 L23 20" stroke="#E8621A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {[0,60,120,180,240,300].map((d,i) => <circle key={i} cx={20 + 16*Math.sin(d*Math.PI/180)} cy={20 - 16*Math.cos(d*Math.PI/180)} r="1.5" fill="#E8621A" opacity="0.5" />)}
      </svg>
    </div>
    <span className="font-display font-bold text-xl text-indigo group-hover:text-saffron transition-colors">
      Trip<span className="text-saffron">L</span>
    </span>
  </Link>
)

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const isActive = (path) => location.pathname === path

  const navLinks = [
    { to: "/explore", label: "Explore" },
    { to: "/plan", label: "Plan Journey" },
    { to: "/saved", label: "Saved" },
    { to: "/responsible", label: "Travel Responsibly" },
  ]

  return (
    <motion.nav className="sticky top-0 z-[100] glass border-b border-border"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <TripLLogo />
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} className={`nav-link ${isActive(l.to) ? "text-saffron font-semibold" : ""}`}>{l.label}</Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button className="flex items-center gap-1 text-sm text-muted hover:text-charcoal transition-colors">
              <Globe size={14} /> EN
            </button>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/saved" className="p-2 rounded-lg hover:bg-sand transition-colors"><Bookmark size={18} className="text-muted" /></Link>
                <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sand hover:bg-sand-dark transition-colors">
                  <div className="w-6 h-6 rounded-full bg-saffron flex items-center justify-center text-white text-xs font-bold">
                    {user?.full_name?.[0] || "U"}
                  </div>
                  <span className="text-sm font-medium text-charcoal">{user?.full_name?.split(" ")[0]}</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth" className="btn-secondary text-sm px-4 py-2">Sign In</Link>
                <Link to="/auth?tab=register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
              </div>
            )}
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-sand transition-colors">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
      {open && (
        <motion.div className="md:hidden glass border-t border-border px-4 py-4 flex flex-col gap-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
        >
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className={`nav-link py-2 ${isActive(l.to) ? "text-saffron font-semibold" : ""}`}>{l.label}</Link>
          ))}
          <div className="pt-2 border-t border-border flex gap-2">
            {isAuthenticated
              ? <button onClick={() => { logout(); setOpen(false) }} className="btn-secondary text-sm w-full">Sign Out</button>
              : <Link to="/auth" onClick={() => setOpen(false)} className="btn-primary text-sm w-full text-center">Sign In</Link>
            }
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.nav>
  )
}
