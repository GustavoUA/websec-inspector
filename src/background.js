const tabState = new Map();

const SECURITY_HEADERS = [
  "strict-transport-security",
  "content-security-policy",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy"
];

function normalizeHeaders(headers = []) {
  const out = {};
  for (const h of headers) {
    if (!h || !h.name) continue;
    const key = h.name.toLowerCase();
    out[key] = h.value ?? "";
  }
  return out;
}

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.tabId < 0 || details.type !== "main_frame") return;
    tabState.set(details.tabId, {
      url: details.url,
      startedAt: Date.now(),
      redirects: 0,
      headers: {},
      statusCode: null
    });
  },
  { urls: ["<all_urls>"], types: ["main_frame"] }
);

chrome.webRequest.onBeforeRedirect.addListener(
  (details) => {
    if (details.tabId < 0 || details.type !== "main_frame") return;
    const state = tabState.get(details.tabId) || {};
    state.redirects = (state.redirects || 0) + 1;
    state.url = details.redirectUrl || details.url;
    tabState.set(details.tabId, state);
  },
  { urls: ["<all_urls>"], types: ["main_frame"] },
  ["responseHeaders"]
);

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (details.tabId < 0 || details.type !== "main_frame") return;
    const state = tabState.get(details.tabId) || {};
    state.url = details.url;
    state.headers = normalizeHeaders(details.responseHeaders);
    state.statusCode = details.statusCode;
    state.finishedAt = Date.now();
    tabState.set(details.tabId, state);
  },
  { urls: ["<all_urls>"], types: ["main_frame"] },
  ["responseHeaders"]
);

chrome.tabs?.onRemoved?.addListener((tabId) => tabState.delete(tabId));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "GET_NETWORK_STATE") {
    sendResponse(tabState.get(message.tabId) || null);
    return true;
  }
});
