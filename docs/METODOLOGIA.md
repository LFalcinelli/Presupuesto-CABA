# Metodología canónica

La migración del 30/09/2026 no cambia cifras ni criterios. La metadata de cada dataset conserva fuente, unidades, corte, factores, notas y limitaciones particulares.

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

## Precios e historia

- Detalles históricos, ingresos y sueldos conservan sus factores IPCBA y las notas de cada vista.
- Historia principal: serie IDECBA basada en Cuentas de Inversión, gasto total 1997–2025. Hasta 1997 se conserva “etapa definitiva”; desde 1998, devengado. El punto 2026 es presupuesto y permanece separado.
- Historia principal a precios del promedio abril–junio 2026, usando el empalme nacional/provincial existente. No recalcular en esta migración.
- Vistas históricas adicionales de presupuesto 2005–2026 conservan su criterio inicial hasta 2012 y actualizado al cierre desde 2013. Sus notas explican el tratamiento de 2026 y REM.
- Comparación histórica en USD: TC oficial por período y ajuste por CPI-U de EE.UU.; no es PPA. Conservar las diferencias respecto de la serie principal.
- Subte 2013 y transferencia policial 2016 son hitos de cobertura, sin atribuirles automáticamente todo el cambio del gasto.

## Denominadores y comparaciones

- Población nacional: resultados definitivos del Censo 2022; CABA 3.121.707 según la edición GCBA/INDEC ya incorporada. No mezclar con proyecciones dentro del ranking.
- USD oficiales CABA: A3500 BCRA al 30/06/2026, 1.483,0198 ARS/USD; presupuesto nominal / TC / población censal.
- Ciudades internacionales: presupuesto, moneda, censo con año e institución identificados. Conservar sus diferencias de cobertura y fuentes oficiales.
- PPA permanece oculto mientras falten factores homogéneos verificados.
- Salarios: bruto publicado, aguinaldo condicional; no publicar CUIL ni identificadores personales.
- Pieza salarial compacta: recurso GCBA 2026 verificado el 30/09/2026, último mes julio, Jorge Macri $12.474.468,49 sin SAC. Referencia presidencial bruta ordinaria $4.066.018, Informe 142 pregunta 938, páginas 726–727; Decreto 931/2025 artículos 2–3 excluye Presidente/Vice de recomposiciones. Cociente nominal de dos brutos ordinarios sin SAC: 3,07. Se conserva el total presidencial publicado, cuyos componentes redondeados difieren en un peso.
- Padrón de gobierno: conteo de personas únicas en el archivo aportado, no de nodos. La categoría “activo” refleja el archivo; no certifica presencia individual hoy.

Los faltantes se mantienen como faltantes. No cambiar estos criterios sin autorización del dueño.
