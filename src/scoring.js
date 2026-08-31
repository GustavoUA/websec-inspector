const WebSecScoring = (() => {
  const finding = (status, category, name, summary, recommendation, penalty = 0, evidence = "") => ({ status, category, name, summary, recommendation, penalty, evidence });
  const value = (headers, key) => String(headers?.[key] || "").trim();

  function analyze(data) {
    const findings = [];
    const add = (...args) => findings.push(finding(...args));
    const https = data.protocol === "https:";

    if (https) add("pass", "risk", "HTTPS", "La conexión utiliza HTTPS.", "Mantén HTTPS en todo el sitio.");
    else add("fail", "risk", "HTTPS", "La página se carga sin cifrado HTTPS.", "Configura HTTPS y redirige todo el tráfico HTTP.", 35);

    const hsts = value(data.headers, "strict-transport-security");
    if (!https) add("info", "hardening", "HSTS", "HSTS solo se aplica sobre HTTPS.", "Activa HTTPS antes de configurar HSTS.");
    else if (!hsts) add("warn", "hardening", "HSTS", "No se detectó Strict-Transport-Security.", "Añade HSTS después de confirmar que todo el sitio funciona por HTTPS.", 8);
    else {
      const seconds = Number((hsts.match(/max-age\s*=\s*(\d+)/i) || [])[1] || 0);
      if (seconds < 15552000) add("warn", "hardening", "HSTS", "HSTS está activo, pero su duración es inferior a 180 días.", "Usa un max-age prolongado tras validar el despliegue.", 3, hsts);
      else add("pass", "hardening", "HSTS", "HSTS está activo con una duración adecuada.", "Considera includeSubDomains solo si todos los subdominios usan HTTPS.", 0, hsts);
    }

    const csp = value(data.headers, "content-security-policy");
    if (!csp) add("warn", "hardening", "Content-Security-Policy", "No se detectó una política CSP.", "Define una CSP adaptada a los recursos legítimos del sitio.", 10);
    else {
      const weak = [];
      if (/['\"]unsafe-eval['\"]/i.test(csp)) weak.push("unsafe-eval");
      if (/['\"]unsafe-inline['\"]/i.test(csp)) weak.push("unsafe-inline");
      if (/\*|https?:\s*\/\//i.test(csp)) weak.push("fuentes amplias");
      if (!/\bobject-src\b/i.test(csp)) weak.push("sin object-src");
      if (weak.length) add("warn", "hardening", "Content-Security-Policy", `CSP presente con aspectos a revisar: ${weak.join(", ")}.`, "Reduce fuentes amplias y evita directivas inseguras cuando sea posible.", 5, csp);
      else add("pass", "hardening", "Content-Security-Policy", "Se detectó una CSP sin patrones débiles básicos.", "Verifica la política con pruebas específicas de la aplicación.", 0, csp);
    }

    const nosniff = value(data.headers, "x-content-type-options");
    if (nosniff.toLowerCase() === "nosniff") add("pass", "hardening", "X-Content-Type-Options", "MIME sniffing está restringido.", "Mantén el valor nosniff.", 0, nosniff);
    else add("warn", "hardening", "X-Content-Type-Options", nosniff ? "La cabecera existe, pero no usa nosniff." : "No se detectó la cabecera.", "Configura X-Content-Type-Options: nosniff.", 4, nosniff);

    const frame = value(data.headers, "x-frame-options");
    const frameAncestors = /(?:^|;)\s*frame-ancestors\b/i.test(csp);
    if (frameAncestors || /^(deny|sameorigin)$/i.test(frame)) add("pass", "hardening", "Protección contra marcos", "Se detectó una política contra inclusión no autorizada en marcos.", "Mantén frame-ancestors o X-Frame-Options según compatibilidad.", 0, frameAncestors ? "CSP frame-ancestors" : frame);
    else add("warn", "hardening", "Protección contra marcos", "No se detectó una protección clara contra clickjacking.", "Usa CSP frame-ancestors; X-Frame-Options puede servir como compatibilidad adicional.", 5, frame);

    const referrer = value(data.headers, "referrer-policy").toLowerCase();
    const safeReferrers = ["no-referrer", "same-origin", "strict-origin", "strict-origin-when-cross-origin"];
    if (safeReferrers.includes(referrer)) add("pass", "hardening", "Referrer-Policy", "La política limita la información enviada a otros orígenes.", "Mantén una política adecuada a la aplicación.", 0, referrer);
    else add("warn", "hardening", "Referrer-Policy", referrer ? `Política a revisar: ${referrer}.` : "No se detectó una política explícita.", "Considera strict-origin-when-cross-origin o una política más restrictiva.", 2, referrer);

    const permissions = value(data.headers, "permissions-policy");
    if (permissions) add("pass", "hardening", "Permissions-Policy", "Se detectó una política de capacidades del navegador.", "Comprueba que restringe las funciones que el sitio no utiliza.", 0, permissions);
    else add("info", "hardening", "Permissions-Policy", "No se detectó una política explícita.", "Restringe cámara, micrófono, geolocalización y otras funciones cuando no sean necesarias.", 0);

    const cookies = data.cookies || [];
    const firstParty = cookies.filter(c => c.firstParty !== false);
    const insecure = firstParty.filter(c => https && !c.secure);
    const sessionReadable = firstParty.filter(c => c.session && !c.httpOnly);
    const unspecified = firstParty.filter(c => !c.sameSite || c.sameSite === "unspecified");
    if (!cookies.length) add("info", "info", "Cookies", "No se detectaron cookies accesibles para esta URL.", "No requiere acción.");
    else {
      if (insecure.length) add("warn", "risk", "Cookies Secure", `${insecure.length} cookies propias en HTTPS no tienen Secure.`, "Marca como Secure las cookies que solo deban viajar por HTTPS.", Math.min(8, insecure.length * 2));
      else add("pass", "risk", "Cookies Secure", "No se detectaron cookies propias sin Secure en HTTPS.", "Mantén Secure en cookies transmitidas por HTTPS.");
      if (sessionReadable.length) add("warn", "hardening", "Cookies HttpOnly", `${sessionReadable.length} cookies de sesión son accesibles desde JavaScript.`, "Usa HttpOnly en cookies de sesión que no necesiten acceso desde scripts.", Math.min(5, sessionReadable.length));
      else add("pass", "hardening", "Cookies HttpOnly", "No se detectaron cookies de sesión propias sin HttpOnly.", "No uses HttpOnly en cookies que deban leerse legítimamente desde JavaScript.");
      if (unspecified.length) add("warn", "hardening", "Cookies SameSite", `${unspecified.length} cookies propias no declaran SameSite.`, "Declara Lax, Strict o None según el flujo previsto.", Math.min(4, unspecified.length));
      else add("pass", "hardening", "Cookies SameSite", "Las cookies propias detectadas declaran SameSite.", "Revisa que el valor corresponda al uso real.");
    }

    if (data.hasPasswordField && !https) add("fail", "risk", "Formulario de contraseña", "Se detectó un campo de contraseña en una página sin HTTPS.", "No solicites credenciales hasta habilitar HTTPS.", 20);
    const insecureForms = (data.forms || []).filter(f => /^http:/i.test(f.action || ""));
    if (insecureForms.length) add("fail", "risk", "Destino de formularios", `${insecureForms.length} formularios envían datos a una URL HTTP.`, "Envía los formularios exclusivamente a endpoints HTTPS.", 15);

    const redirects = data.redirects || 0;
    add(redirects >= 4 ? "warn" : "info", "info", "Redirecciones", `${redirects} redirecciones detectadas.`, redirects >= 4 ? "Revisa la cadena para reducir complejidad y exposición." : "No requiere acción.", redirects >= 4 ? 2 : 0);
    const third = data.thirdPartyOrigins?.length || 0;
    add(third > 20 ? "warn" : "info", "info", "Terceros", `${third} orígenes externos observados.`, third > 20 ? "Revisa si todos los terceros son necesarios y confiables." : "Evalúa cada tercero según su finalidad.", third > 20 ? 2 : 0);

    const score = Math.max(0, 100 - findings.reduce((sum, item) => sum + item.penalty, 0));
    const counts = findings.reduce((out, item) => (out[item.status]++, out), { pass: 0, warn: 0, fail: 0, info: 0 });
    return { score, findings, counts, totalPenalty: 100 - score };
  }
  return { analyze };
})();
if (typeof module !== "undefined") module.exports = WebSecScoring;

