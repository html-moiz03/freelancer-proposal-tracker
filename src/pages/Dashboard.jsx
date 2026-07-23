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
    { label: 'Total Clients', value: clients.length, color: 'text-cyan-400', bg: 'bg-cyan-900/30' },
    { label: 'Total Proposals', value: totalProposals, color: 'text-blue-400', bg: 'bg-blue-900/30' },
    { label: 'Won Proposals', value: wonProposals, color: 'text-green-400', bg: 'bg-green-900/30' },
    { label: 'Win Rate', value: `${winRate}%`, color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
    { label: 'Revenue (PKR)', value: totalRevenue.toLocaleString(), color: 'text-emerald-400', bg: 'bg-emerald-900/30' },
    { label: 'Overdue Follow-ups', value: overdueFollowups, color: 'text-red-400', bg: 'bg-red-900/30' },
  ]

  const recentProposals = [...proposals].reverse().slice(0, 5)
  const upcomingFollowups = followups.filter((f) => f.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5)

  const STATUS_COLORS = {
    Draft: 'bg-gray-600 text-gray-100',
    Sent: 'bg-blue-600 text-blue-100',
    'In Review': 'bg-yellow-600 text-yellow-100',
    Won: 'bg-green-600 text-green-100',
    Lost: 'bg-red-600 text-red-100',
  }

  const getProposalTitle = (id) => {
    const proposal = proposals.find((p) => p.id === Number(id))
    return proposal ? proposal.title : 'Unknown'
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-cyan-400 mb-6">Dashboard</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-5 border border-gray-700`}>
            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Proposals */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Recent Proposals</h3>
          {recentProposals.length === 0 ? (
            <p className="text-gray-500 text-sm">No proposals yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentProposals.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{p.title}</p>
                    <p className="text-gray-400 text-xs">PKR {Number(p.amount).toLocaleString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[p.status]}`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Follow-ups */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Upcoming Follow-ups</h3>
          {upcomingFollowups.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming follow-ups</p>
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingFollowups.map((f) => (
                <div key={f.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{getProposalTitle(f.proposalId)}</p>
                    <p className="text-gray-400 text-xs">{f.notes || 'No notes'}</p>
                  </div>
                  <p className="text-cyan-400 text-xs font-medium">{f.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}