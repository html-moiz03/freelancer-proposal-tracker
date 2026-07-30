import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const STATUS_COLORS_PIE = {
  Draft: '#9B9A97',
  Sent: '#3B82F6',
  'In Review': '#F59E0B',
  Won: '#10B981',
  Lost: '#EF4444',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Dashboard() {
  const { clients, proposals, followups } = useApp()
  const { isDark } = useTheme()

  const today = new Date().toISOString().split('T')[0]
  const [revenueGoal, setRevenueGoal] = useState(() => {
    return Number(localStorage.getItem('fpt_revenue_goal')) || 100000
  })

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
    { label: 'Revenue (PKR)', value: totalRevenue.toLocaleString(), color: '#0F9B6E' },
    { label: 'Overdue Follow-ups', value: overdueFollowups, color: '#E03E3E' },
  ]

  const barData = MONTHS.map((month, i) => ({
    month,
    proposals: proposals.filter((p) => {
      const d = new Date(p.deadline)
      return d.getMonth() === i
    }).length
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

  const card = {
    backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF',
    borderColor: isDark ? '#2a2a2a' : '#E9E9E7'
  }

  const titleColor = isDark ? '#ffffff' : '#37352F'
  const subColor = isDark ? '#94a3b8' : '#9B9A97'

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6" style={{ color: titleColor }}>Dashboard</h2>

      {/* Revenue Goal */}
      <div className="rounded-xl p-5 border mb-6" style={card}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold" style={{ color: titleColor }}>Monthly Revenue Goal</h3>
            <p className="text-xs mt-0.5" style={{ color: subColor }}>Track your earnings progress</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: subColor }}>Goal (PKR)</span>
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
                background: 'linear-gradient(135deg, #4F46E5, #7c3aed)',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
          <span className="text-sm font-bold" style={{ color: '#4F46E5', minWidth: '40px', textAlign: 'right' }}>
            {revenueGoal > 0 ? Math.min(Math.round((totalRevenue / revenueGoal) * 100), 100) : 0}%
          </span>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs" style={{ color: subColor }}>PKR {totalRevenue.toLocaleString()} earned</span>
          <span className="text-xs" style={{ color: subColor }}>Goal: PKR {revenueGoal.toLocaleString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl p-5 border" style={card}>
            <p className="text-sm font-medium mb-1" style={{ color: titleColor }}>{stat.label}</p>
            <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-8">
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
                <Bar dataKey="proposals" fill="#4F46E5" radius={[4, 4, 0, 0]} />
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

      {/* Recent Activity */}
      <div className="grid grid-cols-2 gap-6">
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
                    <p className="text-xs" style={{ color: subColor }}>PKR {Number(p.amount).toLocaleString()}</p>
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
                  <p className="text-xs font-medium" style={{ color: '#2383E2' }}>{f.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}