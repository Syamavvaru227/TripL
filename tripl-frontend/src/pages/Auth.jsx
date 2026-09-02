import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { login, register, sendOtp, checkPhone, registerPhone, loginPhone, forgotPassword } from "../api/auth"
import useAuthStore from "../store/useAuthStore"
import { showToast } from "../components/ui/Toast"
import { Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle, Loader2, KeyRound } from "lucide-react"

export default function Auth() {
  const [params] = useSearchParams()
  const [tab, setTab] = useState(0) // 0=email, 1=phone
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const navigate = useNavigate()
  const { setToken, setUser } = useAuthStore()

  // Email forms
  const [authMode, setAuthMode] = useState("login")
  const [emailForm, setEmailForm] = useState({ email: "", password: "" })
  const setEmail = (k) => (e) => setEmailForm(f => ({ ...f, [k]: e.target.value }))
  const [regForm, setRegForm] = useState({ full_name: "", email: "", password: "" })
  const setReg = (k) => (e) => setRegForm(f => ({ ...f, [k]: e.target.value }))

  // Phone flow state: 0=phone, 1=otp, 2=new-user-register, 3=existing-user-password
  // Forgot flow state: 0=phone, 1=otp, 2=new-password
  const [otpStep, setOtpStep] = useState(0)
  const [forgotMode, setForgotMode] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [otpPhone, setOtpPhone] = useState("")
  const [userExists, setUserExists] = useState(false)
  const [phoneForm, setPhoneForm] = useState({ phone: "", otp: "", full_name: "", email: "", password: "" })
  const setPhone = (k) => (e) => setPhoneForm(f => ({ ...f, [k]: e.target.value }))

  // ── Email Auth ──────────────────────────────────────────────────────
  const handleEmailLogin = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const res = await login(emailForm.email, emailForm.password)
      setToken(res.data.access_token); setUser(res.data.user)
      showToast(`Welcome back, ${res.data.user.full_name}!`, "success"); navigate("/explore")
    } catch (e) { showToast(e.response?.data?.detail || "Incorrect email or password.", "error") }
    finally { setLoading(false) }
  }

  const handleEmailRegister = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const res = await register(regForm.full_name, regForm.email, regForm.password)
      setToken(res.data.access_token); setUser(res.data.user)
      showToast(`Account created! Welcome to TripL 🎉`, "success"); navigate("/explore")
    } catch (e) { showToast(e.response?.data?.detail || "Registration failed.", "error") }
    finally { setLoading(false) }
  }

  // ── OTP Timer ───────────────────────────────────────────────────────
  const startOtpTimer = () => {
    setOtpTimer(30)
    const iv = setInterval(() => { setOtpTimer(p => { if (p <= 1) { clearInterval(iv); return 0 } return p - 1 }) }, 1000)
  }

  // ── Phone Flow ──────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault(); setOtpLoading(true)
    try {
      await sendOtp(phoneForm.phone); setOtpPhone(phoneForm.phone); setOtpStep(1); startOtpTimer()
      showToast("OTP sent! Check your phone 📱", "success")
    } catch (e) { showToast(e.response?.data?.detail || "Failed to send OTP.", "error") }
    finally { setOtpLoading(false) }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault(); setOtpLoading(true)
    try {
      const res = await checkPhone(phoneForm.phone, phoneForm.otp)
      setUserExists(res.data.exists)
      if (res.data.exists) {
        setOtpStep(3) // → enter password to login
        showToast("Welcome back! Enter your password to sign in.", "success")
      } else {
        setOtpStep(2) // → complete profile (name, email, password)
        showToast("New here? Complete your profile below.", "info")
      }
    } catch (e) { showToast(e.response?.data?.detail || "Invalid or expired OTP.", "error") }
    finally { setOtpLoading(false) }
  }

  const handleExistingUserLogin = async (e) => {
    e.preventDefault(); setOtpLoading(true)
    try {
      const res = await loginPhone(phoneForm.phone, phoneForm.password)
      setToken(res.data.access_token); setUser(res.data.user)
      showToast(`Welcome back, ${res.data.user.full_name}!`, "success"); navigate("/explore")
    } catch (e) { showToast(e.response?.data?.detail || "Incorrect password.", "error") }
    finally { setOtpLoading(false) }
  }

  const handlePhoneRegister = async (e) => {
    e.preventDefault(); setOtpLoading(true)
    try {
      const res = await registerPhone(phoneForm.phone, phoneForm.otp, phoneForm.full_name, phoneForm.email, phoneForm.password)
      setToken(res.data.access_token); setUser(res.data.user)
      showToast(`Account created! Welcome to TripL 🎉`, "success"); navigate("/explore")
    } catch (e) { showToast(e.response?.data?.detail || "Registration failed.", "error") }
    finally { setOtpLoading(false) }
  }

  // ── Forgot Password ─────────────────────────────────────────────────
  const handleForgotSendOtp = async (e) => {
    e.preventDefault(); setOtpLoading(true)
    try {
      await sendOtp(phoneForm.phone); setOtpPhone(phoneForm.phone); setOtpStep(1); startOtpTimer()
      showToast("OTP sent! Check your phone 📱", "success")
    } catch (e) { showToast(e.response?.data?.detail || "Failed to send OTP.", "error") }
    finally { setOtpLoading(false) }
  }

  const handleForgotVerifyOtp = async (e) => {
    e.preventDefault(); setOtpLoading(true)
    try {
      await checkPhone(phoneForm.phone, phoneForm.otp)
      setOtpStep(2) // → new password
      showToast("OTP verified! Set your new password.", "success")
    } catch (e) { showToast(e.response?.data?.detail || "Invalid or expired OTP.", "error") }
    finally { setOtpLoading(false) }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault(); setOtpLoading(true)
    try {
      await forgotPassword(phoneForm.phone, phoneForm.otp, phoneForm.password)
      showToast("Password reset! You can now sign in. 🎉", "success")
      setForgotMode(false); setOtpStep(0); setTab(0); setAuthMode("login")
      setPhoneForm({ phone: "", otp: "", full_name: "", email: "", password: "" })
    } catch (e) { showToast(e.response?.data?.detail || "Reset failed.", "error") }
    finally { setOtpLoading(false) }
  }

  const resetAll = () => { setOtpStep(0); setForgotMode(false); setPhoneForm({ phone: "", otp: "", full_name: "", email: "", password: "" }) }

  // ── Step indicator ──────────────────────────────────────────────────
  const StepIndicator = ({ steps, labels }) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${s < otpStep ? "bg-emerald text-white" : s === otpStep ? "bg-saffron text-white" : "bg-sand text-muted"}`}>
              {s < otpStep ? <CheckCircle size={14} /> : s + 1}
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 rounded ${s < otpStep ? "bg-emerald" : "bg-sand"}`} />}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-muted">{labels.map((l, i) => <span key={i}>{l}</span>)}</div>
    </div>
  )

  // ── Phone input ─────────────────────────────────────────────────────
  const PhoneInput = ({ value, onChange, autoFocus }) => (
    <div className="relative">
      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
      <input type="tel" placeholder="+91 98765 43210" value={value} onChange={onChange} required minLength={10} autoFocus={autoFocus} className="input-field pl-10" />
    </div>
  )

  const OtpInput = ({ autoFocus }) => (
    <div>
      <label className="text-xs font-medium text-muted mb-1 block">Enter 6-digit OTP</label>
      <input type="text" placeholder="000000" value={phoneForm.otp} onChange={setPhone("otp")} required maxLength={6} pattern="[0-9]{6}" inputMode="numeric" autoFocus={autoFocus} className="input-field text-center text-2xl tracking-[0.5em] font-mono" />
    </div>
  )

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
      <motion.div className="flex-1 flex items-center justify-center px-6 py-12" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
                <circle cx="20" cy="20" r="18" fill="#1E1B4B"/><path d="M20 8 C20 8, 28 16, 28 22 C28 27 24.4 31 20 31 C15.6 31 12 27 12 22 C12 16 20 8 20 8Z" fill="#E8621A"/><circle cx="20" cy="22" r="5" fill="white"/>
              </svg>
              <span className="font-display font-bold text-2xl text-indigo">Trip<span className="text-saffron">L</span></span>
            </div>
            <h1 className="font-display font-bold text-3xl text-charcoal mb-1">
              {forgotMode ? "Reset Password" : tab === 0 ? (authMode === "login" ? "Welcome back" : "Create account") : "Phone Sign In"}
            </h1>
            <p className="text-muted text-sm">
              {forgotMode ? "Verify your phone and set a new password" : tab === 0 ? (authMode === "login" ? "Sign in to your TripL account" : "Start your Indian journey today") : "Quick sign in with your phone number"}
            </p>
          </div>

          {/* Tab toggle */}
          {!forgotMode && (
            <div className="flex bg-sand rounded-2xl p-1 mb-8">
              {["📧 Email", "📱 Phone"].map((t, i) => (
                <button key={t} onClick={() => { setTab(i); resetAll(); setAuthMode("login") }}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === i ? "bg-white text-saffron shadow-sm" : "text-muted"}`}>{t}</button>
              ))}
            </div>
          )}

          {/* ═══════════ EMAIL TAB ═══════════ */}
          {tab === 0 && !forgotMode && (
            <div className="space-y-4">
              <div className="flex gap-4 mb-2">
                <button onClick={() => setAuthMode("login")} className={`text-sm font-semibold ${authMode === "login" ? "text-saffron border-b-2 border-saffron pb-1" : "text-muted"}`}>Sign In</button>
                <button onClick={() => setAuthMode("register")} className={`text-sm font-semibold ${authMode === "register" ? "text-saffron border-b-2 border-saffron pb-1" : "text-muted"}`}>Register</button>
              </div>

              {authMode === "login" ? (
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                    <input type="email" placeholder="Email address" value={emailForm.email} onChange={setEmail("email")} required className="input-field pl-10" />
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                    <input type={showPw ? "text" : "password"} placeholder="Password" value={emailForm.password} onChange={setEmail("password")} required minLength={8} className="input-field pl-10 pr-10" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 text-base">
                    {loading ? "Please wait..." : "Sign In →"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleEmailRegister} className="space-y-4">
                  <div className="relative"><User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                    <input type="text" placeholder="Full Name" value={regForm.full_name} onChange={setReg("full_name")} required className="input-field pl-10" /></div>
                  <div className="relative"><Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                    <input type="email" placeholder="Email address" value={regForm.email} onChange={setReg("email")} required className="input-field pl-10" /></div>
                  <div className="relative"><Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                    <input type={showPw ? "text" : "password"} placeholder="Password (min 8 characters)" value={regForm.password} onChange={setReg("password")} required minLength={8} className="input-field pl-10 pr-10" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 text-base">
                    {loading ? "Please wait..." : "Create Account →"}
                  </button>
                </form>
              )}

              {authMode === "login" && (
                <button onClick={() => { setForgotMode(true); setTab(1); setOtpStep(0); setPhoneForm({ phone: "", otp: "", full_name: "", email: "", password: "" }) }}
                  className="w-full text-center text-sm text-saffron hover:underline mt-2">
                  <KeyRound size={14} className="inline mr-1" /> Forgot password?
                </button>
              )}
            </div>
          )}

          {/* ═══════════ PHONE TAB (Login / Register) ═══════════ */}
          {tab === 1 && !forgotMode && (
            <div className="space-y-4">
              <StepIndicator steps={[0, 1, 2]} labels={["Phone", "Verify OTP", "Login / Register"]} />

              {/* Step 0: Enter Phone */}
              {otpStep === 0 && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div><label className="text-xs font-medium text-muted mb-1 block">Phone Number</label>
                    <PhoneInput value={phoneForm.phone} onChange={setPhone("phone")} autoFocus /></div>
                  <button type="submit" disabled={otpLoading} className="btn-primary w-full justify-center py-3.5 text-base">
                    {otpLoading ? <Loader2 size={18} className="animate-spin" /> : "Send OTP →"}
                  </button>
                </form>
              )}

              {/* Step 1: Enter OTP */}
              {otpStep === 1 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-center"><div className="text-4xl mb-2">📱</div>
                    <p className="text-sm text-muted">OTP sent to <span className="font-semibold text-charcoal">{otpPhone}</span></p></div>
                  <OtpInput autoFocus />
                  <button type="submit" disabled={otpLoading} className="btn-primary w-full justify-center py-3.5 text-base">
                    {otpLoading ? <Loader2 size={18} className="animate-spin" /> : "Verify OTP →"}
                  </button>
                  <button type="button" onClick={handleSendOtp} disabled={otpTimer > 0}
                    className={`w-full text-center text-sm ${otpTimer > 0 ? "text-muted" : "text-saffron hover:underline"}`}>
                    {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : "Resend OTP"}
                  </button>
                  <button type="button" onClick={resetAll} className="w-full text-center text-sm text-muted hover:text-charcoal">← Change phone number</button>
                </form>
              )}

              {/* Step 2: New user → complete profile */}
              {otpStep === 2 && (
                <form onSubmit={handlePhoneRegister} className="space-y-4">
                  <div className="text-center"><div className="text-4xl mb-2">🎉</div>
                    <p className="text-sm text-muted">New to TripL? Create your account</p></div>
                  <div><label className="text-xs font-medium text-muted mb-1 block">Full Name</label>
                    <div className="relative"><User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                      <input type="text" placeholder="Your full name" value={phoneForm.full_name} onChange={setPhone("full_name")} required minLength={2} className="input-field pl-10" /></div></div>
                  <div><label className="text-xs font-medium text-muted mb-1 block">Email Address</label>
                    <div className="relative"><Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                      <input type="email" placeholder="your@email.com" value={phoneForm.email} onChange={setPhone("email")} required className="input-field pl-10" /></div></div>
                  <div><label className="text-xs font-medium text-muted mb-1 block">Create Password</label>
                    <div className="relative"><Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                      <input type={showNewPw ? "text" : "password"} placeholder="Min 8 characters" value={phoneForm.password} onChange={setPhone("password")} required minLength={8} className="input-field pl-10 pr-10" />
                      <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal">
                        {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
                  <div className="bg-sand/50 rounded-xl p-3 text-center"><p className="text-xs text-muted">Phone: <span className="font-semibold text-charcoal">{otpPhone}</span></p></div>
                  <button type="submit" disabled={otpLoading} className="btn-primary w-full justify-center py-3.5 text-base">
                    {otpLoading ? <Loader2 size={18} className="animate-spin" /> : "Create Account →"}
                  </button>
                  <button type="button" onClick={resetAll} className="w-full text-center text-sm text-muted hover:text-charcoal">← Start over</button>
                </form>
              )}

              {/* Step 3: Existing user → enter password */}
              {otpStep === 3 && (
                <form onSubmit={handleExistingUserLogin} className="space-y-4">
                  <div className="text-center"><div className="text-4xl mb-2">👋</div>
                    <p className="text-sm text-muted">Welcome back! Enter your password to sign in.</p></div>
                  <div className="bg-sand/50 rounded-xl p-3 text-center"><p className="text-xs text-muted">Phone: <span className="font-semibold text-charcoal">{otpPhone}</span></p></div>
                  <div><label className="text-xs font-medium text-muted mb-1 block">Password</label>
                    <div className="relative"><Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                      <input type={showPw ? "text" : "password"} placeholder="Enter your password" value={phoneForm.password} onChange={setPhone("password")} required minLength={8} autoFocus className="input-field pl-10 pr-10" />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal">
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
                  <button type="submit" disabled={otpLoading} className="btn-primary w-full justify-center py-3.5 text-base">
                    {otpLoading ? <Loader2 size={18} className="animate-spin" /> : "Sign In →"}
                  </button>
                  <button type="button" onClick={() => { setOtpStep(1); setPhoneForm(f => ({ ...f, password: "" })) }}
                    className="w-full text-center text-sm text-muted hover:text-charcoal">← Back to OTP</button>
                </form>
              )}
            </div>
          )}

          {/* ═══════════ FORGOT PASSWORD ═══════════ */}
          {forgotMode && (
            <div className="space-y-4">
              <StepIndicator steps={[0, 1, 2]} labels={["Phone", "Verify OTP", "New Password"]} />

              {otpStep === 0 && (
                <form onSubmit={handleForgotSendOtp} className="space-y-4">
                  <div className="text-center"><div className="text-4xl mb-2">🔑</div>
                    <p className="text-sm text-muted">Enter the phone number linked to your account</p></div>
                  <div><label className="text-xs font-medium text-muted mb-1 block">Phone Number</label><PhoneInput value={phoneForm.phone} onChange={setPhone("phone")} autoFocus /></div>
                  <button type="submit" disabled={otpLoading} className="btn-primary w-full justify-center py-3.5 text-base">
                    {otpLoading ? <Loader2 size={18} className="animate-spin" /> : "Send OTP →"}</button>
                  <button type="button" onClick={() => { resetAll(); setTab(0); setAuthMode("login") }} className="w-full text-center text-sm text-muted hover:text-charcoal">← Back to Sign In</button>
                </form>
              )}

              {otpStep === 1 && (
                <form onSubmit={handleForgotVerifyOtp} className="space-y-4">
                  <div className="text-center"><div className="text-4xl mb-2">📱</div>
                    <p className="text-sm text-muted">OTP sent to <span className="font-semibold text-charcoal">{otpPhone}</span></p></div>
                  <OtpInput autoFocus />
                  <button type="submit" disabled={otpLoading} className="btn-primary w-full justify-center py-3.5 text-base">
                    {otpLoading ? <Loader2 size={18} className="animate-spin" /> : "Verify OTP →"}</button>
                  <button type="button" onClick={handleForgotSendOtp} disabled={otpTimer > 0}
                    className={`w-full text-center text-sm ${otpTimer > 0 ? "text-muted" : "text-saffron hover:underline"}`}>
                    {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : "Resend OTP"}</button>
                  <button type="button" onClick={() => setOtpStep(0)} className="w-full text-center text-sm text-muted hover:text-charcoal">← Change phone number</button>
                </form>
              )}

              {otpStep === 2 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="text-center"><div className="text-4xl mb-2">🔒</div>
                    <p className="text-sm text-muted">Create a new password for your account</p></div>
                  <div><label className="text-xs font-medium text-muted mb-1 block">New Password</label>
                    <div className="relative"><Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                      <input type={showNewPw ? "text" : "password"} placeholder="Min 8 characters" value={phoneForm.password} onChange={setPhone("password")} required minLength={8} autoFocus className="input-field pl-10 pr-10" />
                      <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal">
                        {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
                  <button type="submit" disabled={otpLoading} className="btn-primary w-full justify-center py-3.5 text-base">
                    {otpLoading ? <Loader2 size={18} className="animate-spin" /> : "Reset Password →"}</button>
                  <button type="button" onClick={resetAll} className="w-full text-center text-sm text-muted hover:text-charcoal">← Back to Sign In</button>
                </form>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <button onClick={() => navigate("/explore")} className="text-sm text-muted hover:text-saffron transition-colors">Continue without account →</button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
