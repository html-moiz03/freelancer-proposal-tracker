import { useState } from 'react'
import { useApp } from '../context/AppContext'

const STATUS_OPTIONS = ['Draft', 'Sent', 'In Review', 'Won', 'Lost']

const STATUS_COLORS = {
  Draft: 'bg-gray-600 text-gray-100',
  Sent: 'bg-blue-600 text-blue-100',
  'In Review': 'bg-yellow-600 text-yellow-100',
  Won: 'bg-green-600 text-green-100',
  Lost: 'bg-red-600 text-red-100',
}

export default function Proposals() {
  const { proposals, addProposal, deleteProposal, updateProposal, clients } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('All')
  const [form, setForm] = useState({
    title: '', clientId: '', amount: '', deadline: '', status: 'Draft', notes: ''
  })
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

  const filtered = filterStatus === 'All'
    ? proposals
    : proposals.filter((p) => p.status === filterStatus)

  const getClientName = (id) => {
    const client = clients.find((c) => c.id === Number(id))
    return client ? client.name : 'Unknown Client'
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cyan-400">Proposals</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + New Proposal
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['All', ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filterStatus === s
                ? 'bg-cyan-500 text-gray-900'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editId ? 'Edit Proposal' : 'New Proposal'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Proposal Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-cyan-500"
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            </div>
            <div>
              <select
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-cyan-500"
              >
                <option value="">Select Client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.clientId && <p className="text-red-400 text-xs mt-1">{errors.clientId}</p>}
            </div>
            <div>
              <input
                type="number"
                placeholder="Amount (PKR)"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-cyan-500"
              />
              {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
            </div>
            <div>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-cyan-500"
              />
              {errors.deadline && <p className="text-red-400 text-xs mt-1">{errors.deadline}</p>}
            </div>
            <div>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-cyan-500"
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
                className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              {editId ? 'Update' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Proposals List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-3">📄</p>
          <p className="text-lg font-medium">No proposals found</p>
          <p className="text-sm">Click "+ New Proposal" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((proposal) => (
            <div key={proposal.id} className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="text-white font-semibold text-lg">{proposal.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[proposal.status]}`}>
                    {proposal.status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{getClientName(proposal.clientId)} • PKR {Number(proposal.amount).toLocaleString()}</p>
                <p className="text-gray-500 text-xs mt-1">Deadline: {proposal.deadline}</p>
                {proposal.notes && <p className="text-gray-400 text-xs mt-1">{proposal.notes}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(proposal)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProposal(proposal.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
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