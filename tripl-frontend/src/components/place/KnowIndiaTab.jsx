import { motion } from "framer-motion"

export default function KnowIndiaTab({ place }) {
  const sections = [
    {
      emoji: "🏛️", title: "Discover the Story",
      content: place.description || "This destination holds deep historical and cultural significance for the region, representing centuries of architectural and artistic achievement that continue to inspire visitors today."
    },
    { emoji: "🎉", title: "Local Festivals", content: "The region celebrates vibrant festivals throughout the year, with special events that bring communities together in celebration of their shared heritage and traditions." },
    { emoji: "🍛", title: "Local Cuisine", content: "The local cuisine features authentic flavors unique to this region, with traditional dishes prepared using age-old recipes passed down through generations." },
    { emoji: "🧘", title: "Cultural Etiquette", content: "Visitors are encouraged to dress modestly, especially at religious sites. Photography may be restricted in certain areas — always look for signs or ask locals." },
    { emoji: "✨", title: "Did You Know?", content: "This destination has unique stories and legends associated with it that make it special beyond just its visual appeal." },
  ]
  return (
    <div className="space-y-6">
      {/* Pull quote */}
      <motion.div className="relative bg-gradient-to-br from-sand to-ivory rounded-2xl p-6 border border-border overflow-hidden">
        <div className="absolute top-2 left-4 text-8xl text-saffron/10 font-serif leading-none select-none">"</div>
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%"><defs><pattern id="kp" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="15" fill="none" stroke="#E8621A" strokeWidth="0.5" />
            <circle cx="20" cy="20" r="5" fill="#E8621A" opacity="0.3" />
          </pattern></defs><rect width="100%" height="100%" fill="url(#kp)" /></svg>
        </div>
        <p className="relative font-display font-medium text-lg text-indigo leading-relaxed italic">
          "Every destination in India carries within it centuries of stories — of kings and commoners, of devotion and discovery, of beauty crafted by human hands and shaped by nature."
        </p>
        <p className="text-saffron text-sm font-semibold mt-3 relative">— TripL Cultural Guide</p>
      </motion.div>
      {/* Sections */}
      <motion.div className="grid sm:grid-cols-2 gap-4"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
      >
        {sections.map(s => (
          <motion.div key={s.title} className="card p-5"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{s.emoji}</span>
              <h4 className="font-display font-semibold text-charcoal">{s.title}</h4>
            </div>
            <p className="text-muted text-sm leading-relaxed">{s.content}</p>
          </motion.div>
        ))}
      </motion.div>
      {/* Responsible travel callout */}
      <div className="bg-emerald/5 border border-emerald/20 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-2xl shrink-0">♻️</span>
        <div>
          <p className="font-semibold text-emerald text-sm mb-1">Travel Responsibly</p>
          <p className="text-muted text-xs leading-relaxed">Support local artisans, avoid single-use plastics, respect the natural environment, and engage with communities meaningfully. Your choices matter.</p>
        </div>
      </div>
    </div>
  )
}
