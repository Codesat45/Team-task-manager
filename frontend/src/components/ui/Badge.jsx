import { getStatusBadgeClass, getRoleBadgeClass } from '../../utils/helpers'

export const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(status)}`}>
    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
      status === 'Completed' ? 'bg-green-500' :
      status === 'In Progress' ? 'bg-blue-500' : 'bg-slate-400'
    }`} />
    {status}
  </span>
)

export const RoleBadge = ({ role }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadgeClass(role)}`}>
    {role}
  </span>
)

export const OverdueBadge = () => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
    <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-red-500" />
    Overdue
  </span>
)
