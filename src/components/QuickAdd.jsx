import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { useTheme } from '../context/ThemeContext'

export default function QuickAdd() {
  const { clients, addClient, addProposal } = useApp()
  const { showToast } = useToast()
  const { isDark, accent } = useTheme()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState(null) // 'client' or 'proposal'
  const [form, setForm] = useState({})
  const [errors, setErrors] = useState({})

  const titleColor = isDark ? '#ffffff' : '#37352F'
  const subColor = isDark ? '#94a3b8' : '#9B9A97'
  const cardBg = isDark ? '#1a1a1a' : '#FFFFFF'
  const borderColor = isDark ? '#2a2a2a' : '#E9E9E7'
  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: `1.5px solid ${borderColor}`,
    backgroundColor: isDark ? '#111111' : '#F7F6F3',
    color: titleColor, fontSize: '13px', outline: 'none',
    fontFamily: 'inherit', marginBottom: '8px'
  }

  const handleSubmit = () => {
    if (mode === 'client') {
      if (!form.name?.trim()) { setErrors({ name: 'Name required' }); return }
      if (!form.email?.trim()) { setErrors({ email: 'Email required' }); return }
      if (!form.phone?.trim()) { setErrors({ phone: 'Phone required' }); return }
      addClient({ name: form.name, email: form.email, phone: form.phone, company: form.company || '' })
      showToast('Client added quickly!', 'success')
    } else {
      if (!form.title?.trim()) { setErrors({ title: 'Title required' }); return }
      if (!form.clientId) { setErrors({ clientId: 'Select a client' }); return }
      addProposal({ title: form.title, clientId: form.clientId, amount: form.amount || 0, deadline: form.deadline || '', status: 'Draft', notes: '' })
      showToast('Proposal added quickly!', 'success')
    }
    setForm({})
    setErrors({})
    setMode(null)
    setOpen(false)
  }

  return (
    <>
      {/* Overlay */}
      {open && (
        <div onClick={() => { setOpen(false); setMode(null); setForm({}); setErrors({}) }}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 994 }}
        />
      )}

      {/* Modal */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '80px', right: '24px', zIndex: 995,
          width: '300px', backgroundColor: cardBg,
          borderRadius: '16px', border: `1px solid ${borderColor}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)', overflow: 'hidden'
        }}>
          {!mode ? (
            <>
              <div style={{ padding: '16px', borderBottom: `1px solid ${borderColor}` }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: titleColor }}>⚡ Quick Add</p>
                <p style={{ fontSize: '12px', color: subColor, marginTop: '2px' }}>What do you want to add?</p>
              </div>
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={() => setMode('client')} style={{
                  padding: '12px', borderRadius: '10px', border: `1px solid ${borderColor}`,
                  backgroundColor: isDark ? '#111111' : '#F7F6F3', cursor: 'pointer',
                  textAlign: 'left', color: titleColor, fontSize: '13px', fontWeight: '600'
                }}>
                  👤 Add Client
                </button>
                <button onClick={() => setMode('proposal')} style={{
                  padding: '12px', borderRadius: '10px', border: `1px solid ${borderColor}`,
                  backgroundColor: isDark ? '#111111' : '#F7F6F3', cursor: 'pointer',
                  textAlign: 'left', color: titleColor, fontSize: '13px', fontWeight: '600'
                }}>
                  📄 Add Proposal
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: titleColor }}>
                  {mode === 'client' ? '👤 Quick Add Client' : '📄 Quick Add Proposal'}
                </p>
                <button onClick={() => setMode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: subColor, fontSize: '18px' }}>←</button>
              </div>
              <div style={{ padding: '14px 16px' }}>
                {mode === 'client' ? (
                  <>
                    <input style={inputStyle} placeholder="Full Name *" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
                    {errors.name && <p style={{ fontSize: '11px', color: '#EF4444', marginBottom: '6px' }}>{errors.name}</p>}
                    <input style={inputStyle} placeholder="Email *" type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
                    {errors.email && <p style={{ fontSize: '11px', color: '#EF4444', marginBottom: '6px' }}>{errors.email}</p>}
                    <input style={inputStyle} placeholder="Phone *" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    {errors.phone && <p style={{ fontSize: '11px', color: '#EF4444', marginBottom: '6px' }}>{errors.phone}</p>}
                    <input style={inputStyle} placeholder="Company (optional)" value={form.company || ''} onChange={e => setForm({ ...form, company: e.target.value })} />
                  </>
                ) : (
                  <>
                    <input style={inputStyle} placeholder="Proposal Title *" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} />
                    {errors.title && <p style={{ fontSize: '11px', color: '#EF4444', marginBottom: '6px' }}>{errors.title}</p>}
                    <select style={inputStyle} value={form.clientId || ''} onChange={e => setForm({ ...form, clientId: e.target.value })}>
                      <option value="">Select Client *</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {errors.clientId && <p style={{ fontSize: '11px', color: '#EF4444', marginBottom: '6px' }}>{errors.clientId}</p>}
                    <input style={inputStyle} placeholder="Amount (optional)" type="number" value={form.amount || ''} onChange={e => setForm({ ...form, amount: e.target.value })} />
                    <input style={{ ...inputStyle, color: form.deadline ? titleColor : subColor }} type="date" value={form.deadline || ''} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                  </>
                )}
                <button onClick={handleSubmit} style={{
                  width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
                  backgroundColor: accent, color: 'white', fontSize: '13px',
                  fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit'
                }}>
                  Save
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 996,
          width: '52px', height: '52px', borderRadius: '50%',
          backgroundColor: accent, color: 'white', border: 'none',
          fontSize: '24px', cursor: 'pointer',
          boxShadow: `0 4px 20px ${accent}60`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s, box-shadow 0.2s',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)'
        }}
      >
        +
      </button>
    </>
  )
}