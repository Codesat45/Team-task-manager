import { useState, useEffect } from 'react'
import { Users, Plus, Trash2, AlertTriangle, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/user.service'
import { taskService } from '../services/task.service'
import { projectService } from '../services/project.service'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import { StatusBadge } from '../components/ui/Badge'
import { formatDate, getErrorMessage, getInitials, isOverdue } from '../utils/helpers'

// ─── Assign Task Modal ────────────────────────────────────────────────────────
const AssignTaskModal = ({ isOpen, onClose, memberId, memberName, onTaskAssigned }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    projectId: '',
    dueDate: '',
    status: 'Todo',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState([])

  useEffect(() => {
    if (!isOpen) return
    const fetchProjects = async () => {
      try {
        const res = await projectService.getAll()
        setProjects(res.data.data.projects)
      } catch {
        toast.error('Failed to load projects.')
      }
    }
    fetchProjects()
  }, [isOpen])

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Task title is required.'
    else if (form.title.trim().length < 2) errs.title = 'Title must be at least 2 characters.'
    if (!form.projectId) errs.projectId = 'Project is required.'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const payload = {
        ...form,
        assignedTo: memberId,
        dueDate: form.dueDate || null,
      }
      await taskService.create(payload)
      toast.success(`Task assigned to ${memberName}`)
      onTaskAssigned()
      onClose()
      setForm({ title: '', description: '', projectId: '', dueDate: '', status: 'Todo' })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign Task to ${memberName}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Title */}
          <div className="sm:col-span-2">
            <label className="label">Task Title *</label>
            <input
              name="title"
              className={`input ${errors.title ? 'border-red-400' : ''}`}
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Design homepage mockup"
            />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea
              name="description"
              className="input resize-none"
              rows={2}
              value={form.description}
              onChange={handleChange}
              placeholder="Task details..."
            />
          </div>

          {/* Project */}
          <div>
            <label className="label">Project *</label>
            <select
              name="projectId"
              className={`input ${errors.projectId ? 'border-red-400' : ''}`}
              value={form.projectId}
              onChange={handleChange}
            >
              <option value="">Select project</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            {errors.projectId && <p className="form-error">{errors.projectId}</p>}
          </div>

          {/* Due Date */}
          <div>
            <label className="label">Due Date</label>
            <input
              name="dueDate"
              type="date"
              className="input"
              value={form.dueDate}
              onChange={handleChange}
            />
          </div>

          {/* Status */}
          <div className="sm:col-span-2">
            <label className="label">Initial Status</label>
            <select name="status" className="input" value={form.status} onChange={handleChange}>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <Spinner size="sm" /> : 'Assign Task'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Member Stats Card ────────────────────────────────────────────────────────
const MemberStatsCard = ({ member, stats, onAssignTask, onRemove }) => {
  const totalTasks = stats.total || 0
  const completedTasks = stats.completed || 0
  const inProgressTasks = stats.inProgress || 0
  const todoTasks = stats.todo || 0
  const overdueTasks = stats.overdue || 0

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg flex-shrink-0">
            {getInitials(member.name)}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-800 text-sm">{member.name}</h3>
            <p className="text-xs text-slate-500 truncate">{member.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onAssignTask(member._id, member.name)}
            className="p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Assign task"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => onRemove(member._id)}
            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove member"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50 rounded-lg p-2.5">
          <p className="text-xs text-slate-500 font-medium">Total Tasks</p>
          <p className="text-lg font-bold text-slate-800 mt-0.5">{totalTasks}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-2.5">
          <p className="text-xs text-green-600 font-medium">Completed</p>
          <p className="text-lg font-bold text-green-700 mt-0.5">{completedTasks}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-2.5">
          <p className="text-xs text-blue-600 font-medium">In Progress</p>
          <p className="text-lg font-bold text-blue-700 mt-0.5">{inProgressTasks}</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-2.5">
          <p className="text-xs text-amber-600 font-medium">Todo</p>
          <p className="text-lg font-bold text-amber-700 mt-0.5">{todoTasks}</p>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueTasks > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-600 flex-shrink-0" />
          <p className="text-xs text-red-700 font-medium">{overdueTasks} overdue task{overdueTasks !== 1 ? 's' : ''}</p>
        </div>
      )}

      {/* Progress Bar */}
      {totalTasks > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-medium text-slate-600">Completion Rate</p>
            <p className="text-xs font-bold text-indigo-600">{completionRate}%</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalTasks === 0 && (
        <div className="text-center py-2">
          <p className="text-xs text-slate-400">No tasks assigned yet</p>
        </div>
      )}
    </div>
  )
}

// ─── Main Team Page ───────────────────────────────────────────────────────────
const TeamPage = () => {
  const { isAdmin, user } = useAuth()
  const [members, setMembers] = useState([])
  const [memberStats, setMemberStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [assignTaskOpen, setAssignTaskOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [removeLoading, setRemoveLoading] = useState(false)

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch all members
        const membersRes = await userService.getAll()
        const allMembers = membersRes.data.data.users.filter(u => u.role === 'member')
        setMembers(allMembers)
        setMemberStats({}) // Don't fetch tasks initially
      } catch (err) {
        console.error('Error loading team data:', err)
        setError('Failed to load team data.')
      } finally {
        setLoading(false)
      }
    }

    if (isAdmin) {
      loadData()
    } else {
      setLoading(false)
    }
  }, [isAdmin])

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-red-500">Access denied. Admin only.</p>
      </div>
    )
  }

  const handleAssignTask = (memberId, memberName) => {
    setSelectedMember({ id: memberId, name: memberName })
    setAssignTaskOpen(true)
  }

  const handleRemoveMember = async () => {
    setRemoveLoading(true)
    try {
      await userService.delete(removeTarget)
      toast.success('Member removed.')
      setRemoveTarget(null)
      // Reload data
      setMembers(members.filter(m => m._id !== removeTarget))
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setRemoveLoading(false)
    }
  }

  const loadTaskStats = async () => {
    try {
      const tasksRes = await taskService.getAll({ limit: 50, page: 1 })
      const allTasks = tasksRes.data.data.tasks || []

      const stats = {}
      members.forEach(member => {
        const memberTasks = allTasks.filter(t => t.assignedTo?._id === member._id)
        const now = new Date()
        stats[member._id] = {
          total: memberTasks.length,
          completed: memberTasks.filter(t => t.status === 'Completed').length,
          inProgress: memberTasks.filter(t => t.status === 'In Progress').length,
          todo: memberTasks.filter(t => t.status === 'Todo').length,
          overdue: memberTasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Completed').length,
        }
      })
      setMemberStats(stats)
      toast.success('Task stats loaded')
    } catch (err) {
      console.error('Error loading task stats:', err)
      toast.error('Failed to load task stats')
    }
  }

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Team Members</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage team members and assign tasks</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs text-slate-500 font-medium uppercase">Total Members</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{members.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500 font-medium uppercase">Total Tasks</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {Object.values(memberStats).reduce((sum, s) => sum + (s.total || 0), 0)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500 font-medium uppercase">Completed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {Object.values(memberStats).reduce((sum, s) => sum + (s.completed || 0), 0)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500 font-medium uppercase">Overdue</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {Object.values(memberStats).reduce((sum, s) => sum + (s.overdue || 0), 0)}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-8"
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Load Stats Button */}
      {Object.keys(memberStats).length === 0 && members.length > 0 && (
        <button
          onClick={loadTaskStats}
          className="btn-primary"
        >
          Load Task Statistics
        </button>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Members Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No members found"
          description="No team members to display."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(member => (
            <MemberStatsCard
              key={member._id}
              member={member}
              stats={memberStats[member._id] || {}}
              onAssignTask={handleAssignTask}
              onRemove={setRemoveTarget}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedMember && (
        <AssignTaskModal
          isOpen={assignTaskOpen}
          onClose={() => {
            setAssignTaskOpen(false)
            setSelectedMember(null)
          }}
          memberId={selectedMember.id}
          memberName={selectedMember.name}
          onTaskAssigned={() => {
            // Reload data after task assignment
            window.location.reload()
          }}
        />
      )}
      <ConfirmDialog
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemoveMember}
        loading={removeLoading}
        title="Remove Member"
        message={`Are you sure you want to remove this member? This action cannot be undone.`}
      />
    </div>
  )
}

export default TeamPage
