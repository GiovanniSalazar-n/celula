# Roadmap

## Fase 1: Base del proyecto

- Revisar Dockerfile.
- Agregar docker-compose si aporta al flujo local.
- Crear estructura base.
- Crear documentacion inicial.
- Crear README inicial.
- Preparar los primeros tests del motor.

## Fase 2: Motor basico

Estado: iniciada. Ya existen tests verdes para creacion de tablero, equipos, cuadrantes, posicion inicial del jugador, ubicacion de enemigos, direcciones, movimiento fuera del tablero, movimiento a celda vacia y rastros basicos.


- Crear tipos principales.
- Implementar tablero configurable.
- Implementar equipos y cuadrantes.
- Validar posicion inicial del jugador.
- Colocar enemigos en sus cuadrantes.
- Implementar movimiento basico y rastros.

## Fase 3: Combate

- Comer rastro enemigo.
- Bloquear rastro propio.
- Resolver conflictos por misma celda.
- Resolver entrada a celula enemiga.
- Resolver intercambio de posiciones.
- Implementar preferencia ciclica por tick.

## Fase 4: Estados y puntuacion

- Implementar `setup`, `running`, `paused`, `player_lost` y `finished`.
- Implementar victoria y derrota.
- Calcular score.
- Guardar puntuaciones en JSON.

## Fase 5: API REST

- Crear Express server.
- Crear rutas de juego y puntuaciones.
- Crear tests con Supertest.
- Conectar rutas con el motor.

## Fase 6: Frontend

- Crear app React + Vite.
- Mostrar tablero, celulas principales y rastros.
- Permitir seleccion inicial del jugador.
- Agregar controles basicos.

## Fase 7: Integracion

- Conectar frontend con backend.
- Probar flujo completo.
- Actualizar README.
- Asegurar que todos los tests pasen.

