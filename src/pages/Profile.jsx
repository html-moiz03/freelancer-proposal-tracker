import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { FaGithub, FaLinkedin, FaGoogle } from 'react-icons/fa'
import { useRef } from 'react'

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

  const AVATARS = ['🧑‍💻', '👨‍💼', '👩‍💼', '🧑‍🎨', '👨‍🚀', '👩‍🚀', '🦸', '🧙']

  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    return localStorage.getItem('fpt_avatar') || ''
  })
  const [customImage, setCustomImage] = useState(() => {
    return localStorage.getItem('fpt_custom_image') || ''
  })
  const fileRef = useRef(null)

  return (
    <div style={{ maxWidth: '600px' }}>
      <h2 className="text-2xl font-bold mb-6" style={{ color: titleColor }}>Profile</h2>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files[0]
          if (!file) return
          const reader = new FileReader()
          reader.onload = (ev) => {
            setCustomImage(ev.target.result)
            setSelectedAvatar('')
            localStorage.setItem('fpt_custom_image', ev.target.result)
            localStorage.removeItem('fpt_avatar')
          }
          reader.readAsDataURL(file)
        }}
      />

      {/* Avatar + Info */}
      <div className="rounded-xl p-6 border mb-4" style={card}>
        <div className="flex items-center gap-5 mb-6">
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: customImage ? 'none' : 'linear-gradient(135deg, #4F46E5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: selectedAvatar ? '40px' : '24px', fontWeight: '800',
            color: 'white', flexShrink: 0, overflow: 'hidden', cursor: 'pointer',
            border: `3px solid ${isDark ? '#2a2a2a' : '#E9E9E7'}`
          }}
            onClick={() => fileRef.current.click()}
          >
            {customImage
              ? <img src={customImage} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : selectedAvatar
              ? selectedAvatar
              : initials
            }
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

        {/* Avatar Picker */}
        <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${isDark ? '#2a2a2a' : '#E9E9E7'}` }}>
          <label className="text-sm font-medium block mb-3" style={{ color: titleColor }}>Choose Avatar</label>
          <div className="flex gap-2 flex-wrap mb-3">
            {AVATARS.map((avatar) => (
              <div
                key={avatar}
                onClick={() => {
                  setSelectedAvatar(avatar)
                  setCustomImage('')
                  localStorage.setItem('fpt_avatar', avatar)
                  localStorage.removeItem('fpt_custom_image')
                }}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  backgroundColor: isDark ? '#2a2a2a' : '#F7F6F3',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', cursor: 'pointer',
                  border: selectedAvatar === avatar ? `2px solid ${isDark ? '#ffffff' : '#37352F'}` : '2px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                {avatar}
              </div>
            ))}
          </div>
          <button
            onClick={() => fileRef.current.click()}
            className="px-4 py-2 rounded-lg text-sm font-medium border"
            style={{ backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF', borderColor: isDark ? '#2a2a2a' : '#E9E9E7', color: titleColor }}
          >
          📷 Upload Custom Photo
          </button>
          {(customImage || selectedAvatar) && (
            <button
              onClick={() => {
                setSelectedAvatar('')
                setCustomImage('')
                localStorage.removeItem('fpt_avatar')
                localStorage.removeItem('fpt_custom_image')
              }}
              className="ml-2 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
            >
              Reset Avatar
            </button>
          )}
        </div>
      </div>

      {/* Linked Accounts */}
      <div className="rounded-xl p-6 border mb-4" style={card}>
        <h3 className="font-semibold mb-4" style={{ color: titleColor }}>Linked Accounts</h3>
        {[
          { name: 'GitHub', icon: <FaGithub size={20} color='#333' />, handle: 'github.com/html-moiz03', connected: true },
          { name: 'LinkedIn', icon: <FaLinkedin size={20} color='#0A66C2' />, handle: 'linkedin.com/in/malik-abdul-moiz-zaheer-awan-6a9997259', connected: true },
          { name: 'Google', icon: <FaGoogle size={20} color='#EA4335' />, handle: 'Not connected', connected: false },
        ].map((acc) => (
          <div key={acc.name} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: isDark ? '#2a2a2a' : '#E9E9E7' }}>
            <div className="flex items-center gap-3">
              <span className="flex items-center">{acc.icon}</span>
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