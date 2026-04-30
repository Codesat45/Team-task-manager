import { useState } from 'react'
import { Plus, FolderKanban, Users, Trash2, Pencil, UserPlus, UserMinus, Search, ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { useProjects } from '../hooks/useProjects'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/user.service'
import { projectService } from '../services/project.service'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import { RoleBadge, StatusBadge, OverdueBadge } from '../components/ui/Badge'
import { formatDate, getErrorMessage, getInitials, isOverdue } from '../utils/helpers'

// ─── Project Form Modal ───────────────────────────────────────────────────────
const ProjectFormModal = ({ isOpen, onClose, onSubmit, initial = null }) => {
  const [form, setForm] = useState({ name: initial?.name || '', description: initial?.description || '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Project name is required.'
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await onSubmit(form)
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Project' : 'New Project'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Project Name *</label>
          <input
            className={`input ${errors.name ? 'border-red-400' : ''}`}
            value={form.name}
            onChange={(e) => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })) }}
            placeholder="e.g. Website Redesign"
          />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="input resize-none"
            rows={3}
            value={form.description}
            onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="Brief description of the project..."
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <Spinner size="sm" /> : initial ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Manage Members Modal ─────────────────────────────────────────────────────
const ManageMembersModal = ({ isOpen, onClose, project, onRefresh }) => {
  const [allUsers, setAllUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [search, setSearch] = useState('')

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const res = await userService.getAll()
      setAllUsers(res.data.data.users)
    } catch {
      toast.error('Failed to load users.')
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleOpen = () => { if (isOpen) fetchUsers() }

  // Fetch when modal opens
  useState(() => { if (isOpen) fetchUsers() })

  const memberIds = project?.members?.map(m => m._id) || []

  const nonMembers = allUsers.filter(u =>
    !memberIds.includes(u._id) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  )

  const addMember = async (userId) => {
    setActionLoading(userId)
    try {
      await projectService.addMember(project._id, userId)
      toast.success('Member added.')
      onRefresh()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setActionLoading(null)
    }
  }

  const removeMember = async (userId) => {
    setActionLoading(userId)
    try {
      await projectService.removeMember(project._id, userId)
      toast.success('Member removed.')
      onRefresh()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Members — ${project?.name}`} size="lg">
      <div className="space-y-5">
        {/* Current Members */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Current Members ({project?.members?.length || 0})
          </h3>
          {project?.members?.length === 0 ? (
            <p className="text-sm text-slate-400 py-2">No members yet.</p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {project?.members?.map(member => (
                <div key={member._id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                      {getInitials(member.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{member.name}</p>
                      <p className="text-xs text-slate-400">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RoleBadge role={member.role} />
                    <button
                      onClick={() => removeMember(member._id)}
                      disabled={actionLoading === member._id}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      {actionLoading === member._id ? <Spinner size="sm" /> : <UserMinus size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Members */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Add Members</h3>
          <div className="relative mb-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-8"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {loadingUsers ? (
            <div className="flex justify-center py-4"><Spinner /></div>
          ) : nonMembers.length === 0 ? (
            <p className="text-sm text-slate-400 py-2">No users to add.</p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {nonMembers.map(user => (
                <div key={user._id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => addMember(user._id)}
                    disabled={actionLoading === user._id}
                    className="p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    {actionLoading === user._id ? <Spinner size="sm" /> : <UserPlus size={14} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const ProjectsPage = () => {
  const { isAdmin } = useAuth()
  const { projects, loading, error, fetchProjects, createProject, updateProject, deleteProject } = useProjects()

  const [createOpen, setCreateOpen] = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [membersProject, setMembersProject] = useState(null)
  const [search, setSearch] = useState('')
  const [expandedProject, setExpandedProject] = useState(null)

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deleteProject(deleteTarget._id)
      setDeleteTarget(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  )

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Projects</h1>
          <p className="text-sm text-slate-500 mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button onClick={() => setCreateOpen(true)} className="btn-primary">
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-8"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description={isAdmin ? 'Create your first project to get started.' : 'You have not been added to any projects yet.'}
          action={isAdmin && (
            <button onClick={() => setCreateOpen(true)} className="btn-primary">
              <Plus size={16} /> New Project
            </button>
          )}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map(project => (
            <div key={project._id} className="card overflow-hidden">
              {/* Card Header */}
              <div className="px-5 py-4 flex items-start justify-between gap-2 bg-slate-50 border-b border-slate-100">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FolderKanban size={18} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 text-sm">{project.name}</h3>
                    {project.description && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{project.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Users size={13} />
                        <span>{project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}</span>
                      </div>
                      <span>{project.tasks?.length || 0} task{project.tasks?.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setExpandedProject(expandedProject === project._id ? null : project._id)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title={expandedProject === project._id ? 'Collapse' : 'Expand'}
                  >
                    {expandedProject === project._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => setMembersProject(project)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Manage members"
                      >
                        <Users size={15} />
                      </button>
                      <button
                        onClick={() => setEditProject(project)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit project"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(project)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete project"
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Tasks Section */}
              {expandedProject === project._id && (
                <div className="px-5 py-4">
                  {project.tasks && project.tasks.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Tasks ({project.tasks.length})</h4>
                      <div className="space-y-2">
                        {project.tasks.map(task => (
                          <div key={task._id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                              {task.description && (
                                <p className="text-xs text-slate-500 truncate mt-0.5">{task.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                {task.assignedTo && (
                                  <div className="flex items-center gap-1">
                                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                                      {getInitials(task.assignedTo.name)}
                                    </div>
                                    <span>{task.assignedTo.name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {task.dueDate && (
                                <div className="flex items-center gap-1 text-xs">
                                  <Calendar size={12} className="text-slate-400" />
                                  <span className={isOverdue(task.dueDate, task.status) ? 'text-red-500 font-medium' : 'text-slate-500'}>
                                    {formatDate(task.dueDate)}
                                  </span>
                                </div>
                              )}
                              {isOverdue(task.dueDate, task.status) && <OverdueBadge />}
                              <StatusBadge status={task.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-sm text-slate-400">No tasks assigned to you in this project.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <ProjectFormModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={createProject}
      />
      <ProjectFormModal
        isOpen={!!editProject}
        onClose={() => setEditProject(null)}
        onSubmit={(data) => updateProject(editProject._id, data)}
        initial={editProject}
      />
      <ManageMembersModal
        isOpen={!!membersProject}
        onClose={() => setMembersProject(null)}
        project={membersProject}
        onRefresh={() => { fetchProjects(); setMembersProject(null) }}
      />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? All tasks in this project will also be deleted. This action cannot be undone.`}
      />
    </div>
  )
}

export default ProjectsPage
