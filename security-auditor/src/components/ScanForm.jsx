import { useState } from "react";

export default function ScanForm({ onScan, loading }) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    const normalized = /^https?:\/\//i.test(url) ? url.trim() : `https://${url.trim()}`;
    onScan(normalized);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-stretch overflow-hidden rounded-md border border-line bg-panel focus-within:border-accent/60 transition-colors">
        <span className="flex items-center pl-4 font-mono text-mist text-sm select-none">https://</span>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value.replace(/^https?:\/\//i, ""))}
          placeholder="example.com"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="flex-1 bg-transparent py-4 pr-2 font-mono text-paper placeholder:text-mist/50 outline-none"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="m-1.5 rounded px-5 font-mono text-sm font-medium tracking-wide text-ink bg-accent hover:bg-accent/90 disabled:bg-line disabled:text-mist transition-colors"
        >
          {loading ? "scanning…" : "run scan"}
        </button>
      </div>
      {loading && (
        <div className="mt-2 h-px w-full overflow-hidden bg-line/50">
          <div className="h-full w-1/3 bg-accent animate-sweep" />
        </div>
      )}
    </form>
  );
}
