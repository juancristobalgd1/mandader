// Lector mínimo de robots.txt (grupo User-agent: *, regla más larga gana, comodines * y $)
export async function cargarRobots(origen: string, ua: string) {
  const r = await fetch(new URL("/robots.txt", origen), { headers: { "User-Agent": ua } });
  const txt = r.ok ? await r.text() : "";
  const reglas: { allow: boolean; patron: string }[] = [];
  let enGrupo = false, vistoRegla = false;
  for (const linea of txt.split(/\r?\n/)) {
    const l = linea.replace(/#.*/, "").trim(); if (!l) continue;
    const [k, ...resto] = l.split(":"); const v = resto.join(":").trim(); const key = k.trim().toLowerCase();
    if (key === "user-agent") { if (vistoRegla) { enGrupo = false; vistoRegla = false; } if (v === "*") enGrupo = true; }
    else if (key === "allow" || key === "disallow") { vistoRegla = true; if (enGrupo && v) reglas.push({ allow: key === "allow", patron: v }); }
  }
  const aRegex = (p: string) => new RegExp("^" + p.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$"));
  const compiladas = reglas.map((x) => ({ ...x, re: aRegex(x.patron), len: x.patron.length }));
  return (url: string) => {
    const u = new URL(url); const ruta = u.pathname + u.search;
    let mejor: { allow: boolean; len: number } | null = null;
    for (const c of compiladas) if (c.re.test(ruta) && (!mejor || c.len > mejor.len || (c.len === mejor.len && c.allow))) mejor = c;
    return mejor ? mejor.allow : true;
  };
}
