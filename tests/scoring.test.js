const assert = require("assert");
const scoring = require("../src/scoring.js");
const secure = { protocol:"https:", headers:{"strict-transport-security":"max-age=31536000", "content-security-policy":"default-src 'self'; object-src 'none'; frame-ancestors 'self'", "x-content-type-options":"nosniff", "referrer-policy":"strict-origin-when-cross-origin", "permissions-policy":"camera=(), microphone=()"}, cookies:[], forms:[], thirdPartyOrigins:[], redirects:0 };
assert.strictEqual(scoring.analyze(secure).score, 100);
const insecure = scoring.analyze({ protocol:"http:", headers:{}, cookies:[], forms:[{action:"http://example.test/login"}], hasPasswordField:true });
assert(insecure.score <= 30);
assert(insecure.findings.some(f => f.status === "fail" && f.name === "Formulario de contraseña"));
const weak = scoring.analyze({...secure, headers:{...secure.headers, "content-security-policy":"default-src * 'unsafe-inline' 'unsafe-eval'"}});
assert(weak.findings.some(f => f.name === "Content-Security-Policy" && f.penalty === 5));
const cookies = scoring.analyze({...secure, cookies:[{firstParty:true, secure:false, session:true, httpOnly:false, sameSite:"unspecified"}]});
assert(cookies.score < 100);
console.log("scoring tests: ok");

