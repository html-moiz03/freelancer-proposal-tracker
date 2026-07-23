import { useApp } from '../context/AppContext'

export default function Dashboard() {
  const { clients, proposals, followups } = useApp()

  const today = new Date().toISOString().split('T')[0]

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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#37352F' }}>Dashboard</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl p-5 border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E9E9E7' }}>
            <p className="text-sm font-medium mb-1" style={{ color: '#37352F' }}>{stat.label}</p>
            <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Proposals */}
        <div className="rounded-xl p-5 border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E9E9E7' }}>
          <h3 className="font-semibold mb-4" style={{ color: '#37352F' }}>Recent Proposals</h3>
          {recentProposals.length === 0 ? (
            <p className="text-sm" style={{ color: '#9B9A97' }}>No proposals yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentProposals.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#37352F' }}>{p.title}</p>
                    <p className="text-xs" style={{ color: '#9B9A97' }}>PKR {Number(p.amount).toLocaleString()}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: STATUS_COLORS[p.status].bg, color: STATUS_COLORS[p.status].color }}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Follow-ups */}
        <div className="rounded-xl p-5 border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E9E9E7' }}>
          <h3 className="font-semibold mb-4" style={{ color: '#37352F' }}>Upcoming Follow-ups</h3>
          {upcomingFollowups.length === 0 ? (
            <p className="text-sm" style={{ color: '#9B9A97' }}>No upcoming follow-ups</p>
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingFollowups.map((f) => (
                <div key={f.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#37352F' }}>{getProposalTitle(f.proposalId)}</p>
                    <p className="text-xs" style={{ color: '#9B9A97' }}>{f.notes || 'No notes'}</p>
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