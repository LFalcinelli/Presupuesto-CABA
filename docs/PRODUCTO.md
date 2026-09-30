# Producto y arquitectura

Explorador público de CABA dirigido a ciudadanos. Secciones existentes: Inicio; Explorar (resumen, gastos, ingresos, estructura, sueldos e historia); Comparar CABA con Argentina y el mundo; Presupuesto explicado; Fuentes y metodología.

Arquitectura preservada: HTML, CSS y JavaScript de navegador, sin backend ni framework. Los módulos históricos se conservan para reducir el riesgo de la migración. `experience.js` carga datos por demanda y controla las rutas hash; los demás módulos aportan cálculos y vistas.

`src/runtime.js` concentra el base path, el catálogo de recursos, la configuración y el contenido de portada. `scripts/build.mjs` copia sólo interfaz, configuración, contenido, datos públicos y assets a `dist/`. No descarga fuentes ni recalcula cifras.

`data/index.json` registra cada unidad de actualización. Las tablas fiscales detalladas conservan inicial, actualizado y devengado en una misma base por período, porque comparten filas y clasificaciones; nunca se mezclan con salarios o ingresos.

Las rutas `#inicio`, `#explorar`, `#gastos`, `#ingresos`, `#estructura`, `#sueldos`, `#evolucion`, `#comparar`, `#presupuesto-explicado`, `#metodologia` y `#detalle?...` conservan su comportamiento. La recarga usa siempre `index.html`.

La portada toma el período de `config/site.json`, las cifras de `currentBudgetFile` y los textos de `content/home.json`. Las comparaciones históricas mantienen sus propios períodos y fuentes.
