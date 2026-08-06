import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { formatDate } from '../utils/formatDate'

export default function NotificationBell() {
  const { followups, proposals } = useApp()
  const { isDark, } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const overdueFollowups = followups.filter((f) => f.date < today)
  const expiringProposals = proposals.filter((p) => {
    if (p.status === 'Won' || p.status === 'Lost') return false
    const deadlineDate = new Date(p.deadline)
    const todayDate = new Date(today)
    const diffDays = Math.ceil((deadlineDate - todayDate) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 3
  })

  const totalCount = overdueFollowups.length + expiringProposals.length

  const card = { backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF', borderColor: isDark ? '#2a2a2a' : '#E9E9E7' }
  const titleColor = isDark ? '#ffffff' : '#37352F'
  const subColor = isDark ? '#94a3b8' : '#9B9A97'

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', top: '16px', right: '16px', zIndex: 990,
          width: '40px', height: '40px', borderRadius: '50%',
          backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF',
          border: `1px solid ${isDark ? '#2a2a2a' : '#E9E9E7'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          fontSize: '18px'
        }}
      >
        🔔
        {totalCount > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            backgroundColor: '#EF4444', color: 'white',
            fontSize: '10px', fontWeight: '700',
            width: '18px', height: '18px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {totalCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 988 }}
          />
          <div style={{
            position: 'fixed', top: '64px', right: '16px', zIndex: 989,
            width: '300px', borderRadius: '12px', border: `1px solid ${isDark ? '#2a2a2a' : '#E9E9E7'}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            ...card
          }}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${isDark ? '#2a2a2a' : '#E9E9E7'}` }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: titleColor }}>🔔 Notifications</p>
              {totalCount === 0 && <p style={{ fontSize: '12px', color: subColor, marginTop: '2px' }}>All caught up!</p>}
            </div>

            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
              {overdueFollowups.length > 0 && (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: '600', color: subColor, padding: '10px 16px 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overdue Follow-ups</p>
                  {overdueFollowups.map((f) => {
                    const proposal = proposals.find((p) => p.id === Number(f.proposalId))
                    return (
                      <div
                        key={f.id}
                        onClick={() => { navigate('/dashboard/followups'); setOpen(false) }}
                        style={{
                          padding: '10px 16px', cursor: 'pointer', borderBottom: `1px solid ${isDark ? '#2a2a2a' : '#F1F0EE'}`,
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? '#2a2a2a' : '#F7F6F3'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <p style={{ fontSize: '13px', fontWeight: '500', color: titleColor }}>{proposal?.title || 'Unknown Proposal'}</p>
                        <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '2px' }}>⚠ Overdue: {formatDate(f.date)}</p>
                      </div>
                    )
                  })}
                </div>
              )}

              {expiringProposals.length > 0 && (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: '600', color: subColor, padding: '10px 16px 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expiring Soon</p>
                  {expiringProposals.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => { navigate('/dashboard/proposals'); setOpen(false) }}
                      style={{
                        padding: '10px 16px', cursor: 'pointer', borderBottom: `1px solid ${isDark ? '#2a2a2a' : '#F1F0EE'}`,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? '#2a2a2a' : '#F7F6F3'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <p style={{ fontSize: '13px', fontWeight: '500', color: titleColor }}>{p.title}</p>
                      <p style={{ fontSize: '11px', color: '#D97706', marginTop: '2px' }}>⏳ Deadline: {formatDate(p.deadline)}</p>
                    </div>
                  ))}
                </div>
              )}

              {totalCount === 0 && (
                <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '24px', marginBottom: '8px' }}>✅</p>
                  <p style={{ fontSize: '13px', color: subColor }}>No pending notifications</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}