import { motion, AnimatePresence } from "framer-motion"
import { useLocation } from "react-router-dom"

// ─── Page Transition Wrapper ─────────────────────────────────────────────────
// Wraps entire pages with a smooth fade + slide-up entrance animation.
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

const pageTransition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.35,
}

export function PageTransition({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      {children}
    </motion.div>
  )
}

// ─── AnimatePresence for Route Changes ──────────────────────────────────────
export function AnimatedRoutes({ children }) {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Stagger Reveal Container ───────────────────────────────────────────────
// Use on a parent to stagger-animate its children on mount.
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

export function StaggerReveal({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.08, delayChildren: delay },
        },
      }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Stagger Item (child of StaggerReveal) ─────────────────────────────────
const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
}

export function StaggerItem({ children, className = "" }) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  )
}

// ─── Fade In (scroll-triggered) ─────────────────────────────────────────────
export function FadeIn({ children, className = "", delay = 0, direction = "up", distance = 24 }) {
  const dirMap = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  }
  return (
    <motion.div
      initial={{ opacity: 0, ...dirMap[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Scale In (for cards, badges) ───────────────────────────────────────────
export function ScaleIn({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay, type: "spring", stiffness: 300, damping: 24 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Slide In from direction ────────────────────────────────────────────────
export function SlideIn({ children, className = "", from = "left", delay = 0 }) {
  const variants = {
    left: { initial: { x: -40, opacity: 0 }, animate: { x: 0, opacity: 1 } },
    right: { initial: { x: 40, opacity: 0 }, animate: { x: 0, opacity: 1 } },
    up: { initial: { y: 40, opacity: 0 }, animate: { y: 0, opacity: 1 } },
    down: { initial: { y: -40, opacity: 0 }, animate: { y: 0, opacity: 1 } },
  }
  const v = variants[from] || variants.left
  return (
    <motion.div
      initial={v.initial}
      whileInView={v.animate}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Hover Card (interactive lift) ──────────────────────────────────────────
export function HoverCard({ children, className = "", onClick }) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(28,25,23,0.12)" }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Button Press ───────────────────────────────────────────────────────────
export function PressButton({ children, className = "", onClick, disabled }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </motion.button>
  )
}

// ─── Timeline Line Draw ─────────────────────────────────────────────────────
export function TimelineLine({ className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ scaleY: 0 }}
      whileInView={{ scaleY: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ transformOrigin: "top" }}
    />
  )
}

// ─── Counter (animated number) ──────────────────────────────────────────────
export function AnimatedCounter({ value, className = "" }) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 200, damping: 12 }}
    >
      {value}
    </motion.span>
  )
}

// ─── Navbar slide-down ──────────────────────────────────────────────────────
export function NavbarAnimate({ children, className = "" }) {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.nav>
  )
}

// ─── Chip Select ────────────────────────────────────────────────────────────
export function ChipAnimate({ active, children, className = "", onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      animate={active ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.button>
  )
}
