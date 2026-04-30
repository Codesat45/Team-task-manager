import { useState, useEffect } from 'react'
import {
  CheckSquare, Clock, AlertTriangle, FolderKanban,
  TrendingUp, Users, ListTodo, Activity, ChevronRight
} from 'lucide-react'
import { dashboardService } from '../services/dashboard.service'
import { useAuth } from '../context/AuthContext'
import { StatusBadge, OverdueBadge } from '../components/ui/Badge'
import { PageLoader } from '../components/ui/Spinner'
import { formatDate, isOverdue } from '../utils/helpers'

// ─── Netflix Stat Card ────────────────────────────────────────────────────────
const NetflixStatCard = ({ title, value, icon: Icon, gradient, sub }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="netflix-stat-card netflix-shimmer rounded-xl border border-slate-200 bg-white p-5 select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300"
          style={{
            background: gradient,
            transform: hovered ? 'scale(1.15) rotate(-5deg)' : 'scale(1) rotate(0deg)',
            boxShadow: hovered ? `0 8px 20px rgba(0,0,0,0.2)` : 'none',
          }}
        >
          <Icon size={20} className="text-white" />
        </div>
        <ChevronRight
          size={16}
          className="text-slate-300 transition-all duration-300"
          style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateX(2px)' : 'translateX(-4px)' }}
        />
      </div>

      {/* Value */}
      <p
        className="text-3xl font-black mb-1 transition-all duration-300"
        style={{
          background: hovered ? gradient : undefined,
          WebkitBackgroundClip: hovered ? 'text' : undefined,
          WebkitTextFillColor: hovered ? 'transparent' : undefined,
          backgroundClip: hovered ? 'text' : undefined,
          color: hovered ? undefined : '#1e293b',
        }}
      >
        {value}
      </p>
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}

      {/* Bottom accent bar */}
      <div className="mt-4 h-1 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            background: gradient,
            width: hovered ? '100%' : '30%',
          }}
        />
      </div>
    </div>
  )
}

// ─── Netflix Task Row ─────────────────────────────────────────────────────────
const NetflixTaskRow = ({ task }) => {
  const [hovered, setHovered] = useState(false)
  const overdue = isOverdue(task.dueDate, task.status)

  return (
    <div
      className="px-5 py-3.5 flex items-center justify-between gap-4 transition-all duration-200 cursor-default"
      style={{
        background: hovered ? 'linear-gradient(90deg, rgba(99,102,241,0.04) 0%, rgba(139,92,246,0.04) 100%)' : 'transparent',
        transform: hovered ? 'translateX(4px)' : 'translateX(0)',
        borderLeft: hovered ? '3px solid #6366f1' : '3px solid transparent',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 truncate">{task.title}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {task.projectId?.name || 'No project'} · {task.assignedTo?.name || 'Unassigned'}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {overdue && <OverdueBadge />}
        <StatusBadge status={task.status} />
        {task.dueDate && (
          <span className={`text-xs hidden sm:block font-medium ${overdue ? 'text-red-500' : 'text-slate-400'}`}>
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { user, isAdmin } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getStats()
        setStats(res.data.data.stats)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard.')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <PageLoader />
  if (error) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-sm text-red-500">{error}</p>
    </div>
  )

  const statCards = [
    { title: 'Total Tasks',      value: stats.totalTasks,      icon: ListTodo,      gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
    { title: 'Completed',        value: stats.completedTasks,  icon: CheckSquare,   gradient: 'linear-gradient(135deg,#10b981,#059669)' },
    { title: 'In Progress',      value: stats.inProgressTasks, icon: Activity,      gradient: 'linear-gradient(135deg,#3b82f6,#2563eb)' },
    { title: 'Overdue',          value: stats.overdueTasks,    icon: AlertTriangle, gradient: 'linear-gradient(135deg,#ef4444,#dc2626)' },
    { title: 'Pending',          value: stats.pendingTasks,    icon: Clock,         gradient: 'linear-gradient(135deg,#f59e0b,#d97706)' },
    { title: 'Projects',         value: stats.totalProjects,   icon: FolderKanban,  gradient: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg,#10b981,#059669)',
      sub: 'Based on all tasks',
    },
    ...(isAdmin ? [{
      title: 'Team Members',
      value: stats.totalUsers,
      icon: Users,
      gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)',
    }] : []),
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800">
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Here's what's happening with your projects today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-indigo-600">Live</span>
        </div>
      </div>

      {/* ── Netflix Stat Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.slice(0, 4).map(card => <NetflixStatCard key={card.title} {...card} />)}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.slice(4).map(card => <NetflixStatCard key={card.title} {...card} />)}
      </div>

      {/* ── Progress Bar ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 netflix-stat-card netflix-shimmer">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-700">Overall Progress</h2>
          <span className="text-sm font-black text-indigo-600">{stats.completionRate}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full transition-all duration-1000"
            style={{
              width: `${stats.completionRate}%`,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
              backgroundSize: '200% 100%',
              animation: 'gradientShift 3s ease infinite',
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
          <span>{stats.completedTasks} completed</span>
          <span>{stats.totalTasks} total</span>
        </div>
      </div>

      {/* ── Recent Tasks — Netflix Row ───────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700">Recent Tasks</h2>
          <span className="text-xs text-slate-400 font-medium">{stats.recentTasks?.length || 0} tasks</span>
        </div>
        {!stats.recentTasks?.length ? (
          <div className="py-12 text-center">
            <CheckSquare size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No tasks yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {stats.recentTasks.map(task => <NetflixTaskRow key={task._id} task={task} />)}
          </div>
        )}
      </div>
    </div>
  )
}

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

export default DashboardPage
