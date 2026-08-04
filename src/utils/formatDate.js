export function formatDate(dateStr) {
  if (!dateStr) return ''
  const format = localStorage.getItem('fpt_date_format') || 'YYYY-MM-DD'
  const [year, month, day] = dateStr.split('-')

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`
    default:
      return dateStr // YYYY-MM-DD already
  }
}