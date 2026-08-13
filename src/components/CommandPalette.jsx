import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useApp } from '../context/AppContext'

const commands = [
  { id: 'dashboard', label: '🏠 Go to Dashboard', category: 'Navigation', action: '/dashboard' },
  { id: 'clients', label: '👤 Go to Clients', category: 'Navigation', action: '/dashboard/clients' },
  { id: 'proposals', label: '📄 Go to Proposals', category: 'Navigation', action: '/dashboard/proposals' },
  { id: 'followups', label: '🔔 Go to Follow-ups', category: 'Navigation', action: '/dashboard/followups' },
  { id: 'kanban', label: '🗂️ Go to Kanban', category: 'Navigation', action: '/dashboard/kanban' },
  { id: 'settings', label: '⚙️ Go to Settings', category: 'Navigation', action: '/dashboard/settings' },
  { id: 'profile', label: '👤 Go to Profile', category: 'Navigation', action: '/dashboard/profile' },
  { id: 'export-clients', label: '📥 Export Clients CSV', category: 'Actions', action: 'export-clients' },
  { id: 'export-proposals', label: '📥 Export Proposals CSV', category: 'Actions', action: 'export-proposals' },
  { id: 'dark-mode', label: '🌙 Toggle Dark Mode', category: 'Actions', action: 'toggle-theme' },
]

export default function CommandPalette() {
  const { isDark, toggleTheme, accent } = useTheme()
  const { clients, proposals } = useApp()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef(null)

  const titleColor = isDark ? '#ffffff' : '#37352F'
  const subColor = isDark ? '#94a3b8' : '#9B9A97'
  const cardBg = isDark ? '#1a1a1a' : '#FFFFFF'
  const borderColor = isDark ? '#2a2a2a' : '#E9E9E7'

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        setOpen(prev => !prev)
        setQuery('')
        setSelected(0)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') setSelected(prev => Math.min(prev + 1, filtered.length - 1))
    if (e.key === 'ArrowUp') setSelected(prev => Math.max(prev - 1, 0))
    if (e.key === 'Enter' && filtered[selected]) executeCommand(filtered[selected])
  }

  const executeCommand = (command) => {
    setOpen(false)
    setQuery('')
    if (command.action.startsWith('/')) {
      navigate(command.action)
    } else if (command.action === 'toggle-theme') {
      toggleTheme()
    } else if (command.action === 'export-clients') {
      const csv = ['Name,Email,Phone,Company', ...clients.map(c => `"${c.name}","${c.email}","${c.phone}","${c.company || ''}"`)].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url; link.download = 'clients.csv'
      document.body.appendChild(link); link.click(); document.body.removeChild(link)
    } else if (command.action === 'export-proposals') {
      const csv = ['Title,Amount,Status,Deadline', ...proposals.map(p => `"${p.title}","${p.amount}","${p.status}","${p.deadline}"`)].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url; link.download = 'proposals.csv'
      document.body.appendChild(link); link.click(); document.body.removeChild(link)
    }
  }

  if (!open) return null

  return (
    <>
      <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1002 }} />
      <div style={{
        position: 'fixed', top: '20%', left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1003, width: '90%', maxWidth: '520px',
        backgroundColor: cardBg,
        borderRadius: '16px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
        border: `1px solid ${borderColor}`,
        overflow: 'hidden'
      }}>
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderBottom: `1px solid ${borderColor}` }}>
          <span style={{ fontSize: '18px' }}>⌨️</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            style={{
              flex: 1, border: 'none', outline: 'none',
              backgroundColor: 'transparent',
              fontSize: '15px', color: titleColor,
              fontFamily: 'inherit'
            }}
          />
          <kbd style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', backgroundColor: isDark ? '#2a2a2a' : '#F1F0EE', color: subColor, border: `1px solid ${borderColor}`, fontFamily: 'monospace' }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: subColor, fontSize: '13px' }}>No commands found</div>
          ) : (
            filtered.map((command, i) => (
              <div
                key={command.id}
                onClick={() => executeCommand(command)}
                style={{
                  padding: '12px 16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  backgroundColor: i === selected ? (isDark ? '#2a2a2a' : '#F7F6F3') : 'transparent',
                  borderLeft: i === selected ? `3px solid ${accent}` : '3px solid transparent',
                  transition: 'all 0.1s'
                }}
                onMouseEnter={() => setSelected(i)}
              >
                <span style={{ fontSize: '14px', color: titleColor }}>{command.label}</span>
                <span style={{ fontSize: '11px', color: subColor, backgroundColor: isDark ? '#2a2a2a' : '#F1F0EE', padding: '2px 8px', borderRadius: '20px' }}>{command.category}</span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${borderColor}`, display: 'flex', gap: '16px' }}>
          {[['↑↓', 'Navigate'], ['↵', 'Select'], ['Esc', 'Close']].map(([key, desc]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <kbd style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '11px', backgroundColor: isDark ? '#2a2a2a' : '#F1F0EE', color: subColor, border: `1px solid ${borderColor}`, fontFamily: 'monospace' }}>{key}</kbd>
              <span style={{ fontSize: '11px', color: subColor }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}