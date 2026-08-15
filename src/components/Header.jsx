import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useApp } from '../context/AppContext'
import { generateMonthlyReport } from '../utils/generateMonthlyReport'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/dashboard/clients': 'Clients',
  '/dashboard/proposals': 'Proposals',
  '/dashboard/followups': 'Follow-ups',
  '/dashboard/kanban': 'Kanban Board',
  '/dashboard/calendar': 'Calendar',
  '/dashboard/reports': 'Reports',
  '/dashboard/settings': 'Settings',
  '/dashboard/profile': 'Profile',
}

export default function Header() {
  const { isDark, accent } = useTheme()
  const { clients, proposals, followups } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [showNotif, setShowNotif] = useState(false)

  const session = JSON.parse(localStorage.getItem('fpt_session') || '{}')
  const today = new Date().toISOString().split('T')[0]
  const overdueFollowups = followups.filter(f => f.date < today)
  const expiringProposals = proposals.filter(p => {
    if (p.status === 'Won' || p.status === 'Lost') return false
    const diff = Math.ceil((new Date(p.deadline) - new Date(today)) / (1000 * 60 * 60 * 24))
    return diff >= 0 && diff <= 3
  })
  const totalNotif = overdueFollowups.length + expiringProposals.length

  const bg = isDark ? '#0f0f13' : '#ffffff'
  const border = isDark ? '#1e1e2e' : '#f0f0f0'
  const textColor = isDark ? '#e2e8f0' : '#111827'
  const subColor = isDark ? '#64748b' : '#6b7280'
  const cardBg = isDark ? '#1a1a2e' : '#ffffff'

  const pageTitle = Object.entries(PAGE_TITLES).find(([path]) => location.pathname === path)?.[1] || 'Dashboard'

  return (
    <div style={{
      height: '60px', backgroundColor: bg, borderBottom: `1px solid ${border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', position: 'sticky', top: 0, zIndex: 100, flexShrink: 0
    }}>
      {/* Left - Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <h1 style={{ fontSize: '16px', fontWeight: '700', color: textColor, margin: 0 }}>{pageTitle}</h1>
      </div>

      {/* Right - Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        {/* Export Report Button */}
        <button
          onClick={() => generateMonthlyReport(clients, proposals, followups)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
            border: `1px solid ${border}`, backgroundColor: 'transparent',
            color: subColor, cursor: 'pointer', transition: 'all 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? '#1e1e2e' : '#f9fafb'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          📊 Export Report
        </button>

        {/* Quick Add Button */}
        <button
          onClick={() => document.getElementById('quick-add-btn')?.click()}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
            border: 'none', background: `linear-gradient(135deg, ${accent}, #7c3aed)`,
            color: 'white', cursor: 'pointer',
            boxShadow: `0 2px 8px ${accent}40`
          }}
        >
          + Quick Add
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            style={{
              width: '36px', height: '36px', borderRadius: '8px',
              border: `1px solid ${border}`, backgroundColor: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '16px', position: 'relative', color: textColor
            }}
          >
            🔔
            {totalNotif > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                backgroundColor: '#EF4444', color: 'white', fontSize: '9px',
                fontWeight: '700', width: '16px', height: '16px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{totalNotif}</span>
            )}
          </button>

          {showNotif && (
            <>
              <div onClick={() => setShowNotif(false)} style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
              <div style={{
                position: 'absolute', top: '44px', right: 0, zIndex: 99,
                width: '300px', backgroundColor: cardBg,
                border: `1px solid ${border}`, borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden'
              }}>
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${border}` }}>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: textColor }}>Notifications</p>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {overdueFollowups.length === 0 && expiringProposals.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: subColor, fontSize: '13px' }}>
                      ✅ All caught up!
                    </div>
                  ) : (
                    <>
                      {overdueFollowups.map(f => {
                        const proposal = proposals.find(p => p.id === Number(f.proposalId))
                        return (
                          <div key={f.id} onClick={() => { navigate('/dashboard/followups'); setShowNotif(false) }}
                            style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: `1px solid ${border}` }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? '#1e1e2e' : '#f9fafb'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <p style={{ fontSize: '12px', fontWeight: '600', color: '#EF4444' }}>⚠ Overdue Follow-up</p>
                            <p style={{ fontSize: '12px', color: textColor, marginTop: '2px' }}>{proposal?.title || 'Unknown'}</p>
                            <p style={{ fontSize: '11px', color: subColor }}>{f.date}</p>
                          </div>
                        )
                      })}
                      {expiringProposals.map(p => (
                        <div key={p.id} onClick={() => { navigate('/dashboard/proposals'); setShowNotif(false) }}
                          style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: `1px solid ${border}` }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? '#1e1e2e' : '#f9fafb'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <p style={{ fontSize: '12px', fontWeight: '600', color: '#F59E0B' }}>⏳ Expiring Soon</p>
                          <p style={{ fontSize: '12px', color: textColor, marginTop: '2px' }}>{p.title}</p>
                          <p style={{ fontSize: '11px', color: subColor }}>Deadline: {p.deadline}</p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile */}
        <div
          onClick={() => navigate('/dashboard/profile')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? '#1e1e2e' : '#f9fafb'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {(() => {
            const customImage = localStorage.getItem('fpt_custom_image')
            const avatar = localStorage.getItem('fpt_avatar')
            const initials = session.name ? session.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'FP'
            return (
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${accent}, #7c3aed)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: avatar ? '18px' : '11px', fontWeight: '700', color: 'white',
                flexShrink: 0, overflow: 'hidden'
              }}>
                {customImage ? <img src={customImage} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : avatar ? avatar : initials}
              </div>
            )
          })()}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: textColor }}>{session.name?.split(' ')[0] || 'User'}</span>
            <span style={{ fontSize: '10px', color: subColor }}>Freelancer</span>
          </div>
        </div>
      </div>
    </div>
  )
}