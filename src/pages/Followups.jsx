import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'

export default function Followups() {
  const { followups, addFollowup, deleteFollowup, proposals } = useApp()
  const { showToast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ proposalId: '', date: '', notes: '' })
  const [errors, setErrors] = useState({})

  const today = new Date().toISOString().split('T')[0]

  const validate = () => {
    const newErrors = {}
    if (!form.proposalId) newErrors.proposalId = 'Please select a proposal'
    if (!form.date) newErrors.date = 'Follow-up date is required'
    return newErrors
  }

  const handleSubmit = () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    addFollowup(form)
    showToast('Follow-up added successfully!', 'success')
    setForm({ proposalId: '', date: '', notes: '' })
    setErrors({})
    setShowForm(false)
  }

  const handleCancel = () => {
    setForm({ proposalId: '', date: '', notes: '' })
    setErrors({})
    setShowForm(false)
  }

  const getProposalTitle = (id) => {
    const proposal = proposals.find((p) => p.id === Number(id))
    return proposal ? proposal.title : 'Unknown Proposal'
  }

  const isOverdue = (date) => date < today

  const inputStyle = { backgroundColor: '#F7F6F3', borderColor: '#E9E9E7', color: '#37352F' }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: '#37352F' }}>Follow-ups</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: '#37352F', color: '#FFFFFF' }}
        >
          + Add Follow-up
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl p-6 mb-6 border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E9E9E7' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#37352F' }}>New Follow-up</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <select
                value={form.proposalId}
                onChange={(e) => setForm({ ...form, proposalId: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none"
                style={inputStyle}
              >
                <option value="">Select Proposal</option>
                {proposals.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              {errors.proposalId && <p className="text-xs mt-1" style={{ color: '#E03E3E' }}>{errors.proposalId}</p>}
            </div>
            <div>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none"
                style={inputStyle}
              />
              {errors.date && <p className="text-xs mt-1" style={{ color: '#E03E3E' }}>{errors.date}</p>}
            </div>
            <div className="col-span-2">
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
              Save
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

      {/* Follow-ups List */}
      {followups.length === 0 ? (
        <div className="text-center py-20" style={{ color: '#9B9A97' }}>
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-lg font-medium">No follow-ups yet</p>
          <p className="text-sm">Click "+ Add Follow-up" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {followups.map((followup) => (
            <div
              key={followup.id}
              className="rounded-xl p-5 border flex items-center justify-between"
              style={isOverdue(followup.date)
                ? { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }
                : { backgroundColor: '#FFFFFF', borderColor: '#E9E9E7' }
              }
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-semibold" style={{ color: '#37352F' }}>
                    {getProposalTitle(followup.proposalId)}
                  </h4>
                  {isOverdue(followup.date) && (
                    <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                      Overdue
                    </span>
                  )}
                </div>
                <p className="text-sm" style={{ color: '#37352F' }}>Follow-up Date: {followup.date}</p>
                {followup.notes && <p className="text-xs mt-1" style={{ color: '#37352F' }}>{followup.notes}</p>}
              </div>
              <button
                onClick={() => { deleteFollowup(followup.id); showToast('Follow-up deleted!', 'error') }}
                className="px-3 py-1 rounded-lg text-sm transition-colors hover:opacity-80"
                style={{ backgroundColor: '#FEE2E2', color: '#080808' }}
                onMouseEnter={e => e.target.style.backgroundColor = '#f01111'}
                onMouseLeave={e => e.target.style.backgroundColor = '#c88686'}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}