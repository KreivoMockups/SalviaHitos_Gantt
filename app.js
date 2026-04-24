/* app.js corregido */

function getInfo(text) {
    const match = text.match(/^(\d+(\.\d+)*)/);
    const id = match ? match[1] : "";
    const level = id ? id.split('.').length : 1;
    return { id, level };
}

function renderDashboard() {
    const expectedLabels = document.getElementById('expected-labels');
    const barsContainer = document.getElementById('bars-container');
    const matrixContainer = document.getElementById('matrix-container');

    DASHBOARD_DATA.expectedItems.forEach((item, index) => {
        const { id, level } = getInfo(item);
        const div = document.createElement('div');
        div.className = `grid-row-label text-xs font-medium transition-all cursor-pointer row-idx-${index} level-${level}`;
        div.style.paddingRight = `${(level - 1) * 20}px`;
        div.style.height = "40px";
        
        const icon = level < 3 ? `<span class="ml-2 opacity-40 text-[9px] font-bold">${level === 1 ? '⊕' : '○'}</span>` : '';
        div.innerHTML = `<span class="${level === 1 ? 'text-purple-500 font-bold' : 'text-slate-400'}">${item}</span> ${icon}`;
        
        div.onclick = () => toggleLevel(id, level);
        div.setAttribute('data-id', id);
        if (level > 1) div.style.display = "none";
        expectedLabels.appendChild(div);
    });

    DASHBOARD_DATA.milestones.forEach((milestone, mIdx) => {
        const barContainerWrap = document.createElement('div');
        barContainerWrap.className = "flex flex-col items-center justify-end h-full w-[40px] shrink-0";
        const bar = document.createElement('div');
        bar.className = "bar w-full h-[60px]";
        bar.id = `bar-${mIdx}`;
        bar.onclick = () => selectMilestone(mIdx);
        const fill = document.createElement('div');
        fill.className = "bar-fill";
        setTimeout(() => { fill.style.height = `${milestone.completion}%`; }, 100);
        bar.appendChild(fill);
        
        const label = document.createElement('span');
        label.className = "milestone-id-label";
        label.innerText = milestone.id;
        const percent = document.createElement('span');
        percent.className = "text-[11px] text-white font-bold mb-1";
        percent.innerText = `${milestone.completion}%`;

        barContainerWrap.appendChild(percent);
        barContainerWrap.appendChild(bar);
        barContainerWrap.appendChild(label);
        barsContainer.appendChild(barContainerWrap);

        const col = document.createElement('div');
        col.className = "flex flex-col relative w-[40px] shrink-0";
        milestone.signature.forEach((active, sIdx) => {
            const rowWrap = document.createElement('div');
            rowWrap.className = `grid-row-dot dot-row-idx-${sIdx}`;
            rowWrap.style.height = "40px";
            const { level } = getInfo(DASHBOARD_DATA.expectedItems[sIdx]);
            if (level > 1) rowWrap.style.display = "none";
            const circle = document.createElement('div');
            circle.className = `upset-matrix-circle ${active ? 'active' : ''}`;
            rowWrap.appendChild(circle);
            col.appendChild(rowWrap);
        });
        matrixContainer.appendChild(col);
    });
}

function toggleLevel(parentId, parentLevel) {
    const labels = [...document.querySelectorAll('.grid-row-label')];
    // Buscamos si el nivel inmediatamente inferior está visible para determinar si colapsamos o expandimos
    const firstChild = labels.find(l => {
        const cid = l.getAttribute('data-id');
        return cid.startsWith(parentId + ".") && getInfo(cid).level === parentLevel + 1;
    });

    const isExpanding = firstChild && firstChild.style.display === "none";

    labels.forEach((label, idx) => {
        const currentId = label.getAttribute('data-id');
        // Caso 1: Expandir solo el nivel siguiente
        if (isExpanding) {
            if (currentId.startsWith(parentId + ".") && getInfo(currentId).level === parentLevel + 1) {
                label.style.display = "flex";
                document.querySelectorAll(`.dot-row-idx-${idx}`).forEach(d => d.style.display = "flex");
            }
        } 
        // Caso 2: Colapsar TODOS los descendientes recursivamente
        else {
            if (currentId.startsWith(parentId + ".")) {
                label.style.display = "none";
                document.querySelectorAll(`.dot-row-idx-${idx}`).forEach(d => d.style.display = "none");
            }
        }
    });
}

function selectMilestone(idx) {
    const milestone = DASHBOARD_DATA.milestones[idx];
    const header = document.getElementById('hitos-header');
    header.innerHTML = `<span class="text-slate-500 font-normal">Hito Seleccionado:</span> ${milestone.name}`;
    header.classList.add('text-white');

    document.querySelectorAll('.bar').forEach(b => b.classList.remove('active', 'ring-2', 'ring-purple-400'));
    document.getElementById(`bar-${idx}`).classList.add('active', 'ring-2', 'ring-purple-400');
    
    const ficha = document.getElementById('ficha-tecnica');
    ficha.classList.remove('opacity-40');
    
    document.getElementById('ficha-id').innerText = milestone.id;
    document.getElementById('ficha-title').innerText = milestone.name;
    document.getElementById('ficha-date').innerText = `Corte: ${milestone.date}`;
    document.getElementById('ficha-resp').innerText = `Responsable: ${milestone.responsable}`;
    
    // CORRECCIÓN: Usamos text-purple-400 para el Oro
    const formattedDetails = milestone.details.replace(/(Arquitectura:|Riesgo:|Estrategia:|MVP:|Macro:|Cambio Estratégico:|Avatar:|Plan B:)/g, '<strong class="text-purple-400">$1</strong>');
    document.getElementById('ficha-details').innerHTML = formattedDetails;
}

renderDashboard();