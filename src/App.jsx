import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Proposals from './pages/Proposals'
import Followups from './pages/Followups'
import Landing from './pages/Landing'
import Profile from './pages/Profile'
import { useTheme } from './context/ThemeContext'
import ClientDetail from './pages/ClientDetail'
import Kanban from './pages/Kanban'

function App() {
  const { isDark } = useTheme()
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard/*" element={
        <div className="flex min-h-screen" style={{ backgroundColor: isDark ? '#1a1a1a' : '#F7F6F3' }}>
          <Sidebar />
          <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8 w-full" style={{ color: isDark ? '#ffffff' : '#37352F', minWidth: 0 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/proposals" element={<Proposals />} />
              <Route path="/followups" element={<Followups />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/clients/:id" element={<ClientDetail />} />
              <Route path="/kanban" element={<Kanban />} />
            </Routes>
          </main>
        </div>
      } />
    </Routes>
  )
}

export default App