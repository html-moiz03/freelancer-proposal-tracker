export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export function sendNotification(title, body, icon = '/fpt-logo.png') {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  new Notification(title, { body, icon })
}

export function checkAndNotify(followups, proposals) {
  const today = new Date().toISOString().split('T')[0]

  const overdueFollowups = followups.filter(f => f.date < today)
  const expiringProposals = proposals.filter(p => {
    if (p.status === 'Won' || p.status === 'Lost') return false
    const diff = Math.ceil((new Date(p.deadline) - new Date(today)) / (1000 * 60 * 60 * 24))
    return diff >= 0 && diff <= 1
  })

  if (overdueFollowups.length > 0) {
    sendNotification(
      '⚠️ Overdue Follow-ups!',
      `You have ${overdueFollowups.length} overdue follow-up${overdueFollowups.length > 1 ? 's' : ''} that need attention.`
    )
  }

  if (expiringProposals.length > 0) {
    sendNotification(
      '⏰ Proposal Deadline Alert!',
      `${expiringProposals.length} proposal${expiringProposals.length > 1 ? 's' : ''} due today or tomorrow!`
    )
  }
}