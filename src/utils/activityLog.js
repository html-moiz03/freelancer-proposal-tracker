export function logActivity(action, details) {
  const logs = JSON.parse(localStorage.getItem('fpt_activity') || '[]')
  const newLog = {
    id: Date.now(),
    action,
    details,
    timestamp: new Date().toISOString(),
  }
  logs.unshift(newLog)
  // Keep only last 50 activities
  if (logs.length > 50) logs.pop()
  localStorage.setItem('fpt_activity', JSON.stringify(logs))
}

export function getLogs() {
  return JSON.parse(localStorage.getItem('fpt_activity') || '[]')
}

export function clearLogs() {
  localStorage.removeItem('fpt_activity')
}