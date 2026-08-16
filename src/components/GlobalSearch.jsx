import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

export default function GlobalSearch() {
  const { clients, proposals, followups } = useApp()
  const { isDark, accent } = useTheme()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const inputRef = useRef(null)

  const titleColor = isDark ? '#ffffff' : '#37352F'
  const subColor = isDark ? '#94a3b8' : '#9B9A97'
  const cardBg = isDark ? '#1a1a1a' : '#FFFFFF'
  const borderColor = isDark ? '#2a2a2a' : '#E9E9E7'

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const results = query.trim().length < 2 ? [] : [
    ...clients.filter(c =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase())
    ).map(c => ({ type: 'Client', icon: '👤', label: c.name, sub: c.email, path: `/dashboard/clients/${c.id}` })),
    ...proposals.filter(p =>
      p.title.toLowerCase().includes(query.toLowerCase())
    ).map(p => ({ type: 'Proposal', icon: '📄', label: p.title, sub: p.status, path: '/dashboard/proposals' })),
    ...followups.filter(f =>
      (f.notes && f.notes.toLowerCase().includes(query.toLowerCase()))
    ).map(f => ({ type: 'Follow-up', icon: '🔔', label: f.notes || 'Follow-up', sub: f.date, path: '/dashboard/followups' })),
  ].slice(0, 8)

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div style={{
      position: isMobile ? 'sticky' : 'fixed',
      top: isMobile ? 0 : '12px',
      left: isMobile ? 'auto' : '50%',
      transform: isMobile ? 'none' : 'translateX(-50%)',
      zIndex: isMobile ? 90 : 980,
      width: isMobile ? '100%' : '100%',
      maxWidth: isMobile ? 'none' : '400px',
      marginBottom: isMobile ? '10px' : 0
    }}>
      <div
        onClick={() => { setOpen(true); inputRef.current?.focus() }}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF',
          border: `1px solid ${open ? accent : borderColor}`,
          borderRadius: '10px', padding: '8px 14px',
          cursor: 'text', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'border-color 0.2s'
        }}
      >
        <span style={{ color: subColor, fontSize: '14px' }}>🔍</span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={isMobile ? 'Search...' : 'Search everything... (Ctrl+K)'}
          style={{
            border: 'none', outline: 'none', background: 'transparent',
            fontSize: '13px', color: titleColor, width: '100%',
            fontFamily: 'inherit'
          }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: subColor, fontSize: '16px' }}>×</button>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: -1 }} />
          <div style={{
            position: 'absolute', top: '48px', left: 0, right: 0,
            backgroundColor: cardBg, border: `1px solid ${borderColor}`,
            borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            overflow: 'hidden', zIndex: 990
          }}>
            {results.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: subColor, fontSize: '13px' }}>
                No results found for "{query}"
              </div>
            ) : (
              results.map((result, i) => (
                <div
                  key={i}
                  onClick={() => { navigate(result.path); setOpen(false); setQuery('') }}
                  style={{
                    padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                    borderBottom: i < results.length - 1 ? `1px solid ${borderColor}` : 'none',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? '#2a2a2a' : '#F7F6F3'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ fontSize: '18px' }}>{result.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: titleColor }}>{result.label}</p>
                    <p style={{ fontSize: '11px', color: subColor }}>{result.type} · {result.sub}</p>
                  </div>
                  <span style={{ fontSize: '11px', color: subColor, backgroundColor: isDark ? '#2a2a2a' : '#F1F0EE', padding: '2px 8px', borderRadius: '20px' }}>{result.type}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}