import { NavLink } from 'react-router-dom'

const links = [
  { path: '/dashboard', label: '🏠 Dashboard' },
  { path: '/dashboard/clients', label: '👤 Clients' },
  { path: '/dashboard/proposals', label: '📄 Proposals' },
  { path: '/dashboard/followups', label: '🔔 Follow-ups' },
]

function Sidebar() {
  const session = JSON.parse(localStorage.getItem('fpt_session') || '{}')
  const initials = session.name ? session.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'FP'

  return (
    <aside className="w-64 min-h-screen p-4 flex flex-col gap-1" style={{ backgroundColor: '#F1F0EE' }}>
      <div className="mb-6 px-3 pt-3">
        <h1 className="font-bold text-lg" style={{ color: '#37352F' }}>FP Tracker</h1>
        <p className="text-xs mt-0.5" style={{ color: '#9B9A97' }}>Freelancer CRM</p>
      </div>

      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          end
          className={({ isActive }) =>
            `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive ? 'bg-white shadow-sm font-semibold' : 'hover:bg-white/60'
            }`
          }
          style={({ isActive }) => ({ color: isActive ? '#37352F' : '#6B6B6B' })}
        >
          {link.label}
        </NavLink>
      ))}

      {/* Profile at bottom */}
      <div className="mt-auto pt-4 border-t" style={{ borderColor: '#E9E9E7' }}>
        <NavLink
          to="/dashboard/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive ? 'bg-white shadow-sm' : 'hover:bg-white/60'
            }`
          }
        >
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #4F46E5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: '800', color: 'white', flexShrink: 0
          }}>
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: '#37352F' }}>{session.name || 'User'}</p>
            <p className="text-xs" style={{ color: '#9B9A97' }}>View Profile</p>
          </div>
        </NavLink>
      </div>
    </aside>
  )
}

export default Sidebar