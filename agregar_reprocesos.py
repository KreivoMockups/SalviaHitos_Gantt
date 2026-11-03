"""
Agrega la Bolsa 3 (reprocesos no cobrables) a registry.js.
Lee la hoja Reprocesos de Datos_Malla_SALVIA.xlsx y modifica registry.js en su lugar.
Uso (después de generador_registry.py):  python agregar_reprocesos.py
Se puede correr varias veces: siempre parte de las horas registradas originales.
"""
import json
from collections import defaultdict
import openpyxl

ARCHIVO_EXCEL = 'Datos_Malla_SALVIA.xlsx'
ARCHIVO_REGISTRY = 'registry.js'


def si(v):
    return str(v or '').strip().lower() in ('sí', 'si', 's', 'x', 'true', '1')


def main():
    hoja = openpyxl.load_workbook(ARCHIVO_EXCEL, data_only=True)['Reprocesos']
    enc = [c.value for c in hoja[1]]
    filas = [dict(zip(enc, r)) for r in hoja.iter_rows(min_row=2, values_only=True) if r[0]]

    b3 = defaultdict(float)
    descuento = defaultdict(lambda: {'b1': 0.0, 'b2': 0.0})
    modulos = defaultdict(lambda: defaultdict(float))
    excluidas = defaultdict(float)
    for f in filas:
        mes, h = str(f['Mes']), float(f['Horas'] or 0)
        if not si(f['Incluir']):
            excluidas[mes] += h
            continue
        b3[mes] += h
        modulos[mes][str(f['Modulo'] or 'Sin módulo')] += h
        if si(f['Descontar_de_bolsa']):
            bolsa = 'b1' if '1' in str(f['Bolsa_origen']) else 'b2'
            descuento[mes][bolsa] += h

    texto = open(ARCHIVO_REGISTRY, encoding='utf-8').read()
    ini = texto.index('=') + 1
    datos = json.loads(texto[ini:].strip().rstrip(';'))

    acum = {'b1': 0.0, 'b2': 0.0, 'b3': 0.0}
    for m in datos['months']:
        h = m['hours']
        reg = m.setdefault('registered', {'b1': h['b1'], 'b2': h['b2'], 'total': h['total']})
        d = descuento[m['id']]
        h['b1'] = round(reg['b1'] - d['b1'], 1)
        h['b2'] = round(reg['b2'] - d['b2'], 1)
        h['total'] = round(h['b1'] + h['b2'], 1)
        h['b3'] = round(b3[m['id']], 1)
        for k in acum:
            acum[k] += h[k]
        m['cum'] = {'b1': round(acum['b1'], 1), 'b2': round(acum['b2'], 1),
                    'total': round(acum['b1'] + acum['b2'], 1), 'b3': round(acum['b3'], 1)}
        m['reprocesos'] = {
            'horas': round(b3[m['id']], 1),
            'descontado': {k: round(v, 1) for k, v in d.items()},
            'excluido': round(excluidas[m['id']], 1),
            'modulos': sorted([[k, round(v, 1)] for k, v in modulos[m['id']].items()], key=lambda x: -x[1]),
        } if b3[m['id']] else None
    datos['meta']['bolsa3'] = {'nombre': 'Bolsa 3 · Reprocesos', 'descripcion': 'Horas trabajadas para corregir fallas del desarrollo; no se cobran ni suman al contrato'}

    with open(ARCHIVO_REGISTRY, 'w', encoding='utf-8') as out:
        out.write(texto[:ini].split('\n')[0] + '\n' if texto.startswith('/*') else '')
        out.write('const DASHBOARD_DATA = ')
        json.dump(datos, out, ensure_ascii=False, separators=(',', ':'))
        out.write(';\n')
    total = sum(b3.values())
    print(f"Bolsa 3: {total:,.1f} h de reprocesos en {len([m for m in b3 if b3[m]])} meses; "
          f"descontadas de las bolsas: {sum(d['b1'] + d['b2'] for d in descuento.values()):,.1f} h; excluidas: {sum(excluidas.values()):,.1f} h.")


if __name__ == '__main__':
    main()
