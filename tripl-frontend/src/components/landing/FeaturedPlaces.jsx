import { motion } from "framer-motion"
import { MapPin, Star, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

const FEATURED = [
  {
    name: "Taj Mahal",
    city: "Agra",
    state: "Uttar Pradesh",
    desc: "One of the Seven Wonders of the World — a symbol of eternal love built by Emperor Shah Jahan.",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&h=400&fit=crop",
    emoji: "🕌",
    gradient: "from-saffron to-terracotta",
    category: "Heritage",
  },
  {
    name: "Hawa Mahal",
    city: "Jaipur",
    state: "Rajasthan",
    desc: "Palace of Winds — iconic pink sandstone facade with 953 latticed windows for royal women.",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&h=400&fit=crop",
    emoji: "🏯",
    gradient: "from-terracotta to-saffron",
    category: "Heritage",
  },
  {
    name: "Backwaters",
    city: "Alleppey",
    state: "Kerala",
    desc: "Serene network of lagoons, lakes, and canals fringed by coconut palms — perfect houseboat journey.",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&h=400&fit=crop",
    emoji: "🛶",
    gradient: "from-emerald to-peacock",
    category: "Nature",
  },
  {
    name: "Goa Beaches",
    city: "Goa",
    state: "Goa",
    desc: "Golden sandy beaches, Portuguese heritage churches, vibrant nightlife, and coconut groves.",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&h=400&fit=crop",
    emoji: "🏖️",
    gradient: "from-peacock to-saffron",
    category: "Beach",
  },
  {
    name: "Varanasi Ghats",
    city: "Varanasi",
    state: "Uttar Pradesh",
    desc: "Spiritual heart of India — ancient ghats along the Ganges with mesmerizing evening aarti ceremonies.",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600&h=400&fit=crop",
    emoji: "🛕",
    gradient: "from-saffron to-indigo",
    category: "Religious",
  },
  {
    name: "Mysore Palace",
    city: "Mysore",
    state: "Karnataka",
    desc: "Magnificent Indo-Saracenic palace illuminated with 97,000 lights — a royal spectacle.",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1600112356915-089fbaa7f718?w=600&h=400&fit=crop",
    emoji: "🏰",
    gradient: "from-indigo to-peacock",
    category: "Heritage",
  },
]

export default function FeaturedPlaces() {
  const navigate = useNavigate()
  return (
    <section className="py-20 bg-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-saffron text-sm font-semibold uppercase tracking-wider">Must Visit</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mt-2">
            India's <span className="text-saffron">Iconic</span> Destinations
          </h2>
          <p className="text-muted mt-3 max-w-lg mx-auto">
            Explore India's most celebrated landmarks, heritage sites, and natural wonders.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED.map((place, i) => (
            <motion.div
              key={place.name}
              className="card overflow-hidden cursor-pointer group"
              onClick={() => navigate(`/explore?city=${place.city}`)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(28,25,23,0.12)" }}
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex" }}
                />
                <div className={`bg-gradient-to-br ${place.gradient} w-full h-full hidden items-center justify-center absolute inset-0`}>
                  <span className="text-6xl opacity-80">{place.emoji}</span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-white/90 backdrop-blur-sm text-charcoal text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Star size={10} className="text-amber-400 fill-amber-400" />
                    {place.rating}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="bg-saffron/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    {place.category}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-display font-bold text-lg text-charcoal group-hover:text-saffron transition-colors">
                  {place.name}
                </h3>
                <div className="flex items-center gap-1 text-muted text-xs mt-1 mb-2">
                  <MapPin size={10} />
                  {place.city}, {place.state}
                </div>
                <p className="text-muted text-sm leading-relaxed line-clamp-2">{place.desc}</p>
                <div className="mt-4 flex items-center text-saffron text-sm font-semibold group-hover:gap-2 gap-1 transition-all">
                  Explore <ArrowRight size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
