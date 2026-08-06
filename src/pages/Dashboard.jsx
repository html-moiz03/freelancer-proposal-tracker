import { useState, useEffect } from 'react'
import { getLogs, clearLogs } from '../utils/activityLog'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { formatDate } from '../utils/formatDate'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts'

const STATUS_COLORS_PIE = {
  Draft: '#9B9A97',
  Sent: '#3B82F6',
  'In Review': '#F59E0B',
  Won: '#10B981',
  Lost: '#EF4444',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function WelcomeText({ titleColor, accent }) {
  const session = JSON.parse(localStorage.getItem('fpt_session') || '{}')
  const name = session.name ? session.name.split(' ')[0] : 'there'
  const fullText = `Welcome, ${name}! 👋`
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(fullText.slice(0, i))
      if (i >= fullText.length) clearInterval(interval)
    }, 60)
    return () => clearInterval(interval)
  }, [fullText])

  return (
    <h2 className="text-2xl font-bold" style={{ color: titleColor }}>
      {displayed}
      <span style={{
        display: 'inline-block',
        width: '2px', height: '24px',
        backgroundColor: accent,
        marginLeft: '2px',
        verticalAlign: 'middle',
        animation: 'blink 1s step-end infinite'
      }} />
      <style>{`@keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }`}</style>
    </h2>
  )
}

export default function Dashboard() {
  const { clients, proposals, followups, currency } = useApp()
  const { isDark, accent } = useTheme()

  const today = new Date().toISOString().split('T')[0]
  const [revenueGoal, setRevenueGoal] = useState(() => {
    return Number(localStorage.getItem('fpt_revenue_goal')) || 100000
  })
  const logs = getLogs()
  const totalProposals = proposals.length
  const wonProposals = proposals.filter((p) => p.status === 'Won').length
  const winRate = totalProposals > 0 ? Math.round((wonProposals / totalProposals) * 100) : 0
  const totalRevenue = proposals
    .filter((p) => p.status === 'Won')
    .reduce((sum, p) => sum + Number(p.amount), 0)
  const overdueFollowups = followups.filter((f) => f.date < today).length

  const stats = [
    { label: 'Total Clients', value: clients.length, color: '#2383E2' },
    { label: 'Total Proposals', value: totalProposals, color: '#9065B0' },
    { label: 'Won Proposals', value: wonProposals, color: '#0F9B6E' },
    { label: 'Win Rate', value: `${winRate}%`, color: '#D9730D' },
    { label: `Revenue (${currency})`, value: totalRevenue.toLocaleString(), color: '#0F9B6E' },
    { label: 'Overdue Follow-ups', value: overdueFollowups, color: '#E03E3E' },
  ]

  const barData = MONTHS.map((month, i) => ({
    month,
    proposals: proposals.filter((p) => {
      const d = new Date(p.deadline)
      return d.getMonth() === i
    }).length
  }))

  const revenueData = MONTHS.map((month, i) => ({
    month,
    revenue: proposals
      .filter((p) => {
        const d = new Date(p.deadline)
        return d.getMonth() === i && p.status === 'Won'
      })
      .reduce((sum, p) => sum + Number(p.amount), 0)
  }))

  const statusCounts = ['Draft', 'Sent', 'In Review', 'Won', 'Lost'].map((status) => ({
    name: status,
    value: proposals.filter((p) => p.status === status).length
  })).filter((d) => d.value > 0)

  const recentProposals = [...proposals].reverse().slice(0, 5)
  const upcomingFollowups = followups
    .filter((f) => f.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)

  const STATUS_COLORS = {
    Draft: { bg: '#F1F0EE', color: '#6B6B6B' },
    Sent: { bg: '#DBEAFE', color: '#1D4ED8' },
    'In Review': { bg: '#FEF3C7', color: '#D97706' },
    Won: { bg: '#D1FAE5', color: '#065F46' },
    Lost: { bg: '#FEE2E2', color: '#991B1B' },
  }

  const getProposalTitle = (id) => {
    const proposal = proposals.find((p) => p.id === Number(id))
    return proposal ? proposal.title : 'Unknown'
  }

  const topClients = clients
    .map((client) => {
      const clientProposals = proposals.filter((p) => Number(p.clientId) === client.id)
      const revenue = clientProposals.filter((p) => p.status === 'Won').reduce((sum, p) => sum + Number(p.amount), 0)
      const won = clientProposals.filter((p) => p.status === 'Won').length
      return { ...client, revenue, won, total: clientProposals.length }
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const card = {
    backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF',
    borderColor: isDark ? '#2a2a2a' : '#E9E9E7'
  }

  const titleColor = isDark ? '#ffffff' : '#37352F'
  const subColor = isDark ? '#94a3b8' : '#9B9A97'

  return (
    <div>
      <div className="mb-6">
        <WelcomeText titleColor={titleColor} accent={accent} />
        <p className="text-sm mt-1" style={{ color: subColor }}>Here's what's happening with your business today.</p>
      </div>

      {/* Revenue Goal */}
      <div className="rounded-xl p-5 border mb-6" style={card}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-2">
          <div>
            <h3 className="font-semibold" style={{ color: titleColor }}>Monthly Revenue Goal</h3>
            <p className="text-xs mt-0.5" style={{ color: subColor }}>Track your earnings progress</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: subColor }}>Goal ({currency})</span>
            <input
              type="number"
              value={revenueGoal}
              onChange={(e) => {
                setRevenueGoal(Number(e.target.value))
                localStorage.setItem('fpt_revenue_goal', e.target.value)
              }}
              className="text-sm font-semibold px-3 py-1 rounded-lg border focus:outline-none w-32"
              style={{ borderColor: isDark ? '#2a2a2a' : '#E9E9E7', color: titleColor, backgroundColor: isDark ? '#111111' : '#F7F6F3' }}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div style={{ backgroundColor: isDark ? '#2a2a2a' : '#F1F0EE', borderRadius: '99px', height: '10px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '99px',
                width: `${Math.min(revenueGoal > 0 ? (totalRevenue / revenueGoal) * 100 : 0, 100)}%`,
                background: `linear-gradient(135deg, ${accent}, #7c3aed)`,
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
          <span className="text-sm font-bold" style={{ color: '#4F46E5', minWidth: '40px', textAlign: 'right' }}>
            {revenueGoal > 0 ? Math.min(Math.round((totalRevenue / revenueGoal) * 100), 100) : 0}%
          </span>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs" style={{ color: subColor }}>{currency} {totalRevenue.toLocaleString()} earned</span>
          <span className="text-xs" style={{ color: subColor }}>Goal: {currency} {revenueGoal.toLocaleString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl p-5 border" style={card}>
            <p className="text-sm font-medium mb-1" style={{ color: titleColor }}>{stat.label}</p>
            <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl p-5 border" style={card}>
          <h3 className="font-semibold mb-4" style={{ color: titleColor }}>Proposals by Month</h3>
          {proposals.length === 0 ? (
            <div className="flex items-center justify-center h-40" style={{ color: subColor }}>
              <p className="text-sm">No proposal data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2a2a2a' : '#F1F0EE'} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: subColor }} />
                <YAxis tick={{ fontSize: 11, fill: subColor }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: `1px solid ${isDark ? '#2a2a2a' : '#E9E9E7'}`, fontSize: '12px', backgroundColor: isDark ? '#1a1a1a' : '#fff', color: titleColor }} />
                <Bar dataKey="proposals" fill={accent} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl p-5 border" style={card}>
          <h3 className="font-semibold mb-4" style={{ color: titleColor }}>Proposal Status Breakdown</h3>
          {statusCounts.length === 0 ? (
            <div className="flex items-center justify-center h-40" style={{ color: subColor }}>
              <p className="text-sm">No proposal data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusCounts.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS_PIE[entry.name]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: `1px solid ${isDark ? '#2a2a2a' : '#E9E9E7'}`, fontSize: '12px', backgroundColor: isDark ? '#1a1a1a' : '#fff', color: titleColor }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: titleColor }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Revenue Line Chart */}
      <div className="rounded-xl p-5 border mt-6" style={card}>
        <h3 className="font-semibold mb-4" style={{ color: titleColor }}>📈 Revenue Trend ({currency})</h3>
        {proposals.filter(p => p.status === 'Won').length === 0 ? (
        <div className="flex items-center justify-center h-40" style={{ color: subColor }}>
          <p className="text-sm">No won proposals yet — close some deals!</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={accent} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={accent} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2a2a2a' : '#F1F0EE'} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: subColor }} />
            <YAxis tick={{ fontSize: 11, fill: subColor }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: `1px solid ${isDark ? '#2a2a2a' : '#E9E9E7'}`, fontSize: '12px', backgroundColor: isDark ? '#1a1a1a' : '#fff', color: titleColor }}
              formatter={(value) => [`${currency} ${value.toLocaleString()}`, 'Revenue']}
            />
            <Area type="monotone" dataKey="revenue" stroke={accent} strokeWidth={2} fill="url(#revenueGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl p-5 border" style={card}>
          <h3 className="font-semibold mb-4" style={{ color: titleColor }}>Recent Proposals</h3>
          {recentProposals.length === 0 ? (
            <p className="text-sm" style={{ color: subColor }}>No proposals yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentProposals.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: titleColor }}>{p.title}</p>
                    <p className="text-xs" style={{ color: subColor }}>{currency} {Number(p.amount).toLocaleString()}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: STATUS_COLORS[p.status].bg, color: STATUS_COLORS[p.status].color }}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl p-5 border" style={card}>
          <h3 className="font-semibold mb-4" style={{ color: titleColor }}>Upcoming Follow-ups</h3>
          {upcomingFollowups.length === 0 ? (
            <p className="text-sm" style={{ color: subColor }}>No upcoming follow-ups</p>
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingFollowups.map((f) => (
                <div key={f.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: titleColor }}>{getProposalTitle(f.proposalId)}</p>
                    <p className="text-xs" style={{ color: subColor }}>{f.notes || 'No notes'}</p>
                  </div>
                  <p className="text-xs font-medium" style={{ color: '#2383E2' }}>{formatDate(f.date)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Activity Log */}
      <div className="rounded-xl p-5 border mt-6" style={card}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: titleColor }}>📋 Activity Log</h3>
          <button
            onClick={() => { clearLogs(); window.location.reload() }}
            className="text-xs px-3 py-1 rounded-lg border"
            style={{ color: subColor, borderColor: isDark ? '#2a2a2a' : '#E9E9E7', backgroundColor: 'transparent' }}
          >
            Clear All
          </button>
        </div>
        {logs.length === 0 ? (
          <p className="text-sm" style={{ color: subColor }}>No activity yet — start adding clients and proposals!</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {logs.map((log) => {
              const icons = {
                CLIENT_ADDED: '👤',
                CLIENT_DELETED: '🗑️',
                CLIENT_UPDATED: '✏️',
                PROPOSAL_ADDED: '📄',
                PROPOSAL_DELETED: '🗑️',
                PROPOSAL_UPDATED: '✏️',
                PROPOSAL_STATUS: '🔄',
                FOLLOWUP_ADDED: '🔔',
                FOLLOWUP_DELETED: '🗑️',
                FOLLOWUP_UPDATED: '✏️',
              }
              const timeAgo = (timestamp) => {
                const diff = Date.now() - new Date(timestamp).getTime()
                const mins = Math.floor(diff / 60000)
                const hours = Math.floor(diff / 3600000)
                const days = Math.floor(diff / 86400000)
                if (days > 0) return `${days}d ago`
                if (hours > 0) return `${hours}h ago`
                if (mins > 0) return `${mins}m ago`
                return 'just now'
              }
              return (
                <div key={log.id} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: isDark ? '#2a2a2a' : '#E9E9E7' }}>
                  <span style={{ fontSize: '16px' }}>{icons[log.action] || '📌'}</span>
                  <p className="text-sm flex-1" style={{ color: titleColor }}>{log.details}</p>
                  <p className="text-xs" style={{ color: subColor }}>{timeAgo(log.timestamp)}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Top Clients Leaderboard */}
      <div className="rounded-xl p-5 border mt-6" style={card}>
        <h3 className="font-semibold mb-4" style={{ color: titleColor }}>🏆 Top Clients by Revenue</h3>
        {topClients.length === 0 ? (
          <p className="text-sm" style={{ color: subColor }}>No client revenue data yet</p>
        ) : (
          <div className="flex flex-col gap-3">
            {topClients.map((client, index) => {
              const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']
              const maxRevenue = topClients[0].revenue
              return (
                <div key={client.id} className="flex items-center gap-3">
                  <span style={{ fontSize: '18px', width: '24px' }}>{medals[index]}</span>
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium" style={{ color: titleColor }}>{client.name}</p>
                      <p className="text-sm font-bold" style={{ color: accent }}>{currency} {client.revenue.toLocaleString()}</p>
                    </div>
                    <div style={{ backgroundColor: isDark ? '#2a2a2a' : '#F1F0EE', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '99px',
                        width: `${maxRevenue > 0 ? (client.revenue / maxRevenue) * 100 : 0}%`,
                        background: `linear-gradient(135deg, ${accent}, #7c3aed)`,
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <p className="text-xs mt-1" style={{ color: subColor }}>{client.won} won · {client.total} total proposals</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}