import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

function AnimatedStatCard({ stat, delay }) {
  const [count, setCount] = useState(0)
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect()
        setTimeout(() => {
          setVisible(true)
          let i = 0
          const step = Math.ceil(stat.value / (1500 / 16))
          const counter = setInterval(() => {
            i += step
            if (i >= stat.value) { setCount(stat.value); clearInterval(counter) }
            else setCount(i)
          }, 16)
        }, delay)
      }
    }, { threshold: 0.1 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay, stat.value])
  return (
    <div ref={ref} style={{
      width: '160px', borderRadius: '120px 120px 20px 20px',
      backgroundColor: stat.color, padding: '30px 16px 24px', textAlign: 'center',
      transform: visible ? 'translateY(0)' : 'translateY(40px)',
      opacity: visible ? 1 : 0,
      transition: `all 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
    }}>
      <div style={{ fontSize: '36px', fontWeight: '800', color: stat.accent, lineHeight: 1, marginBottom: '6px' }}>
        {stat.suffix === '+' ? `${count}+` : `${count}%`}
      </div>
      <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', lineHeight: 1.4 }}>{stat.label}</div>
    </div>
  )
}

function useScrollReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect() }
    }, { threshold: 0.1 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return [ref, visible]
}

function RevealDiv({ children, delay = 0, style = {} }) {
  const [ref, visible] = useScrollReveal()
  return (
    <div ref={ref} style={{
      transform: visible ? 'translateY(0)' : 'translateY(40px)',
      opacity: visible ? 1 : 0,
      transition: `all 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      ...style
    }}>{children}</div>
  )
}

function TiltCard({ children, style = {} }) {
  const cardRef = useRef(null)
  const handleMouseMove = (e) => {
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const rotateX = (y - rect.height / 2) / 10
    const rotateY = (rect.width / 2 - x) / 10
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`
    card.style.boxShadow = '0 20px 60px rgba(0,0,0,0.12)'
  }
  const handleMouseLeave = () => {
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)'
    cardRef.current.style.boxShadow = 'none'
  }
  return (
    <div ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.1s ease, box-shadow 0.3s ease', ...style }}>
      {children}
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(false)
  const [logoVisible, setLogoVisible] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [openFaq, setOpenFaq] = useState(null)

  useEffect(() => {
    const user = localStorage.getItem('fpt_session')
    if (user) navigate('/dashboard')
    setTimeout(() => setLogoVisible(true), 100)
    setTimeout(() => setFormVisible(true), 400)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    const handleScroll = () => {
      const el = document.documentElement
      const progress = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
    }
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

  const scrollToForm = (login) => {
    setIsLogin(login)
    setTimeout(() => document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1.5px solid #E2E8F0', backgroundColor: '#FFFFFF',
    fontSize: '14px', color: '#1e1b4b', outline: 'none',
    boxSizing: 'border-box', marginBottom: '0',
    transition: 'border-color 0.2s', fontFamily: 'Plus Jakarta Sans, sans-serif'
  }

  const features = [
    { icon: '📄', title: 'Proposal Tracking', desc: 'Track every proposal from Draft to Won with color-coded status badges and deadline warnings.' },
    { icon: '👤', title: 'Client Management', desc: 'Manage all your clients with ratings, notes, and per-client revenue analytics.' },
    { icon: '🗂️', title: 'Kanban Board', desc: 'Drag and drop proposals across columns to update their status in real time.' },
    { icon: '📊', title: 'Analytics Dashboard', desc: 'Track your win rate, revenue trend, and proposal pipeline with beautiful charts.' },
    { icon: '🔔', title: 'Follow-up Reminders', desc: 'Never miss a follow-up with automatic overdue detection and notifications.' },
    { icon: '📤', title: 'Export & Backup', desc: 'Export PDFs, download CSV data, and backup everything as JSON.' },
  ]

  const steps = [
    { num: '01', title: 'Add Your Clients', desc: 'Start by adding your freelance clients with their contact details.', icon: '👤' },
    { num: '02', title: 'Create Proposals', desc: 'Create detailed proposals linked to clients with amounts and deadlines.', icon: '📄' },
    { num: '03', title: 'Track & Win Deals', desc: 'Move proposals through your pipeline and celebrate every win! 🎉', icon: '🏆' },
  ]

  const testimonials = [
    { name: 'Sarah Johnson', role: 'UI/UX Freelancer', avatar: '👩‍💻', quote: 'FP Tracker completely changed how I manage my freelance business. I went from losing track of proposals to closing 40% more deals!' },
    { name: 'Ahmed Raza', role: 'Full Stack Developer', avatar: '👨‍💻', quote: 'The Kanban board is a game changer. I can see exactly where every proposal stands and follow up at the right time.' },
    { name: 'Maria Santos', role: 'Digital Marketer', avatar: '👩‍🎨', quote: 'I love the PDF export feature. My clients are always impressed with professionally formatted proposals.' },
  ]

  const marqueeItems = ['✦ Kanban Board', '✦ PDF Export', '✦ Dark Mode', '✦ CSV Export', '✦ Client Rating', '✦ Activity Log', '✦ Proposal Templates', '✦ Global Search', '✦ Revenue Charts', '✦ Follow-up Reminders', '✦ Confetti on Win', '✦ Quick Add']

  const tabs = ['Dashboard', 'Proposals', 'Kanban', 'Settings']
  const tabImages = {
    Dashboard: '/dashboard-preview.png',
    Proposals: '/proposals-preview.png',
    Kanban: '/kanban-preview.png',
    Settings: '/settings-preview.png',
  }

  const faqs = [
    { q: 'Is FP Tracker really free?', a: 'Yes! FP Tracker is completely free forever. No credit card required, no hidden fees.' },
    { q: 'Is my data safe?', a: 'Your data is stored locally in your browser using localStorage. You can also export a full JSON backup anytime from Settings.' },
    { q: 'Can I use it on mobile?', a: 'Absolutely! FP Tracker is fully responsive with a mobile-friendly sidebar and layout optimized for all screen sizes.' },
    { q: 'Can I export my proposals?', a: 'Yes! You can export individual proposals as branded PDFs, or export all clients and proposals as CSV or JSON files.' },
    { q: 'Does it support multiple currencies?', a: 'Yes! You can switch between PKR, USD, EUR, GBP, and AED from the Settings page.' },
    { q: 'Can I customize the appearance?', a: 'Yes! You can switch between light and dark mode, and choose from 6 accent colors in the Settings page.' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .landing-root { min-height: 100vh; background-color: #F7F6F3; position: relative; overflow-x: hidden; display: flex; flex-direction: column; }
        .doodle-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
        .hero-glow { position: absolute; top: -100px; left: 50%; transform: translateX(-50%); width: 700px; height: 500px; background: radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, rgba(79,70,229,0.06) 40%, transparent 70%); pointer-events: none; z-index: 0; border-radius: 50%; }
        .main-content { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 24px; gap: 60px; position: relative; z-index: 1; flex-wrap: wrap; }
        .left-side { flex: 1; min-width: 280px; max-width: 500px; transform: translateX(-60px); opacity: 0; transition: all 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
        .left-side.visible { transform: translateX(0); opacity: 1; }
        .badge { display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #ede9fe, #fce7f3); border: 1px solid #ddd6fe; border-radius: 50px; padding: 5px 14px; font-size: 12px; font-weight: 600; color: #7c3aed; margin-bottom: 16px; }
        .logo-img { width: 200px; margin-bottom: 16px; }
        .tagline { font-size: 26px; font-weight: 800; color: #1e1b4b; line-height: 1.25; margin-bottom: 12px; letter-spacing: -0.5px; }
        .tagline span { background: linear-gradient(135deg, #7c3aed, #f97316, #7c3aed); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: gradientShift 3s linear infinite; }
        @keyframes gradientShift { 0% { background-position: 0% } 100% { background-position: 200% } }
        .desc { font-size: 13px; color: #64748b; line-height: 1.7; max-width: 400px; margin-bottom: 16px; }
        .divider { width: 100%; height: 1px; background: linear-gradient(to right, #e2e8f0, transparent); margin: 12px 0; }
        .stats-row { display: flex; gap: 20px; margin-bottom: 16px; flex-wrap: wrap; }
        .stat-value { font-size: 20px; font-weight: 800; background: linear-gradient(135deg, #7c3aed, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .stat-label { font-size: 11px; color: #94a3b8; font-weight: 500; margin-top: 2px; }
        .features-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .feature-item { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #475569; font-weight: 500; }
        .feature-dot { width: 7px; height: 7px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #f97316); flex-shrink: 0; }
        .preview-wrap { position: relative; margin-top: 4px; }
        .preview-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .preview-img { width: 100%; border-radius: 12px; border: 1.5px solid #e2e8f0; box-shadow: 0 8px 30px rgba(0,0,0,0.08); display: block; }
        .preview-badge { position: absolute; top: -8px; right: 8px; background: linear-gradient(135deg, #7c3aed, #f97316); color: white; font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
        .right-side { flex-shrink: 0; width: 100%; max-width: 380px; transform: translateY(60px); opacity: 0; transition: all 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.2s; }
        .right-side.visible { transform: translateY(0); opacity: 1; }
        .divider-vertical { width: 1px; align-self: stretch; background: linear-gradient(to bottom, transparent, #e2e8f0 30%, #e2e8f0 70%, transparent); flex-shrink: 0; }
        .form-card { background: #FFFFFF; border-radius: 20px; padding: 32px 28px; box-shadow: 0 4px 40px rgba(124,58,237,0.08); border: 1px solid #f1f5f9; }
        .form-title { font-size: 22px; font-weight: 800; color: #1e1b4b; margin-bottom: 6px; text-align: center; }
        .form-sub { font-size: 13px; color: #64748b; text-align: center; margin-bottom: 20px; line-height: 1.5; }
        .social-btn { width: 100%; padding: 11px; border-radius: 10px; border: 1.5px solid #E2E8F0; background: #FFFFFF; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; color: #374151; font-family: 'Plus Jakarta Sans', sans-serif; transition: background 0.2s; margin-bottom: 8px; }
        .social-btn:hover { background: #F7F6F3; }
        .divider-or { display: flex; align-items: center; gap: 12px; margin: 12px 0; color: #94a3b8; font-size: 12px; }
        .divider-or::before, .divider-or::after { content: ''; flex: 1; height: 1px; background: #E2E8F0; }
        .error-msg { font-size: 11px; color: #dc2626; margin-bottom: 8px; padding-left: 2px; }
        .submit-btn { width: 100%; padding: 13px; border-radius: 50px; border: none; background: linear-gradient(135deg, #4F46E5, #7c3aed); color: white; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 8px; transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; box-shadow: 0 0 20px rgba(124,58,237,0.4); }
        .submit-btn:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 0 35px rgba(124,58,237,0.6); }
        .toggle-text { text-align: center; font-size: 13px; color: #64748b; margin-top: 20px; }
        .toggle-link { color: #4F46E5; font-weight: 700; cursor: pointer; }
        .toggle-link:hover { text-decoration: underline; }
        .stats-section { position: relative; z-index: 1; padding: 20px 24px 30px; display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; background-color: #F7F6F3; }
        .marquee-wrap { overflow: hidden; white-space: nowrap; background: linear-gradient(135deg, #4F46E5, #7c3aed); padding: 12px 0; position: relative; z-index: 1; }
        .marquee-track { display: inline-flex; animation: marquee 20s linear infinite; }
        .marquee-item { font-size: 13px; font-weight: 600; color: white; padding: 0 24px; opacity: 0.9; }
        @keyframes marquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        .section { position: relative; z-index: 1; padding: 60px 40px; background-color: #F7F6F3; }
        .section-title { font-size: 28px; font-weight: 800; color: #1e1b4b; text-align: center; margin-bottom: 8px; }
        .section-sub { font-size: 14px; color: #64748b; text-align: center; margin-bottom: 40px; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 900px; margin: 0 auto; }
        .feature-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(12px); border-radius: 16px; padding: 24px; border: 1px solid rgba(233,233,231,0.8); cursor: default; height: 100%; }
        .steps-grid { display: flex; gap: 24px; max-width: 800px; margin: 0 auto; justify-content: center; flex-wrap: wrap; }
        .step-card { flex: 1; min-width: 200px; text-align: center; position: relative; }
        .step-num { font-size: 48px; font-weight: 800; background: linear-gradient(135deg, #7c3aed, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; margin-bottom: 12px; }
        .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 900px; margin: 0 auto; }
        .testimonial-card { background: rgba(255,255,255,0.8); backdrop-filter: blur(12px); border-radius: 16px; padding: 24px; border: 1px solid rgba(233,233,231,0.8); }
        .trust-badges { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; margin-top: 32px; }
        .trust-badge { display: flex; align-items: center; gap: 8px; padding: 8px 16px; borderRadius: 50px; background: #FFFFFF; border: 1px solid #E9E9E7; font-size: 12px; font-weight: 600; color: #475569; border-radius: 50px; }
        .pricing-card { background: #FFFFFF; border-radius: 20px; padding: 32px; border: 2px solid #4F46E5; max-width: 360px; margin: 0 auto; position: relative; box-shadow: 0 8px 40px rgba(79,70,229,0.12); }
        .pricing-badge { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #4F46E5, #7c3aed); color: white; font-size: 12px; font-weight: 700; padding: 4px 16px; border-radius: 20px; white-space: nowrap; }
        .faq-item { border-bottom: 1px solid #E9E9E7; padding: 16px 0; cursor: pointer; max-width: 700px; margin: 0 auto; }
        .faq-q { display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: 600; color: #1e1b4b; }
        .faq-a { font-size: 13px; color: #64748b; line-height: 1.7; margin-top: 10px; }
        .tab-btn { padding: 8px 20px; border-radius: 8px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; }
        .cta-section { position: relative; z-index: 1; padding: 80px 40px; text-align: center; background: linear-gradient(135deg, #4F46E5, #7c3aed); overflow: hidden; }
        .cta-title { font-size: 32px; font-weight: 800; color: white; margin-bottom: 12px; position: relative; }
        .cta-sub { font-size: 15px; color: rgba(255,255,255,0.8); margin-bottom: 32px; position: relative; }
        .cta-btn { padding: 14px 36px; border-radius: 50px; border: 2px solid white; background: white; color: #4F46E5; font-size: 15px; font-weight: 800; cursor: pointer; transition: all 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; position: relative; box-shadow: 0 0 30px rgba(255,255,255,0.3); }
        .cta-btn:hover { background: transparent; color: white; box-shadow: 0 0 50px rgba(255,255,255,0.5); }
        .footer { position: relative; z-index: 1; border-top: 1px solid #E9E9E7; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; background: #F7F6F3; flex-wrap: wrap; gap: 8px; }
        .footer-left { font-size: 12px; color: #9B9A97; }
        .footer-links { display: flex; gap: 12px; flex-wrap: wrap; }
        .footer-link { font-size: 12px; color: #6B6B6B; cursor: pointer; transition: color 0.2s; }
        .footer-link:hover { color: #4F46E5; }
        input:focus { border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
        @keyframes float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-20px) } }
        @media (max-width: 768px) {
          .main-content { flex-direction: column; align-items: center; padding: 24px 16px; gap: 32px; }
          .left-side { max-width: 100%; width: 100%; flex: none; }
          .right-side { max-width: 100%; width: 100%; flex: none; }
          .divider-vertical { display: none; }
          .tagline { font-size: 22px; }
          .features-grid { grid-template-columns: repeat(1, 1fr); }
          .testimonials-grid { grid-template-columns: repeat(1, 1fr); }
          .steps-grid { flex-direction: column; }
          .section { padding: 40px 20px; }
          .nav-links { display: none; }
          .cta-section { padding: 50px 20px; }
          .cta-title { font-size: 24px; }
        }
      `}</style>

      <div className="landing-root">

        {/* Scroll Progress Bar */}
        <div style={{
          position: 'fixed', top: 0, left: 0, zIndex: 9999,
          height: '3px', width: `${scrollProgress}%`,
          background: 'linear-gradient(135deg, #7c3aed, #4F46E5, #f97316)',
          transition: 'width 0.1s ease'
        }} />

        {/* Floating Particles */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: `${8 + i * 4}px`, height: `${8 + i * 4}px`,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${['#c7d2fe','#e9d5ff','#fde68a','#c7d2fe'][i % 4]}, transparent)`,
              left: `${10 + i * 12}%`, top: `${15 + (i * 13) % 70}%`,
              opacity: 0.4,
              animation: `float ${4 + i * 0.8}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`
            }} />
          ))}
        </div>

        <svg className="doodle-bg" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
          <text x="80" y="120" fontSize="18" fill="#c7d2fe" opacity="0.6">✦</text>
          <text x="320" y="60" fontSize="12" fill="#e9d5ff" opacity="0.5">✦</text>
          <text x="1100" y="80" fontSize="20" fill="#c7d2fe" opacity="0.5">✦</text>
          <text x="1350" y="200" fontSize="14" fill="#fde68a" opacity="0.5">✦</text>
          <path d="M 50 300 Q 80 280 110 300 Q 140 320 170 300" stroke="#c7d2fe" strokeWidth="2" fill="none" opacity="0.5"/>
          <path d="M 1250 400 Q 1280 380 1310 400 Q 1340 420 1370 400" stroke="#fde68a" strokeWidth="2" fill="none" opacity="0.5"/>
          <circle cx="1400" cy="100" r="30" stroke="#c7d2fe" strokeWidth="1.5" fill="none" opacity="0.4"/>
          <text x="1200" y="180" fontSize="20" fill="#c7d2fe" opacity="0.4">+</text>
          <rect x="1300" y="300" width="20" height="20" rx="4" stroke="#c7d2fe" strokeWidth="1.5" fill="none" opacity="0.4" transform="rotate(15 1310 310)"/>
        </svg>

        {/* Navbar */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 100,
          backgroundColor: 'rgba(247, 246, 243, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E9E9E7',
          padding: isMobile ? '12px 16px' : '14px 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <img src="/fpt-logo.png" alt="logo" style={{ height: isMobile ? '24px' : '30px' }} />
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            {['Features', 'How It Works', 'Testimonials', 'Pricing', 'FAQ'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#1e1b4b'}
                onMouseLeave={e => e.target.style.color = '#64748b'}
              >{item}</a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => scrollToForm(true)} style={{ padding: isMobile ? '6px 12px' : '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: '1.5px solid #E9E9E7', backgroundColor: 'transparent', color: '#37352F', fontFamily: 'inherit' }}>Log in</button>
  <button onClick={() => scrollToForm(false)} style={{ padding: isMobile ? '6px 12px' : '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg, #4F46E5, #7c3aed)', color: 'white', fontFamily: 'inherit', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>Get Started</button>
          </div>
        </nav>

        {/* Hero */}
        <div style={{ position: 'relative' }}>
          <div className="hero-glow" />
          <div className="main-content">
            <div className={`left-side ${logoVisible ? 'visible' : ''}`}>
              <div className="badge">✦ Your Freelance CRM — Free Forever</div>
              <img src="/fpt-logo.png" alt="Freelancer Proposal Tracker" className="logo-img" />
              <h1 className="tagline">Manage your freelance<br />business <span>like a pro.</span></h1>
              <p className="desc">Freelancer Proposal Tracker is your all-in-one CRM to manage clients, track proposals, monitor deal statuses, and never miss a follow-up.</p>
              <div className="divider" />
              <div className="stats-row">
                {[{ value: '500+', label: 'Proposals Tracked' }, { value: '98%', label: 'Client Satisfaction' }, { value: 'Free', label: 'Forever Plan' }].map((s) => (
                  <div key={s.label}>
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
              {!isMobile && (
                <div className="preview-wrap">
                  <div className="preview-label">✦ Live Dashboard Preview</div>
                  <div className="preview-badge">Real-time</div>
                  <img src="/dashboard-preview.png" alt="Dashboard Preview" className="preview-img" />
                </div>
              )}
            </div>

            {!isMobile && <div className="divider-vertical" />}

            <div className={`right-side ${formVisible ? 'visible' : ''}`}>
              <div style={{ width: '160px', margin: '0 auto -60px auto', position: 'relative', zIndex: 0, animation: 'slideUpBoy 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.6s both' }}>
                <style>{`@keyframes slideUpBoy { from { transform: translateY(120px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
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
                  <rect x="205" y="323" width="110" height="8" rx="4" fill="#cbd5e1"/>
                  <rect x="325" y="168" width="30" height="28" rx="8" fill="#fbbf8a"/>
                  <ellipse cx="340" cy="145" rx="48" ry="52" fill="#fbbf8a"/>
                  <path d="M292 130 Q295 85 340 80 Q385 85 388 130 Q380 105 340 100 Q300 105 292 130Z" fill="#1e1b4b"/>
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

              <div className="form-card" style={{ position: 'relative', zIndex: 1 }}>
                <h2 className="form-title">{isLogin ? 'Log in' : 'Sign up'}</h2>
                <p className="form-sub">{isLogin ? 'Welcome back! Enter your credentials.' : 'Create a free account with your email.'}</p>
                <button className="social-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Continue with Google
                </button>
                <button className="social-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#333"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                  Continue with GitHub
                </button>
                <div className="divider-or">or</div>
                {!isLogin && (
                  <div style={{ marginBottom: '8px' }}>
                    <input style={inputStyle} placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    {errors.name && <p className="error-msg">{errors.name}</p>}
                  </div>
                )}
                <div style={{ marginBottom: '8px' }}>
                  <input style={inputStyle} placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  {errors.email && <p className="error-msg">{errors.email}</p>}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ position: 'relative' }}>
                    <input style={{ ...inputStyle, paddingRight: '40px' }} placeholder="Password" type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    <span onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '16px', color: '#94a3b8', zIndex: 10 }}>
                      {showPass ? '🙈' : '👁️'}
                    </span>
                  </div>
                  {errors.password && <p className="error-msg">{errors.password}</p>}
                </div>
                {!isLogin && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ position: 'relative' }}>
                      <input style={{ ...inputStyle, paddingRight: '40px' }} placeholder="Confirm Password" type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
                      <span onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '16px', color: '#94a3b8', zIndex: 10 }}>
                        {showConfirm ? '🙈' : '👁️'}
                      </span>
                    </div>
                    {errors.confirm && <p className="error-msg">{errors.confirm}</p>}
                  </div>
                )}
                {isLogin && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', marginTop: '4px' }}>
                    <input type="checkbox" id="remember" />
                    <label htmlFor="remember" style={{ fontSize: '12px', color: '#64748b', cursor: 'pointer' }}>Remember me</label>
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
        </div>

        {/* Animated Stat Cards */}
        <div className="stats-section">
          {[
            { value: 500, suffix: '+', label: 'Proposals Tracked', color: '#EDE9FE', accent: '#7c3aed' },
            { value: 98, suffix: '%', label: 'Client Satisfaction', color: '#DBEAFE', accent: '#4F46E5' },
            { value: 100, suffix: '%', label: 'Free Forever', color: '#FCE7F3', accent: '#db2777' },
          ].map((stat, i) => (
            <AnimatedStatCard key={stat.label} stat={stat} delay={i * 200} />
          ))}
        </div>

        {/* Marquee Strip */}
        <div className="marquee-wrap">
          <div className="marquee-track">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="marquee-item">{item}</span>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="section" style={{ backgroundColor: '#FFFFFF' }}>
          <RevealDiv>
            <h2 className="section-title">Everything you need to win more deals</h2>
            <p className="section-sub">Powerful features built specifically for freelancers</p>
          </RevealDiv>
          <div className="features-grid">
            {features.map((f, i) => (
              <RevealDiv key={f.title} delay={i * 100}>
                <TiltCard style={{ height: '100%' }}>
                  <div className="feature-card">
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>{f.icon}</div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e1b4b', marginBottom: '8px' }}>{f.title}</h3>
                    <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>{f.desc}</p>
                  </div>
                </TiltCard>
              </RevealDiv>
            ))}
          </div>

          {/* Trust Badges */}
          <RevealDiv delay={200}>
            <div className="trust-badges">
              {['🔒 100% Secure', '📱 Mobile Friendly', '⚡ Lightning Fast', '🌙 Dark Mode', '📤 Export Ready', '🆓 Free Forever'].map((badge) => (
                <div key={badge} className="trust-badge">{badge}</div>
              ))}
            </div>
          </RevealDiv>
        </div>

        {/* Live Preview Tabs */}
        <div className="section">
          <RevealDiv>
            <h2 className="section-title">See it in action</h2>
            <p className="section-sub">Explore different parts of the app</p>
          </RevealDiv>
          <RevealDiv delay={100}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {tabs.map((tab) => (
                <button key={tab} className="tab-btn" onClick={() => setActiveTab(tab)}
                  style={{
                    backgroundColor: activeTab === tab ? '#4F46E5' : '#FFFFFF',
                    color: activeTab === tab ? 'white' : '#64748b',
                    border: activeTab === tab ? 'none' : '1px solid #E9E9E7',
                    boxShadow: activeTab === tab ? '0 4px 12px rgba(79,70,229,0.3)' : 'none'
                  }}>
                  {tab}
                </button>
              ))}
            </div>
            <div style={{ maxWidth: '800px', margin: '0 auto', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E9E9E7', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
              <div style={{ backgroundColor: '#f1f3f4', padding: '10px 16px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f57' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#febc2e' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#28c840' }} />
                <span style={{ marginLeft: '8px', fontSize: '12px', color: '#64748b' }}>freelancer-proposal-tracker.netlify.app/{activeTab.toLowerCase()}</span>
              </div>
              <img src={tabImages[activeTab]} alt={activeTab} style={{ width: '100%', display: 'block' }} />
            </div>
          </RevealDiv>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="section" style={{ backgroundColor: '#FFFFFF' }}>
          <RevealDiv>
            <h2 className="section-title">Get started in minutes</h2>
            <p className="section-sub">Three simple steps to transform your freelance business</p>
          </RevealDiv>
          <div className="steps-grid">
            {steps.map((step, i) => (
              <RevealDiv key={step.num} delay={i * 150}>
                <div className="step-card">
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>{step.icon}</div>
                  <div className="step-num">{step.num}</div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e1b4b', marginBottom: '8px' }}>{step.title}</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>{step.desc}</p>
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div id="testimonials" className="section">
          <RevealDiv>
            <h2 className="section-title">Loved by freelancers worldwide</h2>
            <p className="section-sub">Join hundreds of freelancers already using FP Tracker</p>
          </RevealDiv>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <RevealDiv key={t.name} delay={i * 100}>
                <div className="testimonial-card">
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.7', marginBottom: '16px', fontStyle: 'italic' }}>"{t.quote}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '32px' }}>{t.avatar}</div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: '#1e1b4b' }}>{t.name}</p>
                      <p style={{ fontSize: '11px', color: '#94a3b8' }}>{t.role}</p>
                    </div>
                    <div style={{ marginLeft: 'auto', color: '#F59E0B', fontSize: '14px' }}>★★★★★</div>
                  </div>
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="section" style={{ backgroundColor: '#FFFFFF' }}>
          <RevealDiv>
            <h2 className="section-title">Simple, transparent pricing</h2>
            <p className="section-sub">No hidden fees. No credit card required.</p>
          </RevealDiv>
          <RevealDiv delay={100}>
            <div className="pricing-card">
              <div className="pricing-badge">🎉 Most Popular</div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '48px', fontWeight: '800', background: 'linear-gradient(135deg, #4F46E5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Free</div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Forever. No credit card needed.</div>
              </div>
              {[
                '✅ Unlimited Clients', '✅ Unlimited Proposals', '✅ Kanban Board',
                '✅ PDF & CSV Export', '✅ Dark Mode', '✅ Analytics Dashboard',
                '✅ Activity Log', '✅ Proposal Templates', '✅ Global Search',
                '✅ Mobile Responsive', '✅ Data Backup & Restore'
              ].map((feature) => (
                <div key={feature} style={{ fontSize: '13px', color: '#374151', padding: '6px 0', borderBottom: '1px solid #F1F0EE' }}>{feature}</div>
              ))}
              <button onClick={() => scrollToForm(false)} style={{
                width: '100%', marginTop: '20px', padding: '13px', borderRadius: '50px',
                border: 'none', background: 'linear-gradient(135deg, #4F46E5, #7c3aed)',
                color: 'white', fontSize: '15px', fontWeight: '700', cursor: 'pointer',
                fontFamily: 'inherit', boxShadow: '0 0 20px rgba(124,58,237,0.4)'
              }}>Get Started for Free</button>
            </div>
          </RevealDiv>
        </div>

        {/* FAQ Section */}
        <div id="faq" className="section">
          <RevealDiv>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-sub">Everything you need to know about FP Tracker</p>
          </RevealDiv>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {faqs.map((faq, i) => (
              <RevealDiv key={i} delay={i * 50}>
                <div className="faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <div className="faq-q">
                    <span>{faq.q}</span>
                    <span style={{ fontSize: '18px', color: '#4F46E5', transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
                  </div>
                  {openFaq === i && <div className="faq-a">{faq.a}</div>}
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <RevealDiv>
          <div className="cta-section">
            <h2 className="cta-title">Ready to win more deals? 🚀</h2>
            <p className="cta-sub">Join hundreds of freelancers managing their business smarter with FP Tracker</p>
            <button className="cta-btn" onClick={() => scrollToForm(false)}>Get Started for Free</button>
          </div>
        </RevealDiv>

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