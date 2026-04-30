/**
 * Format a date string to a readable format.
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Check if a date is overdue (past today and not completed).
 */
export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'Completed') return false
  return new Date(dueDate) < new Date()
}

/**
 * Returns Tailwind classes for a task status badge.
 */
export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Todo':
      return 'bg-slate-100 text-slate-600 border border-slate-200'
    case 'In Progress':
      return 'bg-blue-50 text-blue-700 border border-blue-200'
    case 'Completed':
      return 'bg-green-50 text-green-700 border border-green-200'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

/**
 * Returns Tailwind classes for a role badge.
 */
export const getRoleBadgeClass = (role) => {
  return role === 'admin'
    ? 'bg-purple-50 text-purple-700 border border-purple-200'
    : 'bg-sky-50 text-sky-700 border border-sky-200'
}

/**
 * Extract error message from an Axios error response.
 */
export const getErrorMessage = (err) => {
  return err?.response?.data?.message || err?.message || 'Something went wrong.'
}

/**
 * Get initials from a name string.
 */
export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
