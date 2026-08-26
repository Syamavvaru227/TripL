import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { login, register } from "../api/auth"
import useAuthStore from "../store/useAuthStore"
import { showToast } from "../components/ui/Toast"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react"

export default function Auth() {
  const [params] = useSearchParams()
  const [tab, setTab] = useState(params.get("tab") === "register" ? 1 : 0)
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const navigate = useNavigate()
  const { setToken, setUser } = useAuthStore()
  const [form, setForm] = useState({ full_name: "", email: "", password: "" })
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = tab === 0 ? await login(form.email, form.password) : await register(form.full_name, form.email, form.password)
      setToken(res.data.access_token)
      setUser(res.data.user)
      if (tab === 1 && res.data.welcome_email_sent) {
        showToast(`Account created! Welcome email sent to ${form.email} 📧`, "success")
      } else if (tab === 1) {
        showToast(`Account created! Welcome to TripL 🎉`, "success")
      } else {
        showToast(`Welcome back, ${res.data.user.full_name}!`, "success")
      }
      navigate("/explore?city=Visakhapatnam")
    } catch (e) {
      showToast(e.response?.data?.detail || "Authentication failed. Please try again.", "error")
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo via-peacock to-indigo items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%"><defs><pattern id="ap" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="25" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="30" cy="30" r="12" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="30" cy="30" r="3" fill="white" opacity="0.5" />
          </pattern></defs><rect width="100%" height="100%" fill="url(#ap)" /></svg>
        </div>
        <div className="relative text-center text-white p-12">
          <div className="text-7xl mb-6">🕌</div>
          <h2 className="font-display font-bold text-4xl mb-4">Explore India<br />Like Never Before</h2>
          <p className="text-white/70 text-lg max-w-sm mx-auto leading-relaxed">Join thousands discovering India's hidden gems with AI-powered travel planning.</p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            {[["96+", "Places"], ["10", "Cities"], ["AI", "Powered"]].map(([n, l]) => (
              <div key={l}><div className="font-display font-bold text-3xl text-saffron">{n}</div><div className="text-white/50 text-xs">{l}</div></div>
            ))}
          </div>
        </div>
      </div>
      {/* Right panel */}
      <motion.div className="flex-1 flex items-center justify-center px-6 py-12"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
                <circle cx="20" cy="20" r="18" fill="#1E1B4B"/>
                <path d="M20 8 C20 8, 28 16, 28 22 C28 27 24.4 31 20 31 C15.6 31 12 27 12 22 C12 16 20 8 20 8Z" fill="#E8621A"/>
                <circle cx="20" cy="22" r="5" fill="white"/>
              </svg>
              <span className="font-display font-bold text-2xl text-indigo">Trip<span className="text-saffron">L</span></span>
            </div>
            <h1 className="font-display font-bold text-3xl text-charcoal mb-1">{tab === 0 ? "Welcome back" : "Create account"}</h1>
            <p className="text-muted text-sm">{tab === 0 ? "Sign in to your TripL account" : "Start your Indian journey today"}</p>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-sand rounded-2xl p-1 mb-8">
            {["Sign In", "Register"].map((t, i) => (
              <button key={t} onClick={() => setTab(i)} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === i ? "bg-white text-saffron shadow-sm" : "text-muted"}`}>{t}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 1 && (
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input type="text" placeholder="Full Name" value={form.full_name} onChange={set("full_name")} required className="input-field pl-10" />
              </div>
            )}
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input type="email" placeholder="Email address" value={form.email} onChange={set("email")} required className="input-field pl-10" />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input type={showPw ? "text" : "password"} placeholder="Password" value={form.password} onChange={set("password")} required minLength={8} className="input-field pl-10 pr-10" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 text-base">
              {loading ? "Please wait..." : tab === 0 ? "Sign In →" : "Create Account →"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => navigate("/explore?city=Visakhapatnam")} className="text-sm text-muted hover:text-saffron transition-colors">
              Continue without account →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
