# Proyecto 2027: mapa fiscal y lectura ciudadana

## Inventario previo a los cambios — 05/10/2026

Se evaluó el master como propuesta, no como una orden de incorporar todos sus contenidos. La implementación parte del sitio existente y de fuentes propias. No utiliza código, textos ni datasets del sitio de referencia.

| Recomendación | Estado previo | Decisión de esta iteración |
|---|---|---|
| R1 · Votado, actualizado, propuesto | Existe parcial: comparación con junio de 2026 | Incorporar las tres etapas y elegir la base 2026; conservar el ajuste estimado de 18% definido por el usuario. |
| R2 · Recibo de la Ciudad | No existe | Adoptar la lectura de cada $100 dentro del mapa; descartar un recibo adicional y pedir datos tributarios personales: duplican la función y no permiten atribuir impuestos a servicios. |
| R3 · Treemap de composición y cambio | Existe parcial: treemaps y gráfico de variaciones separados | Conservar piezas simples; no superponer área, color y cambio en un nuevo gráfico que compita con el mapa. |
| R4 · Cuenta de la casa | Existe parcial: CAIF y resultado financiero | Incorporar el paso de saldo antes de intereses a saldo final; evitar la analogía literal con una economía doméstica. |
| R5 · Deuda corregida | Existe parcial: autorizaciones y CAIF | No reconstruir un calendario corregido sin las operaciones y pagos del mismo corte. No atribuir deuda futura a series sin prueba. Registrar las comprobaciones y límites en metodología. |
| R6 · Propuestas complementarias | No existe | Presentar únicamente los tres proyectos oficiales aportados, separados de los agregados del presupuesto y sin cambios tributarios. |
| R7 · Simuladores tributarios | No existe | Diferir: no se cuenta con la comparación fiscal ni boletas validadas necesaria para una simulación fiable. |
| R8 · Obras previstas | No existe | Incorporar explorador del plan 2027–2029 con búsqueda y detalle por proyecto. No afirmar ejecución, obra nueva o demoras sin comparación oficial. |
| R9 · Fuente contextual | Existe parcial: páginas y método | Incorporar importe exacto, base del porcentaje, clasificación y página a cada selección del mapa. |
| R10 · Compartir | Existe parcial: rutas persistentes | Persistir vista, nodo y expansiones del mapa en la dirección. No multiplicar páginas, imágenes OG ni exportaciones redundantes en esta iteración. |
| R11 · Del proyecto a la ley | Existe parcial: estado de proyecto visible | Conservar el estado pendiente de aprobación; no construir una cronología con eventos no verificados. |
| R12 · Portada 2027 | Existe parcial: proyecto destacado y cuentas recientes | Incorporar una entrada breve al mapa y al margen proyectado; conservar la distinción entre déficit ejecutado 2025 y proyección 2027. |

## Reglas adoptadas

- La fuente fiscal es el proyecto de 297 páginas del 30/09/2026 y las clasificaciones ya conciliadas. El Excel organiza las jerarquías y aporta un diseño funcional; no sustituye a la fuente primaria.
- Ingresos → caja común → destinos. Una conexión gráfica no significa afectación de un impuesto a un servicio.
- Las participaciones de ingresos usan recursos totales; las de destinos usan gasto total. Ambos totales difieren por el resultado financiero.
- Fuentes y aplicaciones financieras, figurativas y propuestas complementarias quedan fuera del mapa principal.
- Importes completos en el detalle y formatos explícitos «millones»/«billones» en las vistas compactas.
- No se modifican salarios, ciudades internacionales, historia ni otros universos por afirmaciones del master sin nueva verificación.

## Ideas rechazadas o acotadas

- **Sustituir el 18% por escenarios mensuales:** contradice una decisión explícita del usuario. El IPC diciembre/diciembre no equivale a inflación promedio anual; se conserva como supuesto de ajuste, con esa limitación visible en metodología.
- **Restar tasas para explicar las ampliaciones:** +38,9% y +21,2% tienen bases diferentes. El vínculo entre etapas se compone multiplicativamente, no se obtiene restando porcentajes.
- **Afirmar que se modificó el presupuesto sin intervención legislativa:** el dato de diferencia entre etapas no prueba esa afirmación.
- **«Obras pateadas», presupuestos siempre subestimados o porcentaje de deuda todavía no emitida:** requieren evidencia adicional; no se publican como hechos.
- **Corregir silenciosamente perfiles de deuda:** no se reemplaza un documento oficial por un calendario reconstruido con información de otro corte.
- **Simulaciones personales y muchos indicadores nuevos en portada:** agregan carga y distraen del recorrido principal. El mapa concentra las lecturas alternativas y el detalle se revela a pedido.

## Implementación y verificación

- `scripts/import-fiscal-map-2027.py`: importa las nueve solapas, comprueba el hash del PDF y concilia contra el importador fiscal existente. Verifica también el plan de inversiones a partir de texto oficial con disposición conservada.
- `data/budget/2027/fiscal-map.json`: 95 nodos, jerarquías, páginas, bases y cálculos. El Excel tiene 85 conexiones suministradas; sus hijos económicos se completan desde la solapa de alternativas. El cierre financiero es independiente de las dos jerarquías.
- `data/budget/2027/stages.json`: presupuesto inicial 2026, actualizado a junio y proyecto 2027; clasificaciones homogéneas por finalidad y objeto.
- `data/budget/2027/investments.json`: 309 proyectos identificados por código oficial completo, con área, programa, previsiones anuales y página.
- `data/budget/2027/companions.json`: transcripción estructurada de los tres proyectos separados, con artículo, página y hash de cada PDF. La emergencia no tiene un monto máximo global informado.
- `src/fiscal-map-2027.js` y `.css`: flujo propio en SVG, controles y nodos HTML accesibles, expansión progresiva, contexto, dirección persistente y presentación vertical móvil. El detalle móvil se presenta en una bandeja inferior que se puede cerrar, sin bloquear la navegación del gráfico.
- `src/project-2027-story.js` y `.css`: saldo proyectado, tres etapas, comparación con base elegible, explorador de obras y ventanas de detalle.
- `src/experience.js`, `src/index.html`, `content/home.json` y `data/index.json`: integración con la carga por vista, navegación y portada existentes. Se corrige una actualización demorada de pantalla que podía reconstruir una vista recién abierta después de cambiar el tamaño.

### Cierres numéricos

| Control | Importe |
|---|---:|
| Recursos previstos 2027 | $24.095.657.042.129 |
| Gastos propuestos 2027 | $24.094.340.599.263 |
| Saldo antes de intereses | $593.203.748.487 |
| Intereses | $591.887.305.621 |
| Resultado financiero | $1.316.442.866 |
| Presupuesto inicial 2026 | $17.344.864.165.159 |
| Presupuesto actualizado al 30/06/2026 | $19.877.152.039.294 |
| Plan de inversiones 2027 | $4.170.360.367.357 |
| Plan de inversiones 2028 | $2.907.671.643.815 |
| Plan de inversiones 2029 | $2.733.674.774.519 |

Las cuatro perspectivas suman el mismo gasto fiscal. Cada padre concilia con sus hijos. El saldo final surge tanto de ingresos menos gastos como de resultado primario menos intereses. Las variaciones con el 18% siguen siendo estimaciones condicionales, no mediciones con IPC observado.

### Verificaciones

- `tests/fiscal-map-2027.cjs`: totales, ciclos, padres/hijos, dos bases, conexiones sin asignación impuesto-función, tres etapas y proyectos únicos.
- `tests/smoke.cjs`: 34 recorridos iniciales de escritorio/móvil, recursos y enlaces profundos; interacción nueva en 1440, 768, 390 y 360 px, aperturas simultáneas, lectura por $100, recuperación al recargar, ventanas y búsqueda de Línea F.
- Se mantiene oculto el contenido de sueldos y ciudades internacionales. El sitio conserva las cuatro vistas de Proyecto 2027.
- Publicación mediante el workflow canónico de GitHub Pages, después de la comprobación local y del PR. La vista previa utiliza `/Presupuesto-CABA/`, igual que producción.

### Límites deliberados

No se incorporan cambios tributarios, boletas personales, una cronología legislativa supuesta ni un calendario de deuda reconstruido. Para corregir un perfil de vencimientos faltaría conciliar instrumentos, operaciones y pagos a un mismo corte; no alcanza con combinar stock de junio con tablas de septiembre. Los PDF y el Excel aportados permanecen locales; se publican datos estructurados, fórmulas y referencias, no una copia de los adjuntos.
