# Verificación de cargos 2026–2027

Fecha: 13/10/2026. Base auditada: build publicado `5a7118ba7742`, commit `c8376e7161af82e7d04c3cf82532fa1bf05ad0a1`.

## Resultado

Se revisaron los 16 PDF completos de los ocho pares publicados: 2.501 páginas y 24 cuadros de cargos. Todas las páginas con cuadros reales están extraídas. La suma independiente de las filas por unidad coincide con las cifras del sitio en los 16 documentos. No se encontraron cuadros omitidos ni unidades repetidas contadas dos veces en estos ocho pares.

Se mantienen las ocho comparaciones de cuadros parciales. No se confirma una dotación total ni una comparación de personas con idénticas funciones. Hay seis bajas y dos subas: Salud (+35) y Obligaciones del Tesoro (+1). La hipótesis inicial de siete bajas y una sola suba no coincide con los datos.

El error confirmado de presentación es «+1 cargos», que se corrige a «+1 cargo». Se revisaron también tablas, fichas y ambos CSV: no hay otra frase con ese plural incorrecto. Los CSV separan valor y unidad; en Tesoro muestran 6 y 7, no una frase con el cambio de +1. Sus datos permanecen intactos. También se corrige el fondo de las filas de tabla al pasar el cursor en modo oscuro, un defecto de contraste reproducido en la versión publicada y detectado durante las pruebas de esta entrega.

## Tabla por área

Las páginas son las posiciones del PDF, contadas desde 1. «Sin fila» identifica unidades con presupuesto positivo en el mismo PDF que no figuran como fila de unidad en sus cuadros de cargos; no es una omisión de extracción ni permite asignar cero empleados.

| Área | Cuadros 2026 | Cuadros 2027 | Cargos 2026 → 2027 | UE con presupuesto sin fila 2026 / 2027 | Cambio de columnas | Decisión |
|---|---|---|---:|---:|---|---|
| Seguridad | 10 | 13 | 960 → 885 | 8 / 8 | Ninguno | Se mantiene, parcial |
| Movilidad e Infraestructura | 15 | 15 | 1.022 → 911 | 2 / 1 | Ninguno | Se mantiene, parcial |
| Salud | 24, 25 | 30, 31 | 20.587 → 20.622 | 2 / 1 | Ninguno | Se mantiene, parcial |
| Desarrollo Humano y Hábitat | 13, 122 | 13, 124 | 3.479 → 3.213 | 3 / 0 | Ninguno | Se mantiene, parcial |
| Cultura | 40, 267 | 39, 276 | 2.689 → 2.565 | 1 / 1 | Ninguno | Se mantiene, parcial |
| Educación | 21 | 21 | 6.498 → 6.020 | 0 / 0 | Ninguno | Se mantiene, parcial |
| Hacienda y Finanzas | 10, 84 | 10, 82 | 2.601 → 2.549 | 1 / 1 | Ninguno | Se mantiene, parcial |
| Obligaciones del Tesoro | 4 | 4 | 6 → 7 | 0 / 0 | Ninguno | Se mantiene, parcial |

## Cómo se verificó

1. Se comprobó el SHA-256 y el número de páginas de cada PDF contra la fuente usada en la extracción. Se recorrieron todas las páginas buscando el título y, por separado, las columnas AAE/AAS/ACI/GGU para detectar posibles continuaciones sin título. No aparecieron continuaciones adicionales. Las menciones de los índices se separaron de los cuadros reales.
2. Se extrajeron las celdas de los 24 cuadros con un lector de tablas distinto del reconocimiento por líneas utilizado originalmente. Se sumaron las diez columnas de escalafones de cada unidad y se cotejó su total de fila. Sólo se sumaron filas con código de unidad ejecutora; se ignoraron las filas agregadas impresas, incluso cuando mostraban cero.
3. Se verificó una sola aparición de cada clave de unidad en estos ocho pares. La reconstrucción del extractor original coincide unidad por unidad con las celdas independientes y, para 2026, con las unidades guardadas en el dataset. No se usó el total impreso de jurisdicción como control.
4. Se contrastaron las unidades de cargos con las unidades de presupuesto positivo, cuya suma concilia con el total de cada jurisdicción en su PDF. El cruce se hizo por código de UE dentro de la jurisdicción, verificando su unicidad: el campo Ent de los cuadros centrales de cargos de 2027 cambia de 0 al código de jurisdicción, mientras sus planillas financieras conservan 0. Los entes descentralizados conservan su identificación propia. Comparar la clave completa entre esas dos tablas habría producido falsos faltantes.
5. Se renderizaron y revisaron visualmente las 24 páginas de cargos para comprobar encabezados, filas de totales, continuaciones y notas.

## Escalafones y límites

Los 24 cuadros conservan las mismas diez columnas, en el mismo orden: AAE, AAS, ACI, EME, GGU, IVE, SGM, TIC, Carrera de Enfermería y Técnico-Profesional de Salud, y Otros Ordenamientos Escalafonarios. También conservan la columna Total. La disposición gráfica y el código Ent cambian, pero no desaparece ninguna columna del cálculo. «Otros ordenamientos» está incluido en ambas sumas.

Las notas de ambos años excluyen autoridades superiores, plantas de gabinete, carrera gerencial, carrera profesional hospitalaria, personal docente y plantas transitorias. Salud incluye la nota de enfermería de la Ley 6767 en ambos años. Seguridad no informa con estos cuadros la dotación policial.

Que los encabezados sean iguales descarta una pérdida mecánica de columnas en la extracción; no demuestra que cada persona mantenga su escalafón ni que todas las funciones tengan idéntico alcance. Hay cambios de códigos, agrupaciones y unidades incluidas. No se atribuyen las diferencias a despidos, eficiencia ni reducción de la planta real. Jefatura de Gobierno conserva su exclusión de la comparación, según la revisión anterior.

### Sumas por escalafón de las filas de UE

No se agregan las jurisdicciones para presentar una dotación de la Ciudad.

| Área / año | AAE | AAS | ACI | EME | GGU | IVE | SGM | TIC | Enfermería / técnico-prof. | Otros | Total parcial |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Seguridad / 2026 | 0 | 58 | 6 | 241 | 247 | 137 | 271 | 0 | 0 | 0 | 960 |
| Seguridad / 2027 | 0 | 43 | 5 | 224 | 215 | 144 | 254 | 0 | 0 | 0 | 885 |
| Movilidad e Infraestructura / 2026 | 0 | 0 | 37 | 0 | 316 | 629 | 36 | 4 | 0 | 0 | 1.022 |
| Movilidad e Infraestructura / 2027 | 0 | 0 | 34 | 0 | 268 | 573 | 33 | 3 | 0 | 0 | 911 |
| Salud / 2026 | 0 | 389 | 1.063 | 805 | 2.933 | 23 | 1.251 | 17 | 14.104 | 2 | 20.587 |
| Salud / 2027 | 0 | 353 | 1.023 | 780 | 2.787 | 20 | 1.215 | 16 | 14.426 | 2 | 20.622 |
| Desarrollo Humano y Hábitat / 2026 | 0 | 1.535 | 57 | 0 | 1.233 | 49 | 409 | 5 | 191 | 0 | 3.479 |
| Desarrollo Humano y Hábitat / 2027 | 0 | 1.414 | 51 | 0 | 1.147 | 48 | 362 | 6 | 185 | 0 | 3.213 |
| Cultura / 2026 | 606 | 36 | 146 | 0 | 921 | 5 | 217 | 0 | 0 | 758 | 2.689 |
| Cultura / 2027 | 558 | 33 | 141 | 1 | 842 | 5 | 203 | 0 | 0 | 782 | 2.565 |
| Educación / 2026 | 0 | 19 | 2 | 0 | 931 | 93 | 5.405 | 47 | 0 | 1 | 6.498 |
| Educación / 2027 | 0 | 16 | 2 | 0 | 832 | 88 | 5.037 | 44 | 0 | 1 | 6.020 |
| Hacienda y Finanzas / 2026 | 0 | 17 | 16 | 0 | 2.313 | 2 | 83 | 170 | 0 | 0 | 2.601 |
| Hacienda y Finanzas / 2027 | 0 | 52 | 14 | 0 | 2.234 | 4 | 83 | 162 | 0 | 0 | 2.549 |
| Obligaciones del Tesoro / 2026 | 0 | 0 | 2 | 0 | 0 | 1 | 0 | 0 | 2 | 1 | 6 |
| Obligaciones del Tesoro / 2027 | 0 | 0 | 1 | 0 | 1 | 2 | 0 | 1 | 2 | 0 | 7 |

## Detalle de cobertura por área

### Seguridad

Filas únicas de cargos: 22 en 2026 y 22 en 2027. Unidades con presupuesto positivo: 30 y 30. Todas las filas de cargos encontradas fueron extraídas.

**2026 · con presupuesto, sin fila de cargos**

- UE 794 · Dirección General Alcaidías · planilla presupuestaria, PDF p. 11.
- UE 1025 · Dirección General Seguridad Ciudadana y Asistencia al Turista · planilla presupuestaria, PDF p. 11.
- UE 1049 · Dirección General Investigación Criminal · planilla presupuestaria, PDF p. 11.
- UE 1051 · Dirección General PROCOM · planilla presupuestaria, PDF p. 11.
- UE 1055 · DIRECCIÓN GENERAL ANÁLISIS ESTRATÉGICO · planilla presupuestaria, PDF p. 11.
- UE 3218 · Dirección General Planificación y Evaluación de Recursos · planilla presupuestaria, PDF p. 12.
- UE 3223 · Secretaria de Coordinación · planilla presupuestaria, PDF p. 12.
- UE 3224 · Instituto Superior de Seguridad Pública · planilla presupuestaria, PDF p. 87.

**2027 · con presupuesto, sin fila de cargos**

- UE 794 · Dirección General Alcaidías · planilla presupuestaria, PDF p. 14.
- UE 1025 · Dirección General Seguridad Ciudadana Y Asistencia Al Turista · planilla presupuestaria, PDF p. 14.
- UE 1027 · Secretaría De Seguridad · planilla presupuestaria, PDF p. 14.
- UE 1049 · Dirección General Investigación Criminal · planilla presupuestaria, PDF p. 14.
- UE 1055 · Dirección General Análisis Estratégico · planilla presupuestaria, PDF p. 14.
- UE 3218 · Dirección General Planificación Y Evaluación De Recursos · planilla presupuestaria, PDF p. 16.
- UE 3223 · Secretaria De Coordinación · planilla presupuestaria, PDF p. 16.
- UE 3224 · Instituto Superior De Seguridad Pública · planilla presupuestaria, PDF p. 130.

**Cambio de unidades en los cuadros**

Sólo en el cuadro 2026: UE 1027, Secretaría de Seguridad (2 cargos).
Sólo en el cuadro 2027: UE 1051, Dirección General Procom (2 cargos).

Este listado documenta cambios de apertura; no confirma altas, bajas, traslados de personas ni equivalencias entre unidades.

Encabezados: sin cambios. Decisión: se mantiene la comparación parcial; no hay cuadros incompletos en la extracción.

### Movilidad e Infraestructura

Filas únicas de cargos: 18 en 2026 y 12 en 2027. Unidades con presupuesto positivo: 20 y 13. Todas las filas de cargos encontradas fueron extraídas.

**2026 · con presupuesto, sin fila de cargos**

- UE 1057 · SUBSECRETARÍA DE PLANEAMIENTO URBANO · planilla presupuestaria, PDF p. 16.
- UE 3126 · Subterráneos de Buenos Aires · planilla presupuestaria, PDF p. 16.

**2027 · con presupuesto, sin fila de cargos**

- UE 3126 · Subterráneos De Buenos Aires · planilla presupuestaria, PDF p. 16.

**Cambio de unidades en los cuadros**

Sólo en el cuadro 2026: UE 1058, DIRECCIÓN GENERAL PLANEAMIENTO URBANO (14 cargos); UE 1059, DIRECCIÓN GENERAL ANTROPOLOGÍA URBANA (21 cargos); UE 1060, DIRECCIÓN GENERAL ARQUITECTURA (9 cargos); UE 3337, Dirección General Diseño y Planificación de la Movilidad (9 cargos); UE 3338, Dirección General Seguridad Vial (70 cargos); UE 3639, Dirección General Transporte Colectivo de Pasajeros (3 cargos); UE 3641, Dirección General Control de la Movilidad (15 cargos).
Sólo en el cuadro 2027: UE 1057, Subsecretaría De Planeamiento Urbano (37 cargos).

Este listado documenta cambios de apertura; no confirma altas, bajas, traslados de personas ni equivalencias entre unidades.

Encabezados: sin cambios. Decisión: se mantiene la comparación parcial; no hay cuadros incompletos en la extracción.

### Salud

Filas únicas de cargos: 60 en 2026 y 61 en 2027. Unidades con presupuesto positivo: 62 y 62. Todas las filas de cargos encontradas fueron extraídas.

**2026 · con presupuesto, sin fila de cargos**

- UE 4025 · CEMAR 3 · planilla presupuestaria, PDF p. 29.
- UE 4026 · CEMAR 4 · planilla presupuestaria, PDF p. 29.

**2027 · con presupuesto, sin fila de cargos**

- UE 4026 · Cemar 4 · planilla presupuestaria, PDF p. 37.

**Cambio de unidades en los cuadros**

Sólo en el cuadro 2027: UE 4025, Cemar 3 (15 cargos).

Este listado documenta cambios de apertura; no confirma altas, bajas, traslados de personas ni equivalencias entre unidades.

Encabezados: sin cambios. Decisión: se mantiene la comparación parcial; no hay cuadros incompletos en la extracción.

### Desarrollo Humano y Hábitat

Filas únicas de cargos: 22 en 2026 y 23 en 2027. Unidades con presupuesto positivo: 24 y 23. Todas las filas de cargos encontradas fueron extraídas.

**2026 · con presupuesto, sin fila de cargos**

- UE 1067 · DIRECCIÓN GENERAL ESTRATEGIAS HABITACIONALES · planilla presupuestaria, PDF p. 14.
- UE 1068 · DIRECCIÓN GENERAL CENTROS DE INCLUSIÓN SOCIAL Y ABORDAJE INTEGRAL · planilla presupuestaria, PDF p. 14.
- UE 3601 · Corporación BSAS Sur · planilla presupuestaria, PDF p. 15.

**2027 · con presupuesto, sin fila de cargos**

Ninguna.

**Cambio de unidades en los cuadros**

Sólo en el cuadro 2026: UE 1013, Dirección General Autonomía y Revinculación (10 cargos).
Sólo en el cuadro 2027: UE 1067, Dirección General Estrategias Habitacionales (67 cargos); UE 1068, Dirección General Centros De Inclusión Social Y Abordaje Integral (108 cargos).

Este listado documenta cambios de apertura; no confirma altas, bajas, traslados de personas ni equivalencias entre unidades.

En 2026, UE 1013 (Dirección General Autonomía y Revinculación) aporta 10 cargos al cuadro, pero no figura entre las UE con presupuesto positivo de la planilla conciliada. Se conserva porque está impresa en el cuadro de cargos; no se le imputa presupuesto.

Encabezados: sin cambios. Decisión: se mantiene la comparación parcial; no hay cuadros incompletos en la extracción.

### Cultura

Filas únicas de cargos: 15 en 2026 y 15 en 2027. Unidades con presupuesto positivo: 16 y 16. Todas las filas de cargos encontradas fueron extraídas.

**2026 · con presupuesto, sin fila de cargos**

- UE 263 · Subsecretaria de Políticas Culturales · planilla presupuestaria, PDF p. 41.

**2027 · con presupuesto, sin fila de cargos**

- UE 263 · Subsecretaria De Políticas Culturales · planilla presupuestaria, PDF p. 40.

Encabezados: sin cambios. Decisión: se mantiene la comparación parcial; no hay cuadros incompletos en la extracción.

### Educación

Filas únicas de cargos: 12 en 2026 y 11 en 2027. Unidades con presupuesto positivo: 12 y 11. Todas las filas de cargos encontradas fueron extraídas.

**2026 · con presupuesto, sin fila de cargos**

Ninguna.

**2027 · con presupuesto, sin fila de cargos**

Ninguna.

**Cambio de unidades en los cuadros**

Sólo en el cuadro 2026: UE 9761, Dirección General de Infraestructura Escolar (71 cargos); UE 9764, Dirección General de Mantenimiento Escolar (229 cargos).
Sólo en el cuadro 2027: UE 568, Direccion General Mejora Y Cuidado De Edificios Escolares (278 cargos).

Este listado documenta cambios de apertura; no confirma altas, bajas, traslados de personas ni equivalencias entre unidades.

Encabezados: sin cambios. Decisión: se mantiene la comparación parcial; no hay cuadros incompletos en la extracción.

### Hacienda y Finanzas

Filas únicas de cargos: 13 en 2026 y 14 en 2027. Unidades con presupuesto positivo: 14 y 15. Todas las filas de cargos encontradas fueron extraídas.

**2026 · con presupuesto, sin fila de cargos**

- UE 347 · Dir. Gral. Relación con Organismos Multilaterales · planilla presupuestaria, PDF p. 11.

**2027 · con presupuesto, sin fila de cargos**

- UE 347 · Dir. Gral. Relación Con Organismos Multilaterales · planilla presupuestaria, PDF p. 11.

**Cambio de unidades en los cuadros**

Sólo en el cuadro 2027: UE 351, Instituto Superior De La Carrera (24 cargos).

Este listado documenta cambios de apertura; no confirma altas, bajas, traslados de personas ni equivalencias entre unidades.

Encabezados: sin cambios. Decisión: se mantiene la comparación parcial; no hay cuadros incompletos en la extracción.

### Obligaciones del Tesoro

Filas únicas de cargos: 1 en 2026 y 1 en 2027. Unidades con presupuesto positivo: 1 y 1. Todas las filas de cargos encontradas fueron extraídas.

**2026 · con presupuesto, sin fila de cargos**

Ninguna.

**2027 · con presupuesto, sin fila de cargos**

Ninguna.

Encabezados: sin cambios. Decisión: se mantiene la comparación parcial; no hay cuadros incompletos en la extracción.

## Identificación de los documentos

Nombres oficiales de los archivos recibidos, cantidad total de páginas y huella SHA-256. No se incorporan copias de los PDF al repositorio.

| Área / año | Archivo | Páginas | SHA-256 |
|---|---|---:|---|
| Seguridad / 2026 | 22_10_26 - 29 Ministerio de Seguridad.pdf | 92 | `2eb7757ce20876d5f194a3175b5c18b0260924760e6bc5976586d2b2f1f011c2` |
| Seguridad / 2027 | 29 - Ministerio de Seguridad.pdf | 135 | `def8a2d431fa0cccf715c04c394b5c8a5a5c69ea4ff10e09c89c6bde1af3ae53` |
| Movilidad e Infraestructura / 2026 | 23_10_26 - 31 Ministerio de Infraestructura.pdf | 103 | `ad5abe23c0bf0a663dc3e51291b1d3f82c00c529bffe71edfa86c047c4cde90f` |
| Movilidad e Infraestructura / 2027 | 31 - Ministerio de Movilidad e Infraestructura.pdf | 89 | `b672ab5e69430e682a6fef4bfa0f5ac380417f26e203df1f93a0c8613f96510c` |
| Salud / 2026 | 14_10_26 -40 Ministerio de Salud.pdf | 340 | `8f417ec699c151738828e8225518dca333d3955b4a9db1cf699c52d783841c30` |
| Salud / 2027 | 40 - Ministerio de Salud.pdf | 244 | `fd8885aac0e9a980b93fdb98258f7d31a8c39c074147eeba7cea7362f987eb4c` |
| Desarrollo Humano y Hábitat / 2026 | 21_10_26 - 45 Ministerio de Desarrollo Humano y Hábitat.pdf | 131 | `a2471e9f31ed365e3bcbdbf3fdae62d810f2ca07515c2c9989514e5729b47c2b` |
| Desarrollo Humano y Hábitat / 2027 | 45 - Ministerio de Desarrollo Humano y Hábitat.pdf | 143 | `0d4fc4765f773f8bc55f20d58ff0cb39fb899154d5e085c90d6db5c0bef67568` |
| Cultura / 2026 | 15_10_26 - 50 Ministerio de Cultura.pdf | 275 | `4924a2e2e6f35c25c7ee921eb2fb96e0daec9010c7398285f31d651dbad4640d` |
| Cultura / 2027 | 50 - Ministerio de Cultura.pdf | 282 | `2808cd1cf85bd7227e26e614e54bbd4d2fe1a01139a0f2500156a90a1bf27b4f` |
| Educación / 2026 | 20_10_26 - 55 Ministerio de Educación.pdf | 210 | `789159405fcbb06062b4c134b09f499182719f5b7637f9885967dd8698a95f6d` |
| Educación / 2027 | 55 - Ministerio de Educación.pdf | 195 | `eb455e371fa053c74236149351047b3fd9b7081c5abaa3de47e781fc6f654d0f` |
| Hacienda y Finanzas / 2026 | 14_10_26 - 24_10_26 - 60 Ministerio de  Hacienda y Finanzas.pdf | 117 | `101933e4c769d6fc50bae610c213d67bc22e85080045b950df2c6c05ad674a5e` |
| Hacienda y Finanzas / 2027 | 60 - Ministerio de Hacienda y Finanzas.pdf | 114 | `7d70d93753e3bc81958ac26589318bcc070afa94feebb03dfbc731d72c6441cf` |
| Obligaciones del Tesoro / 2026 | 99 Obligaciones a cargo del Tesoro.pdf | 16 | `7a5e26a6b0956b76816dac35a81418e66bb77f89e12a314130caaf7f74908848` |
| Obligaciones del Tesoro / 2027 | 99 - Obligaciones a cargo del Tesoro.pdf | 15 | `98f00a5537e8fe3a4f67e9137beaefe07eb267fdc888dd165d314024705b999b` |

## Estado de la entrega

PR con vista previa por la corrección singular. No fusionar ni publicar en producción sin nueva autorización del propietario. No se modifican cifras, fuentes, deflactores, comparaciones ni el CSV original.
