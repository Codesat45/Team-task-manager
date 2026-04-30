import { useState } from 'react'
import { Bell, ChevronDown, LogOut, User, Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getInitials } from '../utils/helpers'
import { RoleBadge } from './ui/Badge'

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left: hamburger (mobile) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Center: page title placeholder (filled by page) */}
      <div className="flex-1 lg:flex-none" />

      {/* Right: user menu */}
      <div className="flex items-center gap-2">
        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-800 leading-tight">{user?.name}</p>
              <p className="text-xs text-slate-400 leading-tight capitalize">{user?.role}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  <div className="mt-1.5">
                    <RoleBadge role={user?.role} />
                  </div>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => { setDropdownOpen(false); logout() }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
