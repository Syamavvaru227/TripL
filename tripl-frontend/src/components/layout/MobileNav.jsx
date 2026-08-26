import { Link, useLocation } from "react-router-dom"
import { Home, Map, Route, Bookmark, User } from "lucide-react"
export default function MobileNav() {
  const { pathname } = useLocation()
  const tabs = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/explore", icon: Map, label: "Explore" },
    { to: "/plan", icon: Route, label: "Plan" },
    { to: "/saved", icon: Bookmark, label: "Saved" },
    { to: "/profile", icon: User, label: "Profile" },
  ]
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] glass border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = pathname === to || (to !== "/" && pathname.startsWith(to))
          return (
            <Link key={to} to={to} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-150 ${active ? "text-saffron" : "text-muted"}`}>
              <Icon size={20} className={active ? "text-saffron" : "text-muted"} />
              <span className="text-xs font-medium">{label}</span>
              {active && <div className="w-1 h-1 rounded-full bg-saffron" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
