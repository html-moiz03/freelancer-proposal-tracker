import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { generateMonthlyReport } from '../utils/generateMonthlyReport'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const RANGE_PRESETS = ['Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month', 'This Year']

const STATUS_COLORS = { Won: '#10B981', 'In Review': '#F59E0B', Sent: '#3B82F6', Lost: '#EF4444', Negotiation: '#7C3AED', Draft: '#94A3B8' }
const FOLLOWUP_COLORS = { Completed: '#10B981', Pending: '#F59E0B', Overdue: '#EF4444' }

// Top-level helper keeps impure Date access out of the component body itself
function todayDate() {
  return new Date()
}

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fmtShort(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getRange(preset, today) {
  const end = new Date(today)
  let start
  if (preset === 'Last 7 Days') { start = new Date(today); start.setDate(start.getDate() - 6) }
  else if (preset === 'Last 30 Days') { start = new Date(today); start.setDate(start.getDate() - 29) }
  else if (preset === 'This Month') { start = new Date(today.getFullYear(), today.getMonth(), 1) }
  else if (preset === 'Last Month') { start = new Date(today.getFullYear(), today.getMonth() - 1, 1); return { start, end: new Date(today.getFullYear(), today.getMonth(), 0) } }
  else if (preset === 'This Year') { start = new Date(today.getFullYear(), 0, 1) }
  else { start = new Date(today); start.setDate(start.getDate() - 29) }
  return { start, end }
}

export default function Reports() {
  const { clients, proposals, followups, currency } = useApp()
  const { isDark, accent } = useTheme()
  const { showToast } = useToast()

  const [today] = useState(() => todayDate())
  const [preset, setPreset] = useState('This Month')
  const [showPicker, setShowPicker] = useState(false)

  const titleColor = isDark ? '#ffffff' : '#111827'
  const subColor = isDark ? '#64748b' : '#6b7280'
  const cardBg = isDark ? '#111118' : '#ffffff'
  const border = isDark ? '#1e1e2e' : '#f0f0f0'
  const card = { backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '12px' }
  const tooltipStyle = { borderRadius: '8px', border: `1px solid ${border}`, fontSize: '12px', backgroundColor: cardBg, color: titleColor }

  const { start, end } = getRange(preset, today)
  const startStr = toDateStr(start)
  const endStr = toDateStr(end)
  const rangeDays = Math.round((end - start) / 86400000) + 1
  const prevEnd = new Date(start); prevEnd.setDate(prevEnd.getDate() - 1)
  const prevStart = new Date(prevEnd); prevStart.setDate(prevStart.getDate() - (rangeDays - 1))
  const prevStartStr = toDateStr(prevStart)
  const prevEndStr = toDateStr(prevEnd)

  const inRange = (dateStr, s, e) => dateStr >= s && dateStr <= e
  const currentProposals = proposals.filter((p) => inRange(p.deadline, startStr, endStr))
  const previousProposals = proposals.filter((p) => inRange(p.deadline, prevStartStr, prevEndStr))

  const calcMetrics = (list) => {
    const won = list.filter((p) => p.status === 'Won')
    const revenue = won.reduce((sum, p) => sum + Number(p.amount), 0)
    const winRate = list.length > 0 ? Math.round((won.length / list.length) * 100) : 0
    const avgValue = list.length > 0 ? Math.round(list.reduce((sum, p) => sum + Number(p.amount), 0) / list.length) : 0
    return { revenue, total: list.length, winRate, avgValue }
  }

  const current = calcMetrics(currentProposals)
  const previous = calcMetrics(previousProposals)
  const pctChange = (curr, prev) => prev > 0 ? Math.round(((curr - prev) / prev) * 100) : (curr > 0 ? 100 : 0)

  const stats = [
    { label: 'Total Revenue', value: `${currency} ${current.revenue.toLocaleString()}`, change: pctChange(current.revenue, previous.revenue), highlight: true },
    { label: 'Total Proposals', value: current.total, change: pctChange(current.total, previous.total) },
    { label: 'Win Rate', value: `${current.winRate}%`, change: current.winRate - previous.winRate, isPoint: true },
    { label: 'Avg. Proposal Value', value: `${currency} ${current.avgValue.toLocaleString()}`, change: pctChange(current.avgValue, previous.avgValue) },
  ]

  // Revenue over time — bucket by day if range is short, weekly if long
  const bucketByWeek = rangeDays > 45
  const buckets = []
  if (bucketByWeek) {
    let cursor = new Date(start)
    while (cursor <= end) {
      const bucketEnd = new Date(cursor); bucketEnd.setDate(bucketEnd.getDate() + 6)
      buckets.push({ label: fmtShort(cursor), s: toDateStr(cursor), e: toDateStr(bucketEnd > end ? end : bucketEnd) })
      cursor.setDate(cursor.getDate() + 7)
    }
  } else {
    let cursor = new Date(start)
    while (cursor <= end) {
      const s = toDateStr(cursor)
      buckets.push({ label: fmtShort(cursor), s, e: s })
      cursor.setDate(cursor.getDate() + 1)
    }
  }
  const revenueSeries = buckets.map((b) => ({
    label: b.label,
    revenue: proposals.filter((p) => p.status === 'Won' && inRange(p.deadline, b.s, b.e)).reduce((sum, p) => sum + Number(p.amount), 0),
  }))

  // Proposal status breakdown (within range)
  const statusBreakdown = ['Won', 'In Review', 'Sent', 'Negotiation', 'Lost', 'Draft']
    .map((status) => ({ name: status, value: currentProposals.filter((p) => p.status === status).length }))
    .filter((d) => d.value > 0)

  // Top clients by revenue (within range)
  const topClients = clients.map((c) => {
    const cp = currentProposals.filter((p) => Number(p.clientId) === c.id)
    const won = cp.filter((p) => p.status === 'Won')
    const revenue = won.reduce((sum, p) => sum + Number(p.amount), 0)
    const winRate = cp.length > 0 ? Math.round((won.length / cp.length) * 100) : 0
    return { ...c, revenue, proposalsCount: cp.length, winRate }
  }).filter((c) => c.proposalsCount > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 6)

  // Follow-ups overview
  const totalFollowups = followups.length
  const completedFollowups = followups.filter((f) => f.completed).length
  const overdueFollowups = followups.filter((f) => !f.completed && f.date < toDateStr(today)).length
  const pendingFollowups = totalFollowups - completedFollowups - overdueFollowups
  const followupBreakdown = [
    { name: 'Completed', value: completedFollowups },
    { name: 'Pending', value: pendingFollowups },
    { name: 'Overdue', value: overdueFollowups },
  ].filter((d) => d.value > 0)

  return (
    <div style={{ maxWidth: '1400px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: titleColor, margin: 0 }}>Reports</h2>
          <p style={{ fontSize: '13px', color: subColor, marginTop: '4px' }}>Analyze your performance and grow your freelance business.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
          <button onClick={() => setShowPicker(!showPicker)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: cardBg, color: titleColor, fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
            📅 {fmtShort(start)} – {fmtShort(end)}, {end.getFullYear()}
          </button>
          <button onClick={() => { generateMonthlyReport(clients, proposals, followups); showToast('Report exported!', 'success') }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg, ${accent}, #7c3aed)`, color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
            ⬇ Export Report
          </button>
          {showPicker && (
            <>
              <div onClick={() => setShowPicker(false)} style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
              <div style={{ position: 'absolute', top: '42px', left: 0, zIndex: 99, width: '170px', backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '6px' }}>
                {RANGE_PRESETS.map((p) => (
                  <button key={p} onClick={() => { setPreset(p); setShowPicker(false) }} style={{ display: 'block', width: '100%', padding: '8px 10px', border: 'none', background: preset === p ? (isDark ? accent + '22' : accent + '14') : 'none', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: preset === p ? accent : titleColor, cursor: 'pointer', fontFamily: 'inherit', borderRadius: '6px' }}>{p}</button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            ...card, padding: '16px',
            border: s.highlight ? `1px solid ${accent}` : card.border,
          }}>
            <p style={{ fontSize: '11px', fontWeight: '600', color: subColor, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{s.label}</p>
            <p style={{ fontSize: '20px', fontWeight: '800', color: titleColor, marginBottom: '6px' }}>{s.value}</p>
            <span style={{ fontSize: '11px', fontWeight: '600', color: s.change >= 0 ? '#10B981' : '#EF4444' }}>
              {s.change >= 0 ? '↑' : '↓'} {Math.abs(s.change)}{s.isPoint ? ' pts' : '%'} vs previous period
            </span>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ ...card, padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: titleColor, marginBottom: '16px' }}>Revenue Over Time</h3>
          {revenueSeries.every((r) => r.revenue === 0) ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: subColor, fontSize: '13px' }}>No revenue in this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueSeries} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e1e2e' : '#f0f0f0'} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: subColor }} />
                <YAxis tick={{ fontSize: 10, fill: subColor }} tickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : v} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${currency} ${v.toLocaleString()}`, 'Revenue']} />
                <Legend wrapperStyle={{ fontSize: '11px', color: titleColor }} />
                <Line type="monotone" dataKey="revenue" name={`Revenue (${currency})`} stroke={accent} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ ...card, padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: titleColor, marginBottom: '16px' }}>Proposal Status</h3>
          {statusBreakdown.length === 0 ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: subColor, fontSize: '13px' }}>No proposals in this period</div>
          ) : (
            <div style={{ position: 'relative' }}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusBreakdown} cx="50%" cy="46%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {statusBreakdown.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconType="circle" iconSize={8} layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', color: titleColor }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '46%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <p style={{ fontSize: '22px', fontWeight: '800', color: titleColor, margin: 0 }}>{current.total}</p>
                <p style={{ fontSize: '11px', color: subColor, margin: 0 }}>Total</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ ...card, padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: titleColor, marginBottom: '16px' }}>Top Clients by Revenue</h3>
          {topClients.length === 0 ? (
            <p style={{ fontSize: '13px', color: subColor }}>No client revenue in this period</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {['Client', `Revenue (${currency})`, 'Proposals', 'Win Rate'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 6px', fontSize: '10px', fontWeight: '700', color: subColor, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topClients.map((c) => (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${border}` }}>
                    <td style={{ padding: '10px 6px', fontSize: '12px', fontWeight: '600', color: accent }}>{c.name}</td>
                    <td style={{ padding: '10px 6px', fontSize: '12px', color: titleColor }}>{c.revenue.toLocaleString()}</td>
                    <td style={{ padding: '10px 6px', fontSize: '12px', color: titleColor }}>{c.proposalsCount}</td>
                    <td style={{ padding: '10px 6px', fontSize: '12px', color: titleColor }}>{c.winRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ ...card, padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: titleColor, marginBottom: '16px' }}>Follow-ups Overview</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Total Follow-ups', value: totalFollowups, color: titleColor, dot: subColor },
                { label: 'Completed', value: completedFollowups, color: '#10B981', dot: '#10B981' },
                { label: 'Pending', value: pendingFollowups, color: '#F59E0B', dot: '#F59E0B' },
                { label: 'Overdue', value: overdueFollowups, color: '#EF4444', dot: '#EF4444' },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: row.dot, flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: titleColor, flex: 1 }}>{row.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
            {followupBreakdown.length > 0 && (
              <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={followupBreakdown} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value">
                      {followupBreakdown.map((entry) => <Cell key={entry.name} fill={FOLLOWUP_COLORS[entry.name]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                  <p style={{ fontSize: '16px', fontWeight: '800', color: titleColor, margin: 0 }}>{totalFollowups}</p>
                  <p style={{ fontSize: '10px', color: subColor, margin: 0 }}>Total</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
