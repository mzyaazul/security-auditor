import { assertSafeUrl } from "./lib/ssrfGuard.js";
import {
  checkCSP,
  checkHSTS,
  checkFrameOptions,
  checkContentTypeOptions,
  checkReferrerPolicy,
  checkPermissionsPolicy,
  checkServerDisclosure,
  checkCookies,
  checkHttpsRedirect,
  checkExposedFiles,
} from "./lib/checks.js";
import { computeScore } from "./lib/scoring.js";

// Minimal in-memory rate limit. Resets on cold start — good enough for a
// portfolio-scale deployment; swap for Upstash/Redis for real production use.
const RATE_LIMIT = { windowMs: 60_000, max: 10 };
const hits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip) || { count: 0, resetAt: now + RATE_LIMIT.windowMs };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + RATE_LIMIT.windowMs;
  }
  entry.count += 1;
  hits.set(ip, entry);
  return entry.count > RATE_LIMIT.max;
}

export default async function handler(req, res) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket?.remoteAddress || "unknown";

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Rate limit exceeded. Try again in a minute." });
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "Missing 'url' query parameter." });
  }

  let target;
  try {
    target = assertSafeUrl(url);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  try {
    const response = await fetch(target.toString(), {
      redirect: "manual",
      signal: AbortSignal.timeout(6000),
      headers: { "User-Agent": "HeaderGuard-Scanner/1.0 (+portfolio project)" },
    });

    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    const [httpsRedirectFinding, exposedFileFindings] = await Promise.all([
      checkHttpsRedirect(target.toString()),
      checkExposedFiles(target.toString()),
    ]);

    const findings = [
      checkCSP(headers),
      checkHSTS(headers),
      checkFrameOptions(headers),
      checkContentTypeOptions(headers),
      checkReferrerPolicy(headers),
      checkPermissionsPolicy(headers),
      checkServerDisclosure(headers),
      checkCookies(headers),
      httpsRedirectFinding,
      ...exposedFileFindings,
    ];

    const score = computeScore(findings);

    return res.status(200).json({ url: target.toString(), headers, findings, score });
  } catch (err) {
    return res.status(502).json({ error: "Could not reach the target site (timed out or unreachable)." });
  }
}
