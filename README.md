# 🏛️ SalviaHitos_Gantt
Tablero interactivo que permite llevar el seguimiento de las tareas asociadas al proyecto Salvia

Dashboard interactivo y estático diseñado para el seguimiento ejecutivo y la auditoría técnica del proyecto **"SALVIA Desarrollo Web y App"** (Kreivo 2026). 

Esta herramienta utiliza una lógica de visualización **UpSet Plot** para mapear la Estructura de Desglose del Trabajo (EDT) contra los hitos contractuales y los compromisos documentados en las actas de gobernanza.

---

## 🎯 Objetivo Estratégico

Proveer a la gerencia del proyecto, a los supervisores de SALVIA y a MinIgualdad una herramienta de "Transparencia Activa". El dashboard permite visualizar de manera inmediata qué actividades de la EDT (eje vertical) han sido ejecutadas para cumplir cada hito contractual (eje horizontal), respaldando cada porcentaje de avance con fichas técnicas extraídas directamente de las actas de reunión.

## ⚙️ Arquitectura y Tecnologías

El proyecto fue construido bajo un enfoque de **cero fricción operativa** y alta seguridad (sin bases de datos externas vulnerables), ideal para entornos del sector público:

* **Frontend:** HTML5 semántico.
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/) (vía CDN) con una paleta de colores personalizada tipo "Blueprint" (Slate & Emerald) para una estética directiva y sobria.
* **Motor Lógico:** Vanilla JavaScript (`app.js`), encargado de la matemática visual de las intersecciones y las barras de progreso.
* **Capa de Datos:** Objeto JSON local (`registry.js`), que actúa como un gemelo digital de la matriz de ejecución en Google Sheets/Excel.

---
📄 Licencia
Propiedad de Kreivo 2026.

