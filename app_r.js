/* Dibujo del mapa y ficha de cada pantalla. No requiere librerías. */
const byId = Object.fromEntries(N.map(n => [n[0], n]));
const pos = id => { const n = byId[id]; return { x: n[1], y: BANDS[n[2]][1] + 58 }; };
const svg = document.getElementById('map');
const NS = 'http://www.w3.org/2000/svg';
const mk = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
const STC = { impl: 'var(--ok)', pend: 'var(--warn)', build: 'var(--build)', mock: 'var(--mock)' };

BANDS.forEach(([name, y], i) => {
  svg.appendChild(mk('rect', { x: 8, y: y, width: 1150, height: 140, rx: 10, class: 'bandrect' }));
  const t = mk('text', { x: 22, y: y + 20, class: 'bandtxt' }); t.textContent = name; svg.appendChild(t);
});
const defs = mk('defs', {});
['m-off', 'm-on', 'm-risk'].forEach((id, i) => {
  const m = mk('marker', { id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' });
  m.appendChild(mk('path', { d: 'M0 0L10 5L0 10z', fill: ['var(--line)', 'var(--accent)', 'var(--risk)'][i] }));
  defs.appendChild(m);
});
svg.appendChild(defs);
svg.appendChild(mk('rect', { x: 1170, y: 172, width: 212, height: 620, rx: 10, class: 'aicol' }));
{ const t = mk('text', { x: 1184, y: 192, class: 'aititle' }); t.textContent = 'Alerta inminente'; svg.appendChild(t); }
const portEls = [];
BANDS.slice(1).forEach(([name, y], i) => {
  const g = mk('g', { class: 'port', tabindex: 0, role: 'button', 'aria-label': `Activar alerta inminente desde ${name}` });
  g.appendChild(mk('rect', { x: 1030, y: y + 7, width: 120, height: 22, rx: 11 }));
  const t = mk('text', { x: 1090, y: y + 22, 'text-anchor': 'middle' }); t.textContent = '⚠ Alerta inminente'; g.appendChild(t);
  g.appendChild(mk('path', { d: `M1150 ${y + 18}H1168`, 'marker-end': 'url(#m-risk)' }));
  g.addEventListener('click', () => select('ai'));
  g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); select('ai'); } });
  svg.appendChild(g); portEls.push(g);
});
const gEdges = mk('g', {}); svg.appendChild(gEdges);
const edgeEls = E.map(([a, b, par, , hidden]) => {
  if (hidden) return null;
  const p = pos(a), q = pos(b);
  let d;
  if (byId[a][2] === byId[b][2]) {
    const dir = q.x > p.x ? 1 : -1;
    const x1 = p.x + dir * W / 2, x2 = q.x - dir * W / 2;
    const rev = E.some(o => o[0] === b && o[1] === a) && q.x < p.x;
    if (Math.abs(q.x - p.x) <= 160 && !rev) d = `M${x1} ${p.y}L${x2} ${q.y}`;
    else { const yy = p.y + H / 2; d = `M${p.x} ${yy}C${p.x} ${yy + 34},${q.x} ${yy + 34},${q.x} ${yy}`; }
  } else {
    const down = q.y > p.y;
    const y1 = p.y + (down ? H / 2 : -H / 2), y2 = q.y + (down ? -H / 2 : H / 2);
    const my = (y1 + y2) / 2;
    d = `M${p.x} ${y1}C${p.x} ${my},${q.x} ${my},${q.x} ${y2}`;
  }
  const e = mk('path', { d, class: 'edge' + (par ? ' par' : ''), 'marker-end': 'url(#m-off)' });
  gEdges.appendChild(e); return e;
});
const nodeEls = {};
const stripEls = {};
N.forEach(n => {
  const [id, x, b, name, rol, code, mod, st] = n;
  const y = BANDS[b][1] + 58;
  const g = mk('g', { class: 'node' + (st === 'mock' ? ' mock' : ''), tabindex: 0, role: 'button', 'aria-label': `${name}, ${rol}` });
  g.appendChild(mk('rect', { class: 'box', x: x - W / 2, y: y - H / 2, width: W, height: H, rx: 8 }));
  const strip = mk('rect', { x: x - W / 2 + 6, y: y - H / 2 + 7, width: 4, height: H - 14, rx: 2, fill: STC[st], class: 'strip' });
  g.appendChild(strip); stripEls[id] = strip;
  const fit = (s, max) => s.length > max ? s.slice(0, max - 1) + '…' : s;
  const t1 = mk('text', { x: x - W / 2 + 16, y: y - 3, class: 'n' }); t1.textContent = fit(name, 17); g.appendChild(t1);
  const t2 = mk('text', { x: x - W / 2 + 16, y: y + 13, class: 'r' }); t2.textContent = fit(rol, 20); g.appendChild(t2);
  const tt = mk('title', {}); tt.textContent = `${name} · ${rol}`; g.appendChild(tt);
  g.addEventListener('click', () => select(id));
  g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); select(id); } });
  svg.appendChild(g); nodeEls[id] = g;
});

let cur = null, imgIdx = 0, modFilter = '';
const panel = document.getElementById('panel');
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function render() {
  const n = byId[cur];
  const [id, , , name, rol, code, mod, st, imgs, desc] = n;
  const inn = E.map((e, i) => [e, i]).filter(([e]) => e[1] === id);
  const out = E.map((e, i) => [e, i]).filter(([e]) => e[0] === id);
  const li = (arr, side) => arr.length ? arr.map(([e]) => {
    const other = byId[side === 'in' ? e[0] : e[1]];
    return `<li><button class="linkbtn" data-go="${other[0]}"><span class="kind${e[2] ? ' par' : ''}">${e[2] ? 'paralelo' : 'serie'}</span><span><b>${esc(other[3])}</b> <span class="via">· ${esc(e[3])}</span></span></button></li>`;
  }).join('') : '<li class="note">Ninguno en este mapa.</li>';
  const img = imgs[imgIdx];
  const man = MAN[mod];
  panel.innerHTML = `
    <div class="shot"><img id="shot" src="img/${img}.jpg" alt="Pantalla ${esc(name)} (${imgIdx + 1} de ${imgs.length})" width="1100" height="720"></div>
    <div class="shotbar"><button class="navbtn" id="prev" ${imgIdx === 0 ? 'disabled' : ''}>Anterior</button><span>Pantalla ${imgIdx + 1} de ${imgs.length} · toque para ampliar</span><button class="navbtn" id="next" ${imgIdx === imgs.length - 1 ? 'disabled' : ''}>Siguiente</button></div>
    <h2>${esc(name)}</h2>
    <div class="tags"><span class="tag">${esc(rol)}</span><span class="tag code">${esc(code)}</span><span class="tag ${ST[st][1]}">${ST[st][0]}</span></div>
    <p class="desc">${esc(desc)}</p>
    <div class="flows"><div><h3>Recibe trabajo de</h3><ul>${li(inn, 'in')}</ul></div><div><h3>Entrega trabajo a</h3><ul>${li(out, 'out')}</ul></div></div>
    ${cierreHTML(id)}
    <p class="manual note">Manual técnico (acceso restringido al equipo del proyecto): <a href="${man[1]}" target="_blank" rel="noopener">${esc(man[0])}</a></p>`;
  const im = panel.querySelector('#shot');
  im.addEventListener('load', () => { im.removeAttribute('height'); });
  im.addEventListener('click', () => { const z = document.getElementById('zoom'); document.getElementById('zoom-img').src = im.src; document.getElementById('zoom-img').alt = im.alt; z.showModal(); });
  panel.querySelector('#prev').onclick = () => { imgIdx--; render(); };
  panel.querySelector('#next').onclick = () => { imgIdx++; render(); };
  panel.querySelectorAll('[data-go]').forEach(b => b.onclick = () => select(b.dataset.go));
  paint();
}
function cierreHTML(id) {
  if (typeof CIERRE === 'undefined') return '';
  const C = CIERRE;
  const [st, nota] = C.pantallas[id] || ['mock', ''];
  const [stl, stc] = C.estadosPantalla[st];
  const tareas = C.tareas.filter(t => t[6].includes(id));
  const nombre = q => (C.personas.find(p => p.id === q) || { nombre: q }).nombre.split(' ')[0];
  const hist = C.historias.filter(h => h.pasos.some(p => p[0] === id));
  const orden = { sintarea: 0, porhacer: 1, cliente: 2, confirmar: 3, revision: 4, curso: 5, plan: 6, hecho: 7 };
  const lis = tareas.sort((a, b) => orden[a[5]] - orden[b[5]]).map(t => {
    const [el, ec] = C.estadosTarea[t[5]];
    return `<li><a class="ctask" href="instrucciones.html#t-${t[0]}"><span class="cst c-${ec}">${esc(el)}</span><span>${esc(t[2])} <span class="via">· ${t[1].map(nombre).join(' y ')} · S${t[3]}${t[4] !== t[3] ? ' a S' + t[4] : ''}</span></span></a></li>`;
  }).join('');
  return `<div class="cierre"><h3>En el plan de cierre (v${esc(C.version)}, ${esc(C.corte)})</h3>
    <p class="cnota"><span class="cst c-${stc}">${esc(stl)}</span> ${esc(nota)}</p>
    ${hist.length ? `<p class="chist">Historias que pasan por aquí: ${hist.map(h => `<a href="instrucciones.html#h-${h.id}">${h.id} · ${esc(h.titulo)}</a>`).join(' · ')}</p>` : ''}
    ${tareas.length ? `<ul class="clist">${lis}</ul><p class="note"><a href="instrucciones.html#p-${id}">Ver estas ${tareas.length} tareas en las instrucciones de cierre</a></p>` : '<p class="note">Ninguna tarea del plan de cierre mueve esta pantalla.' + (st !== 'prod' ? ' Es un tramo sin dueño.' : '') + '</p>'}
  </div>`;
}
let capa = 'manual';
const CST = { prod: 'var(--ok)', testing: 'var(--build)', revision: 'var(--build)', parcial: 'var(--warn)', pendprod: 'var(--warn)', sintarea: 'var(--risk)', mock: 'var(--mock)' };
function pintarCapa() {
  N.forEach(n => {
    const st = capa === 'cierre' && typeof CIERRE !== 'undefined' ? CST[(CIERRE.pantallas[n[0]] || ['mock'])[0]] : STC[n[7]];
    stripEls[n[0]].setAttribute('fill', st);
    const esMock = capa === 'cierre' && typeof CIERRE !== 'undefined' ? (CIERRE.pantallas[n[0]] || ['mock'])[0] === 'mock' : n[7] === 'mock';
    nodeEls[n[0]].classList.toggle('mock', esMock);
  });
  const lm = document.getElementById('leg-manual'), lc = document.getElementById('leg-cierre');
  if (lm && lc) { lm.hidden = capa === 'cierre'; lc.hidden = capa !== 'cierre'; }
}
if (typeof CIERRE !== 'undefined') {
  const leg = document.querySelector('.legend');
  const caja = document.createElement('div');
  caja.className = 'capa';
  caja.innerHTML = `<span class="lbl">Color de las pantallas:</span>
    <button class="chip" data-capa="manual" aria-pressed="true">Manuales (13-oct)</button>
    <button class="chip" data-capa="cierre" aria-pressed="false">Plan de cierre (${CIERRE.corte})</button>
    <span class="leg-c" id="leg-cierre" hidden>${[['prod', 'En producción'], ['testing', 'En testing o revisión'], ['parcial', 'En construcción o pendiente de producción'], ['sintarea', 'Sin tarea en Jira'], ['mock', 'Solo en el mockup']].map(([k, l]) => `<span><i class="dot" style="background:${CST[k]}"></i>${l}</span>`).join('')}</span>`;
  leg.after(caja);
  leg.id = 'leg-manual';
  caja.querySelectorAll('[data-capa]').forEach(b => b.addEventListener('click', () => {
    capa = b.dataset.capa;
    caja.querySelectorAll('[data-capa]').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    pintarCapa();
    try { localStorage.setItem('red-capa', capa); } catch (e) {}
  }));
  try { if (localStorage.getItem('red-capa') === 'cierre') caja.querySelector('[data-capa="cierre"]').click(); } catch (e) {}
}
function paint() {
  const rel = new Set([cur]);
  E.forEach(e => { if (e[0] === cur) rel.add(e[1]); if (e[1] === cur) rel.add(e[0]); });
  N.forEach(n => {
    const el = nodeEls[n[0]];
    el.classList.toggle('sel', n[0] === cur);
    const dimMod = modFilter && n[6] !== modFilter;
    el.classList.toggle('dim', dimMod);
  });
  portEls.forEach(el => { el.classList.toggle('on', cur === 'ai'); el.classList.toggle('dim', !!modFilter && modFilter !== 'alerta'); });
  edgeEls.forEach((el, i) => {
    if (!el) return;
    const e = E[i];
    const on = e[0] === cur || e[1] === cur;
    const modOn = !modFilter || (byId[e[0]][6] === modFilter && byId[e[1]][6] === modFilter);
    el.classList.toggle('on', on);
    el.classList.toggle('dim', !on && (!modOn || !!cur));
    el.setAttribute('marker-end', on ? 'url(#m-on)' : 'url(#m-off)');
  });
}
function select(id) { cur = id; imgIdx = 0; render(); try { localStorage.setItem('red-sel', id); } catch (e) {} if (location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id); }
document.querySelectorAll('.chip[data-mod]').forEach(c => c.addEventListener('click', () => {
  modFilter = c.dataset.mod;
  document.querySelectorAll('.chip[data-mod]').forEach(x => x.setAttribute('aria-pressed', x === c ? 'true' : 'false'));
  const first = N.find(n => !modFilter || n[6] === modFilter);
  if (modFilter && byId[cur][6] !== modFilter && first) select(first[0]); else paint();
}));
let start = 'gs';
try { const s = localStorage.getItem('red-sel'); if (s && byId[s]) start = s; } catch (e) {}
const desdeHash = () => { const h = decodeURIComponent(location.hash.slice(1)); return byId[h] ? h : null; };
if (desdeHash()) start = desdeHash();
select(start);
if (desdeHash()) setTimeout(() => nodeEls[start].scrollIntoView({ block: 'nearest', inline: 'center' }), 60);
window.addEventListener('hashchange', () => { const h = desdeHash(); if (h && h !== cur) { select(h); nodeEls[h].scrollIntoView({ block: 'nearest', inline: 'center' }); } });