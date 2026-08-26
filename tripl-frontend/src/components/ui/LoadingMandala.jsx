import { motion } from "framer-motion"

export default function LoadingMandala({ size = 80, text = "Discovering places..." }) {
  return (
    <motion.div className="flex flex-col items-center justify-center gap-6 py-16"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" width={size} height={size} className="mandala-ring-1">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#E8621A" strokeWidth="2" strokeDasharray="8 4" />
          {[0,45,90,135,180,225,270,315].map((deg,i) => (
            <polygon key={i} points="50,8 53,15 47,15" fill="#E8621A" opacity="0.7" transform={`rotate(${deg},50,50)`} />
          ))}
        </svg>
        <svg viewBox="0 0 100 100" width={size * 0.7} height={size * 0.7} className="mandala-ring-2 absolute top-1/2 left-1/2" style={{marginLeft: `-${size*0.35}px`, marginTop: `-${size*0.35}px`}}>
          <circle cx="50" cy="50" r="40" fill="none" stroke="#006B75" strokeWidth="2" strokeDasharray="6 6" />
          {[0,60,120,180,240,300].map((deg,i) => (
            <circle key={i} cx="50" cy="14" r="4" fill="#006B75" opacity="0.8" transform={`rotate(${deg},50,50)`} />
          ))}
        </svg>
        <svg viewBox="0 0 100 100" width={size * 0.4} height={size * 0.4} className="mandala-ring-3 absolute top-1/2 left-1/2" style={{marginLeft: `-${size*0.2}px`, marginTop: `-${size*0.2}px`}}>
          <circle cx="50" cy="50" r="30" fill="#E8621A" opacity="0.15" />
          <circle cx="50" cy="50" r="15" fill="#006B75" opacity="0.25" />
          <circle cx="50" cy="50" r="5" fill="#E8621A" />
        </svg>
      </div>
      {text && <motion.p className="text-muted text-sm font-medium"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >{text}</motion.p>}
    </motion.div>
  )
}
