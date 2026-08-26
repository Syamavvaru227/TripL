import { motion } from "framer-motion"
import { MapPin, Filter, Zap, Navigation } from "lucide-react"

const STEPS = [
  { n: "01", icon: MapPin, color: "saffron", title: "Enter Your Location", desc: "Type any city or landmark in India. We geocode it instantly and find everything within 30 km." },
  { n: "02", icon: Filter, color: "peacock", title: "Filter & Discover", desc: "Browse by category — beaches, heritage, nature, food. Filter by rating, distance, budget, and opening hours." },
  { n: "03", icon: Zap, color: "emerald", title: "AI Plans Your Journey", desc: "Set your time, budget, and interests. Our smart algorithm creates a perfectly optimized itinerary." },
  { n: "04", icon: Navigation, color: "terracotta", title: "Navigate & Experience", desc: "Follow your personalized trail. Discover cultural stories, local food, and responsible tourism tips." },
]

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-saffron text-sm font-semibold uppercase tracking-widest mb-2">Simple. Smart. Indian.</p>
          <h2 className="section-heading text-3xl sm:text-4xl">How TripL Works</h2>
        </motion.div>
        <div className="relative">
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-saffron via-peacock to-terracotta" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                className="relative flex flex-col items-center text-center group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.12 }}
              >
                <div className={`w-20 h-20 rounded-full bg-${s.color}/10 border-2 border-${s.color}/30 flex items-center justify-center mb-4 relative z-10 bg-white group-hover:scale-110 transition-transform duration-200`}>
                  <s.icon size={28} className={`text-${s.color}`} />
                  <span className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-${s.color} text-white text-xs font-bold flex items-center justify-center`}>{s.n}</span>
                </div>
                <h3 className="font-display font-semibold text-lg text-charcoal mb-2">{s.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
