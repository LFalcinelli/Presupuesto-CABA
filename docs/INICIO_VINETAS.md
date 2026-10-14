# Lecturas de Inicio 2027

Las cuatro tarjetas son una selección editorial. Los títulos expresan esa lectura; los pop-ups distinguen cifras oficiales, cálculos y supuestos. No se suman las viñetas entre sí ni se presenta todo su importe como un ahorro demostrado.

## Reproducción y trazabilidad

`node scripts/build-home-highlights.mjs` genera `data/home-highlights-2027.json` a partir de los datasets publicados. El archivo conserva los importes exactos, códigos de programas, exclusiones, páginas, referencias y hashes de entrada. El texto editable está en `content/home-highlights.json`. No necesita descargas ni rutas de una computadora.

El gasto corriente se refiere a corriente **sin intereses**, incluidos sueldos, consumo, servicios y transferencias. El récord es el mayor valor real de la serie disponible 1997–2027, con 2026/2027 presupuestados y precios promedio anuales estimados. No se lo confunde con un récord ejecutado. Las variaciones históricas no usan el factor 1,18 de la comparación presupuestaria 2027/2026.

Las cuentas comparan separadamente cierre 2025, primeros semestres 2024–2026 y proyecto 2027. Se informa el superávit semestral 2026 y el pequeño superávit financiero proyectado 2027. Los bonos a proveedores y el préstamo Belgrano Sur son proyectos complementarios separados de los agregados fiscales.

## Cifras conciliadas

| Selección | Pesos exactos | Millones, total redondeado |
| --- | ---: | ---: |
| Publicidad y comunicación | 233.014.989.972 | 233.015 |
| Eventos, turismo y entretenimiento | 110.658.651.557 | 110.659 |
| PASO, estimación propia | 28.845.207.474,30 | 28.845 |
| Viñeta 3 | 372.518.849.003,30 | 372.519 |
| Conducción y burocracia | 1.485.022.473.319 | 1.485.022 |
| Vivienda | 139.130.862.941 | 139.131 |
| Agenda verde | 489.472.307.922 | 489.472 |
| Viñeta 4 | 2.113.625.644.182 | 2.113.626 |

Publicidad suma la principal global más once unidades de comunicación, restando la publicidad que esas unidades ya contienen. El total verificado difiere de los $232.784 millones propuestos en $231 millones al redondear. No se fuerza la suma a un importe sin respaldo.

Eventos cuenta Usina del Arte y Festivales de la Ciudad por programa, una vez cada uno. Sumar la dirección completa y nuevamente Usina duplicaría $1.402 millones. Turismo excluye $14.800 millones de publicidad, ya contados en la primera fila. La categoría incluye servicios de seguridad: no todo es entretenimiento.

PASO aplica un **supuesto del 35%** a $82.414.878.498 del Instituto de Gestión Electoral y la Unidad de Enlace Electoral. El proyecto no separa PASO y generales. No hay una referencia histórica verificada en los archivos para justificar ese porcentaje; se lo informa como supuesto de simulación, no como ahorro garantizado. La tarjeta conserva la fila abreviada solicitada; el pop-up identifica la estimación en una línea y enlaza su criterio completo en la metodología.

Conducción: $1.531.861.910.181 de Actividades Centrales/Comunes − $88.413.959.280 de programas ya comprendidos en vivienda, agenda verde o las ocho unidades adicionales + $41.574.522.418 de esas unidades completas. Los programas de comunicación de la viñeta 3 pueden estar aquí: por eso no se suman ambas viñetas.

Operación del Reciclado ($154.961.548.685) es el mayor componente de la agenda verde. Reciclado y Economía Circular ($98.466.239.126) es otro programa con distinto código. Ninguno se vuelve a contar en conducción. La suma exacta de agenda verde redondea a $489.472 millones; la suma de sus filas redondeadas da $489.473 millones. Se prioriza sumar valores exactos y redondear al final.

Las comparaciones por componente se publican solo cuando hay una base votada 2026 y continuidad verificada. Para componentes netos de publicidad se enlaza la ficha completa, sin aplicar a esa selección un porcentaje que corresponde a otro universo. La coincidencia de funciones temáticas no demuestra que las estructuras sean redundantes.

Los intereses solos crecen 98,1% real frente al votado 2026 (código económico 21410000). El 93% propuesto corresponde al inciso 7 completo, que también incluye otros gastos de deuda; no se lo etiqueta como intereses solos. El pop-up usa el universo de intereses, coherente con el resultado primario y financiero.

## Interacción

- Enlaces compartibles: `#inicio?vineta=1` a `4`; cerrar conserva los parámetros del mapa fiscal.
- Diálogos nativos modales, teclado, Escape, botón de cierre y devolución de foco. Panel inferior en celular.
- Buscador compacto que reutiliza el motor global; no existe un segundo índice.
- El resto del Inicio conserva sus contenidos. Su título anterior pasa a nivel 2 para mantener un único título principal.
- Aparición suave de 240 ms y 10 px; contenido visible aun sin observador o con scroll rápido. Se respeta reducir movimiento.
- Evolución abre en gasto corriente sin intereses; cualquier serie explícita en la URL, incluido gasto total, prevalece.

Pruebas: conciliaciones, exclusión de doble conteo, fuentes, dos temas, 375/1440 px, teclado, vínculos recargables, buscador y movimiento reducido. Se completa además la representación con barras de las 22 áreas en Sueldos del personal, pedida en la iteración anterior.

## Lectura del Inicio y cierre 2026

Los pop-ups priorizan nombres, importes y enlaces, con una frase breve. El detalle anterior se conserva en `#metodologia?seccion=inicio`. Se incorpora la composición corriente publicada en el mapa fiscal, conciliada exactamente con el total de la primera viñeta. No cambian los importes existentes.

No se encontró una proyección oficial de déficit al cierre 2026 en el Mensaje y sus cuadros. El Cuadro 5.1 (PDF p. 157, impresa 146) presenta +$4.254,0 millones en el **crédito vigente al 30/06**, no una proyección de cierre. El Cuadro 2.6 (PDF p. 66, impresa 55) confirma ese corte y muestra +$917.460,1 millones ejecutados en el semestre. En PDF p. 153 (impresa 142), el resultado financiero previsto para 2027 es positivo en $1.316,4 millones. Por ello se mantiene el semestre y no se presenta la deuda para proveedores como evidencia de déficit 2027. La revisión, el hash del documento y sus páginas están en los datos derivados; la fila alternativa requiere bandera y cifra negativa verificada.

`flags.homePerCapita` y `flags.homeBudget2026` permiten reactivar las tarjetas inferiores sin reconstruirlas; ambos son falsos. `flags.homeClosing2026Projection` es falso y no habilita una cifra no verificada. Los bonos pagan obligaciones devengadas y pendientes: siguen fuera de los agregados del presupuesto.
