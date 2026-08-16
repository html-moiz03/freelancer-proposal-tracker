export function exportClientsCSV(clients) {
  const headers = ['Name', 'Email', 'Phone', 'Company']
  const rows = clients.map((c) => [
    c.name, c.email, c.phone, c.company || ''
  ])

  const csv = [headers, ...rows]
    .map((row) => row.map((val) => `"${val}"`).join(','))
    .join('\n')

  downloadCSV(csv, 'clients.csv')
}

export function exportProposalsCSV(proposals, clients, currency = 'PKR') {
  const headers = ['Title', 'Client', `Amount (${currency})`, 'Deadline', 'Status', 'Notes']
  const rows = proposals.map((p) => {
    const client = clients.find((c) => c.id === Number(p.clientId))
    return [
      p.title,
      client ? client.name : 'Unknown',
      p.amount,
      p.deadline,
      p.status,
      p.notes || ''
    ]
  })

  const csv = [headers, ...rows]
    .map((row) => row.map((val) => `"${val}"`).join(','))
    .join('\n')

  downloadCSV(csv, 'proposals.csv')
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}