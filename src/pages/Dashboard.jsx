import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { getLogs, clearLogs } from '../utils/activityLog'
import { generateMonthlyReport } from '../utils/generateMonthlyReport'
import { getSession, scopedKey } from '../utils/accountStorage'
import { formatDate } from '../utils/formatDate'
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, AreaChart, Area, LineChart, Line
} from 'recharts'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const RANGES = ['7D', '30D', '3M', '12M']

function fmtShort(d) { return `${MONTHS[d.getMonth()]} ${d.getDate()}` }

// Builds bucketed Sent / Won / Lost series for the Proposal Activity chart
function buildActivityData(range, proposals) {
  const now = new Date()
  const buckets = []

  if (range === '7D') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i)
      buckets.push({ label: fmtShort(d), start: new Date(d.setHours(0, 0, 0, 0)), days: 1 })
    }
  } else if (range === '30D') {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i * 6)
      buckets.push({ label: fmtShort(d), start: d, days: 6 })
    }
  } else if (range === '3M') {
    for (let i = 12; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i * 7)
      buckets.push({ label: fmtShort(d), start: d, days: 7 })
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      buckets.push({ label: MONTHS[d.getMonth()], start: d, days: 30 })
    }
  }

  return buckets.map((b, i) => {
    const bucketStart = b.start.getTime()
    const bucketEnd = i < buckets.length - 1 ? buckets[i + 1].start.getTime() : now.getTime() + 86400000
    const inBucket = proposals.filter(p => {
      const t = new Date(p.deadline).getTime()
      return t >= bucketStart && t < bucketEnd
    })
    return {
      label: b.label,
      Sent: inBucket.filter(p => p.status === 'Sent').length,
      Won: inBucket.filter(p => p.status === 'Won').length,
      Lost: inBucket.filter(p => p.status === 'Lost').length,
    }
  })
}

function StatCard({ label, value, color, change, changeLabel, isDark }) {
  const bg = isDark ? '#111118' : '#ffffff'
  const border = isDark ? '#1e1e2e' : '#f0f0f0'
  const titleColor = isDark ? '#94a3b8' : '#6b7280'
  const valueColor = isDark ? '#ffffff' : '#111827'
  const isUp = change >= 0
  return (
    <div style={{ backgroundColor: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px', transition: 'box-shadow 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
      <p style={{ fontSize: '11px', fontWeight: '600', color: titleColor, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
      <p style={{ fontSize: '26px', fontWeight: '800', color: color || valueColor, marginBottom: '6px', letterSpacing: '-0.5px' }}>{value}</p>
      {changeLabel && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {change !== undefined && (
            <span style={{ fontSize: '11px', fontWeight: '600', color: isUp ? '#10B981' : '#EF4444' }}>
              {isUp ? '↑' : '↓'} {Math.abs(change)}%
            </span>
          )}
          <span style={{ fontSize: '11px', color: titleColor }}>{changeLabel}</span>
        </div>
      )}
    </div>
  )
}

function WelcomeText({ isDark }) {
  const session = getSession() || {}
  const name = session.name ? session.name.split(' ')[0] : 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: '800', color: isDark ? '#ffffff' : '#111827', margin: 0 }}>
        {greeting}, {name}! 👋
      </h2>
      <p style={{ fontSize: '13px', color: isDark ? '#64748b' : '#6b7280', marginTop: '4px' }}>
        Here's what's happening with your business today.
      </p>
    </div>
  )
}

export default function Dashboard() {
  const { clients, proposals, followups, currency } = useApp()
  const { isDark, accent } = useTheme()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [revenueGoal, setRevenueGoal] = useState(() => Number(localStorage.getItem(scopedKey('fpt_revenue_goal'))) || 100000)
  const [activityRange, setActivityRange] = useState('30D')
  const [periodFilter, setPeriodFilter] = useState('This Month')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const now = new Date()

  const handleExportReport = () => {
    generateMonthlyReport(clients, proposals, followups)
    showToast('Report exported!', 'success')
  }

  const cardBg = isDark ? '#111118' : '#ffffff'
  const border = isDark ? '#1e1e2e' : '#f0f0f0'
  const titleColor = isDark ? '#ffffff' : '#111827'
  const subColor = isDark ? '#64748b' : '#6b7280'
  const card = { backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '12px' }

  // Period bounds driven by the header's period filter dropdown
  const periodYear = now.getFullYear()
  const periodMonth = now.getMonth()
  let periodStart, periodEnd, prevPeriodStart, prevPeriodEnd, periodLabel, prevPeriodLabel
  if (periodFilter === 'Last Month') {
    periodStart = new Date(periodYear, periodMonth - 1, 1)
    periodEnd = new Date(periodYear, periodMonth, 1)
    prevPeriodStart = new Date(periodYear, periodMonth - 2, 1)
    prevPeriodEnd = periodStart
    periodLabel = 'Last Month'; prevPeriodLabel = 'month before'
  } else if (periodFilter === 'This Quarter') {
    const q = Math.floor(periodMonth / 3)
    periodStart = new Date(periodYear, q * 3, 1)
    periodEnd = new Date(periodYear, q * 3 + 3, 1)
    prevPeriodStart = new Date(periodYear, q * 3 - 3, 1)
    prevPeriodEnd = periodStart
    periodLabel = 'This Quarter'; prevPeriodLabel = 'last quarter'
  } else if (periodFilter === 'This Year') {
    periodStart = new Date(periodYear, 0, 1)
    periodEnd = new Date(periodYear + 1, 0, 1)
    prevPeriodStart = new Date(periodYear - 1, 0, 1)
    prevPeriodEnd = periodStart
    periodLabel = 'This Year'; prevPeriodLabel = 'last year'
  } else {
    periodStart = new Date(periodYear, periodMonth, 1)
    periodEnd = new Date(periodYear, periodMonth + 1, 1)
    prevPeriodStart = new Date(periodYear, periodMonth - 1, 1)
    prevPeriodEnd = periodStart
    periodLabel = 'This Month'; prevPeriodLabel = 'last month'
  }
  const inPeriod = (p, start, end) => { const d = new Date(p.deadline); return d >= start && d < end }
  const periodProposals = proposals.filter(p => inPeriod(p, periodStart, periodEnd))
  const prevPeriodProposals = proposals.filter(p => inPeriod(p, prevPeriodStart, prevPeriodEnd))

  const totalProposals = periodProposals.length
  const wonProposals = periodProposals.filter(p => p.status === 'Won').length
  const winRate = totalProposals > 0 ? Math.round((wonProposals / totalProposals) * 100) : 0
  const totalRevenue = periodProposals.filter(p => p.status === 'Won').reduce((sum, p) => sum + Number(p.amount), 0)
  const overdueFollowups = followups.filter(f => f.date < today).length
  const inReviewRevenue = periodProposals.filter(p => p.status === 'In Review').reduce((sum, p) => sum + Number(p.amount), 0)
  const forecastRevenue = Math.round(inReviewRevenue * (winRate / 100))
  const activeProposals = periodProposals.filter(p => p.status === 'In Review' || p.status === 'Sent' || p.status === 'Negotiation').length

  const thisMonthProposals = periodProposals
  const lastMonthProposals = prevPeriodProposals
  const thisMonthRevenue = totalRevenue
  const lastMonthRevenue = prevPeriodProposals.filter(p => p.status === 'Won').reduce((sum, p) => sum + Number(p.amount), 0)
  const thisMonthWon = wonProposals
  const lastMonthWon = prevPeriodProposals.filter(p => p.status === 'Won').length
  const revenueChange = lastMonthRevenue > 0 ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0
  const wonChange = lastMonthWon > 0 ? Math.round(((thisMonthWon - lastMonthWon) / lastMonthWon) * 100) : 0

  const activityData = buildActivityData(activityRange, proposals)

  // Proposal Pipeline funnel
  const sentCount = proposals.filter(p => p.status !== 'Draft').length
  const responseCount = proposals.filter(p => ['In Review', 'Negotiation', 'Won', 'Lost'].includes(p.status)).length
  const negotiationCount = proposals.filter(p => p.status === 'Negotiation' || p.status === 'Won' || p.status === 'Lost').length
  const pipelineWonCount = proposals.filter(p => p.status === 'Won').length
  const responseRate = sentCount > 0 ? Math.round((responseCount / sentCount) * 100) : 0
  const negotiationRate = responseCount > 0 ? Math.round((negotiationCount / responseCount) * 100) : 0
  const pipelineWinRate = negotiationCount > 0 ? Math.round((pipelineWonCount / negotiationCount) * 100) : (responseCount > 0 ? Math.round((pipelineWonCount / responseCount) * 100) : 0)
  const pipelineStages = [
    { label: 'Proposals Sent', count: sentCount, sub: null, color: '#7C5CFC' },
    { label: 'Responses', count: responseCount, sub: `${responseRate}% response rate`, color: '#6D8CFF' },
    { label: 'In Negotiation', count: negotiationCount, sub: `${negotiationRate}% of responses`, color: '#F59E0B' },
    { label: 'Won', count: pipelineWonCount, sub: `${pipelineWinRate}% win rate`, color: '#10B981' },
  ]
  const pipelineMax = Math.max(sentCount, 1)
  const revenueData = MONTHS.map((month, i) => ({ month, revenue: proposals.filter(p => { const d = new Date(p.deadline); return d.getMonth() === i && p.status === 'Won' }).reduce((sum, p) => sum + Number(p.amount), 0) }))
  const funnelData = [
    { stage: 'Draft', count: proposals.filter(p => p.status === 'Draft').length, color: '#94a3b8' },
    { stage: 'Sent', count: proposals.filter(p => p.status === 'Sent').length, color: '#3B82F6' },
    { stage: 'In Review', count: proposals.filter(p => p.status === 'In Review').length, color: '#F59E0B' },
    { stage: 'Won', count: proposals.filter(p => p.status === 'Won').length, color: '#10B981' },
  ]
  const maxCount = Math.max(...funnelData.map(f => f.count), 1)

  const recentProposals = [...proposals].reverse().slice(0, 5)
  const upcomingFollowups = followups.filter(f => f.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5)

  const STATUS_COLORS = {
    Draft: { bg: '#F1F5F9', color: '#64748B' },
    Sent: { bg: '#DBEAFE', color: '#1D4ED8' },
    'In Review': { bg: '#FEF3C7', color: '#D97706' },
    Negotiation: { bg: '#EDE9FE', color: '#6D28D9' },
    Won: { bg: '#D1FAE5', color: '#065F46' },
    Lost: { bg: '#FEE2E2', color: '#991B1B' },
  }

  const getProposalTitle = (id) => proposals.find(p => p.id === Number(id))?.title || 'Unknown'

  const topClients = clients.map(client => {
    const cp = proposals.filter(p => Number(p.clientId) === client.id)
    const revenue = cp.filter(p => p.status === 'Won').reduce((sum, p) => sum + Number(p.amount), 0)
    return { ...client, revenue, won: cp.filter(p => p.status === 'Won').length, total: cp.length }
  }).filter(c => c.total > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

  const getClientName = (clientId) => clients.find(c => c.id === Number(clientId))?.name

  // Most overdue follow-up -> its client name + days overdue
  const overdueSorted = followups.filter(f => f.date < today).sort((a, b) => a.date.localeCompare(b.date))
  const mostOverdueFollowup = overdueSorted[0]
  const mostOverdueProposal = mostOverdueFollowup ? proposals.find(p => p.id === Number(mostOverdueFollowup.proposalId)) : null
  const mostOverdueClient = mostOverdueProposal ? getClientName(mostOverdueProposal.clientId) : null
  const daysOverdue = mostOverdueFollowup ? Math.max(1, Math.floor((now - new Date(mostOverdueFollowup.date)) / 86400000)) : 0

  // Proposals sitting in "Sent" the longest (id is a Date.now() timestamp -> creation time)
  const waitingProposals = proposals.filter(p => p.status === 'Sent').sort((a, b) => a.id - b.id)
  const oldestWaiting = waitingProposals[0]
  const daysWaiting = oldestWaiting ? Math.max(1, Math.floor((now - oldestWaiting.id) / 86400000)) : 0

  // Clients with no proposal activity in the last 12 days
  const inactiveClients = clients.filter(c => {
    const clientProposals = proposals.filter(p => Number(p.clientId) === c.id)
    if (clientProposals.length === 0) return true
    const mostRecent = Math.max(...clientProposals.map(p => p.id))
    return Math.floor((now - mostRecent) / 86400000) >= 12
  })
  const daysInactive = (() => {
    if (inactiveClients.length === 0) return 0
    const clientProposals = proposals.filter(p => Number(p.clientId) === inactiveClients[0].id)
    if (clientProposals.length === 0) return null
    const mostRecent = Math.max(...clientProposals.map(p => p.id))
    return Math.floor((now - mostRecent) / 86400000)
  })()

  const attentionItems = [
    ...overdueFollowups > 0 ? [{
      icon: '⏰', iconBg: '#FEE2E2', iconColor: '#EF4444',
      label: `${overdueFollowups} overdue follow-up${overdueFollowups > 1 ? 's' : ''}`,
      name: mostOverdueClient || 'Client',
      sub: `Overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}`,
      action: () => navigate('/dashboard/followups'), actionLabel: 'Follow up',
    }] : [],
    ...waitingProposals.length > 0 ? [{
      icon: '📄', iconBg: '#FEF3C7', iconColor: '#F59E0B',
      label: `${waitingProposals.length} proposal${waitingProposals.length > 1 ? 's' : ''} waiting`,
      name: oldestWaiting.title,
      sub: `Sent ${daysWaiting} day${daysWaiting !== 1 ? 's' : ''} ago`,
      action: () => navigate('/dashboard/proposals'), actionLabel: 'View',
    }] : [],
    ...inactiveClients.length > 0 ? [{
      icon: '👤', iconBg: '#DBEAFE', iconColor: '#3B82F6',
      label: `${inactiveClients.length} client${inactiveClients.length > 1 ? 's' : ''} no activity`,
      name: inactiveClients[0].name,
      sub: daysInactive === null ? 'No proposals yet' : `No activity for ${daysInactive} days`,
      action: () => navigate('/dashboard/clients'), actionLabel: 'View all',
    }] : [],
  ].slice(0, 4)

  const logs = getLogs()
  const tooltipStyle = { borderRadius: '8px', border: `1px solid ${border}`, fontSize: '12px', backgroundColor: cardBg, color: titleColor }

  return (
    <div style={{ maxWidth: '1400px' }}>

      {/* Welcome */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <WelcomeText isDark={isDark} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)} style={{
            padding: '9px 14px', borderRadius: '8px', border: `1px solid ${border}`,
            backgroundColor: cardBg, color: titleColor, fontSize: '13px', fontWeight: '600',
            outline: 'none', cursor: 'pointer', fontFamily: 'inherit'
          }}>
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Quarter</option>
            <option>This Year</option>
          </select>
          <button onClick={handleExportReport} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 16px', borderRadius: '8px', border: `1px solid ${border}`,
            backgroundColor: cardBg, color: titleColor, fontSize: '13px', fontWeight: '600',
            cursor: 'pointer', fontFamily: 'inherit'
          }}>
            <span>⬇</span> Export Report
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : (attentionItems.length > 0 ? '1fr 280px' : '1fr'), gap: '20px', marginBottom: '20px' }}>
        <div>
          {/* Revenue Goal */}
          <div style={{ ...card, padding: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: titleColor }}>Monthly Revenue Goal</p>
                <p style={{ fontSize: '20px', fontWeight: '800', color: titleColor, marginTop: '2px' }}>
                  {currency} {totalRevenue.toLocaleString()} <span style={{ fontSize: '13px', fontWeight: '400', color: subColor }}>/ {currency} {revenueGoal.toLocaleString()}</span>
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {revenueChange !== 0 && (
                  <span style={{ fontSize: '11px', fontWeight: '600', color: revenueChange > 0 ? '#10B981' : '#EF4444' }}>
                    {revenueChange > 0 ? '↑' : '↓'} {Math.abs(revenueChange)}% vs last month
                  </span>
                )}
                <input type="number" value={revenueGoal}
                  onChange={(e) => { setRevenueGoal(Number(e.target.value)); localStorage.setItem(scopedKey('fpt_revenue_goal'), e.target.value) }}
                  style={{ padding: '6px 10px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: isDark ? '#1e1e2e' : '#f9fafb', color: titleColor, fontSize: '13px', outline: 'none', width: '120px' }} />
              </div>
            </div>
            <div style={{ backgroundColor: isDark ? '#1e1e2e' : '#f1f5f9', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '99px', width: `${Math.min(revenueGoal > 0 ? (totalRevenue / revenueGoal) * 100 : 0, 100)}%`, background: `linear-gradient(135deg, ${accent}, #7c3aed)`, transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '11px', color: subColor }}>{currency} {totalRevenue.toLocaleString()} earned</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: accent }}>{revenueGoal > 0 ? Math.min(Math.round((totalRevenue / revenueGoal) * 100), 100) : 0}%</span>
            </div>
          </div>

          {/* Stats Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
            <StatCard label="Revenue" value={`${currency} ${totalRevenue.toLocaleString()}`} color={accent} change={revenueChange} changeLabel={`vs ${prevPeriodLabel}`} isDark={isDark} />
            <StatCard label="Win Rate" value={`${winRate}%`} color="#10B981" change={wonChange} changeLabel={`vs ${prevPeriodLabel}`} isDark={isDark} />
            <StatCard label="Active Proposals" value={activeProposals} color="#F59E0B" changeLabel="in pipeline" isDark={isDark} />
            <StatCard label="Overdue Follow-ups" value={overdueFollowups} color={overdueFollowups > 0 ? '#EF4444' : '#10B981'} changeLabel={overdueFollowups > 0 ? 'Needs attention' : 'All good!'} isDark={isDark} />
          </div>

          {/* Stats Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
            <StatCard label="Total Clients" value={clients.length} isDark={isDark} />
            <StatCard label="Won Proposals" value={wonProposals} change={wonChange} changeLabel={`vs ${prevPeriodLabel}`} isDark={isDark} />
            <StatCard label={`Forecast`} value={`${currency} ${forecastRevenue.toLocaleString()}`} color="#7c3aed" changeLabel="based on win rate" isDark={isDark} />
            <StatCard label="In Review Value" value={`${currency} ${inReviewRevenue.toLocaleString()}`} color="#F59E0B" isDark={isDark} />
          </div>
        </div>

        {/* Needs Attention */}
        {attentionItems.length > 0 && (
          <div style={{ ...card, padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: titleColor, marginBottom: '16px' }}>Needs your attention</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {attentionItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '7px', flexShrink: 0,
                    backgroundColor: item.iconBg, color: item.iconColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', marginTop: '1px'
                  }}>{item.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: item.iconColor, margin: 0 }}>{item.label}</p>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: titleColor, margin: '3px 0 0' }}>{item.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: subColor }}>{item.sub}</span>
                      <button onClick={item.action} style={{ padding: '4px 12px', borderRadius: '6px', border: `1px solid ${border}`, backgroundColor: isDark ? '#0f0f13' : '#ffffff', color: accent, fontSize: '11px', fontWeight: '600', cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit' }}>{item.actionLabel}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ ...card, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: titleColor, margin: 0 }}>Proposal Activity</h3>
            <div style={{ display: 'flex', gap: '4px', backgroundColor: isDark ? '#1e1e2e' : '#f1f5f9', borderRadius: '8px', padding: '3px' }}>
              {RANGES.map(r => (
                <button key={r} onClick={() => setActivityRange(r)} style={{
                  padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  fontSize: '11px', fontWeight: '700', fontFamily: 'inherit',
                  backgroundColor: activityRange === r ? (isDark ? '#111118' : '#ffffff') : 'transparent',
                  color: activityRange === r ? accent : subColor,
                  boxShadow: activityRange === r ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'
                }}>{r}</button>
              ))}
            </div>
          </div>
          {proposals.length === 0 ? <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: subColor, fontSize: '13px' }}>No data yet</div> : (
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={activityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e1e2e' : '#f0f0f0'} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: subColor }} />
                <YAxis tick={{ fontSize: 10, fill: subColor }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: titleColor }} />
                <Line type="monotone" dataKey="Sent" stroke="#7C5CFC" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Won" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Lost" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div style={{ ...card, padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: titleColor, marginBottom: '16px' }}>Proposal Pipeline</h3>
          {proposals.length === 0 ? <div style={{ height: '190px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: subColor, fontSize: '13px' }}>No data yet</div> : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Funnel */}
              <div style={{ flex: '0 0 130px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                {pipelineStages.map((s) => {
                  const widthPct = Math.max((s.count / pipelineMax) * 100, s.count > 0 ? 22 : 8)
                  const inset = (100 - widthPct) / 2
                  return (
                    <div key={s.label} style={{
                      width: '100%', height: '38px',
                      clipPath: `polygon(${inset}% 0%, ${100 - inset}% 0%, ${100 - inset - 6}% 100%, ${inset + 6}% 100%)`,
                      backgroundColor: s.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <span style={{ color: 'white', fontSize: '12px', fontWeight: '800' }}>{s.count}</span>
                    </div>
                  )
                })}
              </div>
              {/* Legend / stats */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {pipelineStages.map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: s.color, flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: '800', color: titleColor, margin: 0 }}>{s.count} <span style={{ fontWeight: '600' }}>{s.label}</span></p>
                      {s.sub && <p style={{ fontSize: '11px', color: subColor, margin: '1px 0 0' }}>{s.sub}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Revenue Trend */}
      <div style={{ ...card, padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: titleColor, marginBottom: '16px' }}>Revenue Trend ({currency})</h3>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={accent} stopOpacity={0.2} />
                <stop offset="95%" stopColor={accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e1e2e' : '#f0f0f0'} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: subColor }} />
            <YAxis tick={{ fontSize: 10, fill: subColor }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${currency} ${v.toLocaleString()}`, 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke={accent} strokeWidth={2} fill="url(#revenueGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Recent Proposals */}
        <div style={{ ...card, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: titleColor }}>Recent Proposals</h3>
            <button onClick={() => navigate('/dashboard/proposals')} style={{ fontSize: '11px', color: accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>View all →</button>
          </div>
          {recentProposals.length === 0 ? <p style={{ fontSize: '13px', color: subColor }}>No proposals yet</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentProposals.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: titleColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</p>
                    <p style={{ fontSize: '11px', color: subColor }}>{currency} {Number(p.amount).toLocaleString()}</p>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', marginLeft: '8px', backgroundColor: STATUS_COLORS[p.status]?.bg, color: STATUS_COLORS[p.status]?.color, flexShrink: 0 }}>{p.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Follow-ups */}
        <div style={{ ...card, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: titleColor }}>Upcoming Follow-ups</h3>
            <button onClick={() => navigate('/dashboard/followups')} style={{ fontSize: '11px', color: accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>View all →</button>
          </div>
          {upcomingFollowups.length === 0 ? <p style={{ fontSize: '13px', color: subColor }}>No upcoming follow-ups</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingFollowups.map(f => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: titleColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getProposalTitle(f.proposalId)}</p>
                    <p style={{ fontSize: '11px', color: subColor }}>{f.notes || 'No notes'}</p>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: accent, flexShrink: 0, marginLeft: '8px' }}>{formatDate(f.date)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Clients */}
        <div style={{ ...card, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: titleColor }}>Top Clients</h3>
            <button onClick={() => navigate('/dashboard/clients')} style={{ fontSize: '11px', color: accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>View all →</button>
          </div>
          {topClients.length === 0 ? <p style={{ fontSize: '13px', color: subColor }}>No client data yet</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topClients.map((client, i) => {
                const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']
                return (
                  <div key={client.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>{medals[i]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '12px', fontWeight: '600', color: titleColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.name}</p>
                      <div style={{ backgroundColor: isDark ? '#1e1e2e' : '#f1f5f9', borderRadius: '99px', height: '4px', marginTop: '4px' }}>
                        <div style={{ height: '100%', borderRadius: '99px', width: `${topClients[0].revenue > 0 ? (client.revenue / topClients[0].revenue) * 100 : 0}%`, background: `linear-gradient(135deg, ${accent}, #7c3aed)` }} />
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: accent, flexShrink: 0 }}>{currency} {client.revenue.toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Funnel + Monthly Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ ...card, padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: titleColor, marginBottom: '16px' }}>Conversion Funnel</h3>
          {proposals.length === 0 ? <p style={{ fontSize: '13px', color: subColor }}>No data yet</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {funnelData.map((item, i) => (
                <div key={item.stage}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: titleColor }}>{item.stage}</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: item.color }}>{item.count}</span>
                  </div>
                  <div style={{ backgroundColor: isDark ? '#1e1e2e' : '#f1f5f9', borderRadius: '99px', height: '7px' }}>
                    <div style={{ height: '100%', width: `${(item.count / maxCount) * 100}%`, backgroundColor: item.color, borderRadius: '99px', transition: 'width 0.5s ease' }} />
                  </div>
                  {i < funnelData.length - 1 && item.count > 0 && funnelData[i + 1].count > 0 && (
                    <p style={{ fontSize: '10px', color: subColor, marginTop: '2px' }}>{Math.round((funnelData[i + 1].count / item.count) * 100)}% → {funnelData[i + 1].stage}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ ...card, padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: titleColor, marginBottom: '16px' }}>{periodLabel} vs {prevPeriodLabel[0].toUpperCase() + prevPeriodLabel.slice(1)}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Proposals', thisMonth: thisMonthProposals.length, lastMonth: lastMonthProposals.length, format: v => v },
              { label: 'Won Deals', thisMonth: thisMonthWon, lastMonth: lastMonthWon, format: v => v },
              { label: 'Revenue', thisMonth: thisMonthRevenue, lastMonth: lastMonthRevenue, format: v => `${currency} ${v.toLocaleString()}` },
              { label: 'Win Rate', thisMonth: thisMonthProposals.length > 0 ? Math.round((thisMonthWon / thisMonthProposals.length) * 100) : 0, lastMonth: lastMonthProposals.length > 0 ? Math.round((lastMonthWon / lastMonthProposals.length) * 100) : 0, format: v => `${v}%` },
            ].map((item) => {
              const change = item.lastMonth > 0 ? Math.round(((item.thisMonth - item.lastMonth) / item.lastMonth) * 100) : 0
              const isUp = item.thisMonth >= item.lastMonth
              return (
                <div key={item.label} style={{ padding: '12px', borderRadius: '10px', backgroundColor: isDark ? '#1e1e2e' : '#f9fafb', border: `1px solid ${border}` }}>
                  <p style={{ fontSize: '10px', color: subColor, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</p>
                  <p style={{ fontSize: '15px', fontWeight: '800', color: titleColor }}>{item.format(item.thisMonth)}</p>
                  <p style={{ fontSize: '10px', color: subColor }}>vs {item.format(item.lastMonth)}</p>
                  {item.lastMonth > 0 && <span style={{ fontSize: '10px', fontWeight: '700', color: isUp ? '#10B981' : '#EF4444' }}>{isUp ? '↑' : '↓'} {Math.abs(change)}%</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div style={{ ...card, padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: titleColor }}>Activity Log</h3>
          <button onClick={() => { clearLogs(); showToast('Activity log cleared!', 'success') }}
            style={{ fontSize: '11px', color: subColor, background: 'none', border: `1px solid ${border}`, borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}>
            Clear All
          </button>
        </div>
        {logs.length === 0 ? <p style={{ fontSize: '13px', color: subColor }}>No activity yet</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
            {logs.map(log => {
              const icons = { CLIENT_ADDED: '👤', CLIENT_DELETED: '🗑️', CLIENT_UPDATED: '✏️', PROPOSAL_ADDED: '📄', PROPOSAL_DELETED: '🗑️', PROPOSAL_UPDATED: '✏️', PROPOSAL_STATUS: '🔄', FOLLOWUP_ADDED: '🔔', FOLLOWUP_DELETED: '🗑️', FOLLOWUP_UPDATED: '✏️', TEMPLATE_SAVED: '📋', COMMUNICATION_LOGGED: '📞' }
              const timeAgo = (ts) => { const diff = Date.now() - new Date(ts).getTime(); const m = Math.floor(diff / 60000); const h = Math.floor(diff / 3600000); const d = Math.floor(diff / 86400000); return d > 0 ? `${d}d ago` : h > 0 ? `${h}h ago` : m > 0 ? `${m}m ago` : 'just now' }
              return (
                <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', backgroundColor: isDark ? '#1e1e2e' : '#f9fafb' }}>
                  <span style={{ fontSize: '14px' }}>{icons[log.action] || '📌'}</span>
                  <p style={{ fontSize: '12px', flex: 1, color: titleColor }}>{log.details}</p>
                  <p style={{ fontSize: '10px', color: subColor, flexShrink: 0 }}>{timeAgo(log.timestamp)}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}