export default function EmptyState({ icon, title, description, actionLabel, onAction, isDark, accent }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      
      {/* SVG Illustration */}
      <div style={{ marginBottom: '24px' }}>
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base circle */}
          <circle cx="60" cy="60" r="55" fill={isDark ? '#1e1e1e' : '#F7F6F3'} stroke={isDark ? '#2a2a2a' : '#E9E9E7'} strokeWidth="2"/>
          
          {/* Icon background */}
          <circle cx="60" cy="48" r="22" fill={isDark ? '#2a2a2a' : '#EEF2FF'}/>
          
          {/* Dynamic emoji icon */}
          <text x="60" y="56" textAnchor="middle" fontSize="22">{icon}</text>
          
          {/* Lines suggesting empty list */}
          <rect x="32" y="80" width="56" height="5" rx="2.5" fill={isDark ? '#2a2a2a' : '#E9E9E7'}/>
          <rect x="40" y="90" width="40" height="5" rx="2.5" fill={isDark ? '#2a2a2a' : '#E9E9E7'}/>
          <rect x="48" y="100" width="24" height="5" rx="2.5" fill={isDark ? '#2a2a2a' : '#E9E9E7'}/>

          {/* Doodle stars */}
          <text x="18" y="30" fontSize="10" fill="#c7d2fe" opacity="0.8">✦</text>
          <text x="95" y="25" fontSize="8" fill="#e9d5ff" opacity="0.8">✦</text>
          <text x="100" y="90" fontSize="10" fill="#fde68a" opacity="0.8">✦</text>
          <text x="12" y="85" fontSize="8" fill="#c7d2fe" opacity="0.8">✦</text>
        </svg>
      </div>

      {/* Text */}
      <h3 className="text-lg font-bold mb-2" style={{ color: isDark ? '#ffffff' : '#37352F' }}>
        {title}
      </h3>
      <p className="text-sm mb-6 max-w-xs" style={{ color: isDark ? '#94a3b8' : '#9B9A97' }}>
        {description}
      </p>

      {/* CTA Button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ backgroundColor: accent || '#4F46E5', color: '#FFFFFF' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}