import { NavLink } from 'react-router-dom'

const links = [
  { path: '/dashboard', label: '🏠 Dashboard' },
  { path: '/dashboard/clients', label: '👤 Clients' },
  { path: '/dashboard/proposals', label: '📄 Proposals' },
  { path: '/dashboard/followups', label: '🔔 Follow-ups' },
]

function Sidebar() {
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
              isActive
                ? 'bg-white shadow-sm font-semibold'
                : 'hover:bg-white/60'
            }`
          }
          style={({ isActive }) => ({
            color: isActive ? '#37352F' : '#6B6B6B',
          })}
        >
          {link.label}
        </NavLink>
      ))}
    </aside>
  )
}

export default Sidebar