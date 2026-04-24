import pandas as pd
import json

# ==========================================
# CONFIGURACIÓN
# ==========================================
ARCHIVO_EXCEL = 'Datos_Malla_SALVIA.xlsx'
ARCHIVO_SALIDA = 'registry.js'

def generar_registry():
    print("Iniciando conversión de Excel a JavaScript...")
    
    try:
        # 1. Leer las hojas de Excel
        df_plan = pd.read_excel(ARCHIVO_EXCEL, sheet_name='Plan')
        df_matriz = pd.read_excel(ARCHIVO_EXCEL, sheet_name='Matriz')
        df_actas = pd.read_excel(ARCHIVO_EXCEL, sheet_name='Actas')

        # 2. Extraer el Eje Vertical (Actividades)
        # Se asegura de convertirlas a texto
        expected_items = (df_plan['ID'].astype(str) + " " + df_plan['Actividad'].astype(str)).tolist()

        # 3. Procesar las Columnas (Hitos)
        milestones = []
        
        # Identificamos qué columnas son hitos (ignoramos la columna ID)
        columnas_hitos = [col for col in df_matriz.columns if col != 'ID']

        for hito_id in columnas_hitos:
            # Extraer la matriz binaria (1s y 0s) para este hito
            signature = df_matriz[hito_id].fillna(0).astype(int).tolist()
            
            # Buscar el detalle de este hito en la hoja de Actas
            acta_info = df_actas[df_actas['ID_Hito'] == hito_id]
            
            if not acta_info.empty:
                # Si el % viene como 0.85 en Excel, lo multiplicamos por 100. Si viene como 85, lo dejamos igual.
                avance_crudo = float(acta_info['Avance_%'].values[0])
                completion = avance_crudo * 100 if avance_crudo <= 1 else avance_crudo
                
                name = str(acta_info['Nombre_Hito'].values[0])
                
                # Manejar fechas limpiamente (evitar el "00:00:00" de Excel)
                date_val = acta_info['Fecha_Ejecucion'].values[0]
                date = str(date_val).split('T')[0] if pd.notnull(date_val) else "Pendiente"
                
                # Extraer detalles y manejar celdas vacías
                detalles = str(acta_info['Resumen_Acta (Ficha Técnica)'].values[0])
                if detalles == "nan": detalles = ""
                
                responsable = str(acta_info['Responsable'].values[0])
            else:
                # Valores por defecto si el hito aún no tiene acta
                name = hito_id
                date = "Sin fecha"
                completion = 0
                detalles = "Pendiente de ejecución."
                responsable = "Por definir"

            milestones.append({
                "id": str(hito_id),
                "name": name,
                "date": date,
                "completion": int(completion),
                "signature": signature,
                "details": detalles,
                "responsable": responsable
            })

        # 4. Construir el objeto JSON final
        dashboard_data = {
            "expectedItems": expected_items,
            "milestones": milestones
        }

        # 5. Escribir el archivo JavaScript
        with open(ARCHIVO_SALIDA, 'w', encoding='utf-8') as f:
            f.write("/* Archivo auto-generado por Python */\n")
            f.write("const DASHBOARD_DATA = ")
            # Dump JSON asegurando que los acentos y HTML se exporten bien
            json.dump(dashboard_data, f, ensure_ascii=False, indent=4)
            f.write(";\n")
            
        print(f"¡Éxito! Archivo '{ARCHIVO_SALIDA}' generado correctamente.")
        print("Ya puedes hacer commit en GitHub.")

    except Exception as e:
        print(f"Error durante la conversión: {e}")

if __name__ == "__main__":
    generar_registry()