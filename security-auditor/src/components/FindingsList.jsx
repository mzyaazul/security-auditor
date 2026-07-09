import { useState } from "react";

const SEVERITY_STYLE = {
  critical: { label: "critical", classes: "text-signal-crit bg-signal-crit/10 border-signal-crit/30" },
  high: { label: "high", classes: "text-signal-fail bg-signal-fail/10 border-signal-fail/30" },
  medium: { label: "medium", classes: "text-signal-warn bg-signal-warn/10 border-signal-warn/30" },
  low: { label: "low", classes: "text-mist bg-mist/10 border-mist/20" },
  none: { label: "clear", classes: "text-signal-pass bg-signal-pass/10 border-signal-pass/30" },
};

function FindingRow({ finding }) {
  const [open, setOpen] = useState(false);
  const style = SEVERITY_STYLE[finding.severity] || SEVERITY_STYLE.low;

  return (
    <div className="border-b border-line last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span
          className={`shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${style.classes}`}
        >
          {style.label}
        </span>
        <span className="flex-1 text-sm text-paper">{finding.message}</span>
        <span className="font-mono text-mist text-xs">{open ? "−" : "+"}</span>
      </button>
      {open && finding.recommendation && (
        <div className="px-5 pb-4 pl-[4.75rem]">
          <p className="text-sm text-mist leading-relaxed">
            <span className="text-paper/70 font-medium">Fix: </span>
            {finding.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}

export default function FindingsList({ findings }) {
  if (!findings || findings.length === 0) return null;

  const sorted = [...findings].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3, none: 4 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div>
      <p className="mono-label mb-3">findings</p>
      <div className="overflow-hidden rounded-md border border-line bg-panel">
        {sorted.map((f) => (
          <FindingRow key={f.id} finding={f} />
        ))}
      </div>
    </div>
  );
}
