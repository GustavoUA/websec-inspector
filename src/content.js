function getThirdPartyOrigins() {
  try {
    const pageOrigin = location.origin;
    const origins = new Set();

    for (const entry of performance.getEntriesByType("resource")) {
      try {
        const u = new URL(entry.name);
        if (!["http:", "https:"].includes(u.protocol)) continue;
        if (u.origin !== pageOrigin) origins.add(u.origin);
      } catch (_) {}
    }
    return [...origins].sort();
  } catch (_) {
    return [];
  }
}

function getPageSignals() {
  return {
    url: location.href,
    origin: location.origin,
    protocol: location.protocol,
    title: document.title,
    thirdPartyOrigins: getThirdPartyOrigins(),
    hasPasswordField: !!document.querySelector('input[type="password"]'),
    forms: [...document.forms].map(f => ({
      action: f.action || location.href,
      method: (f.method || "get").toLowerCase()
    })).slice(0, 25)
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "GET_PAGE_SIGNALS") {
    sendResponse(getPageSignals());
    return true;
  }
});
