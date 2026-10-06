# Cambios

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
