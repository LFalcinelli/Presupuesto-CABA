# Datasets y schemas

El índice canónico es `data/index.json`. Cada entrada incluye id, nombre, path, período, fecha de actualización de la fuente (null si no consta), fuente, tipo y descripción. `files` registra descargas asociadas; `resources` conserva aliases para el motor existente.

## Incorporaciones 2027

- `project-2027`: `data/budget/2027/project.json` y `project.csv`. `schemaVersion`, `year`, `status`, `source`, `universe`, `population`, `summary`, `breakdowns`, `creditAuthorizations`, `macroAssumptions`, `limitations`, `reconciliation`. Cada métrica/apertura conserva `value`, `unit`, `status`, `type`, `source`, `pdfPage`, `reference` y fórmula cuando corresponde. Finalidades y funciones relacionadas, 22 jurisdicciones, ocho objetos, clasificación económica y composición de recursos.
- `project-comparison-2026`: `data/budget/2027/comparison-2026.json`. `projectYear`, `projectStatus`, `referenceYear`, `referenceDate`, `referenceStatus`, `source2026`, `source2027`, `universe`, `unit`, `inflationAdjusted: false`, `totals`, `groups` por finalidad/objeto, `method`. Guarda importes, diferencias nominales y fuentes de ambos términos; no mezcla presupuesto con ejecución.
- `salary-latest-reference`: `data/salaries/latest-reference.json`. `latest`, `president`, `ratio`, `method`, fechas de verificación y hashes oficiales. Sólo importes necesarios, sin CUIL. Históricos de salarios preservados.
- Importación reproducible: `scripts/import-project-2027.py /ruta/documento.pdf`; dependencia de mantenimiento opcional `pdfplumber`. El build consume los JSON versionados y no necesita Python ni el PDF.
- `featuredBudgetYear`, `featuredBudgetStatus` y `featuredBudgetFile` seleccionan el proyecto destacado. `currentBudgetYear`, `currentBudgetFile` y `currentExecutionPeriod` siguen describiendo el presupuesto/ejecución 2026.

| Dataset | Archivo | Estructura principal |
| --- | --- | --- |
| `2013-4` | `data/budget/2013/2013-4.json` | schemaVersion, year, quarter, sourceFile, sourceUrl, sourceSheet, sourceRows, sha256, allTotals, rows, factors, fiscalTotals |
| `2014-4` | `data/budget/2014/2014-4.json` | schemaVersion, year, quarter, sourceFile, sourceUrl, sourceSheet, sourceRows, sha256, allTotals, rows, factors, fiscalTotals |
| `2015-4` | `data/budget/2015/2015-4.json` | schemaVersion, year, quarter, sourceFile, sourceUrl, sourceSheet, sourceRows, sha256, allTotals, rows, factors, fiscalTotals |
| `2016-4` | `data/budget/2016/2016-4.json` | schemaVersion, year, quarter, sourceFile, sourceUrl, sourceSheet, sourceRows, sha256, allTotals, rows, factors, fiscalTotals |
| `2017-4` | `data/budget/2017/2017-4.json` | schemaVersion, year, quarter, sourceFile, sourceUrl, sourceSheet, sourceRows, sha256, allTotals, rows, factors, fiscalTotals |
| `2018-4` | `data/budget/2018/2018-4.json` | schemaVersion, year, quarter, sourceFile, sourceUrl, sourceSheet, sourceRows, sha256, allTotals, rows, factors, fiscalTotals |
| `2019-4` | `data/budget/2019/2019-4.json` | schemaVersion, year, quarter, sourceFile, sourceUrl, sourceSheet, sourceRows, sha256, allTotals, rows, factors, fiscalTotals |
| `2020-4` | `data/budget/2020/2020-4.json` | schemaVersion, year, quarter, sourceFile, sourceUrl, sourceSheet, sourceRows, sha256, allTotals, rows, factors, fiscalTotals |
| `2021-4` | `data/budget/2021/2021-4.json` | schemaVersion, year, quarter, sourceFile, sourceUrl, sourceSheet, sourceRows, sha256, allTotals, rows, factors, fiscalTotals |
| `2022-4` | `data/budget/2022/2022-4.json` | schemaVersion, year, quarter, sourceFile, sourceUrl, sourceSheet, sourceRows, sha256, allTotals, rows, normalizationNote, factors |
| `2023-4` | `data/budget/2023/2023-4.json` | schemaVersion, year, quarter, sourceFile, sourceUrl, sourceSheet, sourceRows, sha256, allTotals, rows, factors, fiscalTotals |
| `2024-4` | `data/budget/2024/2024-4.json` | schemaVersion, year, quarter, sourceFile, sourceUrl, sourceSheet, sourceRows, sha256, allTotals, rows, factors, fiscalTotals |
| `2025-2` | `data/budget/2025/2025-2.json` | schemaVersion, year, quarter, sourceFile, sourceUrl, sourceSheet, sourceRows, sha256, allTotals, rows, factors, fiscalTotals |
| `2025-4` | `data/budget/2025/2025-4.json` | schemaVersion, year, quarter, sourceFile, sourceUrl, sourceSheet, sourceRows, sha256, allTotals, rows, factors, fiscalTotals |
| `2026-2` | `data/budget/2026/2026-2.json` | schemaVersion, year, quarter, sourceFile, sourceUrl, sourceSheet, sourceRows, sha256, allTotals, rows, factors, fiscalTotals |
| `annual-comparison` | `data/execution/annual-comparison.json` | updated, base, expense, income |
| `approved-vs-executed` | `data/execution/approved-vs-executed.json` | updated, periods, method, budgetSource, amendmentSource, amendmentNews |
| `budget-history-long` | `data/history/budget-history-long.json` | schemaVersion, updated, base, deflatorFile, metric, method, notes, rows, classificationMethod, sanctionedSource, benchmark2026 |
| `budget-history-usd` | `data/history/budget-history-usd.json` | schemaVersion, updated, base, minYear, currentYear, selection, method, fxSource, fxSha256, historicalDailyFx, usCpi, notes |
| `caif` | `data/fiscal-results/caif.json` | updated, unit, scope, method, periods, formulas, context |
| `category-history` | `data/history/category-history.json` | updated, method, classificationSource, series |
| `comparisons-argentina` | `data/provinces/comparisons-argentina.json` | schemaVersion, updated, defaultPeriod, defaultIndicator, population, quarterlyAifSourceRows, functionSourceRows, annualSourceRowPolicy, indicators, periods, notes, area |
| `comparisons-world` | `data/international/comparisons-world.json` | schemaVersion, updated, year, fxDate, reference, defaultBasis, defaultCurrency, metric, populationMethod, fxMethod, scopeMethod, ppa |
| `conduction` | `data/government/conduction.json` | ministers, secretaries, excluded, cut, catalogDate, verifiedAt, sources, rawMinisterRows, rawSecretaryRows, directSecretariats, dependentSecretariats, deduplication |
| `employment` | `data/government/employment.json` | year, count, scope, definition, source, sheet, cell, sha256, sourceNotes |
| `execution-history` | `data/history/execution-history.json` | updated, metric, source, sourceSha256, sourceSheet, base, rows, method, notes, earlyInflation, events |
| `government-directory` | `data/government/government-directory.json` | source, checkedAt, sourceFile, sourceSha256, count, scope, cutNote, categories, nodes, people, method |
| `income-2025-4` | `data/revenue/income-2025-4.json` | period, sourceFile, rows, total |
| `income-2026-2` | `data/revenue/income-2026-2.json` | period, sourceFile, rows, total |
| `income-comparison` | `data/revenue/income-comparison.json` | updated, period, comparison, base, factors, total, groups, taxes, sourceWorkbook, sourceSheet, sourceWorkbookSha256, officialSources |
| `inflation-long` | `data/history/inflation-long.json` | schemaVersion, updated, base, baseIndex, indexBase, name, method, sourceType, localFile, localSha256, sheet, localRange |
| `institutional-structure` | `data/government/institutional-structure.json` | updated, retrievedAt, source, landing, areasSource, sha256, verificationStatus, pages, method, note |
| `manifest` | `data/budget/manifest.json` | targetIndex, base, updated, periods, ipc |
| `national-spending-history` | `data/provinces/national-spending-history.json` | schemaVersion, updated, base, deflatorFile, metric, technicalMetric, method, rows |
| `organigram` | `data/government/organigram.json` | updated, structureDate, primaryInput, inputSha256, officialSource, officialPdf, pdfDate, method, limitation, wordInventoryCount, wordMatchedCount, unmatchedWord |
| `population-annual` | `data/provinces/population-annual.json` | updated, kind, purpose, method, validation, sourceWorkbook, vintages, totals, rows |
| `province-paths` | `data/provinces/province-paths.json` | source, publisher, viewBox, note, features |
| `rem-benchmark-2026` | `data/budget/rem-benchmark-2026.json` | vintage, surveyStart, surveyEnd, publishedAt, budgetSanctionedAt, source, reportSource, sourceSheet, sha256, observedThrough, annualDecemberPercent, annualDecemberDisplayPercent |
| `salaries` | `data/salaries/salaries.json` | months, rows, note |
| `salary-hierarchy` | `data/salaries/salary-hierarchy.json` | cut, retrievedAt, source, sourceFile, catalogUpdated, sha256, method, limitation, rawRows, compatibleRows, totalUnique, duplicateRows |
| `salary-history` | `data/salaries/salary-history.json` | rows, sources, deduplicated, latest, base, note, realBasis, presidentReference |
| `semester-analysis` | `data/execution/semester-analysis.json` | sourceFile, sourceSheet, sourceSheetSha256, base, factors, fiscal, functions, incisos, jurisdictions, communes, method |
| `budget-history-categories` | `data/history/budget-history-categories.csv` | CSV con encabezados |
| `ipcba` | `data/history/ipcba.csv` | CSV con encabezados |
| `salary-jorge-macri` | `data/salaries/salary-jorge-macri.csv` | CSV con encabezados |
| `series` | `data/budget/series.csv` | CSV con encabezados |
| `budget-current-2026` | `data/budget/2026/current.json` | budget, executed, date, population, perCapita, source, universe, verificationStatus, method, year, quarter, period |
| `population-caba` | `data/provinces/population-caba.json` | value, year, edition, source, reference, nationalSource |
| `fx-caba` | `data/international/fx-caba.json` | value, date, currencyPair, source, series, sourceSheet, sourceRow, sha256, method |

Las tablas detalladas de gasto comparten columnas `s` (inicial), `v` (actualizado), `d` (devengado); `codes` y `names` alinean las dimensiones. `fiscal` identifica el universo corriente/capital. No sumar sus agregados con las filas.

Para actualizar una unidad: consultar su metadata y fuente, preparar el JSON/CSV revisado, importarlo con `scripts/update-dataset.mjs` y ejecutar tests del dominio. Construir el sitio no cambia esos datos.

La estructura 2027 debe añadir un archivo bajo `data/budget/2027/`, con metadata verificada, registrar el dataset y seleccionar su path mediante `currentBudgetFile`. No sustituir datos de 2026.
