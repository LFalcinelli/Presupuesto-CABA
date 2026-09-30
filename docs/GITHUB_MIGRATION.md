# Migración a GitHub — 30/09/2026

- Repositorio canónico: https://github.com/LFalcinelli/Presupuesto-CABA
- Pages: https://lfalcinelli.github.io/Presupuesto-CABA/
- Origen: publicación 22/09/2026, commit `723750b831d28fec95932a5e137f2c45e158fda3`.
- Snapshot público de recuperación: rama `pre-github-migration-2026-09-30`, commit `2230cf1f89f4647b96d14dfba5cea5aa917688c9`. Conserva íntegro el runtime anterior auditado. El checkout original conserva además un tag con ese nombre.
- No se modifica ni elimina chatgpt.site.

## Estructura

- `src/`: HTML/CSS/JS existentes; sin nuevo framework.
- `config/site.json`: períodos, fechas, etiquetas, flags y path del presupuesto destacado.
- `content/home.json`: hero y textos de alto nivel de portada.
- `data/index.json`: catálogo; `data/<dominio>/`: snapshots y descargas.
- `public/`: imágenes y seis fuentes oficiales usadas como descargas.
- `scripts/`: build, preview e importación de datos estructurados revisados.
- `tests/`: comprobaciones de datos y smoke de navegación.
- `docs/`: metodología, producto, schemas, fuentes, decisiones y pendientes.

## Qué se movió

El contenido runtime de `dist/` se distribuyó entre interfaz, datos y assets. Los 72 archivos de datos preexistentes mantienen sus bytes y sus cifras. La configuración se separó del catálogo de datos; presupuesto destacado, población y TC tienen unidades propias.

Se conservaron los módulos y la carga por demanda. Los textos principales del hero y la portada pasan a JSON. No se trasladó cada string de las vistas: eso sería un refactor ajeno a este pedido.

`Site.url` usa la dirección del script y el catálogo para resolver recursos. Funciona en raíz y en `/Presupuesto-CABA/`. Los enlaces dinámicos se normalizan al renderizar. Las rutas hash y recargas profundas siguen llegando a `index.html`.

## Trabajo y publicación

1. Codex lee `AGENTS.md`; Claude lee `CLAUDE.md`. Ambos consultan el mismo catálogo y metodología.
2. Crear una rama `feature/...`, modificar sólo los archivos relevantes y abrir Pull Request.
3. `npm ci`, `npm run build`, tests dirigidos; suite y smoke antes de publicar.
4. Merge a `main`: `.github/workflows/deploy-pages.yml` construye, valida y publica únicamente `dist/`.
5. Consultar Actions para conocer el resultado. Pages está configurado con GitHub Actions.

## Límites

- No se publica investigación, documentos internos, presentaciones, prompts ni credenciales.
- Las seis descargas de fuentes ya públicas se conservan para evitar romper enlaces; no se copian todas las fuentes de trabajo.
- Las transformaciones históricas dependientes de archivos internos no forman parte del build. Los snapshots estructurados son canónicos y portables; una transformación nueva se incorpora al actualizar ese dominio.
- `npm run test:migration` comprueba identidad del snapshot; es una prueba específica de la migración.
- No se cargó Presupuesto 2027. La portada puede elegir un dataset nuevo con `currentBudgetFile`; el resto de las vistas requiere registrar las nuevas bases verificadas y períodos, sin reemplazar 2026.
