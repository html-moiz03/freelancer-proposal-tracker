import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

function AnimatedBackground({ isDark }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      opacity: Math.random() * 0.4 + 0.1,
      color: ['#7c3aed', '#4F46E5', '#f97316', '#c7d2fe'][Math.floor(Math.random() * 4)]
    }))
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', handleResize)
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color; ctx.globalAlpha = p.opacity; ctx.fill()
      })
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x; const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = '#7c3aed'; ctx.globalAlpha = (1 - dist / 100) * 0.1
            ctx.lineWidth = 0.5; ctx.stroke()
          }
        })
      })
      ctx.globalAlpha = 1
      animationId = requestAnimationFrame(animate)
    }
    animate()
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', handleResize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, opacity: isDark ? 0.6 : 0.4 }} />
}

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
    <div ref={ref} style={{ width: '160px', borderRadius: '120px 120px 20px 20px', backgroundColor: stat.color, padding: '30px 16px 24px', textAlign: 'center', transform: visible ? 'translateY(0)' : 'translateY(40px)', opacity: visible ? 1 : 0, transition: `all 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms` }}>
      <div style={{ fontSize: '36px', fontWeight: '800', color: stat.accent, lineHeight: 1, marginBottom: '6px' }}>{stat.suffix === '+' ? `${count}+` : `${count}%`}</div>
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
    <div ref={ref} style={{ transform: visible ? 'translateY(0)' : 'translateY(40px)', opacity: visible ? 1 : 0, transition: `all 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`, ...style }}>{children}</div>
  )
}

function TiltCard({ children, style = {} }) {
  const cardRef = useRef(null)
  const handleMouseMove = (e) => {
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const rotateX = (e.clientY - rect.top - rect.height / 2) / 10
    const rotateY = (rect.width / 2 - (e.clientX - rect.left)) / 10
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`
    card.style.boxShadow = '0 20px 60px rgba(0,0,0,0.12)'
  }
  const handleMouseLeave = () => {
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)'
    cardRef.current.style.boxShadow = 'none'
  }
  return <div ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ transition: 'transform 0.1s ease, box-shadow 0.3s ease', ...style }}>{children}</div>
}

export default function Landing() {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
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
      setScrollProgress((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => { window.removeEventListener('resize', handleResize); window.removeEventListener('scroll', handleScroll) }
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
      if (!saved || saved.email !== form.email || saved.password !== form.password) { setErrors({ email: 'Invalid email or password' }); return }
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

  const bg = isDark ? '#0f0f0f' : '#F7F6F3'
  const textColor = isDark ? '#ffffff' : '#1e1b4b'
  const subColor = isDark ? '#94a3b8' : '#64748b'
  const cardBg = isDark ? '#1a1a1a' : '#FFFFFF'
  const borderColor = isDark ? '#2a2a2a' : '#E9E9E7'

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: `1.5px solid ${isDark ? '#2a2a2a' : '#E2E8F0'}`,
    backgroundColor: isDark ? '#111111' : '#FFFFFF',
    fontSize: '14px', color: isDark ? '#ffffff' : '#1e1b4b', outline: 'none',
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
  const tabImages = { Dashboard: '/dashboard-preview.png', Proposals: '/proposals-preview.png', Kanban: '/kanban-preview.png', Settings: '/settings-preview.png' }
  const faqs = [
    { q: 'Is FP Tracker really free?', a: 'Yes! FP Tracker is completely free forever. No credit card required, no hidden fees.' },
    { q: 'Is my data safe?', a: 'Your data is stored locally in your browser using localStorage. You can export a full JSON backup anytime from Settings.' },
    { q: 'Can I use it on mobile?', a: 'Absolutely! FP Tracker is fully responsive with a mobile-friendly sidebar and layout.' },
    { q: 'Can I export my proposals?', a: 'Yes! Export proposals as branded PDFs, or export all data as CSV or JSON files.' },
    { q: 'Does it support multiple currencies?', a: 'Yes! Switch between PKR, USD, EUR, GBP, and AED from the Settings page.' },
    { q: 'Can I customize the appearance?', a: 'Yes! Switch between light and dark mode, and choose from 6 accent colors in Settings.' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: ${bg}; }
        .landing-root { min-height: 100vh; background-color: ${bg}; position: relative; overflow-x: hidden; display: flex; flex-direction: column; transition: background-color 0.3s; }
        .hero-glow { position: absolute; top: -100px; left: 50%; transform: translateX(-50%); width: 700px; height: 500px; background: radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, rgba(79,70,229,0.06) 40%, transparent 70%); pointer-events: none; z-index: 0; border-radius: 50%; }
        .main-content { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 24px; gap: 60px; position: relative; z-index: 1; flex-wrap: wrap; }
        .left-side { flex: 1; min-width: 280px; max-width: 500px; transform: translateX(-60px); opacity: 0; transition: all 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
        .left-side.visible { transform: translateX(0); opacity: 1; }
        .badge { display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #ede9fe, #fce7f3); border: 1px solid #ddd6fe; border-radius: 50px; padding: 5px 14px; font-size: 12px; font-weight: 600; color: #7c3aed; margin-bottom: 16px; }
        .tagline { font-size: 26px; font-weight: 800; line-height: 1.25; margin-bottom: 12px; letter-spacing: -0.5px; color: ${textColor}; }
        .tagline span { background: linear-gradient(135deg, #7c3aed, #f97316, #7c3aed); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: gradientShift 3s linear infinite; }
        @keyframes gradientShift { 0% { background-position: 0% } 100% { background-position: 200% } }
        .desc { font-size: 13px; line-height: 1.7; max-width: 400px; margin-bottom: 16px; color: ${subColor}; }
        .divider { width: 100%; height: 1px; background: linear-gradient(to right, ${isDark ? '#2a2a2a' : '#e2e8f0'}, transparent); margin: 12px 0; }
        .stat-value { font-size: 20px; font-weight: 800; background: linear-gradient(135deg, #7c3aed, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .stat-label { font-size: 11px; color: ${subColor}; font-weight: 500; margin-top: 2px; }
        .feature-item { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 500; color: ${subColor}; }
        .feature-dot { width: 7px; height: 7px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #f97316); flex-shrink: 0; }
        .right-side { flex-shrink: 0; width: 100%; max-width: 380px; transform: translateY(60px); opacity: 0; transition: all 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.2s; }
        .right-side.visible { transform: translateY(0); opacity: 1; }
        .divider-vertical { width: 1px; align-self: stretch; background: linear-gradient(to bottom, transparent, ${borderColor} 30%, ${borderColor} 70%, transparent); flex-shrink: 0; }
        .form-card { background: ${cardBg}; border-radius: 20px; padding: 32px 28px; box-shadow: 0 4px 40px rgba(124,58,237,0.08); border: 1px solid ${borderColor}; position: relative; z-index: 5; }
        .social-btn { width: 100%; padding: 11px; border-radius: 10px; border: 1.5px solid ${borderColor}; background: ${cardBg}; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; color: ${textColor}; font-family: 'Plus Jakarta Sans', sans-serif; transition: background 0.2s; margin-bottom: 8px; }
        .social-btn:hover { background: ${isDark ? '#2a2a2a' : '#F7F6F3'}; }
        .divider-or { display: flex; align-items: center; gap: 12px; margin: 12px 0; color: ${subColor}; font-size: 12px; }
        .divider-or::before, .divider-or::after { content: ''; flex: 1; height: 1px; background: ${borderColor}; }
        .error-msg { font-size: 11px; color: #dc2626; margin-bottom: 8px; }
        .submit-btn { width: 100%; padding: 13px; border-radius: 50px; border: none; background: linear-gradient(135deg, #4F46E5, #7c3aed); color: white; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 8px; transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; box-shadow: 0 0 20px rgba(124,58,237,0.4); }
        .submit-btn:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 0 35px rgba(124,58,237,0.6); }
        .toggle-text { text-align: center; font-size: 13px; color: ${subColor}; margin-top: 20px; }
        .toggle-link { color: #4F46E5; font-weight: 700; cursor: pointer; }
        .stats-section { position: relative; z-index: 1; padding: 20px 24px 30px; display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; background-color: ${bg}; }
        .marquee-wrap { overflow: hidden; white-space: nowrap; background: linear-gradient(135deg, #4F46E5, #7c3aed); padding: 12px 0; position: relative; z-index: 1; }
        .marquee-track { display: inline-flex; animation: marquee 20s linear infinite; }
        .marquee-item { font-size: 13px; font-weight: 600; color: white; padding: 0 24px; }
        @keyframes marquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        .section { position: relative; z-index: 1; padding: 60px 40px; background-color: ${bg}; }
        .section-alt { background-color: ${isDark ? '#111111' : '#FFFFFF'}; }
        .section-title { font-size: 28px; font-weight: 800; color: ${textColor}; text-align: center; margin-bottom: 8px; }
        .section-sub { font-size: 14px; color: ${subColor}; text-align: center; margin-bottom: 40px; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 900px; margin: 0 auto; }
        .feature-card { background: ${isDark ? 'rgba(26,26,26,0.9)' : 'rgba(255,255,255,0.9)'}; backdrop-filter: blur(12px); border-radius: 16px; padding: 24px; border: 1px solid ${borderColor}; height: 100%; }
        .steps-grid { display: flex; gap: 24px; max-width: 800px; margin: 0 auto; justify-content: center; flex-wrap: wrap; }
        .step-card { flex: 1; min-width: 200px; text-align: center; }
        .step-num { font-size: 48px; font-weight: 800; background: linear-gradient(135deg, #7c3aed, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; margin-bottom: 12px; }
        .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 900px; margin: 0 auto; }
        .testimonial-card { background: ${isDark ? 'rgba(26,26,26,0.9)' : 'rgba(255,255,255,0.9)'}; backdrop-filter: blur(12px); border-radius: 16px; padding: 24px; border: 1px solid ${borderColor}; }
        .trust-badges { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; margin-top: 32px; }
        .trust-badge { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: ${cardBg}; border: 1px solid ${borderColor}; font-size: 12px; font-weight: 600; color: ${subColor}; border-radius: 50px; }
        .pricing-card { background: ${cardBg}; border-radius: 20px; padding: 32px; border: 2px solid #4F46E5; max-width: 360px; margin: 0 auto; position: relative; box-shadow: 0 8px 40px rgba(79,70,229,0.12); }
        .pricing-badge { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #4F46E5, #7c3aed); color: white; font-size: 12px; font-weight: 700; padding: 4px 16px; border-radius: 20px; white-space: nowrap; }
        .faq-item { border-bottom: 1px solid ${borderColor}; padding: 16px 0; cursor: pointer; max-width: 700px; margin: 0 auto; }
        .faq-q { display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: 600; color: ${textColor}; }
        .faq-a { font-size: 13px; color: ${subColor}; line-height: 1.7; margin-top: 10px; }
        .tab-btn { padding: 8px 20px; border-radius: 8px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; }
        .cta-section { position: relative; z-index: 1; padding: 80px 40px; text-align: center; background: linear-gradient(135deg, #4F46E5, #7c3aed); }
        .cta-title { font-size: 32px; font-weight: 800; color: white; margin-bottom: 12px; }
        .cta-sub { font-size: 15px; color: rgba(255,255,255,0.8); margin-bottom: 32px; }
        .cta-btn { padding: 14px 36px; border-radius: 50px; border: 2px solid white; background: white; color: #4F46E5; font-size: 15px; font-weight: 800; cursor: pointer; transition: all 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; box-shadow: 0 0 30px rgba(255,255,255,0.3); }
        .cta-btn:hover { background: transparent; color: white; }
        .footer { position: relative; z-index: 1; border-top: 1px solid ${borderColor}; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; background: ${bg}; flex-wrap: wrap; gap: 8px; }
        .footer-left { font-size: 12px; color: ${subColor}; }
        .footer-links { display: flex; gap: 12px; flex-wrap: wrap; }
        .footer-link { font-size: 12px; color: ${subColor}; cursor: pointer; }
        .footer-link:hover { color: #4F46E5; }
        @media (max-width: 768px) {
          .main-content { flex-direction: column; align-items: center; padding: 24px 16px; gap: 32px; }
          .left-side, .right-side { max-width: 100%; width: 100%; flex: none; }
          .divider-vertical { display: none; }
          .tagline { font-size: 22px; }
          .features-grid, .testimonials-grid { grid-template-columns: 1fr; }
          .steps-grid { flex-direction: column; }
          .section { padding: 40px 20px; }
          .nav-links { display: none; }
          .cta-section { padding: 50px 20px; }
          .cta-title { font-size: 24px; }
        }
      `}</style>

      <div className="landing-root">
        <AnimatedBackground isDark={isDark} />

        {/* Scroll Progress */}
        <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, height: '3px', width: `${scrollProgress}%`, background: 'linear-gradient(135deg, #7c3aed, #4F46E5, #f97316)', transition: 'width 0.1s ease' }} />

        {/* Navbar */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: isDark ? 'rgba(15,15,15,0.9)' : 'rgba(247,246,243,0.9)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${borderColor}`, padding: isMobile ? '12px 16px' : '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: '800', fontSize: isMobile ? '14px' : '18px', background: 'linear-gradient(135deg, #4F46E5, #7c3aed, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', cursor: 'pointer', letterSpacing: '-0.5px' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            FP Tracker
          </div>
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            {['Features', 'How It Works', 'Testimonials', 'Pricing', 'FAQ'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} style={{ fontSize: '13px', fontWeight: '600', color: subColor, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = textColor} onMouseLeave={e => e.target.style.color = subColor}>{item}</a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={toggleTheme} style={{ width: '36px', height: '36px', borderRadius: '50%', border: `1.5px solid ${borderColor}`, backgroundColor: cardBg, cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isDark ? '☀️' : '🌙'}
            </button>
            <button onClick={() => scrollToForm(true)} style={{ padding: isMobile ? '6px 12px' : '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: `1.5px solid ${borderColor}`, backgroundColor: 'transparent', color: textColor, fontFamily: 'inherit' }}>Log in</button>
            <button onClick={() => scrollToForm(false)} style={{ padding: isMobile ? '6px 12px' : '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg, #4F46E5, #7c3aed)', color: 'white', fontFamily: 'inherit', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>Get Started</button>
          </div>
        </nav>

        {/* Hero */}
        <div style={{ position: 'relative' }}>
          <div className="hero-glow" />
          <div className="main-content">
            <div className={`left-side ${logoVisible ? 'visible' : ''}`}>
              <div className="badge">✦ Your Freelance CRM — Free Forever</div>
              <div style={{
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: '800',
                fontSize: isMobile ? '28px' : '36px',
                background: 'linear-gradient(135deg, #4F46E5, #7c3aed, #f97316)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradientShift 3s linear infinite',
                marginBottom: '16px',
                letterSpacing: '-1px',
                lineHeight: 1.2
              }}>
                Freelancer<br />Proposal Tracker
              </div>
              <h1 className="tagline">Manage your freelance<br />business <span>like a pro.</span></h1>
              <p className="desc">Freelancer Proposal Tracker is your all-in-one CRM to manage clients, track proposals, monitor deal statuses, and never miss a follow-up.</p>
              <div className="divider" />
              <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {[{ value: '500+', label: 'Proposals Tracked' }, { value: '98%', label: 'Client Satisfaction' }, { value: 'Free', label: 'Forever Plan' }].map((s) => (
                  <div key={s.label}><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
                ))}
              </div>
              <div className="divider" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {['Track proposals from Draft to Won', 'Manage all your clients in one place', 'Get overdue follow-up alerts automatically', 'Visualize your revenue and win rate'].map((f) => (
                  <div key={f} className="feature-item"><div className="feature-dot" />{f}</div>
                ))}
              </div>
              {!isMobile && (
                <div style={{ position: 'relative', marginTop: '4px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: subColor, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>✦ Live Dashboard Preview</div>
                  <div style={{ position: 'absolute', top: '-8px', right: '8px', background: 'linear-gradient(135deg, #7c3aed, #f97316)', color: 'white', fontSize: '10px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>Real-time</div>
                  <img src="/dashboard-preview.png" alt="Dashboard" style={{ width: '100%', borderRadius: '12px', border: `1.5px solid ${borderColor}`, boxShadow: '0 8px 30px rgba(0,0,0,0.08)', display: 'block' }} />
                </div>
              )}
            </div>

            {!isMobile && <div className="divider-vertical" />}

            <div className={`right-side ${formVisible ? 'visible' : ''}`}>
              <div className="form-card">
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: textColor, marginBottom: '6px', textAlign: 'center' }}>{isLogin ? 'Log in' : 'Sign up'}</h2>
                <p style={{ fontSize: '13px', color: subColor, textAlign: 'center', marginBottom: '20px' }}>{isLogin ? 'Welcome back! Enter your credentials.' : 'Create a free account with your email.'}</p>

                <button className="social-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Continue with Google
                </button>
                <button className="social-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={isDark ? '#ffffff' : '#333'}><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
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
                    <span onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '16px', color: subColor }}>{showPass ? '🙈' : '👁️'}</span>
                  </div>
                  {errors.password && <p className="error-msg">{errors.password}</p>}
                </div>
                {!isLogin && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ position: 'relative' }}>
                      <input style={{ ...inputStyle, paddingRight: '40px' }} placeholder="Confirm Password" type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
                      <span onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '16px', color: subColor }}>{showConfirm ? '🙈' : '👁️'}</span>
                    </div>
                    {errors.confirm && <p className="error-msg">{errors.confirm}</p>}
                  </div>
                )}
                {isLogin && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', marginTop: '4px' }}>
                    <input type="checkbox" id="remember" />
                    <label htmlFor="remember" style={{ fontSize: '12px', color: subColor, cursor: 'pointer' }}>Remember me</label>
                  </div>
                )}
                <button className="submit-btn" onClick={handleSubmit}>{isLogin ? 'Log in' : 'Sign up'}</button>
                <p className="toggle-text">
                  {isLogin ? "Don't have an account? " : 'Have an account? '}
                  <span className="toggle-link" onClick={() => { setIsLogin(!isLogin); setErrors({}); setForm({ name: '', email: '', password: '', confirm: '' }) }}>{isLogin ? 'Sign up' : 'Log in'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="stats-section">
          {[{ value: 500, suffix: '+', label: 'Proposals Tracked', color: '#EDE9FE', accent: '#7c3aed' }, { value: 98, suffix: '%', label: 'Client Satisfaction', color: '#DBEAFE', accent: '#4F46E5' }, { value: 100, suffix: '%', label: 'Free Forever', color: '#FCE7F3', accent: '#db2777' }].map((stat, i) => (
            <AnimatedStatCard key={stat.label} stat={stat} delay={i * 200} />
          ))}
        </div>

        {/* Marquee */}
        <div className="marquee-wrap">
          <div className="marquee-track">
            {[...marqueeItems, ...marqueeItems].map((item, i) => <span key={i} className="marquee-item">{item}</span>)}
          </div>
        </div>

        {/* Features */}
        <div id="features" className="section section-alt">
          <RevealDiv><h2 className="section-title">Everything you need to win more deals</h2><p className="section-sub">Powerful features built specifically for freelancers</p></RevealDiv>
          <div className="features-grid">
            {features.map((f, i) => (
              <RevealDiv key={f.title} delay={i * 100}>
                <TiltCard style={{ height: '100%' }}>
                  <div className="feature-card">
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>{f.icon}</div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: textColor, marginBottom: '8px' }}>{f.title}</h3>
                    <p style={{ fontSize: '13px', color: subColor, lineHeight: '1.6' }}>{f.desc}</p>
                  </div>
                </TiltCard>
              </RevealDiv>
            ))}
          </div>
          <RevealDiv delay={200}>
            <div className="trust-badges">
              {['🔒 100% Secure', '📱 Mobile Friendly', '⚡ Lightning Fast', '🌙 Dark Mode', '📤 Export Ready', '🆓 Free Forever'].map((badge) => (
                <div key={badge} className="trust-badge">{badge}</div>
              ))}
            </div>
          </RevealDiv>
        </div>

        {/* Preview Tabs */}
        <div className="section">
          <RevealDiv><h2 className="section-title">See it in action</h2><p className="section-sub">Explore different parts of the app</p></RevealDiv>
          <RevealDiv delay={100}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {tabs.map((tab) => (
                <button key={tab} className="tab-btn" onClick={() => setActiveTab(tab)}
                  style={{ backgroundColor: activeTab === tab ? '#4F46E5' : cardBg, color: activeTab === tab ? 'white' : subColor, border: activeTab === tab ? 'none' : `1px solid ${borderColor}`, boxShadow: activeTab === tab ? '0 4px 12px rgba(79,70,229,0.3)' : 'none' }}>
                  {tab}
                </button>
              ))}
            </div>
            <div style={{ maxWidth: '800px', margin: '0 auto', borderRadius: '16px', overflow: 'hidden', border: `1px solid ${borderColor}`, boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
              <div style={{ backgroundColor: isDark ? '#1a1a1a' : '#f1f3f4', padding: '10px 16px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                {['#ff5f57', '#febc2e', '#28c840'].map(c => <div key={c} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: c }} />)}
                <span style={{ marginLeft: '8px', fontSize: '12px', color: subColor }}>freelancer-proposal-tracker.netlify.app/{activeTab.toLowerCase()}</span>
              </div>
              <img src={tabImages[activeTab]} alt={activeTab} style={{ width: '100%', display: 'block' }} />
            </div>
          </RevealDiv>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="section section-alt">
          <RevealDiv><h2 className="section-title">Get started in minutes</h2><p className="section-sub">Three simple steps to transform your freelance business</p></RevealDiv>
          <div className="steps-grid">
            {steps.map((step, i) => (
              <RevealDiv key={step.num} delay={i * 150}>
                <div className="step-card">
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>{step.icon}</div>
                  <div className="step-num">{step.num}</div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: textColor, marginBottom: '8px' }}>{step.title}</h3>
                  <p style={{ fontSize: '13px', color: subColor, lineHeight: '1.6' }}>{step.desc}</p>
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div id="testimonials" className="section">
          <RevealDiv><h2 className="section-title">Loved by freelancers worldwide</h2><p className="section-sub">Join hundreds of freelancers already using FP Tracker</p></RevealDiv>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <RevealDiv key={t.name} delay={i * 100}>
                <div className="testimonial-card">
                  <p style={{ fontSize: '13px', color: subColor, lineHeight: '1.7', marginBottom: '16px', fontStyle: 'italic' }}>"{t.quote}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '32px' }}>{t.avatar}</div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: textColor }}>{t.name}</p>
                      <p style={{ fontSize: '11px', color: subColor }}>{t.role}</p>
                    </div>
                    <div style={{ marginLeft: 'auto', color: '#F59E0B', fontSize: '14px' }}>★★★★★</div>
                  </div>
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div id="pricing" className="section section-alt">
          <RevealDiv><h2 className="section-title">Simple, transparent pricing</h2><p className="section-sub">No hidden fees. No credit card required.</p></RevealDiv>
          <RevealDiv delay={100}>
            <div className="pricing-card">
              <div className="pricing-badge">🎉 Most Popular</div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '48px', fontWeight: '800', background: 'linear-gradient(135deg, #4F46E5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Free</div>
                <div style={{ fontSize: '14px', color: subColor }}>Forever. No credit card needed.</div>
              </div>
              {['✅ Unlimited Clients', '✅ Unlimited Proposals', '✅ Kanban Board', '✅ PDF & CSV Export', '✅ Dark Mode', '✅ Analytics Dashboard', '✅ Activity Log', '✅ Proposal Templates', '✅ Global Search', '✅ Mobile Responsive', '✅ Data Backup & Restore'].map((feature) => (
                <div key={feature} style={{ fontSize: '13px', color: textColor, padding: '6px 0', borderBottom: `1px solid ${borderColor}` }}>{feature}</div>
              ))}
              <button onClick={() => scrollToForm(false)} style={{ width: '100%', marginTop: '20px', padding: '13px', borderRadius: '50px', border: 'none', background: 'linear-gradient(135deg, #4F46E5, #7c3aed)', color: 'white', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>Get Started for Free</button>
            </div>
          </RevealDiv>
        </div>

        {/* FAQ */}
        <div id="faq" className="section">
          <RevealDiv><h2 className="section-title">Frequently Asked Questions</h2><p className="section-sub">Everything you need to know about FP Tracker</p></RevealDiv>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {faqs.map((faq, i) => (
              <RevealDiv key={i} delay={i * 50}>
                <div className="faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <div className="faq-q">
                    <span>{faq.q}</span>
                    <span style={{ fontSize: '18px', color: '#4F46E5', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)', display: 'inline-block', transition: 'transform 0.2s' }}>+</span>
                  </div>
                  {openFaq === i && <div className="faq-a">{faq.a}</div>}
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>

        {/* CTA */}
        <RevealDiv>
          <div className="cta-section">
            <h2 className="cta-title">Ready to win more deals? 🚀</h2>
            <p className="cta-sub">Join hundreds of freelancers managing their business smarter</p>
            <button className="cta-btn" onClick={() => scrollToForm(false)}>Get Started for Free</button>
          </div>
        </RevealDiv>

        <footer className="footer">
          <div className="footer-left">© 2026 Freelancer Proposal Tracker. All rights reserved.</div>
          <div className="footer-links">
            {['Report an Issue', 'Trouble Signing In', 'Privacy Policy', 'Terms of Service', 'Contact Support'].map(link => (
              <span key={link} className="footer-link">{link}</span>
            ))}
          </div>
        </footer>
      </div>
    </>
  )
}