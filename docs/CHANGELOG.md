# Cambios

## 2026-10-06 — Revisión del deflactor de la historia principal

- Sólo la vista «30 años de gasto público»: IPCBA desde 2013, CIFRA original 2007–2012, empalme aportado antes de 2007 con puente documentado. El resultado total 2005–2025 pasa de +113,7% a +119,0%; no se conserva el +120,6% del cálculo provisorio sugerido.
- 2026 y 2027 también en la base abril–junio 2026: $19,30 y $19,27 billones estimados, usando IPCBA observado hasta agosto y supuestos diciembre/diciembre de 30% y 18%. Nominales publicados intactos; no se atribuye a datos observados el tramo proyectado.
- Selector recargable de gasto total/corriente sin intereses. 2026 corriente con precisión del mensaje; 2027 calculado desde la planilla exacta, sin redondear anticipadamente.
- Se retira la flecha desanclada y se destacan los puntos 2005/2025. Seguridad rotulada 2016–2017. No se confunden eventos de financiamiento con nuevas funciones del gobierno.
- JSON/CSV, constructor reproducible y pruebas de índices, proyecciones, universos y navegación. USD histórico y metodologías de otras vistas preservados. Sustituye el criterio nominal 2027 de la entrada anterior.
- La primera lectura del enlace espera a que terminen los módulos de la interfaz; corrige una carrera de carga detectada al recargar Inicio con una selección del mapa.

## 2026-10-06 — Portada, gráficos y evolución histórica

- Mapa interactivo completo trasladado a Inicio, entre el bloque de cifras y las preguntas. Sus selecciones, ramas y unidad de lectura conservan enlaces recargables desde #inicio.
- Hero: aproximación «≈ $24,1 billones de pesos» principal; importe exacto secundario. Botón «Presupuesto GCBA 2027», descripción continua en escritorio y espaciado ajustado.
- Períodos destacados; cuatro entradas principales conservadas. Sólo en Evolución se retiran ubicación y explicación de precios repetidas.
- Historia: 31 observaciones, eje hasta 25 billones, curvas sin nuevos extremos, marcadores mayores y tramos punteados 1997–1998 y 2025–2026–2027. Hitos del Subte (2013) y funciones de seguridad (2016) dentro del gráfico. Se corrige la referencia del Subte a Ley 4472, artículos 2 y 76.
- Comparación 2005–2025: +113,7% de gasto ejecutado real, calculado con los factores existentes. Valores originales contrastados con SP_Fi_AX01, celdas L28 y AF28, expresadas en millones. Reemplaza la lectura 2015–2025 (+9,9%), sin corregir ni cambiar los datos o deflactores. 1997 conserva su diferencia contable; 2025 es provisorio; 2026 es presupuesto; 2027 continúa como referencia nominal separada.
- Contraste USD 2005–2026 más visible: totales, barras por finalidad con acceso a funciones y alternativa por objeto. Tablas y método completos disponibles. No cambia A3500, inflación estadounidense ni etapas comparadas; no se presenta como poder de compra local.
- Gastos 2027: composición antes del buscador; Servicios Sociales muestra ocho funciones desde el inicio, con tonos relacionados y detalle al pulsar. Deuda conserva una etiqueta legible y acceso al detalle.
- Deslizamientos suaves con soporte de movimiento reducido. Curvas de líneas preservan cada observación y los cortes de cobertura. Los detalles de gráficos acompañan al elemento enfocado con teclado durante el desplazamiento; Escape los cierra.
- La publicación anterior en ChatGPT Sites se restringió al propietario mediante acceso custom, sin invitados ni grupos. GitHub Pages sigue como publicación de trabajo.


## 2026-10-05 — Lectura ciudadana y comparación bilateral

- Inicio organizado desde preguntas, con una única entrada principal al mapa fiscal. Se mantienen visibles el déficit 2025 y el menor superávit semestral como proporción de los ingresos.
- Resumen fiscal con saldo destacado, dos barras de ingresos/gastos y una sola cuenta detallada; perspectiva semestral expresada por cada $100 ingresados, con iguales períodos y sin confundir superávit con déficit.
- Comparación CABA/provincia en dos columnas centradas, siluetas oficiales y selector. Presupuesto 2026, ejecución 2025 y puestos públicos 2024 separados, con todos los indicadores disponibles bajo demanda.
- Navegación móvil con selector de período, pestañas pertinentes y orientación; adaptación de importes completos a 320 px, textos largos y etiquetas visibles para rectángulos pequeños. Historia con lectura de diez años descontando inflación y términos más claros.
- Cifras, fuentes, denominadores y ajuste estimado IPC 18% conservados. Sueldos y comparación internacional siguen ocultos. Evaluación y descartes fundamentados en `docs/REVISION_COMUNICACION.md`.

## 2026-10-05 — Mapa fiscal y lectura del Proyecto 2027

- Mapa propio de ingresos → caja común → destinos, integrado en Resumen; cuatro perspectivas, expansión progresiva, lectura por cada $100, cifras completas y fuente al seleccionar. Colores distintos para ingresos y destinos, versión vertical móvil y detalle inferior que se puede cerrar.
- Tres etapas del presupuesto: 2026 inicial, actualizado a junio y proyecto 2027. La comparación permite elegir las dos bases de 2026 y mantiene el ajuste estimado con el supuesto de inflación del 18% definido por el usuario.
- Explicación del margen financiero proyectado y ventana con el paso a paso de la CAIF. Explorador de los 309 proyectos de inversión oficiales, búsqueda, filtros y previsiones 2027–2029 en ventanas de detalle.
- Bonos para proveedores, Belgrano Sur y emergencia hídrica presentados por separado, sin sumar autorizaciones al mapa ni incorporar cambios tributarios.
- Nuevos datasets conciliados y trazabilidad por página; importador reproducible y pruebas de jerarquía, conexiones, etapas, obras, enlaces profundos y cuatro anchos de pantalla. Corrección de una actualización responsive demorada al cambiar de vista.
- Evaluación selectiva del master R1–R12 y motivos de los descartes en `docs/ITERACION_MAPA_2027.md`. Se conserva el diseño y la arquitectura propios, sin tomar textos, código ni datasets del sitio de referencia.

## 2026-10-05 — Conducción, comparación provincial y portada

- Sueldos de funcionarios y CABA en el mundo quedan ocultos por configuración. Se retiran sus pestañas, botones, referencias y enlaces de metodología; las rutas antiguas conducen a Estructura del Gobierno o a la comparación provincial. Se conservan los datos para una futura reactivación.
- Conducción trasladada a Estructura del Gobierno: 10 ministros, 18 secretarios, 82 subsecretarios, 344 directores generales, 932 gerentes operativos y 855 subgerentes. Nuevo export de cantidades sin remuneraciones, con el corte y sus límites; no se confunden esos seis niveles con el padrón general de 2.595 personas.
- Listados de responsables bajo demanda y navegación por dependencias con foco en el nivel elegido. Se retiran los desplegables que repetían exactamente el gráfico de personas.
- Comparación provincial con una sola entrada, controles y nombres más claros, mapa con selección persistente, ficha breve y sin la comparación de CABA consigo misma. Historia de gasto real en primer plano; composición, otros indicadores y fuentes bajo demanda.
- Inicio: déficit 2025 de $281.525.677.404 destacado, junto al 2,1% de los ingresos; primeros semestres comparados por cada $100 ingresados ($20,1 / $14,3 / $11,4). Se aclara que los tres tuvieron superávit y que en pesos corrientes el saldo creció. Importes, universos, períodos y deflactores sin cambios.
- Validación: 53 datasets, 34 vistas en escritorio/móvil, interacción de listados, Resto y dependencias, selección provincial e indicadores históricos; revisión adicional a 320 y 768 px. Sin errores de navegador ni desbordamiento horizontal.

## 2026-10-01 — Arquitectura visual y UX final · revisión por PR

- Hero unificado con Proyecto 2027 protagonista, importe completo, monto por porteño y presupuesto 2026 secundario; sin duplicar el inicio editorial.
- Cuatro destinos principales, metodología por dominio y período de cierre con sólo sus pestañas pertinentes. Tablas, fórmulas y alcance bajo demanda.
- Componente de puntos conectados para porcentaje real y cambio real en pesos, escalas adaptativas y tooltip compartido con teclado y toque. Montserrat y treemaps existentes conservados.
- Historia 1997–2027: valores y factores 1997–2026 intactos; 2027* nominal, sin deflactar, separado con diamante y conexión punteada. Advertencia visible y enlaces normativos oficiales para los hitos.
- Capa CSS del proyecto consolidada, navegación blanca sticky, pestañas móviles horizontales y movimiento reducido. Sin framework ni biblioteca nueva.
- Revisión dirigida en cuatro anchos y siete capturas locales; controles de conciliación, navegación y descargas ampliados. Documento breve `FINAL_UX_REVIEW.md`.
- Rama `feature/final-visual-ux-2027`: no modificar `main`, fusionar ni publicar; entrega para revisión humana.

## 2026-10-01 — Comparación real estimada y publicación

- IPC diciembre/diciembre 2027 de 18,0%, indicado por el usuario, aplicado con factor 1,18 a la comparación de autorizaciones anuales. Se identifica como proyección y aproximación, con procedencia documentada.
- Vista real estimada por defecto, selector nominal/real y enlaces que conservan la elección. Aumento total: +21,2% nominal / +2,7% real estimado.
- Importes oficiales, portada y ejecución preservados. Script reproducible y controles de conciliación de los valores ajustados.
- Configuración, contenido y datasets cargados con la versión del build, para evitar conservar datos anteriores en caché tras una publicación.
- El usuario autoriza publicar en GitHub Pages el Proyecto 2027 con este ajuste, mediante merge del PR validado.

## 2026-10-01 — Proyecto de Presupuesto 2027 y lectura bajo demanda

- Incorporación del documento oficial PDLEY-2026-36: total del artículo 1 conciliado con CAIF y clasificaciones, sin sumar figurativas, aplicaciones financieras ni proyectos externos.
- Proyecto 2027 separado de Avance 2026: Resumen, Gastos, Ingresos y comparación nominal con el presupuesto actualizado 2026. Configuración de presupuesto destacado independiente de la ejecución.
- Portada con presupuesto 2026, gasto solicitado 2027 y monto 2027 por habitante; ejecución reciente y resultado fiscal 2025 conservados.
- Metodología indexada por dominio; mapa provincial antes de las explicaciones extensas, barras internacionales más legibles y treemaps con paleta violeta sobria.
- Sueldos: pieza compacta con último bruto ordinario de Jorge Macri y referencia presidencial verificados; conducción y registro mensual conservados. Historial disponible para descarga, sin gráfico ni foto en la vista.
- Datos originales 2026 e históricos preservados. No se incorporan cambios tributarios ni los proyectos separados de deuda o emergencia.
- Desarrollo en `feature/proyecto-presupuesto-2027`, mediante PR: sin merge ni publicación a producción.

## 2026-09-30 — Migración a GitHub Pages

- Snapshot recuperable del estado publicado: commit de origen `723750b831d28fec95932a5e137f2c45e158fda3`; etiqueta local `pre-github-migration-2026-09-30`.
- Interfaz en `src/`, datos por dominio en `data/`, configuración central y textos de portada separados.
- Catálogo liviano de datasets y documentación canónica para Codex y Claude.
- Construcción reproducible con Node, dependencias declaradas y publicación automática desde `main`.
- Resolución centralizada de assets/datasets bajo el subpath de GitHub Pages.
- Sin modificaciones de cifras, metodología, diseño ni navegación del producto.

## 2026-09-22 — Estado de producto preservado

- Portada fiscal, inicial versus ejecutado, historia oficial 1997–2026 y navegación por el padrón de autoridades.
- Este registro resume el snapshot; no importa los documentos internos de iteraciones anteriores.

## 05/10/2026 · Mini informes por área en Proyecto 2027

- Buscador en Resumen y Gastos: ministerios, hospitales y otras unidades; ventana de informe y enlace compartible.
- 22 áreas con presupuesto 2027/2026, lectura por encima/debajo de inflación proyectada (18%), composición y partidas. 394 unidades de 2026 con presupuesto propio e historial, sin inventar la apertura 2027 que falta.
- Historial 2013–2025 con factores IPCBA existentes, selector anual, huecos de identidad y etapas separadas. No se infiere cantidad de empleados ni contratos.
- Validación independiente de todos los importes y años; búsqueda, teclado, recarga de enlaces y móvil en 1440/390/320 px.
