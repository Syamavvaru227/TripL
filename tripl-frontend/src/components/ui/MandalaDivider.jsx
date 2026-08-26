export default function MandalaDivider({ text = "" }) {
  return (
    <div className="flex items-center gap-4 my-10">
      <div className="flex-1 h-px bg-border" />
      <div className="flex items-center gap-3 text-border">
        <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18" stroke="#E8621A" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
          {[0,72,144,216,288].map((deg,i) => (
            <polygon key={i} points="20,4 22,9 18,9" fill="#E8621A" opacity="0.6" transform={`rotate(${deg},20,20)`} />
          ))}
          <circle cx="20" cy="20" r="4" fill="#E8621A" opacity="0.5" />
        </svg>
        {text && <span className="text-xs font-semibold text-muted uppercase tracking-widest">{text}</span>}
        <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18" stroke="#006B75" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
          {[0,60,120,180,240,300].map((deg,i) => (
            <circle key={i} cx="20" cy="5" r="2.5" fill="#006B75" opacity="0.6" transform={`rotate(${deg},20,20)`} />
          ))}
          <circle cx="20" cy="20" r="4" fill="#006B75" opacity="0.5" />
        </svg>
      </div>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}
