const StatCard = ({ title, value, icon: Icon, color = 'indigo', trend }) => {
  const colors = {
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', value: 'text-indigo-700' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', value: 'text-green-700' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', value: 'text-blue-700' },
    red: { bg: 'bg-red-50', icon: 'text-red-600', value: 'text-red-700' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', value: 'text-amber-700' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', value: 'text-purple-700' },
  }
  const c = colors[color] || colors.indigo

  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} className={c.icon} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">{title}</p>
        <p className={`text-2xl font-bold ${c.value}`}>{value ?? '—'}</p>
        {trend && <p className="text-xs text-slate-400 mt-0.5">{trend}</p>}
      </div>
    </div>
  )
}

export default StatCard
