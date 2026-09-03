import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { generateTrail } from "../api/trail"
import useAppStore from "../store/useAppStore"
import { showToast } from "../components/ui/Toast"
import LoadingMandala from "../components/ui/LoadingMandala"
import { MapPin, Search } from "lucide-react"
import { clsx } from "clsx"

const SUGGESTED_CITIES = [
  "Visakhapatnam","Hyderabad","Goa","Jaipur","Mumbai","Delhi",
  "Bangalore","Kolkata","Udaipur","Pondicherry","Guntur","Vijayawada",
  "Tirupati","Varanasi","Agra","Shimla","Chennai","Chandigarh","Patna","Bhubaneswar",
]
const EXPLORE_MODES = [
  { id: "highlights", emoji: "⚡", label: "Quick Highlights", desc: "Best spots in minimal time" },
  { id: "relaxed", emoji: "🌅", label: "Relaxed Exploration", desc: "Comfortable pace, more breaks" },
  { id: "immersive", emoji: "🏛️", label: "Deep Cultural Immersion", desc: "Go deep into history and culture" },
]
const BUDGETS = [{ val: 500, label: "₹500", emoji: "💸" }, { val: 1000, label: "₹1,000", emoji: "💰" }, { val: 2000, label: "₹2,000", emoji: "💎" }, { val: 5000, label: "₹5,000+", emoji: "👑" }]
const TIMES = [{ val: 2, label: "2 hrs" }, { val: 4, label: "4 hrs" }, { val: 6, label: "6 hrs" }, { val: 8, label: "Full Day" }]
const INTERESTS = [
  { id: "beach", emoji: "🏖️", label: "Beaches" }, { id: "heritage", emoji: "🏛️", label: "Heritage" },
  { id: "religious", emoji: "🛕", label: "Spiritual" }, { id: "nature", emoji: "🌳", label: "Nature" },
  { id: "food", emoji: "🍛", label: "Food" }, { id: "cultural", emoji: "🎭", label: "Culture" },
  { id: "shopping", emoji: "🛍️", label: "Shopping" }, { id: "family", emoji: "👨‍👩‍👧", label: "Family" },
  { id: "park", emoji: "🌿", label: "Parks" }, { id: "viewpoint", emoji: "🏞️", label: "Viewpoints" },
]
const TRANSPORTS = [{ id: "car", emoji: "🚗", label: "Car" }, { id: "bike", emoji: "🏍️", label: "Bike" }, { id: "bus", emoji: "🚌", label: "Bus" }, { id: "auto", emoji: "🛺", label: "Auto" }, { id: "walking", emoji: "🚶", label: "Walking" }]
const PLACE_TYPES = [
  { id: "top_rated", emoji: "⭐", label: "Top Rated", desc: "Highest-rated places in the city" },
  { id: "must_visit", emoji: "🎯", label: "Must Visit", desc: "Iconic spots everyone recommends" },
  { id: "seasonal", emoji: "🌧️", label: "Seasonal", desc: "Best right now — monsoon/season picks" },
  { id: "hidden_gems", emoji: "💎", label: "Hidden Gems", desc: "Underrated spots loved by locals" },
  { id: "offbeat", emoji: "🗺️", label: "Off-beat", desc: "Away from tourist crowds" },
  { id: "instagrammable", emoji: "📸", label: "Photo-worthy", desc: "Most photogenic spots" },
]

const STEPS = ["Location & Mode", "Budget & Time", "Interests", "Place Types", "Transport"]

export default function Planner() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { setTrailResult, setTrailLoading } = useAppStore()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [cityInput, setCityInput] = useState(params.get("city") || "")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [form, setForm] = useState({
    city: params.get("city") || "",
    mode: "relaxed",
    budget: 1000,
    hours: 6,
    interests: ["beach", "heritage"],
    placeTypes: ["must_visit"],
    transport: "bike",
    startTime: "09:00",
  })

  const filteredSuggestions = SUGGESTED_CITIES.filter(c =>
    c.toLowerCase().includes(cityInput.toLowerCase()) && c !== cityInput
  ).slice(0, 8)

  const selectCity = (city) => {
    setCityInput(city)
    setForm(f => ({ ...f, city }))
    setShowSuggestions(false)
  }

  const handleCityInputChange = (val) => {
    setCityInput(val)
    setForm(f => ({ ...f, city: val }))
    setShowSuggestions(val.length > 0)
  }

  const toggleInterest = (id) => {
    setForm(f => ({ ...f, interests: f.interests.includes(id) ? f.interests.filter(x => x !== id) : [...f.interests, id] }))
  }

  const togglePlaceType = (id) => {
    setForm(f => ({ ...f, placeTypes: f.placeTypes.includes(id) ? f.placeTypes.filter(x => x !== id) : [...f.placeTypes, id] }))
  }

  const handleGenerate = async () => {
    if (!form.city.trim()) { showToast("Please enter a city name", "error"); return }
    if (form.interests.length === 0) { showToast("Please select at least one interest", "error"); return }
    setLoading(true)
    setTrailLoading(true)
    try {
      const res = await generateTrail({ city: form.city.trim(), available_hours: form.hours, budget_inr: form.budget, interests: form.interests, place_types: form.placeTypes, transport_mode: form.transport, start_time: form.startTime })
      setTrailResult(res.data)
      navigate("/itinerary")
    } catch (e) {
      showToast(e.response?.data?.detail || "Could not generate itinerary. Is the backend running?", "error")
    } finally {
      setLoading(false)
      setTrailLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ivory">
      <LoadingMandala size={100} text="Our AI is crafting your perfect journey..." />
      <p className="text-muted text-xs mt-4 max-w-xs text-center">Analysing {form.interests.length} interests, ₹{form.budget} budget, {form.hours}h available time in {form.city}...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-ivory py-10">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-saffron/10 text-saffron text-sm font-semibold mb-4">
            ✨ AI Journey Planner
          </div>
          <h1 className="font-display font-bold text-4xl text-indigo mb-2">Plan Your Perfect Journey</h1>
          <p className="text-muted">Tell us your preferences. We'll create a smart, optimized itinerary just for you.</p>
        </motion.div>

        <div className="flex items-center justify-center gap-3 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <motion.div className={clsx("relative flex flex-col items-center cursor-pointer", i <= step ? "opacity-100" : "opacity-40")} onClick={() => i < step && setStep(i)} whileTap={{ scale: 0.9 }}>
                <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm border-2 transition-all duration-200",
                  i < step ? "bg-saffron border-saffron text-white" : i === step ? "border-saffron text-saffron bg-saffron/10" : "border-border text-muted bg-white")}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className="text-xs mt-1 font-medium text-muted hidden sm:block">{s}</span>
              </motion.div>
              {i < STEPS.length - 1 && <div className={clsx("h-px w-8 transition-colors", i < step ? "bg-saffron" : "bg-border")} />}
            </div>
          ))}
        </div>

        <motion.div className="card p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" className="space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="relative">
                  <label className="block text-sm font-semibold text-charcoal mb-3">📍 Which city do you want to explore?</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                      type="text"
                      value={cityInput}
                      onChange={e => handleCityInputChange(e.target.value)}
                      onFocus={() => cityInput && setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder="Type any Indian city name..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white text-charcoal font-medium focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none transition-all"
                    />
                    {cityInput && (
                      <button onClick={() => { setCityInput(""); setForm(f => ({ ...f, city: "" })) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal text-lg">×</button>
                    )}
                  </div>
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-xl border border-border shadow-lg max-h-48 overflow-y-auto">
                      {filteredSuggestions.map(c => (
                        <button key={c} onClick={() => selectCity(c)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-saffron/5 transition-colors">
                          <MapPin className="w-4 h-4 text-saffron" />
                          <span className="text-sm font-medium text-charcoal">{c}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {form.city && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="px-3 py-1 bg-saffron/10 text-saffron rounded-full text-sm font-semibold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> {form.city}
                      </span>
                      <span className="text-xs text-muted">works for any Indian city</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-3">⏰ Start time?</label>
                  <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} className="input-field max-w-xs" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-3">🌏 How do you want to explore?</label>
                  <div className="space-y-3">
                    {EXPLORE_MODES.map(m => (
                      <button key={m.id} onClick={() => setForm(f => ({ ...f, mode: m.id }))}
                        className={clsx("w-full flex items-center gap-4 p-4 rounded-xl border transition-all", form.mode === m.id ? "border-saffron bg-saffron/5" : "border-border hover:border-saffron/40")}>
                        <span className="text-2xl">{m.emoji}</span>
                        <div className="text-left">
                          <div className="font-semibold text-charcoal text-sm">{m.label}</div>
                          <div className="text-muted text-xs">{m.desc}</div>
                        </div>
                        {form.mode === m.id && <div className="ml-auto w-3 h-3 rounded-full bg-saffron" />}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" className="space-y-8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-1">💰 Total Budget</label>
                  <p className="text-muted text-xs mb-4">Includes transport + entry fees</p>
                  <div className="grid grid-cols-4 gap-3">
                    {BUDGETS.map(b => (
                      <button key={b.val} onClick={() => setForm(f => ({ ...f, budget: b.val }))}
                        className={clsx("flex flex-col items-center p-3 rounded-xl border transition-all", form.budget === b.val ? "border-saffron bg-saffron/5" : "border-border hover:border-saffron/40")}>
                        <span className="text-xl mb-1">{b.emoji}</span>
                        <span className={clsx("font-bold text-sm", form.budget === b.val ? "text-saffron" : "text-charcoal")}>{b.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-1">⏱️ Available Time</label>
                  <p className="text-muted text-xs mb-4">How long do you have today?</p>
                  <div className="grid grid-cols-4 gap-3">
                    {TIMES.map(t => (
                      <button key={t.val} onClick={() => setForm(f => ({ ...f, hours: t.val }))}
                        className={clsx("px-4 py-2 rounded-xl border text-sm font-medium transition-all", form.hours === t.val ? "border-saffron bg-saffron text-white" : "border-border text-charcoal hover:border-saffron/40")}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <label className="block text-sm font-semibold text-charcoal mb-1">🎯 Your Interests</label>
                <p className="text-muted text-xs mb-4">Select all that apply — the more you choose, the better your trail.</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {INTERESTS.map(i => (
                    <button key={i.id} onClick={() => toggleInterest(i.id)}
                      className={clsx("flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all", form.interests.includes(i.id) ? "border-saffron bg-saffron/10" : "border-border hover:border-saffron/40")}>
                      <span className="text-2xl">{i.emoji}</span>
                      <span className={clsx("text-xs font-medium", form.interests.includes(i.id) ? "text-saffron" : "text-muted")}>{i.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted mt-4">{form.interests.length} interest{form.interests.length !== 1 ? "s" : ""} selected</p>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <label className="block text-sm font-semibold text-charcoal mb-1">🏷️ Place Types</label>
                <p className="text-muted text-xs mb-4">What kind of places do you want in your itinerary? Select all that apply.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PLACE_TYPES.map(pt => (
                    <button key={pt.id} onClick={() => togglePlaceType(pt.id)}
                      className={clsx("flex flex-col items-center gap-1.5 p-4 rounded-xl border transition-all text-center", form.placeTypes.includes(pt.id) ? "border-saffron bg-saffron/10" : "border-border hover:border-saffron/40")}>
                      <span className="text-2xl">{pt.emoji}</span>
                      <span className={clsx("text-xs font-semibold", form.placeTypes.includes(pt.id) ? "text-saffron" : "text-charcoal")}>{pt.label}</span>
                      <span className="text-[10px] text-muted leading-tight">{pt.desc}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted mt-4">{form.placeTypes.length} type{form.placeTypes.length !== 1 ? 's' : ''} selected</p>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <label className="block text-sm font-semibold text-charcoal mb-1">🚗 Preferred Transport</label>
                <p className="text-muted text-xs mb-4">This determines your travel cost and time estimates.</p>
                <div className="grid grid-cols-5 gap-3 mb-8">
                  {TRANSPORTS.map(t => (
                    <button key={t.id} onClick={() => setForm(f => ({ ...f, transport: t.id }))}
                      className={clsx("flex flex-col items-center gap-2 p-4 rounded-xl border transition-all", form.transport === t.id ? "border-saffron bg-saffron/10" : "border-border hover:border-saffron/40")}>
                      <span className="text-3xl">{t.emoji}</span>
                      <span className={clsx("text-xs font-medium", form.transport === t.id ? "text-saffron" : "text-muted")}>{t.label}</span>
                    </button>
                  ))}
                </div>
                <div className="bg-sand rounded-2xl p-5 border border-border">
                  <h3 className="font-display font-semibold text-charcoal mb-3">Journey Summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {                    [["📍 City", form.city], ["💰 Budget", `₹${form.budget}`], ["⏱️ Time", `${form.hours} hrs`], ["🚗 Transport", form.transport],
                      ["🎯 Interests", form.interests.length + " selected"], ["🏷️ Place Types", form.placeTypes.length + " selected"], ["⏰ Depart", form.startTime],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-border/50 pb-2 last:border-0">
                        <span className="text-muted">{k}</span>
                        <span className="font-semibold text-charcoal">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 mt-8">
            {step > 0 && <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex-1">← Back</button>}
            {step < STEPS.length - 1 ? (
              <button onClick={() => {
                if (step === 0 && !form.city.trim()) { showToast("Please enter a city name", "error"); return }
                setStep(s => s + 1)
              }} className="btn-primary flex-1">Next →</button>
            ) : (
              <button onClick={handleGenerate} className="btn-primary flex-1 text-base py-4">✨ Create My Journey</button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
