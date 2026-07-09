// Blocks scanning of internal / private / cloud-metadata addresses so this
// tool can't be abused as an open SSRF proxy against internal infrastructure.

const BLOCKED_HOSTNAMES = new Set(["localhost", "0.0.0.0", "::1"]);

// Private / reserved IPv4 ranges (RFC 1918, loopback, link-local incl. cloud metadata).
const PRIVATE_IPV4_RANGES = [
  /^127\./,                // loopback
  /^10\./,                 // RFC1918
  /^192\.168\./,           // RFC1918
  /^172\.(1[6-9]|2\d|3[0-1])\./, // RFC1918 172.16.0.0 - 172.31.255.255
  /^169\.254\./,           // link-local (incl. 169.254.169.254 cloud metadata)
  /^0\./,                  // "this" network
];

function isPrivateIPv4(host) {
  return PRIVATE_IPV4_RANGES.some((re) => re.test(host));
}

export function assertSafeUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Malformed URL.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http:// and https:// URLs are allowed.");
  }

  const hostname = parsed.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    throw new Error("Scanning local/loopback addresses is not allowed.");
  }

  // Reject bracketed IPv6 outright for simplicity — this is a portfolio-scoped
  // guard, not exhaustive SSRF coverage (see README "Security Considerations").
  if (hostname.startsWith("[") || hostname.includes(":")) {
    throw new Error("IPv6 targets are not supported by this scanner.");
  }

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) && isPrivateIPv4(hostname)) {
    throw new Error("Scanning private/internal IP ranges is not allowed.");
  }

  return parsed;
}
