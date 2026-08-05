import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { useState } from 'react'

const STATUS_COLORS = {
  Draft: { bg: '#F1F0EE', color: '#6B6B6B' },
  Sent: { bg: '#DBEAFE', color: '#1D4ED8' },
  'In Review': { bg: '#FEF3C7', color: '#D97706' },
  Won: { bg: '#D1FAE5', color: '#065F46' },
  Lost: { bg: '#FEE2E2', color: '#991B1B' },
}

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { clients, proposals, currency, updateClient } = useApp()

  const handleSaveNotes = () => {
    updateClient(client.id, { notes })
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2000)
  }
  const { isDark } = useTheme()

  const client = clients.find((c) => c.id === Number(id))
  const [notes, setNotes] = useState(client?.notes || '')
  const [notesSaved, setNotesSaved] = useState(false)
  const clientProposals = proposals.filter((p) => Number(p.clientId) === Number(id))

  const card = { backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF', borderColor: isDark ? '#2a2a2a' : '#E9E9E7' }
  const titleColor = isDark ? '#ffffff' : '#37352F'
  const subColor = isDark ? '#94a3b8' : '#9B9A97'

  if (!client) return (
    <div className="text-center py-20" style={{ color: subColor }}>
      <p className="text-4xl mb-3">👤</p>
      <p className="text-lg font-medium">Client not found</p>
      <button onClick={() => navigate('/dashboard/clients')} className="mt-4 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: '#37352F', color: '#FFFFFF' }}>
        Back to Clients
      </button>
    </div>
  )

  const totalRevenue = clientProposals.filter((p) => p.status === 'Won').reduce((sum, p) => sum + Number(p.amount), 0)
  const wonProposals = clientProposals.filter((p) => p.status === 'Won').length
  const winRate = clientProposals.length > 0 ? Math.round((wonProposals / clientProposals.length) * 100) : 0

  const initials = client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate('/dashboard/clients')}
        className="flex items-center gap-2 text-sm mb-6 font-medium"
        style={{ color: subColor }}
      >
        ← Back to Clients
      </button>

      {/* Client Header */}
      <div className="rounded-xl p-6 border mb-6 flex items-center gap-5" style={card}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #4F46E5, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', fontWeight: '800', color: 'white', flexShrink: 0
        }}>
          {initials}
        </div>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: titleColor }}>{client.name}</h2>
          <p className="text-sm mt-1" style={{ color: subColor }}>{client.email} • {client.phone}</p>
          {client.company && <p className="text-sm mt-1 font-medium" style={{ color: '#2383E2' }}>{client.company}</p>}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Proposals', value: clientProposals.length, color: '#9065B0' },
          { label: 'Won Proposals', value: wonProposals, color: '#0F9B6E' },
          { label: 'Win Rate', value: `${winRate}%`, color: '#D9730D' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl p-5 border" style={card}>
            <p className="text-sm font-medium mb-1" style={{ color: titleColor }}>{stat.label}</p>
            <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Card */}
      <div className="rounded-xl p-5 border mb-6" style={card}>
        <p className="text-sm font-medium mb-1" style={{ color: titleColor }}>Total Revenue from Client</p>
        <p className="text-3xl font-bold" style={{ color: '#0F9B6E' }}>{currency} {totalRevenue.toLocaleString()}</p>
      </div>

      {/* Proposals List */}
      <div className="rounded-xl p-5 border" style={card}>
        <h3 className="font-semibold mb-4" style={{ color: titleColor }}>Proposals for {client.name}</h3>
        {clientProposals.length === 0 ? (
          <p className="text-sm" style={{ color: subColor }}>No proposals for this client yet</p>
        ) : (
          <div className="flex flex-col gap-3">
            {clientProposals.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: isDark ? '#2a2a2a' : '#E9E9E7' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: titleColor }}>{p.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: subColor }}>{currency} {Number(p.amount).toLocaleString()} • Deadline: {p.deadline}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: STATUS_COLORS[p.status].bg, color: STATUS_COLORS[p.status].color }}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Notes Section */}
      <div className="rounded-xl p-5 border mt-4" style={card}>
        <h3 className="font-semibold mb-3" style={{ color: titleColor }}>📝 Client Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this client — meeting notes, preferences, important details..."
          rows={5}
          style={{
            width: '100%', padding: '12px', borderRadius: '8px',
            border: `1.5px solid ${isDark ? '#2a2a2a' : '#E9E9E7'}`,
            backgroundColor: isDark ? '#111111' : '#F7F6F3',
            color: titleColor, fontSize: '14px', outline: 'none',
            fontFamily: 'inherit', resize: 'vertical', lineHeight: '1.6'
          }}
        />
        <button
          onClick={handleSaveNotes}
          className="mt-3 px-5 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: notesSaved ? '#D1FAE5' : '#37352F', color: notesSaved ? '#065F46' : '#FFFFFF' }}
        >
          {notesSaved ? '✓ Notes Saved!' : 'Save Notes'}
        </button>
      </div>
    </div>
  )
}