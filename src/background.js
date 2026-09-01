const tabState = new Map();
const threatCache = new Map();
const THREAT_CACHE_MS = 30 * 60 * 1000;

function normalizeHeaders(headers = []) {
  const out = {};
  for (const h of headers) {
    if (!h || !h.name) continue;
    out[h.name.toLowerCase()] = h.value ?? "";
  }
  return out;
}

function isPublicIp(ip) {
  if (!ip) return false;
  if (ip.includes(":")) {
    const v = ip.toLowerCase();
    return !(v === "::1" || v.startsWith("fe80:") || v.startsWith("fc") || v.startsWith("fd"));
  }
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  if (p[0] === 10 || p[0] === 127 || p[0] === 0) return false;
  if (p[0] === 169 && p[1] === 254) return false;
  if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return false;
  if (p[0] === 192 && p[1] === 168) return false;
  return true;
}

async function resolveHostname(hostname) {
  const query = async type => {
    const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=${type}`;
    const response = await fetch(url, { headers: { Accept: "application/dns-json" } });
    if (!response.ok) throw new Error(`DNS HTTP ${response.status}`);
    const body = await response.json();
    return (body.Answer || []).filter(a => (type === "A" ? a.type === 1 : a.type === 28)).map(a => a.data).filter(isPublicIp);
  };
  const ipv4 = await query("A");
  if (ipv4.length) return { ip: ipv4[0], all: ipv4, type: "A" };
  const ipv6 = await query("AAAA");
  if (ipv6.length) return { ip: ipv6[0], all: ipv6, type: "AAAA" };
  throw new Error("No se encontró una IP pública para el dominio");
}

async function getAbuseIpDbKey() {
  const { abuseIpDbApiKey = "" } = await chrome.storage.local.get("abuseIpDbApiKey");
  return String(abuseIpDbApiKey || "").trim();
}

async function checkAbuseIpDb(hostname, force = false) {
  const key = await getAbuseIpDbKey();
  if (!key) return { configured: false };
  const cacheKey = hostname.toLowerCase();
  const cached = threatCache.get(cacheKey);
  if (!force && cached && Date.now() - cached.at < THREAT_CACHE_MS) return { ...cached.value, cached: true };
  const resolved = await resolveHostname(hostname);
  const endpoint = new URL("https://api.abuseipdb.com/api/v2/check");
  endpoint.searchParams.set("ipAddress", resolved.ip);
  endpoint.searchParams.set("maxAgeInDays", "90");
  const response = await fetch(endpoint.toString(), { method: "GET", headers: { Accept: "application/json", Key: key } });
  let body = null;
  try { body = await response.json(); } catch {}
  if (!response.ok) {
    const apiMessage = body?.errors?.[0]?.detail || body?.message || `HTTP ${response.status}`;
    const err = new Error(apiMessage); err.status = response.status; throw err;
  }
  const d = body?.data || {};
  const value = {
    configured: true, cached: false, hostname,
    ipAddress: d.ipAddress || resolved.ip, ipVersion: d.ipVersion ?? null,
    abuseConfidenceScore: Number(d.abuseConfidenceScore || 0), totalReports: Number(d.totalReports || 0),
    lastReportedAt: d.lastReportedAt || null, countryCode: d.countryCode || null,
    usageType: d.usageType || null, isp: d.isp || null, domain: d.domain || null,
    isWhitelisted: d.isWhitelisted ?? null, resolvedAddresses: resolved.all, checkedAt: new Date().toISOString()
  };
  threatCache.set(cacheKey, { at: Date.now(), value });
  return value;
}

chrome.webRequest.onBeforeRequest.addListener(details => {
  if (details.tabId < 0 || details.type !== "main_frame") return;
  tabState.set(details.tabId, { url: details.url, startedAt: Date.now(), redirects: 0, headers: {}, statusCode: null });
}, { urls: ["<all_urls>"], types: ["main_frame"] });

chrome.webRequest.onBeforeRedirect.addListener(details => {
  if (details.tabId < 0 || details.type !== "main_frame") return;
  const state = tabState.get(details.tabId) || {};
  state.redirects = (state.redirects || 0) + 1; state.url = details.redirectUrl || details.url; tabState.set(details.tabId, state);
}, { urls: ["<all_urls>"], types: ["main_frame"] }, ["responseHeaders"]);

chrome.webRequest.onHeadersReceived.addListener(details => {
  if (details.tabId < 0 || details.type !== "main_frame") return;
  const state = tabState.get(details.tabId) || {};
  state.url = details.url; state.headers = normalizeHeaders(details.responseHeaders); state.statusCode = details.statusCode; state.finishedAt = Date.now(); tabState.set(details.tabId, state);
}, { urls: ["<all_urls>"], types: ["main_frame"] }, ["responseHeaders"]);

chrome.tabs?.onRemoved?.addListener(tabId => tabState.delete(tabId));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "GET_NETWORK_STATE") { sendResponse(tabState.get(message.tabId) || null); return true; }
  if (message?.type === "GET_ABUSEIPDB_STATUS") {
    getAbuseIpDbKey().then(key => sendResponse({ configured: !!key })).catch(error => sendResponse({ configured: false, error: error.message })); return true;
  }
  if (message?.type === "SAVE_ABUSEIPDB_KEY") {
    const key = String(message.key || "").trim();
    const action = key ? chrome.storage.local.set({ abuseIpDbApiKey: key }) : chrome.storage.local.remove("abuseIpDbApiKey");
    action.then(() => { threatCache.clear(); sendResponse({ ok: true, configured: !!key }); }).catch(error => sendResponse({ ok: false, error: error.message })); return true;
  }
  if (message?.type === "CHECK_ABUSEIPDB") {
    const hostname = String(message.hostname || "").trim();
    if (!hostname) { sendResponse({ configured: true, error: "Dominio no válido" }); return true; }
    checkAbuseIpDb(hostname, !!message.force).then(sendResponse).catch(error => sendResponse({ configured: true, error: error.message || "Error consultando AbuseIPDB", status: error.status || null })); return true;
  }
});
