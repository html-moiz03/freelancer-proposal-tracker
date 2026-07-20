import { NavLink } from 'react-router-dom'

const links = [
  { path: '/', label: 'Dashboard' },
  { path: '/clients', label: 'Clients' },
  { path: '/proposals', label: 'Proposals' },
  { path: '/followups', label: 'Follow-ups' },
]

function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 min-h-screen p-6 flex flex-col gap-2">
      <h1 className="text-cyan-400 font-bold text-xl mb-6">FP Tracker</h1>
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          end
          className={({ isActive }) =>
            `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-cyan-500 text-gray-900'
                : 'text-gray-300 hover:bg-gray-700'
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </aside>
  )
}

export default Sidebar