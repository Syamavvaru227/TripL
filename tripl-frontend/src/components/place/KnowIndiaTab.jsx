import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getWikiHistory } from "../../api/places"
import LoadingMandala from "../ui/LoadingMandala"

export default function KnowIndiaTab({ place }) {
  const [wiki, setWiki] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!place?.name) return
    setLoading(true)
    getWikiHistory(place.name)
      .then(r => setWiki(r.data))
      .catch(() => setWiki(null))
      .finally(() => setLoading(false))
  }, [place?.name])

  if (loading) return <div className="py-8"><LoadingMandala text="Loading history..." /></div>

  const summary = wiki?.summary || place.description || "A destination with rich cultural heritage."
  const history = wiki?.history || ""
  const famousFor = wiki?.famous_for || ""
  const facts = wiki?.facts || []

  return (
    <div className="space-y-6">
      {/* Hero quote */}
      <motion.div className="relative bg-gradient-to-br from-sand to-ivory rounded-2xl p-6 border border-border overflow-hidden"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="absolute top-2 left-4 text-8xl text-saffron/10 font-serif leading-none select-none">"</div>
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%"><defs><pattern id="kp" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="15" fill="none" stroke="#E8621A" strokeWidth="0.5" />
            <circle cx="20" cy="20" r="5" fill="#E8621A" opacity="0.3" />
          </pattern></defs><rect width="100%" height="100%" fill="url(#kp)" /></svg>
        </div>
        <p className="relative font-display font-medium text-lg text-indigo leading-relaxed italic">
          "Every destination in India carries within it centuries of stories — of kings and commoners, of devotion and discovery."
        </p>
        <p className="text-saffron text-sm font-semibold mt-3 relative">— TripL Cultural Guide</p>
      </motion.div>

      {/* Summary */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🏛️</span>
          <h3 className="font-display font-semibold text-xl text-charcoal">About {place.name}</h3>
        </div>
        <p className="text-muted leading-relaxed">{summary}</p>
        {wiki?.article_title && (
          <p className="text-xs text-muted/60 mt-3 italic">Source: Wikipedia — {wiki.article_title}</p>
        )}
      </div>

      {/* History */}
      {history && (
        <motion.div className="card p-6"
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📜</span>
            <h3 className="font-display font-semibold text-xl text-charcoal">History</h3>
          </div>
          <div className="text-muted leading-relaxed space-y-3">
            {history.split("\n\n").filter(Boolean).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Famous For */}
      {famousFor && (
        <motion.div className="card p-6"
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">⭐</span>
            <h3 className="font-display font-semibold text-xl text-charcoal">Famous For</h3>
          </div>
          <p className="text-muted leading-relaxed">{famousFor}</p>
        </motion.div>
      )}

      {/* Interesting Facts */}
      {facts.length > 0 && (
        <motion.div className="grid sm:grid-cols-2 gap-4"
          initial="hidden" whileInView="show" viewport={{ once: true }}
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}>
          {facts.map((fact, i) => (
            <motion.div key={i} className="card p-5"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💡</span>
                <h4 className="font-display font-semibold text-charcoal text-sm">Interesting Fact {i + 1}</h4>
              </div>
              <p className="text-muted text-sm leading-relaxed">{fact}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Local Cuisine */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🍛</span>
          <h4 className="font-display font-semibold text-charcoal">Local Cuisine</h4>
        </div>
        <p className="text-muted text-sm leading-relaxed">
          Explore authentic flavors of {place.city} — from street food to traditional thalis, every meal tells a story of the region's culinary heritage.
        </p>
      </div>

      {/* Cultural Etiquette */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🙏</span>
          <h4 className="font-display font-semibold text-charcoal">Cultural Etiquette</h4>
        </div>
        <p className="text-muted text-sm leading-relaxed">
          Dress modestly at religious sites. Remove footwear before entering temples. Photography may be restricted in certain areas — always look for signs or ask locals.
        </p>
      </div>

      {/* Responsible travel */}
      <div className="bg-emerald/5 border border-emerald/20 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-2xl shrink-0">♻️</span>
        <div>
          <p className="font-semibold text-emerald text-sm mb-1">Travel Responsibly</p>
          <p className="text-muted text-xs leading-relaxed">Support local artisans, avoid single-use plastics, respect the natural environment, and engage with communities meaningfully.</p>
        </div>
      </div>
    </div>
  )
}
