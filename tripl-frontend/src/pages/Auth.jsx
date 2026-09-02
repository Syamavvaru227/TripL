import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { login, register, sendOtp, registerPhone, loginPhone } from "../api/auth"
import useAuthStore from "../store/useAuthStore"
import { showToast } from "../components/ui/Toast"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Phone, CheckCircle, Loader2 } from "lucide-react"

export default function Auth() {
  const [params] = useSearchParams()
  const [tab, setTab] = useState(params.get("tab") === "register" ? 1 : 0)
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const navigate = useNavigate()
  const { setToken, setUser } = useAuthStore()
  const [form, setForm] = useState({ full_name: "", email: "", password: "" })
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  // Phone OTP state
  const [otpStep, setOtpStep] = useState(0) // 0=phone, 1=otp, 2=name
  const [phoneForm, setPhoneForm] = useState({ phone: "", otp: "", full_name: "" })
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [otpPhone, setOtpPhone] = useState("")
  const setPhone = (k) => (e) => setPhoneForm(f => ({ ...f, [k]: e.target.value }))

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
      navigate("/explore")
    } catch (e) {
      showToast(e.response?.data?.detail || "Authentication failed. Please try again.", "error")
    } finally { setLoading(false) }
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setOtpLoading(true)
    try {
      await sendOtp(phoneForm.phone)
      setOtpPhone(phoneForm.phone)
      setOtpStep(1)
      setOtpTimer(30)
      const interval = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) { clearInterval(interval); return 0 }
          return prev - 1
        })
      }, 1000)
      showToast("OTP sent! Check your phone 📱", "success")
    } catch (e) {
      showToast(e.response?.data?.detail || "Failed to send OTP.", "error")
    } finally { setOtpLoading(false) }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setOtpLoading(true)
    try {
      const res = await loginPhone(phoneForm.phone, phoneForm.otp)
      setToken(res.data.access_token)
      setUser(res.data.user)
      showToast(`Welcome back, ${res.data.user.full_name}!`, "success")
      navigate("/explore")
    } catch (e) {
      if (e.response?.status === 401 && e.response?.data?.detail?.includes("not found")) {
        setOtpStep(2)
        showToast("New number? Create your account below.", "info")
      } else {
        showToast(e.response?.data?.detail || "Invalid OTP.", "error")
      }
    } finally { setOtpLoading(false) }
  }

  const handlePhoneRegister = async (e) => {
    e.preventDefault()
    setOtpLoading(true)
    try {
      const res = await registerPhone(phoneForm.phone, phoneForm.otp, phoneForm.full_name)
      setToken(res.data.access_token)
      setUser(res.data.user)
      showToast(`Account created! Welcome to TripL 🎉`, "success")
      navigate("/explore")
    } catch (e) {
      showToast(e.response?.data?.detail || "Registration failed.", "error")
    } finally { setOtpLoading(false) }
  }

  const handleResendOtp = async () => {
    if (otpTimer > 0) return
    setOtpLoading(true)
    try {
      await sendOtp(otpPhone)
      setOtpTimer(30)
      const interval = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) { clearInterval(interval); return 0 }
          return prev - 1
        })
      }, 1000)
      showToast("OTP resent! 📱", "success")
    } catch (e) {
      showToast("Failed to resend OTP.", "error")
    } finally { setOtpLoading(false) }
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
            {[["Any", "City"], ["AI", "Powered"], ["Free", "To Use"]].map(([n, l]) => (
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
            <h1 className="font-display font-bold text-3xl text-charcoal mb-1">
              {tab === 0 ? "Welcome back" : tab === 2 ? "Phone Sign In" : "Create account"}
            </h1>
            <p className="text-muted text-sm">
              {tab === 0 ? "Sign in to your TripL account" : "Use your phone number for quick access"}
            </p>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-sand rounded-2xl p-1 mb-8">
            {["Email", "Phone"].map((t, i) => (
              <button key={t} onClick={() => { setTab(i); setOtpStep(0); setPhoneForm({ phone: "", otp: "", full_name: "" }) }}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === i ? "bg-white text-saffron shadow-sm" : "text-muted"}`}>{t}</button>
            ))}
          </div>

          {/* Email Auth */}
          {tab === 0 && (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                {loading ? "Please wait..." : "Sign In →"}
              </button>
            </form>
          )}

          {/* Phone OTP Auth */}
          {tab === 1 && (
            <div className="space-y-4">
              {/* Step progress */}
              <div className="flex items-center gap-2 mb-6">
                {[0, 1, 2].filter(s => s <= Math.max(otpStep, 0) + (otpStep >= 1 ? 1 : 0) + (otpStep >= 2 ? 1 : 0)).map((s, i, arr) => (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      s < otpStep ? "bg-emerald text-white" : s === otpStep ? "bg-saffron text-white" : "bg-sand text-muted"
                    }`}>
                      {s < otpStep ? <CheckCircle size={14} /> : s + 1}
                    </div>
                    {i < arr.length - 1 && <div className={`flex-1 h-0.5 rounded ${s < otpStep ? "bg-emerald" : "bg-sand"}`} />}
                  </div>
                ))}
              </div>

              {/* Step 0: Enter Phone */}
              {otpStep === 0 && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted mb-1 block">Phone Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                      <input type="tel" placeholder="+91 98765 43210" value={phoneForm.phone}
                        onChange={setPhone("phone")} required minLength={10}
                        className="input-field pl-10" />
                    </div>
                  </div>
                  <button type="submit" disabled={otpLoading} className="btn-primary w-full justify-center py-3.5 text-base">
                    {otpLoading ? <Loader2 size={18} className="animate-spin" /> : "Send OTP →"}
                  </button>
                </form>
              )}

              {/* Step 1: Enter OTP */}
              {otpStep === 1 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📱</div>
                    <p className="text-sm text-muted">OTP sent to <span className="font-semibold text-charcoal">{otpPhone}</span></p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted mb-1 block">Enter 6-digit OTP</label>
                    <input type="text" placeholder="000000" value={phoneForm.otp} onChange={setPhone("otp")}
                      required maxLength={6} pattern="[0-9]{6}" inputMode="numeric"
                      className="input-field text-center text-2xl tracking-[0.5em] font-mono" autoFocus />
                  </div>
                  <button type="submit" disabled={otpLoading} className="btn-primary w-full justify-center py-3.5 text-base">
                    {otpLoading ? <Loader2 size={18} className="animate-spin" /> : "Verify & Sign In →"}
                  </button>
                  <button type="button" onClick={handleResendOtp} disabled={otpTimer > 0}
                    className={`w-full text-center text-sm ${otpTimer > 0 ? "text-muted" : "text-saffron hover:underline"}`}>
                    {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : "Resend OTP"}
                  </button>
                  <button type="button" onClick={() => setOtpStep(0)}
                    className="w-full text-center text-sm text-muted hover:text-charcoal">← Change phone number</button>
                </form>
              )}

              {/* Step 2: New user - enter name */}
              {otpStep === 2 && (
                <form onSubmit={handlePhoneRegister} className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎉</div>
                    <p className="text-sm text-muted">New to TripL? Create your account</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted mb-1 block">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                      <input type="text" placeholder="Your full name" value={phoneForm.full_name}
                        onChange={setPhone("full_name")} required minLength={2}
                        className="input-field pl-10" />
                    </div>
                  </div>
                  <div className="bg-sand/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted">Phone: <span className="font-semibold text-charcoal">{otpPhone}</span></p>
                  </div>
                  <button type="submit" disabled={otpLoading} className="btn-primary w-full justify-center py-3.5 text-base">
                    {otpLoading ? <Loader2 size={18} className="animate-spin" /> : "Create Account →"}
                  </button>
                  <button type="button" onClick={() => { setOtpStep(0); setPhoneForm({ phone: "", otp: "", full_name: "" }) }}
                    className="w-full text-center text-sm text-muted hover:text-charcoal">← Start over</button>
                </form>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <button onClick={() => navigate("/explore")} className="text-sm text-muted hover:text-saffron transition-colors">
              Continue without account →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
