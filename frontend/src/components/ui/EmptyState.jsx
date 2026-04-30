const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    {Icon && (
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon size={24} className="text-slate-400" />
      </div>
    )}
    <h3 className="text-sm font-semibold text-slate-700 mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-400 max-w-xs mb-4">{description}</p>}
    {action && action}
  </div>
)

export default EmptyState
