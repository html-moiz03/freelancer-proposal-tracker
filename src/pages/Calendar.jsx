import { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

export default function CalendarPage() {
  const { proposals, followups } = useApp()
  const { isDark, accent } = useTheme()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(new Date())

  const titleColor = isDark ? '#ffffff' : '#37352F'
  const subColor = isDark ? '#94a3b8' : '#9B9A97'
  const card = { backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF', borderColor: isDark ? '#2a2a2a' : '#E9E9E7' }

  const formatDate = (date) => {
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const selectedDateStr = formatDate(selectedDate)

  const deadlinesOnDate = proposals.filter(p => p.deadline === selectedDateStr)
  const followupsOnDate = followups.filter(f => f.date === selectedDateStr)

  const hasEvents = (date) => {
    const dateStr = formatDate(date)
    return proposals.some(p => p.deadline === dateStr) || followups.some(f => f.date === dateStr)
  }

  const getProposalTitle = (id) => {
    const proposal = proposals.find(p => p.id === Number(id))
    return proposal ? proposal.title : 'Unknown'
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6" style={{ color: titleColor }}>📅 Calendar</h2>

      <style>{`
        .react-calendar {
          width: 100%;
          background: ${isDark ? '#1a1a1a' : '#FFFFFF'};
          border: 1px solid ${isDark ? '#2a2a2a' : '#E9E9E7'};
          border-radius: 16px;
          padding: 16px;
          font-family: inherit;
          color: ${titleColor};
        }
        .react-calendar__navigation button {
          color: ${titleColor};
          background: none;
          font-size: 16px;
          font-weight: 700;
          border-radius: 8px;
          min-width: 44px;
        }
        .react-calendar__navigation button:hover {
          background: ${isDark ? '#2a2a2a' : '#F7F6F3'};
        }
        .react-calendar__month-view__weekdays {
          color: ${subColor};
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
        }
        .react-calendar__month-view__weekdays abbr {
          text-decoration: none;
        }
        .react-calendar__tile {
          color: ${titleColor};
          border-radius: 8px;
          padding: 10px 6px;
          font-size: 13px;
          background: none;
          position: relative;
        }
        .react-calendar__tile:hover {
          background: ${isDark ? '#2a2a2a' : '#F7F6F3'};
        }
        .react-calendar__tile--active {
          background: ${accent} !important;
          color: white !important;
          border-radius: 8px;
        }
        .react-calendar__tile--now {
          background: ${accent}22;
          font-weight: 700;
        }
        .react-calendar__month-view__days__day--neighboringMonth {
          color: ${subColor};
          opacity: 0.4;
        }
        .event-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
        }
      `}</style>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="md:col-span-2">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={({ date }) => {
              if (hasEvents(date)) {
                const dateStr = formatDate(date)
                const hasProposal = proposals.some(p => p.deadline === dateStr)
                const hasFollowup = followups.some(f => f.date === dateStr)
                return (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px' }}>
                    {hasProposal && <div className="event-dot" style={{ backgroundColor: accent }} />}
                    {hasFollowup && <div className="event-dot" style={{ backgroundColor: '#F59E0B' }} />}
                  </div>
                )
              }
              return null
            }}
          />
        </div>

        {/* Events Panel */}
        <div className="rounded-xl p-5 border" style={card}>
          <h3 className="font-semibold mb-4" style={{ color: titleColor }}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>

          {deadlinesOnDate.length === 0 && followupsOnDate.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ fontSize: '32px', marginBottom: '8px' }}>📭</p>
              <p style={{ fontSize: '13px', color: subColor }}>No events on this day</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {deadlinesOnDate.map(p => (
                <div key={p.id} onClick={() => navigate('/dashboard/proposals')}
                  style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: accent + '15', border: `1px solid ${accent}30`, cursor: 'pointer' }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: accent, marginBottom: '3px', textTransform: 'uppercase' }}>📄 Proposal Deadline</p>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: titleColor }}>{p.title}</p>
                  <p style={{ fontSize: '11px', color: subColor }}>{p.status} • {localStorage.getItem('fpt_currency') || 'PKR'} {Number(p.amount).toLocaleString()}</p>
                </div>
              ))}
              {followupsOnDate.map(f => (
                <div key={f.id} onClick={() => navigate('/dashboard/followups')}
                  style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: '#FEF3C720', border: '1px solid #FDE68A', cursor: 'pointer' }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#D97706', marginBottom: '3px', textTransform: 'uppercase' }}>🔔 Follow-up</p>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: titleColor }}>{getProposalTitle(f.proposalId)}</p>
                  {f.notes && <p style={{ fontSize: '11px', color: subColor }}>{f.notes}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Legend */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${isDark ? '#2a2a2a' : '#E9E9E7'}` }}>
            <p style={{ fontSize: '11px', fontWeight: '600', color: subColor, marginBottom: '8px', textTransform: 'uppercase' }}>Legend</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: accent }} />
                <span style={{ fontSize: '12px', color: subColor }}>Proposal Deadline</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                <span style={{ fontSize: '12px', color: subColor }}>Follow-up Reminder</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}