const WebSecHistory = (() => {
  const KEY = "websecHistoryV1";
  function snapshot(report) {
    // Deliberately exclude paths, query strings, fragments, headers, cookies and API data.
    return {schema:1, origin:new URL(report.url).origin, at:report.analyzedAt,
      score:report.localScore, complete:report.coverage.complete,
      findings:report.findings.map(f=>({name:f.name,status:f.status,penalty:f.penalty})),
      thirds:[...new Set(report.thirdPartyOrigins || [])].sort()};
  }
  function compare(current, previous) {
    if (!previous) return {message:"No hay un análisis guardado para este origen.", changes:[]};
    if (previous.schema !== 1 || !previous.complete || !current.complete)
      return {message:"Comparación no disponible: ambos análisis deben tener cobertura completa.", changes:[]};
    const old = new Map(previous.findings.map(f=>[f.name,f]));
    const changes = [];
    for (const f of current.findings) {
      const before=old.get(f.name);
      if (!before) changes.push("Nuevo resultado: "+f.name);
      else if (before.status !== f.status || before.penalty !== f.penalty)
        changes.push(f.name+": "+before.status+" → "+f.status+" ("+before.penalty+" → "+f.penalty+" puntos de penalización)");
      old.delete(f.name);
    }
    for (const name of old.keys()) changes.push("Ya no observado: "+name);
    for (const origin of current.thirds) if (!previous.thirds.includes(origin)) changes.push("Nuevo origen externo: "+origin);
    for (const origin of previous.thirds) if (!current.thirds.includes(origin)) changes.push("Origen externo ya no observado: "+origin);
    const delta=current.score-previous.score;
    return {message:"Comparado con "+new Date(previous.at).toLocaleString("es-ES")+". Cambio de puntuación local: "+(delta>0?"+":"")+delta+".", changes};
  }
  return {KEY,snapshot,compare};
})();
if(typeof module !== "undefined") module.exports=WebSecHistory;
