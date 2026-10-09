# Metodología canónica

La migración del 30/09/2026 no cambia cifras ni criterios. La metadata de cada dataset conserva fuente, unidades, corte, factores, notas y limitaciones particulares.

## Lectura incorporada el 07/10/2026

- El diagrama fiscal reparte flujos de la misma cuenta y período. Los resultados económicos, primario y financiero son saldos, no flujos adicionales. Si hay déficit, la diferencia se rotula «Faltante de ingresos» sin atribuirle una fuente de financiamiento no disponible. Los intereses se muestran una sola vez, aparte del gasto corriente sin intereses.
- La comparación bilateral distingue presupuestos anuales 2026 de resultados enero–marzo 2026 y puestos públicos 2024. Tributos propios / ingresos corrientes, capital / gasto total y saldo financiero / ingresos totales son proporciones del trimestre. Empleo: puestos / población × 1.000; no equivale a cargos políticos.
- Capital histórico: concepto 5 de SP_Fi_AX01, millones convertidos a pesos. 2026: cuadro 5.1 del Mensaje 2027, $4.033.207.400.000, precisión $100.000; 2027: artículo 1, $4.325.717.119.862. Mismos factores de precios que el total y el corriente; excluye amortización de deuda.
- Nombres de obras ampliados sólo con denominaciones completas de componentes, contexto del programa y expansiones documentadas. El detalle conserva el nombre original y distingue los componentes: el proyecto Línea F incluye construcción e ingeniería, no se atribuye todo el importe a ingeniería. No se interpretan montos multianuales nominales como crecimiento real.

## Universo y etapas

- CABA: Administración Gubernamental (central y descentralizada). Gasto corriente y de capital; figurativas y aplicaciones financieras separadas.
- Presupuesto inicial: autorización original. Presupuesto actualizado: autorización al corte. Gasto ejecutado: devengado; incluye pagos pendientes.
- Fotografía 2026: presupuesto al 30/06/2026 de $19.877.152.039.294 y gasto enero–junio de $7.104.105.890.576,16, en pesos nominales oficiales.
- Comparación “lo votado y lo gastado”: devengado / inicial del mismo año y universo. En 2026, el numerador es semestral y el inicial anual. No representa crecimiento real.
- Resultado financiero: ingresos corrientes y de capital menos gastos corrientes y de capital, con intereses. No sumar financiamiento o aplicaciones financieras.
- Cierre 2025: cifras provisorias del informe anual; no presentarlas como cifras definitivas sin nueva fuente.

## Proyecto 2027

- Documento único: `3083 - PDLEY 36 - MJE 42 (Presupuesto 2027).pdf`, PDLEY-2026-36-GCABA-AJG, fechado 30/09/2026. Estado `project`; no aprobado ni ejecutado. Importes nominales de 2027.
- Artículo 1 / Planilla 16: $19.768.623.479.401 corrientes + $4.325.717.119.862 capital = $24.094.340.599.263 de gasto fiscal. Coincide exactamente con el total legal: no se parte de un agregado con financiamiento para depurarlo.
- Recursos $24.095.657.042.129; resultado financiero proyectado +$1.316.442.866. Figurativas $1.728.685.077.476 y aplicaciones financieras $919.674.000.329 separadas. Fuentes financieras + resultado financiero = aplicaciones financieras.
- La CAIF denomina su ahorro antes de intereses “Resultado económico primario”. El resultado económico con intereses es un cálculo separado. El inciso Servicio de la deuda incluye comisiones; no es idéntico a Intereses de la CAIF.
- Por habitante: gasto fiscal / 3.121.707, población definitiva Censo 2022 ya usada en 2026; $7.718.322 al redondear a pesos. Identificado como cálculo propio.
- Comparar con 2026: autorizaciones anuales del mismo universo (corrientes + capital), $19.877.152.039.294 actualizado al 30/06/2026 frente al proyecto 2027. Aperturas conciliadas por finalidad y código de objeto. Lectura nominal y lectura real estimada; esta última aplica el IPC proyectado diciembre/diciembre 2027 de 18,0% indicado por el usuario el 01/10/2026. Fórmula: (2027 / 2026 / 1,18 − 1) × 100. Aumento total: 21,2163% nominal y 2,7256% real estimado. 2026 todavía puede modificarse.
- El 18,0% se registra como supuesto aportado por el usuario, con factor 1,18 y procedencia explícita; no se le asigna una página del PDF no verificada. IPC diciembre/diciembre se usa como aproximación para presupuestos anuales: no es inflación promedio anual ni observada. No se actualizan con él historia, rankings provinciales o comparaciones internacionales. Los importes originales, la portada y las vistas de gasto/ingresos conservan pesos nominales publicados.
- Las autorizaciones propias de la Planilla 43 se conservan por separado, sin sumarlas nuevamente al gasto o a las fuentes. Código Fiscal, Impositiva, Arancelaria y proyectos externos de endeudamiento o emergencia quedan fuera del alcance. Las remisiones del propio documento se registran como límites, sin inferir cambios legales.
- Trazabilidad: archivo, SHA-256, página física del PDF (297 páginas), artículo/planilla, estado, unidad, universo y fórmula. No se publica el PDF aportado. URL oficial exacta pendiente; aperturas completas de programas no disponibles en el dataset agregado.

## Informes por área · Proyecto 2027

- 22 jurisdicciones: Planilla 4 (página física 173), conciliada por nombre, código oficial y total contra el detalle 2026. Composición en ocho objetos; comparación anual con el presupuesto al 30/06/2026 y factor proyectado 1,18.
- 394 unidades de la base 2026: se conserva el historial y su presupuesto propio. El detalle jurisdiccional 2027 se importa progresivamente y se enlaza mediante `detail2027`; no se hereda el presupuesto del ministerio. Infraestructura dispone de 13 unidades y 27 programas conciliados con Planilla 4. Las demás fichas conservan sus agregados verificados.
- Historial 2013–2025: sólo gasto fiscal devengado anual del mismo nombre normalizado, misma jurisdicción y código completo. Se conservan los factores IPCBA del detalle existente (factors.d), con base abril–junio 2026. No se recalculan con el 18,0% proyectado ni se mezclan con la serie principal empalmada nacional/provincial.
- Los años sin identidad verificada quedan vacíos; no se trazan conexiones a través de ellos. Coincidencia de código/nombre no garantiza igual alcance después de reorganizaciones: se advierte al lector. No se infieren empleados, crecimiento de planta ni número de contratos a partir de importes.
- Dataset agregado: `data/budget/2027/area-reports.json`; detalle: `data/budget/2027/areas/<código>.json`; homologaciones revisadas: `data/budget/2027/area-reviews/<código>.json`. Reconstrucción: `scripts/build-area-reports-2027.py` y luego `scripts/import-government-areas.py`, con los PDF fuera del repositorio.
- Sancionado (`s`), vigente (`v`) y devengado (`d`) provienen del archivo oficial 2026-2, filtrado por gasto fiscal. El PDF jurisdiccional 2026 es el proyecto original: sirve para funciones y antecedentes, no reemplaza el vigente. En el piloto su total coincide con el sancionado, pero son fuentes distintas. La ejecución a junio es parcial y se presenta separada de las autorizaciones anuales.
- Homologación de Infraestructura: 35→85 y 37→87; el programa 75 de 2027 agrupa 75/76/77/78 de 2026; el 60 agrupa 60/67/61/62; el 63 agrupa 63/68. Se revisaron funciones y se conservan descripciones, páginas y decisiones. Las sumas de antecedentes se usan una sola vez. El programa 28 existe en el vigente de junio, aunque no está en el proyecto original; su continuidad funcional y la del 79 quedan pendientes. No se deducen creaciones o eliminaciones del cambio de códigos.
- Comparaciones de unidades cuyo perímetro cambia: la diferencia entre partidas se conserva en la tabla con advertencia, no como variación del mismo servicio. Los cinco aumentos/reducciones se ordenan por pesos comparables; un saldo pendiente conserva la conciliación de la variación total. El selector permite base sancionada o vigente y pesos originales o 2027 dividido por 1,18.
- Padrón: se asignan sólo raíces ministeriales/organismos inequívocos y sus descendientes, deduplicando índices de personas. La Jefatura de Gobierno/Vicejefatura y otros poderes quedan sin asignación hasta verificar el perímetro. Padrón 2026, revisado 22/09/2026; corte exacto no publicado. No se traslada el corte del cuadro de conducción de julio al padrón general. Cargos presupuestados y funcionarios son medidas diferentes; el cuadro 2027 de Infraestructura incluye 911 cargos con exclusiones expresas, no la dotación completa.
- Fuentes de financiamiento: códigos y montos de la planilla jurisdiccional, sin sumarlos nuevamente al gasto. Etiquetas contrastadas con el clasificador oficial publicado por GCBA. La ficha financiera de Subterráneos omite el título del inciso 3 y la de Actividades Comunes de Transporte omite el del inciso 2: se clasifican exclusivamente principales explícitos, sin imputar residuos; cada inciso concilia con Planilla 4. Se conserva la nota por programa.
- La apertura corriente/capital 2027 por jurisdicción no se deduce de incisos: transferencias y activos pueden tener tratamientos distintos. Se incorpora sólo cuando exista clasificación económica oficial suficiente.

## Precios e historia

- Detalles históricos, ingresos y sueldos conservan sus factores IPCBA y las notas de cada vista.
- Historia principal: serie IDECBA basada en Cuentas de Inversión, gasto total y gasto corriente sin intereses 1997–2025. Conceptos 10) y 2) del cuadro SP_Fi_AX01 (filas físicas 28 y 9), millones convertidos a pesos. Hasta 1997 se conserva “etapa definitiva”; desde 1998, devengado. 2025 es provisorio. El gasto corriente del cuadro excluye intereses, que están en un renglón separado.
- Recaudación total, incorporada el 09/10/2026: concepto 6) Recursos totales (1+4), fila física 24 del mismo cuadro, 1997–2025; ingresos corrientes más recursos de capital, sin figurativas ni fuentes financieras. No equivale sólo a impuestos. 2026 usa los recursos vigentes de `income-2026-2.total.v`: $19.881.406.042.845, no la recaudación parcial del semestre. 2027 usa los recursos previstos de Planilla 16, página PDF 190: $24.095.657.042.129. Estos dos puntos son estimaciones presupuestarias, no recaudación efectiva. Se aplican exactamente los factores anuales de la historia del gasto. La salvedad contable de 1997 y los hitos de traspaso de funciones corresponden al gasto y no se trasladan a la recaudación.
- Revisión autorizada 06/10/2026, sólo para esta historia: IPCBA medio anual desde 2013; IPC-Provincias CIFRA 2007–2012 por cocientes de promedios anuales, anclado en IPCBA promedio 2013. El índice base es IPCBA abril–junio 2026 = 2.434,4066667. La serie CIFRA se descargó y verificó desde su propio sitio; no se le atribuye el Excel de nueve provincias aportado.
- Para 1997–2006 se conservan las variaciones de promedios del empalme aportado. CIFRA empieza en enero 2007: no permite calcular por sí solo el puente anual 2006–2007. Ese único enlace usa los promedios 2006 y 2007 del archivo aportado; se conservan valores, celdas y hash. El tramo anterior no se presenta como un IPCBA oficial observado.
- Autorizaciones 2026 y 2027: presupuestos originales $19.877.152.039.294 y $24.094.340.599.263, sin cambio. Se conserva IPCBA observado hasta agosto 2026; se proyectan septiembre–diciembre con tasa mensual constante que lleva diciembre a 1,30 veces diciembre 2025, y los doce meses de 2027 con tasa que lleva diciembre a 1,18 veces diciembre 2026. Son supuestos de escenario autorizados, no inflación observada. Factor = IPCBA base / promedio enero–diciembre observado/proyectado. Valores reales estimados: $19,30093 y $19,27218 billones. No equivalen a ejecución ni certifican que el gasto vaya a ser ése. La comparación específica 2027 vs 2026 mantiene su factor 1,18 y responde a otra aproximación.
- Gasto corriente sin intereses 2026: $15.565.399.800.000 del mensaje 2027, cuadro 5.1, página PDF 157, publicado en millones con un decimal. 2027: corrientes exactos $19.768.623.479.401 menos intereses $591.887.305.621 = $19.176.736.173.780. El importe de Claude $19.176.736.200.000 reproduce el cuadro redondeado, no la precisión de la planilla. No sumar leyes o proyectos separados.
- Variación 2005–2025 calculada desde los datos de cada serie; gasto total +118,9977%. No se fija el resultado en el componente. La flecha está anclada en las coordenadas de datos de ambos puntos, sin cambiar sus valores.
- Vistas históricas adicionales de presupuesto 2005–2026 conservan su criterio inicial hasta 2012 y actualizado al cierre desde 2013. Desde la auditoría autorizada el 07/10/2026, sus factores se alinean con execution-history: mismo IPCBA/CIFRA, base abril–junio 2026 y supuesto anual 2026 de 30%. Nominales y etapas se conservan. El REM anterior queda como referencia histórica superada, no como ajuste activo.
- Comparación histórica en USD: TC oficial por período y ajuste por CPI-U de EE.UU.; no es PPA. Conservar las diferencias respecto de la serie principal.
- Subte 2013 y transferencia policial 2016–2017 son hitos de cobertura, sin atribuirles automáticamente todo el cambio del gasto. Convenio policial en 2016; operación de la Policía de la Ciudad desde enero 2017. Los cambios de coparticipación no se agregan como cambios de funciones en este gráfico.

## Denominadores y comparaciones

- Población nacional: resultados definitivos del Censo 2022; CABA 3.121.707 según la edición GCBA/INDEC ya incorporada. No mezclar con proyecciones dentro del ranking.
- USD oficiales CABA: A3500 BCRA al 30/06/2026, 1.483,0198 ARS/USD; presupuesto nominal / TC / población censal.
- Ciudades internacionales: presupuesto, moneda, censo con año e institución identificados. Conservar sus diferencias de cobertura y fuentes oficiales.
- PPA permanece oculto mientras falten factores homogéneos verificados.
- Salarios: bruto publicado, aguinaldo condicional; no publicar CUIL ni identificadores personales.
- Pieza salarial compacta: recurso GCBA 2026 verificado el 30/09/2026, último mes julio, Jorge Macri $12.474.468,49 sin SAC. Referencia presidencial bruta ordinaria $4.066.018, Informe 142 pregunta 938, páginas 726–727; Decreto 931/2025 artículos 2–3 excluye Presidente/Vice de recomposiciones. Cociente nominal de dos brutos ordinarios sin SAC: 3,07. Se conserva el total presidencial publicado, cuyos componentes redondeados difieren en un peso.
- Padrón de gobierno: conteo de personas únicas en el archivo aportado, no de nodos. La categoría “activo” refleja el archivo; no certifica presencia individual hoy.

Los faltantes se mantienen como faltantes. No cambiar estos criterios sin autorización del dueño. La auditoría ciudadana autorizada el 07/10/2026 extiende los factores de la historia principal a las vistas adicionales de presupuestos de CABA; la comparación provincial conserva su índice común.

## Aclaraciones de la auditoría ciudadana

- +2,7% usa el supuesto de inflación elegido de 18%, sin atribuirle una página no verificada del Mensaje. El escenario anual de la historia da −0,15%; se muestran juntos y se explican sus precios distintos.
- Recursos de origen nacional: coparticipación federal más todas las transferencias nacionales previstas = $5.049.595.915.829. La causa CSJN forma parte de estas últimas; no se suma otra vez.
- Partida de deuda menos intereses = otros costos financieros. No se confunde la finalidad completa con los intereses de la cuenta fiscal.
- Presupuesto inicial opcional para CABA en mapa, lista y comparación bilateral. Los demás presupuestos conservan el estado aprobado o prorrogado verificado.
- La serie IDECBA y las publicaciones trimestrales pueden contener diferencias de revisión y alcance. Se conservan sus originales; no se fuerza equivalencia para 2018/2024 sin cotejo de esas diferencias.


### Aperturas comparables y cambio de nombre de Infraestructura (09/10/2026)

El selector de composición agrupa exclusivamente filas fiscales del período: finalidad/función, jurisdicción, inciso o códigos económicos 21 (corriente) y 22 (capital). En cierres anuales se muestra devengado; en el avance, presupuesto vigente. El clic conserva la clasificación y el período.

Las comparaciones 2027/2026 de funciones se concilian por denominación oficial, normalizando acentos y mayúsculas. Los identificadores de las filas del PDF 2027 no se interpretan como códigos oficiales 2026. Las jurisdicciones se vinculan con los códigos verificados de los informes por área; la jurisdicción 31 es Infraestructura en 2025 y Movilidad e Infraestructura en 2026–2027. El primer semestre conserva las dos filas de referencia originales en sourceRows y reúne sus importes sin modificar el factor IPCBA. Otros traspasos de competencias no se suponen equivalentes.

Ingresos 2027/2026: Planillas 11 y 16 frente a la columna de presupuesto vigente del informe de recursos de junio 2026, excluyendo figurativas y fuentes financieras. Se vinculan las seis clases de recursos y los cuatro grupos tributarios; sus agregados concilian con los totales propios de ingresos, que son distintos del total de gastos. Fórmula real estimada: (proyecto 2027 / vigente 2026 / 1,18 − 1) × 100. No se usa lo recaudado en seis meses como base de un presupuesto anual.

El recuadro de producción incluye Ingresos Brutos, Sellos, energía eléctrica y contribuciones especiales/ferroviarias según cada informe. Se desagrega una vez; cada participación mantiene el denominador del gráfico, sin sumar padres e hijos como partidas diferentes. Reconstrucción: scripts/build-composition-comparisons.py.
