import { motion } from "framer-motion"
import HeroSection from "../components/landing/HeroSection"
import FeaturesSection from "../components/landing/FeaturesSection"
import CitiesCarousel from "../components/landing/CitiesCarousel"
import HowItWorks from "../components/landing/HowItWorks"
import MandalaDivider from "../components/ui/MandalaDivider"
import { useNavigate } from "react-router-dom"

export default function Landing() {
  const navigate = useNavigate()
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <CitiesCarousel />
      <MandalaDivider text="Explore India" />
      {/* CTA Banner */}
      <motion.section className="py-20 bg-gradient-to-br from-indigo via-peacock to-indigo text-white relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%"><defs><pattern id="ctapat" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="40" cy="40" r="35" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="40" cy="40" r="20" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="40" cy="40" r="5" fill="white" opacity="0.3" />
          </pattern></defs><rect width="100%" height="100%" fill="url(#ctapat)" /></svg>
        </div>
        <div className="relative max-w-3xl mx-auto text-center px-4">
          <div className="text-5xl mb-4">🕉️</div>
          <h2 className="font-display font-bold text-4xl sm:text-5xl mb-4">Explore India.<br />Understand India.<br /><span className="text-saffron">Experience India.</span></h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">Don't just visit. Discover the stories, flavours, and soul behind every destination.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate("/explore?city=Visakhapatnam")} className="btn-primary">Start Exploring</button>
            <button onClick={() => navigate("/plan")} className="btn-secondary border-white/30 text-white hover:bg-white hover:text-indigo">Plan My Journey</button>
          </div>
        </div>
      </motion.section>
    </div>
  )
}
