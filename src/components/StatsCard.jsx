export default function StatsCard({ title, value, icon, trend, color }) {
  const colors = {
    blue: "stats-card-blue",
    aqua: "stats-card-aqua",
    green: "stats-card-green",
    purple: "stats-card-purple"
  };

  return (
    <div className={`stats-card ${colors[color]}`}>
      <div className="stats-icon">{icon}</div>
      <div className="stats-content">
        <h3 className="stats-title">{title}</h3>
        <p className="stats-value">{value}</p>
        {trend && (
          <span className={`stats-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}