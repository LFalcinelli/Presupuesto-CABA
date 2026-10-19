# Producto y arquitectura

Explorador público de CABA dirigido a ciudadanos. Secciones existentes: Inicio; Explorar (resumen, gastos, ingresos, estructura, sueldos e historia); Comparar CABA con Argentina y el mundo; Presupuesto explicado; Fuentes y metodología.

Arquitectura preservada: HTML, CSS y JavaScript de navegador, sin backend ni framework. Los módulos históricos se conservan para reducir el riesgo de la migración. `experience.js` carga datos por demanda y controla las rutas hash; los demás módulos aportan cálculos y vistas.

`src/runtime.js` concentra el base path, el catálogo de recursos, la configuración y el contenido de portada. `scripts/build.mjs` copia sólo interfaz, configuración, contenido, datos públicos y assets a `dist/`. No descarga fuentes ni recalcula cifras.

`data/index.json` registra cada unidad de actualización. Las tablas fiscales detalladas conservan inicial, actualizado y devengado en una misma base por período, porque comparten filas y clasificaciones; nunca se mezclan con salarios o ingresos.

Las rutas `#inicio`, `#explorar`, `#gastos`, `#ingresos`, `#estructura`, `#sueldos`, `#evolucion`, `#comparar`, `#presupuesto-explicado`, `#metodologia` y `#detalle?...` conservan su comportamiento. La recarga usa siempre `index.html`.

La portada toma el período de `config/site.json`, las cifras de `currentBudgetFile` y los textos de `content/home.json`. Las comparaciones históricas mantienen sus propios períodos y fuentes.

## v14 · Orden de carga y límites de la reorganización (19/10/2026)

El catálogo fuente tiene 42 JS y 27 CSS. Con las banderas actuales se solicitan 40 JS iniciales; los dos módulos desactivados se excluyen. Cuatro implementaciones adicionales se descargan a demanda. El orden de las funciones de arranque y de las redefiniciones se conserva; las implementaciones diferidas se resuelven mediante Site.featureFunctions. No hay dependencias nuevas en producción.

| Orden | JavaScript | Carga | Funciones globales definidas/redefinidas |
|---|---|---|---|
| 1 | theme-init.js | Síncrono, antes del estilo | Inicialización, configuración o registro de pasadas |
| 2 | runtime.js | Diferido, en este orden | Inicialización, configuración o registro de pasadas |
| 3 | lazy-runtime.js | Diferido, en este orden | `Site.loadFeature` |
| 4 | number-format.js | Diferido, en este orden | `formatNumber`, `formatPercent`, `formatPercentText`, `formatShare`, `formatMoney`, `formatBillions`, `nonBreakingMoneyText` |
| 5 | citizen-vocabulary.js | Diferido, en este orden | `fiscalDebtLabel`, `citizenVocabularyText`, `citizenGlossaryMarkup` |
| 6 | app.js | Diferido, en este orden | `$`, `E`, `fmt`, `money`, `short`, `pct`, `naturalTick`, `total`, `fiscal`, `factor`, `val`, `group`, `filtered`, `originalCrumbs`, `head`, `metricCards`, `actionCard`, `home`, `bars`, `dataTable`, `detail`, `method`, `financial`, `render`, `loadPeriod`, `select` |
| 7 | improvements.js | Diferido, en este orden | `longBudgetPoint`, `longInflationNote`, `longBudgetPanel`, `longBudgetChart`, `budgetEvolutionChart`, `dateOrdinal`, `signedPct`, `signedMoney`, `semesterAnalysisPanel`, `analysisTable`, `showSalaryObservation`, `chartWidth`, `showBudgetPoint`, `budgetBenchmarkNote` |
| 8 | explorers.js | Diferido, en este orden | `crumbs`, `institutionCards`, `sourceDownloads`, `donut`, `semesterComparison`, `historical`, `lineChart`, `income`, `salaries`, `explained` |
| 9 | visualizations.js | Diferido, en este orden | `compositionTreemap`, `caifPanel` |
| 10 | citizen-explorer.js | Diferido, en este orden | `incomeCitizen`, `incomeComparisonPanel`, `incomePairedBars`, `budgetOverview`, `purposeBars`, `institutionalPanel`, `structureState`, `structure`, `budgetStructurePanel`, `explainedCitizen`, `methodCitizen`, `comparisonMethod`, `historyCitizen`, `historyPairState`, `historyPairPanel`, `incomePairedBarsForHistory`, `usdHistoryMoney`, `historyUSDPanel`, `decorateTables`, `longMethodNote` |
| 11 | comparisons.js | Diferido, en este orden | `comparisonContext`, `provinceSource`, `nationalRealState`, `nationalRealPoint`, `nationalRealHistory`, `comparisonState`, `comparisonValue`, `difference`, `comparisonColor`, `compare`, `comparisonLabel`, `provincialHistory`, `nationalMap`, `argentinaComparison`, `nationalRanking`, `provinceDetail`, `provincePair`, `selectProvince`, `nationalHistoryState`, `nationalHistory`, `nationalHistoryPoint` |
| 12 | world-comparison.js | Desactivado; no se construye ni descarga | `verifiedCities`, `worldReady`, `ppaReady`, `worldValue`, `worldAmount`, `worldComparison`, `worldDetail` |
| 13 | iteration3.js | Diferido, en este orden | `justiceNote`, `competencyPanel`, `iteration3Method`, `searchNormalize`, `niceScale`, `annualPopulation`, `populationMethodNote`, `readableLineChart`, `nationalRealState` (redefine), `nationalRealHistory` (redefine), `annualValuesTable`, `orgAncestors`, `orgBudgetLink`, `organigramTree`, `searchBudgetAndInstitutions`, `categoryHistoryPanel`, `cabaPopulationHistory`, `annualComparisonPanel` |
| 14 | iteration4.js | Diferido, en este orden | `fiscalSummary`, `caifPanel` (redefine), `fiscalContext`, `iteration4Method`, `treemapPlan`, `compositionTreemap` (redefine), `treemapRemainder`, `annualTick`, `vizTip`, `hideVizTip`, `showVizTip`, `enhanceVisuals` |
| 15 | citizen-update.js | Diferido, en este orden | `homeFiscalReadings`, `approvedExecutionPanel`, `executionRows`, `executionObservation`, `executionHistoryPanel`, `governmentConductionPanel`, `governmentDirectory`, `governmentPerson`, `searchGovernment`, `showExecutionYear` |
| 16 | experience.js | Diferido, en este orden | `featureEnabled`, `applyVisibility`, `pageFor`, `summaryFor`, `periodName`, `cutDate`, `latestAdvance`, `basePrice`, `provenance`, `renderInsights`, `dataFile`, `ensureViewData`, `landing`, `explorerShell`, `renderExperience`, `syncRoute`, `readRoute`, `citizenLanguage` |
| 17 | project-2027.js | Diferido, en este orden | `visibleMethodSections`, `detailLink`, `budgetCondition`, `projectTitle`, `projectButton`, `projectKpi`, `projectLanding`, `projectTable`, `projectSummary`, `projectExpenses`, `projectRevenue`, `comparisonToggle`, `changeDumbbell`, `projectCompare`, `projectDisplayUnit`, `projectComparisonMethod`, `extraViews.project`, `explorerShell` (redefine), `readRoute` (redefine), `syncRoute` (redefine), `projectMethod`, `methodPage`, `sourceDownloadsFor`, `polishMarkup`, `executionHistoryMethod` |
| 18 | fiscal-map-2027.js | Diferido, en este orden | `fiscalModel`, `fiscalNode`, `fiscalDetail`, `fiscalMapMarkup`, `drawFiscalRibbons`, `fiscalHighlight`, `mountFiscalMap`, `refreshFiscalMap`, `readRoute` (redefine), `syncRoute` (redefine) |
| 19 | project-2027-story.js | Diferido, en este orden | `projectFiscalStory`, `projectStageJourney`, `projectCompare` (redefine), `investmentRows`, `investmentList`, `investmentExplorer`, `companionProjects`, `projectSummary` (redefine), `projectMethod` (redefine), `enhanceVisuals` (redefine), `openProjectDialog` |
| 20 | citizen-clarity.js | Diferido, en este orden | `fiscalSummary` (redefine), `executionLabel`, `tenYearImpact`, `caifPanel` (redefine), `fiscalContext` (redefine), `provinceSilhouette`, `provincePairRows`, `provincePair` (redefine), `enhanceVisuals` (redefine), `explorerShell` (redefine) |
| 21 | project-area-reports.js | Diferido, en este orden | `ensureViewData` (redefine), `areaReportName`, `areaSearchNorm`, `areaReportFind`, `areaSearchResults`, `areaResultMarkup`, `areaSearchMarkup`, `areaDirection`, `areaComposition`, `areaHistoryChart`, `areaHistoryValue`, `areaObjectChanges`, `areaReportMarkup`, `areaDialogMarkup`, `projectSummary` (redefine), `projectExpenses` (redefine), `projectTable` (redefine), `projectMethod` (redefine), `showAreaReport`, `readRoute` (redefine), `syncRoute` (redefine), `enhanceVisuals` (redefine) |
| 22 | chart-paths.js | Diferido, en este orden | `monotonePath` |
| 23 | visual-polish.js | Diferido, en este orden | `ensureViewData` (redefine), `projectLanding` (redefine), `fiscalMapMarkup` (redefine), `explorerShell` (redefine), `readRoute` (redefine), `syncRoute` (redefine), `historyTwentyYears`, `historyRevenueLabel`, `executionObservation` (redefine), `executionHistoryPanel` (redefine), `historyUSDPanel` (redefine), `extraViews.history`, `projectPurposeTree`, `projectExpenses` (redefine), `polishChartLines`, `enhanceVisuals` (redefine) |
| 24 | citizen-reading.js | Diferido, en este orden | `ensureViewData` (redefine), `projectFiscalAccount`, `fiscalAccountRows`, `readingAction`, `verticalFiscalFlow`, `fiscalFlow`, `caifPanel` (redefine), `projectOverview`, `readRoute` (redefine), `syncRoute` (redefine), `provincialPairBlock`, `nationalRealState` (redefine), `readableLineChart` (redefine), `nationalRealHistory` (redefine), `perCapitaGuide`, `extraViews.explained`, `methodPage` (redefine), `compositionChildren`, `compositionDetail`, `compositionTreemap` (redefine), `enhanceVisuals` (redefine), `annualPriceScenario`, `projectKeyReadings`, `comparisonState` (redefine), `budgetBenchmarkNote` (redefine), `longInflationNote` (redefine), `semesterAnalysisPanel` (redefine), `incomeComparisonPanel` (redefine), `sourcePageFor`, `cleanCitizenSources` |
| 25 | composition-views.js | Diferido, en este orden | `classificationName`, `spendingComposition`, `projectBudgetChanges`, `incomeComposition`, `readRoute` (redefine), `syncRoute` (redefine) |
| 26 | government-areas.js | Diferido, en este orden | `ensureViewData` (redefine), `readRoute` (redefine), `syncRoute` (redefine), `governmentOpen`, `showAreaReport` (redefine), `extraViews.project` (redefine), `governmentTitle`, `governmentPeople`, `governmentAreaCards`, `governmentAreaDirectory`, `governmentBasis`, `governmentFactor`, `governmentChange`, `governmentComparisonControls`, `governmentBars`, `governmentDataTable`, `governmentStages`, `governmentStatus`, `governmentRankingRows`, `governmentRankTable`, `governmentRanking`, `governmentUnit`, `governmentProgram`, `governmentContributions`, `governmentChanges`, `governmentComplements`, `governmentSources`, `governmentAreaPage`, `projectMethod` (redefine) |
| 27 | government-insights.js | Diferido, en este orden | `governmentProgramMovements`, `governmentMaterialMovement`, `governmentShare`, `governmentVerb`, `governmentScopeChange`, `governmentTransferRecipient`, `governmentTransferPrograms`, `governmentFunctionalVerified`, `governmentExecutionComparable`, `governmentReadingItems` |
| 28 | government-readings.js | Diferido, en este orden | `governmentRealChange`, `governmentBaseName`, `governmentObjectGroup`, `governmentEconomic`, `governmentFinancing`, `governmentReadings`, `governmentReorganization`, `governmentProgramOpenings` |
| 29 | percentage-presentation.js | Diferido, en este orden | Inicialización, configuración o registro de pasadas |
| 30 | citizen-review.js | Diferido, en este orden | `explorerShell` (redefine), `ensureViewData` (redefine), `readRoute` (redefine), `syncRoute` (redefine), `citizenBaseControl`, `glossaryLink`, `reviewReference`, `reviewComparisonRows`, `projectOverview` (redefine), `projectKeyReadings` (redefine), `scenarioPercent`, `budgetPriceScenarios`, `annualPriceScenario` (redefine), `variationLabel`, `projectCompare` (redefine), `projectBudgetChanges` (redefine), `projectExpenses` (redefine), `projectRevenue` (redefine), `compositionDetail` (redefine), `fiscalFlow` (redefine), `reviewCompositionBars`, `executionObservation` (redefine), `compositionTreemap` (redefine), `comparisonState` (redefine), `extraViews.explained` (redefine), `enhanceVisuals` (redefine) |
| 31 | display-names.js | Diferido, en este orden | `citizenDisplayName`, `budgetDepthDisplayName`, `budgetDepthHistoricalName`, `displayName` |
| 32 | mobile-accessibility.js | Diferido, en este orden | `mobileView`, `governmentTitle` (redefine), `ensureViewData` (redefine), `readRoute` (redefine), `comparisonColor` (redefine), `fiscalModel` (redefine), `fiscalMapMarkup` (redefine), `refreshFiscalMap` (redefine), `foldMobileSection`, `openMobileAncestors`, `accessibleEnhancements`, `enhanceVisuals` (redefine), `render` (redefine), `explorerShell` (redefine), `spendingChartMode`, `spendingChartControls`, `compositionTreemap` (redefine), `projectPurposeTree` (redefine), `syncRoute` (redefine) |
| 33 | pre-stream.js | Diferido, en este orden | `themeIcon`, `ensureViewData` (redefine), `amplificationRate`, `amplificationLabel`, `amplificationOverview`, `directoryProgramResults`, `feedbackLink`, `propertyReference`, `projectRevenue` (redefine), `projectMethod` (redefine), `enhanceVisuals` (redefine), `readRoute` (redefine), `syncRoute` (redefine), `render` (redefine) |
| 34 | budget-depth.js | Diferido, en este orden | `ensureViewData` (redefine), `readRoute` (redefine), `syncRoute` (redefine), `depthSource`, `depthName`, `depthHistoricalName`, `depthPositionComparable`, `depthPositionVariation`, `depthPositionScope`, `depthVotedPct`, `depthScopeBadge`, `depthAreaLink`, `depthTable`, `depthLine`, `depthExecution`, `depthStructure`, `depthServices`, `depthTransfers`, `depthDebt`, `depthSupport`, `depthPositionReason`, `depthPositions`, `budgetDepth`, `governmentAreaDirectory` (redefine), `depthAreaExecution`, `governmentAreaPage` (redefine), `projectMethod` (redefine), `render` (redefine), `depthRefresh` |
| 35 | budget-search.js | Diferido, en este orden | `searchNorm`, `searchStem`, `searchDistance`, `searchWordMatch`, `searchTopics`, `searchQueryTopics`, `budgetSearch`, `searchAmount`, `searchName`, `searchLabel`, `searchStatus`, `searchRate`, `searchChange`, `searchRowsMarkup`, `loadBudgetSearch`, `ensureSearchDialog`, `searchHash`, `renderSearchResults`, `openBudgetSearch`, `closeBudgetSearch`, `searchEntryLink`, `principalRowsTable`, `showSearchDetail`, `extraViews.search`, `ensureViewData` (redefine), `readRoute` (redefine), `syncRoute` (redefine), `enhanceVisuals` (redefine), `areaSearchResults` (redefine), `areaResultMarkup` (redefine), `directoryProgramResults` (redefine) |
| 36 | budget-v11.js | Diferido, en este orden | `ensureViewData` (redefine), `publicityPrincipal`, `personnelPrincipalBars`, `personnelStructureMarkup`, `publicityReading`, `governmentReadingItems` (redefine), `depthServices` (redefine), `personnelView`, `projectExpenses` (redefine), `revenueIncreases`, `projectRevenue` (redefine), `projectMethod` (redefine) |
| 37 | home-highlights.js | Diferido, en este orden | `ensureViewData` (redefine), `highlightAmount`, `highlightGrowth`, `highlightRows`, `highlightIcon`, `highlightPopupIcons`, `homeHighlightsMarkup`, `projectLanding` (redefine), `highlightComponent`, `highlightGroup`, `highlightHistory`, `highlightAccounts`, `highlightMethodBody`, `ensureHighlightDialog`, `showHomeHighlight`, `closeHomeHighlight`, `readRoute` (redefine), `syncRoute` (redefine), `enhanceVisuals` (redefine), `highlightListRow`, `highlightCompactGroup`, `highlightBody`, `methodPage` (redefine) |
| 38 | source-reading.js | Diferido, en este orden | `methodPage` (redefine), `headlineMoney`, `showSearchDetail` (redefine) |
| 39 | reading-help.js | Diferido, en este orden | `closeReadingTerm`, `openReadingTerm`, `enhanceVisuals` (redefine), `fiscalMapMarkup` (redefine) |
| 40 | pbg-history.js | Diferido, en este orden | `ensureViewData` (redefine), `pbgExecutionRows`, `executionRows` (redefine), `executionObservation` (redefine), `pbgSeriesOptions`, `pbgMethodLink`, `pbgHistoryPanel`, `executionHistoryPanel` (redefine), `methodPage` (redefine) |
| 41 | page-polish.js | Diferido, en este orden | `ensureViewData` (redefine), `loadBudgetSearch` (redefine), `pageIndexKey`, `readRoute` (redefine), `syncRoute` (redefine), `scrollToPageBlock`, `mountPageIndex`, `enhanceVisuals` (redefine), `render` (redefine), `publicationLabel`, `cleanCitizenSources` (redefine) |
| 42 | optional-salaries.js | Desactivado; no se construye ni descarga | `salaries` (redefine), `salaryMonthRows`, `salaryContent`, `salaryDate`, `salaryHistoryRows`, `salaryHistoryPanel`, `salarySource`, `presidentComparison`, `salaryObservation`, `salaryEvolutionChart`, `salaryHierarchyPanel`, `salaryLatestPanel`, `extraViews.salaries` |

### Implementaciones diferidas

| Archivo | Cuándo se solicita |
|---|---|
| lazy-comparison.js | Comparar CABA |
| lazy-areas.js | Directorio o ficha de Áreas; enlaces anteriores a unidades |
| lazy-search.js | Abrir el buscador o una vista 2027 que usa su índice |
| lazy-investments.js | Resumen del proyecto, donde está el plan de obras |

### CSS, en orden

1. styles.css
2. improvements.css
3. experience.css
4. iteration2.css
5. iteration3.css
6. iteration4.css
7. citizen-update.css
8. project-2027.css
9. fiscal-map-2027.css
10. project-2027-story.css
11. citizen-clarity.css
12. project-area-reports.css
13. visual-polish.css
14. citizen-reading.css
15. composition-views.css
16. government-areas.css
17. variation-colors.css
18. citizen-review.css
19. theme-tokens.css
20. mobile-accessibility.css
21. pre-stream.css
22. budget-depth.css
23. budget-search.css
24. home-highlights.css
25. reading-help.css
26. page-polish.css
27. treemap-tile.css

Los 40 grupos de reglas que afectan .treemap-tile están en treemap-tile.css, conservando sus condiciones y orden entre sí. La geometría de cada rectángulo sigue calculándose en la vista. theme-tokens.css contiene los colores semánticos, alias fijos de la paleta y tamaños comunes; los alias mantienen exactamente los colores anteriores. Se retiraron dos !important de los rótulos de la anotación histórica, con selectores explícitos que conservan su prioridad. Se mantienen los demás cuando su retirada cambiaría la cascada.

### Renderizado y carga

Las antiguas capas polishMarkup registran siete pasadas sobre un único fragmento DOM, en su orden original. citizenLanguage procesa una vez los tokens de texto. La limpieza de fragmentos dinámicos se agrupa por raíz y no se observa a sí misma. El mapa fiscal lee toda la geometría antes de insertar sus cintas; los valores y las fórmulas de coordenadas se conservan. La altura del menú usa ResizeObserver. Los formateadores numéricos se reutilizan por precisión.
El aviso existente aparece cuando la carga de una ruta supera 400 ms. El primer gráfico permanece abierto; ningún bloque cambió a plegado ni se retiró. Los cuatro índices usan el parámetro bloque, mantienen la ruta y abren la sección al recargar. El logo ya utilizaba el derivado de 348×192 px, suficiente para 64/88 px; se conserva el original sin modificar.

### Plan de consolidación futura propuesto; no aplicado

1. Datos: centralizar los contratos de carga y errores de dataFile, con conciliaciones y prueba de fallos por recurso.
2. Formato: completar la separación entre valores, nombres oficiales y etiquetas de presentación, con snapshots de importes y nombres por vista.
3. Rutas: sustituir por etapas los envoltorios readRoute/syncRoute por un registro de parámetros, conservando todos los enlaces y la prueba de recarga.
4. Vistas: separar cada generador y sus controles con interfaces explícitas. Comparar capturas de las dos bases, los dos temas y 375/1440 px antes de retirar cada envoltorio.

Este PR aplica únicamente las pasadas de HTML, los módulos y las mejoras concretas autorizadas en v14; no ejecuta ese plan general.

### Medición local antes/después

Medianas de tres recorridos alternados sobre la base del PR de PBG y la versión de pulido, en el mismo equipo y servidor local. Se mide hasta que termina la carga de la vista, con contextos nuevos por recorrido; 375/1440 px son anchos simulados, sin limitar CPU ni conexión. Son controles de regresión y no una promesa de velocidad en todos los dispositivos. Una primera medición detectó un empeoramiento; se corrigieron las lecturas/escrituras de geometría y se volvió a medir de forma alternada.

| Ancho | Vista | Antes (ms) | Después (ms) |
|---|---|---:|---:|
| 375 | Inicio | 1801 | 1667 |
| 375 | Comparar CABA | 545 | 339 |
| 375 | Metodología histórica | 257 | 195 |
| 375 | Gastos 2026 | 827 | 419 |
| 1440 | Inicio | 2064 | 1809 |
| 1440 | Comparar CABA | 575 | 336 |
| 1440 | Metodología histórica | 262 | 199 |
| 1440 | Gastos 2026 | 964 | 441 |

El workflow de cada PR genera además sus propias capturas y tiempos. Para el pulido, compara 56 estados de rutas, temas y anchos: mismos importes, cantidad de gráficos y tarjetas y destinos de enlaces, exceptuando el índice nuevo. Las capturas y su auditoría se adjuntan como artefacto de Actions.
