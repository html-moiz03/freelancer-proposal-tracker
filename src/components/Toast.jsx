import { useEffect } from 'react'

const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}

const COLORS = {
  success: { bg: '#D1FAE5', color: '#065F46', border: '#6EE7B7' },
  error: { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' },
  warning: { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
  info: { bg: '#DBEAFE', color: '#1D4ED8', border: '#93C5FD' },
}

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [])

  const c = COLORS[type]

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '12px 18px', borderRadius: '12px',
      backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}`,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      fontSize: '14px', fontWeight: '500',
      animation: 'slideInToast 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
    }}>
      <style>{`
        @keyframes slideInToast {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <span style={{ fontSize: '16px', fontWeight: '700' }}>{ICONS[type]}</span>
      {message}
      <button onClick={onClose} style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer', color: c.color, fontWeight: '700', fontSize: '16px' }}>×</button>
    </div>
  )
}