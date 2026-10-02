# Revisión final visual y UX · Proyecto 2027

Fecha: 01/10/2026. Rama: `feature/final-visual-ux-2027`.
Estado: propuesta para revisión humana; no publicar ni fusionar.

## Jerarquía y recorrido

- Un único hero reemplaza introducción editorial y panorama de tres tarjetas.
- Proyecto 2027: $24.094.340.599.263 solicitado, pendiente de aprobación.
- Segundo dato: $7.718.322 por porteño; referencia inferior: presupuesto 2026.
- Importes consumidos de los datasets canónicos; ninguna cifra se replica como constante en la interfaz.
- Orden: hero, cuentas recientes, preguntas del Proyecto 2027, perspectiva, guía y footer.
- Autoría y nota editorial conservadas al pie de la portada.
- Navegación principal de cuatro destinos. Metodología accesible en footer y por dominio.
- Secuencia temporal: Proyecto 2027, Avance 2026, Cierre 2025, Evolución 1997–2027.
- Cierre 2025 muestra sólo Resumen, Gasto ejecutado e Ingresos realizados.

## Componentes y visualizaciones

- Treemap existente conservado: misma geometría, agrupación y detalle de Resto.
- Un componente de puntos conectados sirve para Proyecto 2027, ingresos y comparaciones históricas.
- Vista inicial: variación real porcentual; alternativa: cambio real en pesos.
- En este gráfico, el punto de referencia representa cero cambio; el segundo representa la variación.
- No representa importes absolutos sobre una única escala. Estos se consultan en tooltip y tabla.
- Escala adaptativa con cero visible, todos los extremos incluidos y margen. Sin truncamiento ni logaritmos.
- Proyecto 2027 conserva barras totales y la opción nominal bajo demanda.
- CAIF conserva cascada; provincias conservan mapa; mundo conserva barras desde cero.
- Referencias neutras, proyecto/CABA violeta, saldos positivos verdes y negativos rojos.
- Un solo tooltip compartido para teclado, puntero y toque. Escape lo cierra.
- Tablas extensas se despliegan después del gráfico; se conservan filtros, búsqueda y descargas.

## Serie 1997–2027

- Se conservan exactamente los importes, factores y etapas del dataset 1997–2026.
- 1997 sigue separado por la convención contable histórica; 2025 conserva condición provisoria.
- 2026 mantiene el marcador presupuestario y su factor ya validado, sin nueva proyección.
- 2027* se toma directamente del gasto fiscal solicitado, sin deflactar.
- Diamante y conexión punteada distinguen la referencia nominal futura.
- Advertencia visible: 2027 no es comparable en términos reales con la línea histórica.
- No se calcula crecimiento real 2026→2027 desde esta distancia visual.
- La vista específica 2027 vs 2026 conserva el supuesto de IPC 18,0% y sus limitaciones.
- Hitos con enlaces normativos oficiales: Ley nacional 26.740 y Resolución 298/2016 del GCBA.

## Simplificación y accesibilidad

- Fórmulas, fuentes y cobertura quedan en detalle y en diez secciones metodológicas.
- Se mantiene visible proyecto/ejecución, período, unidad, datos provisorios y excepción nominal 2027.
- Índice metodológico sticky en escritorio y colapsable en móvil.
- Se reemplaza la capa CSS del Proyecto 2027; no se agrega otro archivo ni biblioteca visual.
- Bordes y cajas interiores reducidos; Montserrat, anchos de prosa y visualización conservados.
- Navegación blanca sticky; encabezado violeta se desplaza normalmente.
- Pestañas móviles horizontales, importes completos sin centavos ni desbordes.
- Transiciones de 180 ms, aparición de 260 ms sólo la primera vez por vista.
- `prefers-reduced-motion` desactiva movimiento. No hay contadores, parallax ni scroll intervenido.

## Verificación y revisión humana

- Build estático y pruebas de datos, conciliación, rutas, reload, teclado y descargas.
- Revisión dirigida de 15 vistas en 1440, 1280, 1024 y 390 px.
- Siete capturas locales: home escritorio/móvil, resumen, comparación, historia, provincias y mundo.
- Verificar percepción de jerarquía del hero y navegación móvil.
- Revisar claridad de la escala de cambios y de la excepción nominal 2027*.
- Confirmar densidad y ubicación de información bajo demanda.
- Producción y `main` permanecen intactos; los resultados se entregan mediante PR.
