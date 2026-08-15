import { useState, useEffect, useRef } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Proposals from './pages/Proposals'
import Followups from './pages/Followups'
import Landing from './pages/Landing'
import Profile from './pages/Profile'
import ClientDetail from './pages/ClientDetail'
import Kanban from './pages/Kanban'
import Settings from './pages/Settings'
import { useTheme } from './context/ThemeContext'
import NotificationBell from './components/NotificationBell'
import GlobalSearch from './components/GlobalSearch'
import QuickAdd from './components/QuickAdd'
import DailySummary from './components/DailySummary'
import OnboardingTour from './components/OnboardingTour'
import CommandPalette from './components/CommandPalette'
import CalendarPage from './pages/Calendar'

function StarsBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random(),
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleDirection: Math.random() > 0.5 ? 1 : -1
    }))

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      stars.forEach(star => {
        star.opacity += star.twinkleSpeed * star.twinkleDirection
        if (star.opacity >= 1 || star.opacity <= 0.1) {
          star.twinkleDirection *= -1
        }

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.fill()

        // Add glow to bigger stars
        if (star.radius > 1.2) {
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(196, 181, 253, ${star.opacity * 0.3})`
          ctx.fill()
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
        opacity: 0.6
      }}
    />
  )
}

function App() {
  const { isDark, accent } = useTheme()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [showShortcuts, setShowShortcuts] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return
      // Don't trigger if Ctrl/Cmd is pressed (reserved for browser/search)
      if (e.ctrlKey || e.metaKey) return

      switch (e.key) {
        case 'd': navigate('/dashboard'); break
        case 'c': navigate('/dashboard/clients'); break
        case 'p': navigate('/dashboard/proposals'); break
        case 'f': navigate('/dashboard/followups'); break
        case 'k': navigate('/dashboard/kanban'); break
        case 's': navigate('/dashboard/settings'); break
        case '?':
          setShowShortcuts(prev => !prev)
          break
        default: break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard/*" element={
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          backgroundColor: isDark ? '#1a1a1a' : '#F7F6F3'
        }}>
          {isDark && <StarsBackground />}
          <Sidebar />
          <main style={{
            flex: 1,
            padding: isMobile ? '60px 16px 16px 16px' : '32px',
            width: isMobile ? '100vw' : 'calc(100vw - 256px)',
            maxWidth: isMobile ? '100vw' : 'calc(100vw - 256px)',
            overflowX: 'hidden',
            color: isDark ? '#ffffff' : '#37352F',
            minWidth: 0,
            boxSizing: 'border-box'
          }}>
            <NotificationBell />
            <GlobalSearch />
            <QuickAdd />
            <DailySummary />
            <OnboardingTour />
            <CommandPalette />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/proposals" element={<Proposals />} />
              <Route path="/followups" element={<Followups />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/clients/:id" element={<ClientDetail />} />
              <Route path="/kanban" element={<Kanban />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>

            {/* Keyboard Shortcuts Modal */}
            {showShortcuts && (
              <>
                <div onClick={() => setShowShortcuts(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000 }} />
                <div style={{
                  position: 'fixed', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1001, width: '90%', maxWidth: '400px',
                  backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF',
                  borderRadius: '16px', padding: '24px',
                  boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
                  border: `1px solid ${isDark ? '#2a2a2a' : '#E9E9E7'}`,
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: isDark ? '#ffffff' : '#37352F', marginBottom: '16px' }}>⌨️ Keyboard Shortcuts</h3>
                  {[
                    { key: 'D', desc: 'Go to Dashboard' },
                    { key: 'C', desc: 'Go to Clients' },
                    { key: 'P', desc: 'Go to Proposals' },
                    { key: 'F', desc: 'Go to Follow-ups' },
                    { key: 'K', desc: 'Go to Kanban' },
                    { key: 'S', desc: 'Go to Settings' },
                    { key: 'Ctrl+K', desc: 'Global Search' },
                    { key: '?', desc: 'Toggle this menu' },
                  ].map((shortcut) => (
                    <div key={shortcut.key} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 0', borderBottom: `1px solid ${isDark ? '#2a2a2a' : '#F1F0EE'}`
                    }}>
                      <span style={{ fontSize: '13px', color: isDark ? '#94a3b8' : '#6B6B6B' }}>{shortcut.desc}</span>
                      <kbd style={{
                        padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700',
                        backgroundColor: isDark ? '#2a2a2a' : '#F1F0EE',
                        color: isDark ? '#ffffff' : '#37352F',
                        border: `1px solid ${isDark ? '#3a3a3a' : '#E9E9E7'}`,
                        fontFamily: 'monospace'
                      }}>{shortcut.key}</kbd>
                    </div>
                  ))}
                  <button onClick={() => setShowShortcuts(false)} style={{
                    width: '100%', marginTop: '16px', padding: '10px', borderRadius: '8px',
                    border: 'none', backgroundColor: accent, color: 'white',
                    fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit'
                  }}>Got it!</button>
                </div>
              </>
            )}
          </main>
        </div>
      } />
    </Routes>
  )
}

export default App