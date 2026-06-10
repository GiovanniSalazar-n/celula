# Arquitectura

## Principios

- La logica principal vive en el backend, no en React.
- El motor del juego debe estar separado en funciones puras de TypeScript.
- React solo muestra estado y llama a la API.
- La primera version maneja una sola simulacion activa en memoria.
- Las puntuaciones se guardan en un archivo JSON.

## Estructura

```txt
backend/
  src/
    game/        Motor puro del juego
    routes/      Rutas Express
    data/        Archivo scores.json
  tests/         Tests unitarios y de API
frontend/
  src/
    components/  UI del tablero y controles
    api/         Cliente REST
    types/       Tipos compartidos del frontend
docs/            Documentacion de producto y desarrollo
```

## Backend

El backend expone la API REST y conserva la simulacion activa en memoria. El modulo `game` contiene tipos, creacion de tablero, validacion de cuadrantes, movimiento, combate, estados y scoring.

## Frontend

El frontend usa React + Vite + TypeScript. Renderiza tablero, celulas principales, rastros, controles y estado de partida. No calcula reglas de movimiento, combate ni victoria.

## Almacenamiento

Las puntuaciones se guardan inicialmente en `backend/src/data/scores.json`. No se usara base de datos en esta version.

## Docker

El contenedor funciona como entorno de desarrollo. `docker-compose.yml` monta el proyecto en `/workspace` y expone puertos de backend y frontend.
