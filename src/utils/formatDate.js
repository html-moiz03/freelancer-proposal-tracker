import { scopedKey } from './accountStorage'

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Formats a stored date string according to the user's Settings > Preferences
// > Date Format choice. Accepts plain 'YYYY-MM-DD' strings as well as full
// ISO timestamps (e.g. from statusChangedAt) — only the date portion is used.
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const format = localStorage.getItem(scopedKey('fpt_date_format')) || 'YYYY-MM-DD'
  const datePart = String(dateStr).split('T')[0]
  const [year, month, day] = datePart.split('-')
  if (!year || !month || !day) return dateStr // not a recognizable date string

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`
    case 'DD MMM YYYY':
      return `${Number(day)} ${MONTHS_SHORT[Number(month) - 1]} ${year}`
    default:
      return datePart // YYYY-MM-DD
  }
}

// Formats a 'HH:MM' (24h) time string, as produced by <input type="time">,
// according to the user's Settings > Preferences > Time Format choice.
export function formatTime(timeStr) {
  if (!timeStr) return ''
  const format = localStorage.getItem(scopedKey('fpt_time_format')) || '12h'
  const [hourStr, minuteStr] = String(timeStr).split(':')
  const hour = Number(hourStr)
  if (Number.isNaN(hour) || minuteStr === undefined) return timeStr // not a recognizable time string

  if (format === '24h') return `${hourStr.padStart(2, '0')}:${minuteStr}`

  const period = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12}:${minuteStr} ${period}`
}