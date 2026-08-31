let lastReport = null;

const $ = (id) => document.getElementById(id);

function addCheck(container, status, name, desc) {
  const icons = { pass: "✓", warn: "⚠", fail: "✕", info: "•" };
  const row = document.createElement("div");
  row.className = "check";
  row.innerHTML = `
    <div class="icon">${icons[status] || "•"}</div>
    <div>
      <div class="name">${name}</div>
      <div class="desc">${desc}</div>
    </div>`;
  container.appendChild(row);
}

function headerExists(headers, key) {
  return Object.prototype.hasOwnProperty.call(headers || {}, key.toLowerCase());
}

function scoreReport(data) {
  let score = 100;
  const findings = [];

  if (data.protocol === "https:") {
    findings.push(["pass", "HTTPS", "La página utiliza HTTPS."]);
  } else {
    score -= 35;
    findings.push(["fail", "HTTPS", "La página no utiliza HTTPS."]);
  }

  const h = data.headers || {};
  const checks = [
    ["strict-transport-security", 15, "HSTS", "Reduce ataques de downgrade/SSL stripping."],
    ["content-security-policy", 15, "Content-Security-Policy", "Ayuda a limitar ejecución/carga de contenido no autorizado."],
    ["x-content-type-options", 5, "X-Content-Type-Options", "Reduce MIME sniffing."],
    ["x-frame-options", 5, "X-Frame-Options", "Mitiga clickjacking en navegadores compatibles."],
    ["referrer-policy", 4, "Referrer-Policy", "Controla la información enviada en Referer."],
    ["permissions-policy", 4, "Permissions-Policy", "Restringe APIs y capacidades del navegador."]
  ];

  for (const [key, penalty, label, desc] of checks) {
    if (headerExists(h, key)) findings.push(["pass", label, desc]);
    else {
      score -= penalty;
      findings.push(["warn", label, `Cabecera no detectada. ${desc}`]);
    }
  }

  if ((data.redirects || 0) >= 4) {
    score -= 5;
    findings.push(["warn", "Redirecciones", `${data.redirects} redirecciones antes de la carga principal.`]);
  } else {
    findings.push(["info", "Redirecciones", `${data.redirects || 0} detectadas.`]);
  }

  const third = data.thirdPartyOrigins?.length || 0;
  if (third > 20) {
    score -= 7;
    findings.push(["warn", "Terceros", `${third} orígenes externos detectados.`]);
  } else {
    findings.push(["info", "Terceros", `${third} orígenes externos detectados.`]);
  }

  const insecureCookies = (data.cookies || []).filter(c => !c.secure).length;
  const noHttpOnly = (data.cookies || []).filter(c => !c.httpOnly).length;
  const noSameSite = (data.cookies || []).filter(c => !c.sameSite || c.sameSite === "unspecified").length;

  if (data.protocol === "https:" && insecureCookies > 0) {
    score -= Math.min(10, insecureCookies * 2);
    findings.push(["warn", "Cookies Secure", `${insecureCookies} cookies visibles para el dominio no tienen Secure.`]);
  } else {
    findings.push(["pass", "Cookies Secure", insecureCookies ? "La página no usa HTTPS; Secure no es aplicable igual." : "No se detectaron cookies sin Secure en HTTPS."]);
  }

  if (noHttpOnly > 0) {
    score -= Math.min(8, noHttpOnly);
    findings.push(["warn", "Cookies HttpOnly", `${noHttpOnly} cookies no tienen HttpOnly.`]);
  } else {
    findings.push(["pass", "Cookies HttpOnly", "Las cookies detectadas tienen HttpOnly."]);
  }

  if (noSameSite > 0) {
    score -= Math.min(6, noSameSite);
    findings.push(["warn", "Cookies SameSite", `${noSameSite} cookies no declaran SameSite.`]);
  } else {
    findings.push(["pass", "Cookies SameSite", "Las cookies detectadas declaran SameSite."]);
  }

  if (data.hasPasswordField && data.protocol !== "https:") {
    score -= 20;
    findings.push(["fail", "Formulario de contraseña", "Se detectó un campo de contraseña en una página sin HTTPS."]);
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, findings };
}

async function analyze() {
  $("checks").innerHTML = "";
  $("host").textContent = "Analizando…";
  $("score").textContent = "—";
  $("barFill").style.width = "0%";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url || !/^https?:/i.test(tab.url)) {
    $("host").textContent = "Página no compatible";
    addCheck($("checks"), "info", "Sin análisis", "Abre una página HTTP/HTTPS normal.");
    return;
  }

  const u = new URL(tab.url);
  $("host").textContent = u.hostname;

  let pageSignals = {};
  try {
    pageSignals = await chrome.tabs.sendMessage(tab.id, { type: "GET_PAGE_SIGNALS" });
  } catch (_) {
    pageSignals = { url: tab.url, protocol: u.protocol, thirdPartyOrigins: [], hasPasswordField: false };
  }

  let network = null;
  try {
    network = await chrome.runtime.sendMessage({ type: "GET_NETWORK_STATE", tabId: tab.id });
  } catch (_) {}

  let cookies = [];
  try {
    cookies = await chrome.cookies.getAll({ url: tab.url });
  } catch (_) {}

  const data = {
    analyzedAt: new Date().toISOString(),
    url: tab.url,
    hostname: u.hostname,
    protocol: pageSignals?.protocol || u.protocol,
    headers: network?.headers || {},
    statusCode: network?.statusCode ?? null,
    redirects: network?.redirects || 0,
    thirdPartyOrigins: pageSignals?.thirdPartyOrigins || [],
    hasPasswordField: !!pageSignals?.hasPasswordField,
    cookies: cookies.map(c => ({
      name: c.name,
      domain: c.domain,
      secure: c.secure,
      httpOnly: c.httpOnly,
      sameSite: c.sameSite,
      session: c.session
    }))
  };

  const scored = scoreReport(data);
  data.score = scored.score;
  data.findings = scored.findings;
  lastReport = data;

  $("score").textContent = `${data.score}/100`;
  $("barFill").style.width = `${data.score}%`;
  $("redirects").textContent = data.redirects;
  $("thirdParties").textContent = data.thirdPartyOrigins.length;
  $("cookiesCount").textContent = data.cookies.length;

  const badge = $("riskBadge");
  badge.className = "badge";
  if (data.score >= 80) {
    badge.textContent = "BAJO";
    badge.classList.add("low");
  } else if (data.score >= 55) {
    badge.textContent = "MEDIO";
    badge.classList.add("medium");
  } else {
    badge.textContent = "ALTO";
    badge.classList.add("high");
  }

  $("summary").textContent =
    data.score >= 80 ? "Buena postura básica de seguridad."
    : data.score >= 55 ? "Hay configuraciones que conviene revisar."
    : "Se detectaron varias señales de riesgo o endurecimiento insuficiente.";

  for (const f of data.findings) addCheck($("checks"), ...f);
}

$("refresh").addEventListener("click", analyze);

$("export").addEventListener("click", () => {
  if (!lastReport) return;
  const blob = new Blob([JSON.stringify(lastReport, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `websec-${lastReport.hostname}-${Date.now()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

analyze();
