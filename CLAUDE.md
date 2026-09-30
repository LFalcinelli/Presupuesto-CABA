# Gasto Público de CABA — instrucciones permanentes para Claude Code

Leer `AGENTS.md`: esas reglas también rigen para Claude Code.

- GitHub `LFalcinelli/Presupuesto-CABA` es el proyecto canónico; `main` publica la web.
- Para cada pedido, empezar por `data/index.json` y abrir sólo el dominio necesario.
- UI en `src/`; datos en `data/`; período y flags en `config/site.json`; hero en `content/home.json`.
- Metodología única: `docs/METODOLOGIA.md`. Decisiones: `docs/DECISIONES.md`.
- Fuentes: `docs/FUENTES.md`. Schemas: `docs/DATASETS.md`.
- No inventar datos ni reinterpretar criterios metodológicos ya aprobados.
- No leer `archive/`, `data/raw/`, `research/`, `.research/` o `.local/` por defecto.
- No iniciar auditorías generales, rediseños o regeneraciones de documentación salvo pedido.
- No publicar material interno, secretos, rutas personales ni identificadores no destinados a la web.
- Instalar: `npm ci`. Construir: `npm run build`. Preview: `npm run dev`.
- Datos: `npm test`. Navegación: `npm run test:smoke` con preview activo.
- Ejecutar la suite completa antes de publicar o tras un cambio estructural.
- Trabajar preferentemente en `feature/...`, abrir Pull Request y revisar antes de merge.
- No editar `dist/` ni depender de una instalación local de Codex.
- Un cambio del hero requiere normalmente sólo configuración, `content/home.json` y el dataset destacado.
- No incorporar todavía Presupuesto 2027 ni alterar chatgpt.site.
