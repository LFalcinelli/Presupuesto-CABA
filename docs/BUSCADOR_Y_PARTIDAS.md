# Buscador y partidas 2026–2027

El buscador de la barra principal y los buscadores de Resumen/Áreas usan el mismo motor. Permite compartir `#buscar?q=pauta`, filtrar por tipo, abrir informes y seguir hacia la ficha del área, unidad o programa. La tecla `/` abre el panel; flechas y Enter recorren resultados, Esc cierra. En móvil ocupa la pantalla.

## Datos y continuidad

- Fuente 2027: las fichas conciliadas de los 22 documentos jurisdiccionales ya cargados. Cada programa conserva página, partidas y metas publicadas.
- Fuente 2026: el archivo oficial de ejecución del segundo trimestre, cuya huella coincide con la fuente existente. Se utilizan Sanción, Vigente y Devengado, sin confundir el presupuesto anual con seis meses ejecutados.
- Una entrada por clave completa de unidad/programa. Las correspondencias `antecedents` añaden nombres anteriores al sucesor verificado; no se unen por similitud del nombre. Si sólo coincide el código y la continuidad está pendiente, la entrada conserva ambas fechas y no muestra crecimiento comparable.
- Una unidad/programa de 2026 sin sucesor confirmado no se etiqueta como eliminada. Se conserva el último dato y se señala la continuidad por verificar. Un cero explícito en 2027 es distinto de un dato ausente.
- Los montos de áreas, unidades y programas son sus presupuestos completos. La partida Publicidad y propaganda contiene exclusivamente ese principal; los resultados temáticos no deben sumarse para calcular publicidad.

## Configuración de temas

`content/search-topics.json` contiene palabras de consulta, expresiones aplicadas a nombres, asociaciones por nombre de partida y, en Género, expresiones sobre descripciones de programas. Las asociaciones aparecen con el rótulo «Relacionado con». No demuestran identidad de funciones ni permiten atribuir todo el presupuesto al tema.

Los nueve temas iniciales son publicidad/comunicación, eventos, ambiente, género/diversidad, administración/conducción, deuda, elecciones, personal y transferencias. Las palabras y reglas completas son editables en ese archivo. La búsqueda ignora tildes y mayúsculas, reconoce raíces controladas y tolera errores de tipeo. «Género» no se confunde con «general».

## Publicidad y personal

Los principales se suman por inciso y nombre normalizado, sin sumar nuevamente totales de programa. Las fichas 2027 y las columnas oficiales `Desc_Ppal` de 2026 son las fuentes. Incisos 1 y 3 concilian con el presupuesto fiscal completo de esos incisos. Los archivos originales y sus importes permanecen intactos.

Publicidad: $133.915.908.563 en 26 programas. Se muestran total, áreas y programas, las dos bases 2026 y sus fuentes. Es el primer destacado de cada área con dato, adicional a los cinco anteriores. Debajo de $100 millones no se destacan porcentajes. Los cambios de funciones se advierten sin interpretar el salto como crecimiento comparable.

Personal: las ocho partidas concilian con $9.950.480.728.332. La nueva vista no publica remuneraciones individuales. Separa personal permanente/transitorio, gabinete y las otras partidas; permite abrir sus fuentes y comparar ambas bases. La definición de componentes de Gabinete se toma de las partidas parciales del archivo oficial 2026 y se identifica como tal, sin asumir una apertura 2027 no publicada.

Variación real estimada: `proyecto 2027 / 1,18 / base 2026 − 1`. Es el supuesto ya elegido para esta comparación; no se modifica el deflactor histórico. Ante cero de base o continuidad pendiente, no se inventa un porcentaje.

## Ingresos y presentación

Los destacados de ingresos usan rubros sin superponer totales y componentes, con las referencias de Planillas 11/16 y del informe 2026. Se ordenan por aumento real en pesos frente al votado; sólo participan rubros de al menos $50.000 millones o 1% de los recursos. La comparación con ampliado se muestra al lado. No se atribuye el cambio a alícuotas ni a leyes tributarias.

Barras es la opción inicial en gastos, tanto en escritorio como en móvil; Rectángulos continúa como elección compartible en la URL. El mapa de Inicio ordena también sus ramas internas de mayor a menor. La tarjeta de personal abre su vista específica con base votada y la tarjeta de comparación explica esa misma base.

## Límites

Las correspondencias pendientes siguen pendientes. Los temas no son una clasificación oficial del gasto. Las metas físicas no se suman entre programas con unidades distintas. Los cuadros de cargos y el padrón no son una dotación total; la comparación restrictiva de Jefatura de Gobierno de v9/v10 se conserva. No se investigan cambios tributarios, ni se reabre la sección salarial individual, ni se modifica la sección internacional.
