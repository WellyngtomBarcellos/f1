export default function Skeleton() {
  return (
    <div className="skeleton">
      <div className="skeleton__hero shimmer" />
      {[0, 1, 2].map((row) => (
        <div key={row} className="skeleton__row">
          <div className="skeleton__title shimmer" />
          <div className="skeleton__cards">
            {[0, 1, 2, 3, 4].map((c) => (
              <div key={c} className="skeleton__card shimmer" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
