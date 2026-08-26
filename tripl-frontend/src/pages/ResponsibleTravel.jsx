import { motion } from "framer-motion"
import { Leaf, Users, Heart, AlertCircle, Camera, Trash2 } from "lucide-react"
import MandalaDivider from "../components/ui/MandalaDivider"

const TIPS = [
  { icon: "♻️", title: "Avoid Plastic", desc: "Carry a reusable water bottle and bag. Refuse single-use plastics at all times." },
  { icon: "🙏", title: "Respect Local Culture", desc: "Dress modestly at religious sites. Remove shoes when required and maintain silence." },
  { icon: "📸", title: "Photography Etiquette", desc: "Always ask permission before photographing people. Check signs for restricted zones." },
  { icon: "🌿", title: "Stay on the Path", desc: "Don't trample vegetation or disturb wildlife. Stick to marked trails in nature areas." },
  { icon: "🏘️", title: "Support Local", desc: "Buy from local vendors, eat at family-run restaurants, and choose local guides." },
  { icon: "🗑️", title: "Leave No Trace", desc: "Take all your waste with you. Never litter at heritage sites, beaches, or forests." },
  { icon: "🤝", title: "Fair Pay", desc: "Pay fair prices to local artisans, guides, and service providers. Avoid aggressive bargaining." },
  { icon: "🌊", title: "Protect Nature", desc: "Do not feed animals, collect coral, or damage natural formations. Observe, don't disturb." },
]

export default function ResponsibleTravel() {
  return (
    <div className="min-h-screen bg-ivory pb-20">
      <motion.div className="bg-gradient-to-br from-emerald to-peacock py-16 px-4 text-white text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-6xl mb-4">🌱</div>
        <h1 className="font-display font-bold text-4xl sm:text-5xl mb-3">Travel Responsibly</h1>
        <p className="text-white/80 text-lg max-w-xl mx-auto">Explore India in ways that preserve its beauty, culture, and communities for generations to come.</p>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        >
            {[
            { emoji: "🏘️", title: "Support 500+ Local Communities", color: "peacock", desc: "Every responsible travel choice directly benefits local families, artisans, and small businesses." },
            { emoji: "🌿", title: "Protect India's Natural Heritage", color: "emerald", desc: "From Himalayan ecosystems to coastal mangroves, responsible tourism helps preserve these irreplaceable habitats." },
            { emoji: "🧑‍🎨", title: "Preserve Traditional Crafts", color: "saffron", desc: "Buying from local artisans keeps ancient crafts alive and provides sustainable livelihoods." },
          ].map(c => (
            <motion.div key={c.title} className="card p-5"
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            >
              <span className="text-4xl mb-3 block">{c.emoji}</span>
              <h3 className="font-display font-semibold text-charcoal mb-2">{c.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <MandalaDivider text="Guidelines" />
        <h2 className="font-display font-bold text-2xl text-charcoal text-center mb-8">Responsible Travel Guidelines</h2>

        <motion.div className="grid sm:grid-cols-2 gap-4 mb-12"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
        >
          {TIPS.map(tip => (
            <motion.div key={tip.title} className="card p-5 flex items-start gap-4"
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
            >
              <span className="text-3xl shrink-0">{tip.icon}</span>
              <div>
                <h4 className="font-display font-semibold text-charcoal mb-1">{tip.title}</h4>
                <p className="text-muted text-sm leading-relaxed">{tip.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div className="bg-gradient-to-br from-indigo to-peacock rounded-3xl p-8 text-white text-center">
          <div className="text-4xl mb-4">🌏</div>
          <h3 className="font-display font-bold text-2xl mb-3">India is Yours to Protect</h3>
          <p className="text-white/80 max-w-lg mx-auto leading-relaxed">When you travel responsibly, you become a guardian of India's incredible heritage and natural wonders. Every small action counts.</p>
        </motion.div>
      </div>
    </div>
  )
}
