# Lecturas de Inicio 2027

Las cuatro tarjetas son una selección editorial. Los títulos expresan esa lectura; los pop-ups distinguen cifras oficiales, cálculos y supuestos. No se suman las viñetas entre sí ni se presenta todo su importe como un ahorro demostrado.

## Reproducción y trazabilidad

`node scripts/build-home-highlights.mjs` genera `data/home-highlights-2027.json` a partir de los datasets publicados. El archivo conserva los importes exactos, códigos de programas, exclusiones, páginas, referencias y hashes de entrada. El texto editable está en `content/home-highlights.json`. No necesita descargas ni rutas de una computadora.

El gasto corriente se refiere a corriente **sin intereses**, incluidos sueldos, consumo, servicios y transferencias. El récord es el mayor valor real de la serie disponible 1997–2027, con 2026/2027 presupuestados y precios promedio anuales estimados. No se lo confunde con un récord ejecutado. Las variaciones históricas no usan el factor 1,18 de la comparación presupuestaria 2027/2026.

Las cuentas comparan separadamente cierre 2025, primeros semestres 2024–2026 y proyecto 2027. Se informa el superávit semestral 2026 y el pequeño superávit financiero proyectado 2027. Los bonos a proveedores y el préstamo Belgrano Sur son proyectos complementarios separados de los agregados fiscales.

## Selección revisada v13 (propuesta, sin publicar en producción)

Publicidad y comunicación de gobierno: $233.015 millones; los medios públicos se identifican por separado en el desglose. Eventos: $44.004 millones, excluyendo Turismo y seguridad de eventos. PASO: ≈ $28.765 millones, supuesto del 35% del presupuesto electoral neto de publicidad ya contada y condicionado a que se realicen. Total viñeta 3: $305.784 millones, 1,8% de los impuestos propios previstos.

Viñeta 4: ≈ $1,76 billones en programas centrales/comunes, vivienda y ambiente. Se excluyen Salud 401-1 (insumos y servicios sanitarios) y Seguridad 1050-8 (resguardo operativo), y dejan de agregarse unidades completas que también contienen otros programas. La tabla y el criterio propuesto están en [REVISION_V13_ESTRUCTURA.md](REVISION_V13_ESTRUCTURA.md) y requieren aprobación antes de fusionar. Se usa «áreas de gobierno» porque también incluye Jefaturas, Procuración y Tribunal. No se infiere duplicación o ahorro del nombre de un programa, del porcentaje de servicios, ni de esta suma.

El capital usa el mismo escenario de 18% frente al ampliado que Resumen: −9,1%. El récord corriente usa la historia anual estimada y explicita su sensibilidad, el máximo ejecutado 2023 y los traspasos. Las viñetas 3 y 4 no se suman entre sí. Los pesos originales de todos los programas permanecen intactos.

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
