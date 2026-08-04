import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { useTheme } from '../context/ThemeContext'
import FancyButton from '../components/FancyButton'
import { exportProposalPDF } from '../utils/exportPDF'
import { exportProposalsCSV } from '../utils/exportCSV'
import EmptyState from '../components/EmptyState'
import { formatDate } from '../utils/formatDate'

const STATUS_OPTIONS = ['Draft', 'Sent', 'In Review', 'Won', 'Lost']

const STATUS_COLORS = {
  Draft: { bg: '#F1F0EE', color: '#6B6B6B' },
  Sent: { bg: '#DBEAFE', color: '#1D4ED8' },
  'In Review': { bg: '#FEF3C7', color: '#D97706' },
  Won: { bg: '#D1FAE5', color: '#065F46' },
  Lost: { bg: '#FEE2E2', color: '#991B1B' },
}

export default function Proposals() {
  const { proposals, addProposal, deleteProposal, updateProposal, clients, currency } = useApp()
  const { showToast } = useToast()
  const { isDark } = useTheme()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('All')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ title: '', clientId: '', amount: '', deadline: '', status: 'Draft', notes: '' })
  const [errors, setErrors] = useState({})

  const card = { backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF', borderColor: isDark ? '#2a2a2a' : '#E9E9E7' }
  const titleColor = isDark ? '#ffffff' : '#37352F'
  const subColor = isDark ? '#94a3b8' : '#9B9A97'
  const inputStyle = { backgroundColor: isDark ? '#111111' : '#F7F6F3', borderColor: isDark ? '#2a2a2a' : '#E9E9E7', color: titleColor }

  const validate = () => {
    const newErrors = {}
    if (!form.title.trim()) newErrors.title = 'Title is required'
    if (!form.clientId) newErrors.clientId = 'Please select a client'
    if (!form.amount) newErrors.amount = 'Amount is required'
    if (!form.deadline) newErrors.deadline = 'Deadline is required'
    return newErrors
  }

  const handleSubmit = () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    if (editId) {
      updateProposal(editId, form)
      setEditId(null)
      showToast('Proposal updated successfully!', 'success')
    } else {
      addProposal(form)
      showToast('Proposal added successfully!', 'success')
    }
    setForm({ title: '', clientId: '', amount: '', deadline: '', status: 'Draft', notes: '' })
    setErrors({})
    setShowForm(false)
  }

  const handleEdit = (proposal) => {
    setForm({ title: proposal.title, clientId: proposal.clientId, amount: proposal.amount, deadline: proposal.deadline, status: proposal.status, notes: proposal.notes || '' })
    setEditId(proposal.id)
    setShowForm(true)
  }

  const handleCancel = () => {
    setForm({ title: '', clientId: '', amount: '', deadline: '', status: 'Draft', notes: '' })
    setErrors({})
    setEditId(null)
    setShowForm(false)
  }

  const getClientName = (id) => {
    const client = clients.find((c) => c.id === Number(id))
    return client ? client.name : 'Unknown Client'
  }

  const isExpiringSoon = (deadline, status) => {
    if (status === 'Won' || status === 'Lost') return false
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24))
    return diffDays <= 3 && diffDays >= 0
  }

  const isExpired = (deadline, status) => {
    if (status === 'Won' || status === 'Lost') return false
    return new Date(deadline) < new Date()
  }

  const filtered = proposals
    .filter((p) => filterStatus === 'All' || p.status === filterStatus)
    .filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      getClientName(p.clientId).toLowerCase().includes(search.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(search.toLowerCase()))
    )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold" style={{ color: titleColor }}>Proposals</h2>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => { exportProposalsCSV(proposals, clients); showToast('Proposals exported!', 'success') }}
            className="px-3 py-2 rounded-lg text-sm font-medium border"
            style={{ backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF', borderColor: isDark ? '#2a2a2a' : '#E9E9E7', color: titleColor }}
          >
            📥 Export CSV
          </button>
          <FancyButton onClick={() => setShowForm(true)}>+ New Proposal</FancyButton>
        </div>
      </div>

      <input type="text" placeholder="🔍 Search proposals..." value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none mb-4"
        style={{ backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF', borderColor: isDark ? '#2a2a2a' : '#E9E9E7', color: titleColor }}
      />

      <div className="flex gap-2 mb-6 flex-wrap">
        {['All', ...STATUS_OPTIONS].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className="px-3 py-1 rounded-full text-sm font-medium border transition-colors"
            style={filterStatus === s
              ? { backgroundColor: '#37352F', color: '#FFFFFF', borderColor: '#37352F' }
              : { backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF', color: subColor, borderColor: isDark ? '#2a2a2a' : '#E9E9E7' }
            }>
            {s}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="rounded-xl p-6 mb-6 border" style={card}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: titleColor }}>{editId ? 'Edit Proposal' : 'New Proposal'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input type="text" placeholder="Proposal Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none" style={inputStyle} />
              {errors.title && <p className="text-xs mt-1" style={{ color: '#E03E3E' }}>{errors.title}</p>}
            </div>
            <div>
              <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none" style={inputStyle}>
                <option value="">Select Client</option>
                {clients.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
              {errors.clientId && <p className="text-xs mt-1" style={{ color: '#E03E3E' }}>{errors.clientId}</p>}
            </div>
            <div>
              <input type="number" placeholder="Amount (PKR)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none" style={inputStyle} />
              {errors.amount && <p className="text-xs mt-1" style={{ color: '#E03E3E' }}>{errors.amount}</p>}
            </div>
            <div>
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none" style={inputStyle} />
              {errors.deadline && <p className="text-xs mt-1" style={{ color: '#E03E3E' }}>{errors.deadline}</p>}
            </div>
            <div>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none" style={inputStyle}>
                {STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div>
              <input type="text" placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none" style={inputStyle} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSubmit} className="px-5 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: '#37352F', color: '#FFFFFF' }}>{editId ? 'Update' : 'Save'}</button>
            <button onClick={handleCancel} className="px-5 py-2 rounded-lg text-sm font-medium border" style={{ backgroundColor: 'transparent', borderColor: isDark ? '#2a2a2a' : '#E9E9E7', color: subColor }}>Cancel</button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon="📄"
          title={search ? 'No proposals found' : 'No proposals yet'}
          description={search ? 'Try a different search term or clear the search.' : 'Create your first proposal to start tracking deals.'}
          actionLabel={search ? null : '+ New Proposal'}
          onAction={search ? null : () => setShowForm(true)}
          isDark={isDark}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((proposal) => (
            <div key={proposal.id} className="rounded-xl p-5 border flex items-center justify-between" style={card}>
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h4 className="font-semibold" style={{ color: titleColor }}>{proposal.title}</h4>
                  <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: STATUS_COLORS[proposal.status].bg, color: STATUS_COLORS[proposal.status].color }}>{proposal.status}</span>
                  {isExpiringSoon(proposal.deadline, proposal.status) && (
                    <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>⚠ Expiring Soon</span>
                  )}
                  {isExpired(proposal.deadline, proposal.status) && (
                    <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>⚠ Deadline Passed</span>
                  )}
                </div>
                <p className="text-sm" style={{ color: subColor }}>{getClientName(proposal.clientId)} • {currency} {Number(proposal.amount).toLocaleString()}</p>
                <p className="text-xs mt-1" style={{ color: subColor }}>Deadline: {formatDate(proposal.deadline)}</p>
                {proposal.notes && <p className="text-xs mt-1" style={{ color: subColor }}>{proposal.notes}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { exportProposalPDF(proposal, getClientName(proposal.clientId)); showToast('PDF exported', 'success') }}
                  className="px-3 py-1 rounded-lg text-sm border"
                  style={{ backgroundColor: '#D1FAE5', borderColor: '#6EE7B7', color: '#065F46' }}
                >
                  📄 PDF
                </button>
                <button onClick={() => handleEdit(proposal)} className="px-3 py-1 rounded-lg text-sm border" style={{ backgroundColor: isDark ? '#111111' : '#F7F6F3', borderColor: isDark ? '#2a2a2a' : '#E9E9E7', color: titleColor }}>Edit</button>
                <button onClick={() => { deleteProposal(proposal.id); showToast('Proposal deleted!', 'error') }} className="delete-btn px-3 py-1 rounded-lg text-sm" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}