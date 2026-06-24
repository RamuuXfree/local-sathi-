const Loader = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
    <p className="text-gray-400 text-sm font-medium">{text}</p>
  </div>
);

export const SkeletonCard = () => (
  <div className="glass-card p-5 animate-pulse">
    <div className="h-40 bg-gray-800 rounded-xl mb-4" />
    <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
    <div className="h-3 bg-gray-800 rounded w-1/2 mb-4" />
    <div className="flex gap-2">
      <div className="h-3 bg-gray-800 rounded w-16" />
      <div className="h-3 bg-gray-800 rounded w-20" />
    </div>
  </div>
);

export default Loader;
