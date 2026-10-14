/* app.js — tablero de hitos SALVIA con navegación mensual */

const D = DASHBOARD_DATA;
const STATE_CLASS = { 1: 'planned', 2: 'progress', 3: 'done' };
const STATE_NAME = { 1: 'Pendiente', 2: 'En curso', 3: 'Completado' };
const KEYWORDS = /(Avance:|Pendiente:|Decisión:|Nota:|Arquitectura:|Riesgo:|Estrategia:|MVP:|Macro:|Cambio Estratégico:|Avatar:|Plan B:)/g;
const COL_W = 40, GAP = 12;

const meses = D.months && D.months.length ? D.months : [{ id: 'actual', label: 'Corte actual', hours: { b1: 0, b2: 0, total: 0 }, cum: { b1: 0, b2: 0, total: 0 }, edt: (D.meta || {}).edt || 0, highlights: [], itemProgress: D.itemProgress || [] }];
const grupos = D.groups && D.groups.length ? D.groups : [{ name: 'Hitos', ids: D.milestones.map(m => m.id) }];
const hitoPorId = Object.fromEntries(D.milestones.map(m => [m.id, m]));
const contrato = (D.meta && D.meta.contrato) || { b1: 3744, b2: 1652, total: 5396 };

const state = {
    mes: Math.max(0, meses.findIndex(m => m.id === (D.meta || {}).mesInicial)),
    hito: null,
    expandidos: new Set(),
};
if (state.mes < 0) state.mes = meses.length - 1;

// ---------- utilidades ----------
const fmt = (n, d = 1) => Number(n || 0).toLocaleString('es-CO', { maximumFractionDigits: d });
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const nombreCorto = h => String(hitoPorId[h].name || h).replace(new RegExp('^' + h + '\\s*·\\s*'), '');
const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function getInfo(text) {
    const match = text.match(/^(\d+(\.\d+)*)/);
    const id = match ? match[1] : "";
    return { id, level: id ? id.split('.').length : 1 };
}
const itemInfo = D.expectedItems.map(getInfo);

function visible(idx) {
    const { id, level } = itemInfo[idx];
    if (level === 1) return true;
    const partes = id.split('.');
    for (let k = 1; k < partes.length; k++) {
        if (!state.expandidos.has(partes.slice(0, k).join('.'))) return false;
    }
    return true;
}

function datosHito(h, mesIdx = state.mes) {
    const m = hitoPorId[h];
    const mm = meses[mesIdx].id;
    return (m.byMonth && m.byMonth[mm]) || { completion: m.completion, signature: m.signature, details: m.details, hours: 0, cumHours: 0, items: {} };
}

// horas del hito seleccionado por actividad (las filas padre suman sus actividades)
function horasPorItem() {
    if (!state.hito) return null;
    const items = datosHito(state.hito).items || {};
    const res = D.expectedItems.map(() => [0, 0]);
    Object.entries(items).forEach(([k, v]) => {
        const i = Number(k);
        if (i < 0) return;
        const id = itemInfo[i].id;
        itemInfo.forEach((inf, j) => {
            if (j === i || id.startsWith(inf.id + '.')) { res[j][0] += v[0]; res[j][1] += v[1]; }
        });
    });
    return res;
}

// ---------- navegación por mes ----------
function renderMeses() {
    const cont = document.getElementById('month-pills');
    cont.innerHTML = '';
    meses.forEach((m, i) => {
        const b = el('button', `month-pill ${i === state.mes ? 'active' : ''}`, esc(m.label));
        b.onclick = () => irAMes(i);
        cont.appendChild(b);
    });
    document.getElementById('mes-anterior').disabled = state.mes === 0;
    document.getElementById('mes-siguiente').disabled = state.mes === meses.length - 1;
    document.getElementById('mes-nota').innerText = meses[state.mes].nota || '';
    const activo = cont.children[state.mes];
    if (activo && activo.scrollIntoView) activo.scrollIntoView({ block: 'nearest', inline: 'center' });
}

function irAMes(i) {
    state.mes = Math.min(meses.length - 1, Math.max(0, i));
    render();
}

// ---------- horas: indicadores y gráfico ----------
function renderKPIs() {
    const m = meses[state.mes];
    const kpis = [
        m.hours.total || !m.nota
            ? { t: 'Horas del mes', v: `${fmt(m.hours.total)} h`, s: `Bolsa 1: ${fmt(m.hours.b1)} h · Bolsa 2: ${fmt(m.hours.b2)} h` }
            : { t: 'Horas del mes', v: 'Sin registro', s: 'Las horas de este mes aún no están en TimeLogs' },
        { t: 'Acumulado del contrato', v: `${fmt(m.cum.total)} h`, s: `${pct(m.cum.total, contrato.total)} % de ${fmt(contrato.total, 0)} h`, p: pct(m.cum.total, contrato.total), c: '#e2e8f0' },
        { t: 'Bolsa 1 · SALVIA', v: `${fmt(m.cum.b1)} h`, s: `${pct(m.cum.b1, contrato.b1)} % de ${fmt(contrato.b1, 0)} h`, p: pct(m.cum.b1, contrato.b1), c: 'var(--accent)' },
        { t: 'Bolsa 2 · MASP', v: `${fmt(m.cum.b2)} h`, s: `${pct(m.cum.b2, contrato.b2)} % de ${fmt(contrato.b2, 0)} h`, p: pct(m.cum.b2, contrato.b2), c: 'var(--accent2)' },
    ];
    const cont = document.getElementById('kpis');
    cont.innerHTML = '';
    kpis.forEach(k => {
        const c = el('div', 'kpi');
        c.innerHTML = `<p class="text-[11px] uppercase tracking-wider text-slate-400">${k.t}</p>
            <p class="text-2xl font-bold text-white mt-1">${k.v}</p>
            <p class="text-xs text-slate-400 mt-1">${k.s}</p>
            ${k.p !== undefined ? `<div class="meter"><span style="width:${Math.min(100, k.p)}%;background:${k.c}"></span></div>` : ''}`;
        cont.appendChild(c);
    });
}

function renderGrafico() {
    const W = 520, H = 170, top = 14, bottom = 26, left = 8, right = 40;
    const ch = H - top - bottom, n = meses.length, slot = (W - left - right) / n, bw = Math.min(30, slot * 0.6);
    const maxMes = Math.max(1, ...meses.map(m => m.hours.total));
    const y = v => top + ch - (v / maxMes) * ch;
    const yc = v => top + ch - (v / contrato.total) * ch;
    let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Horas por mes y acumulado del contrato">`;
    svg += `<line x1="${left}" x2="${W - right}" y1="${top + ch}" y2="${top + ch}" stroke="#334155"/>`;
    svg += `<text x="${W - right + 4}" y="${top + 4}" fill="#64748b" font-size="9">${fmt(contrato.total, 0)} h</text>`;
    const pts = [];
    meses.forEach((m, i) => {
        const cx = left + slot * i + slot / 2, x = cx - bw / 2;
        const op = i === state.mes ? 1 : 0.45;
        const h1 = (m.hours.b1 / maxMes) * ch, h2 = (m.hours.b2 / maxMes) * ch;
        svg += `<g style="cursor:pointer" data-mes="${i}" opacity="${op}">
            <rect x="${x - 4}" y="${top}" width="${bw + 8}" height="${ch}" fill="transparent"/>
            <rect x="${x}" y="${top + ch - h1}" width="${bw}" height="${h1}" fill="#ba5cc8" rx="2"/>
            <rect x="${x}" y="${top + ch - h1 - h2}" width="${bw}" height="${h2}" fill="#5fb3c9" rx="2"/>
            <title>${esc(m.label)}: ${fmt(m.hours.total)} h (B1 ${fmt(m.hours.b1)} · B2 ${fmt(m.hours.b2)}) · acumulado ${fmt(m.cum.total)} h</title></g>`;
        if (i === state.mes && m.hours.total) svg += `<text x="${cx}" y="${y(m.hours.total) - 4}" fill="#e2e8f0" font-size="10" text-anchor="middle" font-weight="700">${fmt(m.hours.total, 0)}</text>`;
        svg += `<text x="${cx}" y="${H - 9}" fill="${i === state.mes ? '#e2e8f0' : '#64748b'}" font-size="9.5" text-anchor="middle">${esc(m.label.split(' ')[0])}</text>`;
        pts.push(`${cx},${yc(m.cum.total)}`);
    });
    svg += `<polyline points="${pts.join(' ')}" fill="none" stroke="#cbd5e1" stroke-width="1.5"/>`;
    meses.forEach((m, i) => {
        const cx = left + slot * i + slot / 2;
        svg += `<circle cx="${cx}" cy="${yc(m.cum.total)}" r="${i === state.mes ? 3.5 : 2}" fill="#cbd5e1"/>`;
    });
    svg += `</svg>`;
    const cont = document.getElementById('hours-chart');
    cont.innerHTML = svg;
    cont.querySelectorAll('[data-mes]').forEach(g => g.addEventListener('click', () => irAMes(Number(g.dataset.mes))));
}

// ---------- etiquetas de actividades ----------
function renderEtiquetas() {
    const cont = document.getElementById('expected-labels');
    cont.innerHTML = '';
    cont.style.paddingTop = '0px';
    const off = document.getElementById('matrix-container').getBoundingClientRect().top - cont.getBoundingClientRect().top;
    cont.style.paddingTop = `${Math.max(0, off + 8)}px`;
    const prog = meses[state.mes].itemProgress || D.itemProgress || [];
    const hrs = horasPorItem();
    D.expectedItems.forEach((item, index) => {
        const { id, level } = itemInfo[index];
        const div = el('div', `grid-row-label text-xs font-medium transition-all cursor-pointer level-${level}`);
        div.style.paddingRight = `${(level - 1) * 20}px`;
        if (!visible(index)) div.style.display = 'none';
        const tieneHijos = itemInfo.some(x => x.id.startsWith(id + '.'));
        const icon = tieneHijos ? `<span class="ml-2 opacity-40 text-[9px] font-bold">${state.expandidos.has(id) ? '⊖' : (level === 1 ? '⊕' : '○')}</span>` : '';
        const p = prog[index] !== undefined ? `<span class="ml-2 text-[10px] font-mono text-slate-500 w-8 shrink-0 text-right">${prog[index]}%</span>` : '';
        const h = hrs && hrs[index][1] > 0 ? `<span class="ml-2 text-[10px] font-mono shrink-0 text-right" style="color:var(--accent2)" title="Horas del hito en el mes / acumuladas">${fmt(hrs[index][0], 0)}/${fmt(hrs[index][1], 0)} h</span>` : '';
        div.innerHTML = `<span class="${level === 1 ? 'text-purple-500 font-bold' : 'text-slate-400'}">${esc(item)}</span> ${p} ${icon}`;
        div.setAttribute('data-id', id);
        div.onclick = () => toggleLevel(id);
        cont.appendChild(div);
    });
}

function toggleLevel(id) {
    if (!itemInfo.some(x => x.id.startsWith(id + '.'))) return;
    if (state.expandidos.has(id)) {
        [...state.expandidos].forEach(e => { if (e === id || e.startsWith(id + '.')) state.expandidos.delete(e); });
    } else {
        state.expandidos.add(id);
    }
    renderEtiquetas();
    renderMatriz();
}

// ---------- barras y matriz ----------
function columnasConDivisor(fn) {
    grupos.forEach((g, gi) => {
        if (gi > 0) fn(null, gi);
        g.ids.forEach(id => fn(id, gi));
    });
}

function renderBarras() {
    const heads = document.getElementById('group-headers');
    heads.innerHTML = '';
    grupos.forEach((g, gi) => {
        if (gi > 0) heads.appendChild(el('div', 'group-divider opacity-0'));
        const h = el('div', 'text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-700 pb-1 text-center shrink-0', esc(g.name));
        h.style.width = `${g.ids.length * COL_W + (g.ids.length - 1) * GAP}px`;
        heads.appendChild(h);
    });
    const bars = document.getElementById('bars-container');
    bars.innerHTML = '';
    columnasConDivisor((id) => {
        if (!id) { bars.appendChild(el('div', 'group-divider')); return; }
        const d = datosHito(id);
        const wrap = el('div', `flex flex-col items-center justify-end h-full w-[40px] shrink-0 ${state.hito === id ? 'col-selected' : ''}`);
        const percent = el('span', 'text-[11px] text-white font-bold mb-1', `${d.completion}%`);
        const bar = el('div', `bar ${state.hito === id ? 'ring-2 ring-purple-400' : ''}`);
        bar.title = `${hitoPorId[id].name} · ${d.completion}% · ${fmt(d.hours)} h en el mes · ${fmt(d.cumHours)} h acumuladas`;
        bar.onclick = () => selectMilestone(id);
        const fill = el('div', 'bar-fill');
        fill.style.height = `${d.completion}%`;
        bar.appendChild(fill);
        wrap.appendChild(percent);
        wrap.appendChild(bar);
        wrap.appendChild(el('span', 'milestone-id-label', id));
        wrap.appendChild(el('span', 'text-[10px] font-mono mt-0.5', `<span style="color:var(--accent2)">${fmt(d.hours, 0)} h</span>`));
        bars.appendChild(wrap);
    });
}

function renderMatriz() {
    const cont = document.getElementById('matrix-container');
    cont.innerHTML = '';
    const hrs = horasPorItem();
    columnasConDivisor((id) => {
        if (!id) { cont.appendChild(el('div', 'group-divider')); return; }
        const d = datosHito(id);
        const col = el('div', `flex flex-col relative w-[40px] shrink-0 ${state.hito === id ? 'col-selected' : ''}`);
        d.signature.forEach((v, sIdx) => {
            const row = el('div', 'grid-row-dot');
            if (!visible(sIdx)) row.style.display = 'none';
            const circle = el('div', `upset-matrix-circle ${STATE_CLASS[v] || ''}`);
            if (state.hito === id && hrs && hrs[sIdx][1] > 0) circle.classList.add('has-hours');
            if (STATE_NAME[v]) circle.title = `${id} · ${STATE_NAME[v]}`;
            row.appendChild(circle);
            col.appendChild(row);
        });
        cont.appendChild(col);
    });
}

// ---------- caja inferior ----------
function selectMilestone(id) {
    state.hito = state.hito === id ? null : id;
    render();
}

// trabajo realizado que no está (o no completo) en las horas reportadas: se muestra como evidencia
function trabajoSinHoras(filtro) {
    const lista = (D.extraWork || []).filter(filtro);
    if (!lista.length) return '';
    const fichas = lista.map(x => `<div class="border border-slate-700 rounded-lg p-3">
        <div class="flex justify-between gap-3"><p class="text-sm font-bold text-white">${esc(x.entregable)}</p><span class="text-[10px] uppercase text-slate-400 whitespace-nowrap">${esc(x.tipo)} · ${esc(x.fecha)}</span></div>
        <p class="text-xs mt-1" style="color:var(--accent2)">${esc(x.estado)}${x.hitos.length ? ' · ' + esc(x.hitos.join(', ')) : ''}</p>
        <p class="text-xs text-slate-400 mt-1 leading-relaxed">${esc(x.descripcion)}</p></div>`).join('');
    return `<h4 class="text-xs uppercase tracking-wider text-slate-400 mt-6 mb-1">Trabajo realizado sin horas registradas</h4>
        <p class="text-[11px] text-slate-500 mb-2">Evidencia de entregables; no suma ni modifica las horas reportadas.</p>
        <div class="space-y-2">${fichas}</div>`;
}

function renderResumenMes() {
    const m = meses[state.mes];
    const ficha = document.getElementById('ficha-tecnica');
    const filas = grupos.map(g => {
        const cab = `<tr><td colspan="5" class="text-[10px] uppercase tracking-wider text-slate-500 pt-4">${esc(g.name)}</td></tr>`;
        return cab + g.ids.map(id => {
            const d = datosHito(id);
            return `<tr class="cursor-pointer hover:bg-slate-800/60" data-hito="${id}">
                <td><span class="text-purple-400 font-bold mr-2">${id}</span>${esc(nombreCorto(id))}</td>
                <td class="text-right font-mono">${fmt(d.hours)}</td>
                <td class="text-right font-mono text-slate-400">${pct(d.hours, m.hours.total)} %</td>
                <td class="text-right font-mono">${fmt(d.cumHours)}</td>
                <td class="text-right font-mono">${d.completion} %</td></tr>`;
        }).join('');
    }).join('');
    const extra = trabajoSinHoras(x => x.mes === m.id);
    const aspectos = (m.highlights || []).map(a => `<li class="flex gap-3"><span class="text-purple-400">●</span><span>${esc(a)}</span></li>`).join('');
    ficha.innerHTML = `
        <div class="flex justify-between items-start mb-4 border-b border-purple-900/30 pb-4 gap-6">
            <div>
                <span class="text-xs font-bold bg-purple-900/50 text-purple-400 px-2 py-1 rounded tracking-widest mb-2 inline-block uppercase">Resumen del mes</span>
                <h3 class="text-2xl font-bold text-white tracking-wide">${esc(m.label)}</h3>
            </div>
            <div class="text-right text-sm font-mono text-slate-400">
                <p>${fmt(m.hours.total)} h en el mes · ${fmt(m.cum.total)} h acumuladas</p>
                <p class="mt-1">Avance EDT: ${m.edt} %</p>
            </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <h4 class="text-xs uppercase tracking-wider text-slate-400 mb-3">Aspectos más relevantes</h4>
                <ul class="space-y-3 text-slate-300 leading-relaxed">${aspectos || '<li class="text-slate-500">Sin resumen registrado para este mes.</li>'}</ul>
                ${extra}
            </div>
            <div>
                <h4 class="text-xs uppercase tracking-wider text-slate-400 mb-1">Horas por hito</h4>
                <p class="text-[11px] text-slate-500 mb-1">Seleccione un hito para ver su ficha.</p>
                <table class="hours w-full text-sm text-slate-300">
                    <thead><tr class="text-[11px] uppercase text-slate-500"><th class="text-left">Hito</th><th class="text-right">Mes</th><th class="text-right">% mes</th><th class="text-right">Acum.</th><th class="text-right">Avance</th></tr></thead>
                    <tbody>${filas}</tbody>
                </table>
            </div>
        </div>`;
    ficha.querySelectorAll('[data-hito]').forEach(tr => tr.onclick = () => selectMilestone(tr.dataset.hito));
    const header = document.getElementById('hitos-header');
    header.innerHTML = 'Hitos';
    header.classList.remove('text-white');
}

function renderFicha() {
    const id = state.hito, h = hitoPorId[id], d = datosHito(id), m = meses[state.mes];
    const header = document.getElementById('hitos-header');
    header.innerHTML = `<span class="text-slate-500 font-normal">Hito Seleccionado:</span> ${esc(h.name)}`;
    header.classList.add('text-white');
    const partes = [];
    if (d.entendimiento !== null && d.entendimiento !== undefined) partes.push(`Entendimiento ${d.entendimiento}%`);
    if (d.construccion !== null && d.construccion !== undefined) partes.push(`Construcción y cierre ${d.construccion}%`);
    const detalle = d.details
        ? esc(d.details).replace(KEYWORDS, '<strong class="text-purple-400">$1</strong>')
        : `<span class="text-slate-500">El resumen de ${esc(m.label)} no trae un bloque específico para este hito.</span>`;
    const top = Object.entries(d.items || {})
        .map(([k, v]) => ({ i: Number(k), mes: v[0], acum: v[1] }))
        .filter(x => x.acum > 0)
        .sort((a, b) => b.mes - a.mes || b.acum - a.acum)
        .slice(0, 8);
    const filas = top.map(x => `<tr><td>${x.i >= 0 ? esc(D.expectedItems[x.i]) : 'Sin actividad asignada'}</td>
        <td class="text-right font-mono">${fmt(x.mes)}</td><td class="text-right font-mono">${fmt(x.acum)}</td>
        <td class="text-right font-mono text-slate-400">${pct(x.acum, d.cumHours)} %</td></tr>`).join('');
    const ficha = document.getElementById('ficha-tecnica');
    ficha.innerHTML = `
        <div class="flex justify-between items-start mb-4 border-b border-purple-900/30 pb-4 gap-6">
            <div>
                <span class="text-xs font-bold bg-purple-900/50 text-purple-400 px-2 py-1 rounded tracking-widest mb-2 inline-block uppercase">${esc(id)} · ${esc(m.label)}</span>
                <h3 class="text-2xl font-bold text-white tracking-wide">${esc(h.name)}</h3>
                <p class="text-sm text-purple-400 font-mono mt-2">Avance ${d.completion}%${partes.length ? '  ·  ' + partes.join('  ·  ') : ''}</p>
            </div>
            <div class="text-right">
                <p class="text-sm text-slate-400 font-mono">Fecha objetivo: ${esc(h.date)}</p>
                <p class="text-sm font-bold text-slate-300 mt-1 uppercase">Responsable: ${esc(h.responsable)}</p>
                <button id="volver-resumen" class="mt-3 text-xs text-purple-400 hover:text-purple-300 underline">Ver resumen del mes</button>
            </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div class="kpi"><p class="text-[11px] uppercase text-slate-400">Horas en el mes</p><p class="text-xl font-bold text-white">${fmt(d.hours)} h</p><p class="text-xs text-slate-400">${pct(d.hours, m.hours.total)} % del mes</p></div>
            <div class="kpi"><p class="text-[11px] uppercase text-slate-400">Horas acumuladas</p><p class="text-xl font-bold text-white">${fmt(d.cumHours)} h</p><p class="text-xs text-slate-400">${pct(d.cumHours, m.cum.total)} % del acumulado</p></div>
            <div class="kpi"><p class="text-[11px] uppercase text-slate-400">Avance del hito</p><p class="text-xl font-bold text-white">${d.completion} %</p><div class="meter"><span style="width:${d.completion}%;background:var(--accent)"></span></div></div>
            <div class="kpi"><p class="text-[11px] uppercase text-slate-400">Grupo</p><p class="text-sm font-bold text-white mt-1">${esc(h.group || '—')}</p></div>
        </div>
        <div class="text-slate-300 leading-relaxed text-lg font-light mb-6">${detalle}</div>
        ${filas ? `<h4 class="text-xs uppercase tracking-wider text-slate-400 mb-1">Participación por actividad de la EDT (horas)</h4>
        <table class="hours w-full text-sm text-slate-300"><thead><tr class="text-[11px] uppercase text-slate-500">
        <th class="text-left">Actividad</th><th class="text-right">Mes</th><th class="text-right">Acumulado</th><th class="text-right">% del hito</th></tr></thead>
        <tbody>${filas}</tbody></table>` : '<p class="text-sm text-slate-500">Este hito no tiene horas registradas hasta este mes.</p>'}
        ${trabajoSinHoras(x => x.hitos.includes(id) && x.mes <= m.id)}`;
    document.getElementById('volver-resumen').onclick = () => selectMilestone(id);
}

// ---------- render ----------
function render() {
    const m = meses[state.mes];
    document.getElementById('edt-avance').innerText = `${m.edt}%`;
    document.getElementById('edt-mes').innerText = `· ${m.label}`;
    const upd = document.getElementById('fecha-actualizacion');
    if (upd && D.meta && D.meta.updated) upd.innerText = `actualizado el ${D.meta.updated}`;
    renderMeses();
    renderKPIs();
    renderGrafico();
    renderBarras();
    renderEtiquetas();
    renderMatriz();
    if (state.hito) renderFicha(); else renderResumenMes();
}

document.getElementById('mes-anterior').onclick = () => irAMes(state.mes - 1);
document.getElementById('mes-siguiente').onclick = () => irAMes(state.mes + 1);
document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowLeft') irAMes(state.mes - 1);
    if (e.key === 'ArrowRight') irAMes(state.mes + 1);
});

render();
