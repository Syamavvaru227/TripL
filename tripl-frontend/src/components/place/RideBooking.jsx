import { motion } from "framer-motion"
import { ExternalLink, Car, Bike, Clock, IndianRupee } from "lucide-react"

const RIDES = [
  {
    name: "Uber",
    color: "bg-black",
    textColor: "text-white",
    icon: "🚗",
    deepLink: (from, to) => `https://m.uber.com/go/search-pickup?pickup=${encodeURIComponent(from)}&dropoff=${encodeURIComponent(to)}`,
    webLink: (from, to) => `https://www.uber.com/search?q=${encodeURIComponent(to)}`,
    modes: ["Uber Go", "Uber Auto", "Uber Premier"],
    approxMultiplier: 1.0,
  },
  {
    name: "Rapido",
    color: "bg-yellow-400",
    textColor: "text-black",
    icon: "🏍️",
    deepLink: (from, to) => `https://rapido.bike/ride?pickup=${encodeURIComponent(from)}&dropoff=${encodeURIComponent(to)}`,
    webLink: (from, to) => `https://rapido.bike`,
    modes: ["Bike", "Auto", "Cab"],
    approxMultiplier: 0.7,
  },
  {
    name: "Ola",
    color: "bg-blue-600",
    textColor: "text-white",
    icon: "🛺",
    deepLink: (from, to) => `https://book.olacabs.com/?pickup=${encodeURIComponent(from)}&drop=${encodeURIComponent(to)}`,
    webLink: (from, to) => `https://www.olacabs.com`,
    modes: ["Ola Bike", "Ola Auto", "Ola Mini", "Ola Prime"],
    approxMultiplier: 0.9,
  },
]

export default function RideBooking({ fromName, toName, distanceKm }) {
  const baseCostPerKm = 12 // average auto cost

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Car size={20} className="text-saffron" />
        <h3 className="font-display font-semibold text-lg text-charcoal">Book a Ride</h3>
      </div>
      <p className="text-muted text-sm mb-4">
        Compare and book rides from {fromName} to {toName} ({distanceKm?.toFixed(1) || "?.?"} km)
      </p>

      <div className="grid gap-3">
        {RIDES.map((ride, i) => {
          const estimatedCost = Math.round(distanceKm * baseCostPerKm * ride.approxMultiplier)
          const estimatedTime = Math.round((distanceKm / 25) * 60) // ~25 km/h average

          return (
            <motion.div
              key={ride.name}
              className="card p-4 hover:shadow-lg transition-all"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${ride.color} ${ride.textColor} rounded-xl flex items-center justify-center text-2xl`}>
                    {ride.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal">{ride.name}</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ride.modes.map(m => (
                        <span key={m} className="text-[10px] bg-sand text-muted px-1.5 py-0.5 rounded-full">{m}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-charcoal font-bold">
                    <IndianRupee size={14} />
                    {estimatedCost}
                  </div>
                  <div className="flex items-center gap-1 text-muted text-xs">
                    <Clock size={10} />
                    ~{estimatedTime} min
                  </div>
                </div>
              </div>
              <a
                href={ride.deepLink(fromName, toName)}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl ${ride.color} ${ride.textColor} font-semibold text-sm hover:opacity-90 transition-opacity`}
              >
                Book on {ride.name} <ExternalLink size={14} />
              </a>
            </motion.div>
          )
        })}
      </div>

      <div className="bg-sand/50 rounded-xl p-3 text-center">
        <p className="text-muted text-xs">
          💡 Prices are estimates. Actual fare depends on demand, traffic, and ride type.
        </p>
      </div>
    </div>
  )
}
