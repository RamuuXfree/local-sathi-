const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    {Icon && (
      <div className="w-20 h-20 rounded-2xl bg-gray-800/60 border border-gray-700 flex items-center justify-center mb-5">
        <Icon className="w-10 h-10 text-gray-600" />
      </div>
    )}
    <h3 className="text-xl font-semibold text-gray-200 mb-2">{title}</h3>
    {description && <p className="text-gray-500 max-w-md text-sm leading-relaxed mb-6">{description}</p>}
    {action && action}
  </div>
);
export default EmptyState;
