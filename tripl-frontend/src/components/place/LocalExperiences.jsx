const EXPERIENCES = [
  { emoji: "🍛", title: "Authentic Local Cuisine", tags: ["Street Food", "Thali", "Regional"], desc: "Savour traditional dishes prepared by local families using age-old recipes passed through generations.", badge: "Must Try" },
  { emoji: "🧑‍🎨", title: "Artisan Workshops", tags: ["Handicrafts", "Cultural", "Budget"], desc: "Meet local craftspeople and learn traditional art forms — from weaving and pottery to block printing.", badge: "Unique" },
  { emoji: "🎭", title: "Cultural Performances", tags: ["Dance", "Music", "Evening"], desc: "Experience classical Indian dance forms, folk music, and theatre — living traditions performed for visitors.", badge: "Popular" },
  { emoji: "🛍️", title: "Local Markets & Bazaars", tags: ["Shopping", "Spices", "Textiles"], desc: "Wander through bustling local markets filled with spices, textiles, jewellery, and handcrafted souvenirs.", badge: "Family" },
  { emoji: "🏡", title: "Homestay Experiences", tags: ["Authentic", "Community", "Eco"], desc: "Stay with local families and experience true Indian hospitality, home-cooked meals, and village life.", badge: "Eco-Friendly" },
  { emoji: "🎉", title: "Festival Calendar", tags: ["Seasonal", "Cultural", "Free"], desc: "Time your visit with local festivals for an unforgettable experience of India's living cultural heritage.", badge: "Seasonal" },
]
import { motion } from "framer-motion"

const BADGE_COLORS = { "Must Try": "saffron", "Unique": "peacock", "Popular": "emerald", "Family": "indigo", "Eco-Friendly": "emerald", "Seasonal": "terracotta" }

export default function LocalExperiences() {
  return (
    <div>
      <motion.div className="mb-6"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <h3 className="font-display font-bold text-2xl text-charcoal mb-1">Don&apos;t Just Visit. <span className="text-gradient">Experience India.</span></h3>
        <p className="text-muted text-sm">Connect with local communities, taste authentic flavours, and discover hidden traditions.</p>
      </motion.div>
      <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
      >
        {EXPERIENCES.map(exp => {
          const bc = BADGE_COLORS[exp.badge] || "muted"
        return (
          <motion.div key={exp.title} className="card p-5 group hover:border-saffron/20 border border-transparent transition-colors"
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{exp.emoji}</span>
                <span className={`badge badge-${bc}`}>{exp.badge}</span>
              </div>
              <h4 className="font-display font-semibold text-charcoal mb-1.5">{exp.title}</h4>
              <p className="text-muted text-sm leading-relaxed mb-3">{exp.desc}</p>
              <div className="flex flex-wrap gap-1">
                {exp.tags.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-sand text-muted font-medium">{t}</span>)}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
