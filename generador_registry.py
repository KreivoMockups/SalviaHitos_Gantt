"""
Genera registry.js para el tablero de hitos SALVIA.

Lee dos libros:
  - Datos_Malla_SALVIA.xlsx: EDT (Plan), pertenencia de actividades a hitos, avance mensual,
    fichas por mes, meses, tareas y reglas de reparto de horas.
  - Progreso_Horas_Salvia.xlsx (opcional): hoja TimeLogs con las horas registradas.
    Si no está, el tablero se genera sin horas por hito (solo con las horas por mes de la hoja Meses).

Uso:  python generador_registry.py
"""
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from datetime import date, datetime, timedelta

import pandas as pd

# ==========================================
# CONFIGURACIÓN
# ==========================================
ARCHIVO_EXCEL = 'Datos_Malla_SALVIA.xlsx'
ARCHIVO_HORAS = 'Progreso_Horas_Salvia.xlsx'
HOJA_HORAS = 'TimeLogs'
ARCHIVO_SALIDA = 'registry.js'

MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
         'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']


def fecha_actualizacion():
    hoy = date.today()
    return f"{hoy.day}/{MESES[hoy.month - 1]}/{hoy.year}"


def texto(valor):
    if valor is None or (isinstance(valor, float) and pd.isna(valor)):
        return ""
    return str(valor).strip()


def numero(valor, defecto=0.0):
    v = pd.to_numeric(valor, errors='coerce')
    return defecto if pd.isna(v) else float(v)


def nivel(item_id):
    return item_id.count('.') + 1


# ==========================================
# LECTURA DE TIMELOGS SIN DEPENDER DE LOS ESTILOS DEL LIBRO
# (el libro de horas trae estilos que openpyxl no acepta; se lee el XML directamente)
# ==========================================
NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}


def _col_index(ref):
    letras = re.match(r'([A-Z]+)', ref).group(1)
    n = 0
    for ch in letras:
        n = n * 26 + (ord(ch) - 64)
    return n - 1


def leer_hoja_xlsx(ruta, nombre_hoja):
    with zipfile.ZipFile(ruta) as z:
        compartidas = []
        if 'xl/sharedStrings.xml' in z.namelist():
            raiz = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for si in raiz.findall('m:si', NS):
                compartidas.append(''.join(t.text or '' for t in si.iter('{%s}t' % NS['m'])))
        libro = ET.fromstring(z.read('xl/workbook.xml'))
        rels = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
        destino = {r.get('Id'): r.get('Target') for r in rels}
        ruta_hoja = None
        for hoja in libro.find('m:sheets', NS):
            if hoja.get('name') == nombre_hoja:
                objetivo = destino[hoja.get('{%s}id' % NS['r'])]
                ruta_hoja = objetivo.lstrip('/') if objetivo.startswith('/') else 'xl/' + objetivo
        if ruta_hoja is None:
            raise ValueError(f"No existe la hoja '{nombre_hoja}' en {ruta}")
        raiz = ET.fromstring(z.read(ruta_hoja))
    filas = []
    for fila in raiz.iter('{%s}row' % NS['m']):
        valores = {}
        for celda in fila.findall('m:c', NS):
            tipo = celda.get('t')
            v = celda.find('m:v', NS)
            if tipo == 's' and v is not None:
                valor = compartidas[int(v.text)]
            elif tipo == 'inlineStr':
                valor = ''.join(t.text or '' for t in celda.iter('{%s}t' % NS['m']))
            elif v is not None:
                valor = v.text
                try:
                    valor = float(valor)
                except (TypeError, ValueError):
                    pass
            else:
                valor = None
            valores[_col_index(celda.get('r'))] = valor
        if valores:
            filas.append([valores.get(i) for i in range(max(valores) + 1)])
    encabezado = [texto(c) for c in filas[0]]
    datos = [f + [None] * (len(encabezado) - len(f)) for f in filas[1:]]
    return pd.DataFrame([f[:len(encabezado)] for f in datos], columns=encabezado)


def leer_timelogs(ruta):
    df = leer_hoja_xlsx(ruta, HOJA_HORAS)
    df['Horas'] = pd.to_numeric(df['Hours'], errors='coerce')
    df['Mes_num'] = pd.to_numeric(df['Month'], errors='coerce')
    df = df[df['Horas'].notna() & df['Mes_num'].notna()].copy()
    fechas = pd.to_numeric(df['Date'], errors='coerce')
    df['Fecha'] = [datetime(1899, 12, 30) + timedelta(days=f) if pd.notna(f) else None for f in fechas]
    anio = [f.year if f else 2026 for f in df['Fecha']]
    df['Mes'] = [f"{a}-{int(m):02d}" for a, m in zip(anio, df['Mes_num'])]
    for c in ('Task ID', 'BOLSA', 'MODULO', 'MODULO_SALVIA', 'Work Description'):
        df[c] = df[c].map(texto)
    df['Categoria'] = df['MODULO'].str.extract(r'Categor[ií]a\s*(\d+)')[0].fillna('')
    df['Modulo_cod'] = df['MODULO_SALVIA'].str.split().str[0].fillna('')
    return df


# ==========================================
# REPARTO DE CADA REGISTRO DE HORAS A UN HITO (hoja Reglas_Hito)
# ==========================================
def asignar_hito(reg, reglas):
    for _, r in reglas.iterrows():
        campo, valor, hito = r['Campo'], texto(r['Valor']), texto(r['Hito'])
        if campo == 'Categoria' and reg['Categoria'] == valor:
            return hito
        if campo == 'Tarea' and reg['Task ID'] in [v.strip() for v in valor.split(',')]:
            return hito
        if campo == 'Palabra_clave' and re.search(valor, reg['Work Description'], re.I):
            return hito
        if campo == 'Modulo_SALVIA':
            cod = reg['Modulo_cod']
            if cod == valor or (valor.endswith('.') and cod.startswith(valor)):
                return hito
        if campo == 'Defecto':
            return hito
    return ''


def generar_registry():
    print("Iniciando conversión de Excel a JavaScript...")
    xl = pd.ExcelFile(ARCHIVO_EXCEL)
    df_plan = xl.parse('Plan')
    df_pert = xl.parse('Pertenencia')
    df_actas = xl.parse('Actas')
    hojas = set(xl.sheet_names)

    ids = df_plan['ID'].astype(str).tolist()
    items = (df_plan['ID'].astype(str) + " " + df_plan['Actividad'].astype(str)).tolist()
    hitos = [c for c in df_pert.columns if c != 'ID']
    pert = {h: df_pert[h].fillna(0).astype(int).tolist() for h in hitos}
    fase = df_plan['Fase'].map(texto).tolist() if 'Fase' in df_plan.columns else [''] * len(ids)
    hojas_edt = [i for i, x in enumerate(ids) if nivel(x) == 3]

    # ---------- meses ----------
    if 'Meses' in hojas:
        df_meses = xl.parse('Meses')
        meses = [texto(m) for m in df_meses['Mes']]
    else:
        df_meses, meses = None, ['actual']

    # ---------- avance por actividad y mes ----------
    avance = {}
    if 'Avance_Mensual' in hojas:
        df_av = xl.parse('Avance_Mensual')
        df_av['ID'] = df_av['ID'].astype(str)
        for m in meses:
            col = m if m in df_av.columns else None
            serie = dict(zip(df_av['ID'], pd.to_numeric(df_av[col], errors='coerce').fillna(0))) if col else {}
            avance[m] = serie
    actual = dict(zip(ids, pd.to_numeric(df_plan.get('Avance_%', 0), errors='coerce').fillna(0)))
    if not avance:
        avance = {meses[-1]: actual}

    def avance_items(m):
        hoja = avance.get(m, {})
        val = [float(hoja.get(x, actual.get(x, 0))) for x in ids]
        # filas de primer y segundo nivel: promedio de sus actividades de tercer nivel
        for i, x in enumerate(ids):
            if nivel(x) < 3:
                hijos = [val[j] for j in hojas_edt if ids[j].startswith(x + '.')]
                val[i] = sum(hijos) / len(hijos) if hijos else 0
        return val

    def estado(p):
        return 3 if p >= 0.995 else (2 if p > 0 else 1)

    # ---------- horas ----------
    horas_por_mes = {m: {'b1': 0.0, 'b2': 0.0} for m in meses}
    if df_meses is not None:
        for _, r in df_meses.iterrows():
            horas_por_mes[texto(r['Mes'])] = {'b1': numero(r.get('Horas_B1')), 'b2': numero(r.get('Horas_B2'))}
    horas_hito = {h: {m: 0.0 for m in meses} for h in hitos}
    horas_item_hito = {h: {m: {} for m in meses} for h in hitos}
    # misma distribución separada por bolsa: [Bolsa 1 · SALVIA, Bolsa 2 · MASP]
    bolsa_item_hito = {h: {m: {} for m in meses} for h in hitos}
    horas_fuente = "hoja Meses"
    try:
        logs = leer_timelogs(ARCHIVO_HORAS)
        # Horas aún no cargadas en TimeLogs (p. ej. octubre desde el reporte de sprints): hoja Horas_Jira
        if 'Horas_Jira' in hojas:
            extra = xl.parse('Horas_Jira')
            extra = extra[pd.to_numeric(extra['Hours'], errors='coerce').notna()].copy()
            if len(extra):
                extra['Horas'] = pd.to_numeric(extra['Hours'])
                extra['Fecha'] = pd.to_datetime(extra['Date']).dt.to_pydatetime()
                extra['Mes'] = [f"{f.year}-{int(m):02d}" for f, m in zip(extra['Fecha'], extra['Month'])]
                for c in ('Task ID', 'BOLSA', 'MODULO', 'MODULO_SALVIA', 'Work Description'):
                    extra[c] = extra[c].map(texto)
                extra['Categoria'] = extra['MODULO'].str.extract(r'Categor[ií]a\s*(\d+)')[0].fillna('')
                extra['Modulo_cod'] = extra['MODULO_SALVIA'].str.split().str[0].fillna('')
                ya = set(logs['Mes'])
                solapa = sorted(set(extra['Mes']) & ya)
                if solapa:
                    print(f"Aviso: TimeLogs ya tiene horas de {', '.join(solapa)}; se ignoran esas filas de Horas_Jira para no contarlas dos veces.")
                    extra = extra[~extra['Mes'].isin(solapa)]
                cols = ['Task ID', 'BOLSA', 'MODULO', 'MODULO_SALVIA', 'Work Description', 'Horas', 'Fecha', 'Mes', 'Categoria', 'Modulo_cod']
                logs = pd.concat([logs.loc[:, ~logs.columns.duplicated()][cols], extra[cols]], ignore_index=True)
                print(f"Horas_Jira: {extra['Horas'].sum():,.1f} h agregadas ({', '.join(sorted(set(extra['Mes'])))}).")
        reglas = xl.parse('Reglas_Hito').sort_values('Prioridad')
        tareas = xl.parse('Tareas')
        tarea_item = {texto(r['Task ID']): texto(r['Item_EDT']) for _, r in tareas.iterrows()}
        idx = {x: i for i, x in enumerate(ids)}
        logs['Hito'] = [asignar_hito(r, reglas) for _, r in logs.iterrows()]
        logs = logs[logs['Mes'].isin(meses)]
        for m in meses:
            del_mes = logs[logs['Mes'] == m]
            if len(del_mes):
                horas_por_mes[m] = {
                    'b1': float(del_mes.loc[del_mes['BOLSA'].str.contains('1'), 'Horas'].sum()),
                    'b2': float(del_mes.loc[del_mes['BOLSA'].str.contains('2'), 'Horas'].sum())}
        for _, r in logs.iterrows():
            h, m = r['Hito'], r['Mes']
            if h not in horas_hito:
                continue
            horas_hito[h][m] += r['Horas']
            i = idx.get(tarea_item.get(r['Task ID'], ''), -1)
            horas_item_hito[h][m][i] = horas_item_hito[h][m].get(i, 0) + r['Horas']
            par = bolsa_item_hito[h][m].setdefault(i, [0.0, 0.0])
            par[0 if '1' in r['BOLSA'] else 1] += r['Horas']
        sin_hito = logs[~logs['Hito'].isin(hitos)]['Horas'].sum()
        if sin_hito:
            print(f"Aviso: {sin_hito} horas no quedaron asignadas a ningún hito. Revisa la hoja Reglas_Hito.")
        horas_fuente = f"{ARCHIVO_HORAS} (hoja {HOJA_HORAS})"
    except FileNotFoundError:
        print(f"Aviso: no se encontró {ARCHIVO_HORAS}; se usan solo las horas por mes de la hoja Meses.")

    # ---------- contrato ----------
    contrato = {'b1': 3744, 'b2': 1652}
    if 'Contrato' in hojas:
        for _, r in xl.parse('Contrato').iterrows():
            clave = 'b1' if '1' in texto(r['Bolsa']) else 'b2'
            contrato[clave] = numero(r['Horas'])
    contrato['total'] = contrato['b1'] + contrato['b2']

    # ---------- meses: KPIs y aspectos relevantes ----------
    meses_out, acum = [], {'b1': 0.0, 'b2': 0.0}
    avances_mes = {m: avance_items(m) for m in meses}
    for k, m in enumerate(meses):
        hm = horas_por_mes.get(m, {'b1': 0, 'b2': 0})
        acum = {b: acum[b] + hm[b] for b in acum}
        fila = df_meses.iloc[k] if df_meses is not None else {}
        aspectos = [a.strip(' -•\t') for a in texto(fila.get('Aspectos_relevantes', '')).split('\n') if a.strip(' -•\t')]
        av = avances_mes[m]
        meses_out.append({
            "id": m,
            "label": texto(fila.get('Etiqueta', m)) or m,
            "nota": texto(fila.get('Nota', '')),
            "hours": {"b1": round(hm['b1'], 1), "b2": round(hm['b2'], 1), "total": round(hm['b1'] + hm['b2'], 1)},
            "cum": {"b1": round(acum['b1'], 1), "b2": round(acum['b2'], 1), "total": round(acum['b1'] + acum['b2'], 1)},
            "edt": int(round(sum(av[i] for i in hojas_edt) / len(hojas_edt) * 100)),
            "highlights": aspectos,
            "itemProgress": [int(round(p * 100)) for p in av],
        })

    # ---------- fichas por mes ----------
    fichas = {}
    if 'Fichas_Mes' in hojas:
        for _, r in xl.parse('Fichas_Mes').iterrows():
            fichas[(texto(r['Mes']), texto(r['ID_Hito']))] = texto(r['Resumen'])

    # ---------- riesgos críticos de QA abiertos al corte de cada mes (hoja Riesgos_QA) ----------
    df_riesgos = None
    if 'Riesgos_QA' in hojas:
        df_riesgos = xl.parse('Riesgos_QA')
        df_riesgos['Fecha_deteccion'] = pd.to_datetime(df_riesgos['Fecha_deteccion'], errors='coerce')
        df_riesgos['Fecha_cierre'] = pd.to_datetime(df_riesgos['Fecha_cierre'], errors='coerce')
        df_riesgos = df_riesgos[df_riesgos['Critico'].map(texto).str.lower().str.startswith('s')]
    hoy = pd.Timestamp(datetime.now().date())

    def corte_mes(m):
        fin = pd.Timestamp(m + '-01') + pd.offsets.MonthEnd(0)
        return min(fin, hoy)

    def riesgos_abiertos(h, m):
        if df_riesgos is None:
            return None
        c = corte_mes(m)
        r = df_riesgos[(df_riesgos['Hito'].map(texto) == h) & (df_riesgos['Fecha_deteccion'] <= c) &
                       (df_riesgos['Fecha_cierre'].isna() | (df_riesgos['Fecha_cierre'] > c))]
        if r.empty:
            return None
        return {"open": int(len(r)), "corte": str(c.date()),
                "bySeverity": {k: int(v) for k, v in r['Severidad'].map(texto).value_counts().items()},
                "byModule": {k: int(v) for k, v in r['Modulo'].map(texto).value_counts().items()}}

    # ---------- hitos ----------
    milestones = []
    for h in hitos:
        acta = df_actas[df_actas['ID_Hito'] == h]
        a = acta.iloc[0] if not acta.empty else {}
        fecha = a.get('Fecha_Ejecucion') if len(acta) else None
        fecha = str(pd.Timestamp(fecha).date()) if fecha is not None and pd.notnull(fecha) else "Sin fecha"
        miembros = [i for i in hojas_edt if pert[h][i] == 1]
        por_mes, acum_h, acum_items, acum_bolsa = {}, 0.0, {}, {}
        for m in meses:
            av = avances_mes[m]
            def prom(sel):
                return int(round(sum(av[i] for i in sel) / len(sel) * 100)) if sel else None
            acum_h += horas_hito[h][m]
            for i, v in horas_item_hito[h][m].items():
                acum_items[i] = acum_items.get(i, 0) + v
            for i, (b1, b2) in bolsa_item_hito[h][m].items():
                ab = acum_bolsa.setdefault(i, [0.0, 0.0])
                ab[0] += b1; ab[1] += b2
            detalle = fichas.get((m, h), '')
            if not detalle and m == meses[-1]:
                detalle = texto(a.get('Resumen_Acta (Ficha Técnica)', '')) if len(acta) else ''
            por_mes[m] = {
                "completion": prom(miembros) or 0,
                "entendimiento": prom([i for i in miembros if fase[i] == 'Entendimiento']),
                "construccion": prom([i for i in miembros if fase[i] != 'Entendimiento']),
                "signature": [estado(av[i]) if pert[h][i] == 1 else 0 for i in range(len(ids))],
                "hours": round(horas_hito[h][m], 1),
                "cumHours": round(acum_h, 1),
                # [horas del mes, acumuladas, acumuladas Bolsa 1, acumuladas Bolsa 2, mes Bolsa 1, mes Bolsa 2]
                "items": {str(i): [round(horas_item_hito[h][m].get(i, 0), 1), round(acum_items[i], 1),
                                   round(acum_bolsa.get(i, [0, 0])[0], 1), round(acum_bolsa.get(i, [0, 0])[1], 1),
                                   round(bolsa_item_hito[h][m].get(i, [0, 0])[0], 1),
                                   round(bolsa_item_hito[h][m].get(i, [0, 0])[1], 1)]
                          for i in acum_items},
                "risks": riesgos_abiertos(h, m),
                "details": detalle,
            }
        ultimo = por_mes[meses[-1]]
        milestones.append({
            "id": str(h),
            "name": texto(a.get('Nombre_Hito', h)) if len(acta) else h,
            "group": texto(a.get('Grupo', '')) if len(acta) else '',
            "date": fecha,
            "responsable": texto(a.get('Responsable', 'Por definir')) if len(acta) else 'Por definir',
            # campos del mes más reciente, por compatibilidad con la versión anterior
            "completion": ultimo["completion"], "signature": ultimo["signature"], "details": ultimo["details"],
            "byMonth": por_mes,
        })

    grupos = []
    for g in dict.fromkeys(m["group"] for m in milestones):
        grupos.append({"name": g or "Hitos", "ids": [m["id"] for m in milestones if m["group"] == g]})

    # ---------- trabajo realizado sin horas registradas (evidencia, no suma horas) ----------
    trabajo = []
    if 'Trabajo_sin_horas' in hojas:
        for _, r in xl.parse('Trabajo_sin_horas').iterrows():
            if not texto(r.get('Entregable')):
                continue
            f = pd.to_datetime(r.get('Fecha'), errors='coerce')
            mes = f"{f.year}-{f.month:02d}" if pd.notnull(f) else meses[-1]
            if mes not in meses:
                mes = max([m for m in meses if m <= mes] or [meses[0]])
            trabajo.append({
                "fecha": str(f.date()) if pd.notnull(f) else "", "mes": mes,
                "entregable": texto(r['Entregable']), "tipo": texto(r.get('Tipo')),
                "hitos": [h.strip() for h in texto(r.get('Hitos')).split(',') if h.strip()],
                "items": texto(r.get('Items_EDT')), "estado": texto(r.get('Estado')),
                "descripcion": texto(r.get('Descripcion')),
            })

    # ---------- plan de cierre (prórroga): semanas, líneas del Gantt, tareas por desarrollar y documentación ----------
    cierre = None
    if 'Plan_Cierre' in hojas:
        def filas(hoja):
            return [r for _, r in xl.parse(hoja).iterrows()] if hoja in hojas else []
        def fecha_txt(v):
            f = pd.to_datetime(v, errors='coerce')
            return str(f.date()) if pd.notnull(f) else ""
        cierre = {
            "weeks": [{"n": int(r['Semana']), "label": texto(r['Etiqueta']), "start": fecha_txt(r['Inicio']), "end": fecha_txt(r['Fin']),
                       "use": texto(r['Uso'])} for r in filas('Semanas_Cierre')],
            "lines": [{"line": texto(r['Linea']), "stage": texto(r['Etapa']), "status": texto(r['Estado']), "owner": texto(r['Responsable']),
                       "from": int(numero(r['Semana_Inicio'], 1)), "to": int(numero(r['Semana_Fin'], 1)),
                       "hitos": [h.strip() for h in texto(r.get('Hitos')).split(',') if h.strip()], "items": texto(r.get('Items_EDT'))}
                      for r in filas('Plan_Cierre') if texto(r['Linea'])],
            "tasks": [{"owner": texto(r['Responsable']), "task": texto(r['Tarea']), "line": texto(r['Linea']), "source": texto(r['Fuente']),
                       "hito": texto(r['Hito']), "from": int(numero(r['Semana_Inicio'], 1)), "to": int(numero(r['Semana_Fin'], 1)),
                       "status": texto(r['Estado'])} for r in filas('Tareas_Pendientes') if texto(r['Tarea'])],
            "docs": [{"order": int(numero(r['Orden'])), "module": texto(r['Modulo']), "progress": numero(r['Avance_referido']),
                      "owner": texto(r['Responsable']), "doc": texto(r['Documento']), "from": int(numero(r['Semana_Inicio'], 1)),
                      "to": int(numero(r['Semana_Fin'], 1)), "note": texto(r.get('Nota'))} for r in filas('Plan_Documentacion') if texto(r['Documento'])],
        }

    dashboard_data = {
        "meta": {"updated": fecha_actualizacion(), "edt": meses_out[-1]["edt"], "contrato": contrato,
                 "fuenteHoras": horas_fuente, "mesInicial": meses[-1]},
        "expectedItems": items,
        "itemProgress": meses_out[-1]["itemProgress"],
        "months": meses_out,
        "groups": grupos,
        "milestones": milestones,
        "extraWork": trabajo,
    }
    if cierre:
        dashboard_data["closure"] = cierre
    with open(ARCHIVO_SALIDA, 'w', encoding='utf-8') as f:
        f.write("/* Archivo auto-generado por Python */\n")
        f.write("const DASHBOARD_DATA = ")
        json.dump(dashboard_data, f, ensure_ascii=False, separators=(',', ':'))
        f.write(";\n")
    total = sum(x["hours"]["total"] for x in meses_out)
    print(f"¡Éxito! '{ARCHIVO_SALIDA}' generado: {len(meses_out)} meses, {len(milestones)} hitos, {total:,.1f} horas.")
    print("Ya puedes hacer commit en GitHub.")


if __name__ == "__main__":
    generar_registry()
