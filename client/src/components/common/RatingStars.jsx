const RatingStars = ({ rating = 0, size = 'sm', showCount = false, count = 0 }) => {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' };
  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex items-center gap-0.5 ${sizes[size]}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-600'}
          >
            ★
          </span>
        ))}
      </div>
      {showCount && (
        <span className="text-gray-400 text-xs">({count})</span>
      )}
      {rating > 0 && (
        <span className="text-amber-400 text-sm font-medium">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};
export default RatingStars;
