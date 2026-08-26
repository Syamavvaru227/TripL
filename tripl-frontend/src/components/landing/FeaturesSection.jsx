import { motion } from "framer-motion"
import { MapPin, Zap, Shield, Globe } from "lucide-react"
import MandalaDivider from "../ui/MandalaDivider"

const FEATURES = [
  { icon: MapPin, color: "saffron", title: "30 km Discovery Radius", desc: "Instantly discover all tourist places, heritage sites, beaches, and hidden gems within 30 km of any location in India.", emoji: "📍" },
  { icon: Zap, color: "peacock", title: "AI-Generated Itineraries", desc: "Our smart algorithm creates optimized travel plans based on your budget, time, interests, and preferred transport mode.", emoji: "✨" },
  { icon: Globe, color: "emerald", title: "Cultural Discovery", desc: "Go beyond just visiting. Understand India's rich history, local traditions, festivals, and cultural etiquette at every destination.", emoji: "🏛️" },
  { icon: Shield, color: "terracotta", title: "Responsible Tourism", desc: "Travel sustainably. Support local artisans, eco-friendly destinations, and community-driven experiences across India.", emoji: "♻️" },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MandalaDivider text="Why TripL" />
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-heading text-4xl sm:text-5xl mb-4">
            Intelligent Travel.<br /><span className="text-gradient">Rooted in India.</span>
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">From AI-powered planning to cultural storytelling — everything you need to explore India intelligently.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="card p-6 group"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className={`w-12 h-12 rounded-2xl bg-${f.color}/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-200`}>
                {f.emoji}
              </div>
              <h3 className="font-display font-semibold text-lg text-charcoal mb-2">{f.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
