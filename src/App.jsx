import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Proposals from './pages/Proposals'
import Followups from './pages/Followups'

function App() {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F7F6F3' }}>
      <Sidebar />
      <main className="flex-1 p-8" style={{ color: '#37352F' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/proposals" element={<Proposals />} />
          <Route path="/followups" element={<Followups />} />
        </Routes>
      </main>
    </div>
  )
}

export default App