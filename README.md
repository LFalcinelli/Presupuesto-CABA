# Gasto Público de CABA

Esta web permite recorrer el presupuesto, los gastos, los ingresos, la estructura del Gobierno y los sueldos de funcionarios. Conserva el diseño y la información de la versión publicada el 22 de septiembre de 2026.

**Repositorio canónico:** https://github.com/LFalcinelli/Presupuesto-CABA

**Web de GitHub Pages:** https://lfalcinelli.github.io/Presupuesto-CABA/

La publicación anterior sigue disponible en https://lla-caba-gasto-publico.lucianofalcinelli.chatgpt.site/. Esta migración no la reemplaza ni la elimina.

## Qué contiene cada carpeta

| Carpeta | Para qué sirve |
| --- | --- |
| `src/` | Código de la interfaz y estilos. |
| `config/site.json` | Año destacado, períodos, etiquetas y secciones disponibles. |
| `content/home.json` | Título, bajadas y textos principales de la portada. |
| `data/` | Datos separados por tema; empezar por `data/index.json`. |
| `public/` | Imágenes y las descargas oficiales que ofrece el sitio. |
| `scripts/` | Construcción, preview e importación de datasets revisados. |
| `tests/` | Comprobaciones de datos, navegación y migración. |
| `docs/` | Criterios, fuentes, decisiones y pendientes; no se incluyen en la web. |

## Cómo se hacen y publican los cambios

`main` es la versión de producción. Para trabajar sin pisarse, Codex o Claude crean una rama de trabajo, proponen los cambios mediante un **Pull Request** y los revisan. Al incorporar ese cambio a `main`, GitHub construye el sitio, lo prueba y publica sólo la carpeta generada `dist/`.

En la pestaña **Actions** del repositorio se ve cada publicación. Una marca verde indica que terminó; una roja permite abrir el paso que falló. Los archivos de trabajo, los tests y la documentación del repositorio no forman parte del sitio desplegado.

GitHub Pages debe tener seleccionada la opción **GitHub Actions** en **Settings → Pages**. El procedimiento y el estado de la migración se registran en [docs/GITHUB_MIGRATION.md](docs/GITHUB_MIGRATION.md).

## Para pedirle un cambio a Codex o Claude

- “Modificar únicamente el título y la bajada del hero. Leer `content/home.json` y no auditar otras áreas.”
- “Actualizar únicamente sueldos. Leer `data/index.json`, localizar el dataset de salarios y revisar su fuente.”
- “Cuando estén verificados los datos de 2027, preparar sólo la portada. Leer `config/site.json`, `content/home.json` y `data/budget/2027/current.json`. No reemplazar 2026.”

Ambos agentes usan la misma metodología y las mismas instrucciones permanentes. `AGENTS.md` está orientado a Codex y `CLAUDE.md` a Claude Code.

## Ejecutar en cualquier computadora

Se necesita Node 22 o superior. Desde la carpeta del repositorio:

```sh
npm ci
npm run build
npm run dev
```

La terminal muestra la dirección de la vista previa. Funciona bajo `/Presupuesto-CABA/`, igual que GitHub Pages. Para comprobar la navegación con el navegador de pruebas:

```sh
npx playwright install chromium
npm test
npm run test:smoke
```

Los datos actuales ya están estructurados; construir el sitio no requiere descargar ni transformar los documentos originales. Los cambios de datos deben conservar sus metadatos y pasar las comprobaciones del dominio afectado. La metodología está en [docs/METODOLOGIA.md](docs/METODOLOGIA.md).
