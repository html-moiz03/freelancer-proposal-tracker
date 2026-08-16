import jsPDF from 'jspdf'
import { scopedKey, getSession } from './accountStorage'

export function generateMonthlyReport(clients, proposals, followups) {
  const doc = new jsPDF()
  const now = new Date()
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const currency = localStorage.getItem(scopedKey('fpt_currency')) || 'PKR'
  const session = getSession() || {}
  const userName = session.name || 'Freelancer'

  // Filter this month's data
  const thisMonth = proposals.filter(p => {
    const d = new Date(p.deadline || p.createdAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const wonThisMonth = thisMonth.filter(p => p.status === 'Won')
  const lostThisMonth = thisMonth.filter(p => p.status === 'Lost')
  const inReviewThisMonth = thisMonth.filter(p => p.status === 'In Review')
  const totalRevenue = wonThisMonth.reduce((sum, p) => sum + Number(p.amount), 0)
  const winRate = thisMonth.length > 0 ? Math.round((wonThisMonth.length / thisMonth.length) * 100) : 0
  const overdueFollowups = followups.filter(f => f.date < now.toISOString().split('T')[0])

  const W = 210

  // Header
  doc.setFillColor(31, 27, 75)
  doc.rect(0, 0, W, 45, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('Monthly Performance Report', 14, 18)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(196, 181, 253)
  doc.text(`${monthName} · ${userName}`, 14, 28)
  doc.text(`Generated: ${now.toLocaleDateString()}`, 14, 37)

  // Summary Cards
  let y = 55
  doc.setTextColor(31, 27, 75)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Monthly Summary', 14, y)
  y += 8

  const summaryCards = [
    { label: 'Total Proposals', value: thisMonth.length, color: [147, 51, 234] },
    { label: 'Won', value: wonThisMonth.length, color: [16, 185, 129] },
    { label: 'Lost', value: lostThisMonth.length, color: [239, 68, 68] },
    { label: 'In Review', value: inReviewThisMonth.length, color: [245, 158, 11] },
  ]

  const cardW = (W - 28 - 9) / 4
  summaryCards.forEach((card, i) => {
    const x = 14 + i * (cardW + 3)
    doc.setFillColor(249, 250, 251)
    doc.roundedRect(x, y, cardW, 24, 3, 3, 'F')
    doc.setFillColor(...card.color)
    doc.roundedRect(x, y, 3, 24, 1, 1, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(...card.color)
    doc.text(String(card.value), x + 8, y + 14)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text(card.label, x + 8, y + 21)
  })

  y += 32

  // Revenue & Win Rate
  doc.setFillColor(237, 233, 254)
  doc.roundedRect(14, y, 86, 20, 3, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(109, 40, 217)
  doc.text(`${currency} ${totalRevenue.toLocaleString()}`, 20, y + 13)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.text('Total Revenue Won', 20, y + 19)

  doc.setFillColor(209, 250, 229)
  doc.roundedRect(106, y, 86, 20, 3, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(6, 95, 70)
  doc.text(`${winRate}%`, 112, y + 13)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.text('Win Rate This Month', 112, y + 19)

  y += 28

  // Won Proposals
  if (wonThisMonth.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(31, 27, 75)
    doc.text('Won Proposals', 14, y)
    y += 6

    doc.setFillColor(243, 244, 246)
    doc.rect(14, y, W - 28, 7, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text('PROPOSAL', 18, y + 5)
    doc.text('CLIENT', 90, y + 5)
    doc.text('AMOUNT', 150, y + 5)
    y += 10

    wonThisMonth.forEach((p) => {
      const client = clients.find(c => c.id === Number(p.clientId))
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(55, 53, 47)
      doc.text(p.title.slice(0, 35), 18, y)
      doc.text(client ? client.name.slice(0, 20) : 'Unknown', 90, y)
      doc.setTextColor(16, 185, 129)
      doc.setFont('helvetica', 'bold')
      doc.text(`${currency} ${Number(p.amount).toLocaleString()}`, 150, y)
      doc.setDrawColor(233, 233, 231)
      doc.line(14, y + 2, W - 14, y + 2)
      y += 10
    })
  }

  y += 5

  // All Proposals Table
  if (thisMonth.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(31, 27, 75)
    doc.text('All Proposals This Month', 14, y)
    y += 6

    doc.setFillColor(243, 244, 246)
    doc.rect(14, y, W - 28, 7, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text('TITLE', 18, y + 5)
    doc.text('STATUS', 110, y + 5)
    doc.text('AMOUNT', 150, y + 5)
    doc.text('DEADLINE', 175, y + 5)
    y += 10

    const statusColors = {
      Draft: [107, 114, 128],
      Sent: [29, 78, 216],
      'In Review': [217, 119, 6],
      Won: [16, 185, 129],
      Lost: [239, 68, 68],
    }

    thisMonth.slice(0, 10).forEach((p) => {
      if (y > 260) {
        doc.addPage()
        y = 20
      }
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(55, 53, 47)
      doc.text(p.title.slice(0, 30), 18, y)
      doc.setTextColor(...(statusColors[p.status] || [0, 0, 0]))
      doc.setFont('helvetica', 'bold')
      doc.text(p.status, 110, y)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(55, 53, 47)
      doc.text(`${currency} ${Number(p.amount).toLocaleString()}`, 150, y)
      doc.text(p.deadline || '-', 175, y)
      doc.setDrawColor(233, 233, 231)
      doc.line(14, y + 2, W - 14, y + 2)
      y += 10
    })
  }

  y += 5

  // Stats Summary
  if (y > 230) { doc.addPage(); y = 20 }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(31, 27, 75)
  doc.text('Overall Stats', 14, y)
  y += 8

  const overallStats = [
    ['Total Clients', clients.length],
    ['Total Proposals (All Time)', proposals.length],
    ['Total Won (All Time)', proposals.filter(p => p.status === 'Won').length],
    ['Total Revenue (All Time)', `${currency} ${proposals.filter(p => p.status === 'Won').reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString()}`],
    ['Overdue Follow-ups', overdueFollowups.length],
    ['Overall Win Rate', `${proposals.length > 0 ? Math.round((proposals.filter(p => p.status === 'Won').length / proposals.length) * 100) : 0}%`],
  ]

  overallStats.forEach(([label, value]) => {
    doc.setFillColor(249, 250, 251)
    doc.roundedRect(14, y - 5, W - 28, 12, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(107, 114, 128)
    doc.text(label, 18, y + 2)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(31, 27, 75)
    doc.text(String(value), W - 20, y + 2, { align: 'right' })
    y += 14
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFillColor(31, 27, 75)
    doc.rect(0, 282, W, 15, 'F')
    doc.setTextColor(196, 181, 253)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text('Freelancer Proposal Tracker — Monthly Performance Report', 14, 290)
    doc.text(`Page ${i} of ${pageCount}`, W - 14, 290, { align: 'right' })
  }

  doc.save(`monthly-report-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.pdf`)
}