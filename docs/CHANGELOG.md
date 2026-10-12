# Cambios

## 2026-10-12 — Correcciones v5 de móvil, contraste y destacados

- Modo oscuro coherente en resultados fiscales, treemaps, pistas de barras, tablas, mapas y lecturas históricas; tinta de las celdas elegida por contraste sobre el fondo real. Se corrige también la anotación histórica en tema claro.
- Comparación interanual de ejecución bloqueada para Gabinete, Espacio Público, reorganizaciones documentadas y diferencias votado/ampliado superiores al 25%. Se retira el 264% de Gabinete; sólo Consejo de la Magistratura conserva esa lectura entre las fichas actuales.
- Selector móvil de tema con icono de 44 px y tres opciones accesibles; pestaña activa visible, índice de ficha breve y títulos de desplegables encima de sus descripciones. Último KPI ocupa toda la fila y se evitan cortes dentro de montos fiscales.
- Gastos en móvil abren con barras ordenadas; rectángulos permanecen seleccionables y la elección se conserva en la URL. Se corrige el renderizado recursivo de composiciones y el rótulo de conceptos menores.
- Auditoría automatizada de 51 rutas en claro/oscuro, 375/1440 px y desplegables cerrados/abiertos (408 estados), junto con la suite funcional existente. No cambian datos, fuentes, importes, homologaciones ni deflactores.

## 2026-10-12 — Móvil, temas y accesibilidad (PR 18)

- Vista previa pública por PR en `/preview/pr-N/`, con producción compilada desde `main` y comprobación de que su portada se conserva. Se retienen las otras vistas previas entre publicaciones; sólo se despliegan PR del propietario desde este repositorio.
- Navegación móvil en una fila desplazable, encabezado compacto que se oculta al bajar, selector de base plegado e índice de ficha fijo con controles de 44 px. Se elige la fila horizontal porque conserva los destinos visibles sin cubrir contenido con una barra inferior.
- Inicio con dos composiciones compactas y detalle desplegable. Fichas con monto principal a todo el ancho y secciones secundarias plegadas; el proyecto ajustado muestra también su equivalente nominal. Ingresos con nombres sobre las barras, comparación provincial neutra y lista inicial en móvil.
- Historia completa dentro del ancho móvil, etiquetas cada cinco años, unidad del eje y selector accesible de año. No cambian series, escalas ni ajustes de precios. Apariciones sin demora en móvil.
- Tokens centralizados y selector claro/oscuro/automático persistente, adaptación al sistema y color de navegador. Superficies, diagramas, ejes, mapas, foco y variaciones usan la paleta del tema; el mapa oscuro aclara los valores mayores.
- Espacios no separables para importes, diccionario de nombres para mostrar, tablas equivalentes de barras y anuncios de cambio de vista/base. Fecha de revisión generada al compilar.
- Destacados: base ampliada explícita en Gabinete/Espacio Público; gramática de proporciones extremas; Gestión Electoral reunida con transferencias de Justicia. Autódromo distingue el original 2026 (programa 88, PDF p. 18) del ampliado de junio, que proviene de ejecución. La frase general sobre personal se reemplaza por ejecución del mismo semestre de 2025 cuando existe correspondencia exacta de jurisdicción.
- Pruebas de 22 fichas × dos bases × dos temas × dos anchos, contraste AA de texto en las seis vistas de revisión y tokens, objetivos táctiles, texto al 200% a 320 px y preferencia automática. Entrega con 24 capturas antes/después; la versión anterior carecía de tema oscuro. Sin cambios en datos, montos, homologaciones, fuentes ni deflactores. PR sin fusionar hasta autorización.

## 2026-10-11 — Revisión integral de lectura ciudadana (PR 17)

- Vocabulario central y guía con enlaces estables: votado, ampliado, ejecutado, funcionamiento, inversión, transferencias y servicios contratados. Se conservan los nombres oficiales en fuentes y tooltips.
- Votado 2026 como base por defecto en las cuatro vistas de Proyecto 2027 y en Comparar CABA; ampliado a junio seleccionable. La base se conserva en la URL y entre vistas. Resumen muestra ambas tasas sin alterar el factor 1,18.
- Montos abreviados a primera vista, importes completos disponibles en desplegables o tooltips. Estimación con precios promedio anuales plegada. Proporciones pequeñas y casi completas identificadas sin aparentar cero o totalidad; intereses: 99,8% del saldo previo.
- Ingresos con barras ordenadas, nombres visibles, apertura de Ingresos Brutos y Sellos y agrupación inferior al 1%. En gastos, las composiciones que necesitarían códigos o rótulos ocultos ofrecen barras navegables.
- Cuenta fiscal con saldo final visible y pasos intermedios plegados en 2025, 2026 y 2027. Financiamiento distingue endeudamiento/otros pasivos de inversión financiera; no se denomina deuda nueva a todo el agregado.
- Comparación provincial con indicadores agrupados, sin indicadores por superficie y con advertencia de estacionalidad del primer trimestre. Se mantienen fechas y universos de empleo y ejecución separados.
- Destacados extremos sólo con continuidad funcional documentada y montos de ambas etapas; composición redactada en oraciones. Gestión Electoral incorpora el monto de la ficha financiera (Justicia, PDF p. 195), sin atribuirle toda la ampliación. Tesoro describe compromisos documentados (PDF p. 6); Tesoro y Deuda no usan la lectura de funcionamiento/inversión de los ministerios.
- Pruebas de bases independientes para siete aperturas, continuidad de selección, glosario, diagramas, barras y responsive; se conservan conciliaciones y revisión de 22 áreas por dos bases. No cambian datasets, montos, homologaciones, fuentes ni deflactores. Entrega en PR, sin publicación automática.

## 2026-10-11 — Áreas de Gobierno: destacados y lectura de las fichas

- Destacados con materialidad en pesos y peso del programa, cálculo compartido con el gráfico de movimientos y un máximo de cinco textos de 35 palabras en una columna; sin relleno ni bajas parciales de inversión que parezcan eliminar un programa.
- Encabezados, directorio y aperturas muestran montos nominales del proyecto. Variaciones reales con el supuesto vigente del 18%; equivalencia de 2026 identificada debajo del monto. Un único selector de base evita mezclar modos de precios.
- Gabinete y Espacio Público identifican el traspaso de funciones en tarjetas y primera lectura; composición y movimientos usan el ampliado para incorporar ese cambio. Justicia y Desarrollo Económico mantienen la causa de la ampliación por verificar.
- Comparación y mayores movimientos primero; composición fusionada en una barra apilada, incisos plegados, destinatarios documentados y financiamiento sustancial visible. Ocho unidades/programas iniciales, resto accesible. Directorio sin resumen repetido ni microtextos de composición.
- Variaciones con violeta y gris azulado en todas las vistas; se conservan los colores que identifican ingresos, egresos y saldos fiscales. Contraste AA y controles automáticos de las 44 variantes editoriales, además de pruebas de escritorio y móvil.
- Usa los datos cargados: no reextrae documentos ni cambia fuentes, importes, homologaciones o deflactores. Entrega en PR para revisión editorial, sin publicación automática.

## 2026-10-10 — Áreas de Gobierno completas y lectura consistente

- 22 fichas jurisdiccionales con 339 unidades y 499 programas fiscales: principales, financiación por programa, metas, cargos cuando están publicados, obras plurianuales y páginas de origen. Sumas conciliadas con Planilla 4.
- Base votada 2026 por defecto y opción ampliada a junio; elección conservada entre listado, fichas y recargas. Destacados y variaciones recalculados con la base, sin textos cacheados.
- Lectura separada de funcionamiento, inversión directa y transferencias; SBASE permanece con destino económico mixto sin desagregar. Servicios no personales y partidas principales visibles, sin inferir contratos ni empleados.
- Cambios de dependencia de Higiene Urbana documentados; ampliaciones de Justicia y Desarrollo Económico descritas sin atribuir causas no demostradas. Diferencias entre planillas identificadas; 224 comparaciones de programas permanecen por verificar, sin inferir creaciones ni eliminaciones.
- Porcentajes con una regla común en todo el sitio; datos y dinero sin redondear. Pruebas del sitio y de las 22 fichas con ambas bases, escritorio y 375 px.
- Mantiene 18% supuesto; no se encontró una tasa macro numérica verificable en el documento general revisado. Entrega en rama y PR, según decisión 16.


## 2026-10-09 — Recaudación histórica

- Última opción «Recaudación total» en el selector 1997–2027: recursos corrientes y de capital, sin endeudamiento, con el mismo ajuste por inflación de la historia del gasto.
- Recaudación efectiva hasta 2025 e ingresos previstos para 2026–2027 diferenciados; comparación 2005–2025, consulta por año, tabla y CSV. Se conservan los datos y escalas de gasto.

## 2026-10-09 — Áreas de Gobierno (propuesta en rama)

- Cuarta pestaña del Proyecto 2027: directorio de 22 jurisdicciones, búsqueda, tipos institucionales y fichas con URL propia.
- Infraestructura: 13 unidades y 27 programas, etapas 2026/2027, composición, financiamiento, cargos, obras y mayores movimientos en pesos comparables.
- Homologación documentada de recodificaciones y agrupaciones de funciones; antecedentes inciertos señalados sin inferir eliminaciones. Padrón 2026 integrado con alcance y sin duplicar personas.
- Importador reproducible de PDF, tablas accesibles y pruebas de datos, enlaces y pantallas móviles. Se conserva el buscador y su historial. Los PDF de trabajo no se publican.
- Entrega mediante Pull Request, sin publicación en producción en esta misión.


## 2026-10-09 — Composición y cambios reales del gasto y los ingresos

- Selector uniforme de finalidad y función, jurisdicciones, incisos y gasto corriente/capital en Gastos; cada rectángulo conserva su detalle navegable.
- Proyecto 2027: gráficos de variación real en Gastos e Ingresos frente al presupuesto vigente al 30/06/2026, con el supuesto del 18%. Aperturas conciliadas por funciones, jurisdicciones, incisos, finalidad, clasificación económica y origen de ingresos.
- Jurisdicción 31: Infraestructura y Movilidad e Infraestructura reunidas; no se representa el cambio de nombre como una desaparición y una creación.
- Ingresos: un único recuadro de impuestos a la producción con sus componentes visibles, colores verdes y porcentajes del total. Sin niveles repetidos de recuadros anidados.
- Comparaciones de ejecución: todas las funciones semestrales visibles; comparación anual comienza por finalidad/función y suma jurisdicciones.


## 2026-10-07 — Auditoría ciudadana y coherencia de lectura

- Presupuestos y partidas históricos de CABA usan los factores de la serie principal; originales y etapas conservados. Comparación 2027/2026 con el supuesto del 18% y escenario anual visible.
- Botones de portada diferenciados, Personal resaltado y treemaps con leyendas únicas. Fuentes públicas en el recorrido y metodología breve en ocho temas.
- Intereses, origen nacional de los recursos y proyectos separados visibles. Comparación provincial con presupuesto inicial opcional. Montos del período y valores actualizados por inflación rotulados.
- Signos y unidades consistentes, advertencia previa en comunas, aviso de carga, tarjetas móviles más compactas y fecha de revisión separada del corte de datos.
- Decisiones adoptadas, adaptadas y descartadas en AUDITORIA_CIUDADANA.md. Validación de datos, navegación, fuentes, enlaces, escritorio y móvil.


## 2026-10-07 — Gráficos abiertos y lectura ciudadana

- Resumen 2027 integra la comparación con 2026; quedan tres pestañas y los enlaces anteriores siguen funcionando. Cuenta fiscal visible para 2025, enero–junio 2026 y proyecto 2027: flujos proporcionales de ingresos, gastos de capital e intereses, cuatro saldos y financiamiento separado cuando está disponible.
- Historia: flecha anclada en los puntos 2005/2025; techo de 20 billones para total/corriente; nueva serie de capital con los mismos factores y base abril–junio 2026. Capital usa una escala de 5 billones para mantener legibilidad. No cambian nominales, deflactores ni etapas anteriores.
- Comparación bilateral visible: dos presupuestos anuales 2026, tres indicadores de enero–marzo 2026 (tributos propios, capital y saldo financiero como proporciones), y empleo público 2024. Historia provincial con cinco recorridos individuales y techo 250 en base 2005 = 100.
- Rectángulos mayores, navegación con un toque y detalle accesible. Cuando una categoría supera el 50%, se abre su interior sólo si los componentes están verificados y suman el total; porcentajes siempre sobre el total del gráfico. Ranking de variaciones e interanuales a la vista.
- Menús más legibles, sin «Estás en». Guía específica de presupuesto por habitante y metodología organizada por temas, con el detalle técnico opcional. No se equipara presupuesto per cápita a impuestos individuales.
- Obras: 309 proyectos del PDF oficial con componentes conciliados en 2027, 2028 y 2029. Nombres ampliados para lectura, originales conservados; detalle de cada componente y año. Constructor opcional desde el PDF con control de hash, sin publicarlo.
- Referencias externas tomadas como conceptos de lectura (cuenta visible y comparación), sin copiar textos, estética, cifras ni métodos de inflación. Se mantienen ocultos salarios y comparación internacional.
- Validación: conciliaciones de datos, enlaces antiguos, selección/recarga, interacción por teclado, cuenta fiscal y lectura móvil en 1440, 390 y 320 px; capturas de revisión.

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
