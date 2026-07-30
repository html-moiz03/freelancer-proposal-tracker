import jsPDF from 'jspdf'

export function exportProposalPDF(proposal, clientName) {
  const doc = new jsPDF()

  // Header background
  doc.setFillColor(55, 53, 47)
  doc.rect(0, 0, 210, 40, 'F')

  // Title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('Freelancer Proposal Tracker', 14, 18)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Official Proposal Document', 14, 28)

  // Date
  doc.setFontSize(9)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 36)

  // Reset color
  doc.setTextColor(55, 53, 47)

  // Proposal title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(proposal.title, 14, 58)

  // Status badge
  const statusColors = {
    Draft: [107, 107, 107],
    Sent: [29, 78, 216],
    'In Review': [217, 119, 6],
    Won: [6, 95, 70],
    Lost: [153, 27, 27],
  }
  const sc = statusColors[proposal.status] || [0, 0, 0]
  doc.setFillColor(...sc)
  doc.roundedRect(14, 63, 35, 8, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(proposal.status, 16, 68.5)

  // Divider
  doc.setDrawColor(233, 233, 231)
  doc.setLineWidth(0.5)
  doc.line(14, 78, 196, 78)

  // Details section
  doc.setTextColor(55, 53, 47)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Proposal Details', 14, 90)

  const details = [
    ['Client', clientName],
    ['Amount', `PKR ${Number(proposal.amount).toLocaleString()}`],
    ['Deadline', proposal.deadline],
    ['Status', proposal.status],
  ]

  let y = 102
  details.forEach(([label, value]) => {
    doc.setFillColor(247, 246, 243)
    doc.roundedRect(14, y - 6, 182, 12, 2, 2, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(107, 107, 107)
    doc.text(label, 18, y + 1)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(55, 53, 47)
    doc.text(value, 80, y + 1)
    y += 16
  })

  // Notes
  if (proposal.notes) {
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(55, 53, 47)
    doc.text('Notes', 14, y + 10)
    doc.setFillColor(247, 246, 243)
    doc.roundedRect(14, y + 14, 182, 20, 2, 2, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(proposal.notes, 18, y + 24)
  }

  // Footer
  doc.setFillColor(55, 53, 47)
  doc.rect(0, 272, 210, 25, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Freelancer Proposal Tracker — freelancer-proposal-tracker.netlify.app', 14, 283)
  doc.text(`© ${new Date().getFullYear()} All rights reserved.`, 14, 290)

  // Save
  doc.save(`proposal-${proposal.title.replace(/\s+/g, '-').toLowerCase()}.pdf`)
}