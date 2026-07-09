const GRADE_COLOR = {
  A: "text-signal-pass border-signal-pass/40",
  B: "text-signal-pass border-signal-pass/40",
  C: "text-signal-warn border-signal-warn/40",
  D: "text-signal-fail border-signal-fail/40",
  F: "text-signal-crit border-signal-crit/40",
};

export default function ScoreCard({ score, url }) {
  const { grade, score: numeric } = score;
  const colorClasses = GRADE_COLOR[grade] || GRADE_COLOR.C;

  return (
    <div className="relative overflow-hidden rounded-md border border-line bg-panel">
      {/* perforated ticket edge */}
      <div
        className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-ink"
        aria-hidden="true"
      />
      <div
        className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-ink"
        aria-hidden="true"
      />

      <div className="flex items-center gap-6 px-8 py-7">
        <div
          className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-md border-2 font-mono text-4xl font-semibold ${colorClasses}`}
        >
          {grade}
        </div>
        <div className="min-w-0">
          <p className="mono-label mb-1">scan target</p>
          <p className="truncate font-mono text-paper">{url}</p>
          <p className="mt-2 text-sm text-mist">
            Score <span className="font-mono text-paper">{numeric}</span> / 100
          </p>
        </div>
      </div>

      <div className="h-1 w-full bg-line">
        <div
          className={`h-full transition-all duration-700 ${
            grade === "F" || grade === "D"
              ? "bg-signal-fail"
              : grade === "C"
              ? "bg-signal-warn"
              : "bg-signal-pass"
          }`}
          style={{ width: `${numeric}%` }}
        />
      </div>
    </div>
  );
}
