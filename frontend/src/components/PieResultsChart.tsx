interface OptionCount {
  label: string;
  count: number;
}

interface Props {
  title: string;
  note?: string;
  data: OptionCount[];
  totalRespondents: number;
  donut?: boolean;
}

// Fixed categorical order (never reordered/cycled per-chart) so a given
// option keeps the same color across re-renders and between the chart
// and its legend.
const COLORS = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
  "#008300",
  "#4a3aa7",
  "#e34948",
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function describeSlice(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
}

export function PieResultsChart({ title, note, data, totalRespondents, donut }: Props) {
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;

  const colored = data.map((d, i) => ({ ...d, color: COLORS[i % COLORS.length] }));

  let cumulativeAngle = 0;
  const slices = colored
    .filter((d) => d.count > 0)
    .map((d) => {
      const angle = (d.count / totalRespondents) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      cumulativeAngle = endAngle;
      return { ...d, startAngle, endAngle };
    });

  return (
    <div className="results-question">
      <h3>{title}</h3>
      <p className="results-meta">
        {totalRespondents} réponse{totalRespondents > 1 ? "s" : ""}
        {note ? ` — ${note}` : ""}
      </p>

      {totalRespondents === 0 ? (
        <p className="results-empty">Aucune réponse pour cette question.</p>
      ) : (
        <div className="pie-chart-row">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-label={title}
          >
            {slices.length === 1 ? (
              <circle cx={cx} cy={cy} r={r} fill={slices[0].color} />
            ) : (
              slices.map((slice) => (
                <path
                  key={slice.label}
                  d={describeSlice(cx, cy, r, slice.startAngle, slice.endAngle)}
                  fill={slice.color}
                />
              ))
            )}
            {donut && <circle cx={cx} cy={cy} r={r * 0.55} className="pie-donut-hole" />}
          </svg>
          <ul className="pie-legend">
            {colored.map((d) => {
              const pct = (d.count / totalRespondents) * 100;
              return (
                <li key={d.label}>
                  <span className="pie-legend-swatch" style={{ background: d.color }} />
                  <span className="pie-legend-label">{d.label}</span>
                  <span className="pie-legend-value">
                    {d.count} ({pct.toFixed(0)}%)
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
