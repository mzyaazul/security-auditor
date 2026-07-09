# HeaderGuard

A security header auditor that scans any website and grades its HTTP security posture — in the same spirit as Mozilla Observatory or SecurityHeaders.com, built from scratch to understand the mechanics rather than call someone else's API.

**Live demo:** _add your deployed Vercel URL here_
**Screenshot:** _add a screenshot or GIF of a scan result here_

---

## Why this exists

Most real-world web breaches don't start with an exotic zero-day — they start with a missing header, a cookie without `Secure`, or a forgotten `.env` file sitting in a public directory. HeaderGuard automates the checks a security engineer runs by hand during a quick recon pass, and explains *why* each one matters in plain language.

## What it checks

| Check | Attack it defends against |
|---|---|
| `Content-Security-Policy` | Cross-site scripting (XSS) |
| `Strict-Transport-Security` (HSTS) | SSL-stripping / protocol downgrade attacks |
| `X-Frame-Options` / `frame-ancestors` | Clickjacking |
| `X-Content-Type-Options: nosniff` | MIME-sniffing based content injection |
| `Referrer-Policy` | Sensitive URL/query-string leakage cross-origin |
| `Permissions-Policy` | Unwanted access to camera/mic/geolocation via embedded content |
| Cookie flags (`Secure`, `HttpOnly`, `SameSite`) | Session hijacking, CSRF |
| `Server` / `X-Powered-By` disclosure | Stack fingerprinting for targeted exploits |
| HTTP → HTTPS redirect | Man-in-the-middle interception |
| Exposed `.git/config`, `.env`, `.DS_Store` | Source/credential leakage |

Each finding includes a severity (critical → low) and a concrete recommendation, and results roll up into an A–F grade using a transparent, weighted scoring model (see `api/lib/scoring.js`).

## Architecture

```
Browser (React/Vite)
      │  GET /api/scan?url=...
      ▼
Vercel Serverless Function (api/scan.js)
      │  fetches the target server-side (avoids browser CORS entirely)
      │  runs header/cookie/exposure checks
      │  computes weighted score
      ▼
JSON report ──► rendered as score card + findings list in the browser
```

No database. Every scan is stateless — request in, report out.

## Security considerations addressed

Because this tool accepts an arbitrary user-supplied URL and fetches it **server-side**, it's a textbook SSRF (Server-Side Request Forgery) surface if left unguarded. Mitigations implemented:

- **Private/internal IP blocking** (`api/lib/ssrfGuard.js`) — rejects loopback, RFC1918 private ranges, and link-local addresses (including the `169.254.169.254` cloud metadata endpoint) before any request is made.
- **Protocol allowlisting** — only `http://` and `https://` are accepted.
- **Per-IP rate limiting** — caps scans per minute to prevent the endpoint being repurposed as an open scanning proxy.
- **Request timeouts** — every outbound fetch (main request, HTTPS-redirect check, exposed-file checks) is bounded so a slow or hanging target can't tie up the function.

This tool is intended for scanning sites you own or have explicit permission to test.

## Tech stack

- React + Vite + Tailwind CSS (frontend)
- Vercel serverless function, Node runtime (backend)
- Zero database — fully stateless

## Local setup

```bash
git clone <your-repo-url>
cd security-auditor
npm install

# Terminal 1 — serves the /api function locally
npm i -g vercel
vercel dev

# Terminal 2 — frontend dev server (proxies /api to vercel dev)
npm run dev
```

Then open the Vite dev URL (typically `http://localhost:5173`) and scan away.

## Deploy

```bash
vercel
```

That's it — `vercel.json` and the `api/` folder convention handle the rest.

## Roadmap

- [ ] TLS/certificate deep inspection (via SSL Labs API)
- [ ] Shareable scan results via URL-encoded report (no DB needed)
- [ ] CLI version (`npx headerguard example.com`)
- [ ] Side-by-side compare mode for two URLs
- [ ] PDF export of the report

---

Built as a portfolio project to demonstrate applied web/application security concepts: HTTP security headers, SSRF mitigation, and secure-by-default API design.
