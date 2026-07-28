import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import FancyButton from '../components/FancyButton'

export default function Clients() {
  const { clients, addClient, deleteClient, updateClient } = useApp()
  const { showToast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' })
  const [errors, setErrors] = useState({})
  const [search, setSearch] = useState('')

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email is invalid'
    else if (clients.some((c) => c.email === form.email && c.id !== editId)) newErrors.email = 'A client with this email already exists'
    if (!form.phone.trim()) newErrors.phone = 'Phone is required'
    return newErrors
  }

  const handleSubmit = () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    if (editId) {
      updateClient(editId, form)
      setEditId(null)
      showToast('Client updated successfully!', 'success')
    } else {
      addClient(form)
      showToast('Client added successfully!', 'success')
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

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold" style={{ color: '#37352F' }}>Clients</h2>
        <FancyButton onClick={() => setShowForm(true)}>+ Add Client</FancyButton>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Search clients..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none mb-6"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E9E9E7', color: '#37352F' }}
      />

      {/* Form */}
      {showForm && (
        <div className="rounded-xl p-6 mb-6 border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E9E9E7' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#37352F' }}>
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
                  className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none"
                  style={{ backgroundColor: '#F7F6F3', borderColor: '#E9E9E7', color: '#37352F' }}
                />
                {errors[key] && <p className="text-xs mt-1" style={{ color: '#E03E3E' }}>{errors[key]}</p>}
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: '#37352F', color: '#FFFFFF' }}
            >
              {editId ? 'Update' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="px-5 py-2 rounded-lg text-sm font-medium border transition-colors"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E9E9E7', color: '#6B6B6B' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-20" style={{ color: '#9B9A97' }}>
          <p className="text-4xl mb-3">👤</p>
          <p className="text-lg font-medium">{search ? 'No clients found' : 'No clients yet'}</p>
          <p className="text-sm">{search ? 'Try a different search term' : 'Click "Add Client" to get started'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredClients.map((client) => (
            <div key={client.id} className="rounded-xl p-5 border flex items-center justify-between" style={{ backgroundColor: '#FFFFFF', borderColor: '#E9E9E7' }}>
              <div>
                <h4 className="font-semibold text-lg" style={{ color: '#37352F' }}>{client.name}</h4>
                <p className="text-sm mt-0.5" style={{ color: '#9B9A97' }}>{client.email} • {client.phone}</p>
                {client.company && <p className="text-sm mt-1 font-medium" style={{ color: '#2383E2' }}>{client.company}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(client)}
                  className="px-3 py-1 rounded-lg text-sm border"
                  style={{ backgroundColor: '#F7F6F3', borderColor: '#E9E9E7', color: '#37352F' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => { deleteClient(client.id); showToast('Client deleted!', 'error') }}
                  className="delete-btn px-3 py-1 rounded-lg text-sm"
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