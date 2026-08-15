import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { useApp } from '../context/AppContext'
import { requestNotificationPermission, checkAndNotify } from '../utils/pushNotifications'
import { FaGithub, FaLinkedin, FaGoogle } from 'react-icons/fa'

// Top-level helper keeps the impure Date access out of the component/handler body
function nowISO() {
  return new Date().toISOString()
}

const NAV_ITEMS = [
  { key: 'Profile', icon: '👤' },
  { key: 'Preferences', icon: '⚙️' },
  { key: 'Notifications', icon: '🔔' },
  { key: 'Security', icon: '🔒' },
  { key: 'Billing', icon: '💳' },
  { key: 'Data & Export', icon: '💾' },
  { key: 'Integrations', icon: '🔗' },
  { key: 'Team (Pro)', icon: '👥' },
]

const ACCENT_COLORS = [
  { name: 'Indigo', value: '#4F46E5' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Blue', value: '#2563EB' },
  { name: 'Green', value: '#059669' },
  { name: 'Rose', value: '#E11D48' },
  { name: 'Orange', value: '#EA580C' },
]

const TIMEZONES = ['(GMT-05:00) Asia/Karachi', '(GMT+00:00) UTC', '(GMT-05:00) America/New_York', '(GMT+01:00) Europe/London', '(GMT+04:00) Asia/Dubai']

function Toggle({ checked, onChange, isDark, accent }) {
  return (
    <div onClick={onChange} style={{
      width: '40px', height: '22px', borderRadius: '99px',
      backgroundColor: checked ? accent : (isDark ? '#2a2a3e' : '#E5E7EB'),
      position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s', flexShrink: 0
    }}>
      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: '3px', left: checked ? '21px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </div>
  )
}

// Estimate the app's own footprint in localStorage (not the whole browser quota)
function estimateStorageBytes() {
  const keys = ['clients', 'proposals', 'followups', 'fpt_templates', 'fpt_communications', 'fpt_events', 'fpt_activity']
  return keys.reduce((sum, k) => sum + (localStorage.getItem(k)?.length || 0), 0)
}

export default function Settings() {
  const { isDark, toggleTheme, updateAccent, accent, compactMode, toggleCompactMode, animations, toggleAnimations } = useTheme()
  const { showToast } = useToast()
  const { clients, proposals, followups, setCurrency } = useApp()
  const navigate = useNavigate()

  const session = JSON.parse(localStorage.getItem('fpt_session') || '{}')

  const [tab, setTab] = useState('Profile')
  const [name, setName] = useState(session.name || '')
  const [bio, setBio] = useState(localStorage.getItem('fpt_bio') || '')
  const [timezone, setTimezone] = useState(localStorage.getItem('fpt_timezone') || TIMEZONES[0])
  const [customImage, setCustomImage] = useState(() => localStorage.getItem('fpt_settings_photo') || '')
  const fileRef = useRef(null)

  const [currencyState, setCurrencyState] = useState(localStorage.getItem('fpt_currency') || 'PKR')
  const [dateFormat, setDateFormat] = useState(localStorage.getItem('fpt_date_format') || 'YYYY-MM-DD')
  const [timeFormat, setTimeFormat] = useState(localStorage.getItem('fpt_time_format') || '12h')
  const [language, setLanguage] = useState(localStorage.getItem('fpt_language') || 'English')

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [notifEnabled, setNotifEnabled] = useState(Notification.permission === 'granted')

  const cardBg = isDark ? '#111118' : '#ffffff'
  const border = isDark ? '#1e1e2e' : '#f0f0f0'
  const titleColor = isDark ? '#ffffff' : '#111827'
  const subColor = isDark ? '#64748b' : '#6b7280'
  const inputBg = isDark ? '#1e1e2e' : '#f9fafb'
  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: inputBg, color: titleColor, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }
  const labelStyle = { fontSize: '12px', fontWeight: '600', color: titleColor, display: 'block', marginBottom: '6px' }
  const card = { backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '12px' }

  const initials = name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'FP'

  const saveProfile = () => {
    const updated = { ...session, name }
    localStorage.setItem('fpt_session', JSON.stringify(updated))
    localStorage.setItem('fpt_user', JSON.stringify(updated))
    localStorage.setItem('fpt_bio', bio)
    localStorage.setItem('fpt_timezone', timezone)
    showToast('Profile saved!', 'success')
  }

  const savePreferences = () => {
    localStorage.setItem('fpt_currency', currencyState)
    localStorage.setItem('fpt_date_format', dateFormat)
    localStorage.setItem('fpt_time_format', timeFormat)
    localStorage.setItem('fpt_language', language)
    setCurrency(currencyState)
    showToast('Preferences saved!', 'success')
  }

  const saveAccent = (color) => {
    updateAccent(color)
    showToast('Accent color updated!', 'success')
  }

  const changePassword = () => {
    const user = JSON.parse(localStorage.getItem('fpt_user') || '{}')
    if (oldPassword !== user.password) { showToast('Current password is incorrect!', 'error'); return }
    if (newPassword.length < 6) { showToast('New password must be at least 6 characters!', 'error'); return }
    if (newPassword !== confirmPassword) { showToast('Passwords do not match!', 'error'); return }
    const updated = { ...user, password: newPassword }
    localStorage.setItem('fpt_user', JSON.stringify(updated))
    localStorage.setItem('fpt_session', JSON.stringify(updated))
    setOldPassword(''); setNewPassword(''); setConfirmPassword('')
    showToast('Password changed successfully!', 'success')
  }

  const exportJSON = () => {
    const data = { clients, proposals, followups, exportedAt: nowISO() }
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

  const deleteAccount = () => {
    if (window.confirm('This permanently deletes your account and all data. Continue?')) {
      localStorage.clear()
      navigate('/')
    }
  }

  const storageBytes = estimateStorageBytes()
  const storageMB = (storageBytes / (1024 * 1024)).toFixed(2)
  const storageQuotaMB = 500
  const storagePct = Math.min(100, Math.max(1, (storageBytes / (1024 * 1024) / storageQuotaMB) * 100))
  const proposalsLimit = 50

  return (
    <div style={{ maxWidth: '1400px' }}>

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: titleColor, margin: 0 }}>Settings</h2>
        <p style={{ fontSize: '13px', color: subColor, marginTop: '4px' }}>Manage your account and application preferences.</p>
      </div>

      {/* Main grid: side nav / content / account summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr 260px', gap: '20px', alignItems: 'start', marginBottom: '24px' }}>

        {/* Side nav */}
        <div style={{ ...card, padding: '8px' }}>
          {NAV_ITEMS.map((item) => (
            <button key={item.key} onClick={() => setTab(item.key)} style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
              padding: '9px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '12.5px', fontWeight: '600', fontFamily: 'inherit', textAlign: 'left', marginBottom: '2px',
              backgroundColor: tab === item.key ? (isDark ? accent + '22' : accent + '14') : 'transparent',
              color: tab === item.key ? accent : titleColor,
            }}>
              <span>{item.icon}</span> {item.key}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div style={{ ...card, padding: '22px' }}>
          {tab === 'Profile' && (
            <>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: titleColor, marginBottom: '18px' }}>Profile Information</h3>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = (ev) => { setCustomImage(ev.target.result); localStorage.setItem('fpt_settings_photo', ev.target.result) }
                  reader.readAsDataURL(file)
                }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: customImage ? 'none' : `linear-gradient(135deg, ${accent}, #7c3aed)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', fontWeight: '800', color: 'white', overflow: 'hidden', flexShrink: 0
                }}>
                  {customImage ? <img src={customImage} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                </div>
                <button onClick={() => fileRef.current.click()} style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: 'transparent', color: titleColor, fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Change Photo</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input style={{ ...inputStyle, color: subColor, cursor: 'not-allowed' }} value={session.email || ''} readOnly />
                </div>
                <div>
                  <label style={labelStyle}>Bio</label>
                  <textarea style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short line about what you do" />
                </div>
                <div>
                  <label style={labelStyle}>Timezone</label>
                  <select style={inputStyle} value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                    {TIMEZONES.map((tz) => (<option key={tz} value={tz}>{tz}</option>))}
                  </select>
                </div>
              </div>
              <button onClick={saveProfile} style={{ marginTop: '20px', padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: accent, color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Save Changes</button>
            </>
          )}

          {tab === 'Preferences' && (
            <>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: titleColor, marginBottom: '8px' }}>Preferences</h3>
              <p style={{ fontSize: '12px', color: subColor }}>Currency, date/time format, language, and appearance can be managed in the Preferences panel below.</p>
            </>
          )}

          {tab === 'Notifications' && (
            <>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: titleColor, marginBottom: '18px' }}>Push Notifications</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '10px', backgroundColor: inputBg, marginBottom: '14px' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: titleColor, margin: 0 }}>Browser Notifications</p>
                  <p style={{ fontSize: '12px', color: subColor, marginTop: '2px' }}>Get alerts for overdue follow-ups and expiring proposals</p>
                </div>
                <Toggle checked={notifEnabled} isDark={isDark} accent={accent} onChange={async () => {
                  const granted = await requestNotificationPermission()
                  setNotifEnabled(granted)
                  if (granted) { checkAndNotify(followups, proposals); showToast('Notifications enabled!', 'success') }
                  else showToast('Notifications blocked by browser!', 'error')
                }} />
              </div>
              {notifEnabled && (
                <button onClick={() => checkAndNotify(followups, proposals)} style={{ padding: '9px 16px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: 'transparent', color: titleColor, fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>🔔 Test Notification</button>
              )}
            </>
          )}

          {tab === 'Security' && (
            <>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: titleColor, marginBottom: '18px' }}>Security</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '360px' }}>
                <div>
                  <label style={labelStyle}>Current Password</label>
                  <input type="password" style={inputStyle} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Enter current password" />
                </div>
                <div>
                  <label style={labelStyle}>New Password</label>
                  <input type="password" style={inputStyle} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
                </div>
                <div>
                  <label style={labelStyle}>Confirm New Password</label>
                  <input type="password" style={inputStyle} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
                </div>
              </div>
              <button onClick={changePassword} style={{ marginTop: '16px', padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: accent, color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Change Password</button>
            </>
          )}

          {tab === 'Billing' && (
            <>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: titleColor, marginBottom: '18px' }}>Billing</h3>
              <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: inputBg, marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: titleColor, margin: 0 }}>Free Plan</p>
                  <p style={{ fontSize: '12px', color: subColor, marginTop: '2px' }}>Up to {proposalsLimit} tracked proposals</p>
                </div>
                <button onClick={() => showToast('Upgrade flow coming soon!', 'success')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: accent, color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Upgrade to Pro</button>
              </div>
              <p style={{ fontSize: '12px', color: subColor }}>No billing history yet — you're on the free plan.</p>
            </>
          )}

          {tab === 'Data & Export' && (
            <>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: titleColor, marginBottom: '14px' }}>Data Management</h3>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
                {[{ label: 'Clients', value: clients.length }, { label: 'Proposals', value: proposals.length }, { label: 'Follow-ups', value: followups.length }].map((s) => (
                  <div key={s.label} style={{ textAlign: 'center', padding: '10px 18px', borderRadius: '10px', backgroundColor: inputBg }}>
                    <p style={{ fontSize: '16px', fontWeight: '800', color: titleColor, margin: 0 }}>{s.value}</p>
                    <p style={{ fontSize: '11px', color: subColor, marginTop: '2px' }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <button onClick={exportJSON} style={{ padding: '9px 16px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: 'transparent', color: titleColor, fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>📤 Export All Data as JSON</button>
                <label style={{ padding: '9px 16px', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: 'transparent', color: titleColor, fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                  📥 Import Data from JSON
                  <input type="file" accept=".json" onChange={importJSON} style={{ display: 'none' }} />
                </label>
              </div>
              <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: isDark ? '#1a0000' : '#FFF5F5', border: '1px solid #FECACA' }}>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#991B1B', margin: 0 }}>⚠️ Danger Zone</p>
                <p style={{ fontSize: '12px', color: subColor, margin: '6px 0 12px' }}>This will permanently delete all your clients, proposals, and follow-ups.</p>
                <button onClick={resetApp} style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#EF4444', color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>🗑️ Reset All Data</button>
              </div>
            </>
          )}

          {tab === 'Integrations' && (
            <>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: titleColor, marginBottom: '18px' }}>Linked Accounts</h3>
              {[
                { name: 'GitHub', icon: <FaGithub size={18} />, handle: 'github.com/html-moiz03', connected: true },
                { name: 'LinkedIn', icon: <FaLinkedin size={18} color="#0A66C2" />, handle: 'linkedin.com/in/malik-abdul-moiz-zaheer-awan-6a9997259', connected: true },
                { name: 'Google', icon: <FaGoogle size={18} color="#EA4335" />, handle: 'Not connected', connected: false },
              ].map((acc) => (
                <div key={acc.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {acc.icon}
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: titleColor, margin: 0 }}>{acc.name}</p>
                      <p style={{ fontSize: '11px', color: subColor, margin: 0 }}>{acc.handle}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', backgroundColor: acc.connected ? '#D1FAE5' : inputBg, color: acc.connected ? '#065F46' : subColor }}>{acc.connected ? 'Connected' : 'Connect'}</span>
                </div>
              ))}
            </>
          )}

          {tab === 'Team (Pro)' && (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <p style={{ fontSize: '32px', marginBottom: '10px' }}>👥</p>
              <p style={{ fontSize: '14px', fontWeight: '700', color: titleColor }}>Team features are a Pro perk</p>
              <p style={{ fontSize: '12px', color: subColor, marginTop: '4px', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto' }}>Invite teammates, share proposals, and collaborate on the pipeline together.</p>
              <button onClick={() => showToast('Upgrade flow coming soon!', 'success')} style={{ marginTop: '14px', padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: accent, color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Upgrade to Pro</button>
            </div>
          )}
        </div>

        {/* Account Summary */}
        <div style={{ ...card, padding: '18px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '700', color: titleColor, marginBottom: '14px' }}>Account Summary</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <p style={{ fontSize: '11px', color: subColor, margin: 0 }}>Plan</p>
              <p style={{ fontSize: '13px', fontWeight: '700', color: titleColor, margin: '2px 0 0' }}>Free Plan</p>
            </div>
            <button onClick={() => setTab('Billing')} style={{ padding: '5px 12px', borderRadius: '7px', border: 'none', backgroundColor: accent, color: 'white', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Upgrade</button>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '11px', color: subColor, margin: 0 }}>Proposals Tracked</p>
            <p style={{ fontSize: '14px', fontWeight: '700', color: titleColor, margin: '2px 0 0' }}>{proposals.length} / {proposalsLimit}</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '11px', color: subColor, marginBottom: '6px' }}>Storage Used</p>
            <div style={{ backgroundColor: isDark ? '#1e1e2e' : '#f1f5f9', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${storagePct}%`, backgroundColor: '#10B981', borderRadius: '99px' }} />
            </div>
            <p style={{ fontSize: '11px', color: subColor, marginTop: '5px' }}>{storageMB} MB / {storageQuotaMB} MB</p>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <p style={{ fontSize: '11px', color: subColor, margin: 0 }}>Member Since</p>
            <p style={{ fontSize: '13px', fontWeight: '600', color: titleColor, margin: '2px 0 0' }}>{session.createdAt ? new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</p>
          </div>

          <button onClick={deleteAccount} style={{ background: 'none', border: 'none', padding: 0, color: '#EF4444', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Delete Account</button>
          <p style={{ fontSize: '11px', color: subColor, marginTop: '4px' }}>Permanently delete your account and all data.</p>
        </div>
      </div>

      {/* Preferences (always visible) */}
      <div style={{ ...card, padding: '22px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: titleColor, marginBottom: '16px' }}>Preferences</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '18px' }}>
          <div>
            <label style={labelStyle}>Currency</label>
            <select style={inputStyle} value={currencyState} onChange={(e) => setCurrencyState(e.target.value)}>
              <option value="PKR">PKR (Pakistani Rupee)</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="AED">AED — UAE Dirham</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Date Format</label>
            <select style={inputStyle} value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD MMM YYYY">DD MMM YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Time Format</label>
            <select style={inputStyle} value={timeFormat} onChange={(e) => setTimeFormat(e.target.value)}>
              <option value="12h">12 Hour (AM/PM)</option>
              <option value="24h">24 Hour</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Language</label>
            <select style={inputStyle} value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="English">English</option>
            </select>
          </div>
        </div>

        <button onClick={savePreferences} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: accent, color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '20px' }}>Save Preferences</button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', paddingTop: '18px', borderTop: `1px solid ${border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '600', color: titleColor, margin: 0 }}>Dark Mode</p>
              <p style={{ fontSize: '11px', color: subColor, margin: '1px 0 0' }}>Toggle dark mode</p>
            </div>
            <Toggle checked={isDark} isDark={isDark} accent={accent} onChange={toggleTheme} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '600', color: titleColor, margin: 0 }}>Compact Mode</p>
              <p style={{ fontSize: '11px', color: subColor, margin: '1px 0 0' }}>Show more content in less space</p>
            </div>
            <Toggle checked={compactMode} isDark={isDark} accent={accent} onChange={toggleCompactMode} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '600', color: titleColor, margin: 0 }}>Animations</p>
              <p style={{ fontSize: '11px', color: subColor, margin: '1px 0 0' }}>Enable UI animations</p>
            </div>
            <Toggle checked={animations} isDark={isDark} accent={accent} onChange={toggleAnimations} />
          </div>
        </div>

        <div style={{ marginTop: '18px', paddingTop: '18px', borderTop: `1px solid ${border}` }}>
          <label style={labelStyle}>Accent Color</label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {ACCENT_COLORS.map((color) => (
              <div key={color.value} onClick={() => saveAccent(color.value)} title={color.name} style={{
                width: '26px', height: '26px', borderRadius: '50%', backgroundColor: color.value, cursor: 'pointer',
                border: accent === color.value ? `2px solid ${titleColor}` : '2px solid transparent',
                boxShadow: accent === color.value ? `0 0 0 2px ${cardBg}, 0 0 0 4px ${color.value}` : 'none',
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
