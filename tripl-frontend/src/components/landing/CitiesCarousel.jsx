import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { MapPin, ChevronRight } from "lucide-react"

const CITIES = [
  { name: "Visakhapatnam", state: "Andhra Pradesh", places: 12, emoji: "🌊", gradient: "from-peacock to-indigo", desc: "Pearl of the East — beaches, parks, and heritage" },
  { name: "Hyderabad", state: "Telangana", places: 10, emoji: "🕌", gradient: "from-saffron to-terracotta", desc: "City of Pearls — Charminar, biryani, and tech" },
  { name: "Goa", state: "Goa", places: 10, emoji: "🏖️", gradient: "from-emerald to-peacock", desc: "Golden beaches, Portuguese heritage, and sunsets" },
  { name: "Jaipur", state: "Rajasthan", places: 10, emoji: "🏯", gradient: "from-terracotta to-saffron", desc: "Pink City — majestic forts and Rajput grandeur" },
  { name: "Mumbai", state: "Maharashtra", places: 10, emoji: "🏙️", gradient: "from-indigo to-peacock", desc: "City of Dreams — Gateway, beaches, and Bollywood" },
  { name: "Delhi", state: "Delhi", places: 10, emoji: "🏛️", gradient: "from-saffron to-indigo", desc: "Capital City — Mughal heritage and modern India" },
  { name: "Bangalore", state: "Karnataka", places: 10, emoji: "🌳", gradient: "from-emerald to-indigo", desc: "Garden City — tech hub, parks, and palaces" },
  { name: "Kolkata", state: "West Bengal", places: 8, emoji: "🎭", gradient: "from-terracotta to-peacock", desc: "City of Joy — Victoria Memorial, art, and culture" },
  { name: "Udaipur", state: "Rajasthan", places: 8, emoji: "🏰", gradient: "from-saffron to-emerald", desc: "City of Lakes — palaces, romance, and Aravallis" },
  { name: "Pondicherry", state: "Tamil Nadu", places: 8, emoji: "🇫🇷", gradient: "from-peacock to-saffron", desc: "French Riviera of the East — beaches and Auroville" },
]

export default function CitiesCarousel() {
  const navigate = useNavigate()
  return (
    <section className="py-20 bg-sand/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex items-end justify-between mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <p className="text-saffron text-sm font-semibold uppercase tracking-widest mb-2">Ready to Explore</p>
            <h2 className="section-heading text-3xl sm:text-4xl">Discover These Cities</h2>
          </div>
          <a href="/explore" className="hidden sm:flex items-center gap-1 text-saffron font-semibold text-sm hover:gap-2 transition-all">View All <ChevronRight size={16} /></a>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CITIES.map((c, i) => (
            <motion.div
              key={c.name}
              onClick={() => navigate(`/explore?city=${c.name}`)}
              className="card text-left group cursor-pointer overflow-hidden"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className={`h-40 bg-gradient-to-br ${c.gradient} flex items-end justify-between p-5 relative overflow-hidden`}>
                <div className="absolute top-4 right-4 text-5xl opacity-80 group-hover:scale-110 transition-transform duration-300">{c.emoji}</div>
                <div className="absolute inset-0 opacity-10">
                  <svg width="100%" height="100%"><defs><pattern id={`p${i}`} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                    <circle cx="15" cy="15" r="10" fill="none" stroke="white" strokeWidth="0.5" />
                  </pattern></defs><rect width="100%" height="100%" fill={`url(#p${i})`} /></svg>
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-white">{c.name}</h3>
                  <p className="text-white/70 text-xs">{c.state}</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-muted text-sm leading-relaxed mb-3">{c.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold bg-saffron/10 text-saffron px-2.5 py-1 rounded-full">
                    <MapPin size={10} className="inline mr-1" />{c.places} places
                  </span>
                  <ChevronRight size={16} className="text-saffron group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
