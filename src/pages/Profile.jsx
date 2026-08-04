import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function Profile() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const session = JSON.parse(localStorage.getItem('fpt_session') || '{}')
  const [name, setName] = useState(session.name || '')
  const [saved, setSaved] = useState(false)

  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'FP'

  const card = { backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF', borderColor: isDark ? '#2a2a2a' : '#E9E9E7' }
  const titleColor = isDark ? '#ffffff' : '#37352F'
  const subColor = isDark ? '#94a3b8' : '#9B9A97'
  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: `1.5px solid ${isDark ? '#2a2a2a' : '#E9E9E7'}`,
    backgroundColor: isDark ? '#111111' : '#F7F6F3',
    fontSize: '14px', color: titleColor, outline: 'none',
    fontFamily: 'inherit'
  }

  const handleSave = () => {
    const updated = { ...session, name }
    localStorage.setItem('fpt_session', JSON.stringify(updated))
    localStorage.setItem('fpt_user', JSON.stringify(updated))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = () => {
    localStorage.removeItem('fpt_session')
    navigate('/')
  }

  return (
    <div style={{ maxWidth: '600px' }}>
      <h2 className="text-2xl font-bold mb-6" style={{ color: titleColor }}>Profile</h2>

      {/* Avatar + Info */}
      <div className="rounded-xl p-6 border mb-4" style={card}>
        <div className="flex items-center gap-5 mb-6">
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #4F46E5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: '800', color: 'white', flexShrink: 0
          }}>
            {initials}
          </div>
          <div>
            <h3 className="font-bold text-lg" style={{ color: titleColor }}>{session.name || 'User'}</h3>
            <p className="text-sm" style={{ color: subColor }}>{session.email || ''}</p>
            <span style={{
              display: 'inline-block', marginTop: '6px',
              fontSize: '11px', fontWeight: '600', padding: '2px 10px',
              borderRadius: '20px', backgroundColor: '#D1FAE5', color: '#065F46'
            }}>Free Plan</span>
          </div>
        </div>

        {/* Editable Name */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-1 block" style={{ color: titleColor }}>Full Name</label>
          <input
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Email (read only) */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-1 block" style={{ color: titleColor }}>Email Address</label>
          <input
            style={{ ...inputStyle, color: subColor, cursor: 'not-allowed' }}
            value={session.email || ''}
            readOnly
          />
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ backgroundColor: saved ? '#D1FAE5' : '#37352F', color: saved ? '#065F46' : '#FFFFFF' }}
        >
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Linked Accounts */}
      <div className="rounded-xl p-6 border mb-4" style={card}>
        <h3 className="font-semibold mb-4" style={{ color: titleColor }}>Linked Accounts</h3>
        {[
          { name: 'GitHub', icon: '🐙', handle: 'github.com/html-moiz03', connected: true },
          { name: 'LinkedIn', icon: '💼', handle: 'linkedin.com/in/malik-abdulmoiz', connected: true },
          { name: 'Google', icon: '🔵', handle: 'Not connected', connected: false },
        ].map((acc) => (
          <div key={acc.name} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: isDark ? '#2a2a2a' : '#E9E9E7' }}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{acc.icon}</span>
              <div>
                <p className="text-sm font-medium" style={{ color: titleColor }}>{acc.name}</p>
                <p className="text-xs" style={{ color: subColor }}>{acc.handle}</p>
              </div>
            </div>
            <span style={{
              fontSize: '11px', fontWeight: '600', padding: '2px 10px', borderRadius: '20px',
              backgroundColor: acc.connected ? '#D1FAE5' : (isDark ? '#2a2a2a' : '#F1F0EE'),
              color: acc.connected ? '#065F46' : subColor
            }}>
              {acc.connected ? 'Connected' : 'Connect'}
            </span>
          </div>
        ))}
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl p-6 border" style={{ backgroundColor: isDark ? '#1a0000' : '#FFF5F5', borderColor: '#FECACA' }}>
        <h3 className="font-semibold mb-1" style={{ color: '#991B1B' }}>Danger Zone</h3>
        <p className="text-sm mb-4" style={{ color: subColor }}>This will log you out of your account.</p>
        <button
          onClick={handleLogout}
          className="px-5 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}