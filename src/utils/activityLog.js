import { scopedKey } from './accountStorage'

export function logActivity(action, details) {
  const key = scopedKey('fpt_activity')
  const logs = JSON.parse(localStorage.getItem(key) || '[]')
  const newLog = {
    id: Date.now(),
    action,
    details,
    timestamp: new Date().toISOString(),
  }
  logs.unshift(newLog)
  // Keep only last 50 activities
  if (logs.length > 50) logs.pop()
  localStorage.setItem(key, JSON.stringify(logs))
}

export function getLogs() {
  return JSON.parse(localStorage.getItem(scopedKey('fpt_activity')) || '[]')
}

export function clearLogs() {
  localStorage.removeItem(scopedKey('fpt_activity'))
}
