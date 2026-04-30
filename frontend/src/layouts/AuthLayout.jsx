import { Outlet } from 'react-router-dom'

const AuthLayout = () => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      {/* Brand */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="3" width="16" height="18" rx="2" stroke="white" strokeWidth="2" fill="none"/>
            <path d="M9 3h6a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2z" fill="white"/>
            <path d="M8 12l2.5 2.5L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-2xl font-bold text-slate-800">Team Task Manager</span>
      </div>
      <Outlet />
    </div>
  </div>
)

export default AuthLayout
