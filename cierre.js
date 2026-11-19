/* Plan de cierre SALVIA (Instrucciones de cierre v1.2, corte 13-nov-2026).
   Une las tareas del plan con las pantallas de la Red de acción (ids de N en datos.js).
   Ajustado el 18-nov-2026 con las capturas del servidor de pruebas (39 pantallas, 11 roles) y la póliza expedida.
   Para actualizar: cambie el estado de una tarea o de una pantalla y suba este archivo.
   Estados de tarea: hecho, revision, curso, porhacer, sintarea, cliente, confirmar, plan.
   Estados de pantalla en el cierre: prod, testing, revision, parcial, pendprod, sintarea, mock. */
const CIERRE = {
  version: '1.2',
  corte: '13-nov-2026',
  fuentes: 'Tablero de hitos (corte 10-nov), Jira al 13-nov (Sprints 22 a 24), Red de acción y capturas del servidor de pruebas al 18-nov (39 pantallas, 11 roles)',

  semanas: [
    ['S1', '2026-10-26', '2026-10-31', 'Desarrollo'], ['S2', '2026-11-02', '2026-11-07', 'Desarrollo · despliegue 1'],
    ['S3', '2026-11-09', '2026-11-14', 'Desarrollo'], ['S4', '2026-11-16', '2026-11-21', 'Desarrollo · despliegue 2 · aceptación A'],
    ['S5', '2026-11-23', '2026-11-28', 'Desarrollo · aceptación B'], ['S6', '2026-11-30', '2026-12-05', 'Desarrollo · despliegue 3 · aceptación C'],
    ['S7', '2026-12-07', '2026-12-12', 'Último desarrollo · congelamiento'], ['S8', '2026-12-14', '2026-12-19', 'Capacitación y documentación'],
    ['S9', '2026-12-21', '2026-12-31', 'Entrega y recibo a satisfacción']
  ],

  estadosTarea: {
    hecho: ['Terminada (en testing)', 'ok'], revision: ['En revisión', 'build'], curso: ['En curso', 'accent'],
    porhacer: ['Por hacer (en Jira)', 'warn'], sintarea: ['Sin tarea en Jira', 'risk'], cliente: ['Espera a SALVIA', 'mock'],
    confirmar: ['Por confirmar', 'warn'], plan: ['Programada', 'mock']
  },
  estadosPantalla: {
    prod: ['En producción', 'ok'], testing: ['En testing', 'build'], revision: ['En revisión', 'build'], parcial: ['En construcción', 'warn'],
    pendprod: ['Pendiente de producción', 'warn'], sintarea: ['Sin tarea en Jira', 'risk'], mock: ['Solo en el mockup', 'mock']
  },

  // Estado de cada pantalla al 13-nov (la Red de acción conserva el estado de los manuales del 13-oct)
  pantallas: {
    rep: ['testing', 'Reporte V2 en testing (Sprint 22); sus tareas siguen abiertas en Jira.'],
    mis: ['testing', 'Gestión de reportes en testing desde el 19-oct.'],
    rec: ['testing', 'Recontacto 3x3 en testing desde el 19-oct.'],
    l155: ['sintarea', 'Sin tareas de construcción registradas.'],
    bus: ['sintarea', 'Faltan «nuevo caso sobre un registro existente» y «actualizar caso»; sin tareas en Jira.'],
    ing: ['prod', 'En producción. Registro V3 en testing y tres hallazgos del registro en revisión.'],
    tz: ['prod', 'En producción. Tamizaje en formato tabla dentro de Registro V3, en testing.'],
    gs: ['testing', 'Gestión Salvia en testing desde el 19-oct.'],
    ai: ['sintarea', 'Mockup aprobado; el núcleo y el botón reutilizable no tienen tareas en Jira.'],
    ges: ['sintarea', 'Bandeja de alertas validada en el mockup; sin tareas en Jira.'],
    act: ['sintarea', 'Activación de rutas desde la alerta sin tareas en Jira.'],
    hist: ['sintarea', 'Casos con alerta validado en el mockup; sin tareas en Jira.'],
    caso: ['prod', 'En producción. Listado ampliado con filtros por fecha, persona asignada, casos sin asignar y agente inactivo, reporte por agentes y descarga para el supervisor en testing (9-nov; confirmado con el rol sv el 18-nov). Aún no tiene el filtro de casos a escalar.'],
    area: ['prod', 'En producción.'],
    mseg: ['prod', 'En producción. La página de seguimiento ya integra el formulario V4, conectado con barreras activas, medidas de emergencia y obligaciones pendientes de las entidades (rol ro, 18-nov); conserva el formulario anterior para los seguimientos viejos. Su QA no tiene responsable.'],
    mtar: ['prod', 'En producción.'],
    lid: ['mock', 'Falta definir qué datos de la víctima puede ver la lideresa.'],
    rps: ['prod', 'En producción. Historial de remisiones de la supervisión confirmado en testing con el rol sv (18-nov): filtros por estado, sesiones, dupla, riesgo y equipo.'],
    mps: ['prod', 'En producción. Detalle de la remisión con validación y botón de intento de contacto del 3x3 separado de «Registrar contacto», y registro de la atención por secciones con seguimiento a barreras y a entidades, confirmados con los roles ps y ts (18-nov). Formularios definitivos por hacer.'],
    met: ['testing', 'Pantallas de remisión, detalle y revisión del Equipo Técnico en testing (Sprint 22). Hoy la acción «Revisar (Equipo Técnico)» la tiene la supervisión (rol sv); falta un usuario del rol te para probarla.'],
    msup: ['testing', 'Asignación y reasignación en bloque con recomendación confirmadas con los roles sv y sm (18-nov). La bandeja maneja 18 estados, cuatro de ellos de riesgo inminente. La revisión de la caracterización está en las tareas de Juan.'],
    mag: ['parcial', 'Bandeja del agente y tarea «Contactar víctima y realizar entrevista de caracterización» en testing (rol am, 18-nov), con contador de intentos 3x3 y paso a consentimiento informado. La entrevista de caracterización (secciones I a VIII y resultado) ya se ve en el detalle como supervisión; confirmar si PSWYA-916 se puede cerrar.'],
    mcon: ['revision', 'Bandeja del Convenio en testing (rol sc, 18-nov), pero sus botones solo abren el detalle y ahí no hay controles para preaprobar medidas ni aprobar cotizaciones. Depende de las tareas de Medidas de Juan en revisión.'],
    cruz: ['parcial', 'Carga de cotizaciones, envío a aprobación y avance en testing (rol cr, 18-nov); escalamiento y entrega de la medida inmediata en testing. Falta marcar la medida como otorgada y registrar el valor entregado frente al aprobado.'],
    not: ['prod', 'En producción. Pestaña «Mis oficios» y filtros por agente confirmados con el rol an (18-nov); la aprobación previa de solicitudes de Mi SALVIA (hallazgo 119) no aparece.'],
    mbar: ['prod', 'En producción. Envío al mecanismo y recomendaciones guardadas en revisión. Mis barreras del enlace recibe también solicitudes de mesa técnica, y el detalle de la barrera muestra «Seguimientos a esta barrera» con respuesta institucional, gestión y actuaciones (rol en, 18-nov).'],
    ment: ['revision', 'Gestión de la medida por el enlace dentro de las tareas de Medidas en revisión.'],
    cent: ['testing', 'Casos Entidad y Mis acciones institucionales confirmados en testing con el rol et (18-nov): pendientes y completadas, «Relación con entidad», radicado o NUNC; tarjetas con «Objetivo» y «Solicitud». El usuario de prueba quedó en la sede Policía Nacional, sin casos, así que el detalle del caso como entidad no se pudo probar. Falta el paso a producción.'],
    cmec: ['pendprod', 'Pendiente de producción. El caso llega al mecanismo al gestionar la alerta por barreras (en revisión).'],
    dir: ['prod', 'En producción. QA de creación de entidades y usuarios en revisión; entidades nacionales y departamentales por revisar.']
  },

  personas: [
    { id: 'af', nombre: 'Andrés Felipe Ascencio', foco: 'Puerta de entrada, Registro y Alerta inminente',
      lineas: 'Registro y Reporte (S1 a S4) y Registro Familiares Feminicidio (S2 a S5). Mueve M2, M4, M5 y la parte de familiares de M3.',
      hecho: 'La historia A corre desde el reporte de Consuelo hasta el ID de registro, la historia C hasta los dos menores inscritos, y la alerta se activa desde las cuatro franjas.' },
    { id: 'br', nombre: 'Brayan Marbello', foco: 'Calidad, Mecanismo y documentación',
      lineas: 'Mecanismo Articulador (S1 a S3), Seguimiento y Detalle del Caso (S4 a S6) y el plan de documentación. Mueve H08, H10 y parte de M1.',
      hecho: 'Cada historia tiene un guion que pasa en testing y en producción, con evidencia en video.',
      nota: 'Es la persona más cargada del plan. Los arreglos que salgan de QA se reparten entre Juan y Brandon; Brayan prueba, prioriza y documenta.' },
    { id: 'jn', nombre: 'Juan Nicolás Buitrago', foco: 'Coordinación territorial y segunda mitad de Medidas',
      lineas: 'Notificaciones (S2 a S4) y Enlace territorial (S3 a S7), más 7 pasos del flujo «Terminar Medidas». Mueve M1 y M3.',
      hecho: 'En la historia A la barrera de Daniela escala del agente al profesional de barreras, al enlace y al comité municipal; en la historia B la medida de Alejo queda otorgada.' },
    { id: 'bm', nombre: 'Brandon Martín', foco: 'Entidades y expediente',
      lineas: 'Entidad territorial (S2 a S5). Mueve M1 (6.1.12).',
      hecho: 'En la historia A la Comisaría recibe la solicitud, responde desde Mis acciones institucionales y esa respuesta aparece en el caso para que el agente cierre la barrera.' },
    { id: 'sr', nombre: 'Santiago Ramos', foco: 'Primera mitad de Medidas, Psicosocial y App MASP',
      lineas: 'Medidas de Emergencia (S1 a S4) y Equipo Psicosocial (S4 a S7), más el formulario de seguimiento V4 y la App MASP. Mueve M3, M1 y APP.',
      hecho: 'En la historia B la remisión priorizada de Alejo pasa por revisión técnica, asignación y vía de atención sin esperar al día siguiente.' },
    { id: 'ca', nombre: 'Camilo Arias', foco: 'Despliegue y discapacidad',
      lineas: 'Ajustes de discapacidad (S3 a S7) y responsable de H09 en el tablero.',
      hecho: 'Cada despliegue deja acta y las tres historias pasan en producción en la semana 7.' },
    { id: 'ap', nombre: 'Andrés Posada', foco: 'Dirección',
      lineas: 'Hombres (S4 a S5) y Estabilización (S5 a S7), las dos en ideación.',
      hecho: 'Hitos con acta, horas dentro del tope y entrega contractual (H11) completa.' }
  ],

  // id, quién, texto, semana inicial, semana final, estado, pantallas, historias, jira, nota, etiquetas
  tareas: [
    ['af-alerta', ['af'], 'Núcleo de la Alerta inminente en Registro V3: activar la alerta y pausar la actividad del operador', 1, 3, 'sintarea', ['ai', 'ing'], ['B'], '', 'Prioridad de la semana 4.', ['alerta']],
    ['af-boton', ['af'], 'Botón reutilizable de activación en Seguimiento, Psicosocial, Medidas y Territorio, con cada dueño de franja', 3, 5, 'sintarea', ['ai', 'mseg', 'mps', 'mag', 'mbar'], ['A', 'B'], '', '', ['alerta']],
    ['af-hallazgos', ['af'], 'Hallazgos de supervisión del registro: entidad que no se asocia al guardar, etiqueta del checklist y canales de activación que no generan tareas', 1, 3, 'revision', ['ing', 'gs'], ['A'], 'PSWYA-846 a 848', '', []],
    ['af-sprint22', ['af'], 'Registro V3 y Reporte V2 del Sprint 22: cerrar en Jira las 12 tareas (sus horas ya se reportaron en octubre)', 4, 4, 'porhacer', ['rep', 'mis', 'ing', 'tz', 'gs'], ['A'], 'PSWYA-897 a 908', '', []],
    ['af-paquete', ['af', 'ca'], 'Paquete del despliegue de la semana 2: Registro V3 y gestión de reportes', 2, 2, 'confirmar', ['rep', 'mis', 'rec', 'gs'], ['A'], '', '', ['despliegue']],
    ['af-filtro', ['af', 'sr'], 'Filtro de casos a escalar en la Lista de casos, que reemplaza el tablero del Mecanismo', 2, 3, 'sintarea', ['caso', 'cmec'], ['A'], '', 'Requiere validación de SALVIA. Confirmado el 18-nov: la Lista de casos todavía no tiene ese filtro.', []],
    ['af-nuevocaso', ['af'], '«Nuevo caso sobre un registro existente» y «actualizar caso», que Registro V3 aún no tiene', 3, 4, 'sintarea', ['bus', 'ing'], ['A', 'C'], '', 'Base del cierre de la historia A y del inicio de la historia C.', []],
    ['af-familiares', ['af'], 'Mockup de familiares con SALVIA y registro anclado a la cédula de la víctima, con hijos y Registro Nacional de Huérfanos', 2, 5, 'sintarea', ['bus', 'ing'], ['C'], '', 'El mockup espera revisión de SALVIA (semana 2).', []],

    ['br-guiones', ['br'], 'Guiones de prueba reproducibles en Playwright para las tres historias, incluida la reapertura de casos', 1, 3, 'sintarea', ['rep', 'ing', 'gs', 'mseg', 'mbar', 'cmec', 'ai', 'met', 'mag', 'bus'], ['A', 'B', 'C'], '', 'Criterio de aceptación: video del guion en producción.', ['qa']],
    ['br-validar', ['br'], 'Validar con SALVIA dónde quedan las recomendaciones del equipo técnico y la respuesta de las entidades en Mis acciones institucionales', 1, 3, 'hecho', ['mbar', 'cent'], ['A'], 'PSWYA-892 y 894', 'Validado el 2-nov.', ['qa']],
    ['br-qa-barreras', ['br'], 'QA de asignaciones y alertas por barreras', 2, 3, 'hecho', ['mseg', 'mbar'], ['A'], 'PSWYA-909', 'Completado el 9-nov.', ['qa']],
    ['br-qa-entidades', ['br'], 'QA de creación de entidades y usuarios', 3, 4, 'revision', ['dir', 'cent'], ['A'], 'PSWYA-911', '', ['qa']],
    ['br-qa-medidas', ['br'], 'QA del flujo de Medidas de Emergencia', 3, 4, 'porhacer', ['met', 'msup', 'mag', 'mcon', 'cruz'], ['B'], 'PSWYA-910', 'Desde el 18-nov hay usuarios de prueba para sm, am, sc y cr; falta el rol te. Antes de la aceptación de la historia B hace falta una remisión con cotizaciones reales que llegue hasta el Convenio.', ['qa']],
    ['br-qa-registro', ['br'], 'QA de Reporte y Registro nuevos', 3, 4, 'porhacer', ['rep', 'mis', 'rec', 'ing', 'gs'], ['A'], 'PSWYA-805', '', ['qa']],
    ['br-docs-seg', ['br'], 'Los 11 documentos técnicos de Seguimiento (módulo al 95 %)', 1, 3, 'confirmar', ['caso', 'area', 'mseg', 'mtar'], [], '', 'Sin registro en Jira.', ['doc']],
    ['br-bandeja', ['br'], 'Bandeja de alertas por validar y casos con alerta', 4, 6, 'sintarea', ['ges', 'hist'], ['B'], '', '', ['alerta']],
    ['br-seguimiento', ['br'], 'Cerrar los hallazgos abiertos de Seguimiento y documentar Reporte y Registro (semanas 5 y 6)', 4, 6, 'plan', ['caso', 'mseg', 'rep', 'ing'], ['A'], '', '', ['doc']],
    ['br-manuales', ['br'], 'Manuales de usuario para las capacitaciones y documentación de Medidas', 7, 8, 'curso', ['met', 'msup', 'mag', 'mcon'], [], 'PSWYA-893', 'Los manuales de usuario arrancaron antes de lo previsto.', ['doc']],

    ['jn-medidas', ['jn'], 'Medidas: caracterización, revisión del supervisor, trazabilidad y cotizaciones de la Supervisión del Convenio, gestión por el enlace y medidas otorgadas por Cruz Roja', 1, 4, 'revision', ['mag', 'msup', 'mcon', 'ment', 'cruz'], ['B'], 'PSWYA-896', 'Al 18-nov el Convenio no tiene controles para aprobar y Cruz Roja no puede marcar la medida como otorgada; las remisiones de prueba tienen estados cargados a mano.', []],
    ['jn-mecanismo', ['jn'], 'El caso llega al mecanismo al gestionar la alerta por barreras, sin redigitar datos', 2, 3, 'revision', ['mbar', 'cmec'], ['A'], 'PSWYA-890', '', []],
    ['jn-recomend', ['jn'], 'Recomendaciones del equipo técnico guardadas en Atención SALVIA', 2, 3, 'revision', ['mbar'], ['A'], 'PSWYA-891', '', []],
    ['jn-caract', ['jn'], 'Caracterización visible en Medidas de Emergencia', 4, 4, 'porhacer', ['mag'], ['B'], 'PSWYA-916', 'La entrevista de caracterización ya se ve en el detalle (captura del 18-nov), aunque la página no carga caracterizacion-view.js; confirmar si se puede cerrar.', []],
    ['jn-diferenciadas', ['jn'], 'Estado de las medidas diferenciadas visible en Atención SALVIA', 4, 4, 'porhacer', ['caso', 'mag'], ['B'], 'PSWYA-917', '', []],
    ['jn-activacion', ['jn'], 'Activación de rutas desde la Alerta inminente por el agente de notificaciones', 3, 4, 'sintarea', ['act'], ['B'], '', '', ['alerta']],
    ['jn-enlace', ['jn'], 'Enlace territorial: acciones y trazabilidad visibles fuera de la línea de tiempo', 4, 7, 'porhacer', ['mbar'], ['A'], 'PSWYA-915', 'El detalle de la barrera ya muestra «Seguimientos a esta barrera» con las actuaciones (captura del 18-nov); confirmar si eso cumple la tarea.', []],

    ['bm-usuario', ['bm'], 'Usuario de entidad creado solo desde el Directorio de Entidades (vínculo correcto desde el administrador)', 1, 2, 'revision', ['dir', 'cent'], ['A'], 'PSWYA-887', '', []],
    ['bm-hallazgos', ['bm'], 'Seis hallazgos sin asignar de Rutas (109, 111, 112, 114, 115 y 119)', 1, 2, 'cliente', ['cent', 'dir', 'not'], ['A'], '', 'Esperan que SALVIA defina los campos.', []],
    ['bm-nacionales', ['bm'], 'Revisión de entidades nacionales y departamentales', 4, 4, 'porhacer', ['dir'], ['A'], 'PSWYA-912', '', []],
    ['bm-agente', ['bm'], 'Confirmación del agente asignado en los casos', 4, 4, 'porhacer', ['caso'], ['A'], 'PSWYA-914', '', []],
    ['bm-alcaldias', ['bm'], 'Ciclo de la entidad con las alcaldías piloto (Puerto Inírida, Leticia, Mitú) y Amazonía', 3, 5, 'plan', ['cent', 'mtar', 'not'], ['A'], '', '', []],
    ['bm-expediente', ['bm'], 'Expediente unificado dentro de Rutas (responsable por confirmar)', 3, 5, 'sintarea', ['caso', 'cent', 'cmec'], ['A', 'C'], '', '', []],
    ['bm-alerta', ['bm'], 'Alerta inminente desde el enlace territorial y la entidad', 4, 5, 'sintarea', ['ai', 'mbar', 'cent'], ['B'], '', '', ['alerta']],
    ['bm-psico', ['bm', 'sr'], 'Versión definitiva de los formularios de Psicosocial', 3, 5, 'porhacer', ['mps'], ['B'], 'PSWYA-889 y 913', '', []],

    ['sr-remisiones', ['sr'], 'Flujo de remisiones de Medidas: escalamiento a Cruz Roja, entrega y confirmación de la medida inmediata, revisión del Equipo Técnico, devolución y descarte, asignación del agente y contacto 3x3', 1, 4, 'hecho', ['met', 'msup', 'mag', 'cruz'], ['B'], 'PSWYA-879', 'Terminado el 30-oct (Sprint 22).', []],
    ['sr-intentos', ['sr'], 'Contacto en Medidas sin el límite de tres intentos', 3, 3, 'hecho', ['mag'], ['B'], 'PSWYA-918', 'Terminado el 9-nov.', []],
    ['sr-v4', ['sr'], 'Formulario de seguimiento V4 sembrado sin reemplazar el vigente', 1, 3, 'hecho', ['mseg'], ['A'], 'PSWYA-871 a 878', 'Terminado el 26-oct.', []],
    ['sr-qa-v4', ['sr', 'br'], 'QA del nuevo formulario de seguimiento V4', 4, 4, 'porhacer', ['mseg'], ['A'], 'PSWYA-922', 'La tarea no tiene responsable asignado en Jira. El V4 ya está integrado en la página de seguimiento (captura del 18-nov).', ['qa']],
    ['sr-listado', ['sr'], 'Listado de casos ampliado con filtros por fecha, pantalla de reporte por agentes y descarga de casos con filtros para el supervisor', 3, 3, 'hecho', ['caso', 'area'], ['A'], 'PSWYA-919 a 921', 'Terminado el 9-nov.', []],
    ['sr-3x3', ['sr'], 'Botón exclusivo de intento de contacto y cierre por falta de contacto en el 3x3 de Psicosocial', 4, 7, 'hecho', ['mps'], ['B'], 'PSWYA-886', 'Adelantado: estaba previsto para las semanas 4 a 7.', []],
    ['sr-alerta', ['sr'], 'Alerta inminente en Medidas (riesgo inminente hacia Cruz Roja) y en Psicosocial', 3, 6, 'sintarea', ['ai', 'mag', 'mps', 'cruz'], ['B'], '', 'Depende de la regla de riesgo inminente que debe fijar SALVIA.', ['alerta']],
    ['sr-app', ['sr'], 'App MASP: documentar lo publicado en Google Play (directorio, sincronización, Línea 155, botón de alerta) para el manual y el video', 5, 8, 'plan', ['dir'], [], '', 'App Store solo si SALVIA lo decide.', ['doc']],

    ['ca-desp2', ['ca'], 'Despliegue a main de la semana 2, con respaldo y plan de reversa', 2, 2, 'confirmar', ['rep', 'mis', 'rec', 'gs', 'cent', 'cmec'], ['A', 'B', 'C'], '', 'La última sincronización del repositorio (26-oct) mostraba main en el 10-sep.', ['despliegue']],
    ['ca-desp4', ['ca'], 'Despliegue de la semana 4 (16 al 21-nov): todo lo probado en testing desde el 10-sep si el de la semana 2 no se hizo', 4, 4, 'plan', ['rep', 'mis', 'rec', 'gs', 'met', 'msup', 'cent', 'cmec'], ['A', 'B', 'C'], '', '', ['despliegue']],
    ['ca-desp6', ['ca'], 'Despliegue de la semana 6 y congelamiento en la semana 7', 6, 7, 'plan', [], ['A', 'B', 'C'], '', '', ['despliegue']],
    ['ca-discap', ['ca'], 'Ajustes de discapacidad: si SALVIA no define la ruta, se documenta como evolución futura', 3, 7, 'cliente', [], [], '', 'La remisión a equipos en testing ya incluye «Discapacidad» como destino.', []],

    ['ap-poliza', ['ap'], 'Póliza actualizada por la prórroga', 1, 2, 'hecho', [], [], '', 'Anexo de modificación expedido por Seguros Mundial el 6-nov-2026.', []],
    ['ap-mesa', ['ap'], 'Mesa de diseño de Hombres y Estabilización', 3, 3, 'porhacer', [], ['C'], '', 'Estaba prevista para la semana 3. La remisión a equipos en testing ya lista Estabilización, Atención Hombres, Salvia Dignidad y Discapacidad.', []],
    ['ap-viernes', ['ap'], 'Cada viernes: malla, tablero, horas contra el tope de unas 85 h por semana y registro de decisiones del cliente', 1, 8, 'curso', [], [], '', '', []],
    ['ap-h11', ['ap'], 'Documentación para la DNDA, publicación final en Google Play y entrega del código fuente (H11)', 7, 9, 'plan', [], [], '', '', ['doc']]
  ],

  // Recorrido de cada historia: [pantalla o null, paso]
  historias: [
    { id: 'A', titulo: 'Daniela', sub: 'Reporte de un familiar',
      pasos: [['rep', 'Consuelo reporta en la web'], ['mis', 'La Gestoría asigna el reporte'], ['rec', 'Recontacto 3x3'], ['ing', 'Registro'], ['tz', 'Tamizaje «pareja»'], ['gs', 'Rutas y Barreras'], ['caso', 'Caso en Seguimiento'], ['mseg', 'Seguimiento'], ['mps', 'Psicosocial'], ['not', 'Oficio a la Comisaría'], ['cent', 'La Comisaría responde'], ['mbar', 'Enlace territorial'], ['cmec', 'Mecanismo Articulador'], ['mseg', 'El agente cierra la barrera']],
      hoy: 'Seguimiento, Psicosocial, Barreras y Notificaciones en producción. Registro V3 y gestión de reportes en testing. Casos Entidad y Casos Mecanismo pendientes de producción. Reapertura implementada. Ubicación de las recomendaciones y respuesta de la entidad validadas con SALVIA (2-nov); envío al mecanismo y recomendaciones guardadas, en revisión.',
      falta: 'Cerrar la revisión del envío al mecanismo y de las recomendaciones; Análisis del caso (en revisión); acciones del enlace visibles fuera de la línea de tiempo; filtro de casos a escalar; despliegue a main.',
      aceptacion: 'S4' },
    { id: 'B', titulo: 'Alejo', sub: 'Riesgo extremo, LGBTIQ+ no pareja',
      pasos: [['rep', 'Autorreporte'], ['tz', 'Tamizaje «LGBTIQ+ no pareja»'], ['ai', 'Alerta inminente'], ['ges', 'La Gestora valida'], ['act', 'Activación de rutas'], ['mps', 'Psicosocial urgente'], ['met', 'Remisión priorizada y revisión técnica'], ['msup', 'Asignación'], ['mag', 'Caracterización'], ['mcon', 'Supervisión del Convenio'], ['cruz', 'Entrega de la medida']],
      hoy: 'Tamizaje y Psicosocial operan. Alerta inminente aprobada en el mockup, sin tareas en Jira. Medidas: pantallas de remisión y detalle, flujo de remisiones y contacto sin límite de tres intentos en testing; tareas de Juan en revisión.',
      falta: 'Alerta inminente en todas las franjas; caracterización visible en Medidas y estado de las medidas diferenciadas; QA del flujo de Medidas; criterios de aceptación de Medidas aprobados por SALVIA.',
      aceptacion: 'S5' },
    { id: 'C', titulo: 'Familia de Marisol', sub: 'Familiares de feminicidio',
      pasos: [['bus', 'Búsqueda por cédula'], [null, 'Registro de familiares anclado a la víctima'], [null, 'Registro Nacional de Huérfanos'], ['met', 'Remisión a Medidas'], ['mag', 'Atención de Medidas'], [null, 'Estabilización']],
      hoy: 'Registro de familiares en mockup y sin tareas en Jira. Estabilización pendiente de idear (mesa en las semanas 5 a 7). Expediente unificado en construcción dentro de Rutas, sin tareas en Jira.',
      falta: 'Mockup aprobado y construido; Estabilización diseñada y construida; entidades de familiares en Rutas; expediente unificado.',
      aceptacion: 'S6' }
  ],

  traspasos: [
    ['Puerta de entrada → Registro', 'El reporte validado arrastra sus datos al formulario sin volver a preguntarlos.', ['rec', 'bus', 'ing'], ['A']],
    ['Registro → Seguimiento y Equipos especializados', 'Rutas y Barreras desde el mismo formulario; remisión priorizada a Medidas.', ['gs', 'caso', 'met'], ['A', 'B']],
    ['Seguimiento → Territorio', 'Barrera, alerta por barrera, enlace, Mecanismo Articulador y compromisos registrados.', ['mseg', 'mbar', 'cmec'], ['A']],
    ['Equipos especializados → Territorio', 'Medida aprobada, Supervisión del Convenio y entrega en territorio.', ['msup', 'mcon', 'ment', 'cruz'], ['B', 'C']],
    ['Cualquier franja → Alerta inminente', 'El operador pausa su actividad, activa la alerta, la gestora la valida, el agente de notificaciones activa las rutas y el caso queda con historial de alerta.', ['ai', 'ges', 'act', 'hist'], ['B']]
  ],

  // semana, qué se necesita, desbloquea, historias, estado (resuelta, parcial, abierta, programada), vence, pantallas, nota
  cliente: [
    ['S1', 'Retroalimentación del Equipo Técnico-Administrativo sobre el prototipo de Medidas y aprobación de sus criterios de aceptación y estados', 'Santiago, Juan', ['B', 'C'], 'abierta', '2026-11-06', ['met', 'msup', 'mag'], ''],
    ['S1', 'Regla de riesgo inminente en Medidas y su relación con la Alerta inminente: cuándo va por la vía de Cruz Roja sin caracterización previa', 'Santiago, Andrés Felipe', ['B'], 'abierta', '2026-11-06', ['ai', 'cruz'], ''],
    ['S1', 'Dónde deben quedar las recomendaciones del equipo técnico al agente; si Notificaciones aprueba antes de enviar a la entidad una solicitud de Mi SALVIA (hallazgo 119)', 'Juan, Brandon', ['A'], 'parcial', '2026-11-06', ['mbar', 'not', 'cent'], 'Recomendaciones validadas el 2-nov; el hallazgo 119 sigue sin respuesta.'],
    ['S1', 'Si la App MASP se publica también en App Store o queda solo en Google Play', 'Santiago', [], 'abierta', '2026-11-06', [], ''],
    ['S1', 'Si los reportes y recordatorios de la ruta diferencial entran al cierre o quedan como evolución futura', 'Juan', ['A'], 'abierta', '2026-11-06', ['caso'], 'Sin respuesta, queda como evolución futura.'],
    ['S1–S2', 'Campos «¿Qué debe gestionar la víctima en esta entidad?», «Objetivo de la entidad» y checklists de competencias y acciones institucionales (hallazgos 111, 112, 114 y 115)', 'Brandon', ['A'], 'abierta', '2026-11-13', ['cent', 'dir'], ''],
    ['S2', 'Validar la Alerta inminente ajustada, el filtro de casos a escalar y el formulario de seguimiento V4', 'Andrés Felipe, Santiago', ['A', 'B'], 'abierta', '2026-11-13', ['ai', 'caso', 'mseg'], ''],
    ['S2', 'Ventana de despliegue a producción con respaldo, y quién valida en producción', 'Camilo', ['A', 'B', 'C'], 'abierta', '2026-11-13', [], ''],
    ['S2', 'Revisión del mockup de Registro de Familiares', 'Andrés Felipe', ['C'], 'abierta', '2026-11-13', ['bus', 'ing'], ''],
    ['S3', 'Insumos y reunión de diseño para Hombres y Estabilización; definir la ruta de discapacidad', 'Andrés Posada, Camilo', ['C'], 'abierta', '2026-11-20', [], ''],
    ['S2–S7', 'Usuarios de prueba por rol: alcaldías piloto, mecanismo articulador, enlaces, Supervisión del Convenio y operador externo (Cruz Roja)', 'Brayan, Brandon', ['A', 'B', 'C'], 'parcial', '2026-12-12', ['cent', 'cmec', 'mbar', 'mcon', 'cruz', 'met', 'ges', 'lid'], 'Al 18-nov hay usuarios de ro, sv, en, et, ps, ts, an, sm, am, sc y cr. Faltan mecanismo articulador, equipo técnico, abogado, administrador, agente integral, gestora y lideresa. El usuario de entidad quedó en una sede sin casos.'],
    ['S4, S5, S6', 'Una sesión de aceptación por historia (A, B y C), con acta firmada', 'Todo el equipo', ['A', 'B', 'C'], 'programada', '2026-12-05', [], 'Deben agendarse ya.'],
    ['S8', 'Capacitaciones masivas con Línea 155 y gestoras, con lista de asistencia', 'Brayan', ['A', 'B', 'C'], 'programada', '2026-12-19', [], ''],
    ['S9', 'Acta de recibo a satisfacción y validación de manuales', 'Andrés Posada', ['A', 'B', 'C'], 'programada', '2026-12-31', [], '']
  ],

  novedades: [
    ['Terminado', 'ok', 'Flujo de remisiones de Medidas (Sprint 22) y, el 9-nov, contacto en Medidas sin límite de tres intentos, listado de casos con filtros por fecha, reporte por agentes y descarga para el supervisor. También el botón de intento de contacto del 3x3 de Psicosocial (adelantado) y la siembra del formulario de seguimiento V4.'],
    ['Validado con SALVIA', 'ok', 'El 2-nov: dónde quedan las recomendaciones del equipo técnico y la respuesta de las entidades en Mis acciones institucionales. El 9-nov se completó el QA de asignaciones y alertas por barreras.'],
    ['En revisión', 'build', '57 issues en Jira, 52 de octubre. De noviembre: envío al mecanismo, recomendaciones guardadas, tareas del flujo de Medidas de Juan, usuario de entidad desde el administrador y QA de entidades y usuarios.'],
    ['Por hacer', 'warn', 'Nueve tareas nuevas de noviembre y las 12 de Registro V3 y Reporte V2 del Sprint 22, abiertas en Jira aunque sus horas ya se reportaron.'],
    ['Sin tareas en Jira', 'risk', 'Núcleo y bandeja de la Alerta inminente, activación de rutas, filtro de casos a escalar, expediente unificado, registro de familiares y guiones de prueba. Son el camino crítico de las semanas 4 a 6.'],
    ['Confirmado en pruebas', 'ok', 'El 17 y 18-nov se revisaron 39 pantallas del servidor de pruebas con 11 roles; cubren 20 de las 30 de la Red de acción. Funcionan el formulario de seguimiento V4 integrado, el registro de la atención psicosocial con barreras y entidades, la caracterización visible en Medidas y la carga de cotizaciones de Cruz Roja.'],
    ['Hallazgos en pruebas', 'risk', 'La aprobación del Convenio y el otorgamiento de Cruz Roja no se pueden probar todavía; la Lista de casos no tiene el filtro de casos a escalar; la Alerta inminente no aparece en ningún rol; Consultar reportes y Primer contacto traen datos personales en la página.'],
    ['Póliza', 'ok', 'Anexo de modificación de la póliza expedido por Seguros Mundial el 6-nov-2026.'],
    ['Por confirmar', 'warn', 'Despliegue a main de la semana 2 y las decisiones de SALVIA de la semana 1 distintas de las dos validadas.']
  ],

  horas: { restantes: 597.5, b1: 127.5, b2: 470, porSemana: 85, corte: '31-oct', octubre: 584.5, reprocesosOct: 215 },

  hitos: {
    M1: '36 hallazgos críticos o altos abiertos (última revisión del 8-oct); Rutas y entidades en testing; 57 issues en revisión en Jira',
    M2: 'Registro V3 en testing; Alerta inminente por extender; rangos del puntaje por confirmar',
    M4: 'Preguntas OSIGD dentro de Registro V3; falta su paso a producción',
    M5: 'Formulario ASP dentro del registro; tratamiento del módulo integral sin decisión',
    M3: 'El flujo de remisiones ya está en testing, pero el tablero aún no lo cuenta; criterios de aceptación sin aprobar; familiares sin historias de usuario',
    APP: 'Google Play con directorio, sincronización, Línea 155 y botón de alerta. Faltan bitácora web, manual, video y QA; App Store sin decisión',
    H06: 'Casos migrados con formularios vacíos (SEG-01, SEG-02)',
    H07: 'Póliza actualizada (anexo del 6-nov); faltan las actas de aceptación del cierre',
    H08: 'Sin UAT formal; estrés, seguridad y accesibilidad pendientes',
    H09: 'Despliegue de la semana 2 por confirmar',
    H10: 'Manuales de usuario en curso; videos y capacitaciones con Línea 155 y gestoras',
    H11: 'DNDA, publicación final en tiendas y entrega del código fuente'
  },

  brechas: [
    ['Escalamiento automático de riesgo extremo, hoy por correo', 'Evolucionó a la Alerta inminente, funcionalidad estratégica y transversal', 'Llevarla a las cuatro franjas: activar, bandeja de la gestora, activación de rutas y casos con alerta', ['ai', 'ges', 'act', 'hist']],
    ['Definición de reapertura', 'Resuelta: el caso pasa de culminado o cerrado a reapertura', 'Incluirla en los guiones de prueba y en los manuales', ['caso', 'mseg']],
    ['Expediente unificado', 'En construcción para que funcione igual en todos los módulos', 'Terminarlo y probarlo con la historia C', ['caso', 'cent', 'cmec']],
    ['Tablero del Mecanismo Articulador', 'Se reemplaza por un filtro de casos «escalar» en la Lista de casos', 'Crear la tarea en Jira, construirlo y validarlo con SALVIA', ['caso', 'cmec']],
    ['Rutas para familiares', 'Abierta', 'Incluir las entidades que necesita la historia C', ['dir', 'cent']],
    ['Notificación al agente al registrar una barrera', 'Abierta; el QA de asignaciones y alertas por barreras pasó el 9-nov', 'Definir el mecanismo con SALVIA', ['mbar', 'mseg']],
    ['Remisión al Mecanismo sin redigitar datos', 'En revisión: el caso llega al mecanismo al gestionar la alerta por barreras', 'Cerrar la revisión y probarlo con la historia A', ['mbar', 'cmec']],
    ['Reportes y recordatorios de la ruta diferencial', 'En discusión; decisión de SALVIA vencida el 6-nov', 'Sin respuesta, queda como evolución futura', ['caso']]
  ],

  riesgos: [
    ['Horas insuficientes', '597,5 h cobrables al 31-oct, solo 127,5 h en Bolsa 1; octubre usó 584,5 h', 'Tope de unas 85 h por semana, con la Bolsa 2 como respaldo de la Bolsa 1'],
    ['Hallazgos que no terminan', '36 críticos o altos abiertos en M1; 57 issues en revisión en Jira', 'Solo entra un hallazgo si bloquea una de las tres historias'],
    ['Despliegue único y tardío', 'Despliegue de la semana 2 por confirmar', 'Despliegues en S2, S4 y S6; congelamiento en S7'],
    ['Alerta inminente a medias', 'Cuatro pantallas por construir y ninguna tarea en Jira al 13-nov', 'Un solo componente reutilizable, integrado por Andrés Felipe; QA la prueba en las cuatro franjas'],
    ['Sobrecarga de personas', 'Brayan con tres líneas y la documentación; Juan y Santiago con Medidas y otra línea', 'Medidas va primero (S1 a S4); los arreglos de QA se reparten según capacidad'],
    ['Decisiones del cliente tardías', 'Criterios de Medidas sin aprobar; seis hallazgos de Rutas sin definir', 'Cinco días hábiles por decisión; sin respuesta, se construye la opción más simple y queda en acta'],
    ['Datos personales en pruebas', 'Consultar reportes y Primer contacto traen datos personales en la página, y la Lista de casos tiene 17.461 registros', 'Pedir datos ficticios en el servidor de pruebas; ninguna captura se publica sin reemplazar los datos de las personas'],
    ['Póliza sin actualizar', 'Resuelto: anexo de modificación expedido por Seguros Mundial el 6-nov', 'Archivar el anexo con los soportes de desembolso y las actas del cierre'],
    ['Alcance que crece', 'Hombres, Estabilización y discapacidad en ideación', 'Sin diseño aprobado al inicio de su línea, pasan a evolución futura'],
    ['Reprocesos que consumen el cierre', '215 h de reprocesos en octubre, cerca del 42 % del esfuerzo de desarrollo', 'Se registran en la Bolsa 3 cada viernes; solo se corrige lo que bloquea una de las tres historias']
  ]
};