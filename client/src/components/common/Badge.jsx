const STATUS_STYLES = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  completed: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
  cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  'in-progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  user: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
  provider: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  admin: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const Badge = ({ label, variant }) => {
  const style = STATUS_STYLES[variant] || STATUS_STYLES[label?.toLowerCase()] || 'bg-gray-800 text-gray-400 border-gray-700';
  return (
    <span className={`badge border ${style}`}>
      {label}
    </span>
  );
};
export default Badge;
