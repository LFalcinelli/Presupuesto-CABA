# Logo oficial

`public/assets/lla-caba-oficial.png` es el original aportado para este cambio. Conserva sus bytes, metadatos, colores, transparencia, proporción y área transparente: PNG RGBA, 3065 × 1693 px, SHA256 `e5b83242a5eeab2223751ef5cca7bb8051b0ab886bd37f06625c3d7c382c9895`.

Se muestra a 64 px de alto en escritorio y 48 px en móvil, con ancho automático y más de dos píxeles de origen por píxel de pantalla. La versión blanca original sirve para ambos temas, porque el encabezado conserva su fondo institucional violeta. No se generó una variante de color.

El logo completo también se usa en el favicon, apple-touch-icon y la imagen de redes, sobre violeta. No se extrae, recorta ni redibuja el águila. Los SVG derivados encuadran el PNG original con `preserveAspectRatio="xMidYMid meet"`; no se presentan como una versión vectorizada del logo. La composición para redes se genera en 1200 × 630, el icono Apple en 180 × 180 y los favicons PNG en 32/64 px.

Reproducción: `node scripts/build-brand-assets.cjs`, con Playwright y su navegador instalados. El script comprueba el hash del original antes de generar los derivados y el sprite local de Lucide. `content/branding.json` documenta el original; los enlaces a las nuevas variantes evitan reutilizar el favicon o la imagen de redes anteriores en caché.
