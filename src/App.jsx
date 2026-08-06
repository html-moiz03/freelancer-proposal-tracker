import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
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

function App() {
  const { isDark } = useTheme()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard/*" element={
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          backgroundColor: isDark ? '#1a1a1a' : '#F7F6F3'
        }}>
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
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/proposals" element={<Proposals />} />
              <Route path="/followups" element={<Followups />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/clients/:id" element={<ClientDetail />} />
              <Route path="/kanban" element={<Kanban />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      } />
    </Routes>
  )
}

export default App