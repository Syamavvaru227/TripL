import { clsx } from "clsx"

export default function Button({ children, variant = "primary", size = "md", className = "", onClick, type = "button", disabled = false, ...props }) {
  const base = "inline-flex items-center justify-center gap-2 font-display font-semibold rounded-xl transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
  const variants = {
    primary: "bg-saffron text-white hover:bg-saffron-dark active:scale-95 shadow-cta hover:shadow-cta-hover",
    secondary: "border-2 border-saffron text-saffron hover:bg-saffron hover:text-white active:scale-95",
    ghost: "text-saffron hover:bg-saffron/10 active:scale-95",
    indigo: "bg-indigo text-white hover:bg-indigo-light active:scale-95",
    peacock: "bg-peacock text-white hover:bg-peacock-dark active:scale-95",
    danger: "bg-red-500 text-white hover:bg-red-600 active:scale-95",
  }
  const sizes = { sm: "px-4 py-2 text-sm", md: "px-6 py-3 text-sm", lg: "px-8 py-4 text-base" }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}
