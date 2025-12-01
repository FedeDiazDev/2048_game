# 2048

Recreación del clásico juego 2048 en Vanilla JS y CSS.

Descripción
- Juego implementado con DOM puro, animaciones CSS y lógica en JavaScript.
- Controles por teclado (flechas) y botón de "Nueva Partida".
- Clases principales: [`Board`](2048/assets/js/board.js) y [`Tile`](2048/assets/js/tile.js).
- Entrada principal del cliente: [`assets/js/index.js`](2048/assets/js/index.js).
- Interfaz y estilos: [`assets/css/style.css`](2048/assets/css/style.css) y [`assets/css/globals.css`](2048/assets/css/globals.css).
- HTML estático: [index.html](2048/index.html).

Cómo ejecutar

- Usar extensión Live Server o cualquier servidor estático (recomendado para módulos ES):
  1. Abrir la carpeta `2048` en VS Code.
  2. Servir `2048/index.html` con Live Server o `npx serve .` desde la carpeta `2048`.
  3. Abrir en el navegador.

- Con Docker (sirve la carpeta estática usando nginx):
  ```sh
  docker compose -f 2048/docker-compose.yml up --build