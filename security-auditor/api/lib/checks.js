// Each check returns: { id, pass, severity: critical|high|medium|low|none, message, recommendation? }

export function checkCSP(headers) {
  const csp = headers["content-security-policy"];
  if (!csp) {
    return {
      id: "csp",
      pass: false,
      severity: "high",
      message: "No Content-Security-Policy header found.",
      recommendation:
        "Add a CSP, starting with something like default-src 'self', then tighten per-resource-type as needed.",
    };
  }
  if (/unsafe-inline|unsafe-eval/i.test(csp)) {
    return {
      id: "csp",
      pass: false,
      severity: "medium",
      message: "CSP is present but allows 'unsafe-inline' or 'unsafe-eval', weakening XSS protection.",
      recommendation: "Replace unsafe-inline/unsafe-eval with nonces or hashes for scripts and styles.",
    };
  }
  return { id: "csp", pass: true, severity: "none", message: "Content-Security-Policy present and reasonably strict." };
}

export function checkHSTS(headers) {
  const hsts = headers["strict-transport-security"];
  if (!hsts) {
    return {
      id: "hsts",
      pass: false,
      severity: "high",
      message: "No Strict-Transport-Security header — browsers won't enforce HTTPS on repeat visits.",
      recommendation: "Add Strict-Transport-Security: max-age=31536000; includeSubDomains; preload.",
    };
  }
  const maxAgeMatch = hsts.match(/max-age=(\d+)/i);
  const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;
  if (maxAge < 15552000) { // ~6 months
    return {
      id: "hsts",
      pass: false,
      severity: "medium",
      message: `HSTS max-age is too short (${maxAge}s, under ~6 months).`,
      recommendation: "Increase max-age to at least 31536000 (1 year) and consider adding preload.",
    };
  }
  return { id: "hsts", pass: true, severity: "none", message: "HSTS present with an adequate max-age." };
}

export function checkFrameOptions(headers) {
  const xfo = headers["x-frame-options"];
  const csp = headers["content-security-policy"] || "";
  const hasFrameAncestors = /frame-ancestors/i.test(csp);
  if (!xfo && !hasFrameAncestors) {
    return {
      id: "frame-options",
      pass: false,
      severity: "medium",
      message: "No clickjacking protection (missing X-Frame-Options and CSP frame-ancestors).",
      recommendation: "Add X-Frame-Options: DENY (or SAMEORIGIN) or a CSP frame-ancestors directive.",
    };
  }
  return { id: "frame-options", pass: true, severity: "none", message: "Clickjacking protection present." };
}

export function checkContentTypeOptions(headers) {
  const value = headers["x-content-type-options"];
  if (!value || value.toLowerCase() !== "nosniff") {
    return {
      id: "content-type-options",
      pass: false,
      severity: "low",
      message: "X-Content-Type-Options: nosniff is missing.",
      recommendation: "Add X-Content-Type-Options: nosniff to stop MIME-type sniffing.",
    };
  }
  return { id: "content-type-options", pass: true, severity: "none", message: "MIME-sniffing protection present." };
}

export function checkReferrerPolicy(headers) {
  const value = headers["referrer-policy"];
  if (!value) {
    return {
      id: "referrer-policy",
      pass: false,
      severity: "low",
      message: "No Referrer-Policy header set.",
      recommendation: "Add Referrer-Policy: strict-origin-when-cross-origin (a safe, widely supported default).",
    };
  }
  if (/unsafe-url/i.test(value)) {
    return {
      id: "referrer-policy",
      pass: false,
      severity: "medium",
      message: "Referrer-Policy is set to 'unsafe-url', leaking full URLs cross-origin.",
      recommendation: "Use strict-origin-when-cross-origin or no-referrer instead.",
    };
  }
  return { id: "referrer-policy", pass: true, severity: "none", message: "Referrer-Policy is set safely." };
}

export function checkPermissionsPolicy(headers) {
  const value = headers["permissions-policy"];
  if (!value) {
    return {
      id: "permissions-policy",
      pass: false,
      severity: "low",
      message: "No Permissions-Policy header — sensitive browser APIs aren't explicitly restricted.",
      recommendation: "Add a Permissions-Policy restricting camera, microphone, and geolocation to none/self as appropriate.",
    };
  }
  return { id: "permissions-policy", pass: true, severity: "none", message: "Permissions-Policy is set." };
}

export function checkServerDisclosure(headers) {
  const server = headers["server"];
  const poweredBy = headers["x-powered-by"];
  const findings = [];
  if (server && /\d/.test(server)) {
    findings.push(`Server header discloses version info: "${server}".`);
  }
  if (poweredBy) {
    findings.push(`X-Powered-By discloses stack info: "${poweredBy}".`);
  }
  if (findings.length) {
    return {
      id: "server-disclosure",
      pass: false,
      severity: "low",
      message: findings.join(" "),
      recommendation: "Suppress or generalize Server / X-Powered-By headers to avoid fingerprinting your stack.",
    };
  }
  return { id: "server-disclosure", pass: true, severity: "none", message: "No obvious stack-fingerprinting headers." };
}

export function checkCookies(headers) {
  const setCookie = headers["set-cookie"];
  if (!setCookie) {
    return { id: "cookies", pass: true, severity: "none", message: "No cookies set on this response." };
  }
  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
  const issues = [];
  cookies.forEach((c) => {
    const name = c.split("=")[0];
    if (!/secure/i.test(c)) issues.push(`${name} is missing Secure`);
    if (!/httponly/i.test(c)) issues.push(`${name} is missing HttpOnly`);
    if (!/samesite/i.test(c)) issues.push(`${name} is missing SameSite`);
  });
  if (issues.length) {
    return {
      id: "cookies",
      pass: false,
      severity: "medium",
      message: `Cookie flag issues: ${issues.join(", ")}.`,
      recommendation: "Set Secure, HttpOnly, and SameSite=Lax (or Strict) on all session/auth cookies.",
    };
  }
  return { id: "cookies", pass: true, severity: "none", message: "Cookies carry Secure, HttpOnly, and SameSite flags." };
}

export async function checkHttpsRedirect(httpsUrl) {
  try {
    const httpUrl = httpsUrl.replace(/^https:/i, "http:");
    const res = await fetch(httpUrl, { redirect: "manual", signal: AbortSignal.timeout(5000) });
    const location = res.headers.get("location") || "";
    const redirects = res.status >= 300 && res.status < 400 && location.startsWith("https://");
    if (!redirects) {
      return {
        id: "https-redirect",
        pass: false,
        severity: "high",
        message: "Plain HTTP requests are not redirected to HTTPS.",
        recommendation: "Redirect all HTTP traffic to HTTPS at the server/load-balancer level.",
      };
    }
    return { id: "https-redirect", pass: true, severity: "none", message: "HTTP requests are redirected to HTTPS." };
  } catch {
    return {
      id: "https-redirect",
      pass: false,
      severity: "low",
      message: "Could not verify HTTP → HTTPS redirect (request failed or timed out).",
    };
  }
}

const SENSITIVE_PATHS = ["/.git/config", "/.env", "/.DS_Store"];

export async function checkExposedFiles(baseUrl) {
  const results = [];
  for (const path of SENSITIVE_PATHS) {
    try {
      const res = await fetch(new URL(path, baseUrl), {
        method: "GET",
        redirect: "manual",
        signal: AbortSignal.timeout(4000),
      });
      if (res.status === 200) {
        results.push({
          id: `exposed-${path}`,
          pass: false,
          severity: "critical",
          message: `Sensitive file appears to be publicly exposed: ${path}`,
          recommendation: `Block access to ${path} at the web server / hosting config level immediately.`,
        });
      }
    } catch {
      // Network error on an individual path is not itself a finding — skip silently.
    }
  }
  if (results.length === 0) {
    results.push({
      id: "exposed-files",
      pass: true,
      severity: "none",
      message: "No commonly-exposed sensitive files detected.",
    });
  }
  return results;
}
