import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import FancyButton from '../components/FancyButton'
import EmptyState from '../components/EmptyState'
import { exportClientsCSV } from '../utils/exportCSV'

const ACTIVE_WINDOW_DAYS = 30

function timeAgo(ts, now) {
  if (!ts) return '—'
  const diff = now - ts
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(ts).toLocaleDateString()
}

export default function Clients() {
  const { clients, proposals, currency, addClient, deleteClient, updateClient } = useApp()
  const { showToast } = useToast()
  const { isDark, accent } = useTheme()
  const navigate = useNavigate()

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' })
  const [errors, setErrors] = useState({})
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('All')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [openMenuId, setOpenMenuId] = useState(null)

  const cardBg = isDark ? '#111118' : '#ffffff'
  const border = isDark ? '#1e1e2e' : '#f0f0f0'
  const titleColor = isDark ? '#ffffff' : '#111827'
  const subColor = isDark ? '#64748b' : '#6b7280'
  const inputBg = isDark ? '#1e1e2e' : '#f9fafb'

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
    setForm({ name: client.name, email: client.email, phone: client.phone, company: client.company || '' })
    setEditId(client.id)
    setShowForm(true)
    setOpenMenuId(null)
  }

  const handleCancel = () => {
    setForm({ name: '', email: '', phone: '', company: '' })
    setErrors({})
    setEditId(null)
    setShowForm(false)
  }

  const handleDelete = (client) => {
    deleteClient(client.id)
    showToast('Client deleted!', 'error')
    setOpenMenuId(null)
  }

  // Attach computed stats (proposals count, revenue, last activity, active status) to each client
  // Lazy useState initializer runs once on mount, so it never calls Date.now() during render itself
  const [now] = useState(() => Date.now())
  const clientsWithStats = useMemo(() => clients.map((c) => {
    const cp = proposals.filter((p) => Number(p.clientId) === c.id)
    const revenue = cp.filter((p) => p.status === 'Won').reduce((sum, p) => sum + Number(p.amount), 0)
    const lastActivityTs = cp.length > 0 ? Math.max(...cp.map((p) => p.id)) : null
    const isActive = lastActivityTs ? (now - lastActivityTs) <= ACTIVE_WINDOW_DAYS * 86400000 : false
    return { ...c, proposalsCount: cp.length, revenue, lastActivityTs, isActive }
  }), [clients, proposals, now])

  const activeCount = clientsWithStats.filter((c) => c.isActive).length
  const inactiveCount = clientsWithStats.length - activeCount

  const filteredClients = clientsWithStats.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
    const matchesTab = tab === 'All' || (tab === 'Active' && c.isActive) || (tab === 'Inactive' && !c.isActive)
    return matchesSearch && matchesTab
  })

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const paginatedClients = filteredClients.slice(pageStart, pageStart + pageSize)

  const tabs = [
    { key: 'All', label: 'All', count: clientsWithStats.length },
    { key: 'Active', label: 'Active', count: activeCount },
    { key: 'Inactive', label: 'Inactive', count: inactiveCount },
  ]

  return (
    <div style={{ maxWidth: '1400px', position: 'relative' }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: titleColor, margin: 0 }}>Clients</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: subColor }}>🔍</span>
            <input
              type="text" placeholder="Search clients..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              style={{
                padding: '9px 14px 9px 32px', borderRadius: '8px', border: `1px solid ${border}`,
                backgroundColor: cardBg, color: titleColor, fontSize: '13px', outline: 'none',
                fontFamily: 'inherit', width: '220px'
              }}
            />
          </div>
          <button
            onClick={() => { exportClientsCSV(clients); showToast('Clients exported!', 'success') }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 14px', borderRadius: '8px', border: `1px solid ${border}`,
              backgroundColor: cardBg, color: titleColor, fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', fontFamily: 'inherit'
            }}
          >
            ⬆ Export CSV
          </button>
          <FancyButton onClick={() => setShowForm(true)}>+ Add Client</FancyButton>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '18px' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setPage(1) }}
            style={{
              padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: '600', fontFamily: 'inherit',
              backgroundColor: tab === t.key ? (isDark ? accent + '22' : accent + '14') : 'transparent',
              color: tab === t.key ? accent : subColor,
            }}
          >
            {t.label} {t.count}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: titleColor, marginBottom: '14px' }}>{editId ? 'Edit Client' : 'New Client'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
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
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: '8px',
                    border: `1px solid ${border}`, backgroundColor: inputBg,
                    color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit'
                  }}
                />
                {errors[key] && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors[key]}</p>}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button onClick={handleSubmit} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: accent, color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>{editId ? 'Update' : 'Save'}</button>
            <button onClick={handleCancel} style={{ padding: '9px 20px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: 'transparent', color: subColor, fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      {filteredClients.length === 0 ? (
        <EmptyState
          icon="👤"
          title={search ? 'No clients found' : 'No clients yet'}
          description={search ? 'Try a different search term or clear the search.' : 'Add your first client to get started tracking proposals.'}
          actionLabel={search ? null : '+ Add Client'}
          onAction={search ? null : () => setShowForm(true)}
          isDark={isDark}
          accent={accent}
        />
      ) : (
        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {['Client', 'Company', 'Proposals', 'Revenue (' + currency + ')', 'Rating', 'Last Activity', 'Actions'].map((h) => (
                    <th key={h} style={{ textAlign: h === 'Actions' ? 'right' : 'left', padding: '12px 20px', fontSize: '11px', fontWeight: '700', color: subColor, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedClients.map((client) => {
                  const initials = client.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                  return (
                    <tr key={client.id} style={{ borderBottom: `1px solid ${border}` }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                          onClick={() => navigate(`/dashboard/clients/${client.id}`)}
                        >
                          <div style={{
                            width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                            background: `linear-gradient(135deg, ${accent}, #7c3aed)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: '700', color: 'white'
                          }}>{initials}</div>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: titleColor }}>{client.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {client.company
                          ? <span style={{ fontSize: '13px', fontWeight: '500', color: accent }}>{client.company}</span>
                          : <span style={{ fontSize: '13px', color: subColor }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: titleColor }}>{client.proposalsCount}</td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '600', color: titleColor }}>{client.revenue.toLocaleString()}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              onClick={(e) => {
                                e.stopPropagation()
                                updateClient(client.id, { rating: star })
                                showToast(`Rated ${star} star${star > 1 ? 's' : ''}!`, 'success')
                              }}
                              style={{
                                fontSize: '13px', cursor: 'pointer',
                                color: star <= (client.rating || 0) ? '#F59E0B' : (isDark ? '#2a2a3e' : '#E5E7EB'),
                              }}
                            >★</span>
                          ))}
                          {client.rating ? <span style={{ fontSize: '11px', color: subColor, marginLeft: '4px' }}>{client.rating}/5</span> : null}
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '12px', color: subColor }}>{timeAgo(client.lastActivityTs, now)}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'right', position: 'relative' }}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === client.id ? null : client.id)}
                          style={{
                            width: '30px', height: '30px', borderRadius: '8px', border: `1px solid ${border}`,
                            backgroundColor: 'transparent', color: titleColor, cursor: 'pointer', fontSize: '14px'
                          }}
                        >⋯</button>
                        {openMenuId === client.id && (
                          <>
                            <div onClick={() => setOpenMenuId(null)} style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
                            <div style={{
                              position: 'absolute', top: '36px', right: '20px', zIndex: 99, width: '160px',
                              backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '10px',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden', textAlign: 'left'
                            }}>
                              <button onClick={() => { navigate(`/dashboard/clients/${client.id}`); setOpenMenuId(null) }} style={{ display: 'block', width: '100%', padding: '10px 14px', border: 'none', background: 'none', textAlign: 'left', fontSize: '12px', color: titleColor, cursor: 'pointer', fontFamily: 'inherit' }}>View Details</button>
                              <button onClick={() => handleEdit(client)} style={{ display: 'block', width: '100%', padding: '10px 14px', border: 'none', background: 'none', textAlign: 'left', fontSize: '12px', color: titleColor, cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
                              <button onClick={() => handleDelete(client)} style={{ display: 'block', width: '100%', padding: '10px 14px', border: 'none', background: 'none', textAlign: 'left', fontSize: '12px', color: '#EF4444', cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: `1px solid ${border}`, flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: subColor }}>Show</span>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }} style={{
                padding: '5px 8px', borderRadius: '6px', border: `1px solid ${border}`,
                backgroundColor: cardBg, color: titleColor, fontSize: '12px', outline: 'none', fontFamily: 'inherit'
              }}>
                {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: subColor }}>
                {filteredClients.length === 0 ? '0 of 0' : `${pageStart + 1}-${Math.min(pageStart + pageSize, filteredClients.length)} of ${filteredClients.length}`}
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} style={{
                  width: '26px', height: '26px', borderRadius: '6px', border: `1px solid ${border}`,
                  backgroundColor: 'transparent', color: currentPage === 1 ? subColor : titleColor,
                  cursor: currentPage === 1 ? 'default' : 'pointer', fontSize: '12px', opacity: currentPage === 1 ? 0.5 : 1
                }}>‹</button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{
                  width: '26px', height: '26px', borderRadius: '6px', border: `1px solid ${border}`,
                  backgroundColor: 'transparent', color: currentPage === totalPages ? subColor : titleColor,
                  cursor: currentPage === totalPages ? 'default' : 'pointer', fontSize: '12px', opacity: currentPage === totalPages ? 0.5 : 1
                }}>›</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
