import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import FancyButton from '../components/FancyButton'
import EmptyState from '../components/EmptyState'
import { exportClientsCSV } from '../utils/exportCSV'

export default function Clients() {
  const { clients, addClient, deleteClient, updateClient } = useApp()
  const { showToast } = useToast()
  const { isDark, accent } = useTheme()
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' })
  const [errors, setErrors] = useState({})
  const [search, setSearch] = useState('')

  const card = { backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF', borderColor: isDark ? '#2a2a2a' : '#E9E9E7' }
  const titleColor = isDark ? '#ffffff' : '#37352F'
  const subColor = isDark ? '#94a3b8' : '#9B9A97'
  const inputStyle = { backgroundColor: isDark ? '#111111' : '#F7F6F3', borderColor: isDark ? '#2a2a2a' : '#E9E9E7', color: titleColor }

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
    <div style={{ position: 'relative' }}>

      {/* Doodle Background */}
      <svg style={{
        position: 'fixed', top: 0, right: 0,
        width: '75%', height: '100%',
        pointerEvents: 'none', zIndex: 0, opacity: 0.4
      }} viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
        <text x="720" y="80" fontSize="18" fill={accent} opacity="0.3">✦</text>
        <text x="600" y="40" fontSize="12" fill={accent} opacity="0.2">✦</text>
        <text x="750" y="300" fontSize="20" fill={accent} opacity="0.2">✦</text>
        <text x="500" y="500" fontSize="14" fill={accent} opacity="0.2">✦</text>
        <path d="M 650 100 Q 680 80 710 100 Q 740 120 770 100" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.2"/>
        <path d="M 700 400 Q 730 380 760 400 Q 790 420 820 400" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.15"/>
        <circle cx="720" cy="200" r="30" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.15"/>
        <circle cx="580" cy="450" r="20" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.15"/>
        <text x="600" y="150" fontSize="18" fill={accent} opacity="0.15">+</text>
        <text x="700" y="350" fontSize="16" fill={accent} opacity="0.15">+</text>
        <rect x="620" y="480" width="16" height="16" rx="3" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.15" transform="rotate(15 628 488)"/>
        <circle cx="630" cy="100" r="4" fill={accent} opacity="0.2"/>
        <circle cx="655" cy="100" r="4" fill={accent} opacity="0.2"/>
        <circle cx="680" cy="100" r="4" fill={accent} opacity="0.2"/>
      </svg>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold" style={{ color: titleColor }}>Clients</h2>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => { exportClientsCSV(clients); showToast('Clients exported!', 'success') }}
              className="px-3 py-2 rounded-lg text-sm font-medium border"
              style={{ backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF', borderColor: isDark ? '#2a2a2a' : '#E9E9E7', color: titleColor }}
            >
              📥 Export CSV
            </button>
            <FancyButton onClick={() => setShowForm(true)}>+ Add Client</FancyButton>
          </div>
        </div>

        {/* Search */}
        <input
          type="text" placeholder="🔍 Search clients..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none mb-6"
          style={{ backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF', borderColor: isDark ? '#2a2a2a' : '#E9E9E7', color: titleColor }}
        />

        {/* Form */}
        {showForm && (
          <div className="rounded-xl p-6 mb-6 border" style={card}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: titleColor }}>{editId ? 'Edit Client' : 'New Client'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'name', placeholder: 'Full Name' },
                { key: 'email', placeholder: 'Email Address' },
                { key: 'phone', placeholder: 'Phone Number' },
                { key: 'company', placeholder: 'Company (optional)' },
              ].map(({ key, placeholder }) => (
                <div key={key}>
                  <input
                    type="text" placeholder={placeholder} value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none"
                    style={inputStyle}
                  />
                  {errors[key] && <p className="text-xs mt-1" style={{ color: '#E03E3E' }}>{errors[key]}</p>}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleSubmit} className="px-5 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: '#37352F', color: '#FFFFFF' }}>{editId ? 'Update' : 'Save'}</button>
              <button onClick={handleCancel} className="px-5 py-2 rounded-lg text-sm font-medium border" style={{ backgroundColor: 'transparent', borderColor: isDark ? '#2a2a2a' : '#E9E9E7', color: subColor }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Clients List */}
        {filteredClients.length === 0 ? (
          <EmptyState
            icon="👤"
            title={search ? 'No clients found' : 'No clients yet'}
            description={search ? 'Try a different search term or clear the search.' : 'Add your first client to get started tracking proposals.'}
            actionLabel={search ? null : '+ Add Client'}
            onAction={search ? null : () => setShowForm(true)}
            isDark={isDark}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredClients.map((client) => (
              <div key={client.id} className="rounded-xl p-5 border flex items-center justify-between" style={card}>
                <div>
                  <h4
                    className="font-semibold text-lg cursor-pointer hover:underline"
                    style={{ color: accent }}
                    onClick={() => navigate(`/dashboard/clients/${client.id}`)}
                  >
                    {client.name}
                  </h4>
                  <p className="text-sm mt-0.5" style={{ color: subColor }}>{client.email} • {client.phone}</p>
                  {client.company && <p className="text-sm mt-1 font-medium" style={{ color: '#2383E2' }}>{client.company}</p>}
                  {/* Star Rating */}
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={(e) => {
                          e.stopPropagation()
                          updateClient(client.id, { rating: star })
                          showToast(`Rated ${star} star${star > 1 ? 's' : ''}!`, 'success')
                        }}
                        style={{
                          fontSize: '16px', cursor: 'pointer',
                          color: star <= (client.rating || 0) ? '#F59E0B' : (isDark ? '#3a3a3a' : '#E9E9E7'),
                          transition: 'color 0.15s'
                        }}
                      >★</span>
                    ))}
                    {client.rating && (
                      <span style={{ fontSize: '11px', color: subColor, marginLeft: '4px', alignSelf: 'center' }}>
                        {client.rating}/5
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(client)} className="px-3 py-1 rounded-lg text-sm border" style={{ backgroundColor: isDark ? '#111111' : '#F7F6F3', borderColor: isDark ? '#2a2a2a' : '#E9E9E7', color: titleColor }}>Edit</button>
                  <button onClick={() => { deleteClient(client.id); showToast('Client deleted!', 'error') }} className="delete-btn px-3 py-1 rounded-lg text-sm" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}