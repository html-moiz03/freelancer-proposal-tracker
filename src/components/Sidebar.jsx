import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useApp } from '../context/AppContext'

const links = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/dashboard/clients', label: 'Clients', icon: '👤' },
  { path: '/dashboard/proposals', label: 'Proposals', icon: '📄' },
  { path: '/dashboard/followups', label: 'Follow-ups', icon: '🔔' },
  { path: '/dashboard/kanban', label: 'Kanban', icon: '🗂️' },
  { path: '/dashboard/calendar', label: 'Calendar', icon: '📅' },
  { path: '/dashboard/reports', label: 'Reports', icon: '📈' },
  { path: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
]

export default function Sidebar() {
  const { isDark, toggleTheme, accent } = useTheme()
  const { followups } = useApp()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const overdueCount = followups.filter(f => f.date < today).length

  const bg = isDark ? '#0f0f13' : '#ffffff'
  const border = isDark ? '#1e1e2e' : '#f0f0f0'
  const textColor = isDark ? '#e2e8f0' : '#374151'
  const subColor = isDark ? '#64748b' : '#9ca3af'

  const sidebarContent = (
    <div style={{
      width: '220px', height: '100vh', backgroundColor: bg,
      borderRight: `1px solid ${border}`,
      display: 'flex', flexDirection: 'column',
      padding: '0', flexShrink: 0,
      position: 'sticky', top: 0,
      overflowY: 'auto'
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${border}` }}>
        <div style={{
          fontWeight: '800', fontSize: '18px', letterSpacing: '-0.5px',
          background: 'linear-gradient(135deg, #4F46E5, #7c3aed)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          cursor: 'pointer'
        }} onClick={() => navigate('/dashboard')}>
          FP Tracker
        </div>
        <div style={{ fontSize: '11px', color: subColor, marginTop: '2px' }}>Freelancer CRM</div>
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/dashboard'}
            onClick={() => isMobile && setMobileOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '8px', marginBottom: '2px',
              textDecoration: 'none', fontSize: '13px', fontWeight: isActive ? '600' : '500',
              color: isActive ? accent : textColor,
              backgroundColor: isActive ? (isDark ? accent + '18' : accent + '12') : 'transparent',
              borderLeft: isActive ? `3px solid ${accent}` : '3px solid transparent',
              transition: 'all 0.15s ease',
              position: 'relative'
            })}
            className="sidebar-link"
          >
            <span style={{ fontSize: '16px' }}>{link.icon}</span>
            <span>{link.label}</span>
            {link.label === 'Follow-ups' && overdueCount > 0 && (
              <span style={{
                marginLeft: 'auto', backgroundColor: '#EF4444', color: 'white',
                fontSize: '10px', fontWeight: '700', padding: '1px 6px',
                borderRadius: '10px', minWidth: '18px', textAlign: 'center'
              }}>{overdueCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div style={{ padding: '12px 10px', borderTop: `1px solid ${border}` }}>
        {/* Dark Mode Toggle */}
        <div
          onClick={toggleTheme}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
            color: textColor, fontSize: '13px', fontWeight: '500',
            transition: 'background 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? '#1e1e2e' : '#f9fafb'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <span style={{ fontSize: '16px' }}>{isDark ? '☀️' : '🌙'}</span>
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          <div style={{
            marginLeft: 'auto', width: '32px', height: '18px', borderRadius: '99px',
            backgroundColor: isDark ? accent : '#E5E7EB', position: 'relative', transition: 'background 0.2s'
          }}>
            <div style={{
              width: '14px', height: '14px', borderRadius: '50%', backgroundColor: 'white',
              position: 'absolute', top: '2px',
              left: isDark ? '16px' : '2px', transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }} />
          </div>
        </div>
      </div>

      <style>{`
        .sidebar-link:hover { background-color: ${isDark ? '#1e1e2e' : '#f9fafb'} !important; }
      `}</style>
    </div>
  )

  return (
    <>
      {/* Hamburger - mobile only */}
      {isMobile && !mobileOpen && (
        <button onClick={() => setMobileOpen(true)} style={{
          position: 'fixed', top: '14px', left: '14px', zIndex: 999,
          backgroundColor: bg, border: `1px solid ${border}`,
          borderRadius: '8px', padding: '6px 10px', fontSize: '16px', cursor: 'pointer', color: textColor
        }}>☰</button>
      )}

      {/* Overlay */}
      {isMobile && mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 997 }} />
      )}

      {/* Desktop Sidebar */}
      {!isMobile && sidebarContent}

      {/* Mobile Sidebar */}
      {isMobile && mobileOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 998 }}>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setMobileOpen(false)} style={{
              position: 'absolute', top: '14px', right: '-40px', zIndex: 999,
              backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer'
            }}>✕</button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}