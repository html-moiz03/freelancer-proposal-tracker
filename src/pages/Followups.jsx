import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function Followups() {
  const { followups, addFollowup, deleteFollowup, proposals } = useApp()
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cyan-400">Follow-ups</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Add Follow-up
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">New Follow-up</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <select
                value={form.proposalId}
                onChange={(e) => setForm({ ...form, proposalId: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-cyan-500"
              >
                <option value="">Select Proposal</option>
                {proposals.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              {errors.proposalId && <p className="text-red-400 text-xs mt-1">{errors.proposalId}</p>}
            </div>
            <div>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-cyan-500"
              />
              {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
            </div>
            <div className="col-span-2">
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
              Save
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

      {/* Follow-ups List */}
      {followups.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-lg font-medium">No follow-ups yet</p>
          <p className="text-sm">Click "+ Add Follow-up" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {followups.map((followup) => (
            <div
              key={followup.id}
              className={`rounded-xl p-5 border flex items-center justify-between ${
                isOverdue(followup.date)
                  ? 'bg-red-950 border-red-700'
                  : 'bg-gray-800 border-gray-700'
              }`}
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="text-white font-semibold">
                    {getProposalTitle(followup.proposalId)}
                  </h4>
                  {isOverdue(followup.date) && (
                    <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-medium">
                      Overdue
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">Follow-up Date: {followup.date}</p>
                {followup.notes && (
                  <p className="text-gray-400 text-xs mt-1">{followup.notes}</p>
                )}
              </div>
              <button
                onClick={() => deleteFollowup(followup.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
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