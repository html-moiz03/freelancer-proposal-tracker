import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const links = [
  { path: '/dashboard', label: '🏠 Dashboard' },
  { path: '/dashboard/clients', label: '👤 Clients' },
  { path: '/dashboard/proposals', label: '📄 Proposals' },
  { path: '/dashboard/followups', label: '🔔 Follow-ups' },
  { path: '/dashboard/kanban', label: '🗂️ Kanban' },
  { path: '/dashboard/settings', label: '⚙️ Settings' },
]

function Sidebar() {
  const session = JSON.parse(localStorage.getItem('fpt_session') || '{}')
  const initials = session.name ? session.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'FP'
  const { isDark, toggleTheme, accent } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const sidebarBg = isDark ? '#0f0f0f' : '#F1F0EE'
  const titleColor = isDark ? '#e2e8f0' : '#37352F'
  const subColor = isDark ? '#94a3b8' : '#9B9A97'

  const sidebarStyle = {
    backgroundColor: sidebarBg,
    height: '100vh',
    width: '256px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '16px',
    overflowY: 'auto',
    zIndex: 998,
  }

  const sidebarContent = (
    <>
      <style>{`
        .btn-color-mode-switch { display: inline-block; margin: 0; position: relative; }
        .btn-color-mode-switch > label.btn-color-mode-switch-inner { margin: 0; width: 110px; height: 32px; background: #E0E0E0; border-radius: 26px; overflow: hidden; position: relative; transition: all 0.3s ease; display: block; cursor: pointer; }
        .btn-color-mode-switch > label.btn-color-mode-switch-inner:before { content: attr(data-on); position: absolute; font-size: 11px; font-weight: 500; top: 7px; right: 14px; color: #555; }
        .btn-color-mode-switch > label.btn-color-mode-switch-inner:after { content: attr(data-off); width: 60px; height: 24px; background: #fff; border-radius: 26px; position: absolute; left: 2px; top: 3px; text-align: center; transition: all 0.3s ease; box-shadow: 0px 0px 6px -2px #111; padding: 4px 0; font-size: 11px; font-weight: 500; line-height: 1.4; }
        .btn-color-mode-switch input[type="checkbox"] { cursor: pointer; width: 50px; height: 25px; opacity: 0; position: absolute; top: 0; z-index: 1; margin: 0; }
        .btn-color-mode-switch input[type="checkbox"]:checked + label.btn-color-mode-switch-inner { background: #151515; color: #fff; }
        .btn-color-mode-switch input[type="checkbox"]:checked + label.btn-color-mode-switch-inner:after { content: attr(data-on); left: 46px; background: #3c3c3c; color: #fff; }
        .btn-color-mode-switch input[type="checkbox"]:checked + label.btn-color-mode-switch-inner:before { content: attr(data-off); right: auto; left: 14px; color: #aaa; }
      `}</style>

      <div className="mb-6 px-3 pt-3 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg" style={{ color: titleColor }}>FP Tracker</h1>
          <p className="text-xs mt-0.5" style={{ color: subColor }}>Freelancer CRM</p>
        </div>
        {isMobile && (
          <button
            style={{ color: titleColor, background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
            onClick={() => setMobileOpen(false)}
          >✕</button>
        )}
      </div>

      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          end
          onClick={() => isMobile && setMobileOpen(false)}
          className="px-3 py-2 rounded-md text-sm font-medium transition-colors"
          style={({ isActive }) => ({
            color: isActive ? accent : (isDark ? '#94a3b8' : '#6B6B6B'),
            backgroundColor: isActive ? accent + '18' : 'transparent',
            borderLeft: isActive ? `3px solid ${accent}` : '3px solid transparent',
          })}
        >
          {link.label}
        </NavLink>
      ))}

      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: `1px solid ${isDark ? '#2d2d3d' : '#E9E9E7'}` }}>
        <div className="flex items-center justify-center gap-2 px-3 py-2 mb-2">
          <svg viewBox="0 0 16 16" fill="currentColor" width="16" xmlns="http://www.w3.org/2000/svg" style={{ color: 'red', flexShrink: 0 }}>
            <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
          </svg>
          <div className="btn-color-mode-switch">
            <input type="checkbox" id="color_mode" checked={isDark} onChange={toggleTheme} />
            <label className="btn-color-mode-switch-inner" data-off="Light" data-on="Dark" htmlFor="color_mode" />
          </div>
          <svg viewBox="0 0 16 16" fill="currentColor" width="16" xmlns="http://www.w3.org/2000/svg" style={{ color: 'orange', flexShrink: 0 }}>
            <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
            <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162z"/>
          </svg>
        </div>

        <NavLink
          to="/dashboard/profile"
          onClick={() => isMobile && setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
          style={({ isActive }) => ({
            backgroundColor: isActive ? accent + '18' : 'transparent',
            borderLeft: isActive ? `3px solid ${accent}` : '3px solid transparent',
          })}
        >
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${accent}, #7c3aed)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: localStorage.getItem('fpt_avatar') ? '18px' : '12px',
            fontWeight: '800', color: 'white', flexShrink: 0, overflow: 'hidden'
          }}>
            {localStorage.getItem('fpt_custom_image')
              ? <img src={localStorage.getItem('fpt_custom_image')} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : localStorage.getItem('fpt_avatar')
              ? localStorage.getItem('fpt_avatar')
              : initials
            }
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: isDark ? '#e2e8f0' : '#37352F' }}>{session.name || 'User'}</p>
            <p className="text-xs" style={{ color: subColor }}>View Profile</p>
          </div>
        </NavLink>
      </div>
    </>
  )

  return (
    <>
      {/* Hamburger button - mobile only */}
      {isMobile && !mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            position: 'fixed', top: '12px', left: '12px', zIndex: 999,
            backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF',
            color: titleColor,
            border: `1px solid ${isDark ? '#2a2a2a' : '#E9E9E7'}`,
            borderRadius: '8px', padding: '6px 10px',
            fontSize: '18px', cursor: 'pointer'
          }}
        >☰</button>
      )}

      {/* Overlay - mobile only */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 997
          }}
        />
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <aside style={{ ...sidebarStyle, position: 'sticky', top: 0 }}>
          {sidebarContent}
        </aside>
      )}

      {/* Mobile sidebar */}
      {isMobile && mobileOpen && (
        <aside style={{
          ...sidebarStyle,
          position: 'fixed',
          top: 0,
          left: 0,
          boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
        }}>
          {sidebarContent}
        </aside>
      )}
    </>
  )
}

export default Sidebar