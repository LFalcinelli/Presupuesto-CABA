# Incorporar un área sin programar otra pantalla

El directorio usa las 22 jurisdicciones de `area-reports.json`. Cada ficha reutiliza la misma interfaz; el detalle opcional se enlaza por `detailFile` y se registra en `data/index.json`.

Requisitos de preparación: Python 3 y `pdfplumber`. El visitante, el build estático y GitHub Actions no necesitan Python ni acceso a los PDF.

```sh
python scripts/import-government-areas.py --code 31 \
  --pdf-2026 /ruta/externa/proyecto-jurisdiccional-2026.pdf \
  --pdf-2027 /ruta/externa/proyecto-jurisdiccional-2027.pdf
npm test
npm run build
npm run test:smoke
```

El proceso extrae las planillas por unidad y programa, las fichas financieras, objetivos, metas, financiamiento y cargos disponibles. Valida jerarquías, totales y los ocho incisos contra Planilla 4 antes de incorporar el detalle. Una planilla ambigua detiene la importación: no se rellena por diferencia. Los documentos originales quedan fuera del repositorio.

Las correspondencias se revisan en `data/budget/2027/area-reviews/<código>.json`. Cada `match` tiene `target` (jurisdicción-subjurisdicción-entidad-unidad-programa 2027), `sources` (uno o varios antecedentes 2026), `status`, explicación y páginas. La suma de antecedentes no se reutiliza en otro match. La comparación monetaria usa el sancionado/vigente/devengado del snapshot 2026-2, no el importe del PDF del proyecto original.

Sin revisión, las coincidencias y sugerencias textuales son candidatos: quedan pendientes y no generan porcentajes ni textos acusatorios. `changes` y `readings` permiten incorporar explicaciones documentadas sin cambiar JavaScript. Se preservan las descripciones de ambos años para verificar las decisiones.

El piloto 31 incluye dos encabezados de inciso omitidos en la fuente: el importador suma únicamente principales identificados del inciso correspondiente y exige conciliación exacta con Planilla 4. Cualquier otro encabezado faltante o apertura no reconocida debe revisarse antes de ampliar esas reglas.

Si se reconstruye primero el agregado con `build-area-reports-2027.py`, ejecutar después el importador para cada jurisdicción detallada. Esa reconstrucción base no conserva los enriquecimientos jurisdiccionales por sí sola. No modificar los factores de las series históricas.

Metodología y límites: [METODOLOGIA.md](METODOLOGIA.md). Esquema: [DATASETS.md](DATASETS.md). No publicar automáticamente al importar: revisar la rama y entregar por PR.
