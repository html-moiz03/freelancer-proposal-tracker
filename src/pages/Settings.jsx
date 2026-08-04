import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { useApp } from '../context/AppContext'

const ACCENT_COLORS = [
  { name: 'Indigo', value: '#4F46E5' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Blue', value: '#2563EB' },
  { name: 'Green', value: '#059669' },
  { name: 'Rose', value: '#E11D48' },
  { name: 'Orange', value: '#EA580C' },
]

function SectionTitle({ children, titleColor }) {
  return (
    <h3 className="text-base font-bold mb-4" style={{ color: titleColor }}>{children}</h3>
  )
}

function Label({ children, titleColor }) {
  return (
    <label className="text-sm font-medium block mb-1" style={{ color: titleColor }}>{children}</label>
  )
}

export default function Settings() {
  const { isDark, toggleTheme, updateAccent } = useTheme()
  const { showToast } = useToast()
  const { clients, proposals, followups, currency, setCurrency } = useApp()

  const [dateFormat, setDateFormat] = useState(localStorage.getItem('fpt_date_format') || 'YYYY-MM-DD')
  const [reminderDays, setReminderDays] = useState(localStorage.getItem('fpt_reminder_days') || '3')
  const [accentColor, setAccentColor] = useState(localStorage.getItem('fpt_accent') || '#4F46E5')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const card = { backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF', borderColor: isDark ? '#2a2a2a' : '#E9E9E7' }
  const titleColor = isDark ? '#ffffff' : '#37352F'
  const subColor = isDark ? '#94a3b8' : '#9B9A97'
  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: `1.5px solid ${isDark ? '#2a2a2a' : '#E9E9E7'}`,
    backgroundColor: isDark ? '#111111' : '#F7F6F3',
    color: titleColor, fontSize: '13px', outline: 'none',
    fontFamily: 'inherit'
  }

  const savePreferences = () => {
    localStorage.setItem('fpt_currency', currency)
    localStorage.setItem('fpt_date_format', dateFormat)
    localStorage.setItem('fpt_reminder_days', reminderDays)
    setCurrency(currency)
    showToast('Preferences saved!', 'success')
  }

  const saveAccent = (color) => {
    setAccentColor(color)
    updateAccent(color)
    showToast('Accent color updated!', 'success')
  }

  const exportJSON = () => {
    const data = { clients, proposals, followups, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'fpt-backup.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Data exported successfully!', 'success')
  }

  const importJSON = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (data.clients) localStorage.setItem('clients', JSON.stringify(data.clients))
        if (data.proposals) localStorage.setItem('proposals', JSON.stringify(data.proposals))
        if (data.followups) localStorage.setItem('followups', JSON.stringify(data.followups))
        showToast('Data imported! Refresh to see changes.', 'success')
      } catch {
        showToast('Invalid JSON file!', 'error')
      }
    }
    reader.readAsText(file)
  }

  const resetApp = () => {
    if (window.confirm('Are you sure? This will delete ALL your data permanently!')) {
      localStorage.removeItem('clients')
      localStorage.removeItem('proposals')
      localStorage.removeItem('followups')
      showToast('All data cleared!', 'error')
      window.location.reload()
    }
  }

  const changePassword = () => {
    const user = JSON.parse(localStorage.getItem('fpt_user') || '{}')
    if (oldPassword !== user.password) {
      showToast('Current password is incorrect!', 'error'); return
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters!', 'error'); return
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match!', 'error'); return
    }
    const updated = { ...user, password: newPassword }
    localStorage.setItem('fpt_user', JSON.stringify(updated))
    localStorage.setItem('fpt_session', JSON.stringify(updated))
    setOldPassword(''); setNewPassword(''); setConfirmPassword('')
    showToast('Password changed successfully!', 'success')
  }

  return (
    <div style={{ maxWidth: '680px' }}>
      <h2 className="text-2xl font-bold mb-6" style={{ color: titleColor }}>⚙️ Settings</h2>

      {/* Preferences */}
      <div className="rounded-xl p-6 border mb-4" style={card}>
        <SectionTitle titleColor={titleColor}>📋 Preferences</SectionTitle>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label titleColor={titleColor}>Currency</Label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={inputStyle}>
              <option value="PKR">PKR — Pakistani Rupee</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="AED">AED — UAE Dirham</option>
            </select>
          </div>
          <div>
            <Label titleColor={titleColor}>Date Format</Label>
            <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} style={inputStyle}>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            </select>
          </div>
          <div>
            <Label titleColor={titleColor}>Follow-up Reminder (days before)</Label>
            <select value={reminderDays} onChange={(e) => setReminderDays(e.target.value)} style={inputStyle}>
              <option value="1">1 day</option>
              <option value="2">2 days</option>
              <option value="3">3 days</option>
              <option value="5">5 days</option>
              <option value="7">7 days</option>
            </select>
          </div>
        </div>
        <button
          onClick={savePreferences}
          className="px-5 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: '#37352F', color: '#FFFFFF' }}
        >
          Save Preferences
        </button>
      </div>

      {/* Appearance */}
      <div className="rounded-xl p-6 border mb-4" style={card}>
        <SectionTitle titleColor={titleColor}>🎨 Appearance</SectionTitle>

        <div className="flex items-center justify-between mb-5 p-3 rounded-lg" style={{ backgroundColor: isDark ? '#111111' : '#F7F6F3' }}>
          <div>
            <p className="text-sm font-medium" style={{ color: titleColor }}>Dark Mode</p>
            <p className="text-xs" style={{ color: subColor }}>Switch between light and dark theme</p>
          </div>
          <div
            onClick={toggleTheme}
            style={{
              width: '44px', height: '24px', borderRadius: '99px',
              backgroundColor: isDark ? '#4F46E5' : '#E9E9E7',
              position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s'
            }}
          >
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%',
              backgroundColor: 'white', position: 'absolute', top: '3px',
              left: isDark ? '23px' : '3px', transition: 'left 0.2s'
            }} />
          </div>
        </div>

        <Label titleColor={titleColor}>Accent Color</Label>
        <div className="flex gap-3 flex-wrap mt-2">
          {ACCENT_COLORS.map((color) => (
            <div
              key={color.value}
              onClick={() => saveAccent(color.value)}
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: color.value, cursor: 'pointer',
                border: accentColor === color.value ? '3px solid #37352F' : '3px solid transparent',
                boxShadow: accentColor === color.value ? '0 0 0 2px white, 0 0 0 4px ' + color.value : 'none',
                transition: 'all 0.2s'
              }}
              title={color.name}
            />
          ))}
        </div>
        <p className="text-xs mt-2" style={{ color: subColor }}>Note: Accent color applies on next page reload</p>
      </div>

      {/* Data Management */}
      <div className="rounded-xl p-6 border mb-4" style={card}>
        <SectionTitle titleColor={titleColor}>💾 Data Management</SectionTitle>
        <div className="flex gap-4 mb-4">
          {[
            { label: 'Clients', value: clients.length },
            { label: 'Proposals', value: proposals.length },
            { label: 'Follow-ups', value: followups.length },
          ].map((s) => (
            <div key={s.label} className="text-center px-4 py-2 rounded-lg" style={{ backgroundColor: isDark ? '#111111' : '#F7F6F3' }}>
              <p className="text-lg font-bold" style={{ color: titleColor }}>{s.value}</p>
              <p className="text-xs" style={{ color: subColor }}>{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={exportJSON}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border w-fit"
            style={{ backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF', borderColor: isDark ? '#2a2a2a' : '#E9E9E7', color: titleColor }}
          >
            📤 Export All Data as JSON
          </button>
          <label
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border w-fit cursor-pointer"
            style={{ backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF', borderColor: isDark ? '#2a2a2a' : '#E9E9E7', color: titleColor }}
          >
            📥 Import Data from JSON
            <input type="file" accept=".json" onChange={importJSON} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-xl p-6 border mb-4" style={card}>
        <SectionTitle titleColor={titleColor}>🔒 Security</SectionTitle>
        <div className="flex flex-col gap-3">
          <div>
            <Label titleColor={titleColor}>Current Password</Label>
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Enter current password" style={inputStyle} />
          </div>
          <div>
            <Label titleColor={titleColor}>New Password</Label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" style={inputStyle} />
          </div>
          <div>
            <Label titleColor={titleColor}>Confirm New Password</Label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" style={inputStyle} />
          </div>
          <button
            onClick={changePassword}
            className="px-5 py-2 rounded-lg text-sm font-medium w-fit"
            style={{ backgroundColor: '#37352F', color: '#FFFFFF' }}
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl p-6 border" style={{ backgroundColor: isDark ? '#1a0000' : '#FFF5F5', borderColor: '#FECACA' }}>
        <SectionTitle titleColor="#991B1B">⚠️ Danger Zone</SectionTitle>
        <p className="text-sm mb-4" style={{ color: subColor }}>This will permanently delete all your clients, proposals, and follow-ups. This action cannot be undone.</p>
        <button
          onClick={resetApp}
          className="px-5 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}
        >
          🗑️ Reset All Data
        </button>
      </div>
    </div>
  )
}