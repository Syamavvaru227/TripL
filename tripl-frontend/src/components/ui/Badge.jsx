import { clsx } from "clsx"
const colorMap = {
  saffron: "bg-saffron/10 text-saffron",
  peacock: "bg-peacock/10 text-peacock",
  emerald: "bg-emerald/10 text-emerald",
  terracotta: "bg-terracotta/10 text-terracotta",
  muted: "bg-charcoal/5 text-muted",
  indigo: "bg-indigo/10 text-indigo",
}
export default function Badge({ children, color = "muted", className = "" }) {
  return (
    <span className={clsx("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold", colorMap[color] || colorMap.muted, className)}>
      {children}
    </span>
  )
}
