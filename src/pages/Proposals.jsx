import { useState } from 'react'
import { useApp } from '../context/AppContext'

const STATUS_OPTIONS = ['Draft', 'Sent', 'In Review', 'Won', 'Lost']

const STATUS_COLORS = {
  Draft: { bg: '#F1F0EE', color: '#6B6B6B' },
  Sent: { bg: '#DBEAFE', color: '#1D4ED8' },
  'In Review': { bg: '#FEF3C7', color: '#D97706' },
  Won: { bg: '#D1FAE5', color: '#065F46' },
  Lost: { bg: '#FEE2E2', color: '#991B1B' },
}

export default function Proposals() {
  const { proposals, addProposal, deleteProposal, updateProposal, clients } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('All')
  const [form, setForm] = useState({ title: '', clientId: '', amount: '', deadline: '', status: 'Draft', notes: '' })
  const [errors, setErrors] = useState({})

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
    } else {
      addProposal(form)
    }
    setForm({ title: '', clientId: '', amount: '', deadline: '', status: 'Draft', notes: '' })
    setErrors({})
    setShowForm(false)
  }

  const handleEdit = (proposal) => {
    setForm({
      title: proposal.title, clientId: proposal.clientId,
      amount: proposal.amount, deadline: proposal.deadline,
      status: proposal.status, notes: proposal.notes || ''
    })
    setEditId(proposal.id)
    setShowForm(true)
  }

  const handleCancel = () => {
    setForm({ title: '', clientId: '', amount: '', deadline: '', status: 'Draft', notes: '' })
    setErrors({})
    setEditId(null)
    setShowForm(false)
  }

  const filtered = filterStatus === 'All' ? proposals : proposals.filter((p) => p.status === filterStatus)

  const getClientName = (id) => {
    const client = clients.find((c) => c.id === Number(id))
    return client ? client.name : 'Unknown Client'
  }

  const inputStyle = { backgroundColor: '#F7F6F3', borderColor: '#E9E9E7', color: '#37352F' }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: '#37352F' }}>Proposals</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: '#37352F', color: '#FFFFFF' }}
        >
          + New Proposal
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['All', ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className="px-3 py-1 rounded-full text-sm font-medium border transition-colors"
            style={filterStatus === s
              ? { backgroundColor: '#37352F', color: '#FFFFFF', borderColor: '#37352F' }
              : { backgroundColor: '#FFFFFF', color: '#6B6B6B', borderColor: '#E9E9E7' }
            }
          >
            {s}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl p-6 mb-6 border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E9E9E7' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#37352F' }}>
            {editId ? 'Edit Proposal' : 'New Proposal'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Proposal Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none"
                style={inputStyle}
              />
              {errors.title && <p className="text-xs mt-1" style={{ color: '#E03E3E' }}>{errors.title}</p>}
            </div>
            <div>
              <select
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none"
                style={inputStyle}
              >
                <option value="">Select Client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.clientId && <p className="text-xs mt-1" style={{ color: '#E03E3E' }}>{errors.clientId}</p>}
            </div>
            <div>
              <input
                type="number"
                placeholder="Amount (PKR)"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none"
                style={inputStyle}
              />
              {errors.amount && <p className="text-xs mt-1" style={{ color: '#E03E3E' }}>{errors.amount}</p>}
            </div>
            <div>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none"
                style={inputStyle}
              />
              {errors.deadline && <p className="text-xs mt-1" style={{ color: '#E03E3E' }}>{errors.deadline}</p>}
            </div>
            <div>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none"
                style={inputStyle}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <input
                type="text"
                placeholder="Notes (optional)"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              className="px-5 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: '#37352F', color: '#FFFFFF' }}
            >
              {editId ? 'Update' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="px-5 py-2 rounded-lg text-sm font-medium border"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E9E9E7', color: '#6B6B6B' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Proposals List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20" style={{ color: '#9B9A97' }}>
          <p className="text-4xl mb-3">📄</p>
          <p className="text-lg font-medium">No proposals found</p>
          <p className="text-sm">Click "+ New Proposal" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((proposal) => (
            <div key={proposal.id} className="rounded-xl p-5 border flex items-center justify-between" style={{ backgroundColor: '#FFFFFF', borderColor: '#E9E9E7' }}>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-semibold" style={{ color: '#37352F' }}>{proposal.title}</h4>
                  <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: STATUS_COLORS[proposal.status].bg, color: STATUS_COLORS[proposal.status].color }}>
                    {proposal.status}
                  </span>
                </div>
                <p className="text-sm" style={{ color: '#9B9A97' }}>{getClientName(proposal.clientId)} • PKR {Number(proposal.amount).toLocaleString()}</p>
                <p className="text-xs mt-1" style={{ color: '#9B9A97' }}>Deadline: {proposal.deadline}</p>
                {proposal.notes && <p className="text-xs mt-1" style={{ color: '#6B6B6B' }}>{proposal.notes}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(proposal)}
                  className="px-3 py-1 rounded-lg text-sm border"
                  style={{ backgroundColor: '#F7F6F3', borderColor: '#E9E9E7', color: '#37352F' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProposal(proposal.id)}
                  className="px-3 py-1 rounded-lg text-sm"
                  style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}