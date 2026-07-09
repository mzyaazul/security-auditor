import { useState } from "react";

export default function RawHeaders({ headers }) {
  const [open, setOpen] = useState(false);
  if (!headers) return null;
  const entries = Object.entries(headers);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="mono-label flex items-center gap-2 hover:text-paper transition-colors"
      >
        <span>{open ? "▾" : "▸"}</span> raw response headers ({entries.length})
      </button>
      {open && (
        <pre className="mt-3 overflow-x-auto rounded-md border border-line bg-panel px-5 py-4 font-mono text-xs leading-relaxed text-mist">
{entries.map(([k, v]) => `${k}: ${v}`).join("\n")}
        </pre>
      )}
    </div>
  );
}
