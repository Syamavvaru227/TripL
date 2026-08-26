export default function EmptyState({ icon = "🗺️", title = "Nothing here yet", description = "", action = null }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="text-6xl mb-4 opacity-60">{icon}</div>
      <h3 className="font-display font-semibold text-xl text-charcoal mb-2">{title}</h3>
      {description && <p className="text-muted text-sm max-w-xs mb-6">{description}</p>}
      {action}
    </div>
  )
}
