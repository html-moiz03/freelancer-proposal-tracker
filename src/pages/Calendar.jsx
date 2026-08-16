import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { formatDate, formatTime } from '../utils/formatDate'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const EVENT_TYPE_META = {
  Meeting: { color: '#F59E0B' },
  Call: { color: '#10B981' },
  Review: { color: '#3B82F6' },
  Reminder: { color: '#6366F1' },
  Other: { color: '#6B7280' },
}
const DEADLINE_COLOR = '#EF4444'
const FOLLOWUP_COLOR = '#8B5CF6'

// Top-level helper keeps impure Date access out of the component body itself
function todayDate() {
  return new Date()
}

function toDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const EMPTY_FORM = { title: '', date: '', time: '', type: 'Meeting' }

export default function CalendarPage() {
  const { proposals, followups, clients, events, addEvent } = useApp()
  const { isDark, accent } = useTheme()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [today] = useState(() => todayDate())
  const [viewDate, setViewDate] = useState(() => todayDate())
  const [showEventForm, setShowEventForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const todayStr = toDateStr(today)
  const titleColor = isDark ? '#ffffff' : '#111827'
  const subColor = isDark ? '#64748b' : '#6b7280'
  const cardBg = isDark ? '#111118' : '#ffffff'
  const border = isDark ? '#1e1e2e' : '#f0f0f0'
  const inputBg = isDark ? '#1e1e2e' : '#f9fafb'

  const getClientName = (proposalId) => {
    const p = proposals.find((pr) => pr.id === Number(proposalId))
    const client = p ? clients.find((c) => c.id === Number(p.clientId)) : null
    return client ? client.name : (p ? p.title : 'Unknown')
  }

  // Build a unified event list: proposal deadlines + follow-ups + custom events
  const allDayEvents = [
    ...proposals.map((p) => ({ id: `deadline-${p.id}`, date: p.deadline, label: `Deadline: ${p.title}`, color: DEADLINE_COLOR, kind: 'Proposal Deadline', onClick: () => navigate('/dashboard/proposals') })),
    ...followups.map((f) => ({ id: `followup-${f.id}`, date: f.date, label: `Follow-up: ${getClientName(f.proposalId)}`, color: FOLLOWUP_COLOR, kind: 'Follow-up', onClick: () => navigate('/dashboard/followups') })),
    ...events.map((e) => ({ id: `event-${e.id}`, date: e.date, label: e.title, color: (EVENT_TYPE_META[e.type] || EVENT_TYPE_META.Other).color, kind: e.type || 'Event', time: e.time })),
  ].filter((e) => e.date)

  const eventsOnDate = (dateStr) => allDayEvents.filter((e) => e.date === dateStr)

  // Month grid
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const startWeekday = firstOfMonth.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const cells = []
  for (let i = startWeekday - 1; i >= 0; i--) cells.push({ day: daysInPrevMonth - i, current: false, date: new Date(year, month - 1, daysInPrevMonth - i) })
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true, date: new Date(year, month, d) })
  while (cells.length % 7 !== 0 || cells.length < 42) cells.push({ day: cells.length - (startWeekday + daysInMonth) + 1, current: false, date: new Date(year, month + 1, cells.length - (startWeekday + daysInMonth) + 1) })

  const goToday = () => setViewDate(todayDate())
  const goPrev = () => setViewDate(new Date(year, month - 1, 1))
  const goNext = () => setViewDate(new Date(year, month + 1, 1))

  const handleAddEvent = () => {
    if (!form.title.trim() || !form.date) { showToast('Title and date are required', 'error'); return }
    addEvent(form)
    showToast('Event added!', 'success')
    setForm(EMPTY_FORM)
    setShowEventForm(false)
  }

  // Upcoming events list (next 10, sorted, excluding past)
  const upcoming = allDayEvents
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8)

  const dueLabel = (dateStr) => {
    const diff = Math.round((new Date(dateStr) - new Date(todayStr)) / 86400000)
    if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, color: '#EF4444' }
    if (diff === 0) return { text: 'Today', color: '#F59E0B' }
    if (diff === 1) return { text: 'Tomorrow', color: '#3B82F6' }
    return { text: `In ${diff} days`, color: '#3B82F6' }
  }

  const fmtDateTime = (dateStr, time) => {
    const dateLabel = formatDate(dateStr)
    return time ? `${dateLabel} · ${formatTime(time)}` : dateLabel
  }

  return (
    <div style={{ maxWidth: '1400px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: titleColor, margin: 0 }}>Calendar</h2>
          <p style={{ fontSize: '13px', color: subColor, marginTop: '4px' }}>Schedule meetings, follow-ups and important tasks.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={goToday} style={{ padding: '7px 14px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: cardBg, color: titleColor, fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Today</button>
          <button onClick={goPrev} style={{ width: '30px', height: '30px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: cardBg, color: titleColor, cursor: 'pointer', fontSize: '13px' }}>‹</button>
          <button onClick={goNext} style={{ width: '30px', height: '30px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: cardBg, color: titleColor, cursor: 'pointer', fontSize: '13px' }}>›</button>
          <span style={{ fontSize: '15px', fontWeight: '700', color: titleColor, marginLeft: '6px' }}>{MONTHS[month]} {year}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select disabled value="Month" style={{ padding: '7px 14px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: cardBg, color: titleColor, fontSize: '12px', fontWeight: '600', outline: 'none', fontFamily: 'inherit' }}>
            <option>Month</option>
          </select>
          <button onClick={() => { setForm({ ...EMPTY_FORM, date: todayStr }); setShowEventForm(true) }} style={{
            padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: '700', fontFamily: 'inherit',
            background: `linear-gradient(135deg, ${accent}, #7c3aed)`, color: 'white',
            boxShadow: `0 2px 8px ${accent}40`
          }}>+ New Event</button>
        </div>
      </div>

      {/* Month Grid */}
      <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${border}` }}>
          {WEEKDAYS.map((w) => (
            <div key={w} style={{ padding: '10px 0', textAlign: 'center', fontSize: '11px', fontWeight: '700', color: subColor, textTransform: 'uppercase' }}>{w}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((cell, i) => {
            const dateStr = toDateStr(cell.date)
            const dayEvents = eventsOnDate(dateStr)
            const isToday = dateStr === todayStr
            return (
              <div key={i} style={{
                minHeight: '92px', padding: '6px', borderRight: (i + 1) % 7 !== 0 ? `1px solid ${border}` : 'none',
                borderBottom: '1px solid ' + border, opacity: cell.current ? 1 : 0.35
              }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '22px', height: '22px', borderRadius: '50%',
                    fontSize: '12px', fontWeight: isToday ? '700' : '500',
                    backgroundColor: isToday ? accent : 'transparent',
                    color: isToday ? 'white' : titleColor
                  }}>{cell.day}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                  {dayEvents.slice(0, 2).map((e) => (
                    <div key={e.id} onClick={e.onClick} title={e.label} style={{
                      fontSize: '10px', fontWeight: '600', padding: '2px 5px', borderRadius: '5px',
                      backgroundColor: e.color + '22', color: e.color,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      cursor: e.onClick ? 'pointer' : 'default'
                    }}>{e.label}</div>
                  ))}
                  {dayEvents.length > 2 && (
                    <span style={{ fontSize: '10px', color: subColor, paddingLeft: '5px' }}>+{dayEvents.length - 2} more</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: titleColor, marginBottom: '14px' }}>Upcoming Events</h3>
        {upcoming.length === 0 ? (
          <p style={{ fontSize: '13px', color: subColor }}>No upcoming events.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {upcoming.map((e) => {
              const due = dueLabel(e.date)
              return (
                <div key={e.id} onClick={e.onClick} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 4px',
                  borderBottom: `1px solid ${border}`, cursor: e.onClick ? 'pointer' : 'default'
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: e.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: titleColor, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.label}</p>
                  </div>
                  <span style={{ fontSize: '12px', color: subColor, flexShrink: 0 }}>{fmtDateTime(e.date, e.time)}</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: due.color, flexShrink: 0, minWidth: '80px', textAlign: 'right' }}>{due.text}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* New Event Modal */}
      {showEventForm && (
        <>
          <div onClick={() => setShowEventForm(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            zIndex: 1001, width: '90%', maxWidth: '420px',
            backgroundColor: cardBg, borderRadius: '16px', padding: '24px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.2)', border: `1px solid ${border}`,
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: titleColor, marginBottom: '16px' }}>New Event</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Event title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                  style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
              </div>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}>
                {Object.keys(EVENT_TYPE_META).map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
              <button onClick={handleAddEvent} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: accent, color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
              <button onClick={() => setShowEventForm(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: 'transparent', color: subColor, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
