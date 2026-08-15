import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import confetti from 'canvas-confetti'

const COLUMNS = ['Draft', 'Sent', 'In Review', 'Negotiation', 'Won', 'Lost']

const COLUMN_COLORS = {
  Draft: { text: '#6B6B6B', tint: '#F5F5F4', tintDark: '#16161a', dot: '#94A3B8' },
  Sent: { text: '#1D4ED8', tint: '#EFF6FF', tintDark: '#0d1626', dot: '#3B82F6' },
  'In Review': { text: '#D97706', tint: '#FFFBEB', tintDark: '#1f1708', dot: '#F59E0B' },
  Negotiation: { text: '#6D28D9', tint: '#F5F3FF', tintDark: '#180f2b', dot: '#7C3AED' },
  Won: { text: '#059669', tint: '#ECFDF5', tintDark: '#06170f', dot: '#10B981' },
  Lost: { text: '#DC2626', tint: '#FEF2F2', tintDark: '#1f0a0a', dot: '#EF4444' },
}

const STATUS_LINE = {
  Draft: (d) => d,
  Sent: (d) => `Sent ${d}`,
  'In Review': (d) => `Review since ${d}`,
  Negotiation: (d) => `Negotiation since ${d}`,
  Won: (d) => `Won on ${d}`,
  Lost: (d) => `Lost on ${d}`,
}

const EMPTY_FORM = { title: '', clientId: '', amount: '', deadline: '', status: 'Draft', notes: '', priority: 'Medium', tags: [] }

function fmtDate(ts) {
  if (!ts) return null
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Kanban() {
  const { proposals, updateProposal, addProposal, clients, currency } = useApp()
  const { isDark, accent } = useTheme()
  const { showToast } = useToast()

  const [clientFilter, setClientFilter] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [modalStatus, setModalStatus] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const titleColor = isDark ? '#ffffff' : '#111827'
  const subColor = isDark ? '#64748b' : '#6b7280'
  const cardBg = isDark ? '#111118' : '#ffffff'
  const cardBorder = isDark ? '#1e1e2e' : '#e5e7eb'
  const pageBorder = isDark ? '#1e1e2e' : '#f0f0f0'
  const inputBg = isDark ? '#1e1e2e' : '#f9fafb'

  const getClient = (id) => clients.find((c) => c.id === Number(id))

  const visibleProposals = clientFilter ? proposals.filter((p) => String(p.clientId) === clientFilter) : proposals

  const getColumnProposals = (status) => visibleProposals.filter((p) => p.status === status)

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId) return
    const proposalId = Number(draggableId)
    updateProposal(proposalId, { status: destination.droppableId })
    if (destination.droppableId === 'Won') {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#4F46E5', '#7c3aed', '#10B981', '#F59E0B', '#EF4444'] })
    }
  }

  const openAddModal = (status) => {
    setForm({ ...EMPTY_FORM, status })
    setErrors({})
    setModalStatus(status)
  }

  const handleSubmit = () => {
    const newErrors = {}
    if (!form.title.trim()) newErrors.title = 'Title is required'
    if (!form.clientId) newErrors.clientId = 'Select a client'
    if (!form.amount) newErrors.amount = 'Amount is required'
    if (!form.deadline) newErrors.deadline = 'Deadline is required'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    addProposal(form)
    showToast('Proposal added!', 'success')
    setModalStatus(null)
    setForm(EMPTY_FORM)
  }

  return (
    <div style={{ maxWidth: '1500px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: titleColor, margin: 0 }}>Kanban Board</h2>
          <p style={{ fontSize: '13px', color: subColor, marginTop: '4px' }}>Visualize your pipeline and move deals forward.</p>
        </div>
        <button onClick={() => openAddModal('Draft')} style={{
          padding: '9px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
          fontSize: '13px', fontWeight: '700', fontFamily: 'inherit',
          background: `linear-gradient(135deg, ${accent}, #7c3aed)`, color: 'white',
          boxShadow: `0 2px 8px ${accent}40`
        }}>+ New Proposal</button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', position: 'relative' }}>
        <button onClick={() => setShowFilter(!showFilter)} style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px',
          border: `1px solid ${pageBorder}`, backgroundColor: cardBg, color: titleColor,
          fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
        }}>⏷ Filter{clientFilter ? ` · ${getClient(clientFilter)?.name || ''}` : ''}</button>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px',
          border: `1px solid ${pageBorder}`, backgroundColor: cardBg, color: titleColor,
          fontSize: '12px', fontWeight: '600', cursor: 'default', fontFamily: 'inherit'
        }}>📊 Group by: Status</button>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px',
          border: `1px solid ${pageBorder}`, backgroundColor: cardBg, color: titleColor,
          fontSize: '12px', fontWeight: '600', cursor: 'default', fontFamily: 'inherit'
        }}>⚙ Customize</button>

        {showFilter && (
          <>
            <div onClick={() => setShowFilter(false)} style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
            <div style={{
              position: 'absolute', top: '38px', left: 0, zIndex: 99, width: '220px',
              backgroundColor: cardBg, border: `1px solid ${pageBorder}`, borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '10px'
            }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: subColor, marginBottom: '8px', textTransform: 'uppercase' }}>Filter by client</p>
              <button onClick={() => { setClientFilter(''); setShowFilter(false) }} style={{ display: 'block', width: '100%', padding: '8px 10px', border: 'none', background: !clientFilter ? (isDark ? accent + '22' : accent + '14') : 'none', textAlign: 'left', fontSize: '12px', color: !clientFilter ? accent : titleColor, cursor: 'pointer', fontFamily: 'inherit', borderRadius: '6px' }}>All Clients</button>
              {clients.map((c) => (
                <button key={c.id} onClick={() => { setClientFilter(String(c.id)); setShowFilter(false) }} style={{ display: 'block', width: '100%', padding: '8px 10px', border: 'none', background: clientFilter === String(c.id) ? (isDark ? accent + '22' : accent + '14') : 'none', textAlign: 'left', fontSize: '12px', color: clientFilter === String(c.id) ? accent : titleColor, cursor: 'pointer', fontFamily: 'inherit', borderRadius: '6px' }}>{c.name}</button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '16px' }}>
          {COLUMNS.map((column) => {
            const colProposals = getColumnProposals(column)
            const colColors = COLUMN_COLORS[column]

            return (
              <div key={column} style={{ minWidth: '230px', width: '230px', flexShrink: 0 }}>
                {/* Column Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 6px 10px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colColors.dot, display: 'inline-block' }} />
                  <span style={{ color: colColors.text, fontWeight: '700', fontSize: '13px' }}>{column}</span>
                  <span style={{
                    backgroundColor: isDark ? colColors.tintDark : colColors.tint,
                    color: colColors.text, fontSize: '11px', fontWeight: '700',
                    padding: '1px 8px', borderRadius: '20px',
                  }}>{colProposals.length}</span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={column}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        backgroundColor: isDark ? colColors.tintDark : colColors.tint,
                        borderRadius: '12px',
                        minHeight: '160px',
                        padding: '10px',
                        border: `1px solid ${snapshot.isDraggingOver ? colColors.dot : 'transparent'}`,
                        transition: 'border-color 0.15s',
                      }}
                    >
                      {colProposals.map((proposal, index) => {
                        const client = getClient(proposal.clientId)
                        const statusDate = proposal.status === 'Draft'
                          ? (proposal.deadline ? new Date(proposal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null)
                          : fmtDate(proposal.statusChangedAt || proposal.id)
                        const metaLine = statusDate ? STATUS_LINE[proposal.status](statusDate) : null

                        return (
                          <Draggable key={proposal.id} draggableId={String(proposal.id)} index={index}>
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                style={{
                                  backgroundColor: cardBg,
                                  border: `1px solid ${cardBorder}`,
                                  borderRadius: '10px',
                                  padding: '12px',
                                  marginBottom: '10px',
                                  boxShadow: dragSnapshot.isDragging ? '0 8px 24px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
                                  cursor: 'grab',
                                  ...dragProvided.draggableProps.style,
                                }}
                              >
                                <p style={{ fontSize: '13px', fontWeight: '700', color: titleColor, marginBottom: '4px', lineHeight: '1.3' }}>{proposal.title}</p>
                                <p style={{ fontSize: '11px', color: subColor, marginBottom: '3px' }}>{client?.name || 'Unknown'}</p>
                                <p style={{ fontSize: '11px', fontWeight: '600', color: titleColor, marginBottom: '3px' }}>{currency} {Number(proposal.amount).toLocaleString()}</p>
                                {metaLine && <p style={{ fontSize: '10px', color: colColors.text, marginTop: '6px' }}>{metaLine}</p>}
                              </div>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}

                      <button onClick={() => openAddModal(column)} style={{
                        width: '100%', padding: '8px', marginTop: '2px', borderRadius: '8px',
                        border: 'none', background: 'none', cursor: 'pointer',
                        fontSize: '12px', fontWeight: '600', color: colColors.text, fontFamily: 'inherit'
                      }}>+ Add Proposal</button>
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>

      {/* Add Proposal Modal */}
      {modalStatus && (
        <>
          <div onClick={() => setModalStatus(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            zIndex: 1001, width: '90%', maxWidth: '480px',
            backgroundColor: cardBg, borderRadius: '16px', padding: '24px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.2)', border: `1px solid ${pageBorder}`,
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: titleColor, marginBottom: '16px' }}>New Proposal — {modalStatus}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <input type="text" placeholder="Proposal Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${pageBorder}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                {errors.title && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.title}</p>}
              </div>
              <div>
                <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${pageBorder}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}>
                  <option value="">Select Client</option>
                  {clients.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
                {errors.clientId && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.clientId}</p>}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <input type="number" placeholder={`Amount (${currency})`} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${pageBorder}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                  {errors.amount && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.amount}</p>}
                </div>
                <div style={{ flex: 1 }}>
                  <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${pageBorder}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                  {errors.deadline && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.deadline}</p>}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
              <button onClick={handleSubmit} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: accent, color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
              <button onClick={() => setModalStatus(null)} style={{ padding: '10px 20px', borderRadius: '8px', border: `1px solid ${pageBorder}`, backgroundColor: 'transparent', color: subColor, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
