import { useState, useEffect } from 'react'
import {
  Plus, CheckSquare, Trash2, Pencil, Search,
  ChevronLeft, ChevronRight, SlidersHorizontal, Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useTasks } from '../hooks/useTasks'
import { useAuth } from '../context/AuthContext'
import { projectService } from '../services/project.service'
import { userService } from '../services/user.service'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import { StatusBadge, OverdueBadge } from '../components/ui/Badge'
import { formatDate, isOverdue, getErrorMessage, getInitials } from '../utils/helpers'

const STATUSES = ['Todo', 'In Progress', 'Completed']

// ─── Task Form Modal ──────────────────────────────────────────────────────────
const TaskFormModal = ({ isOpen, onClose, onSubmit, initial = null, isAdmin }) => {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    projectId: initial?.projectId?._id || initial?.projectId || '',
    assignedTo: initial?.assignedTo?._id || initial?.assignedTo || '',
    dueDate: initial?.dueDate ? initial.dueDate.slice(0, 10) : '',
    status: initial?.status || 'Todo',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (!isOpen) return
    const fetchData = async () => {
      try {
        const [pRes, uRes] = await Promise.all([
          projectService.getAll(),
          isAdmin ? userService.getAll() : Promise.resolve(null),
        ])
        setProjects(pRes.data.data.projects)
        if (uRes) setUsers(uRes.data.data.users)
      } catch {
        toast.error('Failed to load form data.')
      }
    }
    fetchData()
  }, [isOpen, isAdmin])

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required.'
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
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || null,
      }
      await onSubmit(payload)
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Task' : 'New Task'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Title */}
          <div className="sm:col-span-2">
            <label className="label">Title *</label>
            <input
              name="title"
              className={`input ${errors.title ? 'border-red-400' : ''}`}
              value={form.title}
              onChange={handleChange}
              placeholder="Task title"
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
              placeholder="Optional description..."
            />
          </div>

          {/* Project */}
          {isAdmin && (
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
          )}

          {/* Assigned To */}
          {isAdmin && (
            <div>
              <label className="label">Assign To</label>
              <select name="assignedTo" className="input" value={form.assignedTo} onChange={handleChange}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
          )}

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
          <div>
            <label className="label">Status</label>
            <select name="status" className="input" value={form.status} onChange={handleChange}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <Spinner size="sm" /> : initial ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const TasksPage = () => {
  const { isAdmin } = useAuth()
  const {
    tasks, pagination, loading, error,
    params, updateParams, createTask, updateTask, deleteTask
  } = useTasks({ sortBy: 'dueDate', sortOrder: 'asc', limit: 10 })

  const [createOpen, setCreateOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deleteTask(deleteTarget._id)
      setDeleteTarget(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Tasks</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pagination ? `${pagination.total} task${pagination.total !== 1 ? 's' : ''}` : ''}
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setCreateOpen(true)} className="btn-primary">
            <Plus size={16} /> New Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-8"
              placeholder="Search tasks..."
              value={params.search || ''}
              onChange={(e) => updateParams({ search: e.target.value })}
            />
          </div>

          {/* Status filter */}
          <select
            className="input w-auto"
            value={params.status || ''}
            onChange={(e) => updateParams({ status: e.target.value })}
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Sort */}
          <select
            className="input w-auto"
            value={`${params.sortBy}_${params.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('_')
              updateParams({ sortBy, sortOrder })
            }}
          >
            <option value="dueDate_asc">Due Date ↑</option>
            <option value="dueDate_desc">Due Date ↓</option>
            <option value="createdAt_desc">Newest First</option>
            <option value="createdAt_asc">Oldest First</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks found"
            description={isAdmin ? 'Create your first task to get started.' : 'No tasks assigned to you yet.'}
            action={isAdmin && (
              <button onClick={() => setCreateOpen(true)} className="btn-primary">
                <Plus size={16} /> New Task
              </button>
            )}
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Task</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Project</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Assigned To</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Due Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tasks.map(task => (
                    <tr key={task._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-800 truncate max-w-xs">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-slate-400 truncate max-w-xs mt-0.5">{task.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-slate-600">{task.projectId?.name || '—'}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        {task.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold flex-shrink-0">
                              {getInitials(task.assignedTo.name)}
                            </div>
                            <span className="text-slate-600 text-xs">{task.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {task.dueDate && <Calendar size={12} className="text-slate-400" />}
                          <span className={`text-xs ${isOverdue(task.dueDate, task.status) ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
                            {formatDate(task.dueDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {isOverdue(task.dueDate, task.status) && <OverdueBadge />}
                          <StatusBadge status={task.status} />
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => setEditTask(task)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setDeleteTarget(task)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {tasks.map(task => (
                <div key={task._id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-slate-800 text-sm">{task.title}</p>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => setEditTask(task)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                        <Pencil size={13} />
                      </button>
                      {isAdmin && (
                        <button onClick={() => setDeleteTarget(task)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <StatusBadge status={task.status} />
                    {isOverdue(task.dueDate, task.status) && <OverdueBadge />}
                  </div>
                  <div className="text-xs text-slate-500 space-y-0.5">
                    <p>Project: {task.projectId?.name || '—'}</p>
                    <p>Assigned: {task.assignedTo?.name || 'Unassigned'}</p>
                    <p>Due: {formatDate(task.dueDate)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateParams({ page: pagination.page - 1 })}
                    disabled={pagination.page <= 1}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => updateParams({ page: pagination.page + 1 })}
                    disabled={pagination.page >= pagination.totalPages}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <TaskFormModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={createTask}
        isAdmin={isAdmin}
      />
      <TaskFormModal
        isOpen={!!editTask}
        onClose={() => setEditTask(null)}
        onSubmit={(data) => updateTask(editTask._id, data)}
        initial={editTask}
        isAdmin={isAdmin}
      />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
      />
    </div>
  )
}

export default TasksPage
