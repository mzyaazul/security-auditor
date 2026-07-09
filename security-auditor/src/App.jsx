import { useState } from "react";
import ScanForm from "./components/ScanForm.jsx";
import ScoreCard from "./components/ScoreCard.jsx";
import FindingsList from "./components/FindingsList.jsx";
import RawHeaders from "./components/RawHeaders.jsx";

export default function App() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scannedUrl, setScannedUrl] = useState("");

  const handleScan = async (url) => {
    setLoading(true);
    setError(null);
    setReport(null);
    setScannedUrl(url);
    try {
      const res = await fetch(`/api/scan?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Scan failed.");
      } else {
        setReport(data);
      }
    } catch (err) {
      setError("Could not reach the scan service. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-scanlines">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        {/* Hero */}
        <header className="mb-14">
          <div className="mb-5 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-signal-pass animate-blink" />
            <span className="mono-label">headerguard / live scanner</span>
          </div>
          <h1 className="font-mono text-3xl sm:text-4xl font-medium leading-tight text-paper">
            Your site's headers are<br />talking. Here's what they say.
          </h1>
          <p className="mt-4 max-w-xl text-mist leading-relaxed">
            Paste a URL. Header Guard checks it against the same class of
            misconfigurations attackers scan the whole internet for —
            missing CSP, weak cookies, no HSTS, exposed <code className="font-mono text-paper/80">.git</code> and{" "}
            <code className="font-mono text-paper/80">.env</code> files — and hands back a graded report.
          </p>
        </header>

        {/* Scan input */}
        <ScanForm onScan={handleScan} loading={loading} />

        {/* Error */}
        {error && (
          <div className="mt-8 rounded-md border border-signal-fail/40 bg-signal-fail/10 px-4 py-3 font-mono text-sm text-signal-fail">
            {error}
          </div>
        )}

        {/* Results */}
        {report && (
          <div className="mt-12 space-y-8">
            <ScoreCard score={report.score} url={scannedUrl} />
            <FindingsList findings={report.findings} />
            <RawHeaders headers={report.headers} />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-24 border-t border-line pt-6">
          <p className="mono-label">
            for sites you own or have permission to test · not a vulnerability scanner
          </p>
        </footer>
      </div>
    </div>
  );
}
