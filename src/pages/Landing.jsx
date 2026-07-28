import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(false)
  const [logoVisible, setLogoVisible] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const user = localStorage.getItem('fpt_session')
    if (user) navigate('/dashboard')
    setTimeout(() => setLogoVisible(true), 100)
    setTimeout(() => setFormVisible(true), 400)
  }, [navigate])

  const validate = () => {
    const e = {}
    if (!isLogin && !form.name.trim()) e.name = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Min 6 characters'
    if (!isLogin && form.password !== form.confirm) e.confirm = 'Passwords do not match'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    if (isLogin) {
      const saved = JSON.parse(localStorage.getItem('fpt_user') || 'null')
      if (!saved || saved.email !== form.email || saved.password !== form.password) {
        setErrors({ email: 'Invalid email or password' }); return
      }
      localStorage.setItem('fpt_session', JSON.stringify(saved))
      navigate('/dashboard')
    } else {
      const user = { name: form.name, email: form.email, password: form.password }
      localStorage.setItem('fpt_user', JSON.stringify(user))
      localStorage.setItem('fpt_session', JSON.stringify(user))
      navigate('/dashboard')
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1.5px solid #E2E8F0', backgroundColor: '#FFFFFF',
    fontSize: '14px', color: '#1e1b4b', outline: 'none',
    boxSizing: 'border-box', marginBottom: '4px',
    transition: 'border-color 0.2s',
    fontFamily: 'Plus Jakarta Sans, sans-serif'
  }

  return (
    <>
      <style>{`
        @keyframes slideUpBoy {
            from { transform: translateY(120px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .landing-root { min-height: 100vh; background-color: #F7F6F3; position: relative; overflow: hidden; display: flex; flex-direction: column; }
        .doodle-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        .main-content { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 60px; gap: 80px; position: relative; z-index: 1; }
        .left-side { flex: 1; max-width: 500px; transform: translateX(-60px); opacity: 0; transition: all 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
        .left-side.visible { transform: translateX(0); opacity: 1; }
        .badge { display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #ede9fe, #fce7f3); border: 1px solid #ddd6fe; border-radius: 50px; padding: 5px 14px; font-size: 12px; font-weight: 600; color: #7c3aed; margin-bottom: 16px; }
        .logo-img { width: 240px; margin-bottom: 20px; }
        .tagline { font-size: 30px; font-weight: 800; color: #1e1b4b; line-height: 1.25; margin-bottom: 14px; letter-spacing: -0.5px; }
        .tagline span { background: linear-gradient(135deg, #7c3aed, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .desc { font-size: 14px; color: #64748b; line-height: 1.7; max-width: 400px; margin-bottom: 20px; }
        .divider { width: 100%; height: 1px; background: linear-gradient(to right, #e2e8f0, transparent); margin: 16px 0; }
        .stats-row { display: flex; gap: 28px; margin-bottom: 20px; }
        .stat-item { text-align: left; }
        .stat-value { font-size: 22px; font-weight: 800; background: linear-gradient(135deg, #7c3aed, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .stat-label { font-size: 11px; color: #94a3b8; font-weight: 500; margin-top: 2px; }
        .features-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
        .feature-item { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #475569; font-weight: 500; }
        .feature-dot { width: 7px; height: 7px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #f97316); flex-shrink: 0; }
        .preview-wrap { position: relative; margin-top: 4px; }
        .preview-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .preview-img { width: 100%; border-radius: 12px; border: 1.5px solid #e2e8f0; box-shadow: 0 8px 30px rgba(0,0,0,0.08); display: block; }
        .preview-badge { position: absolute; top: -8px; right: 8px; background: linear-gradient(135deg, #7c3aed, #f97316); color: white; font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
        .right-side { flex-shrink: 0; width: 380px; transform: translateY(60px); opacity: 0; transition: all 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.2s; }
        .right-side.visible { transform: translateY(0); opacity: 1; }
        .divider-vertical { width: 1px; align-self: stretch; background: linear-gradient(to bottom, transparent, #e2e8f0 30%, #e2e8f0 70%, transparent); flex-shrink: 0; }
        .form-card { background: #FFFFFF; border-radius: 20px; padding: 36px 32px; box-shadow: 0 4px 40px rgba(124,58,237,0.08); border: 1px solid #f1f5f9; }
        .form-title { font-size: 24px; font-weight: 800; color: #1e1b4b; margin-bottom: 6px; text-align: center; }
        .form-sub { font-size: 13.5px; color: #64748b; text-align: center; margin-bottom: 24px; line-height: 1.5; }
        .error-msg { font-size: 11px; color: #dc2626; margin-bottom: 8px; padding-left: 2px; }
        .submit-btn { width: 100%; padding: 13px; border-radius: 50px; border: none; background: linear-gradient(135deg, #4F46E5, #7c3aed); color: white; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 8px; transition: opacity 0.2s, transform 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; }
        .submit-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .toggle-text { text-align: center; font-size: 13px; color: #64748b; margin-top: 20px; }
        .toggle-link { color: #4F46E5; font-weight: 700; cursor: pointer; }
        .toggle-link:hover { text-decoration: underline; }
        .footer { position: relative; z-index: 1; border-top: 1px solid #E9E9E7; padding: 16px 60px; display: flex; align-items: center; justify-content: space-between; background: #F7F6F3; }
        .footer-left { font-size: 12px; color: #9B9A97; }
        .footer-links { display: flex; gap: 20px; }
        .footer-link { font-size: 12px; color: #6B6B6B; cursor: pointer; transition: color 0.2s; }
        .footer-link:hover { color: #4F46E5; }
        input:focus { border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
      `}</style>

      <div className="landing-root">
        <svg className="doodle-bg" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
          <text x="80" y="120" fontSize="18" fill="#c7d2fe" opacity="0.6">✦</text>
          <text x="320" y="60" fontSize="12" fill="#e9d5ff" opacity="0.5">✦</text>
          <text x="1100" y="80" fontSize="20" fill="#c7d2fe" opacity="0.5">✦</text>
          <text x="1350" y="200" fontSize="14" fill="#fde68a" opacity="0.5">✦</text>
          <text x="60" y="700" fontSize="16" fill="#e9d5ff" opacity="0.5">✦</text>
          <text x="1380" y="750" fontSize="18" fill="#c7d2fe" opacity="0.4">✦</text>
          <text x="700" y="40" fontSize="10" fill="#c7d2fe" opacity="0.5">✦</text>
          <text x="900" y="860" fontSize="14" fill="#e9d5ff" opacity="0.4">✦</text>
          <path d="M 50 300 Q 80 280 110 300 Q 140 320 170 300" stroke="#c7d2fe" strokeWidth="2" fill="none" opacity="0.5"/>
          <path d="M 1250 400 Q 1280 380 1310 400 Q 1340 420 1370 400" stroke="#fde68a" strokeWidth="2" fill="none" opacity="0.5"/>
          <path d="M 200 800 Q 230 780 260 800 Q 290 820 320 800" stroke="#e9d5ff" strokeWidth="2" fill="none" opacity="0.4"/>
          <path d="M 1100 700 Q 1130 680 1160 700 Q 1190 720 1220 700" stroke="#c7d2fe" strokeWidth="2" fill="none" opacity="0.4"/>
          <path d="M 420 150 L 460 150 L 450 140 M 460 150 L 450 160" stroke="#c7d2fe" strokeWidth="1.5" fill="none" opacity="0.5"/>
          <path d="M 100 500 L 100 540 L 90 530 M 100 540 L 110 530" stroke="#c7d2fe" strokeWidth="1.5" fill="none" opacity="0.4"/>
          <circle cx="550" cy="100" r="4" fill="#c7d2fe" opacity="0.4"/>
          <circle cx="580" cy="100" r="4" fill="#c7d2fe" opacity="0.4"/>
          <circle cx="610" cy="100" r="4" fill="#c7d2fe" opacity="0.4"/>
          <circle cx="150" cy="600" r="4" fill="#e9d5ff" opacity="0.4"/>
          <circle cx="180" cy="600" r="4" fill="#e9d5ff" opacity="0.4"/>
          <circle cx="1300" cy="550" r="4" fill="#fde68a" opacity="0.4"/>
          <circle cx="1330" cy="550" r="4" fill="#fde68a" opacity="0.4"/>
          <circle cx="1400" cy="100" r="30" stroke="#c7d2fe" strokeWidth="1.5" fill="none" opacity="0.4"/>
          <circle cx="40" cy="860" r="25" stroke="#e9d5ff" strokeWidth="1.5" fill="none" opacity="0.4"/>
          <text x="1200" y="180" fontSize="20" fill="#c7d2fe" opacity="0.4">+</text>
          <text x="300" y="750" fontSize="16" fill="#e9d5ff" opacity="0.4">+</text>
          <text x="50" y="200" fontSize="14" fill="#fde68a" opacity="0.4">+</text>
          <rect x="1300" y="300" width="20" height="20" rx="4" stroke="#c7d2fe" strokeWidth="1.5" fill="none" opacity="0.4" transform="rotate(15 1310 310)"/>
          <rect x="100" y="380" width="16" height="16" rx="3" stroke="#e9d5ff" strokeWidth="1.5" fill="none" opacity="0.4" transform="rotate(-10 108 388)"/>
        </svg>

        <div className="main-content">
          <div className={`left-side ${logoVisible ? 'visible' : ''}`}>
            <div className="badge">✦ Your Freelance CRM — Free Forever</div>
            <img src="/fpt-logo.png" alt="Freelancer Proposal Tracker" className="logo-img" />
            <h1 className="tagline">Manage your freelance<br />business <span>like a pro.</span></h1>
            <p className="desc">Freelancer Proposal Tracker is your all-in-one CRM to manage clients, track proposals, monitor deal statuses, and never miss a follow-up — built for freelancers who mean business.</p>
            <div className="divider" />
            <div className="stats-row">
              {[{ value: '500+', label: 'Proposals Tracked' }, { value: '98%', label: 'Client Satisfaction' }, { value: 'Free', label: 'Forever Plan' }].map((s) => (
                <div key={s.label} className="stat-item">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div className="features-list">
              {['Track proposals from Draft to Won', 'Manage all your clients in one place', 'Get overdue follow-up alerts automatically', 'Visualize your revenue and win rate'].map((f) => (
                <div key={f} className="feature-item"><div className="feature-dot" />{f}</div>
              ))}
            </div>
            <div className="preview-wrap">
              <div className="preview-label">✦ Live Dashboard Preview</div>
              <div className="preview-badge">Real-time</div>
              <img src="/dashboard-preview.png" alt="Dashboard Preview" className="preview-img" />
            </div>
          </div>

          <div className="divider-vertical" />

          <div className={`right-side ${formVisible ? 'visible' : ''}`}>
            {/* SVG Boy */}
            <div style={{
                width: '160px',
                margin: '0 auto -60px auto',
                position: 'relative',
                zIndex: 0,
                animation: 'slideUpBoy 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.6s both'
            }}>
                <svg viewBox="0 0 680 420" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="340" cy="400" rx="70" ry="10" fill="#e2e8f0" opacity="0.6"/>
                    <rect x="295" y="368" width="38" height="16" rx="8" fill="#1e1b4b"/>
                    <rect x="347" y="368" width="38" height="16" rx="8" fill="#1e1b4b"/>
                    <rect x="293" y="280" width="42" height="100" rx="6" fill="#334155"/>
                    <rect x="345" y="280" width="42" height="100" rx="6" fill="#334155"/>
                    <rect x="288" y="278" width="104" height="10" rx="4" fill="#1e293b"/>
                    <rect x="332" y="279" width="16" height="8" rx="2" fill="#f97316"/>
                    <rect x="280" y="190" width="120" height="100" rx="10" fill="#4F46E5"/>
                    <path d="M320 190 L340 215 L360 190" fill="#EEF2FF" opacity="0.5"/>
                    <rect x="240" y="195" width="42" height="28" rx="10" fill="#4F46E5"/>
                    <rect x="230" y="218" width="28" height="70" rx="10" fill="#fbbf8a"/>
                    <rect x="418" y="195" width="42" height="28" rx="10" fill="#4F46E5"/>
                    <rect x="422" y="218" width="28" height="70" rx="10" fill="#fbbf8a"/>
                    <rect x="210" y="260" width="100" height="65" rx="6" fill="#e2e8f0"/>
                    <rect x="215" y="265" width="90" height="52" rx="4" fill="#c7d2fe"/>
                    <rect x="220" y="270" width="40" height="6" rx="2" fill="#4F46E5" opacity="0.7"/>
                    <rect x="220" y="280" width="60" height="4" rx="2" fill="#7c3aed" opacity="0.5"/>
                    <rect x="220" y="288" width="50" height="4" rx="2" fill="#7c3aed" opacity="0.4"/>
                    <rect x="220" y="296" width="35" height="4" rx="2" fill="#f97316" opacity="0.5"/>
                    <rect x="205" y="323" width="110" height="8" rx="4" fill="#cbd5e1"/>
                    <rect x="325" y="168" width="30" height="28" rx="8" fill="#fbbf8a"/>
                    <ellipse cx="340" cy="145" rx="48" ry="52" fill="#fbbf8a"/>
                    <path d="M292 130 Q295 85 340 80 Q385 85 388 130 Q380 105 340 100 Q300 105 292 130Z" fill="#1e1b4b"/>
                    <path d="M292 130 Q288 115 293 100 Q295 115 298 125Z" fill="#1e1b4b"/>
                    <path d="M388 130 Q392 115 387 100 Q385 115 382 125Z" fill="#1e1b4b"/>
                    <ellipse cx="322" cy="148" rx="7" ry="8" fill="white"/>
                    <ellipse cx="358" cy="148" rx="7" ry="8" fill="white"/>
                    <circle cx="324" cy="149" r="4" fill="#1e1b4b"/>
                    <circle cx="360" cy="149" r="4" fill="#1e1b4b"/>
                    <circle cx="326" cy="147" r="1.5" fill="white"/>
                    <circle cx="362" cy="147" r="1.5" fill="white"/>
                    <path d="M313 136 Q322 131 331 135" stroke="#1e1b4b" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                    <path d="M349 135 Q358 131 367 136" stroke="#1e1b4b" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                    <path d="M324 165 Q340 178 356 165" stroke="#c2440b" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                    <ellipse cx="292" cy="150" rx="8" ry="10" fill="#fbbf8a"/>
                    <ellipse cx="388" cy="150" rx="8" ry="10" fill="#fbbf8a"/> 
                </svg> 
            </div>
            <div className="form-card" style={{ position: 'relative',zIndex: 1 }}>
                <h2 className="form-title">{isLogin ? 'Login' : 'Sign up'}</h2>
                <p className="form-sub">{isLogin ? 'Welcome back! Enter your credentials.' : 'Create a free account with your email.'}</p>
                {!isLogin && (
                    <div>
                        <input style={inputStyle} placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        {errors.name && <p className="error-msg">{errors.name}</p>}    
                    </div>
                )}
                <div>
                    <input style={inputStyle} placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    {errors.email && <p className="error-msg">{errors.email}</p>}
                </div>
                <div>
                    <input style={inputStyle} placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    {errors.password && <p className="error-msg">{errors.password}</p>}
                </div>
                {!isLogin && (
                    <div>
                        <input style={inputStyle} placeholder="Confirm Password" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
                        {errors.confirm && <p className="error-msg">{errors.confirm}</p>}
                    </div>
                )}
                <button className="submit-btn" onClick={handleSubmit}>{isLogin ? 'Log in' : 'Sign up'}</button>
                <p className="toggle-text">
                    {isLogin ? "Don't have an account? " : 'Have an account? '}
                    <span className="toggle-link" onClick={() => { setIsLogin(!isLogin); setErrors({}); setForm({ name: '', email: '', password: '', confirm: '' }) }}>
                        {isLogin ? 'Sign up' : 'Log in'}
                    </span>
                </p>
            </div>
          </div>
        </div>

        <footer className="footer">
          <div className="footer-left">© 2026 Freelancer Proposal Tracker. All rights reserved.</div>
          <div className="footer-links">
            <span className="footer-link">Report an Issue</span>
            <span className="footer-link">Trouble Signing In</span>
            <span className="footer-link">Privacy Policy</span>
            <span className="footer-link">Terms of Service</span>
            <span className="footer-link">Contact Support</span>
          </div>
        </footer>
      </div>
    </>
  )
}