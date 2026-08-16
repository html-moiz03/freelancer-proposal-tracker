import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { getLogs } from '../utils/activityLog'
import { exportProposalPDF } from '../utils/exportPDF'
import { generateInvoice } from '../utils/generateInvoice'
import { formatDate } from '../utils/formatDate'

// Simple module-level counter for local-only ids (files/messages) — avoids
// calling impure builtins like Date.now()/Math.random() inside the component
let localIdCounter = 0
function nextLocalId() {
  localIdCounter += 1
  return `local_${localIdCounter}`
}

// Wrapping Date access in plain top-level functions keeps the impure calls
// out of the component/handler body itself.
function nowISO() {
  return new Date().toISOString()
}
function todayStr() {
  return new Date().toISOString().split('T')[0]
}

const STATUS_COLORS = {
  Draft: { bg: '#F1F5F9', color: '#64748B' },
  Sent: { bg: '#DBEAFE', color: '#1D4ED8' },
  'In Review': { bg: '#FEF3C7', color: '#D97706' },
  Negotiation: { bg: '#EDE9FE', color: '#6D28D9' },
  Won: { bg: '#D1FAE5', color: '#065F46' },
  Lost: { bg: '#FEE2E2', color: '#991B1B' },
}

const STEPS = ['Draft', 'Sent', 'In Review', 'Negotiation', 'Won / Lost']

const TABS = ['Overview', 'Files', 'Messages', 'Follow-ups', 'Notes']

const ACTIVITY_ICONS = {
  PROPOSAL_ADDED: { icon: '📄', color: '#4F46E5' },
  PROPOSAL_STATUS: { icon: '🔄', color: '#7C5CFC' },
  PROPOSAL_UPDATED: { icon: '✏️', color: '#64748B' },
  PROPOSAL_AUTO_EXPIRED: { icon: '⏰', color: '#EF4444' },
  FOLLOWUP_ADDED: { icon: '🔔', color: '#F59E0B' },
  FOLLOWUP_UPDATED: { icon: '✏️', color: '#64748B' },
  FOLLOWUP_DELETED: { icon: '✅', color: '#10B981' },
}

function fmtDate(d) {
  if (!d) return null
  return formatDate(d)
}

export default function ProposalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { proposals, clients, followups, currency, updateProposal, addFollowup, deleteFollowup } = useApp()
  const { isDark, accent } = useTheme()
  const { showToast } = useToast()

  const [tab, setTab] = useState('Overview')
  const [showMore, setShowMore] = useState(false)
  const [notes, setNotes] = useState('')
  const [notesForId, setNotesForId] = useState(null)
  const [fileInput, setFileInput] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [showFollowupForm, setShowFollowupForm] = useState(false)
  const [followupForm, setFollowupForm] = useState({ date: '', notes: '' })
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState(null)

  const proposal = proposals.find((p) => p.id === Number(id))

  // Reset the notes draft whenever we navigate to a different proposal.
  // This is the React-recommended "adjust state during render" pattern —
  // it runs before children render, so no extra render/flash occurs.
  if (proposal && notesForId !== proposal.id) {
    setNotesForId(proposal.id)
    setNotes(proposal.notes || '')
  }

  const cardBg = isDark ? '#111118' : '#ffffff'
  const border = isDark ? '#1e1e2e' : '#f0f0f0'
  const titleColor = isDark ? '#ffffff' : '#111827'
  const subColor = isDark ? '#64748b' : '#6b7280'
  const inputBg = isDark ? '#1e1e2e' : '#f9fafb'
  const card = { backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '12px' }

  if (!proposal) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: subColor }}>
        <p style={{ fontSize: '40px', marginBottom: '12px' }}>📄</p>
        <p style={{ fontSize: '16px', fontWeight: '600' }}>Proposal not found</p>
        <button onClick={() => navigate('/dashboard/proposals')} style={{ marginTop: '16px', padding: '9px 18px', borderRadius: '8px', border: 'none', backgroundColor: accent, color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
          Back to Proposals
        </button>
      </div>
    )
  }

  const client = clients.find((c) => c.id === Number(proposal.clientId))
  const proposalFollowups = followups.filter((f) => Number(f.proposalId) === proposal.id).sort((a, b) => a.date.localeCompare(b.date))
  const today = todayStr()
  const nextFollowup = proposalFollowups.find((f) => f.date >= today) || null
  const proposalLogs = getLogs().filter((l) => l.details && l.details.includes(proposal.title))
  const files = proposal.files || []
  const messages = proposal.messages || []

  const proposalCode = `#FP-${new Date(proposal.id).getFullYear()}-${String(proposal.id).slice(-4)}`
  const sentOn = fmtDate(proposal.id)

  let stepIndex = 0
  if (proposal.status === 'Sent') stepIndex = 1
  else if (proposal.status === 'In Review') stepIndex = 2
  else if (proposal.status === 'Negotiation') stepIndex = 3
  else if (proposal.status === 'Won' || proposal.status === 'Lost') stepIndex = 4
  const progressPct = (stepIndex / (STEPS.length - 1)) * 100

  const daysUntil = (date) => Math.ceil((new Date(date) - new Date(today)) / 86400000)

  const handleSaveNotes = () => {
    updateProposal(proposal.id, { notes })
    showToast('Notes saved!', 'success')
  }

  const handleAddFile = () => {
    if (!fileInput.trim()) return
    updateProposal(proposal.id, { files: [...files, { id: nextLocalId(), name: fileInput.trim() }] })
    setFileInput('')
    showToast('File added!', 'success')
  }

  const handleRemoveFile = (fid) => {
    updateProposal(proposal.id, { files: files.filter((f) => f.id !== fid) })
  }

  const handleSendMessage = () => {
    if (!messageInput.trim()) return
    updateProposal(proposal.id, { messages: [...messages, { id: nextLocalId(), text: messageInput.trim(), date: nowISO() }] })
    setMessageInput('')
  }

  const handleAddFollowup = () => {
    if (!followupForm.date) return
    addFollowup({ proposalId: proposal.id, date: followupForm.date, notes: followupForm.notes })
    setFollowupForm({ date: '', notes: '' })
    setShowFollowupForm(false)
    showToast('Follow-up added!', 'success')
  }

  const handleMarkDone = (followupId) => {
    deleteFollowup(followupId)
    showToast('Follow-up completed!', 'success')
  }

  const openEditModal = () => {
    setEditForm({
      title: proposal.title || '',
      amount: proposal.amount || '',
      deadline: proposal.deadline || '',
      status: proposal.status || 'Draft',
      category: proposal.category || '',
      projectType: proposal.projectType || '',
      timeline: proposal.timeline || '',
      paymentTerms: proposal.paymentTerms || '',
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = () => {
    if (!editForm.title.trim()) { showToast('Title is required', 'error'); return }
    if (!editForm.deadline) { showToast('Deadline is required', 'error'); return }
    updateProposal(proposal.id, {
      title: editForm.title.trim(),
      amount: Number(editForm.amount) || 0,
      deadline: editForm.deadline,
      status: editForm.status,
      category: editForm.category,
      projectType: editForm.projectType,
      timeline: editForm.timeline,
      paymentTerms: editForm.paymentTerms,
    })
    setShowEditModal(false)
    showToast('Proposal updated!', 'success')
  }

  return (
    <div style={{ maxWidth: '1200px' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '13px', color: subColor }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/proposals')}>Proposals</span>
          <span style={{ margin: '0 6px' }}>/</span>
          <span style={{ color: titleColor, fontWeight: '600' }}>{proposal.title}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
          <button style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: cardBg, color: titleColor, fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
            onClick={openEditModal}>
            Edit
          </button>
          <button onClick={() => setShowMore(!showMore)} style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: cardBg, color: titleColor, fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
            More ▾
          </button>
          {showMore && (
            <>
              <div onClick={() => setShowMore(false)} style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
              <div style={{ position: 'absolute', top: '38px', right: 0, zIndex: 99, width: '190px', backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
                <button onClick={() => { exportProposalPDF(proposal, client?.name || 'Client'); showToast('PDF exported!', 'success'); setShowMore(false) }} style={{ display: 'block', width: '100%', padding: '10px 14px', border: 'none', background: 'none', textAlign: 'left', fontSize: '12px', color: titleColor, cursor: 'pointer', fontFamily: 'inherit' }}>📄 Export PDF</button>
                {proposal.status === 'Won' && (
                  <button onClick={() => { generateInvoice(proposal, client); showToast('Invoice downloaded!', 'success'); setShowMore(false) }} style={{ display: 'block', width: '100%', padding: '10px 14px', border: 'none', background: 'none', textAlign: 'left', fontSize: '12px', color: titleColor, cursor: 'pointer', fontFamily: 'inherit' }}>🧾 Generate Invoice</button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Header Card */}
      <div style={{ ...card, padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: titleColor, margin: 0 }}>{proposal.title}</h2>
              <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', backgroundColor: STATUS_COLORS[proposal.status]?.bg, color: STATUS_COLORS[proposal.status]?.color }}>
                ● {proposal.status}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: subColor, marginTop: '8px' }}>
              {client?.company && <span style={{ color: accent, fontWeight: '600' }}>{client.company}</span>}
              {client?.company && ' · '}
              {client?.name || 'Unknown Client'} · {client?.email || '—'}
            </p>
            <p style={{ fontSize: '12px', color: subColor, marginTop: '4px' }}>
              Sent on {sentOn} · Proposal ID: {proposalCode}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', color: subColor, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' }}>Proposed Price</p>
            <p style={{ fontSize: '24px', fontWeight: '800', color: titleColor, margin: 0 }}>{currency} {Number(proposal.amount).toLocaleString()}</p>
          </div>
        </div>

        {/* Stepper */}
        <div style={{ position: 'relative', padding: '0 10px' }}>
          <div style={{ position: 'absolute', top: '11px', left: '10%', right: '10%', height: '2px', backgroundColor: isDark ? '#1e1e2e' : '#e5e7eb', zIndex: 0 }} />
          <div style={{ position: 'absolute', top: '11px', left: '10%', width: `${progressPct * 0.8}%`, height: '2px', backgroundColor: accent, zIndex: 0, transition: 'width 0.3s ease' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            {STEPS.map((step, i) => {
              const reached = i <= stepIndex
              const current = i === stepIndex
              return (
                <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: `${100 / STEPS.length}%` }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    backgroundColor: reached ? accent : cardBg,
                    border: `2px solid ${reached ? accent : (isDark ? '#2a2a3e' : '#d1d5db')}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: '700', color: reached ? 'white' : subColor
                  }}>{reached && !current ? '✓' : ''}</div>
                  <p style={{ fontSize: '11px', fontWeight: current ? '700' : '600', color: current ? accent : (reached ? titleColor : subColor), marginTop: '8px', textAlign: 'center' }}>{step}</p>
                  {i === 0 && sentOn && <p style={{ fontSize: '10px', color: subColor, marginTop: '2px' }}>{sentOn}</p>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '20px', borderBottom: `1px solid ${border}`, marginBottom: '20px' }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 2px', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: '600', fontFamily: 'inherit',
            color: tab === t ? accent : subColor,
            borderBottom: tab === t ? `2px solid ${accent}` : '2px solid transparent',
            marginBottom: '-1px'
          }}>{t}</button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'Overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          {/* Proposal Details */}
          <div style={{ ...card, padding: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: titleColor, marginBottom: '14px' }}>Proposal Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { key: 'category', label: 'Category' },
                { key: 'projectType', label: 'Project Type' },
                { key: 'timeline', label: 'Timeline' },
                { key: 'paymentTerms', label: 'Payment Terms' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <p style={{ fontSize: '11px', color: subColor, marginBottom: '3px' }}>{label}</p>
                  <input
                    type="text"
                    value={proposal[key] || ''}
                    placeholder="—"
                    onChange={(e) => updateProposal(proposal.id, { [key]: e.target.value })}
                    style={{ width: '100%', padding: '6px 0', border: 'none', borderBottom: `1px solid transparent`, backgroundColor: 'transparent', color: titleColor, fontSize: '13px', fontWeight: '600', outline: 'none', fontFamily: 'inherit' }}
                    onFocus={(e) => e.target.style.borderBottom = `1px solid ${accent}`}
                    onBlur={(e) => e.target.style.borderBottom = '1px solid transparent'}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Next Follow-up */}
          <div style={{ ...card, padding: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: titleColor, marginBottom: '14px' }}>Next Follow-up</h3>
            {nextFollowup ? (
              <>
                <p style={{ fontSize: '13px', fontWeight: '700', color: accent }}>
                  {fmtDate(nextFollowup.date)} ({daysUntil(nextFollowup.date) === 0 ? 'today' : daysUntil(nextFollowup.date) === 1 ? 'in 1 day' : `in ${daysUntil(nextFollowup.date)} days`})
                </p>
                <p style={{ fontSize: '12px', color: subColor, marginTop: '6px', lineHeight: '1.5' }}>{nextFollowup.notes || 'Check back for feedback and discuss any updates.'}</p>
                <button onClick={() => handleMarkDone(nextFollowup.id)} style={{ marginTop: '14px', padding: '8px 16px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: 'transparent', color: accent, fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Mark as Done
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: '12px', color: subColor }}>No upcoming follow-up scheduled.</p>
                <button onClick={() => { setTab('Follow-ups'); setShowFollowupForm(true) }} style={{ marginTop: '14px', padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: accent, color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                  + Add Follow-up
                </button>
              </>
            )}
          </div>

          {/* Activity */}
          <div style={{ ...card, padding: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: titleColor, marginBottom: '14px' }}>Activity</h3>
            {proposalLogs.length === 0 ? (
              <p style={{ fontSize: '12px', color: subColor }}>No activity yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {proposalLogs.slice(0, 5).map((log) => {
                  const meta = ACTIVITY_ICONS[log.action] || { icon: '📌', color: subColor }
                  return (
                    <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: meta.color }}>●</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '12px', color: titleColor, margin: 0 }}>{log.details}</p>
                        <p style={{ fontSize: '11px', color: subColor, margin: '2px 0 0' }}>{fmtDate(log.timestamp)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <button onClick={() => navigate('/dashboard')} style={{ marginTop: '14px', background: 'none', border: 'none', padding: 0, fontSize: '12px', fontWeight: '600', color: accent, cursor: 'pointer', fontFamily: 'inherit' }}>
              View full activity
            </button>
          </div>
        </div>
      )}

      {/* Files */}
      {tab === 'Files' && (
        <div style={{ ...card, padding: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '700', color: titleColor, marginBottom: '14px' }}>Files</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input type="text" placeholder="File name (e.g. contract.pdf)" value={fileInput} onChange={(e) => setFileInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddFile()}
              style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <button onClick={handleAddFile} style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', backgroundColor: accent, color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Add</button>
          </div>
          {files.length === 0 ? <p style={{ fontSize: '13px', color: subColor }}>No files attached yet.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {files.map((f) => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', backgroundColor: inputBg }}>
                  <span style={{ fontSize: '13px', color: titleColor }}>📎 {f.name}</span>
                  <button onClick={() => handleRemoveFile(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '14px' }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      {tab === 'Messages' && (
        <div style={{ ...card, padding: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '700', color: titleColor, marginBottom: '14px' }}>Messages</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input type="text" placeholder="Write a message..." value={messageInput} onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <button onClick={handleSendMessage} style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', backgroundColor: accent, color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Send</button>
          </div>
          {messages.length === 0 ? <p style={{ fontSize: '13px', color: subColor }}>No messages yet.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.slice().reverse().map((m) => (
                <div key={m.id} style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: inputBg }}>
                  <p style={{ fontSize: '13px', color: titleColor, margin: 0 }}>{m.text}</p>
                  <p style={{ fontSize: '11px', color: subColor, marginTop: '4px' }}>{fmtDate(m.date)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Follow-ups */}
      {tab === 'Follow-ups' && (
        <div style={{ ...card, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: titleColor, margin: 0 }}>Follow-ups</h3>
            <button onClick={() => setShowFollowupForm(!showFollowupForm)} style={{ padding: '6px 14px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: 'transparent', color: titleColor, fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
              {showFollowupForm ? 'Cancel' : '+ Add'}
            </button>
          </div>
          {showFollowupForm && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <input type="date" value={followupForm.date} onChange={(e) => setFollowupForm({ ...followupForm, date: e.target.value })}
                style={{ padding: '9px 12px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
              <input type="text" placeholder="Notes" value={followupForm.notes} onChange={(e) => setFollowupForm({ ...followupForm, notes: e.target.value })}
                style={{ flex: 1, minWidth: '160px', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
              <button onClick={handleAddFollowup} style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', backgroundColor: accent, color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
            </div>
          )}
          {proposalFollowups.length === 0 ? <p style={{ fontSize: '13px', color: subColor }}>No follow-ups scheduled for this proposal.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {proposalFollowups.map((f) => {
                const overdue = f.date < today
                return (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', backgroundColor: inputBg }}>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: overdue ? '#EF4444' : titleColor, margin: 0 }}>{fmtDate(f.date)}{overdue ? ' · Overdue' : ''}</p>
                      {f.notes && <p style={{ fontSize: '12px', color: subColor, marginTop: '2px' }}>{f.notes}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleMarkDone(f.id)} style={{ padding: '5px 10px', borderRadius: '6px', border: `1px solid ${border}`, backgroundColor: 'transparent', color: accent, fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Done</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {tab === 'Notes' && (
        <div style={{ ...card, padding: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '700', color: titleColor, marginBottom: '14px' }}>Notes</h3>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={8}
            placeholder="Add notes about this proposal..."
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', lineHeight: '1.6' }} />
          <button onClick={handleSaveNotes} style={{ marginTop: '12px', padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: accent, color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
            Save Notes
          </button>
        </div>
      )}

      {/* Edit Proposal Modal */}
      {showEditModal && editForm && (
        <>
          <div onClick={() => setShowEditModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            zIndex: 2001, width: '92%', maxWidth: '520px', maxHeight: '85vh', overflowY: 'auto',
            backgroundColor: cardBg, borderRadius: '16px', padding: '28px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.25)', border: `1px solid ${border}`,
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: titleColor, marginBottom: '18px' }}>Edit Proposal</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <p style={{ fontSize: '11px', color: subColor, marginBottom: '4px' }}>Title</p>
                <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: subColor, marginBottom: '4px' }}>Amount ({currency})</p>
                  <input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: subColor, marginBottom: '4px' }}>Deadline</p>
                  <input type="date" value={editForm.deadline} onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                </div>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: subColor, marginBottom: '4px' }}>Status</p>
                <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}>
                  {Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: subColor, marginBottom: '4px' }}>Category</p>
                  <input type="text" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: subColor, marginBottom: '4px' }}>Project Type</p>
                  <input type="text" value={editForm.projectType} onChange={(e) => setEditForm({ ...editForm, projectType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: subColor, marginBottom: '4px' }}>Timeline</p>
                  <input type="text" value={editForm.timeline} onChange={(e) => setEditForm({ ...editForm, timeline: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: subColor, marginBottom: '4px' }}>Payment Terms</p>
                  <input type="text" value={editForm.paymentTerms} onChange={(e) => setEditForm({ ...editForm, paymentTerms: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
              <button onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: '10px 16px', borderRadius: '10px', border: `1px solid ${border}`, backgroundColor: 'transparent', color: titleColor, fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={handleSaveEdit} style={{ flex: 1, padding: '10px 16px', borderRadius: '10px', border: 'none', backgroundColor: accent, color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Save Changes</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
