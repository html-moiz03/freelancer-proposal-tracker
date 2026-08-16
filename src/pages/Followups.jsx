import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { useTheme } from '../context/ThemeContext'
import FancyButton from '../components/FancyButton'
import EmptyState from '../components/EmptyState'
import { formatDate } from '../utils/formatDate'

// Top-level helpers keep impure Date access out of the component body itself
function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function exportFollowupsCSV(rows) {
  const headers = ['Client', 'Company', 'Proposal', 'Due Date', 'Status', 'Priority', 'Notes']
  const csvRows = rows.map((f) => [
    f.client?.name || 'Unknown', f.client?.company || '', f.proposal?.title || '',
    f.date, f.status, f.priority, f.notes || ''
  ])
  const csv = [headers, ...csvRows].map((row) => row.map((val) => `"${val}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'followups.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const PRIORITY_META = {
  High: { color: '#EF4444', label: 'High' },
  Medium: { color: '#F59E0B', label: 'Medium' },
  Low: { color: '#10B981', label: 'Low' },
}

const STATUS_META = {
  Overdue: { bg: '#FEE2E2', color: '#DC2626' },
  Today: { bg: '#FEF3C7', color: '#D97706' },
  Upcoming: { bg: '#DBEAFE', color: '#1D4ED8' },
  Completed: { bg: '#D1FAE5', color: '#065F46' },
}

export default function Followups() {
  const { followups, addFollowup, deleteFollowup, updateFollowup, proposals, clients, communications } = useApp()
  const { showToast } = useToast()
  const { isDark, accent } = useTheme()
  const navigate = useNavigate()

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ proposalId: '', date: '', notes: '' })
  const [errors, setErrors] = useState({})
  const [tab, setTab] = useState('Overdue')
  const [openMenuId, setOpenMenuId] = useState(null)

  const today = todayStr()

  const cardBg = isDark ? '#111118' : '#ffffff'
  const border = isDark ? '#1e1e2e' : '#f0f0f0'
  const titleColor = isDark ? '#ffffff' : '#111827'
  const subColor = isDark ? '#64748b' : '#6b7280'
  const inputBg = isDark ? '#1e1e2e' : '#f9fafb'

  const validate = () => {
    const newErrors = {}
    if (!form.proposalId) newErrors.proposalId = 'Please select a proposal'
    if (!form.date) newErrors.date = 'Follow-up date is required'
    return newErrors
  }

  const handleSubmit = () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    if (editId) {
      updateFollowup(editId, form)
      showToast('Follow-up updated successfully!', 'success')
    } else {
      addFollowup({ ...form, completed: false })
      showToast('Follow-up added successfully!', 'success')
    }
    setForm({ proposalId: '', date: '', notes: '' })
    setErrors({})
    setEditId(null)
    setShowForm(false)
  }

  const handleEdit = (followup) => {
    setForm({ proposalId: followup.proposalId, date: followup.date, notes: followup.notes || '' })
    setEditId(followup.id)
    setShowForm(true)
    setOpenMenuId(null)
  }

  const handleCancel = () => {
    setForm({ proposalId: '', date: '', notes: '' })
    setErrors({})
    setEditId(null)
    setShowForm(false)
  }

  const handleComplete = (followup) => {
    updateFollowup(followup.id, { completed: true })
    showToast('Follow-up marked as completed!', 'success')
    setOpenMenuId(null)
  }

  const handleReopen = (followup) => {
    updateFollowup(followup.id, { completed: false })
    setOpenMenuId(null)
  }

  const handleDelete = (followup) => {
    deleteFollowup(followup.id)
    showToast('Follow-up deleted!', 'error')
    setOpenMenuId(null)
  }

  const getProposal = (id) => proposals.find((p) => p.id === Number(id))
  const getClient = (proposal) => proposal ? clients.find((c) => c.id === Number(proposal.clientId)) : null

  const relativeDays = (dateStr) => {
    const diff = Math.round((new Date(dateStr) - new Date(today)) / 86400000)
    return diff
  }

  const dueLabel = (dateStr) => {
    const diff = relativeDays(dateStr)
    if (diff === 0) return 'Due today'
    if (diff === 1) return 'Tomorrow'
    if (diff === -1) return '1 day overdue'
    if (diff < -1) return `${Math.abs(diff)} days overdue`
    return `In ${diff} days`
  }

  const lastContactInfo = (client) => {
    if (!client) return { label: 'No contact logged', date: null }
    const clientComms = (communications || []).filter((c) => c.clientId === client.id).sort((a, b) => b.date.localeCompare(a.date))
    const lastDate = clientComms[0]?.date
    if (!lastDate) return { label: 'No contact logged', date: null }
    const diff = Math.round((new Date(today) - new Date(lastDate)) / 86400000)
    const label = diff <= 0 ? 'Today' : diff === 1 ? '1 day ago' : `${diff} days ago`
    return { label, date: lastDate }
  }

  const fmtDate = (dateStr) => formatDate(dateStr)

  // Enrich every followup with derived display data
  const enriched = followups.map((f) => {
    const proposal = getProposal(f.proposalId)
    const client = getClient(proposal)
    const diff = relativeDays(f.date)
    let status = 'Upcoming'
    if (f.completed) status = 'Completed'
    else if (diff < 0) status = 'Overdue'
    else if (diff === 0) status = 'Today'
    return { ...f, proposal, client, status, priority: proposal?.priority || 'Medium' }
  })

  const counts = {
    All: enriched.filter((f) => !f.completed).length,
    Overdue: enriched.filter((f) => f.status === 'Overdue').length,
    Today: enriched.filter((f) => f.status === 'Today').length,
    Upcoming: enriched.filter((f) => f.status === 'Upcoming').length,
    Completed: enriched.filter((f) => f.completed).length,
  }

  const tabs = ['All', 'Overdue', 'Today', 'Upcoming', 'Completed']

  const filtered = enriched
    .filter((f) => tab === 'All' ? !f.completed : f.status === tab)
    .sort((a, b) => a.date.localeCompare(b.date))

  const upcomingPreview = enriched
    .filter((f) => f.status === 'Upcoming')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4)

  const renderInitials = (name) => (name || '?').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const renderRow = (f, compact) => {
    const contact = lastContactInfo(f.client)
    const statusMeta = STATUS_META[f.status]
    const priorityMeta = PRIORITY_META[f.priority] || PRIORITY_META.Medium
    const isActionable = f.status === 'Overdue' || f.status === 'Today'
    return (
      <tr key={f.id} style={{ borderBottom: `1px solid ${border}` }}>
        <td style={{ padding: '14px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${accent}, #7c3aed)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: '700', color: 'white'
            }}>{renderInitials(f.client?.name)}</div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: titleColor, margin: 0 }}>{f.client?.name || 'Unknown Client'}</p>
              <p style={{ fontSize: '11px', color: accent, margin: '1px 0 0' }}>{f.client?.company || f.proposal?.title || ''}</p>
            </div>
          </div>
        </td>
        {!compact && (
          <td style={{ padding: '14px 20px' }}>
            <p style={{ fontSize: '12px', color: titleColor, margin: 0 }}>{contact.label}</p>
            {contact.date && <p style={{ fontSize: '11px', color: subColor, margin: '2px 0 0' }}>{fmtDate(contact.date)}</p>}
          </td>
        )}
        <td style={{ padding: '14px 20px' }}>
          <p style={{ fontSize: '12px', color: titleColor, margin: 0 }}>{fmtDate(f.date)}</p>
          <p style={{ fontSize: '11px', color: f.status === 'Overdue' ? '#DC2626' : subColor, margin: '2px 0 0', fontWeight: f.status === 'Overdue' ? '600' : '400' }}>{dueLabel(f.date)}</p>
        </td>
        <td style={{ padding: '14px 20px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', backgroundColor: statusMeta.bg, color: statusMeta.color }}>● {f.status}</span>
        </td>
        {!compact && (
          <td style={{ padding: '14px 20px' }}>
            <span style={{ fontSize: '12px', color: titleColor, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: priorityMeta.color, display: 'inline-block' }} />
              {priorityMeta.label}
            </span>
          </td>
        )}
        <td style={{ padding: '14px 20px', textAlign: 'right', position: 'relative' }}>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
            <button
              onClick={() => f.proposal ? navigate(`/dashboard/proposals/${f.proposal.id}`) : null}
              style={{
                padding: '6px 14px', borderRadius: '7px', cursor: 'pointer',
                fontSize: '11px', fontWeight: '700', fontFamily: 'inherit',
                backgroundColor: isActionable ? accent : 'transparent',
                color: isActionable ? 'white' : accent,
                border: isActionable ? 'none' : `1px solid ${border}`,
              }}
            >{isActionable ? 'Follow up' : 'View'}</button>
            {!compact && (
              <button onClick={() => setOpenMenuId(openMenuId === f.id ? null : f.id)} style={{
                width: '26px', height: '26px', borderRadius: '7px', border: `1px solid ${border}`,
                backgroundColor: 'transparent', color: titleColor, cursor: 'pointer', fontSize: '13px'
              }}>⋯</button>
            )}
          </div>
          {!compact && openMenuId === f.id && (
            <>
              <div onClick={() => setOpenMenuId(null)} style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
              <div style={{
                position: 'absolute', top: '38px', right: '20px', zIndex: 99, width: '160px',
                backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '10px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden', textAlign: 'left'
              }}>
                {f.completed ? (
                  <button onClick={() => handleReopen(f)} style={{ display: 'block', width: '100%', padding: '10px 14px', border: 'none', background: 'none', textAlign: 'left', fontSize: '12px', color: titleColor, cursor: 'pointer', fontFamily: 'inherit' }}>↺ Reopen</button>
                ) : (
                  <button onClick={() => handleComplete(f)} style={{ display: 'block', width: '100%', padding: '10px 14px', border: 'none', background: 'none', textAlign: 'left', fontSize: '12px', color: titleColor, cursor: 'pointer', fontFamily: 'inherit' }}>✓ Mark Complete</button>
                )}
                <button onClick={() => handleEdit(f)} style={{ display: 'block', width: '100%', padding: '10px 14px', border: 'none', background: 'none', textAlign: 'left', fontSize: '12px', color: titleColor, cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
                <button onClick={() => handleDelete(f)} style={{ display: 'block', width: '100%', padding: '10px 14px', border: 'none', background: 'none', textAlign: 'left', fontSize: '12px', color: '#EF4444', cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
              </div>
            </>
          )}
        </td>
      </tr>
    )
  }

  return (
    <div style={{ maxWidth: '1400px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: titleColor, margin: 0 }}>Follow-ups</h2>
          <p style={{ fontSize: '13px', color: subColor, marginTop: '4px' }}>Never miss a follow-up. Stay on top of every opportunity.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => { exportFollowupsCSV(enriched); showToast('Follow-ups exported!', 'success') }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: cardBg, color: titleColor, fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
          >⬆ Export CSV</button>
          <FancyButton onClick={() => { setEditId(null); setForm({ proposalId: '', date: '', notes: '' }); setShowForm(true) }}>+ New Follow-up</FancyButton>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: '600', fontFamily: 'inherit',
            backgroundColor: tab === t ? (isDark ? accent + '22' : accent + '14') : 'transparent',
            color: tab === t ? accent : subColor,
          }}>{t} {counts[t]}</button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: titleColor, marginBottom: '14px' }}>{editId ? 'Edit Follow-up' : 'New Follow-up'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <select value={form.proposalId} onChange={(e) => setForm({ ...form, proposalId: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}>
                <option value="">Select Proposal</option>
                {proposals.map((p) => (<option key={p.id} value={p.id}>{p.title}</option>))}
              </select>
              {errors.proposalId && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.proposalId}</p>}
            </div>
            <div>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
              {errors.date && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.date}</p>}
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <input type="text" placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button onClick={handleSubmit} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: accent, color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>{editId ? 'Update' : 'Save'}</button>
            <button onClick={handleCancel} style={{ padding: '9px 20px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: 'transparent', color: subColor, fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Main Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🔔"
          title={`No ${tab.toLowerCase()} follow-ups`}
          description="Add follow-up reminders to your proposals so you never miss a chance to close a deal."
          actionLabel="+ Add Follow-up"
          onAction={() => setShowForm(true)}
          isDark={isDark}
          accent={accent}
        />
      ) : (
        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '28px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {['Client / Project', 'Last Contact', 'Due Date', 'Status', 'Priority', 'Action'].map((h) => (
                    <th key={h} style={{ textAlign: h === 'Action' ? 'right' : 'left', padding: '12px 20px', fontSize: '11px', fontWeight: '700', color: subColor, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => renderRow(f, false))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upcoming Follow-ups preview */}
      {upcomingPreview.length > 0 && (
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: titleColor, marginBottom: '12px' }}>Upcoming Follow-ups</h3>
          <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
                <tbody>
                  {upcomingPreview.map((f) => renderRow(f, true))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
