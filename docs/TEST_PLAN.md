# Plan de pruebas

## Estrategia

El desarrollo seguira TDD. Primero se escriben pruebas del motor del juego, despues se implementa la logica necesaria para pasarlas. La API y el frontend se prueban cuando existan sus capas correspondientes.

## Motor del juego

Herramienta: Vitest.

Pruebas iniciales de Fase 2:

- Crear tablero 10x10.
- Permitir tablero configurable.
- Crear 4 equipos con una celula principal cada uno.
- Validar que el jugador solo inicia dentro de su cuadrante.
- Validar que enemigos aparecen dentro de sus cuadrantes.

Pruebas posteriores:

- Direcciones validas.
- Movimiento fuera del tablero.
- Rastros al moverse.
- Bloqueo por rastro propio.
- Comer rastro enemigo.
- Combate por misma celda, entrada a celula enemiga e intercambio.
- Rotacion de preferencia por tick.
- Estados, victoria, derrota y scoring.

## Backend

Herramientas: Vitest + Supertest.

Se probaran endpoints de creacion, inicio, tick, estado, pausa, resume, reset y puntuaciones.

## Frontend

Herramientas: Vitest + React Testing Library.

Se probaran render del tablero, seleccion valida, bloqueo de seleccion invalida, visualizacion de celulas/rastros/estado y llamadas de botones a la API.

## Criterio por fase

Una fase se considera lista cuando sus pruebas relevantes pasan y la documentacion queda actualizada con cualquier decision nueva.
