import jsPDF from 'jspdf'
import { scopedKey, getSession } from './accountStorage'

export function generateInvoice(proposal, client) {
  const doc = new jsPDF()
  const currency = localStorage.getItem(scopedKey('fpt_currency')) || 'PKR'
  const session = getSession() || {}
  const myName = session.name || 'Freelancer'
  const now = new Date()
  const invoiceNum = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 9000) + 1000)}`
  const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
  const W = 210

  // Header
  doc.setFillColor(31, 27, 75)
  doc.rect(0, 0, W, 50, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.text('INVOICE', 14, 22)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(196, 181, 253)
  doc.text(invoiceNum, 14, 33)
  doc.text(`Date: ${now.toLocaleDateString()}`, 14, 42)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(myName, W - 14, 22, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(196, 181, 253)
  doc.text('Freelancer Proposal Tracker', W - 14, 32, { align: 'right' })
  doc.text('freelancer-proposal-tracker.netlify.app', W - 14, 41, { align: 'right' })

  // Bill To
  let y = 65
  doc.setFillColor(243, 244, 246)
  doc.roundedRect(14, y - 6, 85, 40, 3, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(107, 114, 128)
  doc.text('BILL TO', 20, y)
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(31, 27, 75)
  doc.text(client?.name || 'Client', 20, y)
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(107, 114, 128)
  if (client?.email) { doc.text(client.email, 20, y); y += 6 }
  if (client?.phone) { doc.text(client.phone, 20, y); y += 6 }
  if (client?.company) { doc.text(client.company, 20, y) }

  // Invoice Details
  y = 65
  doc.setFillColor(237, 233, 254)
  doc.roundedRect(110, y - 6, 86, 40, 3, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(109, 40, 217)
  doc.text('INVOICE DETAILS', 116, y)
  y += 8

  const details = [
    ['Invoice No:', invoiceNum],
    ['Issue Date:', now.toLocaleDateString()],
    ['Due Date:', dueDate],
    ['Status:', 'Unpaid'],
  ]
  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text(label, 116, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(31, 27, 75)
    doc.text(value, 190, y, { align: 'right' })
    y += 7
  })

  // Items Table
  y = 120
  doc.setFillColor(31, 27, 75)
  doc.rect(14, y, W - 28, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('DESCRIPTION', 20, y + 7)
  doc.text('QTY', 130, y + 7)
  doc.text('RATE', 155, y + 7)
  doc.text('AMOUNT', W - 18, y + 7, { align: 'right' })
  y += 15

  // Item Row
  doc.setFillColor(249, 250, 251)
  doc.rect(14, y - 5, W - 28, 15, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(31, 27, 75)
  doc.text(proposal.title, 20, y + 3)
  doc.setFontSize(9)
  doc.setTextColor(107, 114, 128)
  if (proposal.notes) doc.text(proposal.notes.slice(0, 60), 20, y + 9)
  doc.setTextColor(31, 27, 75)
  doc.text('1', 133, y + 3)
  doc.text(`${currency} ${Number(proposal.amount).toLocaleString()}`, 158, y + 3)
  doc.setFont('helvetica', 'bold')
  doc.text(`${currency} ${Number(proposal.amount).toLocaleString()}`, W - 18, y + 3, { align: 'right' })
  y += 20

  // Totals
  doc.setDrawColor(233, 233, 231)
  doc.line(14, y, W - 14, y)
  y += 10

  const subtotal = Number(proposal.amount)
  const tax = 0
  const total = subtotal + tax

  const totals = [
    ['Subtotal:', `${currency} ${subtotal.toLocaleString()}`],
    ['Tax (0%):', `${currency} 0`],
  ]
  totals.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    doc.text(label, W - 80, y)
    doc.setTextColor(31, 27, 75)
    doc.text(value, W - 18, y, { align: 'right' })
    y += 10
  })

  // Total Box
  doc.setFillColor(31, 27, 75)
  doc.roundedRect(W - 90, y - 5, 76, 16, 3, 3, 'F')
  doc.setTextColor(196, 181, 253)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('TOTAL DUE:', W - 85, y + 6)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.text(`${currency} ${total.toLocaleString()}`, W - 18, y + 6, { align: 'right' })
  y += 25

  // Payment Terms
  doc.setFillColor(243, 244, 246)
  doc.roundedRect(14, y, W - 28, 30, 3, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(31, 27, 75)
  doc.text('Payment Terms', 20, y + 8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(107, 114, 128)
  doc.text('Payment is due within 7 days of invoice date.', 20, y + 16)
  doc.text('Please include the invoice number in your payment reference.', 20, y + 23)

  // Footer
  doc.setFillColor(31, 27, 75)
  doc.rect(0, 272, W, 25, 'F')
  doc.setTextColor(196, 181, 253)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Thank you for your business!', W / 2, 282, { align: 'center' })
  doc.text('Freelancer Proposal Tracker — freelancer-proposal-tracker.netlify.app', W / 2, 290, { align: 'center' })

  doc.save(`invoice-${invoiceNum}.pdf`)
}