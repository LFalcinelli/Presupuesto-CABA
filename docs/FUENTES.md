# Fuentes oficiales

Revisión de la historia principal, 06/10/2026: [IPC Provincias — CIFRA](https://centrocifra.org.ar/estadisticas/ipc-provincias/), [serie original 2007–2018](https://centrocifra.org.ar/wp-content/uploads/2023/08/IPC-Provincias-2007-2018.xlsx) y [nota metodológica](https://centrocifra.org.ar/wp-content/uploads/2023/08/Nota-metodologica-IPC-Provincias.pdf). Promedios 2007–2013 y hash retenidos en `execution-history.json`. IPCBA: descarga oficial empalmada ya disponible en `public/sources/IPCBA-serie-empalmada.xlsx`, contrastada con `data/history/ipcba.csv`; último mes observado agosto 2026. Policía: [GCBA, sistema de seguridad desde enero 2017](https://buenosaires.gob.ar/gcaba_historico/noticias/asi-funciona-el-sistema-integral-de-seguridad-publica). Presupuestos corrientes 2026/2027: mensaje del proyecto 2027, cuadro 5.1, página PDF 157; 2027 exacto calculado en planilla 7. Fuentes y limitación del enlace anterior a 2007 se documentan en metodología.

La migración del 30/09/2026 conserva fuentes y cifras previamente verificadas. Las fechas de consulta originales están en cada dataset; la migración no equivale a una actualización estadística.

## Proyecto 2027 y referencia salarial

- Lecturas de toda la Ciudad (v7 Parte B): ejecución por área desde los datasets fiscales 2025-4, 2025-2 y 2026-2; aperturas desde 2013-4 a 2025-4 y las 22 fichas jurisdiccionales 2027. Servicios: `2026.02 - Ejecución Presupuestaria.xlsx`, hoja `BASE 2T Gestion 2026`, SHA-256 `aed96a5f4085484d75fb56792cd4390d4eb74b12f8709452ad0d4ab585496c51`, columnas Sanción/Vigente_Trim2_CONT, inciso 3 y economía 21/22; fichas financieras jurisdiccionales 2027 por programa/principal. Transferencias y actividades centrales/comunes: mismas fichas 2027, archivos, hashes y páginas retenidos por registro en `budget-depth.json` y descarga. Cargos 2026/2027: cuadros “Cantidad de Cargos por Unidad Ejecutora” de cada documento jurisdiccional; incluye páginas/exclusiones, sin atribuirles cobertura total de empleo público. Se contrastaron visualmente Movilidad e Infraestructura 2026 p.15 y Salud 2026 p.24; cada fila se concilia con sus escalafones.
- Intereses/ingresos corrientes 2013–2025: `serie-aif-idecba.xlsx`, SP_Fi_AX01, filas 27/3, millones convertidos a pesos; celdas retenidas. 2026: código económico 21410000 vigente e ingresos corrientes vigentes del informe de recursos 2026-2. 2027: Planilla 16, PDF p.190. Stock de deuda: Cuadro 2.7 del mensaje 2027, PDF p.68 (impresa 57), columna 30/09/2026 Prov.: total US$1.994,6 millones; subtotal directo US$1.954,2 millones e indirecto AUSA US$40,3 millones. Se conserva el total publicado; diferencia de US$0,1 millones por redondeo. Dólares al tipo de cambio de cierre, sin conversión propia a pesos. Mismo SHA-256 del documento oficial 2027 indicado abajo. Los proyectos complementarios conservan sus fuentes y no se agregan a estas cifras.

- Fuente única 2027: `3083 - PDLEY 36 - MJE 42 (Presupuesto 2027).pdf`, PDLEY-2026-36-GCABA-AJG / MJE-2026-42, 30/09/2026. SHA-256 `feb7581d738222e3b2a14dab1558f820c027efb7131087c2a69edff8f722513b`. Archivo oficial aportado, 297 páginas físicas; no se copia al repositorio público. URL exacta pendiente, sin sustituirla por fuentes externas.
- Referencias físicas: artículo 1 y figurativas p.3; recursos/financiamiento p.4; marco macroeconómico p.31–32; objetos Planilla 4 p.173; finalidad/función Planilla 5 p.174; jurisdicciones Planilla 6 p.175; tributos estimados Planilla 11 p.183; CAIF Planilla 16 p.190; autorizaciones propias Planilla 43 p.237. Dataset `project-2027` y CSV asociado.
- `project-comparison-2026`: misma fuente 2027 y dataset fiscal 2026 de Buenos Aires Data preservado. Diferencias nominales y reales estimadas entre autorizaciones anuales. Deflactor IPC diciembre/diciembre 2027 de 18,0%: valor de los supuestos macroeconómicos indicado expresamente por el usuario el 01/10/2026. Procedencia `user-provided`; la página exacta del supuesto en el documento sigue sin verificación independiente. No se confunde con inflación observada.
- [GCBA · Sueldo Funcionarios 2026](https://cdn.buenosaires.gob.ar/datosabiertos/datasets/ministerio-de-economia-y-finanzas/sueldo-funcionarios/sueldo_funcionarios_2026.csv), consulta 30/09/2026: julio es el último mes publicado. SHA-256 del CSV `06a2a1845e4863c248b972ea59a479d6644295993c8d936b3401a9a8a3979bb4`. El CSV bruto contiene identificadores y no se sube: se publica únicamente la referencia necesaria en `salary-latest-reference`.
- [HCDN · Informe 142](https://www3.hcdn.gob.ar/dependencias/prensa/archivos/informe_142.pdf), pregunta 938, p.726–727: bruto presidencial ordinario $4.066.018. [Decreto 931/2025](https://www.argentina.gob.ar/normativa/nacional/decreto-931-2025-422014/texto), artículos 2–3: Presidente/Vice excluidos de recomposiciones. Consulta 30/09/2026; hash y nota de redondeo en `salary-latest-reference`.

| Fuente | Organismo | Período | Consulta/documentación | Dataset |
| --- | --- | --- | --- | --- |
| [2013 4](https://cdn.buenosaires.gob.ar/datosabiertos/datasets/ministerio-de-economia-y-finanzas/presupuesto-ejecutado/historico_presupuesto_separados_por_cuatrimestres.zip) | GCBA / IDECBA | 2013-4 | No consta; ver metadata | `2013-4` |
| [2014 4](https://cdn.buenosaires.gob.ar/datosabiertos/datasets/ministerio-de-economia-y-finanzas/presupuesto-ejecutado/historico_presupuesto_separados_por_cuatrimestres.zip) | GCBA / IDECBA | 2014-4 | No consta; ver metadata | `2014-4` |
| [2015 4](https://cdn.buenosaires.gob.ar/datosabiertos/datasets/ministerio-de-economia-y-finanzas/presupuesto-ejecutado/historico_presupuesto_separados_por_cuatrimestres.zip) | GCBA / IDECBA | 2015-4 | No consta; ver metadata | `2015-4` |
| [2016 4](https://cdn.buenosaires.gob.ar/datosabiertos/datasets/ministerio-de-economia-y-finanzas/presupuesto-ejecutado/historico_presupuesto_separados_por_cuatrimestres.zip) | GCBA / IDECBA | 2016-4 | No consta; ver metadata | `2016-4` |
| [2017 4](https://cdn.buenosaires.gob.ar/datosabiertos/datasets/ministerio-de-economia-y-finanzas/presupuesto-ejecutado/historico_presupuesto_separados_por_cuatrimestres.zip) | GCBA / IDECBA | 2017-4 | No consta; ver metadata | `2017-4` |
| [2018 4](https://cdn.buenosaires.gob.ar/datosabiertos/datasets/ministerio-de-economia-y-finanzas/presupuesto-ejecutado/historico_presupuesto_separados_por_cuatrimestres.zip) | GCBA / IDECBA | 2018-4 | No consta; ver metadata | `2018-4` |
| [2019 4](https://cdn.buenosaires.gob.ar/datosabiertos/datasets/ministerio-de-economia-y-finanzas/presupuesto-ejecutado/historico_presupuesto_separados_por_cuatrimestres.zip) | GCBA / IDECBA | 2019-4 | No consta; ver metadata | `2019-4` |
| [2020 4](https://cdn.buenosaires.gob.ar/datosabiertos/datasets/ministerio-de-economia-y-finanzas/presupuesto-ejecutado/presupuesto-ejecutado-2020-4-trimestre.xlsx) | GCBA / IDECBA | 2020-4 | No consta; ver metadata | `2020-4` |
| [2021 4](https://cdn.buenosaires.gob.ar/datosabiertos/datasets/ministerio-de-economia-y-finanzas/presupuesto-ejecutado/presupuesto-ejecutado-2021-4-trimestre.xlsx) | GCBA / IDECBA | 2021-4 | No consta; ver metadata | `2021-4` |
| [2022 4](https://cdn.buenosaires.gob.ar/datosabiertos/datasets/ministerio-de-economia-y-finanzas/presupuesto-ejecutado/presupuesto-ejecutado-2022-4.xlsx) | GCBA / IDECBA | 2022-4 | No consta; ver metadata | `2022-4` |
| [2023 4](https://cdn.buenosaires.gob.ar/datosabiertos/datasets/ministerio-de-economia-y-finanzas/presupuesto-ejecutado/presupuesto-ejecutado-2023-4.xlsx) | GCBA / IDECBA | 2023-4 | No consta; ver metadata | `2023-4` |
| [2024 4](https://cdn.buenosaires.gob.ar/datosabiertos/datasets/ministerio-de-economia-y-finanzas/presupuesto-ejecutado/presupuesto-ejecutado-2024-4.xlsx) | GCBA / IDECBA | 2024-4 | No consta; ver metadata | `2024-4` |
| [2025 2](https://cdn.buenosaires.gob.ar/datosabiertos/datasets/ministerio-de-economia-y-finanzas/presupuesto-ejecutado/presupuesto-ejecutado-2025-2.xlsx) | GCBA / IDECBA | 2025-2 | No consta; ver metadata | `2025-2` |
| [2025 4](https://cdn.buenosaires.gob.ar/datosabiertos/datasets/ministerio-de-economia-y-finanzas/presupuesto-ejecutado/presupuesto-ejecutado-2025-4.xlsx) | GCBA / IDECBA | 2025-4 | No consta; ver metadata | `2025-4` |
| [2026 2](https://cdn.buenosaires.gob.ar/datosabiertos/datasets/ministerio-de-economia-y-finanzas/presupuesto-ejecutado/presupuesto-ejecutado-2026-2.xlsx) | GCBA / IDECBA | 2026-2 | No consta; ver metadata | `2026-2` |
| Fuentes oficiales individualizadas en el dataset y docs/FUENTES.md | Ver organismo en metadata | Varios períodos; ver metadata | 2026-09-15 | `annual-comparison` |
| Fuentes oficiales individualizadas en el dataset y docs/FUENTES.md | Ver organismo en metadata | Varios períodos; ver metadata | 2026-09-22 | `approved-vs-executed` |
| Fuentes oficiales individualizadas en el dataset y docs/FUENTES.md | Ver organismo en metadata | 2005–2026 | 2026-09-14 | `budget-history-long` |
| Fuentes oficiales individualizadas en el dataset y docs/FUENTES.md | Ver organismo en metadata | Varios períodos; ver metadata | 2026-09-12 | `budget-history-usd` |
| Fuentes oficiales individualizadas en el dataset y docs/FUENTES.md | Ver organismo en metadata | Varios períodos; ver metadata | 2026-09-16 | `caif` |
| Fuentes oficiales individualizadas en el dataset y docs/FUENTES.md | Ver organismo en metadata | Varios períodos; ver metadata | 2026-09-15 | `category-history` |
| Fuentes oficiales individualizadas en el dataset y docs/FUENTES.md | Ver organismo en metadata | Varios períodos; ver metadata | 2026-09-15 | `comparisons-argentina` |
| Fuentes oficiales individualizadas en el dataset y docs/FUENTES.md | Ver organismo en metadata | 2026 | 2026-09-15 | `comparisons-world` |
| Fuentes oficiales individualizadas en el dataset y docs/FUENTES.md | GCBA / IDECBA | Varios períodos; ver metadata | No consta; ver metadata | `conduction` |
| [Employment](https://www.argentina.gob.ar/sites/default/files/ejec-presupuestaria-ocupacion_salarios_1.xlsx) | GCBA / IDECBA | 2024 | No consta; ver metadata | `employment` |
| [Execution history](https://www.estadisticaciudad.gob.ar/eyc/wp-content/uploads/2025/12/SP_Fi_AX01.xlsx) | Ver organismo en metadata | 1997–2026 | 2026-09-22 | `execution-history` |
| [Government directory](https://data.buenosaires.gob.ar/dataset/autoridades-superiores-funcionarios/resource/bca7f4cc-810a-4830-8ee7-5c509d00720b) | GCBA / IDECBA | Varios períodos; ver metadata | 2026-09-22 | `government-directory` |
| [Income 2025 4](https://buenosaires.gob.ar/gcaba_historico/haciendayfinanzas/direccion-general-contaduria/informacion-contable/ejecuciones-presupuestarias) | GCBA / IDECBA | 2025-4 | No consta; ver metadata | `income-2025-4` |
| [Income 2026 2](https://buenosaires.gob.ar/gcaba_historico/haciendayfinanzas/direccion-general-contaduria/informacion-contable/ejecuciones-presupuestarias) | GCBA / IDECBA | 2026-2 | No consta; ver metadata | `income-2026-2` |
| [Income comparison](https://buenosaires.gob.ar/gcaba_historico/haciendayfinanzas/direccion-general-contaduria/informacion-contable/ejecuciones-presupuestarias) | GCBA / IDECBA | 2026-2 | 2026-09-12 | `income-comparison` |
| [Inflation long](https://www.indec.gob.ar/ftp/cuadros/economia/serie_ipc_divisiones.csv) | Ver organismo en metadata | Varios períodos; ver metadata | 2026-09-12 | `inflation-long` |
| [Institutional structure](https://cdn2.buenosaires.gob.ar/organigrama/Organigrama_GCBA_2026.pdf) | GCBA / IDECBA | Varios períodos; ver metadata | 2026-09-04 | `institutional-structure` |
| Fuentes oficiales individualizadas en el dataset y docs/FUENTES.md | GCBA / IDECBA | Varios períodos; ver metadata | 2026-09-09 | `manifest` |
| Fuentes oficiales individualizadas en el dataset y docs/FUENTES.md | Ver organismo en metadata | 2005–2025 | 2026-09-12 | `national-spending-history` |
| [Organigram](https://data.buenosaires.gob.ar/dataset/autoridades-superiores-funcionarios) | GCBA / IDECBA | Varios períodos; ver metadata | 2026-09-15 | `organigram` |
| Fuentes oficiales individualizadas en el dataset y docs/FUENTES.md | Ver organismo en metadata | 2005–2026 | 2026-09-15 | `population-annual` |
| [Province paths](https://www.argentina.gob.ar/profiles/argentinagobar/themes/contrib/poncho/resources/jsons/geo-provincias-argentinas.json) | Ver organismo en metadata | Varios períodos; ver metadata | No consta; ver metadata | `province-paths` |
| [Rem benchmark 2026](https://www.bcra.gob.ar/archivos/Pdfs/PublicacionesEstadisticas/tablas-relevamiento-expectativas-mercado-oct-2025.xlsx) | GCBA / IDECBA | Varios períodos; ver metadata | No consta; ver metadata | `rem-benchmark-2026` |
| Fuentes oficiales individualizadas en el dataset y docs/FUENTES.md | GCBA / IDECBA | 2025–2026 | No consta; ver metadata | `salaries` |
| [Salary hierarchy](https://data.buenosaires.gob.ar/dataset/autoridades-superiores-funcionarios) | GCBA / IDECBA | Varios períodos; ver metadata | 2026-09-15 | `salary-hierarchy` |
| [Salary history](https://cdn.buenosaires.gob.ar/datosabiertos/datasets/sueldo-funcionarios/sueldos-funcionarios-2012.xlsx) | GCBA / IDECBA | 2012–2026 | No consta; ver metadata | `salary-history` |
| Fuentes oficiales individualizadas en el dataset y docs/FUENTES.md | Ver organismo en metadata | Varios períodos; ver metadata | No consta; ver metadata | `semester-analysis` |
| Fuentes oficiales documentadas en docs/FUENTES.md | Ver organismo en metadata | Ver columnas del CSV | No consta; ver metadata | `budget-history-categories` |
| Fuentes oficiales documentadas en docs/FUENTES.md | Ver organismo en metadata | Ver columnas del CSV | No consta; ver metadata | `ipcba` |
| Fuentes oficiales documentadas en docs/FUENTES.md | GCBA / IDECBA | Ver columnas del CSV | No consta; ver metadata | `salary-jorge-macri` |
| Fuentes oficiales documentadas en docs/FUENTES.md | GCBA / IDECBA | Ver columnas del CSV | No consta; ver metadata | `series` |
| [Presupuesto destacado 2026](https://cdn.buenosaires.gob.ar/datosabiertos/datasets/ministerio-de-economia-y-finanzas/presupuesto-ejecutado/presupuesto-ejecutado-2026-2.xlsx) | GCBA / IDECBA | 2026-06-30 | 2026-09-22 | `budget-current-2026` |
| [population CABA](https://www.estadisticaciudad.gob.ar/eyc/wp-content/uploads/2025/10/ir_2025_1984.pdf) | Ver organismo en metadata | 2022 | No consta; ver metadata | `population-caba` |
| [fx CABA](https://www.bcra.gob.ar/archivos/Pdfs/PublicacionesEstadisticas/com3500.xls) | Ver organismo en metadata | 2026-06-30 | No consta; ver metadata | `fx-caba` |

## Catálogos y documentos complementarios

- [Cuentas Anuales de Inversión — GCBA](https://buenosaires.gob.ar/gcaba_historico/haciendayfinanzas/direccion-general-contaduria/informacion-contable/cuentas-anuales-de-inversion): origen de la serie IDECBA 1997–2025.
- [Ejecuciones presupuestarias — GCBA](https://buenosaires.gob.ar/gcaba_historico/haciendayfinanzas/direccion-general-contaduria/informacion-contable/ejecuciones-presupuestarias): informes y descargas de recursos y gasto por corte.
- [Presupuesto 2026 — GCBA](https://buenosaires.gob.ar/gcaba_historico/haciendayfinanzas/presupuesto-2026): proyecto y anexos.
- [Expediente 1188-J-2026 — Legislatura](https://www.legislatura.gob.ar/AgendaLCABADetalle/4722/29890) y [aprobación](https://www.legislatura.gob.ar/posts/aprobaron-una-ampliacion-presupuestaria-para-la-ciudad.html): referencias de la ampliación; texto íntegro pendiente.
- [Coordinación Fiscal Provincial — Ministerio de Economía](https://www.argentina.gob.ar/economia/sechacienda/coordinacion-fiscal-provincial): APNF, funciones, ocupación y series provinciales.
- [Resultados censales definitivos CABA — IDECBA](https://www.estadisticaciudad.gob.ar/eyc/wp-content/uploads/2025/10/ir_2025_1984.pdf): población principal 3.121.707.
- [A3500 — BCRA](https://www.bcra.gob.ar/archivos/Pdfs/PublicacionesEstadisticas/com3500.xls): tipo de cambio de referencia.
- [Padrón público — Buenos Aires Data](https://data.buenosaires.gob.ar/dataset/autoridades-superiores-funcionarios/resource/bca7f4cc-810a-4830-8ee7-5c509d00720b): alcance y campos de autoridades.
- [Organigrama oficial 2026](https://cdn2.buenosaires.gob.ar/organigrama/Organigrama_GCBA_2026.pdf): láminas institucionales.
- [Series empalmadas — IDECBA](https://www.estadisticaciudad.gob.ar/eyc/categoria-banco-datos/series-empalmadas/): IPCBA.

## Descargas conservadas en runtime

Únicamente las seis fuentes oficiales que la interfaz ya ofrece como enlaces locales. Conservarlas evita depender de cambios en las URLs oficiales. No se incorpora la carpeta de investigación ni sus documentos internos.

| Archivo público | SHA-256 |
| --- | --- |
| `caif-context-2024-2.pdf` | `8f078d53a31d428bddb9178af6bb4ca00d688270a1c588c97fa87f223456f340` |
| `caif-context-2025-2.pdf` | `6c76bd0859681e5ae5306ffb6babaf5a448f1499604df4227d998a777280d879` |
| `IPCBA-serie-empalmada.xlsx` | `f3deea08c07d01e02ba7eecf2dfb9f72deb979d7c23e80642fc1052886c7e4d7` |
| `recursos-2025-4.pdf` | `c9234129158cab27c68cdeaa1b787321b1f31efe93650163325ddfb79d70a0bd` |
| `recursos-2026-2.pdf` | `6aaf2ff1d0b0c9b7d54e2be83b6a3b4bf18897e4f6112cbf8828019741cb4993` |
| `serie-aif-idecba.xlsx` | `80cd20fd09ae3c32bdd55a70c2b3dd668f8285a0c223fa43cb6c58395026ecf3` |

Las fuentes internacionales, presupuestos provinciales, denominadores, cambios de cobertura y documentos de empleo se documentan por registro en los respectivos JSON. No mezclar sus años censales ni asumir igual alcance institucional.


## Documentos jurisdiccionales · Áreas de Gobierno

- Proyecto 2027, Jurisdicción 31: `31 - Ministerio de Movilidad e Infraestructura.pdf`, 89 páginas, SHA-256 `b672ab5e69430e682a6fef4bfa0f5ac380417f26e203df1f93a0c8613f96510c`. Financiamiento pp. 10–11, cargos p. 15, unidades/programas pp. 16–17, fichas financieras y descripciones desde p. 18.
- Proyecto original 2026: `23_10_26 - 31 Ministerio de Infraestructura.pdf`, 103 páginas, SHA-256 `ad5abe23c0bf0a663dc3e51291b1d3f82c00c529bffe71edfa86c047c4cde90f`. El prefijo del nombre no se interpreta como fecha de corte. No sustituye el vigente 2026-2.
- Insumos oficiales aportados para análisis. No se copian al repositorio ni a `public/sources`; URL pública exacta de estos dos archivos no verificada. Las páginas físicas, hashes y registros extraídos permiten trazarlos.
- Denominaciones de fuentes de financiamiento contrastadas con [planilla jurisdiccional oficial del GCBA](https://buenosaires.gob.ar/sites/default/files/2023-11/35.%20Ministerio%20de%20Ambiente%20y%20Espacio%20P.pdf): 11 Tesoro, 12 recursos propios, 13 afectación específica, 14 transferencias afectadas, 15 transferencias internas, 22 financiamiento externo. No usar nomenclaturas nacionales para esos códigos.
- Padrón de funcionarios y ejecución 2026: se reutilizan los archivos, URLs y hashes documentados en sus datasets canónicos.

- Ampliación del 10/10/2026: 22 PDF jurisdiccionales 2027 y sus 22 antecedentes 2026. Nombres, número de páginas y SHA-256 en `sources` de cada `areas/<código>.json`; cada programa conserva páginas de narrativa, ficha financiera y financiación. No se publican los PDF de preparación ni se atribuyen URLs no verificadas.
- Diferencias documentales y datos sin confirmar: `sourceIssues`, programas `pending` y `unmatched2026`. Jefatura de Gobierno conserva las diferencias de la planilla por unidad 2026 frente a sus fichas; Salud conserva las páginas de consolidación y subprogramas.
- Mensaje general 2027, PDF pp. 31–32 (numeración impresa 20–21): escenario macroeconómico cualitativo. No se localizó una tasa numérica de inflación anual o diciembre/diciembre en la revisión de este documento. El 18% sigue identificado como supuesto elegido para la comparación.

## Referencias ciudadanas v7

- Tributos propios 2027 y sus siete componentes: Planilla 11, p. 183, del proyecto general ya registrado. Divisor: 3.121.707 habitantes usados por el sitio; no se interpreta como carga individual.
- Inmuebles recaudado 2025: `4TO_TRIM_2025.pdf`, p. 5, descarga pública existente `sources/recursos-2025-4.pdf`. Incluye Inmobiliario, ABL y las dos contribuciones Ley 23.514.
- Ampliación 2026: sancionado y vigente del archivo oficial del segundo trimestre, sumados sobre las 22 jurisdicciones fiscales.
- Índice de programas: fuentes jurisdiccionales 2027 y página financiera conservadas por registro; no se añaden fuentes brutas. AGIP explica el alcance de Ingresos Brutos; la incidencia en precios se expresa como posibilidad.

### Revisión de cargos de Jefatura de Gobierno · v9

`20 Jefatura de Gobierno.pdf` (proyecto 2026): cuadros de cargos, entre otras pp.30, 162 y 254; distribución presupuestaria por unidades p.205 (Consejo de Derechos de Niñas, Niños y Adolescentes) y p.255 (Espacios Verdes/Arbolado y Cementerios). `20 - Jefatura de Gobierno.pdf` (proyecto 2027): Consejo, cuadros pp.189 y 191; Gobierno/Vinculación Ciudadana, p.232; Medios, p.424. Los 1.039 cargos del Consejo aparecen repetidos en pp.189/191 y ya se cuentan una sola vez en el agregado cargado. No se modifican 2.425/3.998: se retira su comparación por alcance no homogéneo. Las unidades ya presentes en el presupuesto 2026 impiden interpretar los códigos añadidos al cuadro como creación o traspaso confirmado. Las notas excluyen autoridades superiores, gabinete, carrera gerencial, carrera profesional hospitalaria, docentes y transitorias. Seguridad 2027, p.13: cuadro administrativo, sin dotación policial informada; esta aclaración se distingue de la nota literal de exclusiones. Archivos y hashes originales permanecen en cada fila del dataset.

## PBG de CABA (v14 · consulta 19/10/2026)
Página oficial: https://www.estadisticaciudad.gob.ar/eyc/categoria-banco-datos/producto-geografico-bruto-pgb/ . Se verificaron sus enlaces a PGB_C_04_09.xlsx (anual 2004–2024), PBG_C_93_09.xls (VAB a precios básicos 1993–2009), PGB_C_Trimestral.xlsx y PGB_K_Trimestral.xlsx (2024–2T2026). Se usan los archivos actualmente enlazados, aunque sus directorios indiquen fechas antiguas. Crecimiento 2027: BCRA, REM septiembre 2026, publicado el 06/10/2026, Cuadros de resultados D110: mediana 2,474341479389266% de variación media anual del PIB real nacional. Página: https://www.bcra.gob.ar/publicaciones/relevamiento-de-expectativas-de-mercado-rem-septiembre-de-2026/ . Las huellas SHA256, celdas, hojas y URLs originales están en pbg-caba.json; los libros brutos no se publican.

## v14 Parte 2 · Rótulos de publicaciones
Se conservan los destinos verificados. Las referencias genéricas se rotulan con la institución y publicación; los enlaces internos usan → y los externos ↗. La palabra «aportado» se reemplaza en la presentación por «serie histórica empalmada (ver metodología)»; los registros técnicos originales se conservan en el repositorio. No se agregan fuentes ni descargas al sitio.
