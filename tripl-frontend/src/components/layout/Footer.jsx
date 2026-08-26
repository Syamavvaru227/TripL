import { Link } from "react-router-dom"
export default function Footer() {
  return (
    <footer className="bg-indigo text-white/80 pt-16 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <svg viewBox="0 0 40 40" fill="none" width="28" height="28">
                <circle cx="20" cy="20" r="18" fill="white" opacity="0.15"/>
                <path d="M20 8 C20 8, 28 16, 28 22 C28 27 24.4 31 20 31 C15.6 31 12 27 12 22 C12 16 20 8 20 8Z" fill="#E8621A"/>
                <circle cx="20" cy="22" r="5" fill="white"/>
              </svg>
              <span className="font-display font-bold text-xl text-white">Trip<span className="text-saffron">L</span></span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">Discover India within 30 km. AI-powered itineraries, cultural stories, and responsible travel.</p>
            <p className="text-xs text-white/40 mt-4">Made with ❤️ for Smart India Hackathon 2025</p>
          </div>
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              {["Visakhapatnam","Hyderabad","Goa","Jaipur","Mumbai","Delhi"].map(c => (
                <li key={c}><Link to={`/explore?city=${c}`} className="text-white/60 hover:text-saffron transition-colors">{c}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Features</h4>
            <ul className="space-y-2 text-sm">
              {[["Plan Journey","/plan"],["Saved Places","/saved"],["Travel Responsibly","/responsible"]].map(([l,t]) => (
                <li key={t}><Link to={t} className="text-white/60 hover:text-saffron transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Languages</h4>
            <ul className="space-y-2 text-sm text-white/60">
              {["English","हिन्दी","తెలుగు","தமிழ்","മലയാളം"].map(l => <li key={l}>{l}</li>)}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <p>© 2025 TripL. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white/70 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/70 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/70 transition-colors">API Docs</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
