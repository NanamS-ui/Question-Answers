interface OptionCount {
  label: string;
  count: number;
}

interface Props {
  title: string;
  note?: string;
  data: OptionCount[];
  totalRespondents: number;
}

export function BarResultsChart({ title, note, data, totalRespondents }: Props) {
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
        <div className="bar-chart">
          {data.map(({ label, count }) => {
            const pct = (count / totalRespondents) * 100;
            return (
              <div className="bar-row" key={label}>
                <span className="bar-label">{label}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="bar-value">
                  {count} ({pct.toFixed(0)}%)
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
