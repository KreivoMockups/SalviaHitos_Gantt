"""
Actualiza registry.js con los cambios hechos en Datos_Malla_SALVIA.xlsx, sin regenerar las horas.

Toma de la malla:
  Plan (Avance_%)          -> itemProgress, EDT y % de cada hito (total, entendimiento, construcción)
  Actas (Resumen, Resp.)   -> details y responsable de cada hito
  Meses (Nota)             -> nota del mes
  Tareas_Pendientes        -> tareas del plan de cierre

Uso:  python actualizar_desde_malla.py
Si la malla tiene fórmulas sin calcular, ábrela y guárdala en Excel antes de correrlo.
Valida el JSON antes de escribir: si algo falla, registry.js no se toca.
"""
import json
import sys
from datetime import date
import openpyxl

ARCHIVO_EXCEL = 'Datos_Malla_SALVIA.xlsx'
ARCHIVO_REGISTRY = 'registry.js'
MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
         'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']


def prom(valores):
    return sum(valores) / len(valores) if valores else None


def main():
    wb = openpyxl.load_workbook(ARCHIVO_EXCEL, data_only=True)

    # ---- Plan
    plan = [r for r in wb['Plan'].iter_rows(min_row=2, values_only=True) if r[0]]
    if any(r[4] is None for r in plan if r[3] in (1, 2)):
        sys.exit('La hoja Plan tiene fórmulas sin calcular. Abre la malla en Excel, guárdala y vuelve a correr.')
    avance = [float(r[4] or 0) * 100 for r in plan]
    nivel = [r[3] for r in plan]
    fase = [str(r[9] or '') for r in plan]
    nivel3 = [a for a, n in zip(avance, nivel) if n == 3]
    edt = round(sum(nivel3) / len(nivel3))

    texto = open(ARCHIVO_REGISTRY, encoding='utf-8').read()
    cabecera, cuerpo = texto.split('=', 1)
    try:
        datos = json.loads(cuerpo.strip().rstrip(';'))
    except json.JSONDecodeError as e:
        sys.exit(f"registry.js está dañado o incompleto ({len(texto)/1024:,.0f} KB, error en el carácter {e.pos:,}). "
                 "Reemplázalo por la última versión completa (unos 145 KB, del repo o del último envío) "
                 "y vuelve a correr. No edites registry.js a mano: los cambios van en la malla.")

    if len(datos['expectedItems']) != len(plan):
        sys.exit(f"La hoja Plan tiene {len(plan)} filas y el registry {len(datos['expectedItems'])}. "
                 "Si agregaste o quitaste actividades hay que regenerar con el generador completo.")

    item_progress = [round(a) for a in avance]
    datos['itemProgress'] = item_progress
    datos['meta']['edt'] = edt
    hoy = date.today()
    datos['meta']['updated'] = f"{hoy.day:02d}/{MESES[hoy.month - 1]}/{hoy.year}"
    ultimo = datos['months'][-1]
    ultimo['itemProgress'] = item_progress
    ultimo['edt'] = edt
    mes = ultimo['id']

    # ---- Actas
    hoja = wb['Actas']
    enc = [c.value for c in hoja[1]]
    actas = {r[0]: dict(zip(enc, r)) for r in hoja.iter_rows(min_row=2, values_only=True) if r[0]}

    for m in datos['milestones']:
        idx = [i for i, s in enumerate(m['signature']) if s and nivel[i] == 3]
        total = prom([avance[i] for i in idx])
        ent = prom([avance[i] for i in idx if fase[i] == 'Entendimiento'])
        con = prom([avance[i] for i in idx if fase[i].startswith('Construcci')])
        m['completion'] = round(total or 0)
        bm = m['byMonth'][mes]
        bm['completion'] = m['completion']
        bm['entendimiento'] = round(ent) if ent is not None else None
        bm['construccion'] = round(con) if con is not None else None
        a = actas.get(m['id'])
        if a:
            if a.get('Responsable'):
                m['responsable'] = str(a['Responsable'])
            if a.get('Resumen_Acta (Ficha Técnica)'):
                m['details'] = bm['details'] = str(a['Resumen_Acta (Ficha Técnica)'])

    # ---- Meses (nota)
    for r in wb['Meses'].iter_rows(min_row=2, values_only=True):
        for mm in datos['months']:
            if r[0] is not None and str(r[0])[:7] == mm['id'] and r[5] is not None:
                mm['nota'] = str(r[5])

    # ---- Tareas pendientes del plan de cierre
    tareas = []
    for r in wb['Tareas_Pendientes'].iter_rows(min_row=2, values_only=True):
        if not r[1]:
            continue
        tareas.append({'owner': str(r[0] or 'Por asignar'), 'task': str(r[1]), 'line': str(r[2] or ''),
                       'source': str(r[3] or ''), 'hito': str(r[4] or ''),
                       'from': int(r[5] or 1), 'to': int(r[6] or r[5] or 1), 'status': str(r[7] or 'Pendiente')})
    if tareas and 'closure' in datos:
        datos['closure']['tasks'] = tareas

    salida = 'const DASHBOARD_DATA = ' + json.dumps(datos, ensure_ascii=False, separators=(',', ':')) + ';\n'
    json.loads(salida[salida.index('=') + 1:].strip().rstrip(';'))  # validación
    pre = cabecera.split('\n')[0] + '\n' if texto.startswith('/*') else ''
    with open(ARCHIVO_REGISTRY, 'w', encoding='utf-8') as f:
        f.write(pre + salida)
    print(f"registry.js actualizado: EDT {edt} %, {len(datos['milestones'])} hitos, {len(tareas)} tareas, {len(salida)/1024:,.0f} KB.")


if __name__ == '__main__':
    main()
