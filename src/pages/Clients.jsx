import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function Clients() {
  const { clients, addClient, deleteClient, updateClient } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email is invalid'
    if (!form.phone.trim()) newErrors.phone = 'Phone is required'
    return newErrors
  }

  const handleSubmit = () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    if (editId) {
      updateClient(editId, form)
      setEditId(null)
    } else {
      addClient(form)
    }
    setForm({ name: '', email: '', phone: '', company: '' })
    setErrors({})
    setShowForm(false)
  }

  const handleEdit = (client) => {
    setForm({ name: client.name, email: client.email, phone: client.phone, company: client.company })
    setEditId(client.id)
    setShowForm(true)
  }

  const handleCancel = () => {
    setForm({ name: '', email: '', phone: '', company: '' })
    setErrors({})
    setEditId(null)
    setShowForm(false)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cyan-400">Clients</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Add Client
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editId ? 'Edit Client' : 'New Client'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'name', placeholder: 'Full Name' },
              { key: 'email', placeholder: 'Email Address' },
              { key: 'phone', placeholder: 'Phone Number' },
              { key: 'company', placeholder: 'Company (optional)' },
            ].map(({ key, placeholder }) => (
              <div key={key}>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-cyan-500"
                />
                {errors[key] && (
                  <p className="text-red-400 text-xs mt-1">{errors[key]}</p>
                )}
              </div>
            ))}
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

      {/* Clients List */}
      {clients.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-3">👤</p>
          <p className="text-lg font-medium">No clients yet</p>
          <p className="text-sm">Click "Add Client" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {clients.map((client) => (
            <div key={client.id} className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex items-center justify-between">
              <div>
                <h4 className="text-white font-semibold text-lg">{client.name}</h4>
                <p className="text-gray-400 text-sm">{client.email} • {client.phone}</p>
                {client.company && <p className="text-cyan-400 text-sm mt-1">{client.company}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(client)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteClient(client.id)}
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