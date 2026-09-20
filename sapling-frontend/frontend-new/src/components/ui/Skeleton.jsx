export function SkeletonLine({ width = "100%", height = 14, className = "" }) {
  return (
    <div
      className={`skeleton rounded-md ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="paper-panel rounded-2xl p-5 space-y-3">
      <SkeletonLine width="40%" height={12} />
      <SkeletonLine width="70%" height={20} />
      <SkeletonLine width="90%" height={12} />
    </div>
  );
}

export function SkeletonRows({ rows = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="paper-panel rounded-xl p-4 flex items-center gap-4">
          <div className="skeleton h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLine width="35%" height={12} />
            <SkeletonLine width="60%" height={10} />
          </div>
        </div>
      ))}
    </div>
  );
}
