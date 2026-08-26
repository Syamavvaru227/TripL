export default function StarRating({ rating = 0, max = 5, size = "sm" }) {
  const sz = size === "sm" ? "text-sm" : "text-base"
  return (
    <span className={`inline-flex items-center gap-0.5 ${sz}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < Math.floor(rating) ? "text-amber-400" : i < rating ? "text-amber-300" : "text-gray-200"}>★</span>
      ))}
      <span className="ml-1 text-muted font-medium">{rating.toFixed(1)}</span>
    </span>
  )
}
