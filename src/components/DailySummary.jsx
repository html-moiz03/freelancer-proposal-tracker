import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { scopedKey } from '../utils/accountStorage'

export default function DailySummary() {
  const { proposals, followups, clients } = useApp()
  const { isDark, accent } = useTheme()
  const navigate = useNavigate()
  const [show, setShow] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  useEffect(() => {
    const lastSeen = localStorage.getItem(scopedKey('fpt_daily_summary_date'))
    if (lastSeen !== today) {
      setTimeout(() => setShow(true), 1500)
    }
  }, [today])

  const handleClose = () => {
    localStorage.setItem(scopedKey('fpt_daily_summary_date'), today)
    setShow(false)
  }

  if (!show) return null

  const overdueFollowups = followups.filter(f => f.date < today)
  const todayFollowups = followups.filter(f => f.date === today)
  const expiringProposals = proposals.filter(p => {
    if (p.status === 'Won' || p.status === 'Lost') return false
    const diff = Math.ceil((new Date(p.deadline) - new Date(today)) / (1000 * 60 * 60 * 24))
    return diff >= 0 && diff <= 3
  })
  const wonThisMonth = proposals.filter(p => {
    const d = new Date(p.deadline)
    const now = new Date()
    return p.status === 'Won' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const subColor = isDark ? '#94a3b8' : '#9B9A97'

  return (
    <>
      {/* Overlay */}
      <div onClick={handleClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000 }} />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001, width: '90%', maxWidth: '440px',
        backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF',
        borderRadius: '20px', overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        border: `1px solid ${isDark ? '#2a2a2a' : '#E9E9E7'}`,
        animation: 'popIn 0.4s cubic-bezier(0.22, 1, 0.36, 1)'
      }}>
        <style>{`@keyframes popIn { from { transform: translate(-50%, -48%) scale(0.95); opacity: 0; } to { transform: translate(-50%, -50%) scale(1); opacity: 1; } }`}</style>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${accent}, #7c3aed)`, padding: '20px 24px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>☀️ {todayFormatted}</p>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>Good day! Here's your summary</h2>
        </div>

        {/* Stats */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Total Clients', value: clients.length, color: '#2383E2', icon: '👤' },
              { label: 'Won This Month', value: wonThisMonth.length, color: '#0F9B6E', icon: '🏆' },
              { label: 'Overdue Follow-ups', value: overdueFollowups.length, color: '#E03E3E', icon: '⚠️' },
              { label: 'Due Today', value: todayFollowups.length, color: '#D9730D', icon: '📅' },
            ].map((stat) => (
              <div key={stat.label} style={{
                padding: '14px', borderRadius: '12px',
                backgroundColor: isDark ? '#111111' : '#F7F6F3',
                border: `1px solid ${isDark ? '#2a2a2a' : '#E9E9E7'}`
              }}>
                <p style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</p>
                <p style={{ fontSize: '22px', fontWeight: '800', color: stat.color }}>{stat.value}</p>
                <p style={{ fontSize: '11px', color: subColor }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Alerts */}
          {overdueFollowups.length > 0 && (
            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#FEE2E2', marginBottom: '10px', cursor: 'pointer' }}
              onClick={() => { navigate('/dashboard/followups'); handleClose() }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#991B1B' }}>
                ⚠ {overdueFollowups.length} overdue follow-up{overdueFollowups.length > 1 ? 's' : ''} need attention
              </p>
            </div>
          )}

          {expiringProposals.length > 0 && (
            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#FEF3C7', marginBottom: '10px', cursor: 'pointer' }}
              onClick={() => { navigate('/dashboard/proposals'); handleClose() }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#D97706' }}>
                ⏳ {expiringProposals.length} proposal{expiringProposals.length > 1 ? 's' : ''} expiring within 3 days
              </p>
            </div>
          )}

          {overdueFollowups.length === 0 && expiringProposals.length === 0 && (
            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#D1FAE5', marginBottom: '10px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#065F46' }}>
                ✅ All caught up! No urgent items today.
              </p>
            </div>
          )}

          <button onClick={handleClose} style={{
            width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
            background: `linear-gradient(135deg, ${accent}, #7c3aed)`,
            color: 'white', fontSize: '14px', fontWeight: '700',
            cursor: 'pointer', fontFamily: 'inherit'
          }}>
            Let's get to work! 💪
          </button>
        </div>
      </div>
    </>
  )
}